/**
 * Camera access manager for banjo hand position feedback.
 * Handles permission requests, stream lifecycle, and camera capabilities.
 */

export type FacingMode = 'user' | 'environment';

export interface CameraInfo {
  deviceId: string;
  label: string;
  facingMode?: FacingMode;
}

/**
 * Detects whether the current device is likely mobile/tablet.
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Start the camera and attach it to a video element.
 *
 * @param videoElement - The HTMLVideoElement to display the feed in.
 * @param facingMode  - 'user' (front) or 'environment' (rear).
 *                      Defaults to 'environment' on mobile, 'user' on desktop.
 * @returns The active MediaStream.
 */
export async function startCamera(
  videoElement: HTMLVideoElement,
  facingMode?: FacingMode
): Promise<MediaStream> {
  const resolvedFacing = facingMode ?? (isMobileDevice() ? 'environment' : 'user');

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: resolvedFacing },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    await videoElement.play();
    return stream;
  } catch (error) {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error(
            'Camera permission was denied. Please allow camera access in your browser settings and try again.'
          );
        case 'NotFoundError':
          throw new Error(
            'No camera was found on this device. Please connect a camera and try again.'
          );
        case 'NotReadableError':
          throw new Error(
            'The camera is already in use by another application. Please close it and try again.'
          );
        case 'OverconstrainedError':
          // Retry without facing mode constraint
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            videoElement.srcObject = fallbackStream;
            await videoElement.play();
            return fallbackStream;
          } catch {
            throw new Error(
              'Could not access the camera with the requested settings.'
            );
          }
        default:
          throw new Error(`Camera error: ${error.message}`);
      }
    }
    throw new Error('An unexpected error occurred while accessing the camera.');
  }
}

/**
 * Stop all tracks on a MediaStream and release the camera.
 */
export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

/**
 * Query available camera devices and return basic info about each.
 */
export async function getCameraCapabilities(): Promise<CameraInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'videoinput')
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || 'Camera',
      }));
  } catch {
    return [];
  }
}
