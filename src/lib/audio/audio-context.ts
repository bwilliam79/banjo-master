/**
 * Singleton AudioContext manager.
 *
 * The AudioContext itself is kept alive for the lifetime of the tab — it's
 * cheap to hold, and closing it on component unmount used to break the
 * Metronome (which uses the same singleton) when the Tuner or an Exercise
 * ran first and then unmounted.
 *
 * Microphone access is refcounted: each caller that needs the mic (via
 * createAnalyser / getMicrophoneStream) takes one reference, and releases
 * it via cleanupAudio. Mic tracks stop when the refcount hits zero. Extra
 * release calls are clamped, so redundant cleanups are harmless.
 */

let audioContext: AudioContext | null = null;
let microphoneStream: MediaStream | null = null;
let micRefCount = 0;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export async function getMicrophoneStream(): Promise<MediaStream> {
  if (microphoneStream && microphoneStream.active) {
    micRefCount++;
    return microphoneStream;
  }

  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    micRefCount++;
    return microphoneStream;
  } catch (err) {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
          throw new Error(
            'Microphone access was denied. Please allow microphone access in your browser settings and try again.'
          );
        case 'NotFoundError':
          throw new Error(
            'No microphone found. Please connect a microphone and try again.'
          );
        default:
          throw new Error(`Microphone error: ${err.message}`);
      }
    }
    throw err;
  }
}

export async function createAnalyser(): Promise<AnalyserNode> {
  const ctx = getAudioContext();
  const stream = await getMicrophoneStream();

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0.8;

  source.connect(analyser);
  return analyser;
}

/**
 * Release one microphone reference. When the refcount reaches zero the
 * mic tracks are stopped. The AudioContext is left alive.
 * Safe to call more times than you acquired — extras are no-ops.
 */
export function cleanupAudio(): void {
  if (micRefCount > 0) {
    micRefCount -= 1;
  }
  if (micRefCount === 0 && microphoneStream) {
    microphoneStream.getTracks().forEach((t) => t.stop());
    microphoneStream = null;
  }
}
