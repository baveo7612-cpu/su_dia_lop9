// Pure Zalo AI Audio TTS Engine with Audio Queue & Sentence Chunking

export class TTSEngine {
  constructor() {
    this.audioQueue = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentAudio = null;
    this.onProgressCallback = null;
    this.onEndCallback = null;
  }

  // Tách văn bản bài giảng dài thành các câu ngắn dưới 180-200 ký tự (theo dấu ., !, ?, \n)
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
        // Tách tiếp theo dấu phẩy, chấm phẩy
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

  // Nạp bài giảng dài và khởi tạo hàng đợi âm thanh
  loadQueue(fullText) {
    this.stop();
    this.audioQueue = this.splitIntoSentences(fullText);
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    return this.audioQueue;
  }

  // Bắt đầu phát từ đầu hàng đợi
  startQueue(onProgress, onEnd) {
    if (this.audioQueue.length === 0) return;

    this.stop();
    this.isPlaying = true;
    this.isPaused = false;
    this.onProgressCallback = onProgress;
    this.onEndCallback = onEnd;

    this.playNextInQueue();
  }

  async playNextInQueue() {
    if (!this.isPlaying || this.currentIndex >= this.audioQueue.length) {
      this.stop();
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const currentText = this.audioQueue[this.currentIndex];

    // Cập nhật tiến trình cho UI (highlight câu đang đọc & thanh tiến trình)
    if (this.onProgressCallback) {
      this.onProgressCallback({
        currentIndex: this.currentIndex,
        totalSentences: this.audioQueue.length,
        progressPercent: Math.round(((this.currentIndex + 1) / this.audioQueue.length) * 100),
        currentSentenceText: currentText,
        sentences: this.audioQueue
      });
    }

    // Gọi API Zalo AI lấy Audio URL cho câu hiện tại (100% Zalo AI Voice)
    try {
      const res = await fetch(`/api/zalo-tts?text=${encodeURIComponent(currentText)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.url && this.isPlaying) {
          this.playAudioUrl(data.url);
          return;
        }
      }
    } catch (err) {
      console.warn("Zalo AI TTS fetch error for sentence:", err);
    }

    // Nếu lỗi API, tự động sang câu tiếp theo sau 1.5s (KHÔNG DÙNG GIỌNG ROBOT MÁY)
    if (this.isPlaying && !this.isPaused) {
      setTimeout(() => {
        this.currentIndex++;
        this.playNextInQueue();
      }, 1500);
    }
  }

  playAudioUrl(url) {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {}
      this.currentAudio = null;
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
      console.warn("Audio stream playback error:", e);
      if (this.isPlaying && !this.isPaused) {
        setTimeout(() => {
          this.currentIndex++;
          this.playNextInQueue();
        }, 1500);
      }
    };

    audio.play().catch(err => {
      console.warn("Audio play blocked or failed:", err);
      if (this.isPlaying && !this.isPaused) {
        setTimeout(() => {
          this.currentIndex++;
          this.playNextInQueue();
        }, 1500);
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
