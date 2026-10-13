const PLANILLA_SUPABASE_URL = "https://cbplebkmxrkaafqdhiyi.supabase.co";
const PLANILLA_SUPABASE_ANON_KEY = "sb_publishable_DZCceNTENY4ViP17-eZrGg_bdMElZ9X";
const SONAR_DISPATCH_URL = "https://cbplebkmxrkaafqdhiyi.supabase.co/functions/v1/sonar-dispatch";
const SONAR_DISPATCH_KEY = PLANILLA_SUPABASE_ANON_KEY;
const SONAR_CANCEL_URL = "https://cbplebkmxrkaafqdhiyi.supabase.co/functions/v1/sonar-cancel";
const SONAR_CANCEL_KEY = PLANILLA_SUPABASE_ANON_KEY;
const PLANILLA_OPTIONAL_REG_ID_COLUMNS = ["reg_id", "regid", "regId"];
const SONAR_ITINERARIES = [
  { id: "4504", grupo: "SANDIEGO", nombre: "ccsandiego-tunel-aeropuerto" }
];
const PLANILLA_TABLE_NAME = "planilla_afiliados_2";
const VEHICULOS_SONAR_TABLE_NAME = "vehiculossonar";
const PLANILLA_AFILIADOS_2_COLUMNS = [
  "id",
  "cruce_key",
  "hora_llegada",
  "tipo_llegada",
  "base",
  "interno",
  "mid",
  "driver_id",
  "itinerario_llegada",
  "hora_despacho",
  "itinerario_despacho",
  "conductor",
  "usuario",
  "pasajeros",
  "observaciones",
  "estado",
  "espera",
  "generado_en",
  "created_at",
  "updated_at"
];
const ALLOW_PUBLIC_SIGNUP = false;
// La version vive en <meta name="app-version"> (la cambia tools/version.py) y se muestra en pantalla.
const APP_VERSION = document.querySelector('meta[name="app-version"]')?.content || "";
document.querySelectorAll("[data-app-version]").forEach(el => {
  el.textContent = APP_VERSION ? `v${APP_VERSION}` : "";
});
if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error("No cargo Supabase JS. Verifica conexion a internet o ruta del script.");
}
const planillaSupabaseClient = window.supabase.createClient(PLANILLA_SUPABASE_URL, PLANILLA_SUPABASE_ANON_KEY);
const authSupabaseClient = planillaSupabaseClient;
const authPanel = document.getElementById("authPanel");
const appWrap = document.getElementById("appWrap");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authStatus = document.getElementById("authStatus");
const authUserLabel = document.getElementById("authUserLabel");
const btnSignIn = document.getElementById("btnSignIn");
const btnSignUp = document.getElementById("btnSignUp");
const btnLogout = document.getElementById("btnLogout");
const btnManualDispatch = document.getElementById("btnManualDispatch");
const appToast = document.getElementById("appToast");
const cancelDispatchModal = document.getElementById("cancelDispatchModal");
const cancelDispatchModalInterno = document.getElementById("cancelDispatchModalInterno");
const cancelDispatchModalBase = document.getElementById("cancelDispatchModalBase");
const cancelDispatchModalMid = document.getElementById("cancelDispatchModalMid");
const cancelDispatchModalRegId = document.getElementById("cancelDispatchModalRegId");
const cancelDispatchModalHora = document.getElementById("cancelDispatchModalHora");
const cancelDispatchModalComments = document.getElementById("cancelDispatchModalComments");
const btnCancelDispatchCancel = document.getElementById("btnCancelDispatchCancel");
const btnCancelDispatchConfirm = document.getElementById("btnCancelDispatchConfirm");
const manualDispatchModal = document.getElementById("manualDispatchModal");
const manualDispatchInterno = document.getElementById("manualDispatchInterno");
const manualDispatchBase = document.getElementById("manualDispatchBase");
const manualDispatchMid = document.getElementById("manualDispatchMid");
const manualDispatchConductorName = document.getElementById("manualDispatchConductorName");
const manualDispatchDriverId = document.getElementById("manualDispatchDriverId");
const manualDispatchItinerarySelect = document.getElementById("manualDispatchItinerarySelect");
const manualDispatchObs = document.getElementById("manualDispatchObs");
const manualDispatchVehicleInfo = document.getElementById("manualDispatchVehicleInfo");
const manualDispatchRepeatWarning = document.getElementById("manualDispatchRepeatWarning");
const manualDispatchDriverInfo = document.getElementById("manualDispatchDriverInfo");
const btnManualDispatchCancel = document.getElementById("btnManualDispatchCancel");
const btnManualDispatchConfirm = document.getElementById("btnManualDispatchConfirm");

let appInitialized = false;
let currentUserId = null;
let currentUserEmail = "";
let currentUserBase = "";
let dragFeedbackTimer = null;
let cancelDispatchModalResolver = null;
let manualDispatchModalResolver = null;
let vehiculosSonarRows = [];
let vehiculosSonarLoading = false;
let vehiculosSonarLoadedOnce = false;
let vehiculosSonarLastLoadedAt = 0;
let manualDispatchVehicleLookupSeq = 0;
let manualDispatchSending = false;
let manualDispatchCurrentVehicle = null;  // fila de vehiculossonar del interno elegido
let manualDispatchSuggestedValue = "";    // conductor puesto automaticamente (no pisa una eleccion manual)
let manualDispatchRepeatSeq = 0;
const REPEAT_DISPATCH_WINDOW_MIN = 60;
const PLANILLA_FRESH_MAX_AGE_MS = 60 * 1000;
const VEHICULOS_SONAR_REFRESH_MAX_AGE_MS = 5 * 60 * 1000;
const DISPATCH_SERVER_SYNC_WAIT_MS = 65000;
let dispatchServerSyncTimer = null;

function isSameLocalDate(a, b){
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function setAuthStatus(msg, type){
  authStatus.textContent = msg;
  authStatus.className = `auth-status ${type}`;
}

function showToast(msg, type = "ok"){
  if (!appToast) return;
  appToast.textContent = msg;
  appToast.className = `toast ${type} show`;
  clearTimeout(dragFeedbackTimer);
  dragFeedbackTimer = setTimeout(() => {
    appToast.className = `toast ${type}`;
  }, 2600);
}

function notifyDispatchServerSyncDelay(){
  showToast("Despacho enviado. La informacion completa puede tardar hasta 1 minuto por sincronizacion del servidor Python.", "ok");
  if (dispatchServerSyncTimer) {
    clearTimeout(dispatchServerSyncTimer);
    dispatchServerSyncTimer = null;
  }
  dispatchServerSyncTimer = setTimeout(async () => {
    dispatchServerSyncTimer = null;
    if (!currentUserId) return;
    await loadPlanillaAfiliadosFromSupabase();
    showToast("Actualizacion aplicada tras la espera de sincronizacion.", "ok");
  }, DISPATCH_SERVER_SYNC_WAIT_MS);
}

function closeCancelDispatchModal(confirmed){
  if (cancelDispatchModal) cancelDispatchModal.classList.add("hidden");
  if (cancelDispatchModalResolver) {
    const resolve = cancelDispatchModalResolver;
    cancelDispatchModalResolver = null;
    resolve({
      confirmed: !!confirmed,
      comments: String(cancelDispatchModalComments?.value || "").trim()
    });
  }
}

function openCancelDispatchModal(payload = {}){
  if (!cancelDispatchModal || !btnCancelDispatchCancel || !btnCancelDispatchConfirm) {
    const text = [
      `Interno: ${payload.interno || "-"}`,
      `Base: ${payload.base || "-"}`,
      `MID: ${payload.mid || "-"}`,
      `regId: ${payload.regId || "-"}`,
      `Hora despacho: ${payload.horaDespacho || "-"}`
    ].join("\n");
    const comments = prompt(`Confirmar cancelacion?\n\n${text}\n\nMotivo de cancelacion:`, "");
    if (comments === null) {
      return Promise.resolve({ confirmed: false, comments: "" });
    }
    return Promise.resolve({
      confirmed: true,
      comments: String(comments || "").trim()
    });
  }
  if (cancelDispatchModalInterno) cancelDispatchModalInterno.textContent = payload.interno || "-";
  if (cancelDispatchModalBase) cancelDispatchModalBase.textContent = payload.base || "-";
  if (cancelDispatchModalMid) cancelDispatchModalMid.textContent = payload.mid || "-";
  if (cancelDispatchModalRegId) cancelDispatchModalRegId.textContent = payload.regId || "-";
  if (cancelDispatchModalHora) cancelDispatchModalHora.textContent = payload.horaDespacho || "-";
  if (cancelDispatchModalComments) cancelDispatchModalComments.value = "";
  cancelDispatchModal.classList.remove("hidden");
  setTimeout(() => cancelDispatchModalComments?.focus(), 10);
  return new Promise(resolve => {
    cancelDispatchModalResolver = resolve;
  });
}

function buildItineraryOptionsHtml(itinerariesInput){
  const itineraries = Array.isArray(itinerariesInput) && itinerariesInput.length
    ? itinerariesInput
    : SONAR_ITINERARIES;
  return `<option value="">Selecciona itinerario...</option>${
    itineraries.map(item => {
      const value = escapeHtml(String(item.id || ""));
      const label = escapeHtml(`${item.grupo} | ${item.nombre} (${item.id})`);
      return `<option value="${value}">${label}</option>`;
    }).join("")
  }`;
}

function readManualDispatchForm(){
  return {
    interno: String(manualDispatchInterno?.value || "").trim(),
    base: String(manualDispatchBase?.value || "").trim(),
    mId: String(manualDispatchMid?.value || "").trim(),
    conductorName: String(manualDispatchConductorName?.value || "").trim(),
    drvId: String(manualDispatchDriverId?.value || "").trim(),
    itinerary: String(manualDispatchItinerarySelect?.value || "").trim(),
    observaciones: String(manualDispatchObs?.value || "").trim()
  };
}

function hideManualDispatchModal(){
  if (manualDispatchModal) manualDispatchModal.classList.add("hidden");
  closeManualDispatchInternoPanel();
  closeManualDispatchConductorPanel();
}

// Confirmar entrega los datos y deja el formulario abierto: se cierra cuando Sonar acepta el despacho,
// y si falla el envio los datos siguen ahi para reintentar. Cancelar lo cierra (no mientras se envia).
function closeManualDispatchModal(confirmed){
  if (!confirmed) {
    if (manualDispatchSending) return;
    hideManualDispatchModal();
  }
  if (manualDispatchModalResolver) {
    const resolve = manualDispatchModalResolver;
    manualDispatchModalResolver = null;
    resolve({ confirmed: !!confirmed, ...readManualDispatchForm() });
  }
}

function waitManualDispatchSubmit(){
  return new Promise(resolve => {
    manualDispatchModalResolver = resolve;
  });
}

function setManualDispatchSending(sending){
  manualDispatchSending = sending;
  manualDispatchModal?.querySelector(".modal-card")?.classList.toggle("is-sending", sending);
  if (btnManualDispatchConfirm) {
    btnManualDispatchConfirm.disabled = sending;
    btnManualDispatchConfirm.textContent = sending ? "Enviando..." : "Enviar despacho";
  }
  if (btnManualDispatchCancel) btnManualDispatchCancel.disabled = sending;
}

// La planilla se usa al despachar para marcar la llegada del vehiculo; la app puede llevar horas abierta.
async function ensureFreshPlanilla(){
  if (planillaLastLoadedAt && (Date.now() - planillaLastLoadedAt) <= PLANILLA_FRESH_MAX_AGE_MS) return;
  await loadPlanillaAfiliadosFromSupabase();
}

function normalizeVehiculoSonarRow(row){
  const source = row || {};
  const interno = String(source.INTERNO ?? source.interno ?? source.Interno ?? "").trim();
  const placa = String(source.Placa ?? source.PLACA ?? source.placa ?? "").trim();
  const mid = String(source.ID ?? source.id ?? source.Id ?? source.mid ?? source.MID ?? "").trim();
  return {
    ...source,
    interno,
    placa,
    mid,
    source: "vehiculossonar"
  };
}

function getManualDispatchDefaultBase(){
  return getBaseCanonical(currentBase || currentUserBase || "");
}

async function loadVehiculosSonarFromSupabase(options = {}){
  if (vehiculosSonarLoading) return;
  if (!currentUserId) return;
  const force = !!options.force;
  const stale = !vehiculosSonarLoadedOnce
    || !vehiculosSonarLastLoadedAt
    || ((Date.now() - vehiculosSonarLastLoadedAt) > VEHICULOS_SONAR_REFRESH_MAX_AGE_MS);
  if (!force && !stale) return;
  vehiculosSonarLoading = true;
  try {
    const { data, error } = await planillaSupabaseClient
      .from(VEHICULOS_SONAR_TABLE_NAME)
      .select("*")
      .limit(5000);
    if (error) throw error;
    vehiculosSonarRows = (Array.isArray(data) ? data : [])
      .map(normalizeVehiculoSonarRow)
      .filter(row => row.interno && row.mid);
    vehiculosSonarLoadedOnce = true;
    vehiculosSonarLastLoadedAt = Date.now();
  } catch (error) {
    console.error(`Error cargando ${VEHICULOS_SONAR_TABLE_NAME}:`, error);
    showToast(`No se pudo cargar ${VEHICULOS_SONAR_TABLE_NAME}. Se usara la planilla cargada si esta disponible.`, "warn");
  } finally {
    vehiculosSonarLoading = false;
  }
}

function mergeVehiculoSonarRows(rowsInput){
  const incoming = (Array.isArray(rowsInput) ? rowsInput : [])
    .map(normalizeVehiculoSonarRow)
    .filter(row => row.interno && row.mid);
  if (!incoming.length) return null;
  const byInterno = new Map((Array.isArray(vehiculosSonarRows) ? vehiculosSonarRows : [])
    .map(row => [String(row?.interno || "").trim(), row]));
  incoming.forEach(row => byInterno.set(String(row.interno), row));
  vehiculosSonarRows = Array.from(byInterno.values());
  vehiculosSonarLoadedOnce = true;
  vehiculosSonarLastLoadedAt = Date.now();
  return incoming[0];
}

/* ===================== HISTORIAL DESPACHOS (despachos_realizados) ===================== */
const HISTORIAL_DESPACHOS_TABLE = "despachos_realizados";
const HISTORIAL_DESPACHOS_LIMIT = 500;
let historialDespachosRows = [];
let historialDespachosLoading = false;
let historialDespachosLastLoadedAt = null;
let historialDespachosItinFilter = "";
const historialCancelingIds = new Set();

function getHistorialDespachosRangeMs(){
  const v = String(historialDespachosRangeFilter?.value || "24h");
  switch (v) {
    case "7d":  return 7  * 24 * 60 * 60 * 1000;
    case "30d": return 30 * 24 * 60 * 60 * 1000;
    case "all": return null;
    case "24h":
    default:    return 24 * 60 * 60 * 1000;
  }
}

function formatHistorialDateTime(value){
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("es-CO", { hour12: false });
  } catch (_) { return String(value); }
}

