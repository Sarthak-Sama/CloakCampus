import { RiMobileDownloadLine } from "@remixicon/react";
import React, { useState, useEffect } from "react";

const InstallPWAButton = ({ deferredPrompt, isInstalled, setIsInstalled }) => {
  const handleInstallClick = () => {
    console.log("clicked");
    console.log(deferredPrompt);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          dispatch(setIsInstalled(true));
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    }
  };

  return !isInstalled && deferredPrompt ? (
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
  ) : null;
};

export default InstallPWAButton;
