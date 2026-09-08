// High Reliability Vietnamese Audio TTS Engine
// Primary: Zalo AI TTS via /api/zalo-tts (with Google Audio fallback)
// Tertiary Fallback: Web Speech API (window.speechSynthesis with lang: 'vi-VN')

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
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const update = () => {
        try {
          this.voices = window.speechSynthesis.getVoices() || [];
        } catch {}
      };
      update();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = update;
      }
    }
  }

  getVietnameseVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const available = (window.speechSynthesis.getVoices() || []).concat(this.voices);
    return available.find(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (
        lang.includes('vi') ||
        name.includes('hoaimy') ||
        name.includes('linh') ||
        name.includes('vietnam') ||
        name.includes('vietnamese')
      );
    });
  }

  cleanText(text) {
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
      .map(s => this.cleanText(s))
      .filter(s => s.length > 0);

    const result = [];

    for (let sentence of rawSentences) {
      if (sentence.length <= 130) {
        result.push(sentence);
      } else {
        const parts = sentence.split(/(?<=[,;])\s+/).filter(p => p.trim().length > 0);
        let current = '';
        for (let part of parts) {
          const cleanPart = this.cleanText(part);
          if ((current + ' ' + cleanPart).trim().length <= 130) {
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

  async fetchAudioUrl(sentence) {
    // 1. Check Audio Cache
    if (audioCache[sentence]) {
      return audioCache[sentence];
    }

    // 2. Fetch /api/zalo-tts?text=... (Supports GET & POST)
    try {
      const res = await fetch(`/api/zalo-tts?text=${encodeURIComponent(sentence)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data?.url) {
          audioCache[sentence] = data.data.url;
          return data.data.url;
        }
      }
    } catch (e) {
      console.warn("GET /api/zalo-tts failed, trying POST...", e);
    }

    // Try POST as secondary
    try {
      const res = await fetch("/api/zalo-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentence })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.url) {
          audioCache[sentence] = data.data.url;
          return data.data.url;
        }
      }
    } catch (e) {
      console.warn("POST /api/zalo-tts failed:", e);
    }

    // Direct Google TTS fallback stream URL if backend endpoint fails
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(sentence)}`;
    audioCache[sentence] = googleUrl;
    return googleUrl;
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
        statusMessage: "Đang tải giọng cô giáo..."
      });
    }

    try {
      const audioUrl = await this.fetchAudioUrl(currentText);

      if (!this.isPlaying || this.isPaused) return;

      this.playAudioUrl(audioUrl, currentText);
    } catch (err) {
      console.warn("Audio queue fetch exception, attempting WebSpeech fallback:", err);
      this.speakWebSpeech(currentText);
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
      console.warn("Audio MP3 playback error, attempting WebSpeech fallback:", e);
      this.speakWebSpeech(currentText);
    };

    audio.play().catch(err => {
      console.warn("Audio play blocked or error, attempting WebSpeech fallback:", err);
      this.speakWebSpeech(currentText);
    });
  }

  speakWebSpeech(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        setTimeout(() => this.playNextInQueue(), 1500);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const viVoice = this.getVietnameseVoice();
      if (viVoice) utterance.voice = viVoice;

      let handled = false;
      utterance.onend = () => {
        if (!handled) {
          handled = true;
          if (this.isPlaying && !this.isPaused) {
            this.currentIndex++;
            this.playNextInQueue();
          }
        }
      };

      utterance.onerror = () => {
        if (!handled) {
          handled = true;
          if (this.isPlaying && !this.isPaused) {
            this.currentIndex++;
            setTimeout(() => this.playNextInQueue(), 1500);
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        setTimeout(() => this.playNextInQueue(), 1500);
      }
    }
  }

  pause() {
    this.isPaused = true;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
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
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
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

    if (typeof window !== 'undefined') {
      if (window.currentAudioPlayer) {
        try {
          window.currentAudioPlayer.pause();
        } catch {}
        window.currentAudioPlayer = null;
      }
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    }
  }
}

export const ttsEngine = new TTSEngine();
