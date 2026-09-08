// Pure Zalo AI Text-To-Speech Engine with speakZalo Promise handler
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

  cleanTextForZalo(text) {
    if (!text) return '';
    return text
      .replace(/[*#_~`@$%^&()[\]{}|\\/<>+=]/g, ' ')
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

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

  async speakZalo(sentence) {
    // 1. Check Audio Cache
    if (audioCache[sentence]) {
      return new Promise((resolve) => {
        const audio = new Audio(audioCache[sentence]);
        this.currentAudio = audio;
        if (typeof window !== 'undefined') window.currentAudioPlayer = audio;
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
    }

    // 2. Direct POST request to /api/zalo-tts
    const res = await fetch("/api/zalo-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sentence })
    });

    const data = await res.json();

    if (data.error_code === 0 && data.data?.url) {
      audioCache[sentence] = data.data.url;
      return new Promise((resolve) => {
        const audio = new Audio(data.data.url);
        this.currentAudio = audio;
        if (typeof window !== 'undefined') window.currentAudioPlayer = audio;
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
    } else {
      console.error("Zalo AI Error:", data);
      if (this.onErrorCallback) this.onErrorCallback(data);
    }
  }

  async playNextInQueue() {
    if (!this.isPlaying || this.currentIndex >= this.audioQueue.length) {
      this.stop();
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const currentText = this.audioQueue[this.currentIndex];

    this.isLoading = true;
    if (this.onProgressCallback) {
      this.onProgressCallback({
        currentIndex: this.currentIndex,
        totalSentences: this.audioQueue.length,
        progressPercent: Math.round(((this.currentIndex + 1) / this.audioQueue.length) * 100),
        currentSentenceText: currentText,
        sentences: this.audioQueue,
        isLoading: true,
        statusMessage: "Đang nạp giọng Zalo AI..."
      });
    }

    try {
      this.isLoading = false;
      if (this.onProgressCallback) {
        this.onProgressCallback({
          currentIndex: this.currentIndex,
          totalSentences: this.audioQueue.length,
          progressPercent: Math.round(((this.currentIndex + 1) / this.audioQueue.length) * 100),
          currentSentenceText: currentText,
          sentences: this.audioQueue,
          isLoading: false,
          statusMessage: "Đang giảng..."
        });
      }

      await this.speakZalo(currentText);

      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        this.playNextInQueue();
      }
    } catch (err) {
      console.error("Zalo Queue Exception:", err);
      this.stop();
    }
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
