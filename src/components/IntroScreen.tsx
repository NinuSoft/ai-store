import { useEffect } from "react";

interface IntroScreenProps {
  onComplete: () => void;
}

declare global {
  interface Window {
    __nsReactMounted?: () => void;
    __nsReactReady?: () => void;
  }
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  useEffect(() => {
    const introEl = document.getElementById("ns-intro");

    // Overlay already gone (bundle was slow or seen in session)
    if (!introEl) {
      document.body.classList.remove("ns-loading");
      onComplete();
      return;
    }

    // Watch for the overlay to be removed from the DOM
    const observer = new MutationObserver(() => {
      if (!document.getElementById("ns-intro")) {
        observer.disconnect();
        onComplete();
      }
    });
    observer.observe(document.body, { childList: true, subtree: false });

    // 1. Signal that React JS is mounted
    if (typeof window.__nsReactMounted === "function") {
      window.__nsReactMounted();
    }

    // 2. Preload critical above-the-fold homepage images (the Hero dashboard illustration)
    const imagesToLoad = ["/hero-dashboard.png"];
    let loadedCount = 0;
    let signalled = false;

    const signalReady = () => {
      if (signalled) return;
      signalled = true;
      if (typeof window.__nsReactReady === "function") {
        window.__nsReactReady();
      }
    };

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === imagesToLoad.length) {
        signalReady();
      }
    };

    // Safety fallback: if images take too long to load on slow networks, bypass in 6 seconds
    const fallbackTimer = setTimeout(signalReady, 6000);

    imagesToLoad.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded;
      }
    });

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  return null;
}
export { IntroScreen };
