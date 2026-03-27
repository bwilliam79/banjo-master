/**
 * Singleton AudioContext manager.
 *
 * Provides helpers to create / resume an AudioContext, acquire a microphone
 * stream, and build an AnalyserNode suitable for pitch detection.
 */

let audioContext: AudioContext | null = null;
let microphoneStream: MediaStream | null = null;

/**
 * Return (or lazily create) a singleton AudioContext.
 * Automatically resumes if the context is in the "suspended" state
 * (which happens before a user gesture in most browsers).
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Request microphone access and return the MediaStream.
 *
 * The stream is cached so repeated calls reuse the same mic permission grant.
 * If the user denies permission an error is thrown with a human-readable
 * message.
 */
export async function getMicrophoneStream(): Promise<MediaStream> {
  if (microphoneStream && microphoneStream.active) {
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

/**
 * Create an AnalyserNode connected to the microphone via the singleton
 * AudioContext.
 *
 * The returned analyser has an fftSize of 4096 which gives good frequency
 * resolution for banjo pitch detection down to ~80 Hz.
 */
export async function createAnalyser(): Promise<AnalyserNode> {
  const ctx = getAudioContext();
  const stream = await getMicrophoneStream();

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0.8;

  source.connect(analyser);
  // Do NOT connect analyser to destination — we only want to read data,
  // not play the microphone audio back through speakers.

  return analyser;
}

/**
 * Stop all microphone tracks and close the AudioContext.
 * Safe to call multiple times.
 */
export function cleanupAudio(): void {
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((t) => t.stop());
    microphoneStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
