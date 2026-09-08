// Pure Zalo AI Text-To-Speech Engine via POST /api/zalo-tts Endpoint
// ABSOLUTELY ZERO window.speechSynthesis, WebSpeech API, or ResponsiveVoice

const audioCache = {};

export class TTSEngine {
  constructor() {
    this.audioQueue = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    this.currentAudio = null;
    this.onProgressCallback = null;
    this.onEndCallback = null;
    this.onErrorCallback = null;
  }

  // Làm sạch văn bản: Loại bỏ ký tự đặc biệt, markdown để tránh Zalo API bị treo / lỗi
  cleanTextForZalo(text) {
    if (!text) return '';
    return text
      .replace(/[*#_~`@$%^&()[\]{}|\\/<>+=]/g, ' ')
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Tách bài giảng dài thành các câu ngắn dưới 110 ký tự
  splitIntoSentences(text) {
    if (!text) return [];

    const cleanFull = text.replace(/[\r\n]+/g, '. ');
    const rawSentences = cleanFull
      .split(/(?<=[.!?])\s+/)
      .map(s => this.cleanTextForZalo(s))
      .filter(s => s.length > 0);

    const result = [];

    for (let sentence of rawSentences) {
      if (sentence.length <= 110) {
        result.push(sentence);
      } else {
        const parts = sentence.split(/(?<=[,;])\s+/).filter(p => p.trim().length > 0);
        let current = '';
        for (let part of parts) {
          const cleanPart = this.cleanTextForZalo(part);
          if ((current + ' ' + cleanPart).trim().length <= 110) {
            current = (current + ' ' + cleanPart).trim();
          } else {
            if (current) result.push(current);
            current = cleanPart;
          }
        }
        if (current) result.push(current);
      }
    }

    return result;
  }

  loadQueue(fullText) {
    this.stop();
    this.audioQueue = this.splitIntoSentences(fullText);
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    return this.audioQueue;
  }

  startQueue(onProgress, onEnd, onError) {
    if (this.audioQueue.length === 0) return;

    this.stop();
    this.isPlaying = true;
    this.isPaused = false;
    this.isLoading = false;
    this.onProgressCallback = onProgress;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;

    this.playNextInQueue();
  }

  async playNextInQueue() {
    if (!this.isPlaying || this.currentIndex >= this.audioQueue.length) {
      this.stop();
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const currentText = this.audioQueue[this.currentIndex];

    // Cập nhật trạng thái cho UI
    this.isLoading = true;
    if (this.onProgressCallback) {
      this.onProgressCallback({
        currentIndex: this.currentIndex,
        totalSentences: this.audioQueue.length,
        progressPercent: Math.round(((this.currentIndex + 1) / this.audioQueue.length) * 100),
        currentSentenceText: currentText,
        sentences: this.audioQueue,
        isLoading: true,
        statusMessage: "Đang tải giọng cô giáo Zalo AI..."
      });
    }

    // 1. Kiểm tra Cache âm thanh trước
    if (audioCache[currentText]) {
      this.isLoading = false;
      if (this.isPlaying && !this.isPaused) {
        this.playAudioUrl(audioCache[currentText], currentText);
      }
      return;
    }

    // 2. Gửi request POST đến /api/zalo-tts Serverless Function
    try {
      const res = await fetch("/api/zalo-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText })
      });

      const data = await res.json();

      if (data.error_code === 0 && data.data?.url) {
        audioCache[currentText] = data.data.url;
        this.isLoading = false;
        if (this.isPlaying && !this.isPaused) {
          this.playAudioUrl(data.data.url, currentText);
        }
      } else {
        console.error("Zalo Error:", data);
        this.stop();
        if (this.onErrorCallback) this.onErrorCallback(data);
      }
    } catch (err) {
      console.error("Zalo Network Error:", err);
      this.stop();
      if (this.onErrorCallback) this.onErrorCallback(err.message);
    }
  }

  playAudioUrl(url, currentText) {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {}
      this.currentAudio = null;
    }

    this.isLoading = false;
    if (this.onProgressCallback) {
      this.onProgressCallback({
        currentIndex: this.currentIndex,
        totalSentences: this.audioQueue.length,
        progressPercent: Math.round(((this.currentIndex + 1) / this.audioQueue.length) * 100),
        currentSentenceText: currentText,
        sentences: this.audioQueue,
        isLoading: false,
        statusMessage: "Đang giảng bài..."
      });
    }

    const audio = new Audio(url);
    this.currentAudio = audio;
    if (typeof window !== 'undefined') {
      window.currentAudioPlayer = audio;
    }

    audio.onended = () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        this.playNextInQueue();
      }
    };

    audio.onerror = (e) => {
      console.error("Zalo Audio Stream Playback Error:", e);
      this.stop();
    };

    audio.play().catch(err => {
      console.error("Phát âm thanh bị chặn bởi Autoplay Policy:", err);
      this.stop();
    });
  }

  pause() {
    this.isPaused = true;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {}
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.currentAudio && this.currentAudio.paused) {
        this.currentAudio.play().catch(() => {
          this.playNextInQueue();
        });
      } else {
        this.playNextInQueue();
      }
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    this.currentIndex = 0;
    this.audioQueue = [];

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && window.currentAudioPlayer) {
      try {
        window.currentAudioPlayer.pause();
      } catch {}
      window.currentAudioPlayer = null;
    }
  }
}

export const ttsEngine = new TTSEngine();
