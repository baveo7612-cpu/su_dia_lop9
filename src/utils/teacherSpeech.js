import { ttsEngine } from './ttsEngine';

class TeacherSpeechManager {
  loadLecture(fullText) {
    return ttsEngine.loadQueue(fullText);
  }

  startSpeaking(onProgress, onEnd) {
    ttsEngine.startQueue(onProgress, onEnd);
  }

  pause() {
    ttsEngine.pause();
  }

  resume() {
    ttsEngine.resume();
  }

  stop() {
    ttsEngine.stop();
  }
}

export const teacherSpeech = new TeacherSpeechManager();
