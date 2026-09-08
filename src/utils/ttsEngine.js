// Direct Client-side Zalo AI Text-To-Speech Engine with Sentence Chunking & Caching
// ABSOLUTELY NO WebSpeech API / Robot Voice Fallback

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

  // Tách văn bản bài giảng dài thành các câu ngắn dưới 180 ký tự
  splitIntoSentences(text) {
    if (!text) return [];

    const rawSentences = text
      .split(/(?<=[.!?\n])\s+/)
      .map(s => s.replace(/[\n\r]+/g, ' ').trim())
      .filter(s => s.length > 0);

    const result = [];

    for (let sentence of rawSentences) {
      if (sentence.length <= 180) {
        result.push(sentence);
      } else {
        const parts = sentence.split(/(?<=[,;])\s+/).filter(p => p.trim().length > 0);
        let current = '';
        for (let part of parts) {
          if ((current + ' ' + part).trim().length <= 180) {
            current = (current + ' ' + part).trim();
          } else {
            if (current) result.push(current);
            current = part.trim();
          }
        }
        if (current) result.push(current);
      }
    }

    return result;
  }

  // Nạp bài giảng và chuẩn bị hàng đợi
  loadQueue(fullText) {
    this.stop();
    this.audioQueue = this.splitIntoSentences(fullText);
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    return this.audioQueue;
  }

  // Bắt đầu phát từ đầu hàng đợi Zalo AI
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

    // Cập nhật trạng thái "Đang tải giọng cô giáo..." cho UI
    this.isLoading = true;
    if (this.onProgressCallback) {
      this.onProgressCallback({
        currentIndex: this.currentIndex,
        totalSentences: this.audioQueue.length,
        progressPercent: Math.round(((this.currentIndex + 1) / this.audioQueue.length) * 100),
        currentSentenceText: currentText,
        sentences: this.audioQueue,
        isLoading: true,
        statusMessage: "Đang tải giọng cô giáo..."
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

    // 2. Gọi trực tiếp API Zalo AI từ Client (KHÔNG qua proxy)
    try {
      const response = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
        method: "POST",
        headers: {
          "apikey": "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          input: currentText,
          speaker_id: "1", // Nữ Bắc chuẩn sư phạm
          speed: "0.95",
          encode_type: "0"
        })
      });

      const data = await response.json();

      if (data.error_code === 0 && data.data?.url) {
        // Lưu vào cache
        audioCache[currentText] = data.data.url;
        this.isLoading = false;
        if (this.isPlaying && !this.isPaused) {
          this.playAudioUrl(data.data.url, currentText);
        }
      } else {
        const errorMsg = `Lỗi Zalo TTS (${data.error_code}): ${data.message || 'Không thể tạo âm thanh Zalo AI'}`;
        console.error(errorMsg, data);
        alert(errorMsg);
        this.stop();
        if (this.onErrorCallback) this.onErrorCallback(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Lỗi kết nối Zalo AI API: " + err.message;
      console.error(errorMsg, err);
      alert(errorMsg);
      this.stop();
      if (this.onErrorCallback) this.onErrorCallback(errorMsg);
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
      console.error("Lỗi phát audio MP3 từ Zalo AI:", e);
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        this.playNextInQueue();
      }
    };

    audio.play().catch(err => {
      console.error("Phát âm thanh bị chặn bởi Autoplay Policy:", err);
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        this.playNextInQueue();
      }
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
