const SUPABASE_URL = "https://jtnlcckphveeqhyrxlku.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_khOBBj9EIe2Ahmkz_KxVUw_R-SDOpk0";
const PLANILLA_SUPABASE_URL = "https://cbplebkmxrkaafqdhiyi.supabase.co";
const PLANILLA_SUPABASE_ANON_KEY = "sb_publishable_DZCceNTENY4ViP17-eZrGg_bdMElZ9X";
const SONAR_DISPATCH_URL = "https://cbplebkmxrkaafqdhiyi.supabase.co/functions/v1/sonar-dispatch";
const SONAR_DISPATCH_KEY = PLANILLA_SUPABASE_ANON_KEY;
const SONAR_CANCEL_URL = "https://cbplebkmxrkaafqdhiyi.supabase.co/functions/v1/sonar-cancel";
const SONAR_CANCEL_KEY = PLANILLA_SUPABASE_ANON_KEY;
const OUT_OF_LIST_WEBHOOK_URL = "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjEwNTY4MDYzMDA0MzQ1MjZjNTUzMiI_3D_pc/IjU3NjcwNTZlMDYzNjA0MzI1MjY0NTUzMDUxMzQi_pc";
const PLANILLA_OPTIONAL_REG_ID_COLUMNS = ["reg_id", "regid", "regId"];
const SONAR_ITINERARIES = [
  { id: "3385", grupo: "AEROPUERTO", nombre: "Aeropuerto-San Diego-Tunel" },
  { id: "3387", grupo: "NUTIBARA", nombre: "Nutibara-Aeropuerto-Autopista" },
  { id: "3394", grupo: "NUTIBARA", nombre: "Nutibara-Aeropuerto-Variante Palmas" },
  { id: "3395", grupo: "SANDIEGO", nombre: "San Diego-Aeropuerto-Variante Palmas" },
  { id: "4413", grupo: "AEROPUERTO", nombre: "Aeropuerto-Exposiciones" },
  { id: "4501", grupo: "AEROPUERTO", nombre: "Aeropuerto-autopista-terminalnorte" },
  { id: "4502", grupo: "EXPOSICIONES", nombre: "Nutibara-exposiciones-tunel-aeropuerto" },
  { id: "4503", grupo: "AEROPUERTO", nombre: "Aeropuerto-Tunel-Exposiciones-Nutibara" },
  { id: "4504", grupo: "SANDIEGO", nombre: "ccsandiego-tunel-aeropuerto" },
  { id: "4505", grupo: "SANDIEGO", nombre: "Almacentro-Tunel-Aeropuerto" }
];
const PLANILLA_TABLE_NAME = "planilla_afiliados_2";
const VEHICULOS_SONAR_TABLE_NAME = "vehiculossonar";
const PLANILLA_TABLE_SOURCE_STORAGE_KEY = "planilla_table_source";
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
const SUPER_ADMIN_EMAIL = "administrador@combuses.com.co";
const BASE_USER_EMAIL_RE = /^base\s*([0-9]+)@combuses\.com\.co$/i;
const ALLOW_PUBLIC_SIGNUP = false;
if (!window.XLSX) {
  throw new Error("No cargo XLSX. Verifica conexion a internet o ruta del script.");
}
if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error("No cargo Supabase JS. Verifica conexion a internet o ruta del script.");
}
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
const swapModal = document.getElementById("swapModal");
const swapSourceLabelEl = document.getElementById("swapSourceLabel");
const swapTargetLabelEl = document.getElementById("swapTargetLabel");
const swapSourceVehEl = document.getElementById("swapSourceVeh");
const swapTargetVehEl = document.getElementById("swapTargetVeh");
const btnSwapCancel = document.getElementById("btnSwapCancel");
const btnSwapConfirm = document.getElementById("btnSwapConfirm");
const noteModal = document.getElementById("noteModal");
const noteModalTitleEl = document.getElementById("noteModalTitle");
const noteModalSub = document.getElementById("noteModalSub");
const noteModalInput = document.getElementById("noteModalInput");
const btnNoteClear = document.getElementById("btnNoteClear");
const btnNoteCancel = document.getElementById("btnNoteCancel");
const btnNoteSave = document.getElementById("btnNoteSave");
const dispatchModal = document.getElementById("dispatchModal");
const dispatchModalInterno = document.getElementById("dispatchModalInterno");
const dispatchModalBase = document.getElementById("dispatchModalBase");
const dispatchModalMid = document.getElementById("dispatchModalMid");
const dispatchModalDriverSelect = document.getElementById("dispatchModalDriverSelect");
const dispatchModalItinerarySelect = document.getElementById("dispatchModalItinerarySelect");
const dispatchModalObs = document.getElementById("dispatchModalObs");
const dispatchModalPreop = document.getElementById("dispatchModalPreop");
const btnDispatchCancel = document.getElementById("btnDispatchCancel");
const btnDispatchConfirm = document.getElementById("btnDispatchConfirm");
const cancelDispatchModal = document.getElementById("cancelDispatchModal");
const cancelDispatchModalInterno = document.getElementById("cancelDispatchModalInterno");
const cancelDispatchModalBase = document.getElementById("cancelDispatchModalBase");
const cancelDispatchModalMid = document.getElementById("cancelDispatchModalMid");
const cancelDispatchModalRegId = document.getElementById("cancelDispatchModalRegId");
const cancelDispatchModalHora = document.getElementById("cancelDispatchModalHora");
const cancelDispatchModalComments = document.getElementById("cancelDispatchModalComments");
const btnCancelDispatchCancel = document.getElementById("btnCancelDispatchCancel");
const btnCancelDispatchConfirm = document.getElementById("btnCancelDispatchConfirm");
const removeFromListModal = document.getElementById("removeFromListModal");
const removeFromListInterno = document.getElementById("removeFromListInterno");
const removeFromListBase = document.getElementById("removeFromListBase");
const removeFromListMid = document.getElementById("removeFromListMid");
const removeFromListPunto = document.getElementById("removeFromListPunto");
const removeFromListObs = document.getElementById("removeFromListObs");
const btnRemoveFromListCancel = document.getElementById("btnRemoveFromListCancel");
const btnRemoveFromListConfirm = document.getElementById("btnRemoveFromListConfirm");
const editPlanillaModal = document.getElementById("editPlanillaModal");
const editPlanillaModalInterno = document.getElementById("editPlanillaModalInterno");
const editPlanillaModalBase = document.getElementById("editPlanillaModalBase");
const editPlanillaModalMid = document.getElementById("editPlanillaModalMid");
const editPlanillaModalPasajeros = document.getElementById("editPlanillaModalPasajeros");
const editPlanillaModalObservaciones = document.getElementById("editPlanillaModalObservaciones");
const btnEditPlanillaCancel = document.getElementById("btnEditPlanillaCancel");
const btnEditPlanillaSave = document.getElementById("btnEditPlanillaSave");
const manualDispatchModal = document.getElementById("manualDispatchModal");
const manualDispatchInterno = document.getElementById("manualDispatchInterno");
const manualDispatchInternoList = document.getElementById("manualDispatchInternoList");
const manualDispatchBase = document.getElementById("manualDispatchBase");
const manualDispatchMid = document.getElementById("manualDispatchMid");
const manualDispatchConductorName = document.getElementById("manualDispatchConductorName");
const manualDispatchConductorList = document.getElementById("manualDispatchConductorList");
const manualDispatchDriverId = document.getElementById("manualDispatchDriverId");
const manualDispatchItinerarySelect = document.getElementById("manualDispatchItinerarySelect");
const manualDispatchObs = document.getElementById("manualDispatchObs");
const btnManualDispatchCancel = document.getElementById("btnManualDispatchCancel");
const btnManualDispatchConfirm = document.getElementById("btnManualDispatchConfirm");

let appInitialized = false;
let currentUserId = null;
let currentUserEmail = "";
let currentUserRole = "";
let currentUserBase = "";
let currentProgramacionId = null;
let currentProgramacionFileName = "programacion_online";
let programacionesTotalCount = 0;
let dragFeedbackTimer = null;
let swapModalResolver = null;
let noteModalResolver = null;
let dispatchModalResolver = null;
let cancelDispatchModalResolver = null;
let removeFromListModalResolver = null;
let editPlanillaModalResolver = null;
let manualDispatchModalResolver = null;
let vehiculosSonarRows = [];
let vehiculosSonarLoading = false;
let vehiculosSonarLoadedOnce = false;
let vehiculosSonarLastLoadedAt = 0;
let manualDispatchVehicleLookupSeq = 0;
const VEHICULOS_SONAR_REFRESH_MAX_AGE_MS = 5 * 60 * 1000;
const ROW_UI_ID_KEY = "__ROW_UI_ID";
let rowUiIdSeq = 1;
const UNASSIGNED_LABEL = "SIN CONDUCTOR PROGRAMADO";
let syncRowsInProgress = false;
let syncRowsPending = false;
let syncRetryTimer = null;
let autoRefreshTimer = null;
const SYNC_RETRY_DELAY_MS = 8000;
const AUTO_REFRESH_DELAY_MS = 45000;
const DISPATCH_SERVER_SYNC_WAIT_MS = 65000;
const PROGRAMACION_HISTORY_FETCH_LIMIT = 80;
const ENABLE_PROGRAMACION_AUTO_REFRESH = false;
const ENABLE_PROGRAMACION_SUPABASE = false;
const ENABLE_NOVEDADES_SUPABASE = false;
const programacionReferenceRowsCache = new Map();
const cancelingRowUiIds = new Set();
const removingFromListRowUiIds = new Set();
let dispatchServerSyncTimer = null;

/* ===================== UTILS (compartidos) ===================== */
function ensureRowUiId(rowObj){
  const row = rowObj || {};
  if (!row[ROW_UI_ID_KEY]) {
    row[ROW_UI_ID_KEY] = `R${Date.now().toString(36)}${(rowUiIdSeq++).toString(36)}`;
  }
  return String(row[ROW_UI_ID_KEY]);
}

