// Register service worker for PWA
export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    });
  }
}
