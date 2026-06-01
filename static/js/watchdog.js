// ============================================================================
//  WATCHDOG.JS - Auto-recarga del navegador para operacion 24/7
// ----------------------------------------------------------------------------
//  Recarga la pagina sola cuando:
//   1. El backend no responde por mas de WATCHDOG_OFFLINE_MS (default 8 min).
//      Detecta "servidor caido", "red caida", "PC perdio internet". Reintenta
//      cada WATCHDOG_PING_MS (60s) hasta que vuelve, y entonces recarga.
//   2. La pagina lleva abierta mas de WATCHDOG_MAX_AGE_HOURS (default 14 h).
//      Recarga en horario nocturno (02:00-06:00) para liberar memoria del
//      navegador sin molestar al usuario en horario de operacion.
//   3. Cada dia a las WATCHDOG_DAILY_RELOAD_HOUR (default 04:00). Esto coincide
//      con el reinicio de servicios programado en instalar_servicios.bat.
//
//  Diagnostico en vivo desde la consola del navegador:
//     window.__watchdog.status()
// ============================================================================
(function() {
  "use strict";

  // ---- Configuracion (ajustable via window.__WATCHDOG_CONFIG antes de cargar) ----
  var cfg = Object.assign({
    PING_URL: "/api/auto_worker_status",  // endpoint barato que siempre debe responder
    PING_MS: 60 * 1000,                    // 1 min entre heartbeats
    OFFLINE_MS: 8 * 60 * 1000,             // 8 min sin respuesta -> recarga al volver
    MAX_AGE_HOURS: 14,                     // recarga preventiva tras 14h abierta
    NIGHT_START_HOUR: 2,                   // ventana nocturna inicio (02:00)
    NIGHT_END_HOUR: 6,                     // ventana nocturna fin (06:00)
    DAILY_RELOAD_HOUR: 4,                  // hora de recarga diaria fija (04:00)
    DAILY_RELOAD_TOLERANCE_MIN: 5,         // ventana de 5 min para no perderla
    REQUEST_TIMEOUT_MS: 10 * 1000,         // timeout por ping
  }, window.__WATCHDOG_CONFIG || {});

  // ---- Estado interno ----
  var STORAGE_KEY = "__watchdog_first_load_ts";
  var DAILY_KEY = "__watchdog_last_daily_reload";
  var firstLoadTs = readFirstLoadTs();
  var lastOkTs = Date.now();
  var pingCount = 0;
  var failCount = 0;
  var failSince = null;
  var lastError = null;
  var pingTimer = null;
  var dailyTimer = null;
  var stopped = false;

  function readFirstLoadTs() {
    try {
      var v = parseInt(sessionStorage.getItem(STORAGE_KEY) || "", 10);
      if (!isNaN(v) && v > 0) return v;
    } catch (e) {}
    var now = Date.now();
    try { sessionStorage.setItem(STORAGE_KEY, String(now)); } catch (e) {}
    return now;
  }

  function isNightWindow() {
    var h = new Date().getHours();
    if (cfg.NIGHT_START_HOUR <= cfg.NIGHT_END_HOUR) {
      return h >= cfg.NIGHT_START_HOUR && h < cfg.NIGHT_END_HOUR;
    }
    // Ventana que cruza medianoche.
    return h >= cfg.NIGHT_START_HOUR || h < cfg.NIGHT_END_HOUR;
  }

  function ageHours() {
    return (Date.now() - firstLoadTs) / (3600 * 1000);
  }

  function reloadPage(reason) {
    if (stopped) return;
    stopped = true;
    console.warn("[watchdog] Recargando pagina. Motivo:", reason);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    // Forzar bypass de cache (igual que Ctrl+F5).
    try { window.location.reload(true); }
    catch (e) { window.location.reload(); }
  }

  function pingOnce() {
    if (stopped) return;
    pingCount++;
    var controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timeoutId = null;
    if (controller) {
      timeoutId = setTimeout(function() { controller.abort(); }, cfg.REQUEST_TIMEOUT_MS);
    }
    fetch(cfg.PING_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      signal: controller ? controller.signal : undefined,
    })
    .then(function(resp) {
      if (timeoutId) clearTimeout(timeoutId);
      if (!resp.ok) {
        return onFail("HTTP " + resp.status);
      }
      onOk();
    })
    .catch(function(err) {
      if (timeoutId) clearTimeout(timeoutId);
      onFail(String((err && err.message) || err || "error"));
    });
  }

  function onOk() {
    if (failCount > 0 && failSince) {
      // Volvio a responder. Si estuvo caido bastante tiempo, recargamos para
      // resincronizar estado de la app con el backend.
      var downMs = Date.now() - failSince;
      console.info("[watchdog] Backend volvio tras " + Math.round(downMs / 1000) + "s.");
      if (downMs >= cfg.OFFLINE_MS) {
        reloadPage("Backend estuvo caido " + Math.round(downMs / 1000) + "s, sincronizando.");
        return;
      }
    }
    failCount = 0;
    failSince = null;
    lastError = null;
    lastOkTs = Date.now();
    maybeIdleReload();
  }

  function onFail(msg) {
    failCount++;
    lastError = msg;
    if (failSince === null) failSince = Date.now();
    var downMs = Date.now() - failSince;
    console.warn("[watchdog] Ping fallo (" + failCount + "x): " + msg + ". Caido hace " + Math.round(downMs / 1000) + "s.");
    // No recargamos aun: esperamos a que vuelva. Si pasa mucho tiempo sin volver,
    // tampoco tiene sentido recargar (la pagina nueva tampoco va a cargar).
    // Cuando vuelva, onOk() decide si recargar.
  }

  function maybeIdleReload() {
    // Recarga preventiva cuando la pagina lleva mucho tiempo abierta. Solo si
    // ya estamos en ventana nocturna para no molestar al operador.
    if (ageHours() < cfg.MAX_AGE_HOURS) return;
    if (!isNightWindow()) return;
    reloadPage("Pagina lleva " + ageHours().toFixed(1) + "h abierta (recarga nocturna preventiva).");
  }

  function tryDailyReload() {
    if (stopped) return;
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    if (h !== cfg.DAILY_RELOAD_HOUR) return;
    if (m > cfg.DAILY_RELOAD_TOLERANCE_MIN) return;
    var todayKey = now.toISOString().slice(0, 10);
    var last;
    try { last = sessionStorage.getItem(DAILY_KEY); } catch (e) {}
    if (last === todayKey) return;  // ya recargamos hoy
    try { sessionStorage.setItem(DAILY_KEY, todayKey); } catch (e) {}
    reloadPage("Recarga diaria programada (" + cfg.DAILY_RELOAD_HOUR.toString().padStart(2, "0") + ":00).");
  }

  // ---- API publica para inspeccion desde la consola ----
  window.__watchdog = {
    status: function() {
      return {
        firstLoad: new Date(firstLoadTs).toISOString(),
        ageHours: +ageHours().toFixed(2),
        lastOk: new Date(lastOkTs).toISOString(),
        pingCount: pingCount,
        failCount: failCount,
        downSeconds: failSince ? Math.round((Date.now() - failSince) / 1000) : 0,
        lastError: lastError,
        config: cfg,
      };
    },
    forceReload: function(reason) { reloadPage(reason || "manual"); },
    stop: function() {
      stopped = true;
      if (pingTimer) clearInterval(pingTimer);
      if (dailyTimer) clearInterval(dailyTimer);
      console.info("[watchdog] detenido.");
    },
  };

  // ---- Arranque ----
  // Primer ping inmediato (asincrono) para no bloquear el load.
  setTimeout(pingOnce, 5000);
  pingTimer = setInterval(pingOnce, cfg.PING_MS);
  // Chequeo de recarga diaria cada minuto (barato).
  dailyTimer = setInterval(tryDailyReload, 60 * 1000);

  console.info(
    "[watchdog] Activo. Ping cada " + (cfg.PING_MS / 1000) + "s. " +
    "Recarga diaria " + String(cfg.DAILY_RELOAD_HOUR).padStart(2, "0") + ":00. " +
    "Max " + cfg.MAX_AGE_HOURS + "h por sesion. " +
    "Inspecciona con: window.__watchdog.status()"
  );
})();