function isSameLocalDate(a, b){
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function excelDateToISO(serial){
  if(serial === null || serial === undefined) return serial;
  if(typeof serial === "string" && serial.includes("-")) return serial;
  if(isNaN(serial)) return serial;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const d = date_info.getUTCDate().toString().padStart(2,'0');
  const m = (date_info.getUTCMonth()+1).toString().padStart(2,'0');
  const y = date_info.getUTCFullYear();
  return `${y}-${m}-${d}`;
}

function normalizeDateToISO(value){
  if (value === null || value === undefined) return value;
  if (typeof value === "number" && !isNaN(value)) return excelDateToISO(value);
  const raw = String(value).trim();
  if (!raw) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  let m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    let p1 = parseInt(m[1], 10);
    let p2 = parseInt(m[2], 10);
    if (Number.isNaN(p1) || Number.isNaN(p2)) return raw;
    let d = p1;
    let mo = p2;
    if (p1 <= 12 && p2 > 12) {
      d = p2;
      mo = p1;
    }
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return raw;
    const y = m[3];
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  m = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const y = m[1];
    const mo = m[2].padStart(2, "0");
    const d = m[3].padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  return raw;
}

function getOutOfListStorageKey(){
  return `out_of_list_vehicles_${currentUserId || "anon"}`;
}

function buildOutOfListRowKey(row){
  const interno = String(row?.interno || "").trim();
  const mid = String(row?.mid || "").trim();
  const base = String(row?.base || "").trim();
  if (interno || mid) {
    return `veh:${base}|${interno}|${mid}`;
  }
  const rowId = String(row?.id || "").trim();
  if (rowId) return `id:${rowId}`;
  const tipo = String(row?.tipo_llegada || "").trim();
  const hora = String(row?.hora_llegada || row?.generado_en || row?.created_at || "").trim();
  return `raw:${tipo}|${base}|${interno}|${mid}|${hora}`;
}

function rebuildOutOfListVehicleIndex(){
  outOfListVehicleKeySet = new Set(
    (Array.isArray(outOfListVehicles) ? outOfListVehicles : [])
      .map(item => String(item?.row_key || "").trim())
      .filter(Boolean)
  );
}

function readOutOfListVehiclesLocal(){
  try {
    const raw = localStorage.getItem(getOutOfListStorageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveOutOfListVehiclesLocal(list){
  try {
    const payload = Array.isArray(list) ? list : [];
    localStorage.setItem(getOutOfListStorageKey(), JSON.stringify(payload));
  } catch (e) {}
}

function loadOutOfListVehiclesLocal(){
  outOfListVehicles = readOutOfListVehiclesLocal();
  rebuildOutOfListVehicleIndex();
}

function isRowOutOfList(row){
  const key = buildOutOfListRowKey(row);
  return !!key && outOfListVehicleKeySet.has(key);
}

function filterOutOfListRows(rowsInput){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  return rows.filter(row => !isRowOutOfList(row));
}

function addOutOfListVehicleEntry(entry){
  const list = Array.isArray(outOfListVehicles) ? outOfListVehicles.slice() : [];
  const rowKey = String(entry?.row_key || "").trim();
  if (rowKey && list.some(item => String(item?.row_key || "").trim() === rowKey)) return false;
  list.unshift(entry);
  outOfListVehicles = list;
  rebuildOutOfListVehicleIndex();
  saveOutOfListVehiclesLocal(outOfListVehicles);
  return true;
}

function updateOutOfListEntry(entryId, patch){
  const id = String(entryId || "").trim();
  if (!id) return;
  outOfListVehicles = (Array.isArray(outOfListVehicles) ? outOfListVehicles : []).map(item => {
    if (String(item?.id || "").trim() !== id) return item;
    return { ...item, ...(patch || {}) };
  });
  rebuildOutOfListVehicleIndex();
  saveOutOfListVehiclesLocal(outOfListVehicles);
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

function extractConductorName(val){
  if (!val) return '';
  if (norm(val) === UNASSIGNED_LABEL) return '';
  const match = String(val).match(/^(.*?)\s*\[(DISPONIBLE|INCAPACITADO|PERMISO|DESCANSO|VACACIONES|RECONOCIMIENTO DE RUTA|DIA NO REMUNERADO|CALAMIDAD|RENUNCIA)\]\s*$/);
  return match ? match[1].trim() : String(val).trim();
}

function closeDispatchModal(confirmed){
  if (dispatchModal) dispatchModal.classList.add("hidden");
  if (dispatchModalResolver) {
    const resolve = dispatchModalResolver;
    dispatchModalResolver = null;
    const itineraryId = String(dispatchModalItinerarySelect?.value || "").trim();
    const driverId = String(dispatchModalDriverSelect?.value || "").trim();
    resolve({ confirmed: !!confirmed, itineraryId, driverId });
  }
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

function closeRemoveFromListModal(confirmed){
  if (removeFromListModal) removeFromListModal.classList.add("hidden");
  if (removeFromListModalResolver) {
    const resolve = removeFromListModalResolver;
    removeFromListModalResolver = null;
    resolve({
      confirmed: !!confirmed,
      observacion: String(removeFromListObs?.value || "").trim()
    });
  }
}

function openRemoveFromListModal(payload = {}){
  if (!removeFromListModal || !btnRemoveFromListCancel || !btnRemoveFromListConfirm) {
    const info = [
      `Interno: ${payload.interno || "-"}`,
      `Base: ${payload.base || "-"}`,
      `MID: ${payload.mid || "-"}`,
      `Punto: ${payload.punto || "-"}`
    ].join("\n");
    const observacion = prompt(`Sacar vehiculo de la lista?\n\n${info}\n\nObservacion obligatoria:`, "");
    if (observacion === null) return Promise.resolve({ confirmed: false, observacion: "" });
    return Promise.resolve({ confirmed: true, observacion: String(observacion || "").trim() });
  }
  if (removeFromListInterno) removeFromListInterno.textContent = payload.interno || "-";
  if (removeFromListBase) removeFromListBase.textContent = payload.base || "-";
  if (removeFromListMid) removeFromListMid.textContent = payload.mid || "-";
  if (removeFromListPunto) removeFromListPunto.textContent = payload.punto || "-";
  if (removeFromListObs) removeFromListObs.value = "";
  removeFromListModal.classList.remove("hidden");
  setTimeout(() => removeFromListObs?.focus(), 10);
  return new Promise(resolve => {
    removeFromListModalResolver = resolve;
  });
}

function closeEditPlanillaModal(confirmed){
  if (editPlanillaModal) editPlanillaModal.classList.add("hidden");
  if (editPlanillaModalResolver) {
    const resolve = editPlanillaModalResolver;
    editPlanillaModalResolver = null;
    resolve({
      confirmed: !!confirmed,
      pasajeros: String(editPlanillaModalPasajeros?.value || "").trim(),
      observaciones: String(editPlanillaModalObservaciones?.value || "").trim()
    });
  }
}

function openEditPlanillaModal(payload = {}){
  if (!editPlanillaModal || !btnEditPlanillaCancel || !btnEditPlanillaSave) {
    const pasajeros = prompt("Pasajeros:", String(payload.pasajeros || ""));
    if (pasajeros === null) return Promise.resolve({ confirmed: false, pasajeros: "", observaciones: "" });
    const observaciones = prompt("Observaciones:", String(payload.observaciones || ""));
    if (observaciones === null) return Promise.resolve({ confirmed: false, pasajeros: "", observaciones: "" });
    return Promise.resolve({
      confirmed: true,
      pasajeros: String(pasajeros || "").trim(),
      observaciones: String(observaciones || "").trim()
    });
  }
  if (editPlanillaModalInterno) editPlanillaModalInterno.textContent = payload.interno || "-";
  if (editPlanillaModalBase) editPlanillaModalBase.textContent = payload.base || "-";
  if (editPlanillaModalMid) editPlanillaModalMid.textContent = payload.mid || "-";
  if (editPlanillaModalPasajeros) editPlanillaModalPasajeros.value = payload.pasajeros || "";
  if (editPlanillaModalObservaciones) editPlanillaModalObservaciones.value = payload.observaciones || "";
  editPlanillaModal.classList.remove("hidden");
  setTimeout(() => editPlanillaModalPasajeros?.focus(), 10);
  return new Promise(resolve => {
    editPlanillaModalResolver = resolve;
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

function fillDriverSelectOptions(selectEl, baseValue, preferredDriverId){
  if (!selectEl) return;
  const baseCanonical = getBaseCanonical(baseValue || "");
  const allCatalog = Array.isArray(driversCatalogRows) ? driversCatalogRows : [];
  const preferredId = String(preferredDriverId || "").trim();
  const enabledRows = allCatalog.filter(row => String(row?.status || "").trim().toUpperCase() === "ENABLED");
  const baseRows = enabledRows.filter(row => !baseCanonical || getCsvDriverBase(row) === baseCanonical);
  const finalRows = baseRows.length ? baseRows : enabledRows;
  selectEl.innerHTML = `<option value="">Selecciona conductor...</option>${
    finalRows.map(row => {
      const drId = String(row?.dr_id || "").trim();
      const name = String(row?.nombre || "").trim();
      const baseLabel = formatBaseLabel(getCsvDriverBase(row) || "");
      return `<option value="${escapeHtml(drId)}">${escapeHtml(`${name} | ${drId} | ${baseLabel}`)}</option>`;
    }).join("")
  }`;
  if (preferredId) {
    selectEl.value = preferredId;
    if (selectEl.value !== preferredId) {
      const known = allCatalog.find(r => String(r?.dr_id || "").trim() === preferredId);
      const op = document.createElement("option");
      op.value = preferredId;
      op.textContent = known
        ? `${known.nombre || "Conductor"} | ${preferredId}`
        : `Driver ID manual | ${preferredId}`;
      selectEl.appendChild(op);
      selectEl.value = preferredId;
    }
  }
}

async function checkPreoperacionalForInterno(interno){
  const k = String(interno || "").trim();
  if (!k) return { found: false };
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const fromIso = `${yyyy}-${mm}-${dd}T00:00:00`;
  try {
    const { data, error } = await planillaSupabaseClient
      .from(PREOP_SICOV_TABLE)
      .select("FechaHora, NombreConductor, EstadoEnvio, Documento")
      .eq("NumeroInterno", k)
      .gte("FechaHora", fromIso)
      .order("FechaHora", { ascending: false })
      .limit(1);
    if (error) throw error;
    const row = Array.isArray(data) && data.length ? data[0] : null;
    if (!row) return { found: false };
    return {
      found: true,
      fecha: row.FechaHora,
      conductor: row.NombreConductor || "",
      documento: row.Documento || "",
      estado: String(row.EstadoEnvio || "").toUpperCase()
    };
  } catch (err) {
    console.error("[preop check] fallo:", err);
    return { found: false, error: err?.message || "consulta fallida" };
  }
}

function renderDispatchModalPreop(state){
  if (!dispatchModalPreop) return;
  dispatchModalPreop.classList.remove("preop-loading", "preop-ok", "preop-missing", "preop-error");
  if (!state) {
    dispatchModalPreop.classList.add("preop-loading");
    dispatchModalPreop.textContent = "Consultando...";
    return;
  }
  if (state.error) {
    dispatchModalPreop.classList.add("preop-error");
    dispatchModalPreop.textContent = `Error: ${state.error}`;
    return;
  }
  if (!state.found) {
    dispatchModalPreop.classList.add("preop-missing");
    dispatchModalPreop.textContent = "NO realizo preoperacional hoy";
    return;
  }
  const hora = state.fecha ? new Date(state.fecha).toLocaleString("es-CO", { hour12: false }) : "-";
  const partes = [`${state.estado || "OK"} · ${hora}`];
  if (state.conductor) partes.push(state.conductor);
  dispatchModalPreop.classList.add("preop-ok");
  dispatchModalPreop.textContent = `Realizado: ${partes.join(" · ")}`;
}

function openDispatchConfirmModal(payload = {}){
  if (!dispatchModal || !btnDispatchCancel || !btnDispatchConfirm) {
    const text = [
      `Interno: ${payload.interno || "-"}`,
      `Base: ${payload.base || "-"}`,
      `MID: ${payload.mid || "-"}`,
      `Driver ID: ${payload.driverId || "-"}`,
      `Itinerario ID: ${payload.itineraryId || "-"}`,
      `Observaciones: ${payload.observaciones || "-"}`
    ].join("\n");
    const confirmed = confirm(`Confirmar despacho?\n\n${text}`);
    return Promise.resolve({
      confirmed,
      itineraryId: String(payload.itineraryId || "").trim(),
      driverId: String(payload.driverId || "").trim()
    });
  }
  if (dispatchModalInterno) dispatchModalInterno.textContent = payload.interno || "-";
  if (dispatchModalBase) dispatchModalBase.textContent = payload.base || "-";
  if (dispatchModalMid) dispatchModalMid.textContent = payload.mid || "-";
  fillDriverSelectOptions(dispatchModalDriverSelect, payload.base || "", payload.driverId || "");
  if (dispatchModalItinerarySelect) {
    const modalItineraries = Array.isArray(payload.itineraryOptions) && payload.itineraryOptions.length
      ? payload.itineraryOptions
      : SONAR_ITINERARIES;
    dispatchModalItinerarySelect.innerHTML = buildItineraryOptionsHtml(modalItineraries);
    const preferred = String(payload.itineraryId || "").trim();
    if (preferred && modalItineraries.some(item => String(item.id) === preferred)) {
      dispatchModalItinerarySelect.value = preferred;
    }
  }
  if (dispatchModalObs) dispatchModalObs.textContent = payload.observaciones || "-";
  renderDispatchModalPreop(null);
  checkPreoperacionalForInterno(payload.interno).then(renderDispatchModalPreop);
  dispatchModal.classList.remove("hidden");
  return new Promise(resolve => {
    dispatchModalResolver = resolve;
  });
}

function closeManualDispatchModal(confirmed){
  if (manualDispatchModal) manualDispatchModal.classList.add("hidden");
  if (manualDispatchModalResolver) {
    const resolve = manualDispatchModalResolver;
    manualDispatchModalResolver = null;
    resolve({
      confirmed: !!confirmed,
      interno: String(manualDispatchInterno?.value || "").trim(),
      base: String(manualDispatchBase?.value || "").trim(),
      mId: String(manualDispatchMid?.value || "").trim(),
      conductorName: String(manualDispatchConductorName?.value || "").trim(),
      drvId: String(manualDispatchDriverId?.value || "").trim(),
      itinerary: String(manualDispatchItinerarySelect?.value || "").trim(),
      observaciones: String(manualDispatchObs?.value || "").trim()
    });
  }
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
  if (vehiculosSonarStatus) vehiculosSonarStatus.textContent = "Consultando Supabase...";
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
    renderVehiculosSonarTab();
    if (vehiculosSonarStatus) {
      const stamp = new Date().toLocaleString("es-CO");
      vehiculosSonarStatus.textContent = `Actualizado: ${stamp}`;
    }
  } catch (error) {
    console.error(`Error cargando ${VEHICULOS_SONAR_TABLE_NAME}:`, error);
    if (vehiculosSonarStatus) vehiculosSonarStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
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

function getFilteredVehiculosSonarRows(){
  const term = String(vehiculosSonarSearch?.value || "").trim().toLowerCase();
  const rows = Array.isArray(vehiculosSonarRows) ? vehiculosSonarRows : [];
  const filtered = term
    ? rows.filter(row => {
        const haystack = [
          row?.interno,
          row?.placa,
          row?.mid
        ].map(v => String(v || "").toLowerCase()).join(" ");
        return haystack.includes(term);
      })
    : rows.slice();
  return filtered.sort((a, b) => String(a.interno).localeCompare(String(b.interno), "es", { numeric: true }));
}

function renderVehiculosSonarTab(){
  if (!vehiculosSonarBody) return;
  const filtered = getFilteredVehiculosSonarRows();
  if (vehiculosSonarCount) vehiculosSonarCount.textContent = String(filtered.length);
  if (!filtered.length) {
    vehiculosSonarBody.innerHTML = `<tr><td colspan="4" class="muted" style="text-align:center;padding:12px">Sin vehiculos para mostrar.</td></tr>`;
    return;
  }
  vehiculosSonarBody.innerHTML = filtered.map(row => {
    const interno = String(row?.interno || "").trim();
    const placa = String(row?.placa || "").trim();
    const mid = String(row?.mid || "").trim();
    const baseNum = getBaseNumForInterno(interno);
    const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span> ` : "";
    return `<tr>
      <td>${baseBadge}${escapeHtml(interno)}</td>
      <td>${escapeHtml(placa || "-")}</td>
      <td>
        <input class="vehiculo-sonar-id-input" data-interno="${escapeHtml(interno)}" value="${escapeHtml(mid)}" placeholder="ID Sonar" />
      </td>
      <td>
        <button class="btn btn-primary btn-save-vehiculo-sonar" data-interno="${escapeHtml(interno)}">Guardar</button>
      </td>
    </tr>`;
  }).join("");
}

async function updateVehiculoSonarId(internoValue, nextIdValue){
  const interno = String(internoValue || "").trim();
  const nextId = String(nextIdValue || "").trim().toUpperCase();
  if (!interno || !nextId) {
    showToast("Escribe un interno y un ID Sonar valido.", "warn");
    return;
  }
  const row = findManualDispatchVehicleByInterno(interno);
  const previousId = String(row?.mid || "").trim();
  if (previousId === nextId) {
    showToast("El ID Sonar no cambio.", "warn");
    return;
  }
  try {
    const numericInterno = Number(interno);
    let query = planillaSupabaseClient
      .from(VEHICULOS_SONAR_TABLE_NAME)
      .update({ ID: nextId });
    query = Number.isFinite(numericInterno) && String(numericInterno) === interno
      ? query.eq("INTERNO", numericInterno)
      : query.eq("INTERNO", interno);
    const { data, error } = await query.select("*");
    if (error) throw error;
    const updatedRow = mergeVehiculoSonarRows(data);
    if (!updatedRow) throw new Error("No se encontro el vehiculo para actualizar.");
    renderVehiculosSonarTab();
    fillManualDispatchInternoList();
    if (manualDispatchInterno && String(manualDispatchInterno.value || "").trim() === interno) {
      applyManualDispatchVehicleRow(updatedRow);
    }
    showToast(`ID Sonar actualizado para interno ${interno}.`, "ok");
  } catch (error) {
    console.error(`Error actualizando ${VEHICULOS_SONAR_TABLE_NAME}:`, error);
    showToast(`No se pudo actualizar el ID Sonar: ${error?.message || "fallo de Supabase"}`, "err");
  }
}

function handleVehiculosSonarTableClick(ev){
  const btn = ev.target?.closest?.(".btn-save-vehiculo-sonar");
  if (!btn) return;
  const interno = String(btn.getAttribute("data-interno") || "").trim();
  const input = Array.from(vehiculosSonarBody?.querySelectorAll(".vehiculo-sonar-id-input") || [])
    .find(el => String(el.getAttribute("data-interno") || "").trim() === interno);
  updateVehiculoSonarId(interno, input?.value || "");
}

/* ===================== DESPACHOS SONAR (Edge Function) ===================== */
const DESPACHOS_SONAR_ENDPOINT = `${PLANILLA_SUPABASE_URL}/functions/v1/sonar-despachos`;
let despachosSonarRows = [];
let despachosSonarLoading = false;
let despachosSonarLastLoadedAt = null;
let despachosSonarItinFilter = ""; // "" = todos los itinerarios

function getDespachoSonarEstado(row){
  if (String(row?.lcanceled).toLowerCase() === "true") return "CANCELADO";
  if (String(row?.lrunning).toLowerCase() === "true") return "EN CURSO";
  if (String(row?.lclose).toLowerCase() === "true") return "CERRADO";
  return "DESCONOCIDO";
}

function getDespachoSonarInicio(row){
  const d = String(row?.initDate || "").trim();
  const t = String(row?.initTime || "").trim();
  return d && t ? `${d} ${t}` : d || t || "";
}

function getDespachoSonarEstadoColor(estado){
  switch (estado) {
    case "EN CURSO": return "#1d4ed8";
    case "CERRADO": return "#065f46";
    case "CANCELADO": return "#b91c1c";
    default: return "#64748b";
  }
}

async function loadDespachosSonarFromEdge(options = {}){
  if (despachosSonarLoading) return;
  despachosSonarLoading = true;
  if (despachosSonarStatus) despachosSonarStatus.textContent = "Consultando Sonar...";
  if (btnRefreshDespachosSonar) btnRefreshDespachosSonar.disabled = true;
  try {
    const t0 = Date.now();
    const resp = await fetch(DESPACHOS_SONAR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: PLANILLA_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${PLANILLA_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(options.body || {}),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data?.success) throw new Error(data?.message || "respuesta sin success");
    despachosSonarRows = Array.isArray(data.despachos) ? data.despachos : [];
    despachosSonarLastLoadedAt = Date.now();
    renderDespachosSonarTab();
    const stamp = new Date().toLocaleTimeString("es-CO");
    const meta = data.meta || {};
    const elapsed = (Date.now() - t0);
    if (despachosSonarStatus) {
      const errs = meta.total_errores ? ` · ${meta.total_errores} errores` : "";
      despachosSonarStatus.textContent =
        `Actualizado ${stamp} · ${meta.buses_consultados || 0} buses · ${elapsed} ms${errs}`;
    }
  } catch (error) {
    console.error("Error consultando sonar-despachos:", error);
    if (despachosSonarStatus) despachosSonarStatus.textContent = `Error: ${error?.message || "fallo"}`;
    showToast(`No se pudo consultar Sonar: ${error?.message || "fallo"}`, "err");
  } finally {
    despachosSonarLoading = false;
    if (btnRefreshDespachosSonar) btnRefreshDespachosSonar.disabled = false;
  }
}

function getEnCursoDespachosSonarRows(){
  const rows = Array.isArray(despachosSonarRows) ? despachosSonarRows : [];
  return rows.filter(row => getDespachoSonarEstado(row) === "EN CURSO");
}

function getDespachosSonarItinerariosResumen(){
  const counts = new Map();
  for (const row of getEnCursoDespachosSonarRows()) {
    const itin = String(row?.itDesc || "").trim() || "Sin itinerario";
    counts.set(itin, (counts.get(itin) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

function renderDespachosSonarItinChips(){
  if (!despachosSonarItinChips) return;
  const resumen = getDespachosSonarItinerariosResumen();
  const total = resumen.reduce((acc, r) => acc + r.count, 0);
  const activeFilter = despachosSonarItinFilter;
  const chips = [{ name: "", label: "Todos", count: total }]
    .concat(resumen.map(r => ({ name: r.name, label: r.name, count: r.count })));
  despachosSonarItinChips.innerHTML = chips.map(chip => {
    const isActive = String(chip.name) === String(activeFilter);
    const cls = `chip${isActive ? " active" : ""}`;
    return `<button type="button" class="${cls}" data-itin="${escapeHtml(chip.name)}">
      <span>${escapeHtml(chip.label)}</span>
      <span class="chip-count">${chip.count}</span>
    </button>`;
  }).join("");
}

function getFilteredDespachosSonarRows(){
  const term = String(despachosSonarSearch?.value || "").trim().toLowerCase();
  const itin = String(despachosSonarItinFilter || "").trim();
  const filtered = getEnCursoDespachosSonarRows().filter(row => {
    if (itin) {
      const rowItin = String(row?.itDesc || "").trim() || "Sin itinerario";
      if (rowItin !== itin) return false;
    }
    if (!term) return true;
    const haystack = [
      row?.mDesc, row?.mPlaca, row?.mId, row?.drName, row?.itDesc
    ].map(v => String(v || "").toLowerCase()).join(" ");
    return haystack.includes(term);
  });
  return filtered.sort((a, b) => {
    const ka = getDespachoSonarInicio(a);
    const kb = getDespachoSonarInicio(b);
    return kb.localeCompare(ka);
  });
}

function renderDespachosSonarTab(){
  renderDespachosSonarItinChips();
  if (!despachosSonarBody) return;
  const filtered = getFilteredDespachosSonarRows();
  if (despachosSonarCount) despachosSonarCount.textContent = String(filtered.length);
  if (!filtered.length) {
    despachosSonarBody.innerHTML =
      `<tr><td colspan="7" class="muted" style="text-align:center;padding:12px">Sin despachos en curso para mostrar.</td></tr>`;
    return;
  }
  despachosSonarBody.innerHTML = filtered.map(row => {
    const inicio = getDespachoSonarInicio(row);
    const estado = getDespachoSonarEstado(row);
    const color = getDespachoSonarEstadoColor(estado);
    const interno = String(row?.mDesc || row?.interno || "").trim();
    const placa = String(row?.mPlaca || "").trim();
    const conductor = String(row?.drName || "").trim();
    const itin = String(row?.itDesc || "").trim();
    const elapsed = String(row?.elapsed ?? "").trim();
    const baseNum = getBaseNumForInterno(interno);
    const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span> ` : "";
    return `<tr>
      <td data-label="Inicio">${escapeHtml(inicio)}</td>
      <td data-label="Interno">${baseBadge}<strong style="color:#065f46">${escapeHtml(interno)}</strong></td>
      <td data-label="Placa">${escapeHtml(placa || "-")}</td>
      <td data-label="Conductor">${escapeHtml(conductor || "-")}</td>
      <td data-label="Itinerario">${escapeHtml(itin || "-")}</td>
      <td data-label="Min" style="text-align:right;font-variant-numeric:tabular-nums">${escapeHtml(elapsed)}</td>
      <td data-label="Estado"><strong style="color:${color}">${escapeHtml(estado)}</strong></td>
    </tr>`;
  }).join("");
}

function handleDespachosSonarChipClick(ev){
  const chip = ev.target?.closest?.(".chip");
  if (!chip || !despachosSonarItinChips?.contains(chip)) return;
  despachosSonarItinFilter = String(chip.getAttribute("data-itin") || "");
  renderDespachosSonarTab();
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
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
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

/* ===================== PREOPERACIONALES SICOV ===================== */
const PREOP_SICOV_TABLE = "preoperacionales_sicov";
let preopSicovCurrentPage = 1;
let preopSicovTotalCount = 0;
let preopSicovLastLoadedAt = null;
let preopSicovLoading = false;
let preopSicovSearchTimer = null;

function getPreopSicovPageSize(){
  const n = parseInt(String(preopSicovPageSize?.value || "50"), 10);
  return Number.isFinite(n) && n > 0 ? n : 50;
}

function buildPreopSicovQuery(){
  let q = planillaSupabaseClient
    .from(PREOP_SICOV_TABLE)
    .select("id, FechaHora, NumeroInterno, Placa, Documento, NombreConductor, EstadoEnvio, RespuestaSICOV, DetalleActividades, ErrorSheet", { count: "exact" })
    .order("FechaHora", { ascending: false });

  const from = String(preopSicovFrom?.value || "").trim();
  const to = String(preopSicovTo?.value || "").trim();
  if (from) q = q.gte("FechaHora", `${from}T00:00:00+00:00`);
  if (to)   q = q.lte("FechaHora", `${to}T23:59:59+00:00`);

  const term = String(preopSicovSearch?.value || "").trim();
  if (term) {
    const safe = term.replace(/[%,()]/g, " ").trim();
    if (safe) {
      q = q.or([
        `NumeroInterno.ilike.%${safe}%`,
        `Placa.ilike.%${safe}%`,
        `Documento.ilike.%${safe}%`,
        `NombreConductor.ilike.%${safe}%`
      ].join(","));
    }
  }
  return q;
}

async function loadPreoperacionalesSicov(targetPage){
  if (preopSicovLoading) return;
  preopSicovLoading = true;
  const pageSize = getPreopSicovPageSize();
  const page = Math.max(1, parseInt(targetPage || preopSicovCurrentPage || 1, 10));
  preopSicovCurrentPage = page;
  if (preopSicovStatus) preopSicovStatus.textContent = "Consultando Supabase...";
  if (btnRefreshPreopSicov) btnRefreshPreopSicov.disabled = true;
  try {
    const fromIdx = (page - 1) * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    const { data, count, error } = await buildPreopSicovQuery().range(fromIdx, toIdx);
    if (error) throw error;
    preopSicovTotalCount = Number.isFinite(count) ? count : (Array.isArray(data) ? data.length : 0);
    renderPreoperacionalesSicov(Array.isArray(data) ? data : []);
    preopSicovLastLoadedAt = Date.now();
    const stamp = new Date().toLocaleTimeString("es-CO");
    if (preopSicovStatus) preopSicovStatus.textContent = `Actualizado ${stamp}`;
  } catch (err) {
    console.error(`[${PREOP_SICOV_TABLE}] consulta fallo:`, err);
    if (preopSicovStatus) preopSicovStatus.textContent = `Error: ${err?.message || "fallo"}`;
    showToast(`No se pudo cargar ${PREOP_SICOV_TABLE}: ${err?.message || "fallo"}`, "err");
  } finally {
    preopSicovLoading = false;
    if (btnRefreshPreopSicov) btnRefreshPreopSicov.disabled = false;
  }
}

function formatPreopSicovDate(iso){
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString("es-CO", { hour12: false });
  } catch (_) { return String(iso); }
}

function extractSicovIds(respuesta){
  if (!respuesta) return { id: "", idAlistamiento: "" };
  let obj = respuesta;
  if (typeof respuesta === "string") {
    try { obj = JSON.parse(respuesta); } catch (_) { return { id: "", idAlistamiento: "" }; }
  }
  const inner = obj?.sicovResponse || obj || {};
  return {
    id: String(inner?.id ?? ""),
    idAlistamiento: String(inner?.idAlistamiento ?? "")
  };
}

function renderPreoperacionalesSicov(rows){
  if (!preopSicovBody) return;
  const pageSize = getPreopSicovPageSize();
  const totalPages = Math.max(1, Math.ceil(preopSicovTotalCount / pageSize));
  if (preopSicovTotal) preopSicovTotal.textContent = String(preopSicovTotalCount);
  if (preopSicovPage) preopSicovPage.textContent = String(preopSicovCurrentPage);
  if (preopSicovPages) preopSicovPages.textContent = String(totalPages);
  if (btnPreopSicovFirst) btnPreopSicovFirst.disabled = preopSicovCurrentPage <= 1;
  if (btnPreopSicovPrev)  btnPreopSicovPrev.disabled  = preopSicovCurrentPage <= 1;
  if (btnPreopSicovNext)  btnPreopSicovNext.disabled  = preopSicovCurrentPage >= totalPages;
  if (btnPreopSicovLast)  btnPreopSicovLast.disabled  = preopSicovCurrentPage >= totalPages;

  if (!rows.length) {
    preopSicovBody.innerHTML =
      `<tr><td colspan="9" class="muted" style="text-align:center;padding:12px">Sin registros para los filtros aplicados.</td></tr>`;
    return;
  }

  preopSicovBody.innerHTML = rows.map(row => {
    const fecha = formatPreopSicovDate(row?.FechaHora);
    const interno = String(row?.NumeroInterno || "-");
    const placa = String(row?.Placa || "-");
    const doc = String(row?.Documento || "-");
    const cond = String(row?.NombreConductor || "-");
    const estado = String(row?.EstadoEnvio || "-").toUpperCase();
    const estadoColor = estado === "OK" ? "#065f46" : (estado === "ERROR" ? "#b91c1c" : "#64748b");
    const det = String(row?.DetalleActividades || "");
    const ids = extractSicovIds(row?.RespuestaSICOV);
    const baseNum = getBaseNumForInterno(interno);
    const baseBadge = baseNum ? `<span class="chip-base" title="Base afiliacion">B${escapeHtml(baseNum)}</span> ` : "";
    return `<tr>
      <td>${escapeHtml(fecha)}</td>
      <td>${baseBadge}<strong style="color:#065f46">${escapeHtml(interno)}</strong></td>
      <td>${escapeHtml(placa)}</td>
      <td style="font-variant-numeric:tabular-nums">${escapeHtml(doc)}</td>
      <td>${escapeHtml(cond)}</td>
      <td><strong style="color:${estadoColor}">${escapeHtml(estado)}</strong></td>
      <td style="font-variant-numeric:tabular-nums">${escapeHtml(ids.id || "-")}</td>
      <td style="font-variant-numeric:tabular-nums">${escapeHtml(ids.idAlistamiento || "-")}</td>
      <td><span class="muted" title="${escapeHtml(det)}">${escapeHtml(det.slice(0, 40))}${det.length > 40 ? "..." : ""}</span></td>
    </tr>`;
  }).join("");
}

function schedulePreopSicovSearch(){
  if (preopSicovSearchTimer) clearTimeout(preopSicovSearchTimer);
  preopSicovSearchTimer = setTimeout(() => { loadPreoperacionalesSicov(1); }, 350);
}

/* ===================== MAPA VEHICULOS (llegadas_104 + realtime) ===================== */
const MAPA_VEHICULOS_TABLE = "llegadas_104";
const MAPA_DEFAULT_CENTER = [6.171, -75.4315]; // Glorieta Aeropuerto JMC
const MAPA_DEFAULT_ZOOM = 17;
const MAPA_OVERLAP_PRECISION = 5; // decimales para detectar misma coordenada (~1m)
const MAPA_OVERLAP_BASE_RADIUS_M = 8; // metros
let mapaLeaflet = null;
const mapaMarkers = new Map(); // vehicle_id -> Leaflet marker
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

/**
 * Devuelve un Map<rowKey, [lat, lon]> con las coordenadas ya separadas
 * cuando varios vehiculos comparten exactamente el mismo punto.
 * Distribuye en circulo alrededor del original.
 */
function computeMapaDisplayCoords(rows){
  const out = new Map();
  if (!Array.isArray(rows) || !rows.length) return out;
  // Agrupar por coordenada redondeada
  const groups = new Map();
  for (const row of rows) {
    const lat = parseFloat(row?.lat);
    const lon = parseFloat(row?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const key = getMapaRowKey(row);
    if (!key) continue;
    const coordKey = `${lat.toFixed(MAPA_OVERLAP_PRECISION)}|${lon.toFixed(MAPA_OVERLAP_PRECISION)}`;
    if (!groups.has(coordKey)) groups.set(coordKey, []);
    groups.get(coordKey).push({ key, lat, lon });
  }
  for (const items of groups.values()) {
    if (items.length === 1) {
      const it = items[0];
      out.set(it.key, [it.lat, it.lon]);
      continue;
    }
    // Distribuir radialmente. Radio crece con N para mantener separacion visual.
    const n = items.length;
    const radiusM = MAPA_OVERLAP_BASE_RADIUS_M * Math.max(1, Math.sqrt(n / 3));
    // 1 grado lat ~ 111000 m; 1 grado lon ~ 111000 * cos(lat)
    const baseLat = items[0].lat;
    const baseLon = items[0].lon;
    const dLat = radiusM / 111000;
    const dLon = radiusM / (111000 * Math.cos(baseLat * Math.PI / 180));
    items.forEach((it, i) => {
      const angle = (2 * Math.PI * i) / n;
      const lat = baseLat + dLat * Math.cos(angle);
      const lon = baseLon + dLon * Math.sin(angle);
      out.set(it.key, [lat, lon]);
    });
  }
  return out;
}

function getMapaRowKey(row){
  return String(row?.vehicle_id || row?.interno || "").trim().toUpperCase();
}

function buildMapaMarkerIcon(row){
  if (typeof L === "undefined") return null;
  const interno = String(row?.interno || "?");
  const listo = row?.listo === true || row?.listo === "true";
  const bg = listo ? "#16a34a" : "#0078d4";
  return L.divIcon({
    className: "mapa-veh-marker",
    html: `<div style="
      background:${bg};color:#fff;padding:4px 9px;border-radius:10px;
      font-weight:800;font-size:12px;border:2px solid #fff;
      box-shadow:0 2px 8px rgba(15,23,42,.35);
      font-family:Inter, system-ui, sans-serif;line-height:1;white-space:nowrap;
    ">${escapeHtml(interno)}</div>`,
    iconSize: null,
    iconAnchor: [16, 12],
  });
}

function buildMapaPopupHtml(row){
  const fmt = (v) => escapeHtml(String(v ?? "-").trim() || "-");
  const listo = (row?.listo === true || row?.listo === "true")
    ? `<span style="color:#16a34a;font-weight:700">LISTO</span>`
    : `<span style="color:#0078d4;font-weight:700">EN ESPERA</span>`;
  return `
    <div style="min-width:200px;font-family:Inter,system-ui,sans-serif;font-size:13px;line-height:1.45">
      <div style="font-weight:800;font-size:15px;margin-bottom:4px">
        Interno ${fmt(row?.interno)}
        <span style="color:var(--fg-soft);font-weight:600;font-size:12px">(${fmt(row?.vehicle_id)})</span>
      </div>
      <div><b>Itinerario:</b> ${fmt(row?.itinerario)}</div>
      <div><b>Posicion:</b> ${fmt(row?.posicion)} · <b>Base:</b> ${fmt(row?.base)}</div>
      <div><b>Driver ID:</b> ${fmt(row?.driver_id)}</div>
      <div><b>Hora llegada:</b> ${fmt(row?.hora_llegada)}</div>
      <div><b>Estado:</b> ${listo}</div>
      <div style="color:var(--fg-soft);font-size:11px;margin-top:4px">Actualizado: ${fmt(row?.updated_at)}</div>
    </div>
  `;
}

function ensureMapaLeaflet(){
  if (mapaLeaflet) return mapaLeaflet;
  if (typeof L === "undefined" || !mapaVehiculosContainer) return null;
  mapaLeaflet = L.map(mapaVehiculosContainer, {
    center: MAPA_DEFAULT_CENTER,
    zoom: MAPA_DEFAULT_ZOOM,
    preferCanvas: false,
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapaLeaflet);
  return mapaLeaflet;
}

function renderMapaMarkers(){
  const map = ensureMapaLeaflet();
  if (!map) return;
  const coords = computeMapaDisplayCoords(mapaVehiculosRows);
  const seen = new Set();
  for (const row of (mapaVehiculosRows || [])) {
    const key = getMapaRowKey(row);
    if (!key) continue;
    const latlon = coords.get(key);
    if (!latlon) continue;
    seen.add(key);
    const icon = buildMapaMarkerIcon(row);
    const popupHtml = buildMapaPopupHtml(row);
    const existing = mapaMarkers.get(key);
    if (existing) {
      existing.setLatLng(latlon);
      if (icon) existing.setIcon(icon);
      existing.getPopup()?.setContent(popupHtml);
      existing._rowData = row;
    } else {
      const marker = L.marker(latlon, icon ? { icon } : {}).addTo(map);
      marker.bindPopup(popupHtml);
      marker._rowData = row;
      mapaMarkers.set(key, marker);
    }
  }
  for (const [key, marker] of mapaMarkers) {
    if (!seen.has(key)) {
      map.removeLayer(marker);
      mapaMarkers.delete(key);
    }
  }
  if (mapaVehiculosCount) mapaVehiculosCount.textContent = String(mapaMarkers.size);
}

function renderLlegadasVehiculosViews(){
  renderMapaMarkers();
  renderTablaLlegadasVehiculos();
  if (typeof renderHistorialInsights === "function") renderHistorialInsights();
}

/* ============ Tabla en vivo de llegadas_104 ============ */
function getFilteredTablaLlegadasRows(){
  const term = String(tablaLlegadasSearch?.value || "").trim().toLowerCase();
  return (mapaVehiculosRows || [])
    .filter(row => {
      if (!term) return true;
      const haystack = [
        row?.vehicle_id, row?.interno, row?.itinerario, row?.base,
        row?.driver_id, row?.ubicacion
      ].map(v => String(v || "").toLowerCase()).join(" ");
      return haystack.includes(term);
    })
    .sort((a, b) => {
      const pa = Number(a?.posicion);
      const pb = Number(b?.posicion);
      if (Number.isFinite(pa) && Number.isFinite(pb) && pa !== pb) return pa - pb;
      const ha = String(a?.hora_llegada || "");
      const hb = String(b?.hora_llegada || "");
      return hb.localeCompare(ha);
    });
}

function formatTablaLlegadasDateTime(value){
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("es-CO", { hour12: false });
  } catch (_) { return String(value); }
}

function renderTablaLlegadasVehiculos(){
  if (!tablaLlegadasGrid) return;
  const rows = getFilteredTablaLlegadasRows();
  if (tablaLlegadasCount) tablaLlegadasCount.textContent = String(rows.length);
  if (!rows.length) {
    tablaLlegadasGrid.innerHTML =
      `<div class="muted" style="grid-column:1/-1;text-align:center;padding:18px">Sin registros.</div>`;
    return;
  }

  const groups = new Map();
  for (const row of rows) {
    const itin = String(row?.itinerario || "Sin itinerario").trim() || "Sin itinerario";
    if (!groups.has(itin)) groups.set(itin, []);
    groups.get(itin).push(row);
  }

  const ordered = Array.from(groups.entries()).map(([itin, items]) => {
    items.sort((a, b) => {
      const pa = Number(a?.posicion);
      const pb = Number(b?.posicion);
      if (Number.isFinite(pa) && Number.isFinite(pb) && pa !== pb) return pa - pb;
      return String(a?.hora_llegada || "").localeCompare(String(b?.hora_llegada || ""));
    });
    const listos = items.filter(r => r?.listo === true || r?.listo === "true").length;
    return { itin, items, listos };
  }).sort((a, b) => a.itin.localeCompare(b.itin, "es"));

  tablaLlegadasGrid.innerHTML = ordered.map(group => {
    const cards = group.items.map(row => {
      const listo = row?.listo === true || row?.listo === "true";
      const pos = Number.isFinite(Number(row?.posicion)) ? String(row.posicion) : "-";
      const interno = String(row?.interno || "-");
      const mid = String(row?.vehicle_id || "-");
      const baseRaw = String(row?.base ?? "").trim();
      const baseMap = getBaseNumForInterno(row?.interno);
      const baseLabel = baseMap || baseRaw || "?";
      const baseMismatch = baseMap && baseRaw && baseMap !== baseRaw;
      const baseTitle = baseMap
        ? `Base ${baseMap} (afiliacion)${baseRaw && baseRaw !== baseMap ? ` · operativa ${baseRaw}` : ""}`
        : (baseRaw ? `Base ${baseRaw} (operativa)` : "Sin base asignada");
      const driver = String(row?.driver_id || "-");
      const hora = formatTablaLlegadasDateTime(row?.hora_llegada);
      const dist = Number.isFinite(Number(row?.distancia_m)) ? `${Number(row.distancia_m)} m` : "-";
      const ubic = String(row?.ubicacion || "-");
      const cls = listo ? "veh-card is-listo" : "veh-card is-espera";
      return `<div class="${cls}">
        <div class="veh-pos">${escapeHtml(pos)}</div>
        <div class="veh-main">
          <div class="veh-head">
            <span class="veh-interno">${escapeHtml(interno)}</span>
            <span class="veh-mid">${escapeHtml(mid)}</span>
            <span class="veh-base${baseMismatch ? " is-mismatch" : ""}" title="${escapeHtml(baseTitle)}">B${escapeHtml(baseLabel)}</span>
          </div>
          <div class="veh-meta">
            <span title="Hora llegada">${escapeHtml(hora)}</span>
            <span title="Distancia">${escapeHtml(dist)}</span>
            <span title="Driver">Driver ${escapeHtml(driver)}</span>
          </div>
          <div class="veh-ubic" title="${escapeHtml(ubic)}">${escapeHtml(ubic)}</div>
        </div>
      </div>`;
    }).join("");

    return `<section class="itinerario-col">
      <header class="itinerario-col-header">
        <h4>${escapeHtml(group.itin)}</h4>
        <span class="itinerario-col-count">${group.items.length} veh</span>
      </header>
      <div class="itinerario-col-body">${cards}</div>
    </section>`;
  }).join("");
}

function fitMapaToMarkers(){
  const map = ensureMapaLeaflet();
  if (!map || !mapaMarkers.size) return;
  const points = [];
  for (const marker of mapaMarkers.values()) {
    points.push(marker.getLatLng());
  }
  if (!points.length) return;
  const bounds = L.latLngBounds(points);
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
}

async function loadMapaVehiculos(){
  if (!currentUserId) return;
  const setStatus = (txt) => {
    if (mapaVehiculosStatus) mapaVehiculosStatus.textContent = txt;
    if (tablaLlegadasStatus) tablaLlegadasStatus.textContent = txt;
  };
  setStatus("Consultando Supabase...");
  if (btnRefreshMapaVehiculos) btnRefreshMapaVehiculos.disabled = true;
  if (btnRefreshTablaLlegadas) btnRefreshTablaLlegadas.disabled = true;
  try {
    const { data, error } = await planillaSupabaseClient
      .from(MAPA_VEHICULOS_TABLE)
      .select("vehicle_id,interno,itinerario,posicion,hora_llegada,base,driver_id,distancia_m,listo,ubicacion,updated_at,lat,lon")
      .order("hora_llegada", { ascending: false })
      .limit(500);
    if (error) throw error;
    mapaVehiculosRows = Array.isArray(data) ? data : [];
    mapaVehiculosLastLoadedAt = Date.now();
    renderLlegadasVehiculosViews();
    ensureMapaRealtime();
    ensureMapaPolling();
    ensureMapaVisibilityListener();
    const stamp = new Date().toLocaleTimeString("es-CO");
    setStatus(`Actualizado ${stamp} · ${mapaVehiculosRows.length} registros`);
  } catch (err) {
    console.error(`[${MAPA_VEHICULOS_TABLE}] consulta fallo:`, err);
    setStatus(`Error: ${err?.message || "fallo"}`);
    showToast(`No se pudo cargar ${MAPA_VEHICULOS_TABLE}: ${err?.message || "fallo"}`, "err");
  } finally {
    if (btnRefreshMapaVehiculos) btnRefreshMapaVehiculos.disabled = false;
    if (btnRefreshTablaLlegadas) btnRefreshTablaLlegadas.disabled = false;
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
  renderLlegadasVehiculosViews();
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
  if (mapaVehiculosRealtime) mapaVehiculosRealtime.textContent = "Realtime: conectando...";
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
      const setLabel = (el, txt, color) => {
        if (!el) return;
        el.textContent = txt;
        el.style.color = color;
      };
      let txt = `Realtime: ${String(status || "").toLowerCase()}`;
      let color = "var(--fg-soft)";
      if (status === "SUBSCRIBED") {
        txt = "Realtime: activo";
        color = "var(--ok)";
        mapaRealtimeRetryDelay = 1000;
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        color = "var(--err)";
        try { planillaSupabaseClient.removeChannel?.(mapaRealtimeChannel); } catch (_) {}
        mapaRealtimeChannel = null;
        scheduleMapaRealtimeRetry();
        loadMapaVehiculos();
      }
      setLabel(mapaVehiculosRealtime, txt, color);
      setLabel(tablaLlegadasRealtime, txt, color);
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

function activateMapaVehiculosTab(){
  if (typeof L === "undefined") {
    if (mapaVehiculosStatus) mapaVehiculosStatus.textContent = "Leaflet no cargo (revisa conexion)";
    return;
  }
  ensureMapaLeaflet();
  setTimeout(() => {
    if (mapaLeaflet) {
      mapaLeaflet.invalidateSize();
      if (mapaMarkers.size && mapaVehiculosLastLoadedAt) fitMapaToMarkers();
    }
  }, 150);
  if (!mapaVehiculosLastLoadedAt) loadMapaVehiculos();
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

function fillManualDispatchInternoList(){
  if (!manualDispatchInternoList) return;
  const rows = getManualDispatchVehicleRows();
  manualDispatchInternoList.innerHTML = rows.map(row => {
    const interno = String(row?.interno || "").trim();
    const base = formatBaseLabel(getBaseCanonical(row?.base || "") || getManualDispatchDefaultBase());
    const mid = String(row?.mid || "").trim();
    const placa = String(row?.placa || row?.Placa || "").trim();
    const labelParts = [];
    if (placa) labelParts.push(`Placa ${placa}`);
    if (base) labelParts.push(base);
    labelParts.push(`MID ${mid || "-"}`);
    return `<option value="${escapeHtml(interno)}" label="${escapeHtml(labelParts.join(" | "))}"></option>`;
  }).join("");
}

function findManualDispatchVehicleByInterno(internoValue){
  const interno = String(internoValue || "").trim();
  if (!interno) return null;
  const rows = getManualDispatchVehicleRows();
  return rows.find(row => String(row?.interno || "").trim() === interno) || null;
}

function fillManualDispatchConductorList(baseValue){
  if (!manualDispatchConductorList) return;
  const baseCanonical = getBaseCanonical(baseValue || "");
  const enabled = (driversCatalogRows || [])
    .filter(row => String(row?.status || "").trim().toUpperCase() === "ENABLED")
    .filter(row => !baseCanonical || getCsvDriverBase(row) === baseCanonical);
  manualDispatchConductorList.innerHTML = enabled.map(row => {
    const nombre = String(row?.nombre || "").trim();
    const drId = String(row?.dr_id || "").trim();
    const value = `${nombre} | ${drId}`;
    return `<option value="${escapeHtml(value)}"></option>`;
  }).join("");
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
}

function applyManualDispatchVehicleRow(row){
  if (!row) {
    if (manualDispatchBase) manualDispatchBase.value = "";
    if (manualDispatchMid) manualDispatchMid.value = "";
    fillManualDispatchConductorList("");
    applyManualDispatchConductorSelection();
    return;
  }
  const base = getBaseCanonical(row?.base || "") || getManualDispatchDefaultBase();
  const mid = String(row?.mid || "").trim();
  if (manualDispatchBase) manualDispatchBase.value = base;
  if (manualDispatchMid) manualDispatchMid.value = mid;
  fillManualDispatchConductorList(base);
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
  await loadVehiculosSonarFromSupabase();
  fillManualDispatchInternoList();
  fillManualDispatchConductorList("");
  if (manualDispatchInterno) manualDispatchInterno.value = "";
  if (manualDispatchBase) manualDispatchBase.value = "";
  if (manualDispatchMid) manualDispatchMid.value = "";
  if (manualDispatchConductorName) manualDispatchConductorName.value = "";
  if (manualDispatchDriverId) manualDispatchDriverId.value = "";
  if (manualDispatchObs) manualDispatchObs.value = "";
  if (manualDispatchItinerarySelect) {
    manualDispatchItinerarySelect.innerHTML = buildItineraryOptionsHtml();
    manualDispatchItinerarySelect.value = "";
  }
  manualDispatchModal.classList.remove("hidden");
  setTimeout(() => manualDispatchInterno?.focus(), 10);
  return new Promise(resolve => {
    manualDispatchModalResolver = resolve;
  });
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
    loadOutOfListVehiclesLocal();
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
    outOfListVehicles = [];
    rebuildOutOfListVehicleIndex();
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

if (btnDispatchCancel) btnDispatchCancel.onclick = () => closeDispatchModal(false);
if (btnDispatchConfirm) btnDispatchConfirm.onclick = () => closeDispatchModal(true);
if (btnCancelDispatchCancel) btnCancelDispatchCancel.onclick = () => closeCancelDispatchModal(false);
if (btnCancelDispatchConfirm) btnCancelDispatchConfirm.onclick = () => closeCancelDispatchModal(true);
if (btnRemoveFromListCancel) btnRemoveFromListCancel.onclick = () => closeRemoveFromListModal(false);
if (btnRemoveFromListConfirm) btnRemoveFromListConfirm.onclick = () => closeRemoveFromListModal(true);
if (btnEditPlanillaCancel) btnEditPlanillaCancel.onclick = () => closeEditPlanillaModal(false);
if (btnEditPlanillaSave) btnEditPlanillaSave.onclick = () => closeEditPlanillaModal(true);
if (btnManualDispatchCancel) btnManualDispatchCancel.onclick = () => closeManualDispatchModal(false);
if (btnManualDispatchConfirm) btnManualDispatchConfirm.onclick = () => closeManualDispatchModal(true);
if (btnManualDispatch) btnManualDispatch.onclick = () => handleManualDispatch();
if (manualDispatchInterno) manualDispatchInterno.addEventListener("change", () => { applyManualDispatchVehicleSelection(); });
if (manualDispatchInterno) manualDispatchInterno.addEventListener("input", () => { applyManualDispatchVehicleSelection(); });
if (manualDispatchConductorName) manualDispatchConductorName.addEventListener("change", applyManualDispatchConductorSelection);
if (manualDispatchConductorName) manualDispatchConductorName.addEventListener("input", applyManualDispatchConductorSelection);
if (dispatchModal) {
  dispatchModal.addEventListener("click", (ev) => {
    if (ev.target === dispatchModal) closeDispatchModal(false);
  });
}
if (cancelDispatchModal) {
  cancelDispatchModal.addEventListener("click", (ev) => {
    if (ev.target === cancelDispatchModal) closeCancelDispatchModal(false);
  });
}
if (removeFromListModal) {
  removeFromListModal.addEventListener("click", (ev) => {
    if (ev.target === removeFromListModal) closeRemoveFromListModal(false);
  });
}
if (editPlanillaModal) {
  editPlanillaModal.addEventListener("click", (ev) => {
    if (ev.target === editPlanillaModal) closeEditPlanillaModal(false);
  });
}
if (manualDispatchModal) {
  manualDispatchModal.addEventListener("click", (ev) => {
    if (ev.target === manualDispatchModal) closeManualDispatchModal(false);
  });
}
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && dispatchModal && !dispatchModal.classList.contains("hidden")) {
    closeDispatchModal(false);
    return;
  }
  if (ev.key === "Enter" && dispatchModal && !dispatchModal.classList.contains("hidden")) {
    closeDispatchModal(true);
    return;
  }
  if (ev.key === "Escape" && cancelDispatchModal && !cancelDispatchModal.classList.contains("hidden")) {
    closeCancelDispatchModal(false);
    return;
  }
  if (ev.key === "Enter" && cancelDispatchModal && !cancelDispatchModal.classList.contains("hidden") && ev.ctrlKey) {
    closeCancelDispatchModal(true);
    return;
  }
  if (ev.key === "Escape" && removeFromListModal && !removeFromListModal.classList.contains("hidden")) {
    closeRemoveFromListModal(false);
    return;
  }
  if (ev.key === "Enter" && removeFromListModal && !removeFromListModal.classList.contains("hidden") && ev.ctrlKey) {
    closeRemoveFromListModal(true);
    return;
  }
  if (ev.key === "Escape" && editPlanillaModal && !editPlanillaModal.classList.contains("hidden")) {
    closeEditPlanillaModal(false);
    return;
  }
  if (ev.key === "Enter" && editPlanillaModal && !editPlanillaModal.classList.contains("hidden") && ev.ctrlKey) {
    closeEditPlanillaModal(true);
    return;
  }
  if (ev.key === "Escape" && manualDispatchModal && !manualDispatchModal.classList.contains("hidden")) {
    closeManualDispatchModal(false);
    return;
  }
  if (ev.key === "Enter" && manualDispatchModal && !manualDispatchModal.classList.contains("hidden")) {
    closeManualDispatchModal(true);
  }
});

/* ===================== DATA ===================== */
let rows = [];
let currentBase = "";
let driversByBase = {};     // { "2": ["NOMBRE", ...] }
let driversCatalogRows = []; // [{dr_id, cedula, fleet, nombre, status, email, celular, base}]
let assignedByBase = {};    // { "2": Set(["..."]) }
let basesCatalog = [];
let isLoadingDrivers = false;
let programacionesHistory = [];
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
let planillaAutoRefreshTimer = null;
let currentPlanillaTableName = PLANILLA_TABLE_NAME;
let aeropuertoSelectedItinerary = "";
let sanDiegoSelectedItinerary = "";
let nutibaraSelectedItinerary = "";
let lastAeropuertoRenderedRows = [];
let lastTerminalNorteRenderedRows = [];
let lastSanDiegoRenderedRows = [];
let lastNutibaraRenderedRows = [];
const dispatchingRowUiIds = new Set();
let outOfListVehicles = [];
let outOfListVehicleKeySet = new Set();
let operativoViewMode = "operativo";
const ARRIVALS_PANEL_TAB_IDS = ["llegadas-aeropuerto", "llegadas-terminalnorte", "llegadas-san-diego", "llegadas-nutibara", "no-despacho", "fuera-lista", "vehiculos-sonar", "asistencia-biometrica", "conductores-csv", "planilla-afiliados"];
const ARRIVALS_ONLY_APP = true;
const PLANILLA_REFRESH_MAX_AGE_MS = 60000;
const PLANILLA_AUTO_REFRESH_MS = 60000;
const PLANILLA_DELTA_SYNC_ENABLED = true;
const PLANILLA_FULL_SYNC_EVERY_DELTA_CYCLES = 20;
const PLANILLA_DELTA_LIMIT = 600;
const TERMINAL_NORTE_ITINERARY = "Aeropuerto-autopista-terminalnorte";
const NO_DESPACHO_THRESHOLD_MINUTES = 210; // 3 h 30 min
const ARRIVAL_DEDUPE_WINDOW_MINUTES = 30; // Ventana para consolidar llegadas repetidas
const DISPATCH_MATCH_TOLERANCE_MINUTES = 2; // tolerancia de reloj entre llegada y despacho
const DISPATCH_MAX_AFTER_ARRIVAL_MINUTES = 8 * 60; // despacho maximo esperado tras llegada
const ARRIVAL_POINT_TYPES = new Set(["101", "104", "110", "129"]);

// Estructura para novedades (conductores con estado)
let novedades = []; // Array de objetos { nombre, base, estado, fecha }
const AppState = {
  get hasRows(){
    return Array.isArray(rows) && rows.length > 0;
  },
  clearProgramacion(){
    rows = [];
    assignedByBase = {};
  },
  replaceRows(nextRows){
    rows = Array.isArray(nextRows) ? nextRows : [];
    assignedByBase = {};
  }
};

const NOVEDADES = {
  DISPONIBLE: { class: 'disponible', color: '#22c55e', label: 'Disponible' },
  INCAPACITADO: { class: 'incapacitado', color: '#ef4444', label: 'Incapacitado' },
  PERMISO: { class: 'permiso', color: '#f59e0b', label: 'Permiso' },
  DESCANSO: { class: 'descanso', color: '#6b7280', label: 'Descanso' },
  VACACIONES: { class: 'vacaciones', color: '#0ea5e9', label: 'Vacaciones' },
  "RECONOCIMIENTO DE RUTA": { class: 'reconocimiento_ruta', color: '#7c3aed', label: 'Reconocimiento de ruta' },
  "DIA NO REMUNERADO": { class: 'dia_no_remunerado', color: '#b45309', label: 'Dia no remunerado' },
  CALAMIDAD: { class: 'calamidad', color: '#be123c', label: 'Calamidad' },
  RENUNCIA: { class: 'renuncia', color: '#334155', label: 'Renuncia' },
  PENDIENTE: { class: 'pendiente', color: '#9ca3af', label: 'Pendiente' }
};

// Importante: PUESTO (NUTIBARA/SAN DIEGO/EXPOSICIONES) no representa la base operativa.
const BASE_COLUMN_ALIASES = ["BASE", "PATIO", "ESTACION", "ESTACIÓN"];

/* ===================== UI ===================== */
const operativoPanel = document.getElementById("operativoPanel");
const operativoInner = document.getElementById("operativoInner");
const btnRefreshConductoresCsv = document.getElementById("btnRefreshConductoresCsv");
const conductoresCsvSearch = document.getElementById("conductoresCsvSearch");
const conductoresCsvBaseFilter = document.getElementById("conductoresCsvBaseFilter");
const conductoresCsvStatusFilter = document.getElementById("conductoresCsvStatusFilter");
const conductoresCsvCount = document.getElementById("conductoresCsvCount");
const conductoresCsvStatus = document.getElementById("conductoresCsvStatus");
const conductoresCsvBody = document.getElementById("conductoresCsvBody");
const btnRefreshVehiculosSonar = document.getElementById("btnRefreshVehiculosSonar");
const vehiculosSonarSearch = document.getElementById("vehiculosSonarSearch");
const vehiculosSonarCount = document.getElementById("vehiculosSonarCount");
const vehiculosSonarStatus = document.getElementById("vehiculosSonarStatus");
const vehiculosSonarBody = document.getElementById("vehiculosSonarBody");
const btnRefreshDespachosSonar = document.getElementById("btnRefreshDespachosSonar");
const despachosSonarSearch = document.getElementById("despachosSonarSearch");
const despachosSonarItinChips = document.getElementById("despachosSonarItinChips");
const despachosSonarCount = document.getElementById("despachosSonarCount");
const despachosSonarStatus = document.getElementById("despachosSonarStatus");
const despachosSonarBody = document.getElementById("despachosSonarBody");
const btnRefreshMapaVehiculos = document.getElementById("btnRefreshMapaVehiculos");
const btnFitMapaVehiculos = document.getElementById("btnFitMapaVehiculos");
const mapaVehiculosContainer = document.getElementById("mapaVehiculosContainer");
const mapaVehiculosCount = document.getElementById("mapaVehiculosCount");
const mapaVehiculosStatus = document.getElementById("mapaVehiculosStatus");
const mapaVehiculosRealtime = document.getElementById("mapaVehiculosRealtime");
const btnRefreshTablaLlegadas = document.getElementById("btnRefreshTablaLlegadas");
const tablaLlegadasSearch = document.getElementById("tablaLlegadasSearch");
const tablaLlegadasGrid = document.getElementById("tablaLlegadasGrid");
const tablaLlegadasCount = document.getElementById("tablaLlegadasCount");
const tablaLlegadasStatus = document.getElementById("tablaLlegadasStatus");
const tablaLlegadasRealtime = document.getElementById("tablaLlegadasRealtime");
const btnRefreshHistorialDespachos = document.getElementById("btnRefreshHistorialDespachos");
const historialDespachosSearch = document.getElementById("historialDespachosSearch");
const historialDespachosEstadoFilter = document.getElementById("historialDespachosEstadoFilter");
const historialDespachosRangeFilter = document.getElementById("historialDespachosRangeFilter");
const historialDespachosItinChips = document.getElementById("historialDespachosItinChips");
const historialInsights = document.getElementById("historialInsights");
const historialDespachosCount = document.getElementById("historialDespachosCount");
const historialDespachosStatus = document.getElementById("historialDespachosStatus");
const historialDespachosBody = document.getElementById("historialDespachosBody");
const btnRefreshPreopSicov = document.getElementById("btnRefreshPreopSicov");
const preopSicovSearch = document.getElementById("preopSicovSearch");
const preopSicovFrom = document.getElementById("preopSicovFrom");
const preopSicovTo = document.getElementById("preopSicovTo");
const preopSicovPageSize = document.getElementById("preopSicovPageSize");
const preopSicovTotal = document.getElementById("preopSicovTotal");
const preopSicovStatus = document.getElementById("preopSicovStatus");
const preopSicovBody = document.getElementById("preopSicovBody");
const preopSicovPage = document.getElementById("preopSicovPage");
const preopSicovPages = document.getElementById("preopSicovPages");
const btnPreopSicovFirst = document.getElementById("btnPreopSicovFirst");
const btnPreopSicovPrev = document.getElementById("btnPreopSicovPrev");
const btnPreopSicovNext = document.getElementById("btnPreopSicovNext");
const btnPreopSicovLast = document.getElementById("btnPreopSicovLast");
const asistenciaBiometricaFrame = document.getElementById("asistenciaBiometricaFrame");
const btnReloadAsistenciaBiometrica = document.getElementById("btnReloadAsistenciaBiometrica");
const BIOMETRICO_ORIGIN = "https://desarrollocombuses.github.io";

async function getBiometricoSessionPayload(){
  try {
    const { data } = await authSupabaseClient.auth.getSession();
    const s = data?.session;
    if (!s || !s.access_token || !s.refresh_token) return null;
    return {
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: s.expires_at ?? null,
      token_type: s.token_type || "bearer",
      user_email: s.user?.email || currentUserEmail || ""
    };
  } catch (_) { return null; }
}

async function pushBiometricoSession(){
  if (!asistenciaBiometricaFrame || !asistenciaBiometricaFrame.contentWindow) {
    console.warn("[biometrico-autologin] iframe no disponible");
    return;
  }
  const payload = await getBiometricoSessionPayload();
  if (!payload) {
    console.warn("[biometrico-autologin] sin sesion Supabase para enviar");
    return;
  }
  try {
    asistenciaBiometricaFrame.contentWindow.postMessage(
      { type: "BIOMETRICO_SESSION", payload },
      BIOMETRICO_ORIGIN
    );
    console.info("[biometrico-autologin] sesion enviada al iframe", payload.user_email);
  } catch (e) {
    console.error("[biometrico-autologin] postMessage fallo:", e);
  }
}

function setupBiometricoAutoLogin(){
  if (!asistenciaBiometricaFrame) return;
  console.info("[biometrico-autologin] listener instalado, esperando iframe");
  asistenciaBiometricaFrame.addEventListener("load", () => {
    console.info("[biometrico-autologin] iframe load detectado");
    pushBiometricoSession();
  });
  window.addEventListener("message", (event) => {
    if (event.origin !== BIOMETRICO_ORIGIN) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "BIOMETRICO_READY") {
      console.info("[biometrico-autologin] iframe READY recibido");
      pushBiometricoSession();
    }
    if (data.type === "BIOMETRICO_SESSION_OK") {
      console.info("[biometrico-autologin] iframe confirmo login", data.email || "");
    }
    if (data.type === "BIOMETRICO_SESSION_FAIL") {
      console.error("[biometrico-autologin] iframe reporto error:", data.error || "");
    }
  });
  try {
    authSupabaseClient.auth.onAuthStateChange((_evt, _session) => { pushBiometricoSession(); });
  } catch (_) { /* sdk sin onAuthStateChange */ }
}
const mobileTabSwitcher = document.getElementById("mobileTabSwitcher");
const mobileTabSelect = document.getElementById("mobileTabSelect");
const planillaFilterInterno = document.getElementById("planillaFilterInterno");
const planillaFilterBase = document.getElementById("planillaFilterBase");
const planillaFilterTipo = document.getElementById("planillaFilterTipo");
const planillaFilterHoraLlegada = document.getElementById("planillaFilterHoraLlegada");
const planillaTableSource = document.getElementById("planillaTableSource");
const btnRefreshPlanilla = document.getElementById("btnRefreshPlanilla");
const btnDownloadLlegadas = document.getElementById("btnDownloadLlegadas");
const btnDownloadDespachos = document.getElementById("btnDownloadDespachos");
const planillaStatus = document.getElementById("planillaStatus");
const planillaCount = document.getElementById("planillaCount");
const planillaHead = document.getElementById("planillaHead");
const planillaBody = document.getElementById("planillaBody");
const btnRefreshLlegadasAeropuerto = document.getElementById("btnRefreshLlegadasAeropuerto");
const aeropuertoSearch = document.getElementById("aeropuertoSearch");
const aeropuertoEstadoFilter = document.getElementById("aeropuertoEstadoFilter");
const aeropuertoBaseFilter = document.getElementById("aeropuertoBaseFilter");
const aeropuertoUploadFrom = document.getElementById("aeropuertoUploadFrom");
const aeropuertoUploadTo = document.getElementById("aeropuertoUploadTo");
const btnDownloadLlegadasAeropuerto = document.getElementById("btnDownloadLlegadasAeropuerto");
const llegadasAeropuertoTitle = document.getElementById("llegadasAeropuertoTitle");
const llegadasAeropuertoCount = document.getElementById("llegadasAeropuertoCount");
const llegadasAeropuertoStatus = document.getElementById("llegadasAeropuertoStatus");
const llegadasAeropuertoBody = document.getElementById("llegadasAeropuertoBody");
const llegadasAeropuertoTabs = document.getElementById("llegadasAeropuertoTabs");
const btnRefreshLlegadasTerminalNorte = document.getElementById("btnRefreshLlegadasTerminalNorte");
const terminalNorteSearch = document.getElementById("terminalNorteSearch");
const terminalNorteEstadoFilter = document.getElementById("terminalNorteEstadoFilter");
const terminalNorteBaseFilter = document.getElementById("terminalNorteBaseFilter");
const terminalNorteUploadFrom = document.getElementById("terminalNorteUploadFrom");
const terminalNorteUploadTo = document.getElementById("terminalNorteUploadTo");
const btnDownloadLlegadasTerminalNorte = document.getElementById("btnDownloadLlegadasTerminalNorte");
const llegadasTerminalNorteTitle = document.getElementById("llegadasTerminalNorteTitle");
const llegadasTerminalNorteCount = document.getElementById("llegadasTerminalNorteCount");
const llegadasTerminalNorteStatus = document.getElementById("llegadasTerminalNorteStatus");
const llegadasTerminalNorteBody = document.getElementById("llegadasTerminalNorteBody");
const btnRefreshLlegadasSanDiego = document.getElementById("btnRefreshLlegadasSanDiego");
const sanDiegoSearch = document.getElementById("sanDiegoSearch");
const sanDiegoEstadoFilter = document.getElementById("sanDiegoEstadoFilter");
const sanDiegoBaseFilter = document.getElementById("sanDiegoBaseFilter");
const sanDiegoUploadFrom = document.getElementById("sanDiegoUploadFrom");
const sanDiegoUploadTo = document.getElementById("sanDiegoUploadTo");
const btnDownloadLlegadasSanDiego = document.getElementById("btnDownloadLlegadasSanDiego");
const llegadasSanDiegoTitle = document.getElementById("llegadasSanDiegoTitle");
const llegadasSanDiegoCount = document.getElementById("llegadasSanDiegoCount");
const llegadasSanDiegoStatus = document.getElementById("llegadasSanDiegoStatus");
const llegadasSanDiegoBody = document.getElementById("llegadasSanDiegoBody");
const llegadasSanDiegoTabs = document.getElementById("llegadasSanDiegoTabs");
const btnRefreshLlegadasNutibara = document.getElementById("btnRefreshLlegadasNutibara");
const nutibaraSearch = document.getElementById("nutibaraSearch");
const nutibaraEstadoFilter = document.getElementById("nutibaraEstadoFilter");
const nutibaraBaseFilter = document.getElementById("nutibaraBaseFilter");
const nutibaraUploadFrom = document.getElementById("nutibaraUploadFrom");
const nutibaraUploadTo = document.getElementById("nutibaraUploadTo");
const btnDownloadLlegadasNutibara = document.getElementById("btnDownloadLlegadasNutibara");
const llegadasNutibaraTitle = document.getElementById("llegadasNutibaraTitle");
const llegadasNutibaraCount = document.getElementById("llegadasNutibaraCount");
const llegadasNutibaraStatus = document.getElementById("llegadasNutibaraStatus");
const llegadasNutibaraBody = document.getElementById("llegadasNutibaraBody");
const llegadasNutibaraTabs = document.getElementById("llegadasNutibaraTabs");
const btnRefreshNoDespacho = document.getElementById("btnRefreshNoDespacho");
const noDespachoSearch = document.getElementById("noDespachoSearch");
const noDespachoPuntoFilter = document.getElementById("noDespachoPuntoFilter");
const noDespachoBaseFilter = document.getElementById("noDespachoBaseFilter");
const noDespachoFrom = document.getElementById("noDespachoFrom");
const noDespachoTo = document.getElementById("noDespachoTo");
const noDespachoTitle = document.getElementById("noDespachoTitle");
const noDespachoCount = document.getElementById("noDespachoCount");
const noDespachoStatus = document.getElementById("noDespachoStatus");
const noDespachoBody = document.getElementById("noDespachoBody");
const fueraListaSearch = document.getElementById("fueraListaSearch");
const fueraListaCount = document.getElementById("fueraListaCount");
const fueraListaBody = document.getElementById("fueraListaBody");
const fueraListaStatus = document.getElementById("fueraListaStatus");

/* ===================== UTIL ===================== */
function norm(s){ return (s||"").toString().trim().toUpperCase(); }
function normCompact(s){ return norm(s).replace(/\s+/g, ""); }

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

function sameBase(a, b){
  const ca = getBaseCanonical(a);
  const cb = getBaseCanonical(b);
  return !!ca && !!cb && ca === cb;
}

function getCsvDriverBase(row){
  const rawEmail = String(row?.email || "").trim();
  const fromEmail = rawEmail.match(/BASE\s*(\d+)/i)?.[1] || "";
  const rawBase = String(row?.base || "").trim();
  const raw = fromEmail || rawBase;
  return getBaseCanonical(raw);
}

function getFilteredDriversCatalogRows(){
  const rows = Array.isArray(driversCatalogRows) ? driversCatalogRows : [];
  const term = String(conductoresCsvSearch?.value || "").trim().toLowerCase();
  const base = String(conductoresCsvBaseFilter?.value || "").trim();
  const status = String(conductoresCsvStatusFilter?.value || "ENABLED").trim().toUpperCase();
  return rows.filter(row => {
    const rowBase = getCsvDriverBase(row);
    const rowStatus = String(row?.status || "").trim().toUpperCase();
    if (base && rowBase !== base) return false;
    if (status && rowStatus !== status) return false;
    if (!term) return true;
    const tokens = [
      row?.dr_id,
      row?.cedula,
      row?.nombre,
      row?.status,
      row?.email,
      row?.celular,
      rowBase
    ];
    return tokens.join(" ").toLowerCase().includes(term);
  });
}

function refreshConductoresCsvBaseOptions(){
  if (!conductoresCsvBaseFilter) return;
  const prev = String(conductoresCsvBaseFilter.value || "");
  const setBases = new Set();
  (driversCatalogRows || []).forEach(row => {
    const base = getCsvDriverBase(row);
    if (base) setBases.add(base);
  });
  const options = Array.from(setBases).sort((a, b) => Number(a) - Number(b));
  conductoresCsvBaseFilter.innerHTML = `<option value="">Todas las bases</option>${
    options.map(base => `<option value="${escapeHtml(base)}">${escapeHtml(formatBaseLabel(base))}</option>`).join("")
  }`;
  if (prev && options.includes(prev)) conductoresCsvBaseFilter.value = prev;
}

function renderConductoresCsvTab(){
  if (!conductoresCsvBody) return;
  const filtered = getFilteredDriversCatalogRows();
  if (conductoresCsvCount) conductoresCsvCount.textContent = String(filtered.length);
  if (!filtered.length) {
    conductoresCsvBody.innerHTML = `<tr><td colspan="7" class="muted" style="text-align:center;padding:12px">Sin conductores para los filtros.</td></tr>`;
    return;
  }
  conductoresCsvBody.innerHTML = filtered.map(row => {
    const base = getCsvDriverBase(row);
    return `<tr>
      <td>${escapeHtml(formatPlanillaCell(row?.dr_id))}</td>
      <td>${escapeHtml(formatPlanillaCell(row?.cedula))}</td>
      <td>${escapeHtml(base ? formatBaseLabel(base) : "-")}</td>
      <td>${escapeHtml(formatPlanillaCell(row?.nombre))}</td>
      <td>${escapeHtml(formatPlanillaCell(row?.status))}</td>
      <td>${escapeHtml(formatPlanillaCell(row?.email))}</td>
      <td>${escapeHtml(formatPlanillaCell(row?.celular))}</td>
    </tr>`;
  }).join("");
}

function escapeHtml(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPlanillaCell(value){
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
}

function getPlanillaRowStableKey(row){
  if (!row || typeof row !== "object") return "";
  const id = String(row?.id ?? "").trim();
  if (id) return `id:${id}`;
  const cruce = String(row?.cruce_key ?? "").trim();
  if (cruce) return `cruce:${cruce}`;
  const parts = [
    String(row?.tipo_llegada ?? "").trim(),
    String(row?.base ?? "").trim(),
    String(row?.interno ?? "").trim(),
    String(row?.mid ?? "").trim(),
    String(row?.hora_llegada ?? "").trim(),
    String(row?.generated_at ?? row?.generado_en ?? row?.created_at ?? "").trim()
  ];
  return `row:${parts.join("|")}`;
}

function getRowVehicleKey(row){
  const interno = formatPlanillaCell(row?.interno).trim();
  const mid = formatPlanillaCell(row?.mid).trim();
  return interno || mid || "";
}

function invalidatePlanillaDispatchResolutionCache(){
  planillaRowsRevision += 1;
  planillaDispatchResolutionCache.rowsRef = null;
  planillaDispatchResolutionCache.revision = -1;
  planillaDispatchResolutionCache.resolvedByKey = new Map();
}

function mapTipoLlegada(value){
  const code = String(value ?? "").trim();
  if (code === "104") return "Llegada Aeropuerto";
  if (code === "101") return "Llegada San Diego";
  if (code === "110") return "Llegada Nutibara";
  return code || "-";
}

function getPlanillaDisplayColumnKeys(rowsInput){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  const preferred = currentPlanillaTableName === PLANILLA_TABLE_NAME ? PLANILLA_AFILIADOS_2_COLUMNS : [];
  const ordered = [];
  const seen = new Set();
  preferred.forEach(col => {
    const k = String(col || "").trim();
    if (!k || seen.has(k)) return;
    seen.add(k);
    ordered.push(k);
  });
  rows.forEach(row => {
    if (!row || typeof row !== "object") return;
    Object.keys(row).forEach(key => {
      const k = String(key || "").trim();
      if (!k || seen.has(k)) return;
      seen.add(k);
      ordered.push(k);
    });
  });
  return ordered;
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

function formatPlanillaHeaderLabel(key){
  const raw = String(key || "").trim();
  if (!raw) return "-";
  return raw.replace(/_/g, " ");
}

function getPlanillaFilteredRows(rowsInput){
  const rowsList = Array.isArray(rowsInput) ? rowsInput : [];
  const internoTerm = String(planillaFilterInterno?.value || "").trim().toLowerCase();
  const baseTerm = String(planillaFilterBase?.value || "").trim().toLowerCase();
  const tipoTerm = String(planillaFilterTipo?.value || "").trim().toLowerCase();
  const horaLlegadaTerm = String(planillaFilterHoraLlegada?.value || "").trim().toLowerCase();
  const filtered = rowsList.filter(row => {
    const internoOk = !internoTerm || formatPlanillaCell(row?.interno).toLowerCase().includes(internoTerm);
    const baseOk = !baseTerm || formatPlanillaCell(row?.base).toLowerCase().includes(baseTerm);
    const tipoTxt = mapTipoLlegada(row?.tipo_llegada).toLowerCase();
    const tipoOk = !tipoTerm || tipoTxt.includes(tipoTerm);
    const horaLlegadaOk = !horaLlegadaTerm || formatPlanillaCell(row?.hora_llegada).toLowerCase().includes(horaLlegadaTerm);
    return internoOk && baseOk && tipoOk && horaLlegadaOk;
  });
  const ordered = filtered.sort(comparePlanillaRowsByCurrentDateTime);
  return dedupeLlegadasByHour(ordered);
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

function formatPlanillaDateTime(value){
  const date = parsePlanillaDateTime(value);
  if (!date) return formatPlanillaCell(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function toIsoDateFromDateTime(value){
  const date = parsePlanillaDateTime(value);
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getPlanillaUploadDateIso(row){
  return toIsoDateFromDateTime(row?.generado_en || row?.created_at || row?.hora_llegada || row?.hora_despacho);
}

function getPlanillaUploadDateText(row){
  return formatPlanillaDateTime(row?.generado_en || row?.created_at);
}

function getLlegadaDateForMatching(row){
  return parsePlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.created_at);
}

function getRawDespachoDate(row){
  return parsePlanillaDateTime(row?.hora_despacho);
}

function isDispatchChronologicallyValid(despDate, llegadaDate, nextLlegadaDate){
  if (!(despDate instanceof Date) || Number.isNaN(despDate.getTime())) return false;
  if (!(llegadaDate instanceof Date) || Number.isNaN(llegadaDate.getTime())) return true;
  const tolMs = DISPATCH_MATCH_TOLERANCE_MINUTES * 60000;
  const maxAfterMs = DISPATCH_MAX_AFTER_ARRIVAL_MINUTES * 60000;
  const despMs = despDate.getTime();
  const llegadaMs = llegadaDate.getTime();
  if (despMs < (llegadaMs - tolMs)) return false;
  if ((despMs - llegadaMs) > maxAfterMs) return false;
  if (nextLlegadaDate instanceof Date && !Number.isNaN(nextLlegadaDate.getTime())) {
    const nextMs = nextLlegadaDate.getTime();
    if (despMs > (nextMs + tolMs)) return false;
  }
  return true;
}

function ensurePlanillaDispatchResolutionCache(){
  if (planillaDispatchResolutionCache.rowsRef === planillaAfiliadosRows
    && planillaDispatchResolutionCache.revision === planillaRowsRevision) {
    return;
  }
  const rows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  const byVehicle = new Map();
  rows.forEach(row => {
    const vehicleKey = getRowVehicleKey(row);
    if (!vehicleKey) return;
    if (!byVehicle.has(vehicleKey)) {
      byVehicle.set(vehicleKey, { arrivals: [], dispatches: [] });
    }
    const bucket = byVehicle.get(vehicleKey);
    const llegadaDate = getLlegadaDateForMatching(row);
    if (llegadaDate) bucket.arrivals.push({ row, timeMs: llegadaDate.getTime() });
    const despachoDate = getRawDespachoDate(row);
    if (despachoDate) bucket.dispatches.push({ row, date: despachoDate, timeMs: despachoDate.getTime() });
  });

  const resolvedByKey = new Map();
  byVehicle.forEach(bucket => {
    bucket.arrivals.sort((a, b) => a.timeMs - b.timeMs);
    bucket.dispatches.sort((a, b) => a.timeMs - b.timeMs);
    const assignedDispatchByArrivalIndex = new Array(bucket.arrivals.length).fill(null);
    const tolMs = DISPATCH_MATCH_TOLERANCE_MINUTES * 60000;
    const maxAfterMs = DISPATCH_MAX_AFTER_ARRIVAL_MINUTES * 60000;

    // Emparejamiento 1:1: cada despacho se pega a la llegada mas reciente compatible.
    bucket.dispatches.forEach(dispatchItem => {
      let targetIdx = -1;
      for (let i = bucket.arrivals.length - 1; i >= 0; i--) {
        if (assignedDispatchByArrivalIndex[i]) continue;
        const arrivalMs = bucket.arrivals[i].timeMs;
        const diff = dispatchItem.timeMs - arrivalMs;
        if (arrivalMs > (dispatchItem.timeMs + tolMs)) continue; // llegada posterior al despacho
        if (diff < -tolMs) continue; // despacho demasiado antes de llegada
        if (diff > maxAfterMs) continue; // despacho demasiado tarde para esa llegada
        targetIdx = i;
        break;
      }
      if (targetIdx >= 0) {
        assignedDispatchByArrivalIndex[targetIdx] = dispatchItem;
      }
    });

    bucket.arrivals.forEach((entry, idx) => {
      const row = entry.row;
      const rowKey = getPlanillaRowStableKey(row);
      if (!rowKey) return;
      const arrivalDate = new Date(entry.timeMs);
      const matched = assignedDispatchByArrivalIndex[idx];
      if (matched?.date && isDispatchChronologicallyValid(matched.date, arrivalDate, null)) {
        resolvedByKey.set(rowKey, {
          date: matched.date,
          sourceRow: matched.row
        });
        return;
      }
      const directDesp = getRawDespachoDate(row);
      if (isDispatchChronologicallyValid(directDesp, arrivalDate, null)) {
        resolvedByKey.set(rowKey, {
          date: directDesp,
          sourceRow: row
        });
        return;
      }
      resolvedByKey.set(rowKey, null);
    });
  });

  planillaDispatchResolutionCache.rowsRef = planillaAfiliadosRows;
  planillaDispatchResolutionCache.revision = planillaRowsRevision;
  planillaDispatchResolutionCache.resolvedByKey = resolvedByKey;
}

function getResolvedDispatchInfo(row){
  const rowKey = getPlanillaRowStableKey(row);
  if (!rowKey) return null;
  ensurePlanillaDispatchResolutionCache();
  if (planillaDispatchResolutionCache.resolvedByKey.has(rowKey)) {
    return planillaDispatchResolutionCache.resolvedByKey.get(rowKey) || null;
  }
  const direct = getRawDespachoDate(row);
  if (!direct) return null;
  return { date: direct, sourceRow: row };
}

function hasValidDespacho(row){
  const info = getResolvedDispatchInfo(row);
  return !!(info?.date instanceof Date);
}

function getDespachoDateTimeText(row){
  const info = getResolvedDispatchInfo(row);
  if (!info?.date) return "-";
  return formatPlanillaDateTime(info.date);
}

function getOperacionEstadoText(row){
  if (hasValidDespacho(row)) return "Despachado";
  return "En espera";
}

function getDisplayItinerarioByEstado(row){
  const itinLlegada = formatPlanillaCell(row?.itinerario_llegada).trim();
  const itinDespacho = getItinerarioDespachoText(row);
  if (!hasValidDespacho(row)) {
    return itinLlegada || "-";
  }
  return itinDespacho || itinLlegada || "-";
}

function getItinerarioLlegadaText(row){
  const itin = formatPlanillaCell(row?.itinerario_llegada).trim();
  return itin || "-";
}

function getItinerarioDespachoText(row){
  const info = getResolvedDispatchInfo(row);
  const sourceRow = info?.sourceRow || row;
  const itin = formatPlanillaCell(sourceRow?.itinerario_despacho).trim();
  return itin || "-";
}

function getPlanillaResolvedDispatchSourceRow(row){
  const info = getResolvedDispatchInfo(row);
  return info?.sourceRow || row;
}

function getPlanillaDisplayValueByColumn(row, columnName){
  const col = String(columnName || "").trim().toLowerCase();
  if (col === "hora_despacho") return getDespachoDateTimeText(row);
  if (col === "itinerario_despacho") return getItinerarioDespachoText(row);
  if (col === "estado") return getOperacionEstadoText(row);
  if (col === "conductor") {
    const source = getPlanillaResolvedDispatchSourceRow(row);
    return formatPlanillaCell(source?.conductor || row?.conductor);
  }
  if (col === "driver_id") {
    const source = getPlanillaResolvedDispatchSourceRow(row);
    return formatPlanillaCell(source?.driver_id || row?.driver_id);
  }
  return formatPlanillaCell(row?.[columnName]);
}

function getItinerarioLlegadaCellHtml(row){
  const itin = escapeHtml(getItinerarioLlegadaText(row));
  const itinColor = getItinerarioTextColorByRow(row);
  if (hasValidDespacho(row)) {
    return `<strong style="color:${itinColor}">${itin}</strong>`;
  }
  return `<strong style="color:${itinColor}">${itin}</strong> <span style="display:inline-block;margin-left:6px;padding:2px 8px;border:1px solid #fdba74;border-radius:999px;background:#fff7ed;color:#9a3412;font-size:12px;line-height:1.2" title="Vehiculo en espera por este itinerario de llegada">En espera</span>`;
}

function getItineraryGroupLabel(itinValue){
  const raw = String(itinValue || "").trim();
  if (!raw || raw === "-" || raw.toLowerCase() === "sin itinerario") {
    return "Proximos a despachar";
  }
  return raw;
}

function getItineraryThemeByRows(rowsInput, estadoMode){
  const mode = String(estadoMode || "").trim().toLowerCase();
  if (mode === "en_espera") return "espera";
  if (mode === "despachado") return "despachado";
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  if (!rows.length) return "mixed";
  const hasDesp = rows.some(r => hasValidDespacho(r));
  const hasEspera = rows.some(r => !hasValidDespacho(r));
  if (hasDesp && !hasEspera) return "despachado";
  if (!hasDesp && hasEspera) return "espera";
  return "mixed";
}

function getItineraryButtonStyle(theme, active){
  if (theme === "espera") {
    return active
      ? "background:#b45309;border-color:#b45309;color:#ffffff"
      : "background:#fff7ed;border-color:#fdba74;color:#9a3412";
  }
  if (theme === "despachado") {
    return active
      ? "background:#047857;border-color:#047857;color:#ffffff"
      : "background:#ecfdf5;border-color:#86efac;color:#065f46";
  }
  return "";
}

function getItinerarioTextColorByRow(row){
  return hasValidDespacho(row) ? "#065f46" : "#9a3412";
}

function normalizeItineraryKey(value){
  return String(value || "").trim().toLowerCase();
}

function getGroupingItineraryForRow(row, estadoMode){
  const mode = String(estadoMode || "").trim().toLowerCase();
  if (mode === "en_espera") {
    if (hasValidDespacho(row)) return getItinerarioDespachoText(row);
    return getItinerarioLlegadaText(row);
  }
  return getDisplayItinerarioByEstado(row);
}

function rowMatchesSelectedItinerary(row, selectedItinerary, estadoMode){
  const selectedKey = normalizeItineraryKey(selectedItinerary);
  if (!selectedKey) return false;
  const mode = String(estadoMode || "").trim().toLowerCase();
  if (mode === "en_espera") {
    if (hasValidDespacho(row)) {
      return normalizeItineraryKey(getItinerarioDespachoText(row)) === selectedKey;
    }
    return normalizeItineraryKey(getItinerarioLlegadaText(row)) === selectedKey;
  }
  return normalizeItineraryKey(getGroupingItineraryForRow(row, mode)) === selectedKey;
}

function getRowsFilteredByUploadDate(rowsInput, fromIso, toIso){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  if (!fromIso && !toIso) return rows;
  return rows.filter(row => {
    const uploadIso = getPlanillaUploadDateIso(row);
    if (!uploadIso) return false;
    if (fromIso && uploadIso < fromIso) return false;
    if (toIso && uploadIso > toIso) return false;
    return true;
  });
}

function getRowsFilteredByEstado(rowsInput, estadoMode){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  const mode = String(estadoMode || "").trim().toLowerCase();
  if (!mode) return rows;
  let filtered = rows.filter(row => {
    const isDespachado = hasValidDespacho(row);
    if (mode === "en_espera") return !isDespachado;
    if (mode === "despachado") return isDespachado;
    return true;
  });
  if (mode === "en_espera") {
    filtered = getRowsFilteredByEsperaOperationalDay(filtered);
  }
  return filtered;
}

function isSameLocalCalendarDate(a, b){
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getRowsFilteredByEsperaOperationalDay(rowsInput){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  if (!rows.length) return rows;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  return rows.filter(row => {
    const date = getLlegadaReferenceDate(row);
    if (!date) return false;

    if (isSameLocalCalendarDate(date, now)) return true;
    if (isSameLocalCalendarDate(date, yesterday) && date.getHours() >= 21) return true;
    return false;
  });
}

function getRowsFilteredBySearchTerm(rowsInput, searchTerm){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  const term = String(searchTerm || "").trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(row => {
    const tokens = [
      formatPlanillaDateTime(row?.hora_llegada),
      getPlanillaUploadDateText(row),
      formatTimeAgoEs(getLlegadaReferenceDate(row)),
      formatPlanillaCell(row?.base),
      formatPlanillaCell(row?.interno),
      getItinerarioLlegadaText(row),
      getItinerarioDespachoText(row),
      getDespachoDateTimeText(row),
      getOperacionEstadoText(row),
      formatPlanillaCell(row?.conductor),
      formatPlanillaCell(row?.estado),
      mapTipoLlegada(row?.tipo_llegada)
    ];
    return tokens.join(" ").toLowerCase().includes(term);
  });
}

function getRowsFilteredByBase(rowsInput, baseFilterValue){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  const selected = String(baseFilterValue || "").trim().toLowerCase();
  if (!selected) return rows;
  return rows.filter(row => {
    const rawBase = formatPlanillaCell(row?.base).trim();
    if (!rawBase) return false;
    const canonical = getBaseCanonical(rawBase);
    const canonicalText = canonical ? String(canonical).toLowerCase() : "";
    const formatted = canonical ? formatBaseLabel(canonical).toLowerCase() : rawBase.toLowerCase();
    const rawLower = rawBase.toLowerCase();
    return rawLower === selected
      || canonicalText === selected
      || formatted === selected;
  });
}

function syncLlegadasBaseFilterOptions(selectEl, rowsInput){
  if (!selectEl) return;
  const previous = String(selectEl.value || "");
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  const options = [];
  const seen = new Set();
  rows.forEach(row => {
    const raw = formatPlanillaCell(row?.base).trim();
    if (!raw) return;
    const canonical = getBaseCanonical(raw);
    const value = canonical ? String(canonical) : raw.toLowerCase();
    if (!value || seen.has(value)) return;
    seen.add(value);
    options.push({
      value,
      label: canonical ? formatBaseLabel(canonical) : raw
    });
  });
  options.sort((a, b) => a.label.localeCompare(b.label, "es", { numeric: true }));
  selectEl.innerHTML = `<option value="">Todas las bases</option>${
    options.map(opt => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`).join("")
  }`;
  if (previous && options.some(opt => String(opt.value) === previous)) {
    selectEl.value = previous;
  } else {
    selectEl.value = "";
  }
}

function getLlegadasRowsForView(tipoCode, options = {}){
  const searchTerm = String(options.searchTerm || "");
  const fromIso = String(options.fromIso || "").trim();
  const toIso = String(options.toIso || "").trim();
  const estadoMode = String(options.estadoMode || "");
  const baseFilterValue = String(options.baseFilterValue || "");
  const hasExplicitFilters = !!searchTerm.trim() || !!fromIso || !!toIso || !!estadoMode;
  const rows = getLlegadasRowsByTipo(tipoCode, { preferToday: !hasExplicitFilters });
  const byEstado = getRowsFilteredByEstado(rows, estadoMode);
  const byDate = getRowsFilteredByUploadDate(byEstado, fromIso, toIso);
  const byBase = getRowsFilteredByBase(byDate, baseFilterValue);
  return getRowsFilteredBySearchTerm(byBase, searchTerm);
}

function exportPlanillaRowsToExcel(rowsInput, mode, filePrefix){
  if (!window.XLSX) {
    showToast("No se pudo cargar XLSX para exportar.", "err");
    return;
  }
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  if (!rows.length) {
    showToast("No hay datos para exportar.", "warn");
    return;
  }
  const mapped = rows.map(row => {
    const base = {
      "Fecha subida": getPlanillaUploadDateText(row),
      "Tipo": mapTipoLlegada(row?.tipo_llegada),
      "Base": formatPlanillaCell(row?.base),
      "Interno": formatPlanillaCell(row?.interno),
      "Conductor": formatPlanillaCell(row?.conductor),
      "Estado": formatPlanillaCell(row?.estado),
      "Espera": formatPlanillaCell(row?.espera)
    };
    if (mode === "despachos") {
      return {
        "Hora despacho": getDespachoDateTimeText(row),
        "Itinerario despacho": getItinerarioDespachoText(row),
        ...base
      };
    }
    return {
      "Hora llegada": formatPlanillaDateTime(row?.hora_llegada),
      "Itinerario llegada": formatPlanillaCell(row?.itinerario_llegada),
      ...base
    };
  });
  const ws = XLSX.utils.json_to_sheet(mapped);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, mode === "despachos" ? "Despachos" : "Llegadas");
  const stamp = new Date();
  const y = stamp.getFullYear();
  const m = String(stamp.getMonth() + 1).padStart(2, "0");
  const d = String(stamp.getDate()).padStart(2, "0");
  const hh = String(stamp.getHours()).padStart(2, "0");
  const mi = String(stamp.getMinutes()).padStart(2, "0");
  const safeName = String(`${filePrefix}_${y}${m}${d}_${hh}${mi}.xlsx`).replace(/[^a-z0-9_\-.]+/gi, "_");
  XLSX.writeFile(wb, safeName);
}

function formatTimeAgoEs(dateInput){
  const date = dateInput instanceof Date ? dateInput : parsePlanillaDateTime(dateInput);
  if (!date) return "-";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "hace 0 min";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `hace ${hours} h`;
  return `hace ${hours} h ${rem} min`;
}

function getHourBucketKey(value){
  const date = parsePlanillaDateTime(value);
  if (!date) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}`;
}

function getLlegadaRowPriorityTime(row){
  return getLlegadaReferenceDate(row) || parsePlanillaDateTime(row?.hora_despacho);
}

function hasItinerarioDespacho(row){
  const txt = formatPlanillaCell(row?.itinerario_despacho).trim();
  return !!txt && txt !== "-";
}

function shouldPreferLlegadaRow(candidate, current){
  const currentHasDespacho = hasValidDespacho(current);
  const candidateHasDespacho = hasValidDespacho(candidate);
  if (candidateHasDespacho !== currentHasDespacho) return candidateHasDespacho;

  if (candidateHasDespacho && currentHasDespacho) {
    const currentHasItinDesp = hasItinerarioDespacho(current);
    const candidateHasItinDesp = hasItinerarioDespacho(candidate);
    if (candidateHasItinDesp !== currentHasItinDesp) return candidateHasItinDesp;
  }

  const currentTime = getLlegadaRowPriorityTime(current);
  const candidateTime = getLlegadaRowPriorityTime(candidate);
  if (!currentTime && !candidateTime) return false;
  if (!candidateTime) return false;
  if (!currentTime) return true;
  return candidateTime.getTime() > currentTime.getTime();
}

function dedupeLlegadasByHour(rowsInput){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  const keyToLastIndex = new Map();
  const out = [];
  rows.forEach(row => {
    const tipo = formatPlanillaCell(row?.tipo_llegada);
    const interno = formatPlanillaCell(row?.interno).trim();
    const base = formatPlanillaCell(row?.base).trim();
    const mid = formatPlanillaCell(row?.mid).trim();
    const vehicleKey = interno || mid;
    const itin = formatPlanillaCell(row?.itinerario_llegada);
    const rowDate = getLlegadaReferenceDate(row);
    const dedupeKey = `${tipo}|${base}|${vehicleKey}|${itin}`;
    if (!rowDate || !vehicleKey || !dedupeKey.trim()) {
      out.push(row);
      return;
    }
    if (!keyToLastIndex.has(dedupeKey)) {
      keyToLastIndex.set(dedupeKey, out.length);
      out.push(row);
      return;
    }
    const idx = keyToLastIndex.get(dedupeKey);
    const current = out[idx];
    const currentDate = parsePlanillaDateTime(current?.hora_llegada || current?.generado_en || current?.hora_despacho);
    const diffMinutes = (!currentDate)
      ? Number.POSITIVE_INFINITY
      : Math.abs(rowDate.getTime() - currentDate.getTime()) / 60000;

    // Solo unificar registros cercanos (<= 30 min). Si pasa esa ventana, se considera otra llegada.
    if (diffMinutes <= ARRIVAL_DEDUPE_WINDOW_MINUTES) {
      if (shouldPreferLlegadaRow(row, current)) {
        out[idx] = row;
      }
      return;
    }
    keyToLastIndex.set(dedupeKey, out.length);
    out.push(row);
  });
  return out;
}

function getLlegadasRowsByTipo(tipoCode, options = {}){
  const preferToday = options.preferToday !== false;
  const allRows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  const rowsFiltered = allRows.filter(r => String(r?.tipo_llegada ?? "").trim() === String(tipoCode));
  const eligibleRows = filterOutOfListRows(rowsFiltered);
  let source = rowsFiltered;
  if (preferToday) {
    const now = new Date();
    const todayRows = eligibleRows.filter(r => {
      const date = getLlegadaReferenceDate(r);
      return !!date && isSameLocalDate(date, now);
    });
    source = todayRows.length > 0 ? todayRows : eligibleRows;
  } else {
    source = eligibleRows;
  }
  const sorted = source
    .slice()
    .sort((a, b) => {
      const da = getLlegadaReferenceDate(a);
      const db = getLlegadaReferenceDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.getTime() - da.getTime();
    });
  return dedupeLlegadasByHour(sorted);
}

function getLlegadasRowsByItinerarioLlegada(itineraryText, options = {}){
  const preferToday = options.preferToday !== false;
  const itineraryKey = normalizeItineraryKey(itineraryText);
  const allRows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  const rowsFiltered = allRows.filter(row => normalizeItineraryKey(getItinerarioLlegadaText(row)) === itineraryKey);
  const eligibleRows = filterOutOfListRows(rowsFiltered);
  let source = rowsFiltered;
  if (preferToday) {
    const now = new Date();
    const todayRows = eligibleRows.filter(r => {
      const date = getLlegadaReferenceDate(r);
      return !!date && isSameLocalDate(date, now);
    });
    source = todayRows.length > 0 ? todayRows : eligibleRows;
  } else {
    source = eligibleRows;
  }
  const sorted = source
    .slice()
    .sort((a, b) => {
      const da = getLlegadaReferenceDate(a);
      const db = getLlegadaReferenceDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.getTime() - da.getTime();
    });
  return dedupeLlegadasByHour(sorted);
}

function getTerminalNorteRowsForView(options = {}){
  const searchTerm = String(options.searchTerm || "");
  const fromIso = String(options.fromIso || "").trim();
  const toIso = String(options.toIso || "").trim();
  const estadoMode = String(options.estadoMode || "");
  const baseFilterValue = String(options.baseFilterValue || "");
  const hasExplicitFilters = !!searchTerm.trim() || !!fromIso || !!toIso || !!estadoMode;
  const rows = getLlegadasRowsByItinerarioLlegada(TERMINAL_NORTE_ITINERARY, { preferToday: !hasExplicitFilters });
  const byEstado = getRowsFilteredByEstado(rows, estadoMode);
  const byDate = getRowsFilteredByUploadDate(byEstado, fromIso, toIso);
  const byBase = getRowsFilteredByBase(byDate, baseFilterValue);
  return getRowsFilteredBySearchTerm(byBase, searchTerm);
}

function getLlegadaReferenceDate(row){
  return parsePlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.created_at);
}

function buildArrivalTimelineByInterno(){
  const timeline = new Map();
  const allRows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  allRows.forEach(row => {
    const tipo = String(row?.tipo_llegada ?? "").trim();
    if (!ARRIVAL_POINT_TYPES.has(tipo)) return;
    const interno = formatPlanillaCell(row?.interno).trim();
    if (!interno) return;
    const date = getLlegadaReferenceDate(row);
    if (!date) return;
    if (!timeline.has(interno)) timeline.set(interno, []);
    timeline.get(interno).push({ tipo, timeMs: date.getTime() });
  });
  timeline.forEach(list => list.sort((a, b) => b.timeMs - a.timeMs));
  return timeline;
}

function splitRowsByNoDespachoRule(rowsInput){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  if (!rows.length) return { activeRows: [], noDespachoRows: [] };
  const nowMs = Date.now();
  const timelineByInterno = buildArrivalTimelineByInterno();
  const activeRows = [];
  const noDespachoRows = [];

  rows.forEach(row => {
    if (hasValidDespacho(row)) {
      activeRows.push(row);
      return;
    }
    const date = getLlegadaReferenceDate(row);
    const rowTimeMs = date ? date.getTime() : 0;
    const elapsedMin = date ? Math.max(0, Math.floor((nowMs - rowTimeMs) / 60000)) : 0;
    const isOverThreshold = !!date && elapsedMin >= NO_DESPACHO_THRESHOLD_MINUTES;
    const tipo = String(row?.tipo_llegada ?? "").trim();
    const interno = formatPlanillaCell(row?.interno).trim();
    const timeline = timelineByInterno.get(interno) || [];
    const hasArrivalInAnotherPoint = timeline.some(item => item.timeMs > rowTimeMs && item.tipo !== tipo);
    const shouldMove = isOverThreshold || hasArrivalInAnotherPoint;

    if (!shouldMove) {
      activeRows.push(row);
      return;
    }
    const reason = hasArrivalInAnotherPoint
      ? "llegada posterior en otro punto"
      : "en espera por mas de 3 h 30 min";
    noDespachoRows.push({ ...row, __noDespachoReason: reason });
  });

  return { activeRows, noDespachoRows };
}

function resolveDispatchItineraryValue(row){
  const directId = String(row?.itinerary ?? row?.itinerary_id ?? row?.itinerario_id ?? "").trim();
  if (directId && SONAR_ITINERARIES.some(item => String(item.id) === directId)) return directId;
  const byNameCandidates = [
    row?.itinerario_llegada,
    row?.itinerario_despacho
  ];
  for (const rawName of byNameCandidates) {
    const key = normalizeItineraryKey(rawName);
    if (!key) continue;
    const found = SONAR_ITINERARIES.find(item => normalizeItineraryKey(item.nombre) === key);
    if (found?.id) return String(found.id);
  }
  const candidates = [
    row?.tipo_llegada
  ];
  for (const item of candidates) {
    const val = String(item ?? "").trim();
    if (val && SONAR_ITINERARIES.some(it => String(it.id) === val)) return val;
  }
  return "";
}

function getDispatchItineraryOptionsForRow(row){
  const pointKey = getNoDespachoPointKey(row);
  if (pointKey === "aeropuerto") {
    return SONAR_ITINERARIES.filter(item => String(item?.grupo || "").trim().toUpperCase() === "AEROPUERTO");
  }
  return SONAR_ITINERARIES;
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

function canDispatchRow(row){
  return !hasValidDespacho(row)
    && !!String(row?.mid ?? "").trim();
}

const MAX_CANCEL_AGE_MIN = 60;

function getMinutesSince(dateLike){
  if (!dateLike) return null;
  const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return (Date.now() - d.getTime()) / 60000;
}

function isWithinCancelWindow(dateLike, maxMinutes = MAX_CANCEL_AGE_MIN){
  const mins = getMinutesSince(dateLike);
  if (mins === null) return false;
  if (mins < 0) return true; // tolera relojes desincronizados
  return mins <= maxMinutes;
}

function getDispatchAgeMinutes(row){
  const d = parsePlanillaDateTime(row?.hora_despacho);
  return d ? getMinutesSince(d) : null;
}

function canCancelDispatchRow(row){
  if (!hasValidDespacho(row)) return false;
  if (!String(row?.mid ?? "").trim()) return false;
  if (!getRowDispatchRegId(row)) return false;
  const age = getDispatchAgeMinutes(row);
  if (age !== null && age > MAX_CANCEL_AGE_MIN) return false;
  return true;
}

function canRemoveRowFromArrivalList(row){
  return !isRowOutOfList(row);
}

function getDispatchButtonHtml(row){
  const rowUiId = ensureRowUiId(row);
  const mobileMoreBtn = `<button type="button" class="btn btn-ghost btn-mobile-more" data-row-ui="${escapeHtml(rowUiId)}" title="Mostrar mas datos">Ver mas</button>`;
  const editBtn = `<button type="button" class="btn btn-ghost btn-edit-planilla" data-row-ui="${escapeHtml(rowUiId)}" title="Editar pasajeros y observaciones">Editar</button>`;
  const loadingRemove = removingFromListRowUiIds.has(rowUiId);
  const removeDisabled = loadingRemove || !canRemoveRowFromArrivalList(row);
  const removeLabel = loadingRemove ? "Sacando..." : "Sacar";
  const removeTitle = removeDisabled && !loadingRemove
    ? "Este vehiculo ya fue retirado de la lista"
    : "Sacar vehiculo de la lista por novedad";
  const removeBtn = `<button type="button" class="btn btn-danger btn-remove-list" data-row-ui="${escapeHtml(rowUiId)}" ${removeDisabled ? "disabled" : ""} title="${escapeHtml(removeTitle)}">${escapeHtml(removeLabel)}</button>`;
  if (hasValidDespacho(row)) {
    const loadingCancel = cancelingRowUiIds.has(rowUiId);
    const canCancel = canCancelDispatchRow(row);
    const age = getDispatchAgeMinutes(row);
    const ageExpired = age !== null && age > MAX_CANCEL_AGE_MIN;
    const label = loadingCancel ? "Cancelando..." : "Cancelar";
    let title = "Cancelar este despacho en Sonar";
    if (!canCancel) {
      if (ageExpired) {
        title = `Tiempo expirado: el despacho tiene ${Math.floor(age)} min (max ${MAX_CANCEL_AGE_MIN} min)`;
      } else if (!getRowDispatchRegId(row)) {
        title = "No se puede cancelar: falta regId guardado";
      } else {
        title = "No se puede cancelar este despacho";
      }
    }
    const cancelBtn = `<button type="button" class="btn btn-danger btn-cancel-sonar" data-row-ui="${escapeHtml(rowUiId)}" ${loadingCancel || !canCancel ? "disabled" : ""} title="${escapeHtml(title)}">${escapeHtml(label)}</button>`;
    return `<div class="row" style="gap:6px;flex-wrap:wrap">${cancelBtn}${removeBtn}${editBtn}${mobileMoreBtn}</div>`;
  }
  const loading = dispatchingRowUiIds.has(rowUiId);
  const disabled = loading || !canDispatchRow(row);
  const label = loading ? "Despachando..." : "Despachar";
  const title = disabled && !loading
    ? "Requiere MID."
    : "Enviar despacho a Sonar";
  const dispatchBtn = `<button type="button" class="btn btn-ghost btn-dispatch-sonar" data-row-ui="${escapeHtml(rowUiId)}" ${disabled ? "disabled" : ""} title="${escapeHtml(title)}">${escapeHtml(label)}</button>`;
  return `<div class="row" style="gap:6px;flex-wrap:wrap">${dispatchBtn}${removeBtn}${editBtn}${mobileMoreBtn}</div>`;
}

async function sendOutOfListWebhook(entry){
  if (!OUT_OF_LIST_WEBHOOK_URL) return { success: false, skipped: true, message: "Webhook no configurado" };
  const payload = {
    event: "vehiculo_fuera_lista",
    sent_at: new Date().toISOString(),
    app: "panel_llegadas_vehiculos",
    data: entry
  };
  const response = await fetch(OUT_OF_LIST_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Webhook HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`);
  }
  return { success: true, status: response.status };
}

function getRowByUiId(rowUiId){
  const target = String(rowUiId || "").trim();
  if (!target) return null;
  const allRows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  return allRows.find(row => ensureRowUiId(row) === target) || null;
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

async function resolvePlanillaRowIdForUpdate(row){
  let rowId = row?.id;
  if (!rowId) {
    const targetKey = String(row?.cruce_key || "").trim();
    if (targetKey) {
      const match = (Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [])
        .find(item => String(item?.cruce_key || "").trim() === targetKey && !!item?.id);
      if (match?.id) rowId = match.id;
    }
  }
  if (!rowId) {
    const targetKey = String(row?.cruce_key || "").trim();
    if (targetKey) {
      const { data, error } = await planillaSupabaseClient
        .from(PLANILLA_TABLE_NAME)
        .select("id")
        .eq("cruce_key", targetKey)
        .limit(1);
      if (error) throw error;
      if (Array.isArray(data) && data[0]?.id) rowId = data[0].id;
    }
  }
  if (!rowId) {
    const mid = String(row?.mid || "").trim();
    const interno = String(row?.interno || "").trim();
    if (mid || interno) {
      let query = planillaSupabaseClient
        .from(PLANILLA_TABLE_NAME)
        .select("id")
        .order("hora_llegada", { ascending: false, nullsFirst: false })
        .limit(1);
      if (mid) query = query.eq("mid", mid);
      else query = query.eq("interno", interno);
      const { data, error } = await query;
      if (error) throw error;
      if (Array.isArray(data) && data[0]?.id) rowId = data[0].id;
    }
  }
  if (!rowId) {
    throw new Error("No se pudo identificar el id de la fila para actualizar.");
  }
  return rowId;
}

async function persistPassengersAndObservacionesOnPlanillaRow(row, payload){
  const rowId = await resolvePlanillaRowIdForUpdate(row);
  const patch = {
    pasajeros: String(payload?.pasajeros ?? row?.pasajeros ?? "").trim(),
    observaciones: String(payload?.observaciones ?? row?.observaciones ?? "").trim()
  };
  const { error } = await planillaSupabaseClient
    .from(PLANILLA_TABLE_NAME)
    .update(patch)
    .eq("id", rowId);
  if (error) throw error;

  const { data: checkData, error: checkError } = await planillaSupabaseClient
    .from(PLANILLA_TABLE_NAME)
    .select("id, pasajeros, observaciones")
    .eq("id", rowId)
    .limit(1);
  if (checkError) throw checkError;
  const updatedRow = Array.isArray(checkData) ? checkData[0] : checkData;
  if (updatedRow) {
    const savedPasajeros = String(updatedRow?.pasajeros ?? "").trim();
    const savedObservaciones = String(updatedRow?.observaciones ?? "").trim();
    if (savedPasajeros !== patch.pasajeros || savedObservaciones !== patch.observaciones) {
      throw new Error("Supabase respondio sin error, pero la fila no quedo actualizada. Revisa que la policy UPDATE aplique para esta fila.");
    }
    return updatedRow;
  }
  return { id: rowId, ...patch };
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

async function handleDispatchRow(rowUiId){
  const row = getRowByUiId(rowUiId);
  if (!row) {
    showToast("No se encontro la fila para despachar.", "warn");
    return;
  }
  if (hasValidDespacho(row)) {
    showToast("Esta fila ya tiene despacho.", "warn");
    return;
  }
  const payload = {
    mId: String(row?.mid ?? "").trim(),
    drvId: String(row?.driver_id ?? "").trim() || findDriverIdByName(row?.conductor, row?.base),
    observaciones: String(row?.observaciones ?? "")
  };
  if (!payload.mId) {
    showToast("Falta MID para despachar.", "warn");
    return;
  }
  const suggestedItineraryId = resolveDispatchItineraryValue(row);
  const itineraryOptions = getDispatchItineraryOptionsForRow(row);
  const modalResult = await openDispatchConfirmModal({
    interno: formatPlanillaCell(row?.interno),
    base: formatPlanillaCell(row?.base),
    mid: payload.mId,
    driverId: payload.drvId,
    itineraryId: suggestedItineraryId,
    itineraryOptions,
    observaciones: payload.observaciones || "-"
  });
  if (!modalResult?.confirmed) return;
  payload.drvId = String(modalResult?.driverId || payload.drvId || "").trim();
  payload.itinerary = String(modalResult?.itineraryId || suggestedItineraryId || "").trim();
  if (!payload.drvId) {
    showToast("Selecciona un Driver ID en el modal para despachar.", "warn");
    return;
  }
  if (!payload.itinerary) {
    showToast("Selecciona un itinerario en el modal para despachar.", "warn");
    return;
  }
  payload.itineraryLabel = String(getSonarItineraryById(payload.itinerary)?.nombre || payload.itinerary);
  const uiId = ensureRowUiId(row);
  let shouldReloadFromDb = false;
  dispatchingRowUiIds.add(uiId);
  renderLlegadasAeropuerto();
  renderLlegadasTerminalNorte();
  renderLlegadasSanDiego();
  renderLlegadasNutibara();
  renderNoDespachoTab();
  try {
    const result = await sendDispatchToSonar(payload);
    const dispatchRegId = extractDispatchRegId(result);
    if (dispatchRegId) {
      payload.dispatchRegId = dispatchRegId;
      setRowDispatchRegId(row, dispatchRegId);
    }
    const nowIso = new Date().toISOString();
    row.driver_id = payload.drvId;
    row.estado = "Despachado";
    row.hora_despacho = nowIso;
    if (payload.itineraryLabel) row.itinerario_despacho = payload.itineraryLabel;
    payload.horaDespachoIso = nowIso;
    invalidatePlanillaDispatchResolutionCache();
    insertDespachoRealizado(payload, result, row).catch(() => {});
    try {
      await persistDispatchOnPlanillaRow(row, payload);
      shouldReloadFromDb = true;
    } catch (persistErr) {
      console.error("No se pudo persistir despacho en planilla:", persistErr);
      showToast("Despacho enviado, pero no se guardo en tabla planilla.", "warn");
    }
    const regIdTxt = dispatchRegId;
    showToast(`Despacho enviado${regIdTxt ? ` (regId ${regIdTxt})` : ""}.`, "ok");
    notifyDispatchServerSyncDelay();
  } catch (error) {
    showToast(`Error al despachar: ${error?.message || "fallo en sonar-dispatch"}`, "err");
  } finally {
    dispatchingRowUiIds.delete(uiId);
    if (shouldReloadFromDb) {
      await loadPlanillaAfiliadosFromSupabase();
      return;
    }
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
  }
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
  const modalResult = await openManualDispatchModal();
  if (!modalResult?.confirmed) return;
  const payload = {
    mId: String(modalResult?.mId || "").trim(),
    drvId: String(modalResult?.drvId || "").trim(),
    itinerary: String(modalResult?.itinerary || "").trim(),
    observaciones: String(modalResult?.observaciones || "").trim(),
    interno: String(modalResult?.interno || "").trim(),
    base: String(modalResult?.base || getManualDispatchDefaultBase() || "").trim(),
    conductorName: String(modalResult?.conductorName || "").trim()
  };
  if (!payload.interno || !payload.mId || !payload.drvId || !payload.itinerary) {
    showToast("Despacho manual: faltan Interno, MID, Driver ID o Itinerario.", "warn");
    return;
  }
  payload.itineraryLabel = String(getSonarItineraryById(payload.itinerary)?.nombre || payload.itinerary);
  let shouldReloadFromDb = false;
  try {
    const result = await sendDispatchToSonar(payload);
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
    const regIdTxt = dispatchRegId;
    showToast(`Despacho manual enviado${regIdTxt ? ` (regId ${regIdTxt})` : ""}.`, "ok");
    notifyDispatchServerSyncDelay();
  } catch (error) {
    showToast(`Error en despacho manual: ${error?.message || "fallo en sonar-dispatch"}`, "err");
  } finally {
    if (shouldReloadFromDb) {
      await loadPlanillaAfiliadosFromSupabase();
      return;
    }
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
  }
}

async function handleCancelDispatchRow(rowUiId){
  const row = getRowByUiId(rowUiId);
  if (!row) {
    showToast("No se encontro la fila para cancelar.", "warn");
    return;
  }
  if (!hasValidDespacho(row)) {
    showToast("La fila no tiene despacho activo para cancelar.", "warn");
    return;
  }
  const regId = getRowDispatchRegId(row);
  const mId = String(row?.mid || "").trim();
  if (!mId || !regId) {
    showToast("No se puede cancelar: falta MID o regId.", "warn");
    return;
  }
  const ageMin = getDispatchAgeMinutes(row);
  if (ageMin !== null && ageMin > MAX_CANCEL_AGE_MIN) {
    showToast(`Tiempo expirado: el despacho tiene ${Math.floor(ageMin)} min (max ${MAX_CANCEL_AGE_MIN}).`, "warn");
    return;
  }
  const modalResult = await openCancelDispatchModal({
    interno: formatPlanillaCell(row?.interno),
    base: formatPlanillaCell(row?.base),
    mid: mId,
    regId,
    horaDespacho: getDespachoDateTimeText(row)
  });
  if (!modalResult?.confirmed) return;
  const comments = String(modalResult?.comments || "").trim();
  if (comments.length < 5) {
    showToast("Escribe un motivo de minimo 5 caracteres para cancelar.", "warn");
    return;
  }
  const uiId = ensureRowUiId(row);
  cancelingRowUiIds.add(uiId);
  renderLlegadasAeropuerto();
  renderLlegadasTerminalNorte();
  renderLlegadasSanDiego();
  renderLlegadasNutibara();
  renderNoDespachoTab();
  try {
    const payload = {
      mId,
      regId,
      comments,
      dispatchId: row?.id ?? null,
      canceledBy: currentUserEmail || currentUserId || "desconocido",
      canceledAt: new Date().toISOString(),
      vehicle: {
        interno: formatPlanillaCell(row?.interno),
        base: formatPlanillaCell(row?.base)
      },
      dispatch: {
        itinerary: formatPlanillaCell(row?.itinerario_despacho),
        hora_despacho: formatPlanillaCell(row?.hora_despacho),
        driver_id: formatPlanillaCell(row?.driver_id)
      }
    };
    const cancelResult = await sendCancelDispatchToSonar(payload);
    row.hora_despacho = null;
    row.itinerario_despacho = "";
    row.estado = "En espera";
    invalidatePlanillaDispatchResolutionCache();
    markDespachoRealizadoAsCanceled(regId, cancelResult).catch(() => {});
    let persisted = false;
    try {
      await persistCancelOnPlanillaRow(row, { comments, driverId: row?.driver_id });
      persisted = true;
    } catch (persistErr) {
      console.error("No se pudo persistir cancelacion por id:", persistErr);
    }
    if (!persisted) {
      persisted = await clearPlanillaDispatchByRegIdInDb(regId);
      if (persisted) await loadPlanillaAfiliadosFromSupabase();
    }
    showToast(persisted
      ? "Despacho cancelado en Sonar."
      : "Cancelacion enviada, pero no se actualizo planilla.", persisted ? "ok" : "warn");
  } catch (error) {
    showToast(`Error al cancelar: ${error?.message || "fallo en sonar-cancel"}`, "err");
  } finally {
    cancelingRowUiIds.delete(uiId);
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
  }
}

function renderFueraListaTab(){
  if (!fueraListaBody) return;
  const search = String(fueraListaSearch?.value || "").trim().toLowerCase();
  const list = Array.isArray(outOfListVehicles) ? outOfListVehicles : [];
  const visible = search
    ? list.filter(item => {
      const tokens = [
        item?.interno,
        item?.mid,
        item?.base,
        item?.punto,
        item?.observacion,
        item?.retirado_por,
        item?.hora_llegada
      ];
      return tokens.join(" ").toLowerCase().includes(search);
    })
    : list;
  if (fueraListaCount) fueraListaCount.textContent = String(visible.length);
  if (!visible.length) {
    fueraListaBody.innerHTML = `<tr><td colspan="9" class="muted" style="text-align:center;padding:12px">Sin vehiculos retirados localmente.</td></tr>`;
    return;
  }
  fueraListaBody.innerHTML = visible.map(item => {
    const retiroAt = formatPlanillaDateTime(item?.retirado_en || item?.created_at || "");
    const webhookTxt = item?.webhook_ok
      ? "Enviado"
      : (item?.webhook_error ? "Error" : "Pendiente");
    return `<tr>
      <td>${escapeHtml(retiroAt)}</td>
      <td>${escapeHtml(formatPlanillaCell(item?.punto || "-"))}</td>
      <td>${escapeHtml(formatPlanillaCell(item?.base || "-"))}</td>
      <td><strong style="color:#065f46">${escapeHtml(formatPlanillaCell(item?.interno || "-"))}</strong></td>
      <td>${escapeHtml(formatPlanillaCell(item?.mid || "-"))}</td>
      <td>${escapeHtml(formatPlanillaCell(item?.hora_llegada || "-"))}</td>
      <td>${escapeHtml(formatPlanillaCell(item?.observacion || "-"))}</td>
      <td>${escapeHtml(formatPlanillaCell(item?.retirado_por || "-"))}</td>
      <td>${escapeHtml(webhookTxt)}</td>
    </tr>`;
  }).join("");
}

async function handleRemoveFromListRow(rowUiId){
  const row = getRowByUiId(rowUiId);
  if (!row) {
    showToast("No se encontro la fila para retirar.", "warn");
    return;
  }
  if (isRowOutOfList(row)) {
    showToast("Ese vehiculo ya fue retirado de la lista.", "warn");
    return;
  }
  const punto = getNoDespachoPointLabel(row);
  const modalResult = await openRemoveFromListModal({
    interno: formatPlanillaCell(row?.interno),
    base: formatPlanillaCell(row?.base),
    mid: formatPlanillaCell(row?.mid),
    punto
  });
  if (!modalResult?.confirmed) return;
  const observacion = String(modalResult?.observacion || "").trim();
  if (observacion.length < 8) {
    showToast("La observacion debe tener minimo 8 caracteres.", "warn");
    return;
  }
  const uiId = ensureRowUiId(row);
  removingFromListRowUiIds.add(uiId);
  renderLlegadasAeropuerto();
  renderLlegadasTerminalNorte();
  renderLlegadasSanDiego();
  renderLlegadasNutibara();
  renderNoDespachoTab();
  try {
    const entry = {
      id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      row_id: row?.id ?? null,
      row_key: buildOutOfListRowKey(row),
      interno: formatPlanillaCell(row?.interno),
      mid: formatPlanillaCell(row?.mid),
      base: formatPlanillaCell(row?.base),
      punto,
      hora_llegada: formatPlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.created_at),
      itinerario_llegada: formatPlanillaCell(row?.itinerario_llegada),
      observacion,
      retirado_por: currentUserEmail || currentUserId || "desconocido",
      retirado_en: new Date().toISOString(),
      webhook_ok: false,
      webhook_error: ""
    };
    const added = addOutOfListVehicleEntry(entry);
    if (!added) {
      showToast("Ese vehiculo ya estaba retirado localmente.", "warn");
      return;
    }
    try {
      await sendOutOfListWebhook(entry);
      updateOutOfListEntry(entry.id, { webhook_ok: true, webhook_error: "" });
      if (fueraListaStatus) fueraListaStatus.textContent = `Webhook enviado: ${new Date().toLocaleString("es-CO")}`;
    } catch (webErr) {
      updateOutOfListEntry(entry.id, { webhook_ok: false, webhook_error: String(webErr?.message || "Error webhook") });
      if (fueraListaStatus) fueraListaStatus.textContent = `Error webhook: ${String(webErr?.message || "sin detalle")}`;
      showToast("Retirado localmente, pero fallo el webhook.", "warn");
    }
    showToast("Vehiculo retirado de la lista.", "ok");
  } finally {
    removingFromListRowUiIds.delete(uiId);
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
    renderFueraListaTab();
  }
}

async function handleEditPlanillaRow(rowUiId){
  const row = getRowByUiId(rowUiId);
  if (!row) {
    showToast("No se encontro la fila para editar.", "warn");
    return;
  }
  const modalResult = await openEditPlanillaModal({
    interno: formatPlanillaCell(row?.interno),
    base: formatPlanillaCell(row?.base),
    mid: formatPlanillaCell(row?.mid),
    pasajeros: formatPlanillaCell(row?.pasajeros),
    observaciones: formatPlanillaCell(row?.observaciones)
  });
  if (!modalResult?.confirmed) return;
  const pasajerosRaw = String(modalResult?.pasajeros || "").trim();
  const observaciones = String(modalResult?.observaciones || "").trim();
  if (pasajerosRaw && !/^\d+$/.test(pasajerosRaw)) {
    showToast("Pasajeros debe ser un numero entero.", "warn");
    return;
  }
  const pasajerosNumber = pasajerosRaw === "" ? null : Number(pasajerosRaw);
  if (pasajerosNumber !== null && (!Number.isFinite(pasajerosNumber) || pasajerosNumber < 0)) {
    showToast("Pasajeros no puede ser negativo.", "warn");
    return;
  }
  const pasajeros = pasajerosRaw;
  try {
    const updated = await persistPassengersAndObservacionesOnPlanillaRow(row, { pasajeros, observaciones });
    row.pasajeros = updated?.pasajeros == null ? "" : String(updated.pasajeros);
    row.observaciones = String(updated?.observaciones ?? "");
    const updatedId = String(updated?.id || row?.id || "").trim();
    if (updatedId) {
      (Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : []).forEach(item => {
        if (String(item?.id || "").trim() !== updatedId) return;
        item.pasajeros = row.pasajeros;
        item.observaciones = row.observaciones;
      });
    }
    invalidatePlanillaDispatchResolutionCache();
    showToast("Pasajeros y observaciones actualizados.", "ok");
  } catch (error) {
    showToast(`No se pudo actualizar en Supabase: ${error?.message || "sin detalle"}`, "err");
    return;
  } finally {
    renderPlanillaAfiliados();
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
    renderFueraListaTab();
  }
}

function bindDispatchButtons(containerEl){
  if (!containerEl) return;
  containerEl.querySelectorAll(".btn-dispatch-sonar[data-row-ui]").forEach(btn => {
    btn.addEventListener("click", () => {
      const rowUiId = btn.getAttribute("data-row-ui") || "";
      handleDispatchRow(rowUiId);
    });
  });
  containerEl.querySelectorAll(".btn-cancel-sonar[data-row-ui]").forEach(btn => {
    btn.addEventListener("click", () => {
      const rowUiId = btn.getAttribute("data-row-ui") || "";
      handleCancelDispatchRow(rowUiId);
    });
  });
  containerEl.querySelectorAll(".btn-remove-list[data-row-ui]").forEach(btn => {
    btn.addEventListener("click", () => {
      const rowUiId = btn.getAttribute("data-row-ui") || "";
      handleRemoveFromListRow(rowUiId);
    });
  });
  containerEl.querySelectorAll(".btn-edit-planilla[data-row-ui]").forEach(btn => {
    btn.addEventListener("click", () => {
      const rowUiId = btn.getAttribute("data-row-ui") || "";
      handleEditPlanillaRow(rowUiId);
    });
  });
  containerEl.querySelectorAll(".btn-mobile-more[data-row-ui]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tr = btn.closest("tr");
      if (!tr) return;
      const expanded = tr.classList.toggle("mobile-expanded");
      btn.textContent = expanded ? "Ver menos" : "Ver mas";
    });
  });
}

function renderLlegadasRowsHtml(rowsInput, includeReason){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  return rows.map(row => {
    ensureRowUiId(row);
    const date = getLlegadaReferenceDate(row);
    const horaTxt = formatPlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.hora_despacho);
    const despachoTxt = getDespachoDateTimeText(row);
    const operacionTxt = getOperacionEstadoText(row);
    const baseRaw = formatPlanillaCell(row?.base);
    const internoTxt = formatPlanillaCell(row?.interno);
    const baseMap = getBaseNumForInterno(row?.interno);
    const baseTxt = baseMap || baseRaw;
    const baseTitle = baseMap
      ? `Base ${baseMap} (afiliacion)${baseRaw && baseRaw !== "-" && baseRaw !== baseMap ? ` · operativa ${baseRaw}` : ""}`
      : (baseRaw && baseRaw !== "-" ? `Base ${baseRaw} (operativa)` : "Sin base asignada");
    const itinLlegadaHtml = getItinerarioLlegadaCellHtml(row);
    const itinDespachoTxt = getItinerarioDespachoText(row);
    const reasonTxt = includeReason ? formatPlanillaCell(row?.__noDespachoReason || "-") : "";
    const dispatchBtn = getDispatchButtonHtml(row);
    return `<tr>
      <td data-label="Hora ultima llegada">${escapeHtml(horaTxt)}</td>
      <td data-label="Despacho">${escapeHtml(despachoTxt)}</td>
      <td data-label="Estado"><strong style="color:${operacionTxt === "Despachado" ? "#065f46" : "#b45309"}">${escapeHtml(operacionTxt)}</strong></td>
      <td data-label="Base" title="${escapeHtml(baseTitle)}">${escapeHtml(baseTxt)}</td>
      <td data-label="Interno"><strong style="color:#065f46">${escapeHtml(internoTxt)}</strong></td>
      <td data-label="Itinerario llegada" data-mobile-secondary="1">${itinLlegadaHtml}</td>
      <td data-label="Itinerario despacho" data-mobile-secondary="1"><strong>${escapeHtml(itinDespachoTxt)}</strong></td>
      ${includeReason ? `<td data-label="Motivo no despacho" data-mobile-secondary="1">${escapeHtml(reasonTxt)}</td>` : ""}
      <td data-label="Accion">${dispatchBtn}</td>
    </tr>`;
  }).join("");
}

function getNoDespachoPointKey(row){
  const tipo = String(row?.tipo_llegada ?? "").trim();
  const itinKey = normalizeItineraryKey(getItinerarioLlegadaText(row));
  if (tipo === "129" || itinKey === normalizeItineraryKey(TERMINAL_NORTE_ITINERARY)) return "terminalnorte";
  if (tipo === "104") return "aeropuerto";
  if (tipo === "101") return "sandiego";
  if (tipo === "110") return "nutibara";
  return "otro";
}

function getNoDespachoPointLabel(row){
  const key = getNoDespachoPointKey(row);
  if (key === "aeropuerto") return "Aeropuerto";
  if (key === "terminalnorte") return "Terminalnorte";
  if (key === "sandiego") return "Almacentro";
  if (key === "nutibara") return "Nutibara";
  return "Otro";
}

function getAllOperationalArrivalRows(){
  const allRows = Array.isArray(planillaAfiliadosRows) ? planillaAfiliadosRows : [];
  const arrivals = allRows.filter(row => ARRIVAL_POINT_TYPES.has(String(row?.tipo_llegada ?? "").trim()));
  const eligibleArrivals = filterOutOfListRows(arrivals);
  const operational = getRowsFilteredByEsperaOperationalDay(eligibleArrivals);
  const sorted = operational.slice().sort(comparePlanillaRowsByCurrentDateTime);
  return dedupeLlegadasByHour(sorted);
}

function getNoDespachoRowsForView(options = {}){
  const searchTerm = String(options.searchTerm || "").trim().toLowerCase();
  const punto = String(options.punto || "").trim().toLowerCase();
  const fromIso = String(options.fromIso || "").trim();
  const toIso = String(options.toIso || "").trim();
  const baseFilterValue = String(options.baseFilterValue || "");
  const arrivals = getAllOperationalArrivalRows();
  let rows = splitRowsByNoDespachoRule(arrivals).noDespachoRows;
  if (punto) rows = rows.filter(row => getNoDespachoPointKey(row) === punto);
  rows = getRowsFilteredByUploadDate(rows, fromIso, toIso);
  rows = getRowsFilteredByBase(rows, baseFilterValue);
  if (searchTerm) {
    rows = rows.filter(row => {
      const tokens = [
        getNoDespachoPointLabel(row),
        formatPlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.hora_despacho),
        getDespachoDateTimeText(row),
        getOperacionEstadoText(row),
        formatTimeAgoEs(getLlegadaReferenceDate(row)),
        formatPlanillaCell(row?.base),
        formatPlanillaCell(row?.interno),
        formatPlanillaCell(row?.usuario),
        formatPlanillaCell(row?.pasajeros),
        formatPlanillaCell(row?.observaciones),
        getItinerarioLlegadaText(row),
        getItinerarioDespachoText(row),
        formatPlanillaCell(row?.__noDespachoReason)
      ];
      return tokens.join(" ").toLowerCase().includes(searchTerm);
    });
  }
  return rows.slice().sort(comparePlanillaRowsByCurrentDateTime);
}

function renderNoDespachoTabRows(rowsInput){
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  return rows.map(row => {
    ensureRowUiId(row);
    const pointTxt = getNoDespachoPointLabel(row);
    const horaTxt = formatPlanillaDateTime(row?.hora_llegada || row?.generado_en || row?.hora_despacho);
    const despachoTxt = getDespachoDateTimeText(row);
    const operacionTxt = getOperacionEstadoText(row);
    const baseRaw = formatPlanillaCell(row?.base);
    const internoTxt = formatPlanillaCell(row?.interno);
    const baseMap = getBaseNumForInterno(row?.interno);
    const baseTxt = baseMap || baseRaw;
    const baseTitle = baseMap
      ? `Base ${baseMap} (afiliacion)${baseRaw && baseRaw !== "-" && baseRaw !== baseMap ? ` · operativa ${baseRaw}` : ""}`
      : (baseRaw && baseRaw !== "-" ? `Base ${baseRaw} (operativa)` : "Sin base asignada");
    const itinLlegadaHtml = getItinerarioLlegadaCellHtml(row);
    const itinDespachoTxt = getItinerarioDespachoText(row);
    const reasonTxt = formatPlanillaCell(row?.__noDespachoReason || "-");
    const dispatchBtn = getDispatchButtonHtml(row);
    return `<tr>
      <td data-label="Punto">${escapeHtml(pointTxt)}</td>
      <td data-label="Hora ultima llegada">${escapeHtml(horaTxt)}</td>
      <td data-label="Despacho">${escapeHtml(despachoTxt)}</td>
      <td data-label="Estado"><strong style="color:${operacionTxt === "Despachado" ? "#065f46" : "#b45309"}">${escapeHtml(operacionTxt)}</strong></td>
      <td data-label="Base" title="${escapeHtml(baseTitle)}">${escapeHtml(baseTxt)}</td>
      <td data-label="Interno"><strong style="color:#065f46">${escapeHtml(internoTxt)}</strong></td>
      <td data-label="Itinerario llegada" data-mobile-secondary="1">${itinLlegadaHtml}</td>
      <td data-label="Itinerario despacho" data-mobile-secondary="1"><strong>${escapeHtml(itinDespachoTxt)}</strong></td>
      <td data-label="Motivo no despacho" data-mobile-secondary="1">${escapeHtml(reasonTxt)}</td>
      <td data-label="Accion">${dispatchBtn}</td>
    </tr>`;
  }).join("");
}

function renderNoDespachoTab(){
  if (!noDespachoBody) return;
  let baseFilterValue = noDespachoBaseFilter?.value || "";
  const rowsForBaseOptions = getNoDespachoRowsForView({
    searchTerm: "",
    punto: noDespachoPuntoFilter?.value || "",
    fromIso: noDespachoFrom?.value || "",
    toIso: noDespachoTo?.value || ""
  });
  syncLlegadasBaseFilterOptions(noDespachoBaseFilter, rowsForBaseOptions);
  baseFilterValue = noDespachoBaseFilter?.value || "";
  const rows = getNoDespachoRowsForView({
    searchTerm: noDespachoSearch?.value || "",
    punto: noDespachoPuntoFilter?.value || "",
    fromIso: noDespachoFrom?.value || "",
    toIso: noDespachoTo?.value || "",
    baseFilterValue
  });
  if (noDespachoCount) noDespachoCount.textContent = String(rows.length);
  if (noDespachoTitle) noDespachoTitle.textContent = "Vehiculos sin despacho (3 h 30 min)";
  if (!rows.length) {
    noDespachoBody.innerHTML = `<tr><td colspan="14" class="muted" style="text-align:center;padding:12px">Sin registros en no despacho.</td></tr>`;
    return;
  }
  noDespachoBody.innerHTML = renderNoDespachoTabRows(rows);
  bindDispatchButtons(noDespachoBody);
}

function renderLlegadasAeropuerto(){
  if (!llegadasAeropuertoBody) return;
  const estadoMode = aeropuertoEstadoFilter?.value || "";
  let baseFilterValue = aeropuertoBaseFilter?.value || "";
  const rowsForBaseOptions = getLlegadasRowsForView("104", {
    searchTerm: "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: aeropuertoUploadFrom?.value || "",
    toIso: aeropuertoUploadTo?.value || ""
  });
  syncLlegadasBaseFilterOptions(aeropuertoBaseFilter, rowsForBaseOptions);
  baseFilterValue = aeropuertoBaseFilter?.value || "";
  const rowsSource = getLlegadasRowsForView("104", {
    searchTerm: aeropuertoSearch?.value || "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: aeropuertoUploadFrom?.value || "",
    toIso: aeropuertoUploadTo?.value || "",
    baseFilterValue
  });
  const rows = estadoMode === "en_espera"
    ? getRowsFilteredByEsperaOperationalDay(rowsSource)
    : rowsSource;
  const rowsByRule = splitRowsByNoDespachoRule(rows);
  const visibleRows = rowsByRule.activeRows;
  lastAeropuertoRenderedRows = visibleRows.slice();
  if (llegadasAeropuertoCount) llegadasAeropuertoCount.textContent = String(visibleRows.length);
  if (llegadasAeropuertoTitle) llegadasAeropuertoTitle.textContent = "Ultimas Llegadas Aeropuerto (104)";
  if (visibleRows.length === 0) {
    if (llegadasAeropuertoTabs) llegadasAeropuertoTabs.innerHTML = "";
    llegadasAeropuertoBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin llegadas de aeropuerto.</td></tr>`;
    return;
  }
  const grouped = new Map();
  visibleRows.forEach(row => {
    const itin = getGroupingItineraryForRow(row, estadoMode);
    if (!grouped.has(itin)) grouped.set(itin, []);
    grouped.get(itin).push(row);
  });

  const itineraries = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "es"));
  if (!aeropuertoSelectedItinerary || !grouped.has(aeropuertoSelectedItinerary)) {
    aeropuertoSelectedItinerary = itineraries[0];
  }
  if (llegadasAeropuertoTabs) {
    llegadasAeropuertoTabs.innerHTML = itineraries.map(itin => {
      const active = itin === aeropuertoSelectedItinerary;
      const count = grouped.get(itin)?.length || 0;
      const cls = active ? "btn btn-primary" : "btn btn-ghost";
      const theme = getItineraryThemeByRows(grouped.get(itin), estadoMode);
      const style = getItineraryButtonStyle(theme, active);
      const label = getItineraryGroupLabel(itin);
      return `<button type="button" class="${cls}" style="${style}" data-aep-itin="${escapeHtml(itin)}">${escapeHtml(label)} (${count})</button>`;
    }).join("");
    llegadasAeropuertoTabs.querySelectorAll("[data-aep-itin]").forEach(btn => {
      btn.addEventListener("click", () => {
        aeropuertoSelectedItinerary = btn.getAttribute("data-aep-itin") || "";
        renderLlegadasAeropuerto();
      });
    });
  }

  const selectedRows = visibleRows.filter(row => rowMatchesSelectedItinerary(row, aeropuertoSelectedItinerary, estadoMode));
  lastAeropuertoRenderedRows = selectedRows.slice();
  if (selectedRows.length === 0) {
    llegadasAeropuertoBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin datos para el itinerario seleccionado.</td></tr>`;
    return;
  }
  llegadasAeropuertoBody.innerHTML = renderLlegadasRowsHtml(selectedRows, false);
  bindDispatchButtons(llegadasAeropuertoBody);
}

function renderLlegadasTerminalNorte(){
  if (!llegadasTerminalNorteBody) return;
  const estadoMode = terminalNorteEstadoFilter?.value || "";
  let baseFilterValue = terminalNorteBaseFilter?.value || "";
  const rowsForBaseOptions = getTerminalNorteRowsForView({
    searchTerm: "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: terminalNorteUploadFrom?.value || "",
    toIso: terminalNorteUploadTo?.value || ""
  });
  syncLlegadasBaseFilterOptions(terminalNorteBaseFilter, rowsForBaseOptions);
  baseFilterValue = terminalNorteBaseFilter?.value || "";
  const rowsSource = getTerminalNorteRowsForView({
    searchTerm: terminalNorteSearch?.value || "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: terminalNorteUploadFrom?.value || "",
    toIso: terminalNorteUploadTo?.value || "",
    baseFilterValue
  });
  const rows = estadoMode === "en_espera"
    ? getRowsFilteredByEsperaOperationalDay(rowsSource)
    : rowsSource;
  const rowsByRule = splitRowsByNoDespachoRule(rows);
  const visibleRows = rowsByRule.activeRows;
  lastTerminalNorteRenderedRows = visibleRows.slice();
  if (llegadasTerminalNorteCount) llegadasTerminalNorteCount.textContent = String(visibleRows.length);
  if (llegadasTerminalNorteTitle) llegadasTerminalNorteTitle.textContent = "Ultimas Llegadas Terminalnorte";
  if (visibleRows.length === 0) {
    llegadasTerminalNorteBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin llegadas de Terminalnorte.</td></tr>`;
    return;
  }
  llegadasTerminalNorteBody.innerHTML = renderLlegadasRowsHtml(visibleRows, false);
  bindDispatchButtons(llegadasTerminalNorteBody);
}

function renderLlegadasSanDiego(){
  if (!llegadasSanDiegoBody) return;
  const estadoMode = sanDiegoEstadoFilter?.value || "";
  let baseFilterValue = sanDiegoBaseFilter?.value || "";
  const rowsForBaseOptions = getLlegadasRowsForView("101", {
    searchTerm: "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: sanDiegoUploadFrom?.value || "",
    toIso: sanDiegoUploadTo?.value || ""
  });
  syncLlegadasBaseFilterOptions(sanDiegoBaseFilter, rowsForBaseOptions);
  baseFilterValue = sanDiegoBaseFilter?.value || "";
  const rowsSource = getLlegadasRowsForView("101", {
    searchTerm: sanDiegoSearch?.value || "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: sanDiegoUploadFrom?.value || "",
    toIso: sanDiegoUploadTo?.value || "",
    baseFilterValue
  });
  const rows = estadoMode === "en_espera"
    ? getRowsFilteredByEsperaOperationalDay(rowsSource)
    : rowsSource;
  const rowsByRule = splitRowsByNoDespachoRule(rows);
  const visibleRows = rowsByRule.activeRows;
  lastSanDiegoRenderedRows = visibleRows.slice();
  if (llegadasSanDiegoCount) llegadasSanDiegoCount.textContent = String(visibleRows.length);
  if (llegadasSanDiegoTitle) llegadasSanDiegoTitle.textContent = "Ultimas Llegadas Almacentro (101)";
  if (visibleRows.length === 0) {
    if (llegadasSanDiegoTabs) llegadasSanDiegoTabs.innerHTML = "";
    llegadasSanDiegoBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin llegadas de Almacentro.</td></tr>`;
    return;
  }

  const grouped = new Map();
  visibleRows.forEach(row => {
    const itin = getGroupingItineraryForRow(row, estadoMode);
    if (!grouped.has(itin)) grouped.set(itin, []);
    grouped.get(itin).push(row);
  });

  const itineraries = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "es"));
  if (!sanDiegoSelectedItinerary || !grouped.has(sanDiegoSelectedItinerary)) {
    sanDiegoSelectedItinerary = itineraries[0];
  }

  if (llegadasSanDiegoTabs) {
    llegadasSanDiegoTabs.innerHTML = itineraries.map(itin => {
      const active = itin === sanDiegoSelectedItinerary;
      const count = grouped.get(itin)?.length || 0;
      const cls = active ? "btn btn-primary" : "btn btn-ghost";
      const theme = getItineraryThemeByRows(grouped.get(itin), estadoMode);
      const style = getItineraryButtonStyle(theme, active);
      const label = getItineraryGroupLabel(itin);
      return `<button type="button" class="${cls}" style="${style}" data-sd-itin="${escapeHtml(itin)}">${escapeHtml(label)} (${count})</button>`;
    }).join("");
    llegadasSanDiegoTabs.querySelectorAll("[data-sd-itin]").forEach(btn => {
      btn.addEventListener("click", () => {
        sanDiegoSelectedItinerary = btn.getAttribute("data-sd-itin") || "";
        renderLlegadasSanDiego();
      });
    });
  }

  const selectedRows = visibleRows.filter(row => rowMatchesSelectedItinerary(row, sanDiegoSelectedItinerary, estadoMode));
  lastSanDiegoRenderedRows = selectedRows.slice();
  if (selectedRows.length === 0) {
    llegadasSanDiegoBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin datos para el itinerario seleccionado.</td></tr>`;
    return;
  }
  llegadasSanDiegoBody.innerHTML = renderLlegadasRowsHtml(selectedRows, false);
  bindDispatchButtons(llegadasSanDiegoBody);
}

function renderLlegadasNutibara(){
  if (!llegadasNutibaraBody) return;
  const estadoMode = nutibaraEstadoFilter?.value || "";
  let baseFilterValue = nutibaraBaseFilter?.value || "";
  const rowsForBaseOptions = getLlegadasRowsForView("110", {
    searchTerm: "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: nutibaraUploadFrom?.value || "",
    toIso: nutibaraUploadTo?.value || ""
  });
  syncLlegadasBaseFilterOptions(nutibaraBaseFilter, rowsForBaseOptions);
  baseFilterValue = nutibaraBaseFilter?.value || "";
  const rowsSource = getLlegadasRowsForView("110", {
    searchTerm: nutibaraSearch?.value || "",
    estadoMode: estadoMode === "en_espera" ? "" : estadoMode,
    fromIso: nutibaraUploadFrom?.value || "",
    toIso: nutibaraUploadTo?.value || "",
    baseFilterValue
  });
  const rows = estadoMode === "en_espera"
    ? getRowsFilteredByEsperaOperationalDay(rowsSource)
    : rowsSource;
  const rowsByRule = splitRowsByNoDespachoRule(rows);
  const visibleRows = rowsByRule.activeRows;
  lastNutibaraRenderedRows = visibleRows.slice();
  if (llegadasNutibaraCount) llegadasNutibaraCount.textContent = String(visibleRows.length);
  if (llegadasNutibaraTitle) llegadasNutibaraTitle.textContent = "Ultimas Llegadas Nutibara (110)";
  if (visibleRows.length === 0) {
    if (llegadasNutibaraTabs) llegadasNutibaraTabs.innerHTML = "";
    llegadasNutibaraBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin llegadas de Nutibara.</td></tr>`;
    return;
  }
  const grouped = new Map();
  visibleRows.forEach(row => {
    const itin = getGroupingItineraryForRow(row, estadoMode);
    if (!grouped.has(itin)) grouped.set(itin, []);
    grouped.get(itin).push(row);
  });

  const itineraries = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "es"));
  if (!nutibaraSelectedItinerary || !grouped.has(nutibaraSelectedItinerary)) {
    nutibaraSelectedItinerary = itineraries[0];
  }
  if (llegadasNutibaraTabs) {
    llegadasNutibaraTabs.innerHTML = itineraries.map(itin => {
      const active = itin === nutibaraSelectedItinerary;
      const count = grouped.get(itin)?.length || 0;
      const cls = active ? "btn btn-primary" : "btn btn-ghost";
      const theme = getItineraryThemeByRows(grouped.get(itin), estadoMode);
      const style = getItineraryButtonStyle(theme, active);
      const label = getItineraryGroupLabel(itin);
      return `<button type="button" class="${cls}" style="${style}" data-nut-itin="${escapeHtml(itin)}">${escapeHtml(label)} (${count})</button>`;
    }).join("");
    llegadasNutibaraTabs.querySelectorAll("[data-nut-itin]").forEach(btn => {
      btn.addEventListener("click", () => {
        nutibaraSelectedItinerary = btn.getAttribute("data-nut-itin") || "";
        renderLlegadasNutibara();
      });
    });
  }

  const selectedRows = visibleRows.filter(row => rowMatchesSelectedItinerary(row, nutibaraSelectedItinerary, estadoMode));
  lastNutibaraRenderedRows = selectedRows.slice();
  if (selectedRows.length === 0) {
    llegadasNutibaraBody.innerHTML = `<tr><td colspan="12" class="muted" style="text-align:center;padding:12px">Sin datos para el itinerario seleccionado.</td></tr>`;
    return;
  }
  llegadasNutibaraBody.innerHTML = renderLlegadasRowsHtml(selectedRows, false);
  bindDispatchButtons(llegadasNutibaraBody);
}

function renderPlanillaAfiliados(){
  if (!planillaHead || !planillaBody) return;
  const displayColumns = getPlanillaDisplayColumnKeys(planillaAfiliadosRows);
  const filtered = getPlanillaFilteredRows(planillaAfiliadosRows);

  if (planillaCount) planillaCount.textContent = String(filtered.length);

  if (displayColumns.length === 0) {
    planillaHead.innerHTML = "";
    planillaBody.innerHTML = `<tr><td class="muted" style="text-align:center;padding:12px">Sin datos.</td></tr>`;
    return;
  }

  planillaHead.innerHTML = `<tr>${displayColumns.map(col => `<th>${escapeHtml(formatPlanillaHeaderLabel(col))}</th>`).join("")}</tr>`;
  if (filtered.length === 0) {
    planillaBody.innerHTML = `<tr><td colspan="${displayColumns.length}" class="muted" style="text-align:center;padding:12px">No hay coincidencias.</td></tr>`;
    return;
  }

  planillaBody.innerHTML = filtered.map(row => {
    const cells = displayColumns.map(col => `<td>${escapeHtml(getPlanillaDisplayValueByColumn(row, col))}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
}

function getFilteredPlanillaRowsForExport(){
  return getPlanillaFilteredRows(planillaAfiliadosRows);
}

function handleDownloadLlegadas(){
  const filtered = getFilteredPlanillaRowsForExport();
  const onlyLlegadas = filtered.filter(row => !!String(row?.hora_llegada || "").trim());
  exportPlanillaRowsToExcel(onlyLlegadas, "llegadas", "llegadas_planilla");
}

function handleDownloadDespachos(){
  const filtered = getFilteredPlanillaRowsForExport();
  const onlyDespachos = filtered.filter(row => hasValidDespacho(row));
  exportPlanillaRowsToExcel(onlyDespachos, "despachos", "despachos_planilla");
}

function handleDownloadLlegadasAeropuerto(){
  exportPlanillaRowsToExcel(lastAeropuertoRenderedRows, "llegadas", "llegadas_aeropuerto");
}

function handleDownloadLlegadasTerminalNorte(){
  exportPlanillaRowsToExcel(lastTerminalNorteRenderedRows, "llegadas", "llegadas_terminalnorte");
}

function handleDownloadLlegadasSanDiego(){
  exportPlanillaRowsToExcel(lastSanDiegoRenderedRows, "llegadas", "llegadas_san_diego");
}

function handleDownloadLlegadasNutibara(){
  exportPlanillaRowsToExcel(lastNutibaraRenderedRows, "llegadas", "llegadas_nutibara");
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

function isPlanillaRelatedTab(tabId){
  const id = String(tabId || "");
  return id === "planilla-afiliados"
    || id === "llegadas-aeropuerto"
    || id === "llegadas-terminalnorte"
    || id === "llegadas-san-diego"
    || id === "llegadas-nutibara"
    || id === "no-despacho";
}

function getAllowedPlanillaTableSources(){
  return [PLANILLA_TABLE_NAME];
}

function resetPlanillaCache(){
  planillaAfiliadosRows = [];
  invalidatePlanillaDispatchResolutionCache();
  planillaAfiliadosLoadedOnce = false;
  planillaLastLoadedAt = 0;
  planillaLastDeltaUpdatedAt = "";
  planillaDeltaCycles = 0;
}

function setCurrentPlanillaTableSource(nextTable){
  const normalized = String(nextTable || "").trim();
  currentPlanillaTableName = normalized === PLANILLA_TABLE_NAME ? PLANILLA_TABLE_NAME : PLANILLA_TABLE_NAME;
  try {
    localStorage.setItem(PLANILLA_TABLE_SOURCE_STORAGE_KEY, currentPlanillaTableName);
  } catch (e) {}
  if (planillaTableSource) planillaTableSource.value = currentPlanillaTableName;
}

function loadPlanillaTableSourcePreference(){
  try {
    localStorage.removeItem(PLANILLA_TABLE_SOURCE_STORAGE_KEY);
  } catch (e) {}
  setCurrentPlanillaTableSource(PLANILLA_TABLE_NAME);
}

async function ensureFreshPlanillaData(options = {}){
  const force = !!options.force;
  const forceFull = !!options.forceFull;
  const maxAgeMs = Number(options.maxAgeMs || PLANILLA_REFRESH_MAX_AGE_MS);
  const stale = !planillaAfiliadosLoadedOnce || !planillaLastLoadedAt || ((Date.now() - planillaLastLoadedAt) > maxAgeMs);
  if (force || stale) {
    await loadPlanillaAfiliadosFromSupabase({ forceFull });
    return;
  }
  renderPlanillaAfiliados();
  renderLlegadasAeropuerto();
  renderLlegadasTerminalNorte();
  renderLlegadasSanDiego();
  renderLlegadasNutibara();
  renderNoDespachoTab();
  renderFueraListaTab();
}

async function loadPlanillaAfiliadosFromSupabase(options = {}){
  if (planillaAfiliadosLoading) return;
  if (!currentUserId) return;
  const forceFull = !!options.forceFull;
  currentPlanillaTableName = PLANILLA_TABLE_NAME;
  if (planillaTableSource) planillaTableSource.value = PLANILLA_TABLE_NAME;
  planillaAfiliadosLoading = true;
  if (planillaStatus) planillaStatus.textContent = `Consultando Supabase (${currentPlanillaTableName})...`;
  if (llegadasTerminalNorteStatus) llegadasTerminalNorteStatus.textContent = "Consultando...";
  if (noDespachoStatus) noDespachoStatus.textContent = "Consultando...";
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
    renderPlanillaAfiliados();
    renderLlegadasAeropuerto();
    renderLlegadasTerminalNorte();
    renderLlegadasSanDiego();
    renderLlegadasNutibara();
    renderNoDespachoTab();
    renderFueraListaTab();
    if (planillaStatus) {
      const stamp = new Date().toLocaleString("es-CO");
      const syncTxt = modeLabel === "delta" ? "delta" : "full";
      planillaStatus.textContent = `Actualizado: ${stamp} | Tabla: ${currentPlanillaTableName} | Sync: ${syncTxt}`;
    }
    if (llegadasAeropuertoStatus) {
      const stamp2 = new Date().toLocaleString("es-CO");
      llegadasAeropuertoStatus.textContent = `Actualizado: ${stamp2}`;
    }
    if (llegadasSanDiegoStatus) {
      const stampSd = new Date().toLocaleString("es-CO");
      llegadasSanDiegoStatus.textContent = `Actualizado: ${stampSd}`;
    }
    if (llegadasTerminalNorteStatus) {
      const stampTn = new Date().toLocaleString("es-CO");
      llegadasTerminalNorteStatus.textContent = `Actualizado: ${stampTn}`;
    }
    if (llegadasNutibaraStatus) {
      const stamp3 = new Date().toLocaleString("es-CO");
      llegadasNutibaraStatus.textContent = `Actualizado: ${stamp3}`;
    }
    if (noDespachoStatus) {
      const stamp4 = new Date().toLocaleString("es-CO");
      noDespachoStatus.textContent = `Actualizado: ${stamp4}`;
    }
  } catch (error) {
    console.error(`Error cargando ${currentPlanillaTableName}:`, error);
    if (planillaStatus) planillaStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
    if (llegadasAeropuertoStatus) llegadasAeropuertoStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
    if (llegadasSanDiegoStatus) llegadasSanDiegoStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
    if (llegadasTerminalNorteStatus) llegadasTerminalNorteStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
    if (llegadasNutibaraStatus) llegadasNutibaraStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
    if (noDespachoStatus) noDespachoStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
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

const FICHO_POSITION_RULES = {
  "SAN DIEGO": [
    { ficho: 1, after: 14 },
    { ficho: 2, after: 18 },
    { ficho: 3, after: 22 },
    { ficho: 4, after: 26 },
    { ficho: 5, after: 30 },
    { ficho: 6, after: 34 }
  ],
  "EXPOSICIONES": [
    { ficho: 7, after: 38 },
    { ficho: 8, after: 42 },
    { ficho: 9, after: 46 },
    { ficho: 10, after: 51 }
  ]
};

/* ===================== CARGAR CONDUCTORES DESDE CSV ===================== */
async function loadDriversFromCSV() {
  if (isLoadingDrivers) return;
  isLoadingDrivers = true;
  
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThNrFZLbNklMFtPeg0wF4TA1vZHnZ4YNMmGcnHfty_RoNuAQw__iV2GMXqTsv36MPiks1ARpYui1JK/pub?gid=0&single=true&output=csv';

  if (conductoresCsvStatus) conductoresCsvStatus.textContent = "Cargando CSV...";
  
  try {
    const response = await fetch(csvUrl, { cache: "no-cache" });
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim());
    
    const drIdIdx = headers.findIndex(h => norm(h) === 'DR_ID');
    const cedulaIdx = headers.findIndex(h => norm(h) === 'CEDULA');
    const fleetIdx = headers.findIndex(h => norm(h) === 'FLEET');
    const nombreIdx = headers.findIndex(h => norm(h) === 'NOMBRE');
    const emailIdx = headers.findIndex(h => norm(h) === 'EMAIL');
    const statusIdx = headers.findIndex(h => norm(h) === 'STATUS');
    const celularIdx = headers.findIndex(h => norm(h) === 'CELULAR');
    
    const newDriversByBase = {};
    const newDriversCatalogRows = [];
    let totalEnabled = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
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
      
      if (base && nombre && status === 'ENABLED') {
        const baseNumber = base;
        if (!newDriversByBase[baseNumber]) newDriversByBase[baseNumber] = [];
        newDriversByBase[baseNumber].push(nombre);
        totalEnabled++;
      }
    }
    
    // Ordenar
    Object.keys(newDriversByBase).forEach(base => {
      newDriversByBase[base].sort((a, b) => a.localeCompare(b));
    });
    
    driversByBase = newDriversByBase;
    driversCatalogRows = newDriversCatalogRows;
    
    if (conductoresCsvStatus) {
      const stamp = new Date().toLocaleString("es-CO");
      conductoresCsvStatus.textContent = `Actualizado: ${stamp} (${totalEnabled} conductores)`;
    }
    refreshConductoresCsvBaseOptions();
    renderConductoresCsvTab();
  } catch (error) {
    console.error('Error:', error);
    if (conductoresCsvStatus) conductoresCsvStatus.textContent = `Error: ${error?.message || "consulta fallida"}`;
  } finally {
    isLoadingDrivers = false;
  }
}

/* ===================== BASES ===================== */

/* ===================== CONDUCTORES ===================== */

/* ===================== NOVEDADES ===================== */

/* ===================== TABLA PROGRAMACION ===================== */
const PROGRAMACION_FILAS_TABLE = "programacion_filas";
const PROGRAMACION_HIDDEN_TOP = new Set(["id", "programacion_id", "row_key", "row_data"]);
const PROGRAMACION_HIDDEN_JSON = new Set(["#", "FECHA"]);
const PROGRAMACION_FIXED_COLS = ["fecha", "base"];
const PROGRAMACION_JSON_PRIORITY = [
  "PUESTO", "ORIGEN", "RUTA", "DESTINO", "ITINERARIO", "TRAYECTO",
  "VEH", "INTERNO", "VEHICULO", "PLACA",
  "INICIA", "INICIO", "HORA_INICIO", "H_INICIO",
  "INICIA2", "INICIO2", "INICIO_2", "HORA_INICIO_2", "H_INICIO_2",
  "HORA_FIN", "FIN", "TERMINA", "H_FIN",
  "HORA_LLEGADA", "LLEGADA", "HORA_DESPACHO", "DESPACHO", "HORA",
  "CONDUCTOR", "AFILIADO", "PROPIETARIO"
];
const PROGRAMACION_HEADER_LABELS = {
  "fecha": "Fecha",
  "base": "Base",
  "PUESTO": "Puesto",
  "VEH": "Vehiculo",
  "INTERNO": "Interno",
  "RUTA": "Ruta",
  "ORIGEN": "Origen",
  "DESTINO": "Destino",
  "ITINERARIO": "Itinerario",
  "INICIA": "Inicia",
  "INICIO": "Inicia",
  "HORA_INICIO": "Inicia",
  "INICIA2": "Inicia 2",
  "INICIO2": "Inicia 2",
  "INICIO_2": "Inicia 2",
  "HORA_INICIO_2": "Inicia 2",
  "HORA_FIN": "Hora fin",
  "FIN": "Hora fin",
  "TERMINA": "Hora fin",
  "HORA_LLEGADA": "Hora llegada",
  "HORA_DESPACHO": "Hora despacho",
  "CONDUCTOR": "Conductor",
  "AFILIADO": "Afiliado"
};

let programacionFilasRows = [];
let programacionFilasJsonKeys = [];
let programacionFilasLastLoadedAt = null;
let programacionFilasSelectedKey = null;

const programacionFilasSearch = document.getElementById("programacionFilasSearch");
const programacionFilasPuesto = document.getElementById("programacionFilasPuesto");
const programacionFilasFecha = document.getElementById("programacionFilasFecha");
const programacionFilasHead = document.getElementById("programacionFilasHead");
const programacionFilasBody = document.getElementById("programacionFilasBody");
const programacionFilasCount = document.getElementById("programacionFilasCount");
const programacionFilasStatus = document.getElementById("programacionFilasStatus");
const btnRefreshProgramacionFilas = document.getElementById("btnRefreshProgramacionFilas");
const btnProgramacionFilasHoy = document.getElementById("btnProgramacionFilasHoy");

function todayIsoLocal(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseProgramacionRowData(value){
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value) || {}; } catch (_) { return {}; }
  }
  return {};
}

function orderProgramacionJsonKeys(keys){
  const upper = new Map(keys.map(k => [String(k).toUpperCase(), k]));
  const seen = new Set();
  const ordered = [];
  for (const want of PROGRAMACION_JSON_PRIORITY) {
    const original = upper.get(want);
    if (original && !seen.has(original)) {
      ordered.push(original);
      seen.add(original);
    }
  }
  for (const k of keys) {
    if (!seen.has(k)) ordered.push(k);
  }
  return ordered;
}

function collectProgramacionJsonKeys(rows){
  const keys = new Set();
  for (const row of rows || []) {
    const data = parseProgramacionRowData(row?.row_data);
    for (const k of Object.keys(data)) {
      if (PROGRAMACION_HIDDEN_TOP.has(k)) continue;
      if (PROGRAMACION_HIDDEN_JSON.has(String(k).toUpperCase())) continue;
      keys.add(k);
    }
  }
  return orderProgramacionJsonKeys(Array.from(keys));
}

function getProgramacionIniciaColumn(){
  const candidates = ["INICIA", "INICIO", "HORA_INICIO", "H_INICIO"];
  for (const k of programacionFilasJsonKeys) {
    if (candidates.includes(String(k).toUpperCase())) return k;
  }
  return null;
}

function programacionTimeToMinutes(value){
  const s = String(value ?? "").trim();
  if (!s) return Number.POSITIVE_INFINITY;
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return Number.POSITIVE_INFINITY;
  return Number(m[1]) * 60 + Number(m[2]);
}

function sortProgramacionFilasByInicia(rows){
  const col = getProgramacionIniciaColumn();
  if (!col) return rows;
  return rows.slice().sort((a, b) => {
    const da = parseProgramacionRowData(a?.row_data);
    const db = parseProgramacionRowData(b?.row_data);
    const ta = programacionTimeToMinutes(da?.[col]);
    const tb = programacionTimeToMinutes(db?.[col]);
    if (ta !== tb) return ta - tb;
    const ba = String(a?.base ?? "");
    const bb = String(b?.base ?? "");
    return ba.localeCompare(bb, "es");
  });
}

function labelForProgramacionColumn(key){
  return PROGRAMACION_HEADER_LABELS[key] || PROGRAMACION_HEADER_LABELS[String(key).toUpperCase()] || String(key);
}

function formatProgramacionCell(value){
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }
  return String(value);
}

function getProgramacionRowKey(row){
  if (row?.id !== undefined && row?.id !== null) return `id:${row.id}`;
  if (row?.row_key) return `rk:${row.row_key}`;
  return null;
}

function getProgramacionPuestoColumn(){
  const candidates = ["PUESTO", "ORIGEN", "RUTA", "DESTINO", "ITINERARIO", "TRAYECTO"];
  for (const k of programacionFilasJsonKeys) {
    if (candidates.includes(String(k).toUpperCase())) return k;
  }
  return null;
}

function getProgramacionPuesto(data){
  const col = getProgramacionPuestoColumn();
  if (!col || !data || typeof data !== "object") return "";
  return String(data[col] ?? "").trim();
}

function populateProgramacionPuestoOptions(){
  if (!programacionFilasPuesto) return;
  const col = getProgramacionPuestoColumn();
  const current = programacionFilasPuesto.value;
  if (!col) {
    programacionFilasPuesto.innerHTML = `<option value="">Sin columna puesto</option>`;
    programacionFilasPuesto.disabled = true;
    return;
  }
  programacionFilasPuesto.disabled = false;
  const values = new Set();
  for (const row of programacionFilasRows) {
    const data = parseProgramacionRowData(row?.row_data);
    const v = String(data?.[col] ?? "").trim();
    if (v) values.add(v);
  }
  const sorted = Array.from(values).sort((a, b) => a.localeCompare(b, "es"));
  const opts = [`<option value="">Todos los puestos</option>`]
    .concat(sorted.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`));
  programacionFilasPuesto.innerHTML = opts.join("");
  if (sorted.includes(current)) programacionFilasPuesto.value = current;
}

function getFilteredProgramacionFilasRows(){
  const term = String(programacionFilasSearch?.value || "").trim().toLowerCase();
  const puesto = String(programacionFilasPuesto?.value || "").trim();

  return programacionFilasRows.filter(row => {
    const data = parseProgramacionRowData(row?.row_data);

    if (puesto) {
      const p = getProgramacionPuesto(data);
      if (p !== puesto) return false;
    }

    if (term) {
      const haystack = [
        row?.fecha, row?.base,
        ...Object.values(data).map(v => (typeof v === "object" ? JSON.stringify(v) : v))
      ].map(v => String(v ?? "").toLowerCase()).join(" ");
      if (!haystack.includes(term)) return false;
    }

    return true;
  });
}

function renderProgramacionFilas(){
  if (!programacionFilasHead || !programacionFilasBody) return;
  const rows = sortProgramacionFilasByInicia(getFilteredProgramacionFilasRows());
  if (programacionFilasCount) programacionFilasCount.textContent = String(rows.length);

  const headers = [...PROGRAMACION_FIXED_COLS, ...programacionFilasJsonKeys];
  programacionFilasHead.innerHTML =
    `<tr>${headers.map(h => `<th>${escapeHtml(labelForProgramacionColumn(h))}</th>`).join("")}</tr>`;

  if (!rows.length) {
    programacionFilasBody.innerHTML =
      `<tr><td colspan="${headers.length}" class="muted" style="text-align:center;padding:12px">Sin resultados.</td></tr>`;
    return;
  }

  programacionFilasBody.innerHTML = rows.map(row => {
    const data = parseProgramacionRowData(row?.row_data);
    const fixedCells = PROGRAMACION_FIXED_COLS
      .map(col => `<td>${escapeHtml(formatProgramacionCell(row?.[col]))}</td>`)
      .join("");
    const jsonCells = programacionFilasJsonKeys
      .map(k => `<td>${escapeHtml(formatProgramacionCell(data?.[k]))}</td>`)
      .join("");
    const key = getProgramacionRowKey(row);
    const selectedCls = (key && key === programacionFilasSelectedKey) ? " is-selected" : "";
    const keyAttr = key ? ` data-row-key="${escapeHtml(key)}"` : "";
    return `<tr class="prog-filas-row${selectedCls}"${keyAttr}>${fixedCells}${jsonCells}</tr>`;
  }).join("");
}

function handleProgramacionFilasRowClick(ev){
  const tr = ev.target.closest("tr.prog-filas-row");
  if (!tr) return;
  const key = tr.getAttribute("data-row-key");
  if (!key) return;
  if (programacionFilasSelectedKey === key) {
    programacionFilasSelectedKey = null;
    tr.classList.remove("is-selected");
    return;
  }
  programacionFilasSelectedKey = key;
  programacionFilasBody.querySelectorAll("tr.prog-filas-row.is-selected").forEach(el => el.classList.remove("is-selected"));
  tr.classList.add("is-selected");
}

async function loadProgramacionFilas(){
  if (!currentUserId) return;
  if (programacionFilasFecha && !programacionFilasFecha.value) {
    programacionFilasFecha.value = todayIsoLocal();
  }
  const fecha = programacionFilasFecha?.value || "";
  const setStatus = (txt) => { if (programacionFilasStatus) programacionFilasStatus.textContent = txt; };
  setStatus(fecha ? `Consultando ${fecha}...` : "Consultando Supabase...");
  if (btnRefreshProgramacionFilas) btnRefreshProgramacionFilas.disabled = true;
  try {
    let q = planillaSupabaseClient
      .from(PROGRAMACION_FILAS_TABLE)
      .select("id, programacion_id, row_key, row_data, base, fecha");
    if (fecha) q = q.eq("fecha", fecha);
    const { data, error } = await q
      .order("fecha", { ascending: false })
      .order("base", { ascending: true })
      .order("id", { ascending: true })
      .limit(5000);
    if (error) throw error;
    programacionFilasRows = Array.isArray(data) ? data : [];
    programacionFilasJsonKeys = collectProgramacionJsonKeys(programacionFilasRows);
    programacionFilasLastLoadedAt = Date.now();
    programacionFilasSelectedKey = null;
    populateProgramacionPuestoOptions();
    renderProgramacionFilas();
    const stamp = new Date().toLocaleTimeString("es-CO");
    setStatus(`Actualizado ${stamp} · ${programacionFilasRows.length} registros${fecha ? ` · ${fecha}` : ""}`);
  } catch (err) {
    console.error(`[${PROGRAMACION_FILAS_TABLE}] consulta fallo:`, err);
    setStatus(`Error: ${err?.message || "fallo"}`);
    if (typeof showToast === "function") {
      showToast(`No se pudo cargar ${PROGRAMACION_FILAS_TABLE}: ${err?.message || "fallo"}`, "err");
    }
  } finally {
    if (btnRefreshProgramacionFilas) btnRefreshProgramacionFilas.disabled = false;
  }
}

/* ===================== TABLA VEHICULOSSONAR (vista cruda) ===================== */
const TABLA_VEHICULOSSONAR_COL_PRIORITY = ["INTERNO", "Interno", "interno", "Placa", "PLACA", "placa", "ID", "Id", "id", "mid", "MID"];
let tablaVehiculosSonarRows = [];
let tablaVehiculosSonarColumns = [];
let tablaVehiculosSonarLastLoadedAt = null;
let tablaVehiculosSonarSelectedKey = null;

const tablaVehiculosSonarSearch = document.getElementById("tablaVehiculosSonarSearch");
const tablaVehiculosSonarHead = document.getElementById("tablaVehiculosSonarHead");
const tablaVehiculosSonarBody = document.getElementById("tablaVehiculosSonarBody");
const tablaVehiculosSonarCount = document.getElementById("tablaVehiculosSonarCount");
const tablaVehiculosSonarStatus = document.getElementById("tablaVehiculosSonarStatus");
const btnRefreshTablaVehiculosSonar = document.getElementById("btnRefreshTablaVehiculosSonar");

function collectTablaVehiculosSonarColumns(rows){
  const set = new Set();
  for (const row of rows || []) {
    if (row && typeof row === "object") {
      for (const k of Object.keys(row)) set.add(k);
    }
  }
  const priority = TABLA_VEHICULOSSONAR_COL_PRIORITY.filter(k => set.has(k));
  const rest = Array.from(set).filter(k => !priority.includes(k));
  return [...priority, ...rest];
}

function formatTablaVehiculosSonarCell(value){
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }
  return String(value);
}

function getTablaVehiculosSonarKey(row, idx){
  const candidates = ["ID", "Id", "id", "INTERNO", "Interno", "interno"];
  for (const c of candidates) {
    if (row?.[c] !== undefined && row?.[c] !== null && row?.[c] !== "") {
      return `${c}:${row[c]}`;
    }
  }
  return `idx:${idx}`;
}

function getFilteredTablaVehiculosSonarRows(){
  const term = String(tablaVehiculosSonarSearch?.value || "").trim().toLowerCase();
  if (!term) return tablaVehiculosSonarRows.slice();
  return tablaVehiculosSonarRows.filter(row => {
    const haystack = Object.values(row || {})
      .map(v => (typeof v === "object" ? JSON.stringify(v) : v))
      .map(v => String(v ?? "").toLowerCase())
      .join(" ");
    return haystack.includes(term);
  });
}

function renderTablaVehiculosSonar(){
  if (!tablaVehiculosSonarHead || !tablaVehiculosSonarBody) return;
  const rows = getFilteredTablaVehiculosSonarRows();
  if (tablaVehiculosSonarCount) tablaVehiculosSonarCount.textContent = String(rows.length);

  const cols = tablaVehiculosSonarColumns.length
    ? tablaVehiculosSonarColumns
    : collectTablaVehiculosSonarColumns(rows);

  tablaVehiculosSonarHead.innerHTML = `<tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;

  if (!rows.length) {
    tablaVehiculosSonarBody.innerHTML =
      `<tr><td colspan="${Math.max(cols.length, 1)}" class="muted" style="text-align:center;padding:12px">Sin resultados.</td></tr>`;
    return;
  }

  tablaVehiculosSonarBody.innerHTML = rows.map((row, idx) => {
    const key = getTablaVehiculosSonarKey(row, idx);
    const selectedCls = (key === tablaVehiculosSonarSelectedKey) ? " is-selected" : "";
    const cells = cols.map(c => `<td>${escapeHtml(formatTablaVehiculosSonarCell(row?.[c]))}</td>`).join("");
    return `<tr class="prog-filas-row${selectedCls}" data-row-key="${escapeHtml(key)}">${cells}</tr>`;
  }).join("");
}

function handleTablaVehiculosSonarRowClick(ev){
  const tr = ev.target.closest("tr.prog-filas-row");
  if (!tr) return;
  const key = tr.getAttribute("data-row-key");
  if (!key) return;
  if (tablaVehiculosSonarSelectedKey === key) {
    tablaVehiculosSonarSelectedKey = null;
    tr.classList.remove("is-selected");
    return;
  }
  tablaVehiculosSonarSelectedKey = key;
  tablaVehiculosSonarBody.querySelectorAll("tr.prog-filas-row.is-selected").forEach(el => el.classList.remove("is-selected"));
  tr.classList.add("is-selected");
}

async function loadTablaVehiculosSonar(){
  if (!currentUserId) return;
  const setStatus = (txt) => { if (tablaVehiculosSonarStatus) tablaVehiculosSonarStatus.textContent = txt; };
  setStatus("Consultando Supabase...");
  if (btnRefreshTablaVehiculosSonar) btnRefreshTablaVehiculosSonar.disabled = true;
  try {
    const { data, error } = await planillaSupabaseClient
      .from(VEHICULOS_SONAR_TABLE_NAME)
      .select("*")
      .limit(5000);
    if (error) throw error;
    tablaVehiculosSonarRows = Array.isArray(data) ? data : [];
    tablaVehiculosSonarColumns = collectTablaVehiculosSonarColumns(tablaVehiculosSonarRows);
    tablaVehiculosSonarLastLoadedAt = Date.now();
    tablaVehiculosSonarSelectedKey = null;
    renderTablaVehiculosSonar();
    const stamp = new Date().toLocaleTimeString("es-CO");
    setStatus(`Actualizado ${stamp} · ${tablaVehiculosSonarRows.length} registros`);
  } catch (err) {
    console.error(`[${VEHICULOS_SONAR_TABLE_NAME}] consulta fallo:`, err);
    setStatus(`Error: ${err?.message || "fallo"}`);
    if (typeof showToast === "function") {
      showToast(`No se pudo cargar ${VEHICULOS_SONAR_TABLE_NAME}: ${err?.message || "fallo"}`, "err");
    }
  } finally {
    if (btnRefreshTablaVehiculosSonar) btnRefreshTablaVehiculosSonar.disabled = false;
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
    
    if (tabId === 'planilla-afiliados') ensureFreshPlanillaData({ force: true });
    if (tabId === 'llegadas-aeropuerto') ensureFreshPlanillaData({ force: true });
    if (tabId === 'llegadas-terminalnorte') ensureFreshPlanillaData({ force: true });
    if (tabId === 'llegadas-san-diego') ensureFreshPlanillaData({ force: true });
    if (tabId === 'llegadas-nutibara') ensureFreshPlanillaData({ force: true });
    if (tabId === 'no-despacho') ensureFreshPlanillaData({ force: true });
    if (tabId === 'fuera-lista') renderFueraListaTab();
    if (tabId === 'vehiculos-sonar') loadVehiculosSonarFromSupabase({ force: true });
    if (tabId === 'despachos-sonar' && !despachosSonarLastLoadedAt) loadDespachosSonarFromEdge();
    if (tabId === 'mapa-vehiculos') activateMapaVehiculosTab();
    if (tabId === 'tabla-llegadas') {
      if (!mapaVehiculosLastLoadedAt) loadMapaVehiculos();
      else renderTablaLlegadasVehiculos();
    }
    if (tabId === 'historial-despachos') {
      if (!historialDespachosLastLoadedAt) loadDespachosRealizadosFromSupabase();
      if (!mapaVehiculosLastLoadedAt) loadMapaVehiculos();
      if (!vehiculosSonarLoadedOnce) loadVehiculosSonarFromSupabase().then(() => renderHistorialInsights());
    }
    if (tabId === 'conductores-csv') renderConductoresCsvTab();
    if (tabId === 'preop-sicov' && !preopSicovLastLoadedAt) loadPreoperacionalesSicov();
    if (tabId === 'programacion-filas' && !programacionFilasLastLoadedAt) loadProgramacionFilas();
    if (tabId === 'tabla-vehiculossonar' && !tablaVehiculosSonarLastLoadedAt) loadTablaVehiculosSonar();
    if (tabId === 'asistencia-biometrica') {
      setTimeout(() => { pushBiometricoSession(); }, 300);
      setTimeout(() => { pushBiometricoSession(); }, 1500);
    }
    refreshMobileTabSwitcher();
  });
});

/* ===================== ARCHIVO ===================== */

/* ===================== EVENTOS ===================== */

function showLlegadasVehiculosPanel(){
  if (operativoPanel) operativoPanel.classList.remove("hidden");
}

function bindUIEvents(){
  const triggerPlanillaRefresh = () => loadPlanillaAfiliadosFromSupabase();

  const btnGoLlegadasVehiculos = document.getElementById("btnGoLlegadasVehiculos");
  if (btnGoLlegadasVehiculos) {
    btnGoLlegadasVehiculos.addEventListener("click", showLlegadasVehiculosPanel);
  }

  // Conductores CSV
  if (btnRefreshConductoresCsv) btnRefreshConductoresCsv.addEventListener("click", loadDriversFromCSV);
  if (conductoresCsvSearch) conductoresCsvSearch.addEventListener("input", renderConductoresCsvTab);
  if (conductoresCsvBaseFilter) conductoresCsvBaseFilter.addEventListener("change", renderConductoresCsvTab);
  if (conductoresCsvStatusFilter) conductoresCsvStatusFilter.addEventListener("change", renderConductoresCsvTab);

  // Vehiculos Sonar
  if (btnRefreshVehiculosSonar) btnRefreshVehiculosSonar.addEventListener("click", () => loadVehiculosSonarFromSupabase({ force: true }));
  if (vehiculosSonarSearch) vehiculosSonarSearch.addEventListener("input", renderVehiculosSonarTab);
  if (btnRefreshDespachosSonar) btnRefreshDespachosSonar.addEventListener("click", () => loadDespachosSonarFromEdge());
  if (despachosSonarSearch) despachosSonarSearch.addEventListener("input", renderDespachosSonarTab);
  if (despachosSonarItinChips) despachosSonarItinChips.addEventListener("click", handleDespachosSonarChipClick);
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
  if (btnRefreshMapaVehiculos) btnRefreshMapaVehiculos.addEventListener("click", () => loadMapaVehiculos());
  if (btnFitMapaVehiculos) btnFitMapaVehiculos.addEventListener("click", () => fitMapaToMarkers());
  if (btnRefreshTablaLlegadas) btnRefreshTablaLlegadas.addEventListener("click", () => loadMapaVehiculos());
  if (tablaLlegadasSearch) tablaLlegadasSearch.addEventListener("input", renderTablaLlegadasVehiculos);
  if (vehiculosSonarBody) vehiculosSonarBody.addEventListener("click", handleVehiculosSonarTableClick);

  // Preoperacionales SICOV
  if (btnRefreshPreopSicov) btnRefreshPreopSicov.addEventListener("click", () => loadPreoperacionalesSicov(1));
  if (preopSicovSearch) preopSicovSearch.addEventListener("input", schedulePreopSicovSearch);
  if (preopSicovFrom) preopSicovFrom.addEventListener("change", () => loadPreoperacionalesSicov(1));
  if (preopSicovTo) preopSicovTo.addEventListener("change", () => loadPreoperacionalesSicov(1));
  if (preopSicovPageSize) preopSicovPageSize.addEventListener("change", () => loadPreoperacionalesSicov(1));
  if (btnPreopSicovFirst) btnPreopSicovFirst.addEventListener("click", () => loadPreoperacionalesSicov(1));
  if (btnPreopSicovPrev)  btnPreopSicovPrev.addEventListener("click",  () => loadPreoperacionalesSicov(Math.max(1, preopSicovCurrentPage - 1)));
  if (btnPreopSicovNext)  btnPreopSicovNext.addEventListener("click",  () => loadPreoperacionalesSicov(preopSicovCurrentPage + 1));
  if (btnPreopSicovLast)  btnPreopSicovLast.addEventListener("click",  () => {
    const totalPages = Math.max(1, Math.ceil(preopSicovTotalCount / getPreopSicovPageSize()));
    loadPreoperacionalesSicov(totalPages);
  });

  // Programacion filas
  if (btnRefreshProgramacionFilas) btnRefreshProgramacionFilas.addEventListener("click", () => loadProgramacionFilas());
  if (programacionFilasSearch) programacionFilasSearch.addEventListener("input", renderProgramacionFilas);
  if (programacionFilasPuesto) programacionFilasPuesto.addEventListener("change", renderProgramacionFilas);
  if (programacionFilasFecha) programacionFilasFecha.addEventListener("change", () => loadProgramacionFilas());
  if (btnProgramacionFilasHoy) btnProgramacionFilasHoy.addEventListener("click", () => {
    if (programacionFilasFecha) programacionFilasFecha.value = todayIsoLocal();
    loadProgramacionFilas();
  });
  if (programacionFilasBody) programacionFilasBody.addEventListener("click", handleProgramacionFilasRowClick);

  // Tabla vehiculossonar (vista cruda)
  if (btnRefreshTablaVehiculosSonar) btnRefreshTablaVehiculosSonar.addEventListener("click", () => loadTablaVehiculosSonar());
  if (tablaVehiculosSonarSearch) tablaVehiculosSonarSearch.addEventListener("input", renderTablaVehiculosSonar);
  if (tablaVehiculosSonarBody) tablaVehiculosSonarBody.addEventListener("click", handleTablaVehiculosSonarRowClick);

  // Asistencia biometrica
  if (btnReloadAsistenciaBiometrica) {
    btnReloadAsistenciaBiometrica.addEventListener("click", () => {
      if (!asistenciaBiometricaFrame) return;
      asistenciaBiometricaFrame.src = asistenciaBiometricaFrame.src;
    });
  }
  setupBiometricoAutoLogin();

  // Planilla afiliados
  if (btnRefreshPlanilla) btnRefreshPlanilla.addEventListener("click", triggerPlanillaRefresh);
  if (planillaTableSource) {
    planillaTableSource.addEventListener("change", async () => {
      setCurrentPlanillaTableSource(planillaTableSource.value);
      resetPlanillaCache();
      await loadPlanillaAfiliadosFromSupabase();
    });
  }
  if (btnDownloadLlegadas) btnDownloadLlegadas.addEventListener("click", handleDownloadLlegadas);
  if (btnDownloadDespachos) btnDownloadDespachos.addEventListener("click", handleDownloadDespachos);
  if (planillaFilterInterno) planillaFilterInterno.addEventListener("input", renderPlanillaAfiliados);
  if (planillaFilterBase) planillaFilterBase.addEventListener("input", renderPlanillaAfiliados);
  if (planillaFilterHoraLlegada) planillaFilterHoraLlegada.addEventListener("input", renderPlanillaAfiliados);
  if (planillaFilterTipo) planillaFilterTipo.addEventListener("change", renderPlanillaAfiliados);

  // Llegadas Aeropuerto
  if (btnRefreshLlegadasAeropuerto) btnRefreshLlegadasAeropuerto.addEventListener("click", triggerPlanillaRefresh);
  if (aeropuertoSearch) aeropuertoSearch.addEventListener("input", renderLlegadasAeropuerto);
  if (aeropuertoEstadoFilter) aeropuertoEstadoFilter.addEventListener("change", renderLlegadasAeropuerto);
  if (aeropuertoBaseFilter) aeropuertoBaseFilter.addEventListener("change", renderLlegadasAeropuerto);
  if (aeropuertoUploadFrom) aeropuertoUploadFrom.addEventListener("change", renderLlegadasAeropuerto);
  if (aeropuertoUploadTo) aeropuertoUploadTo.addEventListener("change", renderLlegadasAeropuerto);
  if (btnDownloadLlegadasAeropuerto) btnDownloadLlegadasAeropuerto.addEventListener("click", handleDownloadLlegadasAeropuerto);

  // Llegadas Terminal Norte
  if (btnRefreshLlegadasTerminalNorte) btnRefreshLlegadasTerminalNorte.addEventListener("click", triggerPlanillaRefresh);
  if (terminalNorteSearch) terminalNorteSearch.addEventListener("input", renderLlegadasTerminalNorte);
  if (terminalNorteEstadoFilter) terminalNorteEstadoFilter.addEventListener("change", renderLlegadasTerminalNorte);
  if (terminalNorteBaseFilter) terminalNorteBaseFilter.addEventListener("change", renderLlegadasTerminalNorte);
  if (terminalNorteUploadFrom) terminalNorteUploadFrom.addEventListener("change", renderLlegadasTerminalNorte);
  if (terminalNorteUploadTo) terminalNorteUploadTo.addEventListener("change", renderLlegadasTerminalNorte);
  if (btnDownloadLlegadasTerminalNorte) btnDownloadLlegadasTerminalNorte.addEventListener("click", handleDownloadLlegadasTerminalNorte);

  // Llegadas Almacentro (San Diego)
  if (btnRefreshLlegadasSanDiego) btnRefreshLlegadasSanDiego.addEventListener("click", triggerPlanillaRefresh);
  if (sanDiegoSearch) sanDiegoSearch.addEventListener("input", renderLlegadasSanDiego);
  if (sanDiegoEstadoFilter) sanDiegoEstadoFilter.addEventListener("change", renderLlegadasSanDiego);
  if (sanDiegoBaseFilter) sanDiegoBaseFilter.addEventListener("change", renderLlegadasSanDiego);
  if (sanDiegoUploadFrom) sanDiegoUploadFrom.addEventListener("change", renderLlegadasSanDiego);
  if (sanDiegoUploadTo) sanDiegoUploadTo.addEventListener("change", renderLlegadasSanDiego);
  if (btnDownloadLlegadasSanDiego) btnDownloadLlegadasSanDiego.addEventListener("click", handleDownloadLlegadasSanDiego);

  // Llegadas Nutibara
  if (btnRefreshLlegadasNutibara) btnRefreshLlegadasNutibara.addEventListener("click", triggerPlanillaRefresh);
  if (nutibaraSearch) nutibaraSearch.addEventListener("input", renderLlegadasNutibara);
  if (nutibaraEstadoFilter) nutibaraEstadoFilter.addEventListener("change", renderLlegadasNutibara);
  if (nutibaraBaseFilter) nutibaraBaseFilter.addEventListener("change", renderLlegadasNutibara);
  if (nutibaraUploadFrom) nutibaraUploadFrom.addEventListener("change", renderLlegadasNutibara);
  if (nutibaraUploadTo) nutibaraUploadTo.addEventListener("change", renderLlegadasNutibara);
  if (btnDownloadLlegadasNutibara) btnDownloadLlegadasNutibara.addEventListener("click", handleDownloadLlegadasNutibara);

  // No despacho
  if (btnRefreshNoDespacho) btnRefreshNoDespacho.addEventListener("click", triggerPlanillaRefresh);
  if (noDespachoSearch) noDespachoSearch.addEventListener("input", renderNoDespachoTab);
  if (noDespachoPuntoFilter) noDespachoPuntoFilter.addEventListener("change", renderNoDespachoTab);
  if (noDespachoBaseFilter) noDespachoBaseFilter.addEventListener("change", renderNoDespachoTab);
  if (noDespachoFrom) noDespachoFrom.addEventListener("change", renderNoDespachoTab);
  if (noDespachoTo) noDespachoTo.addEventListener("change", renderNoDespachoTab);

  // Fuera de lista
  if (fueraListaSearch) fueraListaSearch.addEventListener("input", renderFueraListaTab);

  // Mobile tabs
  if (mobileTabSelect) {
    mobileTabSelect.addEventListener("change", () => {
      openTabById(mobileTabSelect.value);
    });
  }
}


// ==================== INIT ====================
async function initializeApp(){
  loadPlanillaTableSourcePreference();
  await loadDriversFromCSV();
  await loadVehiculosSonarFromSupabase();
  await loadPlanillaAfiliadosFromSupabase();
  if (operativoPanel) operativoPanel.classList.remove("hidden");
  if (operativoInner) operativoInner.classList.remove("hidden");
  renderFueraListaTab();
  refreshMobileTabSwitcher();
  if (getActiveTabId() === "mapa-vehiculos" && typeof activateMapaVehiculosTab === "function") {
    activateMapaVehiculosTab();
  }
}

function bindWindowEvents(){
  window.addEventListener("beforeunload", () => {
    if (planillaAutoRefreshTimer) {
      clearInterval(planillaAutoRefreshTimer);
      planillaAutoRefreshTimer = null;
    }
  });

  if (!planillaAutoRefreshTimer) {
    planillaAutoRefreshTimer = setInterval(async () => {
      if (!navigator.onLine || !currentUserId) return;
      const activeTab = getActiveTabId();
      if (!isPlanillaRelatedTab(activeTab)) return;
      await ensureFreshPlanillaData({ maxAgeMs: PLANILLA_REFRESH_MAX_AGE_MS });
    }, PLANILLA_AUTO_REFRESH_MS);
  }
}
