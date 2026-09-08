import { ttsEngine } from './ttsEngine';

class TeacherSpeechManager {
  constructor() {
    this.sentences = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.onProgressCallback = null;
    this.onEndCallback = null;
  }

  // Split deep lecture into clean sentence units (< 150 chars for clean playback)
  splitIntoSentences(text) {
    if (!text) return [];
    
    const rawSentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const result = [];

    for (let sentence of rawSentences) {
      sentence = sentence.replace(/[\n\r]+/g, ' ').trim();
      if (sentence.length <= 150) {
        result.push(sentence);
      } else {
        const parts = sentence.split(/(?<=[,;])\s+/).filter(p => p.trim().length > 0);
        let current = '';
        for (let part of parts) {
          if ((current + ' ' + part).trim().length <= 150) {
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

  // Prepare lecture queue (does NOT autoplay without user click gesture)
  loadLecture(fullText) {
    this.stop();
    this.sentences = this.splitIntoSentences(fullText);
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isPaused = false;
    return this.sentences;
  }

  // Start speaking lecture on explicit USER CLICK GESTURE
  startSpeaking(onProgress, onEnd) {
    if (this.sentences.length === 0) return;

    this.stop();
    this.isPlaying = true;
    this.isPaused = false;
    this.onProgressCallback = onProgress;
    this.onEndCallback = onEnd;

    this.speakCurrentSentence();
  }

  speakCurrentSentence() {
    if (!this.isPlaying || this.currentIndex >= this.sentences.length) {
      this.stop();
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    const currentText = this.sentences[this.currentIndex];

    // Report progress to UI for active sentence highlighting & progress bar
    if (this.onProgressCallback) {
      this.onProgressCallback({
        currentIndex: this.currentIndex,
        totalSentences: this.sentences.length,
        progressPercent: Math.round(((this.currentIndex + 1) / this.sentences.length) * 100),
        currentSentenceText: currentText,
        sentences: this.sentences
      });
    }

    const handleNextSentence = () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        this.speakCurrentSentence();
      }
    };

    // Use multi-tier TTS Engine
    ttsEngine.speak(
      currentText,
      () => handleNextSentence(),
      () => setTimeout(handleNextSentence, 2000)
    );
  }

  pause() {
    this.isPaused = true;
    ttsEngine.pause();
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      ttsEngine.resume();
    }
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = 0;
    ttsEngine.stop();
  }
}

export const teacherSpeech = new TeacherSpeechManager();