async function loadDespachosRealizadosFromSupabase(){
  if (historialDespachosLoading) return;
  if (!currentUserId) return;
  historialDespachosLoading = true;
  if (historialDespachosStatus) historialDespachosStatus.textContent = "Consultando Supabase...";
  if (btnRefreshHistorialDespachos) btnRefreshHistorialDespachos.disabled = true;
  try {
    let query = planillaSupabaseClient
      .from(HISTORIAL_DESPACHOS_TABLE)
      .select("id,reg_id,vehicle_id,interno,placa,itinerario_id,itinerario,driver_id,observaciones,pasajeros,estado,cancelled_at,created_by,created_at")
      .order("created_at", { ascending: false })
      .limit(HISTORIAL_DESPACHOS_LIMIT);
    const rangeMs = getHistorialDespachosRangeMs();
    if (rangeMs) {
      const desde = new Date(Date.now() - rangeMs).toISOString();
      query = query.gte("created_at", desde);
    }
    const { data, error } = await query;
    if (error) throw error;
    historialDespachosRows = Array.isArray(data) ? data : [];
    historialDespachosLastLoadedAt = Date.now();
    renderHistorialDespachosTab();
    if (historialDespachosStatus) {
      const stamp = new Date().toLocaleTimeString("es-CO");
      historialDespachosStatus.textContent =
        `Actualizado ${stamp} · ${historialDespachosRows.length} registros`;
    }
  } catch (err) {
    console.error(`[${HISTORIAL_DESPACHOS_TABLE}] consulta fallo:`, err);
    if (historialDespachosStatus) historialDespachosStatus.textContent = `Error: ${err?.message || "fallo"}`;
    showToast(`No se pudo cargar ${HISTORIAL_DESPACHOS_TABLE}: ${err?.message || "fallo"}`, "err");
  } finally {
    historialDespachosLoading = false;
    if (btnRefreshHistorialDespachos) btnRefreshHistorialDespachos.disabled = false;
  }
}

