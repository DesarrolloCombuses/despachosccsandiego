// PWA bootstrap: registra el service worker y maneja auto-actualizaciones.
// Cuando hay nueva version del SW, recarga la pagina automaticamente para
// que el usuario siempre vea la version vigente.

(function () {
  if (!("serviceWorker" in navigator)) return;

  let reloading = false;
  function triggerReload() {
    if (reloading) return;
    reloading = true;
    if (typeof showToast === "function") {
      try { showToast("Nueva version disponible. Recargando...", "ok"); } catch (_) {}
    }
    setTimeout(() => window.location.reload(), 400);
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    triggerReload();
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event && event.data && event.data.type === "SW_ACTIVATED") {
      console.info("[PWA] Service worker activo:", event.data.version);
    }
  });

  function watchForUpdates(reg) {
    if (!reg) return;
    reg.addEventListener("updatefound", () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          installing.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("sw.js", { scope: "./" });
      watchForUpdates(reg);
      try { await reg.update(); } catch (_) {}
      setInterval(() => { reg.update().catch(() => {}); }, 5 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          reg.update().catch(() => {});
        }
      });
    } catch (err) {
      console.warn("[PWA] No se pudo registrar el service worker:", err);
    }
  });
})();
