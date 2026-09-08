// Multi-tier Vietnamese Audio TTS Engine
// Tier 1: window.speechSynthesis with native Vietnamese voices (HoaiMy, Linh, Google tiếng Việt, vi-VN)
// Tier 2: Client-side Audio Stream fallback (Google Translate TTS & Youdao TTS)

export class TTSEngine {
  constructor() {
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        try {
          this.voices = window.speechSynthesis.getVoices() || [];
        } catch {
          this.voices = [];
        }
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
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

  speak(text, onEnded, onError) {
    const cleanText = text.replace(/[\n\r]+/g, ' ').trim();
    if (!cleanText) {
      if (onEnded) onEnded();
      return;
    }

    const viVoice = this.getVietnameseVoice();

    // Tier 1: Web Speech API with native Vietnamese Voice
    if (viVoice) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = viVoice;
        utterance.lang = 'vi-VN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        let handled = false;
        utterance.onend = () => {
          if (!handled) {
            handled = true;
            if (onEnded) onEnded();
          }
        };

        utterance.onerror = (e) => {
          console.warn("Tier 1 SpeechSynthesis error, falling back to Tier 2 audio stream:", e);
          if (!handled) {
            handled = true;
            this.speakAudioStream(cleanText, onEnded, onError);
          }
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn("Tier 1 exception, falling back to Tier 2 audio stream:", err);
      }
    }

    // Tier 2: Fallback Audio Stream (Google TTS & Youdao TTS)
    this.speakAudioStream(cleanText, onEnded, onError);
  }

  speakAudioStream(cleanText, onEnded, onError) {
    if (typeof window === 'undefined') return;

    if (window.currentAudioPlayer) {
      try {
        window.currentAudioPlayer.pause();
      } catch {}
      window.currentAudioPlayer = null;
    }

    const primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    const backupUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=vi`;

    let triedBackup = false;
    let finished = false;

    const playAudio = (url) => {
      const audio = new Audio(url);
      window.currentAudioPlayer = audio;

      audio.onended = () => {
        if (!finished) {
          finished = true;
          if (onEnded) onEnded();
        }
      };

      audio.onerror = () => {
        if (!triedBackup) {
          triedBackup = true;
          console.warn("Google TTS audio error, attempting Youdao TTS backup stream...");
          playAudio(backupUrl);
        } else {
          console.warn("All audio TTS streams failed.");
          if (!finished) {
            finished = true;
            if (onError) onError();
            else if (onEnded) setTimeout(onEnded, 2000);
          }
        }
      };

      audio.play().catch((e) => {
        console.warn("Audio play blocked or failed:", e);
        if (!triedBackup) {
          triedBackup = true;
          playAudio(backupUrl);
        } else if (!finished) {
          finished = true;
          if (onEnded) setTimeout(onEnded, 2000);
        }
      });
    };

    playAudio(primaryUrl);
  }

  stop() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      if (window.currentAudioPlayer) {
        try {
          window.currentAudioPlayer.pause();
        } catch {}
        window.currentAudioPlayer = null;
      }
    }
  }

  pause() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.pause();
        } catch {}
      }
      if (window.currentAudioPlayer) {
        try {
          window.currentAudioPlayer.pause();
        } catch {}
      }
    }
  }

  resume() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      } else if (window.currentAudioPlayer) {
        try {
          window.currentAudioPlayer.play().catch(() => {});
        } catch {}
      }
    }
  }
}

export const ttsEngine = new TTSEngine();
