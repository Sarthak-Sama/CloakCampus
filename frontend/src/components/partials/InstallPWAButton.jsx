import { RiMobileDownloadLine } from "@remixicon/react";
import React, { useState, useEffect } from "react";

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt event and store the event
    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("beforeinstallprompt event captured");
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);

    // Listen for the appinstalled event to know when the app is installed
    const appInstalledHandler = () => {
      console.log("PWA was installed");
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", appInstalledHandler);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstallClick = () => {
    console.log("clicked");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Optionally hide the button if the app is installed
  if (isInstalled) {
    return null;
  }

  //   return deferredPrompt ? (
  //     <>
  //       <hr className="border-zinc-600 rounded-full w-[80] mb-6" />
  //       <button
  //         className="flex items-center gap-2 opacity-70 hover:opacity-100 mb-5"
  //         onClick={handleInstallClick}
  //       >
  //         <RiMobileDownloadLine />
  //         Add App to your HomeScreen.
  //       </button>
  //     </>
  //   ) : null;

  return (
    <>
      <hr className="border-zinc-600 rounded-full w-[80] mb-6" />
      <button
        className="flex items-center gap-2 opacity-70 hover:opacity-100 mb-5"
        onClick={handleInstallClick}
      >
        <RiMobileDownloadLine />
        Add App to your HomeScreen.
      </button>
    </>
  );
};

export default InstallPWAButton;
