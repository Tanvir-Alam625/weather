import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon.jsx";

export default function InstallApp() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    window.matchMedia("(max-width: 640px)").matches,
  );
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile =
    isIOS ||
    /android/i.test(navigator.userAgent) ||
    isSmallScreen;

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const mobileViewport = window.matchMedia("(max-width: 640px)");
    const syncInstalled = () => {
      setIsInstalled(displayMode.matches || navigator.standalone === true);
    };
    const syncViewport = () => setIsSmallScreen(mobileViewport.matches);
    const onInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };

    syncInstalled();
    syncViewport();
    displayMode.addEventListener?.("change", syncInstalled);
    mobileViewport.addEventListener?.("change", syncViewport);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      displayMode.removeEventListener?.("change", syncInstalled);
      mobileViewport.removeEventListener?.("change", syncViewport);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (isInstalled || (!installPrompt && !isMobile)) return null;

  const install = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "dismissed") setShowInstructions(true);
    } catch {
      setInstallPrompt(null);
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button className="install-button" type="button" onClick={install}>
        <Icon name="install" size={15} />
        <span>Install app</span>
      </button>
      {showInstructions &&
        createPortal(
          <div
            className="install-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) setShowInstructions(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setShowInstructions(false);
            }}
          >
            <section
              className="install-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="install-title"
            >
              <button
                className="icon-button install-close"
                type="button"
                aria-label="Close install instructions"
                autoFocus
                onClick={() => setShowInstructions(false)}
              >
                <Icon name="close" size={19} />
              </button>
              <span className="install-dialog-icon"><Icon name="install" size={22} /></span>
              <p className="eyebrow">TAKE YOUR FORECAST WITH YOU</p>
              <h2 id="install-title">Add Weather to your home screen</h2>
              <p className="install-help">
                {isIOS
                  ? "Tap the Share button in your browser, then choose “Add to Home Screen”."
                  : "Open your browser menu and choose “Install app” or “Add to Home screen”."}
              </p>
              <p className="install-help install-help--muted">
                Once added, Weather opens like an app and can load your last available forecast offline.
              </p>
              <button className="install-done" type="button" onClick={() => setShowInstructions(false)}>
                Got it
              </button>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
