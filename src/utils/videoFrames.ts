export function getVideoProxyUrl(videoUrl: string): string {
  const proxyBase = process.env.EXPO_PUBLIC_CONTENT_EXTRACT_URL?.trim();
  if (!proxyBase) return videoUrl;
  const sep = proxyBase.includes('?') ? '&' : '?';
  return `${proxyBase}proxy${sep}url=${encodeURIComponent(videoUrl)}`;
}

export function extractVideoFrames(videoUrl: string, count = 3): Promise<string[]> {
  if (typeof document === 'undefined') {
    return Promise.resolve([]);
  }

  // eslint-disable-next-line no-console
  console.log('[extractVideoFrames] Starting extraction for URL:', videoUrl);

  return new Promise((resolve) => {
    let video = document.createElement('video');
    let triedDirectUrl = true;
    let frames: string[] = [];
    let currentTimeIndex = 0;
    let timestamps: number[] = [];
    let timeoutId: NodeJS.Timeout | null = null;
    let fallbackInProgress = false;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.src = '';
      try {
        video.load();
      } catch {
        // ignore
      }
    };

    const fallbackToProxy = () => {
      if (fallbackInProgress) return;
      fallbackInProgress = true;

      if (!triedDirectUrl) {
        // Already tried proxy, resolving with what we have
        // eslint-disable-next-line no-console
        console.warn('[extractVideoFrames] Proxy attempt also failed or timed out. Resolving.');
        cleanup();
        resolve(frames);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('[extractVideoFrames] Direct URL CORS or draw failed. Retrying with proxy URL.');
      triedDirectUrl = false;
      cleanup();

      // Reset state for proxy run
      video = document.createElement('video');
      frames = [];
      currentTimeIndex = 0;
      timestamps = [];
      fallbackInProgress = false;

      const proxyUrl = getVideoProxyUrl(videoUrl);
      setupVideo(proxyUrl);
    };

    const startTimeout = (ms: number) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line no-console
        console.warn(`[extractVideoFrames] Timeout reached (${ms}ms) for ${triedDirectUrl ? 'direct' : 'proxy'} URL.`);
        if (triedDirectUrl) {
          fallbackToProxy();
        } else {
          cleanup();
          resolve(frames);
        }
      }, ms);
    };

    const onSeeked = () => {
      // eslint-disable-next-line no-console
      console.log(`[extractVideoFrames] Seeked to index ${currentTimeIndex} (${video.currentTime}s)`);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
          frames.push(dataUrl);
          // eslint-disable-next-line no-console
          console.log(`[extractVideoFrames] Successfully captured frame ${currentTimeIndex + 1}/${count}`);
        } else {
          // eslint-disable-next-line no-console
          console.warn('[extractVideoFrames] Empty canvas or context unavailable:', canvas.width, canvas.height);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[extractVideoFrames] Failed to capture canvas frame:', e);
        if (triedDirectUrl) {
          fallbackToProxy();
          return;
        }
      }

      currentTimeIndex++;
      if (currentTimeIndex < timestamps.length) {
        // eslint-disable-next-line no-console
        console.log(`[extractVideoFrames] Seeking to next timestamp: ${timestamps[currentTimeIndex]}s`);
        video.currentTime = timestamps[currentTimeIndex];
      } else {
        // eslint-disable-next-line no-console
        console.log('[extractVideoFrames] All frames captured successfully. Resolving.');
        cleanup();
        resolve(frames);
      }
    };

    const onLoadedMetadata = () => {
      const duration = video.duration;
      // eslint-disable-next-line no-console
      console.log('[extractVideoFrames] Loaded metadata. Duration:', duration);
      if (!duration || isNaN(duration)) {
        // eslint-disable-next-line no-console
        console.warn('[extractVideoFrames] Invalid duration, aborting frame extraction.');
        if (triedDirectUrl) {
          fallbackToProxy();
        } else {
          cleanup();
          resolve([]);
        }
        return;
      }

      timestamps = Array.from({ length: count }, (_, i) => {
        return duration * ((i + 1) / (count + 1));
      });
      // eslint-disable-next-line no-console
      console.log('[extractVideoFrames] Calculated timestamps:', timestamps);

      video.addEventListener('seeked', onSeeked);
      // eslint-disable-next-line no-console
      console.log(`[extractVideoFrames] Seeking to first timestamp: ${timestamps[0]}s`);
      video.currentTime = timestamps[0];
    };

    const onError = (err: unknown) => {
      // eslint-disable-next-line no-console
      console.warn('[extractVideoFrames] Video load error:', err);
      if (triedDirectUrl) {
        fallbackToProxy();
      } else {
        cleanup();
        resolve(frames);
      }
    };

    const setupVideo = (url: string) => {
      // eslint-disable-next-line no-console
      console.log(`[extractVideoFrames] Setting up video element with URL: ${url}`);
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = url;

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);

      // Start timeout guard
      startTimeout(triedDirectUrl ? 5000 : 12000);
    };

    // Begin with direct URL
    setupVideo(videoUrl);
  });
}