function getHistorialDespachosItinerariosResumen(){
  const estado = String(historialDespachosEstadoFilter?.value || "").trim().toUpperCase();
  const counts = new Map();
  for (const r of (historialDespachosRows || [])) {
    if (estado && String(r?.estado || "").toUpperCase() !== estado) continue;
    const itin = String(r?.itinerario || "").trim() || "Sin itinerario";
    counts.set(itin, (counts.get(itin) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

function renderHistorialDespachosItinChips(){
  if (!historialDespachosItinChips) return;
  const resumen = getHistorialDespachosItinerariosResumen();
  const total = resumen.reduce((acc, r) => acc + r.count, 0);
  const activeFilter = historialDespachosItinFilter;
  const chips = [{ name: "", label: "Todos", count: total }]
    .concat(resumen.map(r => ({ name: r.name, label: r.name, count: r.count })));
  historialDespachosItinChips.innerHTML = chips.map(chip => {
    const isActive = String(chip.name) === String(activeFilter);
    const cls = `chip${isActive ? " active" : ""}`;
    return `<button type="button" class="${cls}" data-itin="${escapeHtml(chip.name)}">
      <span>${escapeHtml(chip.label)}</span>
      <span class="chip-count">${chip.count}</span>
    </button>`;
  }).join("");
}

function getFilteredHistorialDespachosRows(){
  const term = String(historialDespachosSearch?.value || "").trim().toLowerCase();
  const estado = String(historialDespachosEstadoFilter?.value || "").trim().toUpperCase();
  const itin = String(historialDespachosItinFilter || "").trim();
  return (historialDespachosRows || []).filter(row => {
    if (estado && String(row?.estado || "").toUpperCase() !== estado) return false;
    if (itin) {
      const rowItin = String(row?.itinerario || "").trim() || "Sin itinerario";
      if (rowItin !== itin) return false;
    }
    if (!term) return true;
    const haystack = [
      row?.reg_id, row?.interno, row?.placa, row?.vehicle_id, row?.driver_id, row?.itinerario
    ].map(v => String(v || "").toLowerCase()).join(" ");
    return haystack.includes(term);
  });
}

function getHistorialEstadoColor(estado){
  switch (String(estado || "").toUpperCase()) {
    case "ACTIVO":    return "#065f46";
    case "CANCELADO": return "#b91c1c";
    default:          return "#64748b";
  }
}

function isSameLocalDay(iso, refDate){
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === refDate.getFullYear()
    && d.getMonth() === refDate.getMonth()
    && d.getDate() === refDate.getDate();
}

function renderHistorialInsights(){
  if (!historialInsights) return;
  const itinSel = String(historialDespachosItinFilter || "").trim();
  if (!itinSel) {
    historialInsights.hidden = true;
    historialInsights.innerHTML = "";
    return;
  }

  const today = new Date();
  const rowsHoyItin = (historialDespachosRows || []).filter(r => {
    if (String(r?.itinerario || "").trim() !== itinSel) return false;
    return isSameLocalDay(r?.created_at, today);
  });
  const activos = rowsHoyItin.filter(r => String(r?.estado || "").toUpperCase() === "ACTIVO");
  const cancelados = rowsHoyItin.filter(r => String(r?.estado || "").toUpperCase() === "CANCELADO");

  const countByInterno = new Map();
  activos.forEach(r => {
    const k = String(r?.interno || "").trim();
    if (!k) return;
    countByInterno.set(k, (countByInterno.get(k) || 0) + 1);
  });

  const itinLower = itinSel.toLowerCase();
  const enLlegadasItin = (mapaVehiculosRows || []).filter(r =>
    String(r?.itinerario || "").trim().toLowerCase() === itinLower
  );
  const internosEnLlegadas = new Map();
  enLlegadasItin.forEach(r => {
    const k = String(r?.interno || "").trim();
    if (!k) return;
    if (!internosEnLlegadas.has(k)) internosEnLlegadas.set(k, r);
  });

  const sinDespachar = [];
  for (const [interno, row] of internosEnLlegadas.entries()) {
    if (!countByInterno.has(interno)) sinDespachar.push({ interno, row });
  }
  sinDespachar.sort((a, b) => {
    const pa = Number(a.row?.posicion);
    const pb = Number(b.row?.posicion);
    if (Number.isFinite(pa) && Number.isFinite(pb) && pa !== pb) return pa - pb;
    return String(a.interno).localeCompare(String(b.interno));
  });

  const repetidos = [...countByInterno.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));

  // Internos que pertenecen a este itinerario:
  // estan ahora en llegadas_104 con ese itinerario, o han hecho algun despacho historico por ese itinerario.
  const internosDelItinerario = new Set();
  for (const k of internosEnLlegadas.keys()) internosDelItinerario.add(k);
  (historialDespachosRows || []).forEach(r => {
    if (String(r?.itinerario || "").trim() !== itinSel) return;
    const k = String(r?.interno || "").trim();
    if (k) internosDelItinerario.add(k);
  });

  // Pool habilitado en vehiculossonar pero LIMITADO a los del itinerario seleccionado.
  const sonarPool = (Array.isArray(vehiculosSonarRows) ? vehiculosSonarRows : [])
    .map(v => ({
      interno: String(v?.interno || "").trim(),
      placa: String(v?.placa || "").trim(),
      mid: String(v?.mid || "").trim(),
    }))
    .filter(v => v.interno);
  const sonarInternos = new Set(sonarPool.map(v => v.interno));
  const sonarPoolItin = sonarPool.filter(v => internosDelItinerario.has(v.interno));
  const sonarDisponibles = sonarPoolItin.filter(v =>
    !internosEnLlegadas.has(v.interno) && !countByInterno.has(v.interno)
  );
  sonarDisponibles.sort((a, b) => String(a.interno).localeCompare(String(b.interno), undefined, { numeric: true }));
  const SONAR_MAX_VISIBLE = 30;
  const sonarVisibles = sonarDisponibles.slice(0, SONAR_MAX_VISIBLE);
  const sonarOcultos = Math.max(0, sonarDisponibles.length - sonarVisibles.length);

  // Vehiculos despachados hoy en este itinerario que NO estan habilitados en vehiculossonar.
  const despachadosFueraDeSonar = [...countByInterno.keys()].filter(k => sonarInternos.size && !sonarInternos.has(k));

  const totalDespachos = activos.length;
  const vehiculosUnicos = countByInterno.size;
  const vehiculosEnRuta = internosEnLlegadas.size;
  const habilitadosSonarItin = sonarPoolItin.length;

  const sinDespacharHtml = sinDespachar.length
    ? sinDespachar.map(x => {
        const pos = Number.isFinite(Number(x.row?.posicion)) ? `#${x.row.posicion}` : "";
        const listo = (x.row?.listo === true || x.row?.listo === "true") ? " is-listo" : "";
        const baseNum = getBaseNumForInterno(x.interno);
        const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span>` : "";
        return `<span class="insight-chip${listo}" title="Pos ${pos} · MID ${x.row?.vehicle_id || "-"} · Driver ${x.row?.driver_id || "-"}${baseNum ? ` · Base ${baseNum}` : ""}">
          ${baseBadge}<strong>${escapeHtml(x.interno)}</strong>${pos ? ` <small>${pos}</small>` : ""}
        </span>`;
      }).join("")
    : `<span class="muted">Ninguno: todos los vehiculos en ruta ya tienen despacho hoy.</span>`;

  const repetidosHtml = repetidos.length
    ? repetidos.map(([interno, n]) => {
        const baseNum = getBaseNumForInterno(interno);
        const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span>` : "";
        return `<span class="insight-chip is-warn" title="${n} despachos hoy${baseNum ? ` · Base ${baseNum}` : ""}">
          ${baseBadge}<strong>${escapeHtml(interno)}</strong> <small>${n}x</small>
        </span>`;
      }).join("")
    : `<span class="muted">Ningun vehiculo lleva mas de un despacho hoy.</span>`;

  const sonarDisponiblesHtml = sonarPool.length === 0
    ? `<span class="muted">Lista de vehiculossonar no cargada.</span>`
    : (habilitadosSonarItin === 0
        ? `<span class="muted">Aun no hay vehiculos historicos para este itinerario en la lista Sonar.</span>`
        : (sonarVisibles.length
            ? sonarVisibles.map(v => {
                const placa = v.placa ? ` · ${v.placa}` : "";
                const mid = v.mid ? ` · MID ${v.mid}` : "";
                const baseNum = getBaseNumForInterno(v.interno);
                const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span>` : "";
                return `<span class="insight-chip is-pool" title="Habilitado en Sonar${placa}${mid}${baseNum ? ` · Base ${baseNum}` : ""}">
                  ${baseBadge}<strong>${escapeHtml(v.interno)}</strong>${v.placa ? ` <small>${escapeHtml(v.placa)}</small>` : ""}
                </span>`;
              }).join("") + (sonarOcultos ? `<span class="muted" style="align-self:center">+${sonarOcultos} mas</span>` : "")
            : `<span class="muted">Todos los habilitados para este itinerario ya estan en ruta o despachados hoy.</span>`));

  const fueraSonarHtml = despachadosFueraDeSonar.length
    ? despachadosFueraDeSonar.map(interno => {
        const baseNum = getBaseNumForInterno(interno);
        const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span>` : "";
        return `<span class="insight-chip is-warn" title="Despachado hoy pero no habilitado en vehiculossonar${baseNum ? ` · Base ${baseNum}` : ""}">
          ${baseBadge}<strong>${escapeHtml(interno)}</strong> <small>!</small>
        </span>`;
      }).join("")
    : "";

  historialInsights.hidden = false;
  historialInsights.innerHTML = `
    <div class="insights-header">
      <h4>Inteligencia del itinerario</h4>
      <span class="muted">${escapeHtml(itinSel)} · hoy</span>
    </div>
    <div class="insights-kpis">
      <div class="kpi"><div class="kpi-num">${totalDespachos}</div><div class="kpi-lbl">Despachos hoy</div></div>
      <div class="kpi"><div class="kpi-num">${vehiculosUnicos}</div><div class="kpi-lbl">Vehiculos despachados</div></div>
      <div class="kpi"><div class="kpi-num">${vehiculosEnRuta}</div><div class="kpi-lbl">En llegadas_104</div></div>
      <div class="kpi"><div class="kpi-num">${sinDespachar.length}</div><div class="kpi-lbl">Sin despachar</div></div>
      <div class="kpi"><div class="kpi-num">${habilitadosSonarItin}</div><div class="kpi-lbl">Sonar del itin.</div></div>
      <div class="kpi"><div class="kpi-num">${sonarDisponibles.length}</div><div class="kpi-lbl">Pool Sonar libre</div></div>
      <div class="kpi"><div class="kpi-num">${repetidos.length}</div><div class="kpi-lbl">Con repeticion</div></div>
      <div class="kpi"><div class="kpi-num">${cancelados.length}</div><div class="kpi-lbl">Cancelados</div></div>
    </div>
    <div class="insights-section">
      <div class="insights-section-title">
        <span>Sugeridos para despachar (en ruta y sin despacho hoy)</span>
        <span class="muted">${sinDespachar.length}</span>
      </div>
      <div class="insights-chips">${sinDespacharHtml}</div>
    </div>
    <div class="insights-section">
      <div class="insights-section-title">
        <span>Pool Sonar del itinerario (habilitados, fuera de ruta y sin despacho hoy)</span>
        <span class="muted">${sonarDisponibles.length}</span>
      </div>
      <div class="insights-chips">${sonarDisponiblesHtml}</div>
    </div>
    <div class="insights-section">
      <div class="insights-section-title">
        <span>Vehiculos con mas de un despacho hoy</span>
        <span class="muted">${repetidos.length}</span>
      </div>
      <div class="insights-chips">${repetidosHtml}</div>
    </div>
    ${despachadosFueraDeSonar.length ? `
    <div class="insights-section">
      <div class="insights-section-title">
        <span>Despachados hoy no habilitados en vehiculossonar</span>
        <span class="muted">${despachadosFueraDeSonar.length}</span>
      </div>
      <div class="insights-chips">${fueraSonarHtml}</div>
    </div>` : ""}
  `;
}

function renderHistorialDespachosTab(){
  renderHistorialDespachosItinChips();
  renderHistorialInsights();
  if (!historialDespachosBody) return;
  const filtered = getFilteredHistorialDespachosRows();
  if (historialDespachosCount) historialDespachosCount.textContent = String(filtered.length);
  if (!filtered.length) {
    historialDespachosBody.innerHTML =
      `<tr><td colspan="11" class="muted" style="text-align:center;padding:12px">Sin despachos para mostrar.</td></tr>`;
    return;
  }
  historialDespachosBody.innerHTML = filtered.map(row => {
    const created = formatHistorialDateTime(row?.created_at);
    const cancelled = row?.cancelled_at ? formatHistorialDateTime(row?.cancelled_at) : "-";
    const estado = String(row?.estado || "").toUpperCase();
    const color = getHistorialEstadoColor(estado);
    const pasajeros = Number.isFinite(Number(row?.pasajeros)) ? Number(row.pasajeros) : 0;
    const rowId = escapeHtml(String(row?.id || ""));
    const regId = String(row?.reg_id || "").trim();
    const mId = String(row?.vehicle_id || "").trim();
    const isCanceling = historialCancelingIds.has(String(row?.id || ""));
    const ageMin = getMinutesSince(row?.created_at);
    const ageExpired = ageMin !== null && ageMin > MAX_CANCEL_AGE_MIN;
    let actionHtml = "";
    if (estado === "ACTIVO") {
      if (!regId || !mId) {
        actionHtml = `<span class="muted" title="Falta reg_id o vehicle_id">-</span>`;
      } else if (ageExpired) {
        actionHtml = `<span class="muted" title="Tiempo expirado: ${Math.floor(ageMin)} min (max ${MAX_CANCEL_AGE_MIN})">Expirado</span>`;
      } else {
        const label = isCanceling ? "Cancelando..." : "Cancelar";
        const minsLeft = Math.max(0, Math.ceil(MAX_CANCEL_AGE_MIN - (ageMin || 0)));
        const title = `Cancelar este despacho en Sonar (quedan ~${minsLeft} min)`;
        actionHtml = `<button type="button"
          class="btn btn-danger btn-cancel-historial"
          data-historial-id="${rowId}"
          ${isCanceling ? "disabled" : ""}
          title="${escapeHtml(title)}">${escapeHtml(label)}</button>`;
      }
    } else {
      actionHtml = `<span class="muted">-</span>`;
    }
    const interno = String(row?.interno || "");
    const baseNum = getBaseNumForInterno(interno);
    const baseBadge = baseNum
      ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span>`
      : "";
    return `<tr data-historial-id="${rowId}">
      <td data-label="Creado">${escapeHtml(created)}</td>
      <td data-label="Reg ID" data-mobile-secondary="1"><strong>${escapeHtml(String(row?.reg_id || "-"))}</strong></td>
      <td data-label="Interno">${baseBadge}<strong style="color:#065f46">${escapeHtml(interno || "-")}</strong></td>
      <td data-label="Placa">${escapeHtml(String(row?.placa || "-"))}</td>
      <td data-label="Driver ID" data-mobile-secondary="1">${escapeHtml(String(row?.driver_id || "-"))}</td>
      <td data-label="Itinerario">${escapeHtml(String(row?.itinerario || "-"))}</td>
      <td data-label="Pasajeros" style="text-align:right">
        <input type="number"
               class="cell-edit-input pasajeros-edit"
               min="0" max="999" step="1"
               value="${pasajeros}"
               data-original="${pasajeros}"
               data-historial-id="${rowId}"
               aria-label="Editar pasajeros" />
      </td>
      <td data-label="Observaciones">
        <input type="text"
               class="cell-edit-input observaciones-edit"
               maxlength="500"
               value="${escapeHtml(String(row?.observaciones || ""))}"
               data-original="${escapeHtml(String(row?.observaciones || ""))}"
               data-historial-id="${rowId}"
               placeholder="Agregar observacion..."
               aria-label="Editar observaciones" />
      </td>
      <td data-label="Estado"><strong style="color:${color}">${escapeHtml(estado || "-")}</strong></td>
      <td data-label="Cancelado" data-mobile-secondary="1">${escapeHtml(cancelled)}</td>
      <td data-label="Accion">${actionHtml}</td>
    </tr>`;
  }).join("");
}

async function updateDespachoRealizadoPasajeros(id, nuevoValor){
  const rowId = String(id || "").trim();
  if (!rowId) throw new Error("id de despacho vacio");
  const num = parseInt(String(nuevoValor), 10);
  if (!Number.isFinite(num) || num < 0) throw new Error("Valor de pasajeros invalido");
  const { data, error } = await planillaSupabaseClient
    .from(HISTORIAL_DESPACHOS_TABLE)
    .update({ pasajeros: num })
    .eq("id", rowId)
    .select()
    .single();
  if (error) throw error;
  // Sincronizar la fila local
  const local = (historialDespachosRows || []).find(r => String(r?.id) === rowId);
  if (local) local.pasajeros = num;
  return data;
}

async function handlePasajerosEditCommit(input){
  if (!input || input.classList.contains("is-saving")) return;
  const id = String(input.getAttribute("data-historial-id") || "").trim();
  const original = String(input.getAttribute("data-original") || "");
  const valor = String(input.value || "").trim();
  if (!id) return;
  if (valor === original) return; // sin cambios
  const num = parseInt(valor, 10);
  if (!Number.isFinite(num) || num < 0 || num > 999) {
    input.classList.add("is-error");
    input.value = original;
    showToast("Pasajeros debe ser un numero entero entre 0 y 999.", "warn");
    setTimeout(() => input.classList.remove("is-error"), 1200);
    return;
  }
  input.classList.add("is-saving");
  input.classList.remove("is-error", "is-saved");
  input.disabled = true;
  try {
    await updateDespachoRealizadoPasajeros(id, num);
    input.classList.remove("is-saving");
    input.classList.add("is-saved");
    input.setAttribute("data-original", String(num));
    setTimeout(() => input.classList.remove("is-saved"), 900);
  } catch (err) {
    console.error("[despachos_realizados] update pasajeros fallo:", err);
    input.classList.remove("is-saving");
    input.classList.add("is-error");
    input.value = original;
    showToast(`No se pudo actualizar pasajeros: ${err?.message || err}`, "err");
    setTimeout(() => input.classList.remove("is-error"), 1500);
  } finally {
    input.disabled = false;
  }
}

async function updateDespachoRealizadoObservaciones(id, nuevoValor){
  const rowId = String(id || "").trim();
  if (!rowId) throw new Error("id de despacho vacio");
  const texto = String(nuevoValor ?? "").slice(0, 500);
  const payload = texto.trim() === "" ? null : texto;
  const { data, error } = await planillaSupabaseClient
    .from(HISTORIAL_DESPACHOS_TABLE)
    .update({ observaciones: payload })
    .eq("id", rowId)
    .select()
    .single();
  if (error) throw error;
  const local = (historialDespachosRows || []).find(r => String(r?.id) === rowId);
  if (local) local.observaciones = payload;
  return data;
}

async function handleObservacionesEditCommit(input){
  if (!input || input.classList.contains("is-saving")) return;
  const id = String(input.getAttribute("data-historial-id") || "").trim();
  const original = String(input.getAttribute("data-original") || "");
  const valor = String(input.value || "");
  if (!id) return;
  if (valor === original) return;
  if (valor.length > 500) {
    input.classList.add("is-error");
    input.value = original;
    showToast("Observaciones: maximo 500 caracteres.", "warn");
    setTimeout(() => input.classList.remove("is-error"), 1200);
    return;
  }
  input.classList.add("is-saving");
  input.classList.remove("is-error", "is-saved");
  input.disabled = true;
  try {
    await updateDespachoRealizadoObservaciones(id, valor);
    input.classList.remove("is-saving");
    input.classList.add("is-saved");
    input.setAttribute("data-original", valor);
    setTimeout(() => input.classList.remove("is-saved"), 900);
  } catch (err) {
    console.error("[despachos_realizados] update observaciones fallo:", err);
    input.classList.remove("is-saving");
    input.classList.add("is-error");
    input.value = original;
    showToast(`No se pudo actualizar observaciones: ${err?.message || err}`, "err");
    setTimeout(() => input.classList.remove("is-error"), 1500);
  } finally {
    input.disabled = false;
  }
}

function handleHistorialDespachosBodyChange(ev){
  const pasajeros = ev.target?.closest?.(".pasajeros-edit");
  if (pasajeros && historialDespachosBody?.contains(pasajeros)) {
    handlePasajerosEditCommit(pasajeros);
    return;
  }
  const obs = ev.target?.closest?.(".observaciones-edit");
  if (obs && historialDespachosBody?.contains(obs)) {
    handleObservacionesEditCommit(obs);
  }
}

function handleHistorialDespachosBodyKeydown(ev){
  if (ev.key !== "Enter") return;
  const input = ev.target?.closest?.(".pasajeros-edit, .observaciones-edit");
  if (!input || !historialDespachosBody?.contains(input)) return;
  ev.preventDefault();
  input.blur();
}

function findPlanillaRowByDispatchRegId(regId){
  const id = String(regId || "").trim();
  if (!id) return null;
  const rows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  return rows.find(r => String(getRowDispatchRegId(r) || "").trim() === id) || null;
}

async function handleCancelDispatchFromHistorial(historialId){
  const id = String(historialId || "").trim();
  if (!id) return;
  if (historialCancelingIds.has(id)) return;
  const histRow = (historialDespachosRows || []).find(r => String(r?.id) === id);
  if (!histRow) {
    showToast("No se encontro el despacho a cancelar.", "warn");
    return;
  }
  if (String(histRow?.estado || "").toUpperCase() !== "ACTIVO") {
    showToast("Este despacho ya esta cancelado.", "warn");
    return;
  }
  const regId = String(histRow?.reg_id || "").trim();
  const mId = String(histRow?.vehicle_id || "").trim();
  if (!regId || !mId) {
    showToast("No se puede cancelar: falta reg_id o vehicle_id.", "warn");
    return;
  }
  const ageMin = getMinutesSince(histRow?.created_at);
  if (ageMin !== null && ageMin > MAX_CANCEL_AGE_MIN) {
    showToast(`Tiempo expirado: el despacho tiene ${Math.floor(ageMin)} min (max ${MAX_CANCEL_AGE_MIN}).`, "warn");
    renderHistorialDespachosTab();
    return;
  }
  const modalResult = await openCancelDispatchModal({
    interno: String(histRow?.interno || "-"),
    base: "-",
    mid: mId,
    regId,
    horaDespacho: formatHistorialDateTime(histRow?.created_at)
  });
  if (!modalResult?.confirmed) return;
  const comments = String(modalResult?.comments || "").trim();
  if (comments.length < 5) {
    showToast("Escribe un motivo de minimo 5 caracteres para cancelar.", "warn");
    return;
  }
  historialCancelingIds.add(id);
  renderHistorialDespachosTab();
  try {
    const payload = {
      mId,
      regId,
      comments,
      dispatchId: null,
      canceledBy: currentUserEmail || currentUserId || "desconocido",
      canceledAt: new Date().toISOString(),
      vehicle: {
        interno: String(histRow?.interno || "-"),
        base: "-"
      },
      dispatch: {
        itinerary: String(histRow?.itinerario || ""),
        hora_despacho: formatHistorialDateTime(histRow?.created_at),
        driver_id: String(histRow?.driver_id || "")
      },
      source: "historial-despachos"
    };
    const cancelResult = await sendCancelDispatchToSonar(payload);
    await markDespachoRealizadoAsCanceled(regId, cancelResult);
    histRow.estado = "CANCELADO";
    histRow.cancelled_at = new Date().toISOString();

    let planillaUpdated = false;
    const planillaRow = findPlanillaRowByDispatchRegId(regId);
    if (planillaRow) {
      planillaRow.hora_despacho = null;
      planillaRow.itinerario_despacho = "";
      planillaRow.estado = "En espera";
      invalidatePlanillaDispatchResolutionCache();
      try {
        await persistCancelOnPlanillaRow(planillaRow, { comments, driverId: planillaRow?.driver_id });
        planillaUpdated = true;
      } catch (persistErr) {
        console.error("Cancel desde historial: persist por id fallo:", persistErr);
      }
    }
    if (!planillaUpdated) {
      planillaUpdated = await clearPlanillaDispatchByRegIdInDb(regId);
      if (planillaUpdated) {
        await loadPlanillaAfiliadosFromSupabase();
        invalidatePlanillaDispatchResolutionCache();
      } else {
        console.warn("[historial cancel] no se encontro la fila en planilla por reg_id:", regId);
      }
    }
    showToast(planillaUpdated
      ? "Despacho cancelado en Sonar y planilla actualizada."
      : "Despacho cancelado en Sonar (planilla no encontrada por reg_id).",
      planillaUpdated ? "ok" : "warn");
  } catch (err) {
    console.error("[historial] cancelacion fallo:", err);
    showToast(`Error al cancelar: ${err?.message || "fallo en sonar-cancel"}`, "err");
  } finally {
    historialCancelingIds.delete(id);
    renderHistorialDespachosTab();
  }
}

function handleHistorialDespachosBodyClick(ev){
  const btn = ev.target?.closest?.(".btn-cancel-historial");
  if (!btn || !historialDespachosBody?.contains(btn)) return;
  const id = String(btn.getAttribute("data-historial-id") || "").trim();
  if (!id) return;
  handleCancelDispatchFromHistorial(id);
}

/* ===================== MAPA VEHICULOS (llegadas_104 + realtime) ===================== */
const MAPA_VEHICULOS_TABLE = "llegadas_104";
let mapaVehiculosRows = [];
let mapaVehiculosLastLoadedAt = null;
let mapaRealtimeChannel = null;
let mapaRealtimeRetryTimer = null;
let mapaRealtimeRetryDelay = 1000;
const MAPA_REALTIME_RETRY_MAX_MS = 30000;
let mapaPollingTimer = null;
const MAPA_POLLING_INTERVAL_MS = 30000;
const MAPA_VISIBILITY_STALE_MS = 15000;
let mapaVisibilityListenerAttached = false;

function getMapaRowKey(row){
  return String(row?.vehicle_id || row?.interno || "").trim().toUpperCase();
}

// Carga llegadas_104 (vehiculos en fila) para los indicadores del historial; se mantiene al dia por Realtime.
async function loadMapaVehiculos(){
  if (!currentUserId) return;
  try {
    const { data, error } = await planillaSupabaseClient
      .from(MAPA_VEHICULOS_TABLE)
      .select("vehicle_id,interno,itinerario,posicion,hora_llegada,base,driver_id,distancia_m,listo,ubicacion,updated_at,lat,lon")
      .order("hora_llegada", { ascending: false })
      .limit(500);
    if (error) throw error;
    mapaVehiculosRows = Array.isArray(data) ? data : [];
    mapaVehiculosLastLoadedAt = Date.now();
    renderHistorialInsights();
    ensureMapaRealtime();
    ensureMapaPolling();
    ensureMapaVisibilityListener();
  } catch (err) {
    console.error(`[${MAPA_VEHICULOS_TABLE}] consulta fallo:`, err);
    showToast(`No se pudo cargar ${MAPA_VEHICULOS_TABLE}: ${err?.message || "fallo"}`, "err");
  }
}

function applyRealtimeChangeToMapa(payload){
  if (!payload) return;
  const eventType = payload.eventType || payload.type;
  const newRow = payload.new || null;
  const oldRow = payload.old || null;
  const target = newRow || oldRow;
  if (!target) return;
  const key = getMapaRowKey(target);
  if (!key) return;
  if (eventType === "DELETE") {
    mapaVehiculosRows = mapaVehiculosRows.filter(r => getMapaRowKey(r) !== key);
  } else {
    const idx = mapaVehiculosRows.findIndex(r => getMapaRowKey(r) === key);
    if (idx >= 0) {
      mapaVehiculosRows[idx] = { ...mapaVehiculosRows[idx], ...newRow };
    } else if (newRow) {
      mapaVehiculosRows.unshift(newRow);
    }
  }
  renderHistorialInsights();
}

function scheduleMapaRealtimeRetry(){
  if (mapaRealtimeRetryTimer) return;
  const delay = mapaRealtimeRetryDelay;
  mapaRealtimeRetryDelay = Math.min(mapaRealtimeRetryDelay * 2, MAPA_REALTIME_RETRY_MAX_MS);
  mapaRealtimeRetryTimer = setTimeout(() => {
    mapaRealtimeRetryTimer = null;
    ensureMapaRealtime();
  }, delay);
}

function ensureMapaRealtime(){
  if (mapaRealtimeChannel) return;
  if (!planillaSupabaseClient?.channel) return;
  mapaRealtimeChannel = planillaSupabaseClient
    .channel(`${MAPA_VEHICULOS_TABLE}_live`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: MAPA_VEHICULOS_TABLE },
      (payload) => {
        applyRealtimeChangeToMapa(payload);
      }
    )
    .subscribe((status) => {
      console.info("[realtime] llegadas_104 status:", status);
      if (status === "SUBSCRIBED") {
        mapaRealtimeRetryDelay = 1000;
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        try { planillaSupabaseClient.removeChannel?.(mapaRealtimeChannel); } catch (_) {}
        mapaRealtimeChannel = null;
        scheduleMapaRealtimeRetry();
        loadMapaVehiculos();
      }
    });
}

function ensureMapaPolling(){
  if (mapaPollingTimer) return;
  mapaPollingTimer = setInterval(() => {
    if (document.hidden) return;
    if (!currentUserId) return;
    loadMapaVehiculos();
  }, MAPA_POLLING_INTERVAL_MS);
}

function ensureMapaVisibilityListener(){
  if (mapaVisibilityListenerAttached) return;
  mapaVisibilityListenerAttached = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (!currentUserId) return;
    const stale = !mapaVehiculosLastLoadedAt
      || (Date.now() - mapaVehiculosLastLoadedAt) > MAPA_VISIBILITY_STALE_MS;
    if (stale) loadMapaVehiculos();
  });
}

function handleHistorialDespachosChipClick(ev){
  const chip = ev.target?.closest?.(".chip");
  if (!chip || !historialDespachosItinChips?.contains(chip)) return;
  historialDespachosItinFilter = String(chip.getAttribute("data-itin") || "");
  renderHistorialDespachosTab();
}

async function fetchVehiculoSonarByInterno(internoValue){
  const interno = String(internoValue || "").trim();
  if (!interno || !currentUserId) return null;
  try {
    const numericInterno = Number(interno);
    let query = planillaSupabaseClient
      .from(VEHICULOS_SONAR_TABLE_NAME)
      .select("*")
      .limit(5);
    query = Number.isFinite(numericInterno) && String(numericInterno) === interno
      ? query.eq("INTERNO", numericInterno)
      : query.eq("INTERNO", interno);
    const { data, error } = await query;
    if (error) throw error;
    return mergeVehiculoSonarRows(data);
  } catch (error) {
    console.error(`Error consultando ${VEHICULOS_SONAR_TABLE_NAME} por INTERNO:`, error);
    return null;
  }
}

function getManualDispatchVehicleRows(){
  const sonarRows = Array.isArray(vehiculosSonarRows) ? vehiculosSonarRows : [];
  if (sonarRows.length > 0) {
    const seen = new Set();
    const unique = [];
    sonarRows
      .slice()
      .sort((a, b) => String(a.interno).localeCompare(String(b.interno), "es", { numeric: true }))
      .forEach(row => {
        const interno = String(row?.interno || "").trim();
        if (!interno || seen.has(interno)) return;
        seen.add(interno);
        unique.push(row);
      });
    return unique;
  }

  const rows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  const sorted = rows
    .filter(row => !!String(row?.interno || "").trim())
    .slice()
    .sort(comparePlanillaRowsByCurrentDateTime);
  const seen = new Set();
  const unique = [];
  sorted.forEach(row => {
    const interno = String(row?.interno || "").trim();
    if (!interno || seen.has(interno)) return;
    seen.add(interno);
    unique.push(row);
  });
  return unique;
}

let manualDispatchInternoRows = [];

function fillManualDispatchInternoList(){
  manualDispatchInternoRows = getManualDispatchVehicleRows();
  renderManualDispatchInternoPanel();
}

// Dibuja el panel desplegable del Interno, filtrando por lo que el usuario escribe.
function renderManualDispatchInternoPanel(){
  const panel = document.getElementById("manualDispatchInternoPanel");
  if (!panel) return;
  const q = String(manualDispatchInterno?.value || "").trim().toLowerCase();
  const rows = manualDispatchInternoRows.filter(row => {
    if (!q) return true;
    const interno = String(row?.interno || "").toLowerCase();
    const placa = String(row?.placa || row?.Placa || "").toLowerCase();
    const mid = String(row?.mid || "").toLowerCase();
    return interno.includes(q) || placa.includes(q) || mid.includes(q);
  }).slice(0, 200);
  if (!rows.length) {
    panel.innerHTML = `<div class="combo-empty">Sin coincidencias</div>`;
    return;
  }
  panel.innerHTML = rows.map(row => {
    const interno = String(row?.interno || "").trim();
    const base = formatBaseLabel(getBaseCanonical(row?.base || "") || getManualDispatchDefaultBase());
    const mid = String(row?.mid || "").trim();
    const placa = String(row?.placa || row?.Placa || "").trim();
    const subParts = [];
    if (placa) subParts.push(`Placa ${placa}`);
    if (base) subParts.push(base);
    subParts.push(`MID ${mid || "-"}`);
    return `<div class="combo-option" data-interno="${escapeHtml(interno)}">`
      + `<span class="opt-main">${escapeHtml(interno)}</span>`
      + `<span class="opt-sub">${escapeHtml(subParts.join(" | "))}</span>`
      + `</div>`;
  }).join("");
}

function openManualDispatchInternoPanel(){
  const panel = document.getElementById("manualDispatchInternoPanel");
  if (!panel) return;
  renderManualDispatchInternoPanel();
  panel.classList.remove("hidden");
}

function closeManualDispatchInternoPanel(){
  const panel = document.getElementById("manualDispatchInternoPanel");
  if (panel) panel.classList.add("hidden");
}

function findManualDispatchVehicleByInterno(internoValue){
  const interno = String(internoValue || "").trim();
  if (!interno) return null;
  const rows = getManualDispatchVehicleRows();
  return rows.find(row => String(row?.interno || "").trim() === interno) || null;
}

let manualDispatchConductorBase = "";

// La base del vehiculo solo ordena la lista (sus conductores primero); no oculta a los demas,
// porque hay conductores sin email en la hoja y de ahi es de donde se saca su base.
function fillManualDispatchConductorList(baseValue){
  manualDispatchConductorBase = getBaseCanonical(baseValue || "");
  renderManualDispatchConductorPanel();
}

// Busca sin importar tildes ni el orden de las palabras, por nombre, cedula o dr_id.
// Los inhabilitados (o sin dr_id) se devuelven aparte para avisar por que no se pueden elegir.
function getManualDispatchConductorMatches(){
  const query = normalizeDriverName(String(manualDispatchConductorName?.value || "").split("|")[0]);
  const words = query ? query.split(" ") : [];
  const matches = row => {
    if (!words.length) return true;
    const haystack = normalizeDriverName(`${row?.nombre || ""} ${row?.cedula || ""} ${row?.dr_id || ""}`);
    return words.every(word => haystack.includes(word));
  };
  const isEnabled = row => String(row?.status || "").trim().toUpperCase() === "ENABLED";
  const catalog = Array.isArray(driversCatalogRows) ? driversCatalogRows : [];
  const base = manualDispatchConductorBase;
  const selectable = catalog
    .filter(row => isEnabled(row) && String(row?.dr_id || "").trim() && matches(row))
    .sort((a, b) => {
      const pa = base && getCsvDriverBase(a) === base ? 0 : 1;
      const pb = base && getCsvDriverBase(b) === base ? 0 : 1;
      return pa - pb || String(a?.nombre || "").localeCompare(String(b?.nombre || ""), "es");
    });
  if (!words.length) return { selectable, blocked: [] };
  const enabledCedulas = new Set(catalog.filter(isEnabled).map(row => String(row?.cedula || "").trim()).filter(Boolean));
  const blocked = catalog
    .filter(row => matches(row) && !selectable.includes(row))
    .filter(row => isEnabled(row) || !enabledCedulas.has(String(row?.cedula || "").trim()))
    .map(row => ({ row, reason: isEnabled(row) ? "Sin dr_id en la hoja de conductores" : "Inhabilitado en la hoja de conductores" }));
  return { selectable, blocked };
}

// Dibuja el panel desplegable del Conductor, incluyendo los estados de carga y error del CSV.
function renderManualDispatchConductorPanel(){
  const panel = document.getElementById("manualDispatchConductorPanel");
  if (!panel) return;
  if (!Array.isArray(driversCatalogRows) || !driversCatalogRows.length) {
    panel.innerHTML = isLoadingDrivers
      ? `<div class="combo-empty">Cargando conductores...</div>`
      : `<div class="combo-empty">No se pudo cargar la lista de conductores${driversLoadError ? ` (${escapeHtml(driversLoadError)})` : ""}.`
        + `<button type="button" class="btn btn-ghost combo-retry">Reintentar</button></div>`;
    return;
  }
  const { selectable, blocked } = getManualDispatchConductorMatches();
  const html = selectable.slice(0, 200).map(row => {
    const nombre = String(row?.nombre || "").trim();
    const drId = String(row?.dr_id || "").trim();
    const driverBase = getCsvDriverBase(row);
    const subParts = [`ID ${drId}`];
    if (driverBase) subParts.push(formatBaseLabel(driverBase));
    return `<div class="combo-option" data-conductor="${escapeHtml(`${nombre} | ${drId}`)}">`
      + `<span class="opt-main">${escapeHtml(nombre)}</span>`
      + `<span class="opt-sub">${escapeHtml(subParts.join(" | "))}</span>`
      + `</div>`;
  });
  if (blocked.length) {
    html.push(`<div class="combo-section">No se pueden despachar</div>`);
    blocked.slice(0, 20).forEach(({ row, reason }) => {
      html.push(`<div class="combo-option disabled">`
        + `<span class="opt-main">${escapeHtml(String(row?.nombre || "").trim() || "(sin nombre)")}</span>`
        + `<span class="opt-sub">${escapeHtml(reason)}</span>`
        + `</div>`);
    });
  }
  panel.innerHTML = html.length ? html.join("") : `<div class="combo-empty">Sin coincidencias</div>`;
}

function openManualDispatchConductorPanel(){
  const panel = document.getElementById("manualDispatchConductorPanel");
  if (!panel) return;
  renderManualDispatchConductorPanel();
  panel.classList.remove("hidden");
}

function closeManualDispatchConductorPanel(){
  const panel = document.getElementById("manualDispatchConductorPanel");
  if (panel) panel.classList.add("hidden");
}

function pickManualDispatchConductorOption(opt){
  const value = opt?.getAttribute("data-conductor");
  if (!value) return; // opcion informativa (inhabilitado / sin dr_id)
  if (manualDispatchConductorName) manualDispatchConductorName.value = value;
  closeManualDispatchConductorPanel();
  applyManualDispatchConductorSelection();
  refreshManualDispatchHintIfVisible();
}

function pickManualDispatchInternoOption(opt){
  if (manualDispatchInterno) manualDispatchInterno.value = opt?.getAttribute("data-interno") || "";
  closeManualDispatchInternoPanel();
  applyManualDispatchVehicleSelection();
  refreshManualDispatchHintIfVisible();
}

// Teclado de los combos: flechas recorren, Enter elige y Escape cierra el panel.
// Con el panel abierto, Enter/Escape no llegan al modal (antes Enter enviaba el despacho).
function handleComboKeydown(ev, panel, pick){
  if (!panel || panel.classList.contains("hidden")) return;
  const options = Array.from(panel.querySelectorAll(".combo-option:not(.disabled)"));
  const current = options.findIndex(opt => opt.classList.contains("active"));
  if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
    ev.preventDefault();
    if (!options.length) return;
    const next = ev.key === "ArrowDown"
      ? Math.min(current + 1, options.length - 1)
      : Math.max(current - 1, 0);
    options.forEach(opt => opt.classList.remove("active"));
    options[next].classList.add("active");
    options[next].scrollIntoView({ block: "nearest" });
  } else if (ev.key === "Enter") {
    ev.preventDefault();
    ev.stopPropagation();
    const opt = options[current >= 0 ? current : 0];
    if (opt) pick(opt);
  } else if (ev.key === "Escape") {
    ev.stopPropagation();
    panel.classList.add("hidden");
  }
}

function applyManualDispatchConductorSelection(){
  if (!manualDispatchDriverId) return;
  const conductor = String(manualDispatchConductorName?.value || "").trim();
  const base = String(manualDispatchBase?.value || "").trim();
  const fromPipe = conductor.includes("|")
    ? String(conductor.split("|").pop() || "").trim()
    : "";
  const drvId = fromPipe || findDriverIdByName(conductor, base);
  manualDispatchDriverId.value = drvId || "";
  renderManualDispatchDriverInfo();
}

// Propone el conductor que Sonar tiene asignado al vehiculo (vehiculossonar.mdriverid) si esta habilitado
// en la hoja. No reemplaza un conductor que el operador eligio a mano.
function suggestManualDispatchConductor(){
  if (!manualDispatchConductorName) return;
  const current = String(manualDispatchConductorName.value || "").trim();
  if (current && current !== manualDispatchSuggestedValue) return;
  const assignedId = String(manualDispatchCurrentVehicle?.mdriverid ?? "").trim();
  const driver = assignedId
    ? (driversCatalogRows || []).find(d => String(d?.dr_id || "").trim() === assignedId
      && String(d?.status || "").trim().toUpperCase() === "ENABLED")
    : null;
  manualDispatchSuggestedValue = driver ? `${String(driver.nombre || "").trim()} | ${assignedId}` : "";
  manualDispatchConductorName.value = manualDispatchSuggestedValue;
}

// Si el conductor elegido no es el que Sonar tiene asignado al vehiculo, lo informa.
function getManualDispatchSonarDriverNote(){
  const assignedId = String(manualDispatchCurrentVehicle?.mdriverid ?? "").trim();
  if (!assignedId || !driversCatalogRows.length) return "";
  if (String(manualDispatchDriverId?.value || "").trim() === assignedId) return "";
  const driver = driversCatalogRows.find(d => String(d?.dr_id || "").trim() === assignedId);
  if (!driver) return `En Sonar el vehiculo tiene asignado el ID ${assignedId}, que no esta en la hoja de conductores.`;
  const nombre = String(driver.nombre || "").trim();
  if (String(driver.status || "").trim().toUpperCase() !== "ENABLED") {
    return `En Sonar esta asignado ${nombre}, inhabilitado en la hoja de conductores.`;
  }
  return `En Sonar esta asignado ${nombre}.`;
}

function renderManualDispatchDriverInfo(){
  if (!manualDispatchDriverInfo) return;
  const drvId = String(manualDispatchDriverId?.value || "").trim();
  const value = String(manualDispatchConductorName?.value || "").trim();
  const parts = [];
  if (drvId) parts.push(`<span>Driver ID <strong>${escapeHtml(drvId)}</strong></span>`);
  if (drvId && value && value === manualDispatchSuggestedValue) parts.push(`<span class="dispatch-badge">Asignado en Sonar</span>`);
  const note = getManualDispatchSonarDriverNote();
  if (note) parts.push(`<span class="dispatch-note">${escapeHtml(note)}</span>`);
  manualDispatchDriverInfo.innerHTML = parts.join("");
  manualDispatchDriverInfo.hidden = !parts.length;
}

function renderManualDispatchVehicleInfo(row){
  if (!manualDispatchVehicleInfo) return;
  const mid = String(row?.mid || "").trim();
  if (!row || !mid) {
    manualDispatchVehicleInfo.innerHTML = "";
    manualDispatchVehicleInfo.hidden = true;
    return;
  }
  const parts = [];
  const placa = String(row?.placa || row?.Placa || "").trim();
  if (placa) parts.push(`Placa <strong>${escapeHtml(placa)}</strong>`);
  parts.push(`MID <strong>${escapeHtml(mid)}</strong>`);
  const baseNum = getBaseNumForInterno(row?.interno);
  if (baseNum) parts.push(`Base <strong>${escapeHtml(baseNum)}</strong>`);
  manualDispatchVehicleInfo.innerHTML = parts.map(p => `<span>${p}</span>`).join("");
  manualDispatchVehicleInfo.hidden = false;
}

// Avisa (sin bloquear) si el interno ya tiene un despacho ACTIVO en los ultimos REPEAT_DISPATCH_WINDOW_MIN minutos.
async function checkManualDispatchRepeat(interno){
  const seq = ++manualDispatchRepeatSeq;
  if (!manualDispatchRepeatWarning) return;
  manualDispatchRepeatWarning.textContent = "";
  manualDispatchRepeatWarning.hidden = true;
  if (!interno) return;
  try {
    const desde = new Date(Date.now() - REPEAT_DISPATCH_WINDOW_MIN * 60000).toISOString();
    const { data, error } = await planillaSupabaseClient
      .from(DESPACHOS_REALIZADOS_TABLE)
      .select("created_at, itinerario")
      .eq("interno", interno)
      .eq("estado", "ACTIVO")
      .gte("created_at", desde)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    if (seq !== manualDispatchRepeatSeq || !data?.length) return;
    const last = data[0];
    const mins = Math.max(0, Math.floor(getMinutesSince(last.created_at) || 0));
    manualDispatchRepeatWarning.textContent = `Atencion: el interno ${interno} ya tiene un despacho activo de hace ${mins} min`
      + ` (${last.itinerario || "sin itinerario"}, ${formatHistorialDateTime(last.created_at)}). Revisa antes de enviar otro.`;
    manualDispatchRepeatWarning.hidden = false;
  } catch (err) {
    console.warn("[despacho repetido] no se pudo consultar:", err);
  }
}

function applyManualDispatchVehicleRow(row){
  const interno = String(row?.interno || "").trim();
  const changed = String(manualDispatchCurrentVehicle?.interno || "").trim() !== interno;
  manualDispatchCurrentVehicle = row || null;
  renderManualDispatchVehicleInfo(row);
  if (changed) checkManualDispatchRepeat(row ? interno : "");
  if (!row) {
    if (manualDispatchBase) manualDispatchBase.value = "";
    if (manualDispatchMid) manualDispatchMid.value = "";
    fillManualDispatchConductorList("");
    suggestManualDispatchConductor();
    applyManualDispatchConductorSelection();
    return;
  }
  const base = getBaseCanonical(row?.base || "") || getManualDispatchDefaultBase();
  const mid = String(row?.mid || "").trim();
  if (manualDispatchBase) manualDispatchBase.value = base;
  if (manualDispatchMid) manualDispatchMid.value = mid;
  fillManualDispatchConductorList(base);
  suggestManualDispatchConductor();
  const conductorEnFila = String(row?.conductor || "").trim();
  if (conductorEnFila && manualDispatchConductorName && !String(manualDispatchConductorName.value || "").trim()) {
    const baseCanonical = getBaseCanonical(base || "");
    const drvIdFromRow = findDriverIdByName(conductorEnFila, baseCanonical);
    manualDispatchConductorName.value = drvIdFromRow
      ? `${conductorEnFila} | ${drvIdFromRow}`
      : conductorEnFila;
  }
  applyManualDispatchConductorSelection();
}

async function applyManualDispatchVehicleSelection(){
  const internoValue = manualDispatchInterno?.value || "";
  const lookupSeq = ++manualDispatchVehicleLookupSeq;
  let row = findManualDispatchVehicleByInterno(internoValue);
  if (!row) {
    row = await fetchVehiculoSonarByInterno(internoValue);
    if (lookupSeq !== manualDispatchVehicleLookupSeq) return;
    if (row) fillManualDispatchInternoList();
  }
  if (lookupSeq !== manualDispatchVehicleLookupSeq) return;
  applyManualDispatchVehicleRow(row);
}

async function openManualDispatchModal(){
  if (!manualDispatchModal || !btnManualDispatchCancel || !btnManualDispatchConfirm) {
    return Promise.resolve({ confirmed: false });
  }
  // Sin await: si el CSV tarda, el panel del Conductor muestra "Cargando..." y se redibuja al llegar.
  ensureDriversCatalogFresh();
  ensureFreshPlanilla();
  await loadVehiculosSonarFromSupabase();
  fillManualDispatchInternoList();
  closeManualDispatchConductorPanel();
  manualDispatchCurrentVehicle = null;
  manualDispatchSuggestedValue = "";
  fillManualDispatchConductorList("");
  if (manualDispatchInterno) manualDispatchInterno.value = "";
  if (manualDispatchBase) manualDispatchBase.value = "";
  if (manualDispatchMid) manualDispatchMid.value = "";
  if (manualDispatchConductorName) manualDispatchConductorName.value = "";
  if (manualDispatchDriverId) manualDispatchDriverId.value = "";
  if (manualDispatchObs) manualDispatchObs.value = "";
  if (manualDispatchItinerarySelect) {
    manualDispatchItinerarySelect.innerHTML = buildItineraryOptionsHtml();
    // Con un solo itinerario configurado, ya viene elegido.
    manualDispatchItinerarySelect.value = SONAR_ITINERARIES.length === 1 ? String(SONAR_ITINERARIES[0].id) : "";
  }
  renderManualDispatchVehicleInfo(null);
  checkManualDispatchRepeat("");
  renderManualDispatchDriverInfo();
  setManualDispatchHint("");
  paintManualDispatchMissing([]);
  setManualDispatchSending(false);
  manualDispatchModal.classList.remove("hidden");
  setTimeout(() => manualDispatchInterno?.focus(), 10);
  return waitManualDispatchSubmit();
}

function applyAuthState(session){
  const loggedIn = !!session;
  authPanel.classList.toggle("hidden", loggedIn);
  appWrap.classList.toggle("hidden", !loggedIn);
  btnLogout.classList.toggle("hidden", !loggedIn);

  if(loggedIn){
    const user = session.user;
    currentUserId = user.id;
    currentUserEmail = user.email || "";
    authUserLabel.textContent = `Usuario: ${currentUserEmail || "sin correo"}`;
    setAuthStatus("Sesion iniciada.", "ok");
    const shouldInitialize = !appInitialized;
    if(shouldInitialize){
      appInitialized = true;
      initializeApp().catch((error) => {
        console.error("Error inicializando app:", error);
        showToast("No se pudo inicializar la app.", "err");
        appInitialized = false;
      });
    }
  }else{
    currentUserId = null;
    currentUserEmail = "";
    vehiculosSonarRows = [];
    vehiculosSonarLoadedOnce = false;
    vehiculosSonarLastLoadedAt = 0;
    authUserLabel.textContent = "No autenticado";
    setAuthStatus("Inicia sesion para continuar.", "warn");
    appInitialized = false;
  }
}

btnSignIn.onclick = async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if(!email || !password){
    setAuthStatus("Escribe correo y contrasena.", "err");
    return;
  }
  setAuthStatus("Validando acceso...", "warn");
  const { error } = await authSupabaseClient.auth.signInWithPassword({ email, password });
  if(error){
    setAuthStatus(error.message, "err");
    return;
  }
  authPassword.value = "";
};

btnSignUp.onclick = async () => {
  if (!ALLOW_PUBLIC_SIGNUP) {
    setAuthStatus("Registro deshabilitado. Solicita tu usuario al administrador.", "warn");
    return;
  }
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if(!email || !password){
    setAuthStatus("Escribe correo y contrasena.", "err");
    return;
  }
  setAuthStatus("Creando cuenta...", "warn");
  const { error } = await authSupabaseClient.auth.signUp({ email, password });
  if(error){
    setAuthStatus(error.message, "err");
    return;
  }
  setAuthStatus("Cuenta creada. Revisa tu correo si la confirmacion esta activa.", "ok");
  authPassword.value = "";
};

if (btnSignUp && !ALLOW_PUBLIC_SIGNUP) {
  btnSignUp.classList.add("hidden");
  btnSignUp.disabled = true;
}

btnLogout.onclick = async () => {
  const { error } = await authSupabaseClient.auth.signOut();
  if(error){
    setAuthStatus(error.message, "err");
  }
};

async function initAuth(){
  const { data, error } = await authSupabaseClient.auth.getSession();
  if(error){
    setAuthStatus(error.message, "err");
    applyAuthState(null);
  }else{
    applyAuthState(data.session);
  }
  authSupabaseClient.auth.onAuthStateChange((_event, session) => {
    applyAuthState(session);
  });
}

if (btnCancelDispatchCancel) btnCancelDispatchCancel.onclick = () => closeCancelDispatchModal(false);
if (btnCancelDispatchConfirm) btnCancelDispatchConfirm.onclick = () => closeCancelDispatchModal(true);
if (btnManualDispatchCancel) btnManualDispatchCancel.onclick = () => closeManualDispatchModal(false);
// Solo los campos que el usuario debe seleccionar: Interno, Conductor e Itinerario.
// (MID y Driver ID se autocompletan al elegir Interno y Conductor, no se piden aparte.)
function getManualDispatchMissingFields(){
  const interno = String(manualDispatchInterno?.value || "").trim();
  const mId = String(manualDispatchMid?.value || "").trim();
  const conductorName = String(manualDispatchConductorName?.value || "").trim();
  const drvId = String(manualDispatchDriverId?.value || "").trim();
  const itinerary = String(manualDispatchItinerarySelect?.value || "").trim();
  const faltantes = [];
  if (!interno || !mId) faltantes.push({ label: !interno ? "Interno" : "Interno valido", el: manualDispatchInterno });
  if (!conductorName || !drvId) faltantes.push({ label: !conductorName ? "Conductor" : "Conductor valido", el: manualDispatchConductorName });
  if (!itinerary) faltantes.push({ label: "Itinerario", el: manualDispatchItinerarySelect });
  return faltantes;
}

// Pinta de rojo los campos faltantes y limpia los ya completados.
function paintManualDispatchMissing(faltantes){
  [manualDispatchInterno, manualDispatchConductorName, manualDispatchItinerarySelect]
    .forEach(el => el && el.classList.remove("field-missing"));
  (faltantes || []).forEach(f => f.el && f.el.classList.add("field-missing"));
}
// Muestra u oculta el aviso de campos faltantes dentro del modal de despacho manual.
function setManualDispatchHint(message, kind = "warn"){
  const hint = document.getElementById("manualDispatchHint");
  if (!hint) return;
  hint.classList.toggle("is-error", !!message && kind === "error");
  if (message) {
    hint.textContent = message;
    hint.classList.remove("hidden");
  } else {
    hint.textContent = "";
    hint.classList.add("hidden");
  }
}
if (btnManualDispatchConfirm) btnManualDispatchConfirm.onclick = () => {
  if (manualDispatchSending) return;
  const faltantes = getManualDispatchMissingFields();
  if (faltantes.length) {
    // Aviso visible dentro del formulario (no detras del modal) para guiar al usuario.
    setManualDispatchHint(`Para enviar el despacho debes seleccionar: ${faltantes.map(f => f.label).join(", ")}.`);
    paintManualDispatchMissing(faltantes);
    return; // mantiene el formulario abierto para que el usuario complete los datos
  }
  setManualDispatchHint("");
  paintManualDispatchMissing([]);
  closeManualDispatchModal(true);
};
if (btnManualDispatch) btnManualDispatch.onclick = () => handleManualDispatch();
// Si el aviso de faltantes esta visible, lo recalcula al completar campos.
function refreshManualDispatchHintIfVisible(){
  const hint = document.getElementById("manualDispatchHint");
  if (!hint || hint.classList.contains("hidden")) return;
  const faltantes = getManualDispatchMissingFields();
  setManualDispatchHint(faltantes.length ? `Para enviar el despacho debes seleccionar: ${faltantes.map(f => f.label).join(", ")}.` : "");
  paintManualDispatchMissing(faltantes);
}
if (manualDispatchInterno) manualDispatchInterno.addEventListener("change", () => { applyManualDispatchVehicleSelection(); refreshManualDispatchHintIfVisible(); });
if (manualDispatchInterno) manualDispatchInterno.addEventListener("input", () => { applyManualDispatchVehicleSelection(); refreshManualDispatchHintIfVisible(); openManualDispatchInternoPanel(); });
if (manualDispatchInterno) manualDispatchInterno.addEventListener("focus", openManualDispatchInternoPanel);
{
  const internoArrow = document.getElementById("manualDispatchInternoArrow");
  const internoPanel = document.getElementById("manualDispatchInternoPanel");
  const internoCombo = document.getElementById("manualDispatchInternoCombo");
  if (internoArrow) internoArrow.addEventListener("click", (ev) => {
    ev.preventDefault();
    const panel = document.getElementById("manualDispatchInternoPanel");
    if (panel && panel.classList.contains("hidden")) { openManualDispatchInternoPanel(); manualDispatchInterno?.focus(); }
    else { closeManualDispatchInternoPanel(); }
  });
  if (internoPanel) internoPanel.addEventListener("click", (ev) => {
    const opt = ev.target.closest(".combo-option");
    if (opt) pickManualDispatchInternoOption(opt);
  });
  if (manualDispatchInterno) manualDispatchInterno.addEventListener("keydown", (ev) => handleComboKeydown(ev, internoPanel, pickManualDispatchInternoOption));
  // Cerrar el panel al hacer click fuera del combo.
  document.addEventListener("click", (ev) => {
    if (internoCombo && !internoCombo.contains(ev.target)) closeManualDispatchInternoPanel();
  });
}
if (manualDispatchConductorName) manualDispatchConductorName.addEventListener("change", () => { applyManualDispatchConductorSelection(); refreshManualDispatchHintIfVisible(); });
if (manualDispatchConductorName) manualDispatchConductorName.addEventListener("input", () => { applyManualDispatchConductorSelection(); refreshManualDispatchHintIfVisible(); openManualDispatchConductorPanel(); });
if (manualDispatchConductorName) manualDispatchConductorName.addEventListener("focus", openManualDispatchConductorPanel);
{
  const conductorArrow = document.getElementById("manualDispatchConductorArrow");
  const conductorPanel = document.getElementById("manualDispatchConductorPanel");
  const conductorCombo = document.getElementById("manualDispatchConductorCombo");
  if (conductorArrow) conductorArrow.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (conductorPanel && conductorPanel.classList.contains("hidden")) { openManualDispatchConductorPanel(); manualDispatchConductorName?.focus(); }
    else { closeManualDispatchConductorPanel(); }
  });
  if (conductorPanel) conductorPanel.addEventListener("click", (ev) => {
    if (ev.target.closest(".combo-retry")) {
      // stopPropagation: el redibujado saca el boton del DOM y el click de "afuera" cerraria el panel.
      ev.stopPropagation();
      loadDriversFromCSV();
      return;
    }
    const opt = ev.target.closest(".combo-option");
    if (opt) pickManualDispatchConductorOption(opt);
  });
  if (manualDispatchConductorName) manualDispatchConductorName.addEventListener("keydown", (ev) => handleComboKeydown(ev, conductorPanel, pickManualDispatchConductorOption));
  document.addEventListener("click", (ev) => {
    if (conductorCombo && !conductorCombo.contains(ev.target)) closeManualDispatchConductorPanel();
  });
}
if (manualDispatchItinerarySelect) manualDispatchItinerarySelect.addEventListener("change", refreshManualDispatchHintIfVisible);
if (cancelDispatchModal) {
  cancelDispatchModal.addEventListener("click", (ev) => {
    if (ev.target === cancelDispatchModal) closeCancelDispatchModal(false);
  });
}
if (manualDispatchModal) {
  manualDispatchModal.addEventListener("click", (ev) => {
    if (ev.target === manualDispatchModal) closeManualDispatchModal(false);
  });
}
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && cancelDispatchModal && !cancelDispatchModal.classList.contains("hidden")) {
    closeCancelDispatchModal(false);
    return;
  }
  if (ev.key === "Enter" && cancelDispatchModal && !cancelDispatchModal.classList.contains("hidden") && ev.ctrlKey) {
    closeCancelDispatchModal(true);
    return;
  }
  if (ev.key === "Escape" && manualDispatchModal && !manualDispatchModal.classList.contains("hidden")) {
    closeManualDispatchModal(false);
    return;
  }
  if (ev.key === "Enter" && manualDispatchModal && !manualDispatchModal.classList.contains("hidden")) {
    // Enter envia igual que el boton (con validacion). En Observaciones es salto de linea.
    const tag = String(ev.target?.tagName || "").toUpperCase();
    if (tag === "TEXTAREA" || tag === "BUTTON" || manualDispatchSending) return;
    ev.preventDefault();
    btnManualDispatchConfirm?.click();
  }
});

/* ===================== DATA ===================== */
let rows = [];
let currentBase = "";
let driversCatalogRows = []; // [{dr_id, cedula, fleet, nombre, status, email, celular, base}]
let isLoadingDrivers = false;
let driversLoadPromise = null;
let driversLastLoadedAt = 0;
let driversLoadError = "";
let planillaAfiliadosRows = [];
let planillaAfiliadosLoading = false;
let planillaAfiliadosLoadedOnce = false;
let planillaLastLoadedAt = 0;
let planillaLastDeltaUpdatedAt = "";
let planillaDeltaCycles = 0;
let planillaRowsRevision = 0;
let planillaDispatchResolutionCache = {
  rowsRef: null,
  revision: -1,
  resolvedByKey: new Map()
};
let currentPlanillaTableName = PLANILLA_TABLE_NAME;
const PLANILLA_DELTA_SYNC_ENABLED = true;
const PLANILLA_FULL_SYNC_EVERY_DELTA_CYCLES = 20;
const PLANILLA_DELTA_LIMIT = 600;
/* ===================== UI ===================== */
const operativoPanel = document.getElementById("operativoPanel");
const operativoInner = document.getElementById("operativoInner");
const btnRefreshHistorialDespachos = document.getElementById("btnRefreshHistorialDespachos");
const historialDespachosSearch = document.getElementById("historialDespachosSearch");
const historialDespachosEstadoFilter = document.getElementById("historialDespachosEstadoFilter");
const historialDespachosRangeFilter = document.getElementById("historialDespachosRangeFilter");
const historialDespachosItinChips = document.getElementById("historialDespachosItinChips");
const historialInsights = document.getElementById("historialInsights");
const historialDespachosCount = document.getElementById("historialDespachosCount");
const historialDespachosStatus = document.getElementById("historialDespachosStatus");
const historialDespachosBody = document.getElementById("historialDespachosBody");
const mobileTabSwitcher = document.getElementById("mobileTabSwitcher");
const mobileTabSelect = document.getElementById("mobileTabSelect");
/* ===================== UTIL ===================== */
function norm(s){ return (s||"").toString().trim().toUpperCase(); }
function getBaseCanonical(value){
  const raw = String(value ?? "").trim().toUpperCase();
  if (!raw) return "";
  const m = raw.match(/^BASE\s*(\d+)$/i);
  if (m) return m[1];
  return raw;
}

function formatBaseLabel(value){
  const canonical = getBaseCanonical(value);
  if (/^\d+$/.test(canonical)) return `BASE ${canonical}`;
  return canonical;
}

function getCsvDriverBase(row){
  const rawEmail = String(row?.email || "").trim();
  const fromEmail = rawEmail.match(/BASE\s*(\d+)/i)?.[1] || "";
  const rawBase = String(row?.base || "").trim();
  const raw = fromEmail || rawBase;
  return getBaseCanonical(raw);
}

function escapeHtml(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function invalidatePlanillaDispatchResolutionCache(){
  planillaRowsRevision += 1;
  planillaDispatchResolutionCache.rowsRef = null;
  planillaDispatchResolutionCache.revision = -1;
  planillaDispatchResolutionCache.resolvedByKey = new Map();
}

function getPlanillaSelectColumnsForCurrentTable(){
  if (currentPlanillaTableName === PLANILLA_TABLE_NAME) {
    return PLANILLA_AFILIADOS_2_COLUMNS.join(",");
  }
  return "*";
}

async function fetchPlanillaOptionalColumn(columnName, rowIds){
  const col = String(columnName || "").trim();
  if (!col) return null;
  try {
    let query = planillaSupabaseClient
      .from(currentPlanillaTableName)
      .select(`id,${col}`)
      .limit(PLANILLA_DELTA_LIMIT);
    const ids = Array.isArray(rowIds) ? rowIds.map(v => String(v || "").trim()).filter(Boolean) : [];
    if (ids.length > 0) {
      query = query.in("id", ids);
    } else {
      query = query.order("hora_llegada", { ascending: false, nullsFirst: false });
    }
    const { data, error } = await query;
    if (error) return null;
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return null;
  }
}

async function enrichPlanillaRowsWithOptionalColumns(rowsInput, rowIds){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  if (!rows.length) return rows;
  const byId = new Map();
  rows.forEach(row => {
    const id = row?.id;
    if (id !== undefined && id !== null) byId.set(String(id), row);
  });
  const ids = Array.isArray(rowIds) ? rowIds : [];
  for (const col of PLANILLA_OPTIONAL_REG_ID_COLUMNS) {
    const data = await fetchPlanillaOptionalColumn(col, ids);
    if (!Array.isArray(data) || !data.length) continue;
    data.forEach(item => {
      const id = item?.id;
      if (id === undefined || id === null) return;
      const row = byId.get(String(id));
      if (!row) return;
      const value = String(item?.[col] || "").trim();
      if (!value) return;
      setRowDispatchRegId(row, value);
    });
  }
  return rows;
}

function getPlanillaRowUpdatedAtValue(row){
  return String(row?.updated_at || row?.created_at || "").trim();
}

function getMaxPlanillaUpdatedAt(rowsInput, fallbackValue = ""){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  let maxValue = String(fallbackValue || "").trim();
  rows.forEach(row => {
    const value = getPlanillaRowUpdatedAtValue(row);
    if (!value) return;
    if (!maxValue || value > maxValue) maxValue = value;
  });
  return maxValue;
}

function mergePlanillaRowsById(baseRowsInput, deltaRowsInput){
  const baseRows = Array.isArray(baseRowsInput) ? baseRowsInput : [];
  const deltaRows = Array.isArray(deltaRowsInput) ? deltaRowsInput : [];
  if (!deltaRows.length) return baseRows.slice();
  const merged = baseRows.slice();
  const indexById = new Map();
  const indexByCruceKey = new Map();
  merged.forEach((row, idx) => {
    const id = row?.id;
    const cruce = String(row?.cruce_key || "").trim();
    if (id !== undefined && id !== null) indexById.set(String(id), idx);
    if (cruce) indexByCruceKey.set(cruce, idx);
  });
  deltaRows.forEach(delta => {
    const id = delta?.id;
    const cruce = String(delta?.cruce_key || "").trim();
    let idx = -1;
    if (id !== undefined && id !== null && indexById.has(String(id))) {
      idx = indexById.get(String(id));
    } else if (cruce && indexByCruceKey.has(cruce)) {
      idx = indexByCruceKey.get(cruce);
    }
    if (idx >= 0) {
      merged[idx] = delta;
      return;
    }
    merged.push(delta);
    const newIndex = merged.length - 1;
    if (id !== undefined && id !== null) indexById.set(String(id), newIndex);
    if (cruce) indexByCruceKey.set(cruce, newIndex);
  });
  return merged;
}

function parsePlanillaDateTime(value){
  const raw = String(value || "").trim();
  if (!raw) return null;

  // 1) Formatos tipo ISO: yyyy-mm-dd hh:mm[:ss[.ms]] o con T.
  const normalizedIsoLike = raw.includes("T") ? raw : raw.replace(" ", "T");
  let date = new Date(normalizedIsoLike);
  if (!Number.isNaN(date.getTime())) return date;

  // 2) Formatos latinos: dd/mm/yyyy hh:mm[:ss]
  const latin = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
  );
  if (latin) {
    const dd = Number(latin[1]);
    const mm = Number(latin[2]);
    const yyyy = Number(latin[3]);
    const hh = Number(latin[4] || 0);
    const mi = Number(latin[5] || 0);
    const ss = Number(latin[6] || 0);
    date = new Date(yyyy, Math.max(0, mm - 1), dd, hh, mi, ss);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

function comparePlanillaRowsByCurrentDateTime(a, b){
  const now = new Date();
  const aDate = getLlegadaDateForMatching(a) || parsePlanillaDateTime(a?.hora_despacho);
  const bDate = getLlegadaDateForMatching(b) || parsePlanillaDateTime(b?.hora_despacho);
  if (!aDate && !bDate) return 0;
  if (!aDate) return 1;
  if (!bDate) return -1;

  const aIsToday = isSameLocalDate(aDate, now);
  const bIsToday = isSameLocalDate(bDate, now);
  if (aIsToday !== bIsToday) return aIsToday ? -1 : 1;

  if (aIsToday && bIsToday) {
    const aDiff = Math.abs(aDate.getTime() - now.getTime());
    const bDiff = Math.abs(bDate.getTime() - now.getTime());
    if (aDiff !== bDiff) return aDiff - bDiff;
  }

  return bDate.getTime() - aDate.getTime();
}

function getLlegadaDateForMatching(row){
  return parsePlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.created_at);
}

function getLlegadaReferenceDate(row){
  return parsePlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.created_at);
}

function getSonarItineraryById(itineraryId){
  const id = String(itineraryId || "").trim();
  if (!id) return null;
  return SONAR_ITINERARIES.find(item => String(item.id) === id) || null;
}

function getRowDispatchRegId(row){
  const source = row && typeof row === "object" ? row : {};
  const candidates = [
    source.reg_id,
    source.regid,
    source.regId
  ];
  for (const item of candidates) {
    const value = String(item || "").trim();
    if (value) return value;
  }
  return "";
}

function setRowDispatchRegId(row, regId){
  if (!row || typeof row !== "object") return;
  const value = String(regId || "").trim();
  if (!value) return;
  row.reg_id = value;
  row.regid = value;
  row.regId = value;
}

function extractDispatchRegId(result){
  const candidates = [
    result?.data?.regId,
    result?.regId,
    result?.data?.regid,
    result?.regid
  ];
  for (const item of candidates) {
    const value = String(item || "").trim();
    if (value) return value;
  }
  return "";
}

function normalizeDriverName(value){
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findDriverIdByName(driverName, base){
  const raw = String(driverName || "").trim();
  if (!raw) return "";
  const enabledRows = (driversCatalogRows || []).filter(row => String(row?.status || "").trim().toUpperCase() === "ENABLED");
  const directById = enabledRows.find(row => String(row?.dr_id || "").trim() === raw);
  if (directById?.dr_id) return String(directById.dr_id).trim();
  const nameKey = normalizeDriverName(raw);
  const baseCanonical = getBaseCanonical(base || "");
  const exactInBase = enabledRows.find(row => normalizeDriverName(row?.nombre) === nameKey && (!baseCanonical || getCsvDriverBase(row) === baseCanonical));
  if (exactInBase?.dr_id) return String(exactInBase.dr_id).trim();
  const exactAny = enabledRows.find(row => normalizeDriverName(row?.nombre) === nameKey);
  if (exactAny?.dr_id) return String(exactAny.dr_id).trim();
  return "";
}

const MAX_CANCEL_AGE_MIN = 60;

function getMinutesSince(dateLike){
  if (!dateLike) return null;
  const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return (Date.now() - d.getTime()) / 60000;
}

async function persistDispatchOnPlanillaRow(row, payload){
  const rowId = row?.id;
  if (!rowId) return;
  const patch = {
    estado: "Despachado",
    hora_despacho: payload?.horaDespachoIso || new Date().toISOString(),
    observaciones: payload.observaciones ?? row?.observaciones ?? "",
    driver_id: payload.drvId || row?.driver_id || null
  };
  if (payload?.itineraryLabel) patch.itinerario_despacho = payload.itineraryLabel;
  const { error } = await planillaSupabaseClient
    .from(currentPlanillaTableName)
    .update(patch)
    .eq("id", rowId);
  if (error) throw error;
  const regId = String(payload?.dispatchRegId || payload?.regId || "").trim();
  if (regId) {
    const persistedColumn = await persistPlanillaRegIdByKnownColumns(rowId, regId);
    if (!persistedColumn) {
      throw new Error("No existe columna reg_id/regid/regId para guardar regId.");
    }
  }
}

async function persistPlanillaRegIdByKnownColumns(rowId, regId){
  const id = rowId;
  const value = String(regId || "").trim();
  if (!id || !value) return "";
  for (const columnName of PLANILLA_OPTIONAL_REG_ID_COLUMNS) {
    const patch = { [columnName]: value };
    const { error } = await planillaSupabaseClient
      .from(currentPlanillaTableName)
      .update(patch)
      .eq("id", id);
    if (!error) return columnName;
  }
  return "";
}

async function persistCancelOnPlanillaRow(row, payload){
  const rowId = row?.id;
  if (!rowId) return;
  const patch = {
    hora_despacho: null,
    estado: "En espera",
    itinerario_despacho: null
  };
  if (payload?.driverId) patch.driver_id = payload.driverId;
  const { error } = await planillaSupabaseClient
    .from(currentPlanillaTableName)
    .update(patch)
    .eq("id", rowId);
  if (error) throw error;
}

async function clearPlanillaDispatchByRegIdInDb(regId){
  const value = String(regId || "").trim();
  if (!value) return false;
  for (const col of PLANILLA_OPTIONAL_REG_ID_COLUMNS) {
    try {
      const { data, error } = await planillaSupabaseClient
        .from(currentPlanillaTableName)
        .update({
          hora_despacho: null,
          estado: "En espera",
          itinerario_despacho: null
        })
        .eq(col, value)
        .select("id");
      if (error) continue;
      if (Array.isArray(data) && data.length > 0) return true;
    } catch (_) { /* prueba siguiente columna */ }
  }
  return false;
}

/* ============ Registro en despachos_realizados ============ */
const DESPACHOS_REALIZADOS_TABLE = "despachos_realizados";

function getPlacaForMidLocal(mid){
  const m = String(mid || "").trim().toUpperCase();
  if (!m) return "";
  const rows = Array.isArray(vehiculosSonarRows) ? vehiculosSonarRows : [];
  const found = rows.find(r => String(r?.mid || "").trim().toUpperCase() === m);
  return String(found?.placa || "").trim();
}

async function insertDespachoRealizado(payload, dispatchResult, row){
  if (!currentUserId) return null;
  const regId = String(
    payload?.dispatchRegId || extractDispatchRegId(dispatchResult) || ""
  ).trim();
  if (!regId) {
    console.warn("[despachos_realizados] No se extrajo reg_id; no se inserta.");
    return null;
  }
  const pasajerosNum = parseInt(String(row?.pasajeros ?? "").trim(), 10);
  const record = {
    reg_id: regId,
    vehicle_id: String(payload?.mId || "").trim().toUpperCase(),
    interno: String(payload?.interno || row?.interno || "").trim(),
    placa: getPlacaForMidLocal(payload?.mId),
    itinerario_id: String(payload?.itinerary || "").trim(),
    itinerario: String(payload?.itineraryLabel || "").trim(),
    driver_id: String(payload?.drvId || "").trim(),
    observaciones: String(payload?.observaciones || "").trim(),
    pasajeros: Number.isFinite(pasajerosNum) ? pasajerosNum : 0,
    estado: "ACTIVO",
    created_by: currentUserId,
  };
  try {
    const { data, error } = await planillaSupabaseClient
      .from(DESPACHOS_REALIZADOS_TABLE)
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`[${DESPACHOS_REALIZADOS_TABLE}] Insert fallo:`, err);
    showToast(
      `Despacho enviado, pero no se registro en ${DESPACHOS_REALIZADOS_TABLE}: ${err?.message || err}`,
      "warn"
    );
    return null;
  }
}

async function markDespachoRealizadoAsCanceled(regId, cancelResponse){
  const id = String(regId || "").trim();
  if (!id) return;
  try {
    const { error } = await planillaSupabaseClient
      .from(DESPACHOS_REALIZADOS_TABLE)
      .update({
        estado: "CANCELADO",
        cancelled_at: new Date().toISOString(),
        cancel_response: cancelResponse ?? null,
      })
      .eq("reg_id", id);
    if (error) throw error;
  } catch (err) {
    console.error(`[${DESPACHOS_REALIZADOS_TABLE}] Update cancel fallo:`, err);
    showToast(
      `Cancelacion enviada, pero no se reflejo en ${DESPACHOS_REALIZADOS_TABLE}: ${err?.message || err}`,
      "warn"
    );
  }
}

async function sendDispatchToSonar(payload){
  const response = await fetch(SONAR_DISPATCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SONAR_DISPATCH_KEY,
      Authorization: `Bearer ${SONAR_DISPATCH_KEY}`
    },
    body: JSON.stringify(payload)
  });
  const raw = await response.text();
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch (e) {
    parsed = null;
  }
  if (!response.ok) {
    throw new Error(parsed?.message || `HTTP ${response.status}`);
  }
  if (parsed && parsed.success === false) {
    throw new Error(String(parsed?.message || "sonar-dispatch rechazo la solicitud"));
  }
  return parsed ?? { success: true, raw };
}

async function sendCancelDispatchToSonar(payload){
  const response = await fetch(SONAR_CANCEL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SONAR_CANCEL_KEY,
      Authorization: `Bearer ${SONAR_CANCEL_KEY}`
    },
    body: JSON.stringify(payload)
  });
  const raw = await response.text();
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch (e) {
    parsed = null;
  }
  if (!response.ok) {
    throw new Error(parsed?.message || `HTTP ${response.status}`);
  }
  if (parsed && parsed.success === false) {
    throw new Error(String(parsed?.message || "sonar-cancel rechazo la solicitud"));
  }
  return parsed ?? { success: true, raw };
}

function findPlanillaRowForManualDispatch(payload){
  const rowsList = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  const mid = String(payload?.mId || "").trim();
  const interno = String(payload?.interno || "").trim();
  const matches = rowsList.filter(row => {
    const rowMid = String(row?.mid || "").trim();
    const rowInterno = String(row?.interno || "").trim();
    if (mid && rowMid && rowMid === mid) return true;
    if (interno && rowInterno && rowInterno === interno) return true;
    return false;
  });
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const da = getLlegadaReferenceDate(a);
    const db = getLlegadaReferenceDate(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.getTime() - da.getTime();
  });
  return matches[0];
}

async function handleManualDispatch(){
  // Si el formulario ya esta abierto (o enviando), no se reinicia.
  if (manualDispatchSending || (manualDispatchModal && !manualDispatchModal.classList.contains("hidden"))) return;
  let form = await openManualDispatchModal();
  while (form?.confirmed) {
    const payload = {
      mId: form.mId,
      drvId: form.drvId,
      itinerary: form.itinerary,
      observaciones: form.observaciones,
      interno: form.interno,
      base: form.base || String(getManualDispatchDefaultBase() || "").trim(),
      conductorName: form.conductorName
    };
    const faltantes = getManualDispatchMissingFields();
    if (faltantes.length) {
      setManualDispatchHint(`Para enviar el despacho debes seleccionar: ${faltantes.map(f => f.label).join(", ")}.`);
      paintManualDispatchMissing(faltantes);
      form = await waitManualDispatchSubmit();
      continue;
    }
    payload.itineraryLabel = String(getSonarItineraryById(payload.itinerary)?.nombre || payload.itinerary);
    setManualDispatchHint("");
    setManualDispatchSending(true);
    // La planilla debe estar al dia para encontrar la llegada del vehiculo que se despacha.
    await ensureFreshPlanilla();
    let result;
    try {
      result = await sendDispatchToSonar(payload);
    } catch (error) {
      setManualDispatchSending(false);
      setManualDispatchHint(`No se pudo enviar el despacho: ${error?.message || "fallo en sonar-dispatch"}. Revisa los datos e intenta de nuevo.`, "error");
      form = await waitManualDispatchSubmit();
      continue;
    }
    // Sonar ya acepto el despacho: desde aqui no se vuelve a enviar (evita despachos duplicados).
    setManualDispatchSending(false);
    hideManualDispatchModal();
    await completeManualDispatch(payload, result);
    return;
  }
}

// Pasos despues de que Sonar acepto el despacho: historial, planilla y paso al Historial.
async function completeManualDispatch(payload, result){
  let shouldReloadFromDb = false;
  try {
    const row = findPlanillaRowForManualDispatch(payload);
    const dispatchRegId = extractDispatchRegId(result);
    if (dispatchRegId) payload.dispatchRegId = dispatchRegId;
    const nowIso = new Date().toISOString();
    payload.horaDespachoIso = nowIso;
    insertDespachoRealizado(payload, result, row).catch(() => {});
    if (row) {
      if (dispatchRegId) setRowDispatchRegId(row, dispatchRegId);
      row.driver_id = payload.drvId;
      row.estado = "Despachado";
      row.hora_despacho = nowIso;
      if (payload.itineraryLabel) row.itinerario_despacho = payload.itineraryLabel;
      invalidatePlanillaDispatchResolutionCache();
      try {
        await persistDispatchOnPlanillaRow(row, payload);
        shouldReloadFromDb = true;
      } catch (persistErr) {
        console.error("No se pudo persistir despacho manual en planilla:", persistErr);
        showToast("Despacho manual enviado, pero no se guardo en planilla.", "warn");
      }
    }
    showToast(`Despacho manual enviado${dispatchRegId ? ` (regId ${dispatchRegId})` : ""}.`, "ok");
    notifyDispatchServerSyncDelay();
  } catch (error) {
    console.error("Despacho enviado a Sonar; fallo un paso posterior:", error);
    showToast(`Despacho enviado, pero fallo un paso posterior: ${error?.message || "error"}`, "warn");
  }
  if (shouldReloadFromDb) {
    await loadPlanillaAfiliadosFromSupabase();
  }
  goToHistorialDespachosAfterDispatch();
}

// Navega a la pestana Historial despachos y la refresca tras un despacho manual exitoso.
function goToHistorialDespachosAfterDispatch(){
  openTabById('historial-despachos');
  if (typeof loadDespachosRealizadosFromSupabase === "function") {
    loadDespachosRealizadosFromSupabase();
  }
}

function getActiveTabId(){
  return document.querySelector(".tab.active")?.getAttribute("data-tab") || "";
}

function refreshMobileTabSwitcher(){
  if (!mobileTabSelect) return;
  const visibleTabs = Array.from(document.querySelectorAll(".tab[data-tab]"))
    .filter(tab => !tab.classList.contains("hidden"));
  const currentValue = String(mobileTabSelect.value || "");
  const activeId = getActiveTabId();
  mobileTabSelect.innerHTML = "";
  visibleTabs.forEach(tab => {
    const tabId = String(tab.getAttribute("data-tab") || "");
    if (!tabId) return;
    const option = document.createElement("option");
    option.value = tabId;
    option.textContent = String(tab.textContent || tabId).trim();
    mobileTabSelect.appendChild(option);
  });
  const preferred = visibleTabs.some(tab => String(tab.getAttribute("data-tab") || "") === activeId)
    ? activeId
    : currentValue;
  if (preferred && Array.from(mobileTabSelect.options).some(op => op.value === preferred)) {
    mobileTabSelect.value = preferred;
  } else if (mobileTabSelect.options.length > 0) {
    mobileTabSelect.value = mobileTabSelect.options[0].value;
  }
  mobileTabSelect.disabled = mobileTabSelect.options.length === 0;
  if (mobileTabSwitcher) mobileTabSwitcher.classList.toggle("hidden", mobileTabSelect.options.length === 0);
}

function openTabById(tabId){
  const id = String(tabId || "").trim();
  if (!id) return;
  const target = Array.from(document.querySelectorAll(".tab[data-tab]"))
    .find(tab => String(tab.getAttribute("data-tab") || "") === id && !tab.classList.contains("hidden"));
  if (!target) return;
  target.click();
}

async function loadPlanillaAfiliadosFromSupabase(options = {}){
  if (planillaAfiliadosLoading) return;
  if (!currentUserId) return;
  const forceFull = !!options.forceFull;
  currentPlanillaTableName = PLANILLA_TABLE_NAME;
  planillaAfiliadosLoading = true;
  try {
    const selectColumns = getPlanillaSelectColumnsForCurrentTable();
    const canUseDelta = PLANILLA_DELTA_SYNC_ENABLED
      && planillaAfiliadosLoadedOnce
      && !!planillaLastDeltaUpdatedAt
      && !forceFull
      && planillaDeltaCycles < PLANILLA_FULL_SYNC_EVERY_DELTA_CYCLES;
    let fetchedRows = [];
    let modeLabel = "full";

    if (canUseDelta) {
      modeLabel = "delta";
      const { data, error } = await planillaSupabaseClient
        .from(currentPlanillaTableName)
        .select(selectColumns)
        .gt("updated_at", planillaLastDeltaUpdatedAt)
        .order("updated_at", { ascending: true })
        .limit(PLANILLA_DELTA_LIMIT);
      if (error) {
        console.warn("Delta sync fallo, se usa full sync:", error);
        modeLabel = "full";
      } else {
        fetchedRows = Array.isArray(data) ? data : [];
      }
    }

    if (modeLabel === "full") {
      const { data, error } = await planillaSupabaseClient
        .from(currentPlanillaTableName)
        .select(selectColumns)
        .order("hora_llegada", { ascending: false, nullsFirst: false })
        .limit(PLANILLA_DELTA_LIMIT);
      if (error) throw error;
      fetchedRows = Array.isArray(data) ? data : [];
      planillaAfiliadosRows = fetchedRows;
      await enrichPlanillaRowsWithOptionalColumns(planillaAfiliadosRows);
      planillaDeltaCycles = 0;
    } else {
      if (fetchedRows.length > 0) {
        const deltaIds = fetchedRows.map(row => row?.id).filter(v => v !== undefined && v !== null);
        planillaAfiliadosRows = mergePlanillaRowsById(planillaAfiliadosRows, fetchedRows);
        await enrichPlanillaRowsWithOptionalColumns(planillaAfiliadosRows, deltaIds);
      }
      planillaDeltaCycles += 1;
    }

    planillaLastDeltaUpdatedAt = getMaxPlanillaUpdatedAt(planillaAfiliadosRows, planillaLastDeltaUpdatedAt);
    invalidatePlanillaDispatchResolutionCache();
    planillaAfiliadosLoadedOnce = true;
    planillaLastLoadedAt = Date.now();
  } catch (error) {
    console.error(`Error cargando ${currentPlanillaTableName}:`, error);
    showToast(`No se pudo cargar ${currentPlanillaTableName} desde Supabase.`, "err");
  } finally {
    planillaAfiliadosLoading = false;
  }
}

const VEHICLE_TO_BASE_MAP = {
  "703":"BASE 4","705":"BASE 4","707":"BASE 4","708":"BASE 5","709":"BASE 3",
  "714":"BASE 3","715":"BASE 4","710":"BASE 3","717":"BASE 4","718":"BASE 3",
  "719":"BASE 2","720":"BASE 3","721":"BASE 4","722":"BASE 3","723":"BASE 3",
  "724":"BASE 3","725":"BASE 4","726":"BASE 3","727":"BASE 3","728":"BASE 4",
  "729":"BASE 1","730":"BASE 1","731":"BASE 4","732":"BASE 1","733":"BASE 5",
  "734":"BASE 3","735":"BASE 4","736":"BASE 8","737":"BASE 3","738":"BASE 3",
  "739":"BASE 3","740":"BASE 3","741":"BASE 3","742":"BASE 3","743":"BASE 3",
  "744":"BASE 3","745":"BASE 3","746":"BASE 4","747":"BASE 5","748":"BASE 2",
  "749":"BASE 2","750":"BASE 3","751":"BASE 3","752":"BASE 3","753":"BASE 3",
  "754":"BASE 3","755":"BASE 3","756":"BASE 8","757":"BASE 5","758":"BASE 3",
  "759":"BASE 6","15":"BASE 5","17":"BASE 3","59":"BASE 5","64":"BASE 5",
  "89":"BASE 5","100":"BASE 5","157":"BASE 5","163":"BASE 5","211":"BASE 5",
  "232":"BASE 5","507":"BASE 3","510":"BASE 3",
  "764":"BASE 0","766":"BASE 0","767":"BASE 0","768":"BASE 0","769":"BASE 0"
};

function getBaseLabelForInterno(interno){
  const key = String(interno || "").trim();
  if (!key) return "";
  return VEHICLE_TO_BASE_MAP[key] || "";
}

function getBaseNumForInterno(interno){
  const label = getBaseLabelForInterno(interno);
  const m = String(label).match(/(\d+)/);
  return m ? m[1] : "";
}

/* ===================== CARGAR CONDUCTORES DESDE CSV ===================== */
const DRIVERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThNrFZLbNklMFtPeg0wF4TA1vZHnZ4YNMmGcnHfty_RoNuAQw__iV2GMXqTsv36MPiks1ARpYui1JK/pub?gid=0&single=true&output=csv';
const DRIVERS_REFRESH_MAX_AGE_MS = 5 * 60 * 1000;
const DRIVERS_LOAD_ATTEMPTS = 3;
const DRIVERS_RETRY_DELAY_MS = 1500;

// Parser CSV minimo que respeta comillas (campos con comas o saltos de linea dentro).
function parseCsvText(text, delimiter = ","){
  const rowsOut = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rowsOut.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rowsOut.push(row);
  }
  return rowsOut.filter(r => r.some(v => String(v).trim() !== ""));
}

async function fetchDriversCsvText(){
  let lastError = null;
  for (let attempt = 1; attempt <= DRIVERS_LOAD_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(DRIVERS_CSV_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      console.warn(`[conductores] Intento ${attempt}/${DRIVERS_LOAD_ATTEMPTS} fallo:`, error);
      if (attempt < DRIVERS_LOAD_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, DRIVERS_RETRY_DELAY_MS * attempt));
      }
    }
  }
  throw lastError;
}

// Recarga el catalogo si esta vacio o tiene mas de DRIVERS_REFRESH_MAX_AGE_MS
// (la app queda abierta horas en el celular y la hoja cambia durante el dia).
function ensureDriversCatalogFresh(){
  const stale = !driversLastLoadedAt || (Date.now() - driversLastLoadedAt) > DRIVERS_REFRESH_MAX_AGE_MS;
  if (!stale && driversCatalogRows.length) return Promise.resolve(true);
  return loadDriversFromCSV();
}

// Si ya hay una carga en curso devuelve esa misma promesa, para que quien espera reciba el resultado.
// Si la descarga falla se conserva el catalogo anterior.
function loadDriversFromCSV() {
  if (!driversLoadPromise) {
    driversLoadPromise = loadDriversFromCSVOnce().finally(() => { driversLoadPromise = null; });
  }
  return driversLoadPromise;
}

async function loadDriversFromCSVOnce() {
  isLoadingDrivers = true;
  renderManualDispatchConductorPanel();

  try {
    const csvText = await fetchDriversCsvText();
    const delimiter = (csvText.split('\n')[0] || "").includes('\t') ? '\t' : ',';
    const lines = parseCsvText(csvText, delimiter);
    const headers = (lines[0] || []).map(h => String(h).replace(/^\uFEFF/, "").trim());

    const drIdIdx = headers.findIndex(h => norm(h) === 'DR_ID');
    const cedulaIdx = headers.findIndex(h => norm(h) === 'CEDULA');
    const fleetIdx = headers.findIndex(h => norm(h) === 'FLEET');
    const nombreIdx = headers.findIndex(h => norm(h) === 'NOMBRE');
    const emailIdx = headers.findIndex(h => norm(h) === 'EMAIL');
    const statusIdx = headers.findIndex(h => norm(h) === 'STATUS');
    const celularIdx = headers.findIndex(h => norm(h) === 'CELULAR');
    if (drIdIdx === -1 || nombreIdx === -1) {
      throw new Error("el CSV no trae las columnas dr_id y nombre");
    }

    const newDriversCatalogRows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i];
      const drId = drIdIdx !== -1 ? String(values[drIdIdx] || "").trim() : "";
      const cedula = cedulaIdx !== -1 ? String(values[cedulaIdx] || "").trim() : "";
      const fleet = fleetIdx !== -1 ? String(values[fleetIdx] || "").trim() : "";
      const nombre = values[nombreIdx]?.trim() || '';
      const email = values[emailIdx]?.trim() || '';
      const status = statusIdx !== -1 ? values[statusIdx]?.trim().toUpperCase() : 'ENABLED';
      const celular = celularIdx !== -1 ? String(values[celularIdx] || "").trim() : "";
      const base = getBaseCanonical(email.match(/BASE\s*(\d+)/i)?.[1] || "");
      if (drId || nombre || cedula) {
        newDriversCatalogRows.push({
          dr_id: drId,
          cedula,
          fleet,
          nombre,
          status,
          email,
          celular,
          base
        });
      }
    }

    driversCatalogRows = newDriversCatalogRows;
    driversLastLoadedAt = Date.now();
    driversLoadError = "";
    return true;
  } catch (error) {
    console.error('Error cargando conductores:', error);
    driversLoadError = error?.message || "consulta fallida";
    if (driversCatalogRows.length) {
      showToast(`No se pudo actualizar la lista de conductores (${driversLoadError}). Se usa la ultima cargada.`, "warn");
    }
    return false;
  } finally {
    isLoadingDrivers = false;
    renderManualDispatchConductorPanel();
    if (manualDispatchModal && !manualDispatchModal.classList.contains("hidden")) {
      suggestManualDispatchConductor();
      applyManualDispatchConductorSelection();
    }
  }
}

/* ===================== PESTANAS ===================== */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Desactivar todas las pestanas
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Activar la pestana seleccionada
    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab');
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    if (tabId === 'despacho-manual') handleManualDispatch();
    if (tabId === 'historial-despachos') {
      if (!historialDespachosLastLoadedAt) loadDespachosRealizadosFromSupabase();
      // llegadas_104 alimenta los indicadores del historial ("sin despachar")
      if (!mapaVehiculosLastLoadedAt) loadMapaVehiculos();
      if (!vehiculosSonarLoadedOnce) loadVehiculosSonarFromSupabase().then(() => renderHistorialInsights());
    }
    refreshMobileTabSwitcher();
  });
});

function bindUIEvents(){
  // Historial despachos
  if (btnRefreshHistorialDespachos) btnRefreshHistorialDespachos.addEventListener("click", () => loadDespachosRealizadosFromSupabase());
  if (historialDespachosSearch) historialDespachosSearch.addEventListener("input", renderHistorialDespachosTab);
  if (historialDespachosEstadoFilter) historialDespachosEstadoFilter.addEventListener("change", () => {
    historialDespachosItinFilter = "";
    renderHistorialDespachosTab();
  });
  if (historialDespachosRangeFilter) historialDespachosRangeFilter.addEventListener("change", () => loadDespachosRealizadosFromSupabase());
  if (historialDespachosItinChips) historialDespachosItinChips.addEventListener("click", handleHistorialDespachosChipClick);
  if (historialDespachosBody) {
    historialDespachosBody.addEventListener("change", handleHistorialDespachosBodyChange);
    historialDespachosBody.addEventListener("keydown", handleHistorialDespachosBodyKeydown);
    historialDespachosBody.addEventListener("click", handleHistorialDespachosBodyClick);
  }

  // Realizar despacho (pestana)
  const btnOpenManualDispatchForm = document.getElementById("btnOpenManualDispatchForm");
  if (btnOpenManualDispatchForm) btnOpenManualDispatchForm.addEventListener("click", () => handleManualDispatch());

  // Mobile tabs
  if (mobileTabSelect) {
    mobileTabSelect.addEventListener("change", () => {
      openTabById(mobileTabSelect.value);
    });
  }
}

// ==================== INIT ====================
async function initializeApp(){
  await loadDriversFromCSV();
  await loadVehiculosSonarFromSupabase();
  // La planilla (llegadas) se usa para marcar como despachada la llegada del vehiculo al despachar.
  await loadPlanillaAfiliadosFromSupabase();
  if (operativoPanel) operativoPanel.classList.remove("hidden");
  if (operativoInner) operativoInner.classList.remove("hidden");
  refreshMobileTabSwitcher();
}
