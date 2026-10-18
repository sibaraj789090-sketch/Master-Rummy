/**
 * Reliable APK download utility for Master Rummy
 * Designed to ensure the APK downloads smoothly across mobile browsers,
 * desktop browsers, and sandboxed iframes without popup-blocker issues.
 */
export function downloadHostedApk(
  url: string = '/downloads/MasterRummy.apk',
  filename: string = 'MasterRummy.apk',
  onStart?: () => void,
  onComplete?: () => void
) {
  if (onStart) onStart();

  try {
    // Method 1: Standard HTML5 anchor download attribute without target="_blank"
    // Using target="_blank" inside iframes or mobile webviews is often blocked as an unauthorized popup.
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      } catch {
        // no-op
      }
      if (onComplete) onComplete();
    }, 2000);
  } catch (err) {
    console.warn('Primary anchor download triggered fallback:', err);
  }

  // Method 2: Blob URL download fallback (works reliably in sandboxed webviews)
  try {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch APK: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const blobLink = document.createElement('a');
        blobLink.href = blobUrl;
        blobLink.setAttribute('download', filename);
        blobLink.style.display = 'none';
        document.body.appendChild(blobLink);
        blobLink.click();

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          try {
            if (document.body.contains(blobLink)) {
              document.body.removeChild(blobLink);
            }
          } catch {
            // no-op
          }
          if (onComplete) onComplete();
        }, 3000);
      })
      .catch((e) => {
        console.warn('Blob fallback download issue:', e);
      });
  } catch (e) {
    console.warn('Fetch fallback error:', e);
  }
}
