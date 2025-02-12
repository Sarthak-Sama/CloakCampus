import { useDispatch } from "react-redux";
import { setDeferredPrompt, setInstalled } from "../redux/reducers/pwaSlice";
import { useEffect } from "react";

const PWAInstallHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listener for beforeinstallprompt
    const beforeInstallHandler = (e) => {
      console.log("beforeinstallprompt event captured");
      // Prevent default to block the automatic prompt (if you want to trigger it manually later)
      e.preventDefault();
      dispatch(setDeferredPrompt(e));
      console.log("Deferred prompt saved to Redux");
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);

    // Listener for appinstalled
    const appInstalledHandler = () => {
      console.log("PWA was installed");
      dispatch(setInstalled(true));
    };

    window.addEventListener("appinstalled", appInstalledHandler);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, [dispatch]);

  return null;
};

export default PWAInstallHandler;
