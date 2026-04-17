/**
 * Hand detection using MediaPipe Tasks Vision.
 *
 * Detects hand presence and basic positioning relative to the
 * expected fretting (left) and picking (right) zones of the camera frame.
 *
 * Lazy-loads the WASM assets on first use to avoid blocking initial page load.
 *
 * SECURITY / SUPPLY-CHAIN NOTE
 * ----------------------------
 * MediaPipe's FilesetResolver loads WASM files at runtime via dynamic fetch()
 * calls issued from inside the vendor bundle. This bypasses <script integrity>
 * / SRI — there is no tag we can attach a hash to.
 *
 * Mitigations applied here:
 *   1. The WASM CDN URL is PINNED to a specific version matching the installed
 *      npm package (`@mediapipe/tasks-vision` in package.json), NOT `@latest`.
 *      This blocks silent upstream swaps of the WASM bytes.
 *   2. The model asset URL is PINNED to a dated Google Storage path instead of
 *      the `/latest/` alias, for the same reason.
 *
 * Residual risk: if jsdelivr or storage.googleapis.com is compromised, the
 * served bytes could differ from the expected version. To eliminate this,
 * bundle the WASM/model locally (copy to /public at build time) and point
 * FilesetResolver at the same-origin paths. Tracked as a future hardening item.
 *
 * Keep MEDIAPIPE_VERSION in sync with the @mediapipe/tasks-vision dependency
 * version in package.json.
 */

import type {
  HandLandmarker,
  HandLandmarkerResult,
} from '@mediapipe/tasks-vision';

/** Pinned version — MUST match package.json's @mediapipe/tasks-vision. */
const MEDIAPIPE_VERSION = '0.10.22';
const WASM_CDN_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
/** Pinned hand-landmarker model (not /latest/). */
const HAND_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let handLandmarker: HandLandmarker | null = null;
let initPromise: Promise<HandLandmarker> | null = null;

/**
 * Lazy-initialize the MediaPipe HandLandmarker.
 * Returns the cached instance on subsequent calls.
 */
export async function initHandDetector(): Promise<HandLandmarker> {
  if (handLandmarker) return handLandmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await import('@mediapipe/tasks-vision');
    const { HandLandmarker: HL, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN_URL);

    handLandmarker = await HL.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: HAND_LANDMARKER_MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
    });

    return handLandmarker;
  })();

  return initPromise;
}

/**
 * Run hand detection on a video frame.
 */
export async function detectHands(
  video: HTMLVideoElement,
): Promise<HandLandmarkerResult | null> {
  const detector = await initHandDetector();
  if (!detector || video.readyState < 2) return null;

  return detector.detectForVideo(video, performance.now());
}

export interface HandPositionFeedback {
  handsDetected: number;
  leftHandInZone: boolean;
  rightHandInZone: boolean;
  wristAngleOk: boolean;
  overallScore: number;
  message: string;
}

// Zone boundaries as fractions of frame width (0-1).
// Fretting hand should be in the left third, picking hand in the right third.
const FRET_ZONE = { xMin: 0, xMax: 0.4 };
const PICK_ZONE = { xMin: 0.6, xMax: 1.0 };

/**
 * Analyze hand landmarks to produce position feedback.
 *
 * Uses wrist landmark (index 0) for zone detection and
 * landmarks 0-5-17 triangle for wrist angle estimation.
 */
export function analyzeHandPosition(
  result: HandLandmarkerResult,
): HandPositionFeedback {
  const { landmarks, handedness } = result;

  if (!landmarks || landmarks.length === 0) {
    return {
      handsDetected: 0,
      leftHandInZone: false,
      rightHandInZone: false,
      wristAngleOk: true,
      overallScore: 0,
      message: 'No hands detected — position your hands in frame.',
    };
  }

  let leftHandInZone = false;
  let rightHandInZone = false;
  let wristAngleOk = true;

  for (let i = 0; i < landmarks.length; i++) {
    const hand = landmarks[i];
    const label = handedness?.[i]?.[0]?.categoryName;

    // Wrist landmark is index 0. x is normalized 0-1.
    // Note: MediaPipe mirrors the image, so "Left" hand in results
    // is actually the player's left hand (fretting hand).
    const wristX = hand[0].x;

    if (label === 'Left') {
      // Player's left hand → fretting hand → should be in left zone.
      leftHandInZone =
        wristX >= FRET_ZONE.xMin && wristX <= FRET_ZONE.xMax;
    } else {
      // Player's right hand → picking hand → should be in right zone.
      rightHandInZone =
        wristX >= PICK_ZONE.xMin && wristX <= PICK_ZONE.xMax;
    }

    // Basic wrist angle check using landmarks 0 (wrist), 5 (index MCP), 17 (pinky MCP).
    if (hand.length >= 18) {
      const wrist = hand[0];
      const indexMcp = hand[5];
      const pinkyMcp = hand[17];
      // Check if the wrist is severely bent by looking at y-distance.
      const avgFingerY = (indexMcp.y + pinkyMcp.y) / 2;
      const yDiff = Math.abs(wrist.y - avgFingerY);
      // If the wrist-to-knuckle y-distance is very large, wrist is bent too much.
      if (yDiff > 0.25) {
        wristAngleOk = false;
      }
    }
  }

  // Score calculation.
  let score = 0;
  const parts: string[] = [];

  if (landmarks.length >= 2) score += 30;
  else if (landmarks.length === 1) score += 15;

  if (leftHandInZone) {
    score += 25;
  } else if (landmarks.length > 0) {
    parts.push('Move fretting hand to the neck');
  }

  if (rightHandInZone) {
    score += 25;
  } else if (landmarks.length > 0) {
    parts.push('Move picking hand over the strings');
  }

  if (wristAngleOk) {
    score += 20;
  } else {
    parts.push('Straighten your wrist');
  }

  const message =
    parts.length === 0
      ? 'Hand position looks good!'
      : parts.join('. ') + '.';

  return {
    handsDetected: landmarks.length,
    leftHandInZone,
    rightHandInZone,
    wristAngleOk,
    overallScore: Math.min(100, score),
    message,
  };
}

/**
 * Report whether the detector is currently initialized and usable.
 * Callers should check this before each frame to avoid calling into a
 * detector that has been closed by concurrent cleanup.
 */
export function isHandDetectorReady(): boolean {
  return handLandmarker !== null;
}

/**
 * Clean up the hand detector resources.
 */
export function cleanupHandDetector(): void {
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
    initPromise = null;
  }
}
