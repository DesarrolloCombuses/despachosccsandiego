function localDateISO(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso, days){
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const today = localDateISO();
document.getElementById('fecha_inicio').value = today;
document.getElementById('fecha_fin').value = today;

const mapaBase = {
  703:4,705:4,707:4,708:5,709:3,
  714:3,715:4,716:3,717:4,718:3,
  719:2,720:3,721:4,722:3,723:3,
  724:3,725:4,726:3,727:3,728:4,
  729:1,730:1,731:4,732:1,733:5,
  734:3,735:4,736:8,737:3,738:3,
  739:3,740:3,741:3,742:3,744:3,
  745:3,746:4,747:5,748:2,749:2,
  750:3,751:3,752:3,753:3,754:3,
  755:3,757:5,758:3,759:6,756:0,
  764:0,767:0,769:0,766:0,768:0,
  743:3,756:8
};

function basePorInterno(interno){
  const key = String(interno || '').trim();
  if(!key) return '-';
  const base = mapaBase[key];
  return base === undefined ? '-' : String(base);
}

const cruceState = {
  llegadas104: [],
  llegadas101: [],
  llegadas110: [],
  llegadas129: [],
  despachos: [],
  cruceRows: [],
  cruceRowsFiltradas: []
};
const dispatchState = {
  candidates: [],
  novedades: {}
};
const planilla2SyncState = {
  inFlight: false,
  lastSeenSignature: '',
  lastSyncedSignature: '',
  lastSyncAt: 0,
  lastSource: '-',
  lastRows: 0,
  lastError: ''
};
const FOCUS_UI_KEY = 'focus_lists_mode_v1';
const DISPATCH_ITINERARIES = [
  { id: '3385', grupo: 'AEROPUERTO', nombre: 'Aeropuerto-San Diego-Tunel' },
  { id: '3387', grupo: 'NUTIBARA', nombre: 'Nutibara-Aeropuerto-Autopista' },
  { id: '3394', grupo: 'NUTIBARA', nombre: 'Nutibara-Aeropuerto-Variante Palmas' },
  { id: '3395', grupo: 'SANDIEGO', nombre: 'San Diego-Aeropuerto-Variante Palmas' },
  { id: '4413', grupo: 'AEROPUERTO', nombre: 'Aeropuerto-Exposiciones' },
  { id: '4501', grupo: 'AEROPUERTO', nombre: 'Aeropuerto-autopista-terminalnorte' },
  { id: '4502', grupo: 'EXPOSICIONES', nombre: 'Nutibara-exposiciones-tunel-aeropuerto' },
  { id: '4503', grupo: 'AEROPUERTO', nombre: 'Aeropuerto-Tunel-Exposiciones-Nutibara' },
  { id: '4505', grupo: 'SANDIEGO', nombre: 'Almacentro-Tunel-Aeropuerto' }
];
const DEFAULT_DISPATCH_BY_TIPO = {'104':'3385', '101':'4505', '110':'4502'};
const ITIN_FILTERS_BY_TIPO = {
  '104': [
    'Nutibara-Aeropuerto-Autopista',
    'San Diego-Aeropuerto-Variante Palmas',
    'Nutibara-exposiciones-tunel-aeropuerto',
    'Almacentro-Tunel-Aeropuerto',
    'ccsandiego-tunel-aeropuerto',
    'Terminalnorte-autopista-aeropuerto'
  ],
  '101': [
    'Aeropuerto-San Diego-Tunel',
    'Aeropuerto-Exposiciones'
  ],
  '110': [
    'Aeropuerto-Tunel-Exposiciones-Nutibara'
  ]
};
const TIPO_LABEL_BY_CODE = {'104':'Llegada Aeropuerto', '101':'Llegada San Diego', '110':'Llegada Nutibara'};

function stats(text){ document.getElementById('stats').textContent = text; }
function showJSON(obj){ document.getElementById('json_detalle').textContent = JSON.stringify(obj, null, 2); }
function download(url){ window.location = url; }

function parsePossibleJson(text){
  const raw = String(text || '').trim();
  if(!raw) return null;
  try{ return JSON.parse(raw); }catch(_e){}
  const i = raw.indexOf('{');
  const j = raw.lastIndexOf('}');
  if(i >= 0 && j > i){
    const chunk = raw.slice(i, j + 1);
    try{ return JSON.parse(chunk); }catch(_e){}
  }
  return null;
}

function showDispatchResultModal(ok, payload){
  const title = document.getElementById('dispatch_modal_title');
  const status = document.getElementById('dispatch_modal_status');
  const pre = document.getElementById('dispatch_modal_json');
  if(!title || !status || !pre) return;
  title.textContent = 'Resultado despacho';
  status.innerHTML = ok
    ? '<span class="badge bg-success">Exitoso</span> El despacho fue enviado correctamente.'
    : '<span class="badge bg-danger">Error</span> El despacho no se pudo completar.';
  pre.textContent = JSON.stringify(payload || {}, null, 2);
  const modalEl = document.getElementById('dispatchResultModal');
  if(modalEl && window.bootstrap && window.bootstrap.Modal){
    const instance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    instance.show();
  }
}

function escapeHtml(v){
  return String(v || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rowDriverId(r){
  return String(r.DriverId || r.driverId || r.DrvId || r.drvId || r.drv_id || '').trim();
}

function rowDriverName(r){
  return String(r.DriverName || r.driverName || r.Conductor || r.conductor || r.driver_name || '').trim();
}

function itineraryOptionsHtml(defaultId){
  return DISPATCH_ITINERARIES.map(it => {
    const selected = String(it.id) === String(defaultId || '') ? ' selected' : '';
    return `<option value="${escapeHtml(it.id)}"${selected}>${escapeHtml(it.id)} - ${escapeHtml(it.nombre)}</option>`;
  }).join('');
}

function localDatetimeToSonar(v){
  const raw = String(v || '').trim();
  if(!raw) return '';
  const s = raw.replace('T', ' ');
  if(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s;
}

function setupManualDispatchForm(){
  const sel = document.getElementById('manual_itinerary_id');
  if(sel && !sel.dataset.loaded){
    sel.innerHTML = itineraryOptionsHtml('3385');
    sel.dataset.loaded = '1';
  }
}

function collectDispatchCandidates(){
  const rows = (cruceState.cruceRows || []);
  const now = new Date();
  const windowed = rows.filter(r => {
    const dt = parseGpsGMT(r.hora || '');
    if(!dt) return false;
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const tomorrowStart = new Date(todayStart.getTime() + (24 * 60 * 60 * 1000));
    const yesterdayStart = new Date(todayStart.getTime() - (24 * 60 * 60 * 1000));
    const yesterday2100 = new Date(yesterdayStart.getFullYear(), yesterdayStart.getMonth(), yesterdayStart.getDate(), 21, 0, 0);
    const isToday = dt >= todayStart && dt < tomorrowStart;
    const isPrevDayAfter21 = dt >= yesterday2100 && dt < todayStart;
    return isToday || isPrevDayAfter21;
  });
  const mapped = windowed.map(r => ({
    _tipo: String(r.tipo || ''),
    GpsGMT: String(r.hora || ''),
    placa: String(r.placa || ''),
    interno: String(r.interno || ''),
    mId: String(r.mid || ''),
    ItName: String(r.itin || ''),
    DriverId: String(r.drv_id || ''),
    DriverName: String(r.driver_name || ''),
    estado: String(r.estado || 'Pendiente'),
    despacho_hora: String(r.despacho_hora || ''),
    despacho_itin: String(r.despacho_itin || ''),
    dispatch_idx: Number.isInteger(r.dispatch_idx) ? r.dispatch_idx : -1
  }));
  mapped.sort((a, b) => {
    const da = parseGpsGMT(a.GpsGMT) || new Date(0);
    const db = parseGpsGMT(b.GpsGMT) || new Date(0);
    return db - da;
  });
  const dedup = [];
  const seen = new Set();
  mapped.forEach(r => {
    const k = `${String(r._tipo)}|${String(r.mId || '').trim()}|${rowDriverId(r)}|${String(r.GpsGMT || '').trim()}`;
    if(!k || seen.has(k)) return;
    seen.add(k);
    dedup.push(r);
  });
  return dedup;
}

function normalizeKey(v){
  return String(v || '').trim().toLowerCase();
}

function refreshDispatchItineraryFilterOptions(rows){
  const sel = document.getElementById('disp_filtro_itin');
  if(!sel) return;
  const prev = String(sel.value || '');
  const tipoFiltro = String((document.getElementById('disp_filtro_tipo') || {}).value || '').trim();

  const condSet = new Set();
  if(tipoFiltro){
    (ITIN_FILTERS_BY_TIPO[tipoFiltro] || []).forEach(x => condSet.add(normalizeKey(x)));
  }else{
    Object.values(ITIN_FILTERS_BY_TIPO).forEach(arr => (arr || []).forEach(x => condSet.add(normalizeKey(x))));
  }

  const uniq = [];
  const seen = new Set();
  (rows || []).forEach(r => {
    const itin = String(r.ItName || '').trim();
    const key = normalizeKey(itin);
    if(!itin || !key || seen.has(key)) return;
    if(condSet.size && !condSet.has(key)) return;
    seen.add(key);
    uniq.push(itin);
  });
  uniq.sort((a, b) => a.localeCompare(b, 'es'));

  const options = ['<option value="">Todos los itinerarios</option>'];
  if(tipoFiltro){
    options.push(...uniq.map(it => `<option value="${escapeHtml(it)}">${escapeHtml(it)}</option>`));
  }else{
    ['104', '101', '110'].forEach(t => {
      const allowed = new Set((ITIN_FILTERS_BY_TIPO[t] || []).map(normalizeKey));
      const list = uniq.filter(it => allowed.has(normalizeKey(it)));
      if(!list.length) return;
      options.push(`<optgroup label="${escapeHtml(TIPO_LABEL_BY_CODE[t] || t)}">`);
      options.push(...list.map(it => `<option value="${escapeHtml(it)}">${escapeHtml(it)}</option>`));
      options.push('</optgroup>');
    });
  }
  sel.innerHTML = options.join('');
  if(prev && uniq.some(x => normalizeKey(x) === normalizeKey(prev))){
    sel.value = prev;
  }else{
    sel.value = '';
  }
}

function limpiarFiltrosDespacho(){
  const estado = document.getElementById('disp_filtro_estado');
  const tipo = document.getElementById('disp_filtro_tipo');
  const itin = document.getElementById('disp_filtro_itin');
  if(estado) estado.value = 'Pendiente';
  if(tipo) tipo.value = '';
  if(itin) itin.value = '';
  renderDespachoTab();
}

function renderDespachoTab(){
  setupManualDispatchForm();
  const tb = document.getElementById('disp_tb_auto');
  const total = document.getElementById('disp_total_auto');
  if(!tb || !total) return;
  const estadoFiltro = String((document.getElementById('disp_filtro_estado') || {}).value || '').trim();
  const tipoFiltro = String((document.getElementById('disp_filtro_tipo') || {}).value || '').trim();
  const allRows = collectDispatchCandidates();
  refreshDispatchItineraryFilterOptions(allRows);
  const itinFiltro = String((document.getElementById('disp_filtro_itin') || {}).value || '').trim();
  const filas = allRows.filter(r => {
    const key = `${String(r._tipo)}|${String(r.mId || '').trim()}|${String(r.interno || '').trim()}|${String(r.GpsGMT || '').trim()}`;
    const novedad = dispatchState.novedades[key];
    const estado = novedad ? 'Novedad' : String(r.estado || '').trim();
    const tipo = String(r._tipo || '').trim();
    const itin = String(r.ItName || '').trim();
    if(estadoFiltro && estado !== estadoFiltro) return false;
    if(tipoFiltro && tipo !== tipoFiltro) return false;
    if(itinFiltro && normalizeKey(itin) !== normalizeKey(itinFiltro)) return false;
    return true;
  });
  dispatchState.candidates = filas;
  total.textContent = `Candidatos para despacho: ${filas.length} de ${allRows.length}`;
  tb.innerHTML = '';

  filas.forEach((r, idx) => {
    const tr = document.createElement('tr');
    const tipo = String(r._tipo || '');
    const defaultIt = DEFAULT_DISPATCH_BY_TIPO[tipo] || '';
    const selectId = `disp_it_${idx}`;
    const mid = String(r.mId || r.mid || '').trim();
    const drvId = rowDriverId(r);
    const canDispatch = !!mid && !!drvId;
    const options = itineraryOptionsHtml(defaultIt);
    const rowKey = `${String(r._tipo)}|${String(r.mId || '').trim()}|${String(r.interno || '').trim()}|${String(r.GpsGMT || '').trim()}`;
    const novedad = dispatchState.novedades[rowKey];
    const estado = novedad ? 'Novedad' : (canDispatch ? (String(r.estado || 'Pendiente')) : 'Falta mId/DrvId');
    const isPending = estado === 'Pendiente';
    const isNovedad = estado === 'Novedad';
    const canReopen = estado === 'Despachado';
    const btnDisabled = (canDispatch && isPending) ? '' : ' disabled';
    let actionHtml = `<div style="display:flex;gap:4px;align-items:center;min-width:270px"><select id="${selectId}" class="form-select form-select-sm">${options}</select><button class="btn btn-sm btn-primary"${btnDisabled} onclick="dispatchDesdeDespachoTab(${idx}, '${selectId}')">Despachar</button><button class="btn btn-sm btn-outline-warning" onclick="marcarNovedad(${idx})">Novedad</button></div>`;
    if(canReopen){
      actionHtml = `<div style="display:flex;gap:6px;align-items:center;min-width:270px"><span class="badge bg-success">Despachado</span><button class="btn btn-sm btn-outline-danger" onclick="devolverADespacho(${idx})">Devolver a despacho</button></div>`;
    }
    if(isNovedad){
      actionHtml = `<div style="display:flex;gap:6px;align-items:center;min-width:270px"><span class="badge bg-warning text-dark">Novedad</span><button class="btn btn-sm btn-outline-secondary" onclick="quitarNovedad(${idx})">Reactivar</button></div>`;
    }
    const estadoTxt = isNovedad ? `${estado}: ${novedad}` : estado;
    tr.innerHTML = `<td>${r.GpsGMT || ''}</td><td>${tipoLlegadaLabel(tipo)}</td><td>${r.placa || ''}</td><td>${r.interno || ''}</td><td>${mid}</td><td>${drvId}</td><td>${rowDriverName(r)}</td><td>${r.ItName || ''}</td><td>${actionHtml}</td><td>${estadoTxt}</td>`;
    tb.appendChild(tr);
  });
}

function marcarNovedad(idx){
  const row = dispatchState.candidates[idx];
  if(!row) return;
  const motivo = String(window.prompt('Escribe la novedad (no se despacha):', '') || '').trim();
  if(!motivo) return;
  const key = `${String(row._tipo)}|${String(row.mId || '').trim()}|${String(row.interno || '').trim()}|${String(row.GpsGMT || '').trim()}`;
  dispatchState.novedades[key] = motivo;
  renderDespachoTab();
  stats(`Novedad registrada para mId ${row.mId || ''}: ${motivo}`);
}

function quitarNovedad(idx){
  const row = dispatchState.candidates[idx];
  if(!row) return;
  const key = `${String(row._tipo)}|${String(row.mId || '').trim()}|${String(row.interno || '').trim()}|${String(row.GpsGMT || '').trim()}`;
  delete dispatchState.novedades[key];
  renderDespachoTab();
  stats(`Novedad removida para mId ${row.mId || ''}.`);
}

function removerDespachoPorIndice(dispatchIdx, row){
  const list = (cruceState.despachos || []).slice();
  if(Number.isInteger(dispatchIdx) && dispatchIdx >= 0 && dispatchIdx < list.length){
    list.splice(dispatchIdx, 1);
    return list;
  }
  const mid = String(row.mId || '').trim();
  const interno = String(row.interno || '').trim();
  const hora = String(row.despacho_hora || '').trim();
  const i = list.findIndex(d => {
    const dMid = String(pickFirst(d, ['mTd', 'MTd', 'mId', 'mid', 'MID', '_consulta_mId']) || '').trim();
    const dInterno = String(pickFirst(d, ['mDesc', 'MDesc', 'interno', 'Interno', 'InternalID', 'internalID', 'internal_id']) || '').trim();
    const dHora = String(horaDespacho(d) || '').trim();
    return (!!mid && dMid === mid) && (!!interno && dInterno === interno) && (!!hora && dHora === hora);
  });
  if(i >= 0) list.splice(i, 1);
  return list;
}

function devolverADespacho(idx){
  const row = dispatchState.candidates[idx];
  if(!row) return;
  const updated = removerDespachoPorIndice(row.dispatch_idx, row);
  renderDespachos(updated);
  renderDespachoTab();
  stats(`Despacho revertido para mId ${row.mId || ''}. Ahora vuelve a Pendiente.`);
}

async function dispatchDesdeDespachoTab(idx, selectId){
  try{
    const row = dispatchState.candidates[idx];
    if(!row){
      stats('No se encontro la fila candidata.');
      return;
    }
    const sel = document.getElementById(selectId);
    const itinerary_id = sel ? String(sel.value || '').trim() : '';
    const mid = String(row.mId || row.mid || '').trim();
    const drv_id = rowDriverId(row);
    const driver_name = rowDriverName(row);
    if(!mid || !drv_id){
      stats('No se puede despachar: falta mId o DrvId.');
      return;
    }
    if(!itinerary_id){
      stats('Selecciona un itinerario para despachar.');
      return;
    }
    stats(`Enviando despacho... mId ${mid}, DrvId ${drv_id}, Itinerary ${itinerary_id}`);
    const data = await post('/api/dispatch_sonar_direct', {mid, drv_id, driver_name, itinerary_id, comments: ''});
    const itinNombre = data && data.itinerary ? data.itinerary.nombre : itinerary_id;
    const rowKey = `${String(row._tipo)}|${String(row.mId || '').trim()}|${String(row.interno || '').trim()}|${String(row.GpsGMT || '').trim()}`;
    delete dispatchState.novedades[rowKey];
    if(data && data.dispatch_preview){
      renderDespachos([data.dispatch_preview].concat(cruceState.despachos || []));
    }
    renderDespachoTab();
    showDispatchResultModal(true, {
      ok: true,
      resumen: {mid, drv_id, itinerary_id, itinerary_nombre: itinNombre},
      sonar_response: data ? data.sonar_response : null,
      raw: data
    });
    stats(`Despacho enviado: mId ${mid} | DrvId ${drv_id} | Itinerario ${itinNombre}`);
  }catch(e){
    const parsed = parsePossibleJson(e && e.message ? e.message : '');
    renderDespachoTab();
    showDispatchResultModal(false, parsed || {error: String(e && e.message ? e.message : e)});
    stats('Error despachando: ' + e.message);
  }
}

async function dispatchManual(){
  try{
    setupManualDispatchForm();
    const mid = String((document.getElementById('manual_mid') || {}).value || '').trim();
    const drv_id = String((document.getElementById('manual_drv_id') || {}).value || '').trim();
    const driver_name = String((document.getElementById('manual_driver_name') || {}).value || '').trim();
    const itinerary_id = String((document.getElementById('manual_itinerary_id') || {}).value || '').trim();
    const comments = String((document.getElementById('manual_comments') || {}).value || '').trim();
    const utc_datetime = localDatetimeToSonar(String((document.getElementById('manual_utc_datetime') || {}).value || '').trim());
    if(!mid || !drv_id){
      stats('No se puede despachar: falta mId o DrvId.');
      return;
    }
    if(!itinerary_id){
      stats('Selecciona un itinerario para despachar.');
      return;
    }
    stats(`Enviando despacho... mId ${mid}, DrvId ${drv_id}, Itinerary ${itinerary_id}`);
    const data = await post('/api/dispatch_sonar_direct', {mid, drv_id, driver_name, itinerary_id, comments, utc_datetime});
    const itinNombre = data && data.itinerary ? data.itinerary.nombre : itinerary_id;
    if(data && data.dispatch_preview){
      renderDespachos([data.dispatch_preview].concat(cruceState.despachos || []));
    }
    renderDespachoTab();
    showDispatchResultModal(true, {
      ok: true,
      resumen: {mid, drv_id, itinerary_id, itinerary_nombre: itinNombre, comments, utc_datetime},
      sonar_response: data ? data.sonar_response : null,
      raw: data
    });
    stats(`Despacho manual enviado: mId ${mid} | DrvId ${drv_id} | Itinerario ${itinNombre}`);
  }catch(e){
    const parsed = parsePossibleJson(e && e.message ? e.message : '');
    showDispatchResultModal(false, parsed || {error: String(e && e.message ? e.message : e)});
    stats('Error en despacho manual: ' + e.message);
  }
}

function applyFocusListsMode(on){
  document.body.classList.toggle('focus-lists', !!on);
  const btn = document.getElementById('btn_toggle_focus');
  if(btn) btn.textContent = on ? 'Mostrar' : 'Ocultar';
  try{ localStorage.setItem(FOCUS_UI_KEY, on ? '1' : '0'); }catch(_e){}
}

function toggleFocusLists(){
  const on = !document.body.classList.contains('focus-lists');
  applyFocusListsMode(on);
}

function setTab(tab){
  document.getElementById('tab-operacion').classList.toggle('active', tab === 'operacion');
  document.getElementById('tab-dashboard').classList.toggle('active', tab === 'dashboard');
  document.getElementById('tab-despacho').classList.toggle('active', tab === 'despacho');
  document.getElementById('tab-crucefull').classList.toggle('active', tab === 'crucefull');
  document.getElementById('tab-planilla').classList.toggle('active', tab === 'planilla');
  document.getElementById('tab-planilla2').classList.toggle('active', tab === 'planilla2');
  const tv = document.getElementById('tab-vehiculos');
  if(tv) tv.classList.toggle('active', tab === 'vehiculos');
  document.getElementById('tabbtn-operacion').classList.toggle('active', tab === 'operacion');
  document.getElementById('tabbtn-dashboard').classList.toggle('active', tab === 'dashboard');
  document.getElementById('tabbtn-despacho').classList.toggle('active', tab === 'despacho');
  document.getElementById('tabbtn-crucefull').classList.toggle('active', tab === 'crucefull');
  document.getElementById('tabbtn-planilla').classList.toggle('active', tab === 'planilla');
  document.getElementById('tabbtn-planilla2').classList.toggle('active', tab === 'planilla2');
  const btnV = document.getElementById('tabbtn-vehiculos');
  if(btnV) btnV.classList.toggle('active', tab === 'vehiculos');
  if(tab === 'dashboard'){ refreshDashboard(); }
  if(tab === 'despacho'){ renderDespachoTab(); }
  if(tab === 'crucefull'){ renderCruceOperativo(); }
  if(tab === 'planilla'){ cargarPlanillaAfiliados(); }
  if(tab === 'planilla2'){ cargarPlanillaAfiliados2(); }
  if(tab === 'vehiculos'){ cargarVehiculos(); }
}

const vehiculosState = { rows: [], fuente: '-', ultimaCarga: null, ttlSeg: 0 };

async function cargarVehiculos(refresh=false){
  try{
    const url = refresh ? '/api/vehiculos?refresh=1' : '/api/vehiculos';
    const data = await getJSON(url);
    vehiculosState.rows = Array.isArray(data.vehiculos) ? data.vehiculos : [];
    vehiculosState.fuente = String(data.fuente || '-');
    vehiculosState.ultimaCarga = data.ultima_carga || null;
    vehiculosState.ttlSeg = Number(data.ttl_seg || 0);
    renderVehiculosTab();
  }catch(e){
    const meta = document.getElementById('veh_meta');
    if(meta) meta.textContent = `Error: ${e.message}`;
    stats('Error cargando vehiculos: ' + e.message);
  }
}

function renderVehiculosTab(){
  const tb = document.getElementById('veh_tb');
  const meta = document.getElementById('veh_meta');
  if(!tb) return;
  const filtro = String((document.getElementById('veh_filtro') || {}).value || '').trim().toLowerCase();
  const rows = (vehiculosState.rows || []).filter(r => {
    if(!filtro) return true;
    return [r.interno, r.placa, r.mid].some(v => String(v || '').toLowerCase().includes(filtro));
  });
  tb.innerHTML = '';
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(r.interno||'')}</td><td>${escapeHtml(r.placa||'')}</td><td>${escapeHtml(r.mid||'')}</td>`;
    tb.appendChild(tr);
  });
  if(meta){
    const total = (vehiculosState.rows || []).length;
    const partes = [];
    partes.push(`Fuente: ${vehiculosState.fuente}`);
    partes.push(`Total: ${total}`);
    if(vehiculosState.ultimaCarga) partes.push(`Ultima carga: ${vehiculosState.ultimaCarga}`);
    if(vehiculosState.ttlSeg) partes.push(`TTL: ${vehiculosState.ttlSeg}s`);
    if(filtro) partes.push(`Mostrando: ${rows.length}`);
    meta.textContent = partes.join(' | ');
  }
}

function formatNowTime(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function setPlanilla2SyncStatus(text){
  const el = document.getElementById('pl2_sync_status');
  if(!el) return;
  el.textContent = text;
}

function buildCruceSignature(rows){
  const arr = Array.isArray(rows) ? rows : [];
  if(!arr.length) return '';
  return arr
    .map(r => [
      String(r.tipo || ''),
      String(r.hora || ''),
      String(r.interno || ''),
      String(r.mid || ''),
      String(r.despacho_hora || ''),
      String(r.estado || '')
    ].join('|'))
    .join('~');
}

async function maybeAutoSyncPlanilla2FromCruce(){
  const rows = (cruceState.cruceRows || []);
  if(!rows.length) return;
  const sig = buildCruceSignature(rows);
  if(!sig) return;
  if(sig === planilla2SyncState.lastSeenSignature) return;
  planilla2SyncState.lastSeenSignature = sig;
  await enviarCruceAPlanilla2(true, {rowsOverride: rows, trigger: 'auto', force: true});
}

function parseGpsGMT(v){
  if(!v) return null;
  const s = String(v).trim().replace('T',' ');
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/);
  if(!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]));
}

function tiempoRelativo(v){
  const dt = parseGpsGMT(v);
  if(!dt) return '-';
  const now = new Date();
  const diffMs = now - dt;
  if(diffMs < 0) return 'ahora';
  const mins = Math.floor(diffMs / 60000);
  if(mins < 1) return 'hace menos de 1 min';
  if(mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if(hrs < 24){
    if(remMins === 0) return `hace ${hrs} h`;
    return `hace ${hrs} h ${remMins} min`;
  }
  const dias = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  if(remHrs === 0) return `hace ${dias} d`;
  return `hace ${dias} d ${remHrs} h`;
}

function filtrarUltimas2Horas(items){
  const now = new Date();
  const min = new Date(now.getTime() - (2 * 60 * 60 * 1000));
  return (items || []).filter(r => {
    const dt = parseGpsGMT(r.GpsGMT);
    return dt && dt >= min && dt <= now;
  });
}

function dedupeByVehiculoItinerario(items){
  const latest = new Map();
  (items || []).forEach(r => {
    const key = `${r.mId || ''}__${r.ItName || ''}`;
    const dt = parseGpsGMT(r.GpsGMT);
    if(!dt) return;
    const prev = latest.get(key);
    if(!prev || dt > parseGpsGMT(prev.GpsGMT)){ latest.set(key, r); }
  });
  return Array.from(latest.values()).sort((a,b) => {
    const da = parseGpsGMT(a.GpsGMT) || new Date(0);
    const db = parseGpsGMT(b.GpsGMT) || new Date(0);
    return db - da;
  });
}

function syncCalendarWithToday(){
  const today = localDateISO();
  const fi = document.getElementById('fecha_inicio');
  const ff = document.getElementById('fecha_fin');
  if(!fi.value || !ff.value){
    fi.value = today;
    ff.value = today;
    stats(`Fecha actualizada automaticamente a ${today}`);
  }
}

function renderVehiculos(items){
  const el = document.getElementById('vehiculos'); el.innerHTML = '';
  items.forEach((it, idx) => {
    const d = document.createElement('div');
    d.className='item';
    d.textContent = `${it.placa} | mId: ${it.mId} | Int: ${it.interno} | ${it.error ? 'ERROR':'OK'}`;
    d.onclick = () => showJSON(it);
    el.appendChild(d);
    if(idx === 0) showJSON(it);
  });
}

function renderLlegadasSubida(items){
  const filas = dedupePorVehiculoEnMismaHora(items || []);
  cruceState.llegadas104 = filas.slice();
  const tb = document.getElementById('tb_llegadas_subida'); tb.innerHTML='';
  document.getElementById('total_llegadas_subida').textContent = `Total acumulado de llegadas Aeropuerto (rango consultado): ${filas.length}`;
  filas.forEach((r)=>{
    const tr = document.createElement('tr');
    const driverId = r.DriverId || r.driverId || r.DrvId || r.drvId || '';
    const conductor = r.DriverName || r.driverName || r.Conductor || r.conductor || '';
    tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${r.placa||''}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${r.ItName||''}</td><td>${driverId}</td><td>${conductor}</td>`;
    tb.appendChild(tr);
  });
  renderCruceOperativo();
  renderDespachoTab();
}

function renderLlegadasBajada(items){
  const filas = dedupePorVehiculoEnMismaHora(items || []);
  cruceState.llegadas101 = filas.slice();
  const tb = document.getElementById('tb_llegadas_bajada'); tb.innerHTML='';
  document.getElementById('total_llegadas_bajada').textContent = `Total acumulado de llegadas San Diego (rango consultado): ${filas.length}`;
  filas.forEach((r)=>{
    const tr = document.createElement('tr');
    const driverId = r.DriverId || r.driverId || r.DrvId || r.drvId || '';
    const conductor = r.DriverName || r.driverName || r.Conductor || r.conductor || '';
    tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${r.placa||''}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${r.ItName||''}</td><td>${driverId}</td><td>${conductor}</td>`;
    tb.appendChild(tr);
  });
  renderCruceOperativo();
  renderDespachoTab();
}

function renderLlegadasNutibara(items){
  const filas = dedupePorVehiculoEnMismaHora(items || []);
  cruceState.llegadas110 = filas.slice();
  const tb = document.getElementById('tb_llegadas_nutibara'); if(!tb) return;
  tb.innerHTML='';
  const total = document.getElementById('total_llegadas_nutibara');
  if(total) total.textContent = `Total acumulado de llegadas Nutibara (rango consultado): ${filas.length}`;
  filas.forEach((r)=>{
    const tr = document.createElement('tr');
    const driverId = r.DriverId || r.driverId || r.DrvId || r.drvId || '';
    const conductor = r.DriverName || r.driverName || r.Conductor || r.conductor || '';
    tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${r.placa||''}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${r.ItName||''}</td><td>${driverId}</td><td>${conductor}</td>`;
    tb.appendChild(tr);
  });
  renderCruceOperativo();
  renderDespachoTab();
}

function renderLlegadasTerminalNorte(items){
  const filas = dedupePorVehiculoEnMismaHora(items || []);
  cruceState.llegadas129 = filas.slice();
  const tb = document.getElementById('tb_llegadas_terminalnorte'); if(!tb) return;
  tb.innerHTML = '';
  const total = document.getElementById('total_llegadas_terminalnorte');
  if(total) total.textContent = `Total Terminal Norte (129): ${filas.length}`;
  filas.forEach((r)=>{
    const tr = document.createElement('tr');
    const driverId = r.DriverId || r.driverId || r.DrvId || r.drvId || '';
    const conductor = r.DriverName || r.driverName || r.Conductor || r.conductor || '';
    tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${r.placa||''}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${r.ItName||''}</td><td>${driverId}</td><td>${conductor}</td><td>${r.eventDescription||''}</td>`;
    tb.appendChild(tr);
  });
}

function renderDashboard(data){
  const todas104 = dedupePorVehiculoEnMismaHora(data.ultimas_104 || []);
  const todas101 = dedupePorVehiculoEnMismaHora(data.ultimas_101 || []);
  const todas110 = dedupePorVehiculoEnMismaHora(data.ultimas_110 || []);

  const tbu104 = document.getElementById('db_tb_ultimas_104'); tbu104.innerHTML = '';
  todas104.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${tiempoRelativo(r.GpsGMT)}</td><td>${basePorInterno(r.interno)}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${rowDriverId(r)}</td><td>${r.ItName||''}</td>`;
    tbu104.appendChild(tr);
  });

  const tbu101 = document.getElementById('db_tb_ultimas_101'); tbu101.innerHTML = '';
  todas101.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${tiempoRelativo(r.GpsGMT)}</td><td>${basePorInterno(r.interno)}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${rowDriverId(r)}</td><td>${r.ItName||''}</td>`;
    tbu101.appendChild(tr);
  });

  const tbu110 = document.getElementById('db_tb_ultimas_110');
  if(tbu110){
    tbu110.innerHTML = '';
    todas110.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.GpsGMT||''}</td><td>${tiempoRelativo(r.GpsGMT)}</td><td>${basePorInterno(r.interno)}</td><td>${r.interno||''}</td><td>${r.mId||''}</td><td>${rowDriverId(r)}</td><td>${r.ItName||''}</td>`;
      tbu110.appendChild(tr);
    });
  }
}

function dedupePorVehiculoEnMismaHora(items){
  const ordered = (items || []).slice().sort((a, b) => {
    const da = parseGpsGMT(a.GpsGMT) || new Date(0);
    const db = parseGpsGMT(b.GpsGMT) || new Date(0);
    return db - da;
  });

  const kept = [];
  const lastKeptByVeh = new Map();
  ordered.forEach(r => {
    const dt = parseGpsGMT(r.GpsGMT);
    const veh = String(r.interno || r.mId || '').trim();
    if(!dt || !veh){
      kept.push(r);
      return;
    }
    const prevDt = lastKeptByVeh.get(veh);
    if(!prevDt){
      lastKeptByVeh.set(veh, dt);
      kept.push(r);
      return;
    }
    const diffMs = Math.abs(prevDt - dt);
    if(diffMs >= (60 * 60 * 1000)){
      lastKeptByVeh.set(veh, dt);
      kept.push(r);
    }
  });
  return kept;
}

function pickFirst(row, keys){
  for(const k of keys){
    if(row && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== ''){
      return row[k];
    }
  }
  return '';
}

function horaDespacho(row){
  const directa = pickFirst(row, [
    'UTC_datetime', 'utc_datetime', 'GpsGMT', 'gps_gmt',
    'dispatchDateTime', 'DispatchDateTime', 'DateTime', 'dateTime',
    'created_at', 'createdAt'
  ]);
  if(directa) return directa;

  const initDate = String(pickFirst(row, ['initDate', 'InitDate']) || '').trim();
  const initTime = String(pickFirst(row, ['initTime', 'InitTime']) || '').trim();
  if(initDate && initTime) return `${initDate} ${initTime}`;
  if(initDate) return initDate;
  return '';
}

function renderDespachos(items){
  const filas = (items || []);
  cruceState.despachos = filas.slice();
  const tb = document.getElementById('tb_despachos'); tb.innerHTML = '';
  document.getElementById('total_despachos').textContent = `Total despachos (rango consultado): ${filas.length}`;

  filas.forEach(r => {
    const interno = pickFirst(r, ['mDesc', 'MDesc', 'interno', 'Interno', 'InternalID', 'internalID', 'internal_id']);
    const mid = pickFirst(r, ['mTd', 'MTd', 'mId', 'mid', 'MID', '_consulta_mId']);
    const itin = pickFirst(r, ['itDesc', 'ItDesc', 'ItName', 'itName', 'itineraryName', 'ItineraryName']);
    const conductor = pickFirst(r, ['drName', 'DrName', 'DriverName', 'driverName', 'DrvName', 'driver']);
    const hora = String(horaDespacho(r) || '');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${hora}</td><td>${tiempoRelativo(hora)}</td><td>${basePorInterno(interno)}</td><td>${interno || ''}</td><td>${mid || ''}</td><td>${itin || ''}</td><td>${conductor || ''}</td>`;
    tb.appendChild(tr);
  });
  renderCruceOperativo();
}

function normalizeText(v){
  return String(v || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function msToHuman(ms){
  if(!Number.isFinite(ms) || ms < 0) return '-';
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if(hrs <= 0) return `${mins} min`;
  if(remMins === 0) return `${hrs} h`;
  return `${hrs} h ${remMins} min`;
}

function esDespachoBajada(itin){
  const t = normalizeText(itin);
  return t.startsWith('aeropuerto ');
}

function esDespachoSubida(itin){
  const t = normalizeText(itin);
  return t.includes(' aeropuerto') && !t.startsWith('aeropuerto ');
}

function tipoLlegadaLabel(tipo){
  if(String(tipo) === '104') return 'Llegada Aeropuerto';
  if(String(tipo) === '101') return 'Llegada San Diego';
  if(String(tipo) === '110') return 'Llegada Nutibara';
  if(String(tipo) === '129') return 'Terminal Norte';
  return `Llegada ${tipo || ''}`.trim();
}

function renderCruceOperativo(){
  const tb = document.getElementById('tb_cruce');
  const total = document.getElementById('total_cruce');
  const dbTb = document.getElementById('db_tb_cruce');
  const dbTotal = document.getElementById('db_total_cruce');
  const cfTb = document.getElementById('cf_tb_cruce');
  const cfTotal = document.getElementById('cf_total_cruce');

  const llegadas = [];
  (cruceState.llegadas104 || []).forEach(r => {
    llegadas.push({
      tipo: '104',
      hora: String(r.GpsGMT || ''),
      dt: parseGpsGMT(r.GpsGMT),
      placa: String(r.placa || ''),
      interno: String(r.interno || ''),
      mid: String(r.mId || ''),
      drv_id: rowDriverId(r),
      driver_name: rowDriverName(r),
      itin: String(r.ItName || ''),
      base: basePorInterno(r.interno),
      esperado: 'bajada'
    });
  });
  const llegadas101SinRepetidos = dedupePorVehiculoEnMismaHora(cruceState.llegadas101 || []);
  llegadas101SinRepetidos.forEach(r => {
    llegadas.push({
      tipo: '101',
      hora: String(r.GpsGMT || ''),
      dt: parseGpsGMT(r.GpsGMT),
      placa: String(r.placa || ''),
      interno: String(r.interno || ''),
      mid: String(r.mId || ''),
      drv_id: rowDriverId(r),
      driver_name: rowDriverName(r),
      itin: String(r.ItName || ''),
      base: basePorInterno(r.interno),
      esperado: 'subida'
    });
  });
  const llegadas110SinRepetidos = dedupePorVehiculoEnMismaHora(cruceState.llegadas110 || []);
  llegadas110SinRepetidos.forEach(r => {
    llegadas.push({
      tipo: '110',
      hora: String(r.GpsGMT || ''),
      dt: parseGpsGMT(r.GpsGMT),
      placa: String(r.placa || ''),
      interno: String(r.interno || ''),
      mid: String(r.mId || ''),
      drv_id: rowDriverId(r),
      driver_name: rowDriverName(r),
      itin: String(r.ItName || ''),
      base: basePorInterno(r.interno),
      esperado: 'subida'
    });
  });
  const llegadas129SinRepetidos = dedupePorVehiculoEnMismaHora(cruceState.llegadas129 || []);
  llegadas129SinRepetidos.forEach(r => {
    llegadas.push({
      tipo: '129',
      hora: String(r.GpsGMT || ''),
      dt: parseGpsGMT(r.GpsGMT),
      placa: String(r.placa || ''),
      interno: String(r.interno || ''),
      mid: String(r.mId || ''),
      drv_id: rowDriverId(r),
      driver_name: rowDriverName(r),
      itin: String(r.ItName || ''),
      base: basePorInterno(r.interno),
      esperado: 'subida'
    });
  });

  const despachos = (cruceState.despachos || []).map((r, idx) => {
    const interno = String(pickFirst(r, ['mDesc', 'MDesc', 'interno', 'Interno']) || '');
    const mid = String(pickFirst(r, ['mTd', 'MTd', 'mId', 'mid', 'MID', '_consulta_mId']) || '');
    const itin = String(pickFirst(r, ['itDesc', 'ItDesc', 'ItName', 'itName', 'itineraryName', 'ItineraryName']) || '');
    const conductor = String(pickFirst(r, ['drName', 'DrName', 'DriverName', 'driverName', 'DrvName', 'driver']) || '');
    const hora = String(horaDespacho(r) || '');
    return {
      idx,
      interno,
      mid,
      itin,
      conductor,
      hora,
      dt: parseGpsGMT(hora),
      used: false
    };
  }).filter(x => x.dt);

  llegadas.sort((a,b) => (a.dt || new Date(0)) - (b.dt || new Date(0)));
  despachos.sort((a,b) => a.dt - b.dt);

  const cruceRows = [];
  for(const l of llegadas){
    const cand = despachos.find(d => {
      if(d.used) return false;
      if(d.dt <= l.dt) return false;
      if(l.mid && d.mid && l.mid.trim().toUpperCase() !== d.mid.trim().toUpperCase()) return false;
      if(l.interno && d.interno && l.interno.trim() !== d.interno.trim()) return false;
      if(l.esperado === 'bajada' && !esDespachoBajada(d.itin)) return false;
      if(l.esperado === 'subida' && !esDespachoSubida(d.itin)) return false;
      return true;
    });

    if(cand){
      cand.used = true;
      cruceRows.push({
        ...l,
        despacho_hora: cand.hora,
        despacho_itin: cand.itin,
        despacho_conductor: cand.conductor,
        dispatch_idx: cand.idx,
        estado: 'Despachado',
        espera: msToHuman(cand.dt - l.dt)
      });
    }else{
      cruceRows.push({
        ...l,
        despacho_hora: '',
        despacho_itin: '',
        despacho_conductor: '',
        dispatch_idx: -1,
        estado: 'Pendiente',
        espera: '-'
      });
    }
  }

  cruceRows.sort((a,b) => (b.dt || new Date(0)) - (a.dt || new Date(0)));
  cruceState.cruceRows = cruceRows.slice();
  const pendientes = cruceRows.filter(x => x.estado === 'Pendiente').length;
  const ok = cruceRows.length - pendientes;
  const resumen = `Cruce llegadas vs despachos: ${cruceRows.length} | Despachados: ${ok} | Pendientes: ${pendientes}`;

  if(tb){
    tb.innerHTML = '';
    cruceRows.forEach(r => {
      const tr = document.createElement('tr');
      const tipoLabel = tipoLlegadaLabel(r.tipo);
      tr.innerHTML = `<td>${r.hora || ''}</td><td>${tipoLabel}</td><td>${r.base || '-'}</td><td>${r.interno || ''}</td><td>${r.mid || ''}</td><td>${r.drv_id || ''}</td><td>${r.itin || ''}</td><td>${r.despacho_hora || ''}</td><td>${r.despacho_itin || ''}</td><td>${r.despacho_conductor || ''}</td><td>${r.estado}</td><td>${r.espera}</td>`;
      tb.appendChild(tr);
    });
  }
  if(total) total.textContent = resumen;

  if(dbTb){
    dbTb.innerHTML = '';
    cruceRows.slice(0, 150).forEach(r => {
      const tr = document.createElement('tr');
      const tipoLabel = tipoLlegadaLabel(r.tipo);
      tr.innerHTML = `<td>${r.hora || ''}</td><td>${tipoLabel}</td><td>${r.base || '-'}</td><td>${r.interno || ''}</td><td>${r.mid || ''}</td><td>${r.drv_id || ''}</td><td>${r.despacho_hora || ''}</td><td>${r.estado}</td><td>${r.espera}</td>`;
      dbTb.appendChild(tr);
    });
  }
  if(dbTotal) dbTotal.textContent = `${resumen} | Mostrando: ${Math.min(cruceRows.length, 150)}`;

  if(cfTb){
    const fInterno = String((document.getElementById('cf_filtro_interno') || {}).value || '').trim().toLowerCase();
    const fTipo = String((document.getElementById('cf_filtro_tipo') || {}).value || '').trim();
    const fConductor = String((document.getElementById('cf_filtro_conductor') || {}).value || '').trim().toLowerCase();
    const fLlegadaDesdeVal = String((document.getElementById('cf_filtro_llegada_desde') || {}).value || '').trim();
    const fLlegadaHastaVal = String((document.getElementById('cf_filtro_llegada_hasta') || {}).value || '').trim();
    const fDespachoDesdeVal = String((document.getElementById('cf_filtro_despacho_desde') || {}).value || '').trim();
    const fDespachoHastaVal = String((document.getElementById('cf_filtro_despacho_hasta') || {}).value || '').trim();

    const fLlegadaDesde = fLlegadaDesdeVal ? new Date(fLlegadaDesdeVal) : null;
    const fLlegadaHasta = fLlegadaHastaVal ? new Date(fLlegadaHastaVal) : null;
    const fDespachoDesde = fDespachoDesdeVal ? new Date(fDespachoDesdeVal) : null;
    const fDespachoHasta = fDespachoHastaVal ? new Date(fDespachoHastaVal) : null;

    const rowsFiltradas = cruceRows.filter(r => {
      if(fInterno && !String(r.interno || '').toLowerCase().includes(fInterno)) return false;
      if(fTipo && String(r.tipo || '') !== fTipo) return false;
      if(fConductor && !String(r.despacho_conductor || '').toLowerCase().includes(fConductor)) return false;

      if(fLlegadaDesde && (!r.dt || r.dt < fLlegadaDesde)) return false;
      if(fLlegadaHasta && (!r.dt || r.dt > fLlegadaHasta)) return false;

      const dtDesp = r.despacho_hora ? parseGpsGMT(r.despacho_hora) : null;
      if(fDespachoDesde && (!dtDesp || dtDesp < fDespachoDesde)) return false;
      if(fDespachoHasta && (!dtDesp || dtDesp > fDespachoHasta)) return false;
      return true;
    });
    cruceState.cruceRowsFiltradas = rowsFiltradas.slice();

    cfTb.innerHTML = '';
    rowsFiltradas.forEach(r => {
      const tr = document.createElement('tr');
      const tipoLabel = tipoLlegadaLabel(r.tipo);
      tr.innerHTML = `<td>${r.hora || ''}</td><td>${tipoLabel}</td><td>${r.base || '-'}</td><td>${r.interno || ''}</td><td>${r.mid || ''}</td><td>${r.drv_id || ''}</td><td>${r.itin || ''}</td><td>${r.despacho_hora || ''}</td><td>${r.despacho_itin || ''}</td><td>${r.despacho_conductor || ''}</td><td>${r.estado}</td><td>${r.espera}</td>`;
      cfTb.appendChild(tr);
    });
    if(cfTotal) cfTotal.textContent = `${resumen} | Mostrando filtrados: ${rowsFiltradas.length}`;
  } else if(cfTotal){
    cruceState.cruceRowsFiltradas = cruceRows.slice();
    cfTotal.textContent = resumen;
  }
  renderDespachoTab();
  maybeAutoSyncPlanilla2FromCruce();
}

function limpiarFiltrosCruceFull(){
  const ids = [
    'cf_filtro_interno', 'cf_filtro_tipo', 'cf_filtro_conductor',
    'cf_filtro_llegada_desde', 'cf_filtro_llegada_hasta',
    'cf_filtro_despacho_desde', 'cf_filtro_despacho_hasta'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  renderCruceOperativo();
}

function descargarCruceGrandeExcel(){
  const rows = (cruceState.cruceRowsFiltradas && cruceState.cruceRowsFiltradas.length)
    ? cruceState.cruceRowsFiltradas
    : (cruceState.cruceRows || []);
  if(!rows.length){
    stats('No hay datos de cruce para descargar.');
    return;
  }

  const headers = [
    'Hora llegada', 'Tipo', 'Base', 'Interno', 'mId', 'DriverId', 'Itinerario llegada',
    'Hora despacho', 'Itinerario despacho', 'Conductor', 'Estado', 'Espera'
  ];

  const esc = (v) => {
    const s = String(v == null ? '' : v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [];
  lines.push(headers.map(esc).join(';'));
  rows.forEach(r => {
    const tipoLabel = tipoLlegadaLabel(r.tipo);
    lines.push([
      r.hora || '',
      tipoLabel,
      r.base || '-',
      r.interno || '',
      r.mid || '',
      r.drv_id || '',
      r.itin || '',
      r.despacho_hora || '',
      r.despacho_itin || '',
      r.despacho_conductor || '',
      r.estado || '',
      r.espera || ''
    ].map(esc).join(';'));
  });

  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  a.href = url;
  a.download = `cruce_grande_${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function enviarCruceAPlanilla(silent=false){
  try{
    renderCruceOperativo();
    const rows = (cruceState.cruceRowsFiltradas && cruceState.cruceRowsFiltradas.length)
      ? cruceState.cruceRowsFiltradas
      : (cruceState.cruceRows || []);
    if(!rows.length){
      if(!silent) stats('No hay filas de cruce para enviar a Planilla Afiliados.');
      return;
    }
    const data = await post('/api/planilla_afiliados_sync', {rows});
    if(!silent) stats(`Planilla Afiliados actualizada. Filas enviadas: ${data && data.resumen ? data.resumen.insertados : rows.length}`);
    await cargarPlanillaAfiliados();
  }catch(e){
    stats('Error enviando a Planilla Afiliados: ' + e.message);
    try{ alert('Error enviando a Planilla Afiliados: ' + e.message); }catch(_e){}
  }
}

function renderPlanillaAfiliados(rows){
  const tb = document.getElementById('pl_tb');
  const total = document.getElementById('pl_total');
  if(!tb || !total) return;
  const raw = rows || [];
  const seen = new Set();
  const filas = [];
  raw.forEach(r => {
    const key = `${String(r.tipo_llegada||'').trim()}|${String(r.interno||'').trim()}|${String(r.mid||'-').trim() || '-'}|${String(r.hora_llegada||'').trim()}`;
    if(!key || seen.has(key)) return;
    seen.add(key);
    filas.push(r);
  });
  tb.innerHTML = '';
  filas.forEach(r => {
    const tr = document.createElement('tr');
    const tipo = tipoLlegadaLabel(r.tipo_llegada || r.tipo || '');
    tr.innerHTML = `<td>${r.hora_llegada||''}</td><td>${tipo}</td><td>${r.base||''}</td><td>${r.interno||''}</td><td>${r.mid||''}</td><td>${r.itinerario_llegada||''}</td><td>${r.hora_despacho||''}</td><td>${r.itinerario_despacho||''}</td><td>${r.conductor||''}</td><td>${r.estado||''}</td><td>${r.espera||''}</td><td>${r.generado_en||''}</td>`;
    tb.appendChild(tr);
  });
  total.textContent = `Total filas planilla afiliados: ${filas.length}`;
}

function renderPlanillaAfiliados2(rows){
  const tb = document.getElementById('pl2_tb');
  const total = document.getElementById('pl2_total');
  if(!tb || !total) return;
  const raw = rows || [];
  const seen = new Set();
  const filas = [];
  raw.forEach(r => {
    const key = `${String(r.tipo_llegada||'').trim()}|${String(r.interno||'').trim()}|${String(r.mid||'-').trim() || '-'}|${String(r.hora_llegada||'').trim()}`;
    if(!key || seen.has(key)) return;
    seen.add(key);
    filas.push(r);
  });
  tb.innerHTML = '';
  filas.forEach((r, idx) => {
    const tr = document.createElement('tr');
    const tipo = tipoLlegadaLabel(r.tipo_llegada || r.tipo || '');
    const idUsuario = `pl2_usuario_${idx}`;
    const idPasajeros = `pl2_pasajeros_${idx}`;
    const idObs = `pl2_obs_${idx}`;
    tr.innerHTML = `<td>${r.hora_llegada||''}</td><td>${tipo}</td><td>${r.base||''}</td><td>${r.interno||''}</td><td>${r.mid||''}</td><td>${r.driver_id||''}</td><td>${r.itinerario_llegada||''}</td><td>${r.hora_despacho||''}</td><td>${r.itinerario_despacho||''}</td><td>${r.conductor||''}</td><td><input id="${idUsuario}" class="form-control form-control-sm" value="${escapeHtml(r.usuario||'')}" placeholder="Usuario"></td><td><input id="${idPasajeros}" class="form-control form-control-sm" value="${escapeHtml(r.pasajeros||'')}" placeholder="Pasajeros" inputmode="numeric"></td><td><input id="${idObs}" class="form-control form-control-sm" value="${escapeHtml(r.observaciones||'')}" placeholder="Observaciones"></td><td>${r.estado||''}</td><td>${r.espera||''}</td><td>${r.generado_en||''}</td>`;
    tb.appendChild(tr);

    const usuarioEl = document.getElementById(idUsuario);
    const pasajerosEl = document.getElementById(idPasajeros);
    const obsEl = document.getElementById(idObs);
    const key = {
      tipo_llegada: String(r.tipo_llegada || r.tipo || '').trim(),
      interno: String(r.interno || '').trim(),
      mid: String(r.mid || '').trim(),
      hora_llegada: String(r.hora_llegada || '').trim()
    };
    const commit = async () => {
      await updatePlanilla2Campos(key, {
        usuario: usuarioEl ? usuarioEl.value : '',
        pasajeros: pasajerosEl ? pasajerosEl.value : '',
        observaciones: obsEl ? obsEl.value : ''
      });
    };
    if(usuarioEl){ usuarioEl.addEventListener('blur', commit); }
    if(pasajerosEl){ pasajerosEl.addEventListener('blur', commit); }
    if(obsEl){ obsEl.addEventListener('blur', commit); }
  });
  total.textContent = `Total filas planilla afiliados 2: ${filas.length}`;
}

async function updatePlanilla2Campos(key, fields){
  try{
    await post('/api/planilla_afiliados2_campos', {key, fields});
  }catch(e){
    stats('Error guardando campos en Planilla 2: ' + e.message);
  }
}

async function cargarPlanillaAfiliados(){
  try{
    const data = await getJSON('/api/planilla_afiliados?limit=1500');
    renderPlanillaAfiliados(data.rows || []);
  }catch(e){
    stats('Error cargando Planilla Afiliados: ' + e.message);
  }
}

async function enviarCruceAPlanilla2(silent=false, opts={}){
  const options = opts || {};
  const rowsFromOpts = Array.isArray(options.rowsOverride) ? options.rowsOverride : null;
  const trigger = String(options.trigger || 'manual');
  const force = !!options.force;
  try{
    const rows = rowsFromOpts || (cruceState.cruceRows || []);
    if(!rows.length){
      if(!silent) stats('No hay filas de cruce para generar Planilla Afiliados 2.');
      return {ok:false, reason:'no_rows'};
    }
    if(planilla2SyncState.inFlight && trigger !== 'manual'){
      return {ok:false, reason:'busy'};
    }
    const sig = buildCruceSignature(rows);
    if(!force && trigger !== 'manual' && sig && sig === planilla2SyncState.lastSyncedSignature){
      return {ok:true, skipped:true};
    }
    planilla2SyncState.inFlight = true;
    setPlanilla2SyncStatus(`Sincronizando (${trigger})... ${formatNowTime()}`);
    const data = await post('/api/planilla_afiliados2_sync', {rows});
    const resumen = (data && data.resumen) ? data.resumen : {};
    const source = String((resumen.modo || '')).toLowerCase().includes('local') ? 'local' : 'supabase';
    const filas = (resumen.total_procesados ?? resumen.filas ?? rows.length);
    planilla2SyncState.lastSyncedSignature = sig || planilla2SyncState.lastSyncedSignature;
    planilla2SyncState.lastSyncAt = Date.now();
    planilla2SyncState.lastSource = source;
    planilla2SyncState.lastRows = Number(filas || 0);
    planilla2SyncState.lastError = '';
    setPlanilla2SyncStatus(`Fuente: ${source} | Ultima sync: ${formatNowTime()} | Filas: ${filas}`);
    if(!silent){
      stats(`Planilla Afiliados 2 actualizada (${source}). Filas: ${filas}`);
    }
    if((document.getElementById('tab-planilla2') || {}).classList?.contains('active')){
      await cargarPlanillaAfiliados2(true);
    }
    return {ok:true, data};
  }catch(e){
    planilla2SyncState.lastError = String(e && e.message || e || '');
    setPlanilla2SyncStatus(`Error sync: ${planilla2SyncState.lastError}`);
    stats('Error generando Planilla Afiliados 2: ' + e.message);
    try{ alert('Error generando Planilla Afiliados 2: ' + e.message); }catch(_e){}
    return {ok:false, error:e};
  }finally{
    planilla2SyncState.inFlight = false;
  }
}

async function cargarPlanillaAfiliados2(silent=false){
  try{
    const data = await getJSON('/api/planilla_afiliados2?limit=1500');
    renderPlanillaAfiliados2(data.rows || []);
    const source = String(data.source || 'local');
    const filas = Array.isArray(data.rows) ? data.rows.length : 0;
    planilla2SyncState.lastSource = source;
    planilla2SyncState.lastRows = filas;
    setPlanilla2SyncStatus(`Fuente: ${source} | Ultima sync: ${formatNowTime()} | Filas: ${filas}`);
    if(!silent && data.warning){
      stats(`Planilla 2 cargada con fallback local: ${data.warning}`);
    }
  }catch(e){
    setPlanilla2SyncStatus(`Error carga: ${e.message}`);
    stats('Error cargando Planilla Afiliados 2: ' + e.message);
  }
}

async function refreshDashboard(){
  try{
    const res = await fetch('/api/dashboard_llegadas');
    if(!res.ok) return;
    const data = await res.json();
    renderDashboard(data);
  }catch(_e){}
}

async function post(url, body){
  const res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  if(!res.ok){ throw new Error(await res.text()); }
  return res.json();
}

async function getJSON(url){
  const res = await fetch(url);
  if(!res.ok){ throw new Error(await res.text()); }
  return res.json();
}

function commonBody(){
  return {
    event_id: document.getElementById('event_id').value,
    fecha_inicio: document.getElementById('fecha_inicio').value,
    fecha_fin: document.getElementById('fecha_fin').value,
    filtro: document.getElementById('filtro').value
  };
}

async function consultarEvento(){
  try{
    stats('Consultando...');
    const data = await post('/api/consultar_evento', commonBody());
    stats(data.resumen);
    renderVehiculos(data.vehiculos || []);
    renderLlegadasSubida(data.llegadas_acum || []);
    renderLlegadasBajada(data.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data.llegadas_nutibara_acum || []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

async function consultaCond104(silent=false, bodyOverride=null){
  try{
    if(!silent) stats('Consultando llegadas Aeropuerto (104)...');
    const body = bodyOverride || commonBody();
    const data = await post('/api/consulta_condicion_104', body);
    if(!silent) stats(data.resumen);
    showJSON(data.salida || {});
    renderLlegadasSubida(data.llegadas_acum || []);
    renderLlegadasBajada(data.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data.llegadas_nutibara_acum || []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

async function consultaCond101(silent=false, bodyOverride=null){
  try{
    if(!silent) stats('Consultando llegadas San Diego (101)...');
    const body = bodyOverride || commonBody();
    const data = await post('/api/consulta_condicion_101', body);
    if(!silent) stats(data.resumen);
    showJSON(data.salida || {});
    renderLlegadasSubida(data.llegadas_acum || []);
    renderLlegadasBajada(data.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data.llegadas_nutibara_acum || []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

async function consultaCond110(silent=false, bodyOverride=null){
  try{
    if(!silent) stats('Consultando llegadas Nutibara (110)...');
    const body = bodyOverride || commonBody();
    const data = await post('/api/consulta_condicion_110', body);
    if(!silent) stats(data.resumen);
    showJSON(data.salida || {});
    renderLlegadasSubida(data.llegadas_acum || []);
    renderLlegadasBajada(data.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data.llegadas_nutibara_acum || []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

async function consultaCond129(silent=false, bodyOverride=null){
  try{
    if(!silent) stats('Consultando Terminal Norte (129)...');
    const body = bodyOverride || commonBody();
    const data = await post('/api/consulta_condicion_129', body);
    if(!silent) stats(data.resumen);
    showJSON(data.salida || {});
    renderLlegadasTerminalNorte((data.salida && data.salida.resultados) ? data.salida.resultados : []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

async function autoActualizarDashboard(){
  try{
    const body = commonBody();
    const data104 = await post('/api/consulta_condicion_104', body);
    const data101 = await post('/api/consulta_condicion_101', body);
    const data110 = await post('/api/consulta_condicion_110', body);
    const data129 = await post('/api/consulta_condicion_129', body);
    renderLlegadasSubida(data110.llegadas_acum || data101.llegadas_acum || data104.llegadas_acum || []);
    renderLlegadasBajada(data110.llegadas_bajada_acum || data101.llegadas_bajada_acum || data104.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data110.llegadas_nutibara_acum || data101.llegadas_nutibara_acum || data104.llegadas_nutibara_acum || []);
    renderLlegadasTerminalNorte((data129.salida && data129.salida.resultados) ? data129.salida.resultados : []);
    await refreshDashboard();
    const c104 = (data104.salida && data104.salida.total_resultados) ? data104.salida.total_resultados : 0;
    const c101 = (data101.salida && data101.salida.total_resultados) ? data101.salida.total_resultados : 0;
    const c110 = (data110.salida && data110.salida.total_resultados) ? data110.salida.total_resultados : 0;
    const c129 = (data129.salida && data129.salida.total_resultados) ? data129.salida.total_resultados : 0;
    stats(`[Auto] Llegadas Aeropuerto (104): ${c104} | Llegadas San Diego (101): ${c101} | Llegadas Nutibara (110): ${c110} | Terminal Norte (129): ${c129}`);
  }catch(e){
    stats('Error auto dashboard: ' + e.message);
  }
}

async function consultaMasiva(){
  try{
    stats('Consultando masiva 1..500... puede tardar.');
    const data = await post('/api/consulta_masiva', commonBody());
    stats(data.resumen);
    showJSON(data.meta || {});
    renderLlegadasSubida(data.llegadas_acum || []);
    renderLlegadasBajada(data.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data.llegadas_nutibara_acum || []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

async function consultarDespachos(silent=false, bodyOverride=null){
  try{
    if(!silent) stats('Consultando despachos... puede tardar.');
    const body = bodyOverride || {
      fecha_inicio: document.getElementById('fecha_inicio').value,
      fecha_fin: document.getElementById('fecha_fin').value,
      fleetId: '3638',
      dynamic_pendientes: true
    };
    const data = await post('/api/consultar_despachos', body);
    if(!silent) stats(data.resumen || 'Consulta de despachos finalizada.');
    showJSON(data.salida || {});
    renderDespachos((data.salida && data.salida.resultados) ? data.salida.resultados : []);
  }catch(e){
    stats('Error: ' + e.message);
  }
}

async function verJsonCompleto(){
  try{
    const data = await getJSON('/api/ver_json_completo');
    showJSON(data);
    stats('JSON consolidado cargado.');
  }catch(e){ stats('Error: ' + e.message); }
}

async function buscarEnJson(){
  try{
    const termino = (document.getElementById('buscar_json').value || '').trim();
    if(!termino){
      stats('Escribe un texto para buscar.');
      return;
    }
    const data = await post('/api/buscar_en_json', {termino});
    showJSON(data);
    stats(`Busqueda finalizada. Coincidencias: ${data.meta_busqueda ? data.meta_busqueda.total_coincidencias : 0}`);
  }catch(e){ stats('Error: ' + e.message); }
}

async function verInfoEspecifica(){
  try{
    const termino = (document.getElementById('buscar_json').value || '').trim();
    const data = await post('/api/ver_info_especifica', {termino});
    showJSON(data);
    stats(`Info especifica lista. Filas: ${data.meta ? data.meta.total_filas : 0}`);
  }catch(e){ stats('Error: ' + e.message); }
}

async function limpiarLlegadas(){
  try{
    const data = await post('/api/limpiar_llegadas', {});
    stats(data.resumen || 'Llegadas limpiadas.');
    renderLlegadasSubida(data.llegadas_acum || []);
    renderLlegadasBajada(data.llegadas_bajada_acum || []);
    renderLlegadasNutibara(data.llegadas_nutibara_acum || []);
    refreshDashboard();
  }catch(e){ stats('Error: ' + e.message); }
}

let autoCicloEnEjecucion = false;
let autoCicloTimer = null;
let autoCicloEffectiveSec = null;  // null = usar el target. Sube si el ciclo se acerca al limite.
let autoCicloFastStreak = 0;       // ciclos rapidos consecutivos para recuperar hacia el target
const AUTO_CICLO_KEY = 'auto_ciclo_seg_v1';
const AUTO_CICLO_DEFAULT = 30;
const AUTO_CICLO_MIN = 5;
const AUTO_CICLO_MAX = 600;
const AUTO_CICLO_RECUPERACION = 3; // ciclos rapidos consecutivos para bajar el intervalo efectivo

function getAutoCicloSec(){
  try{
    const raw = localStorage.getItem(AUTO_CICLO_KEY);
    const n = Number(raw);
    if(Number.isFinite(n) && n >= AUTO_CICLO_MIN && n <= AUTO_CICLO_MAX) return n;
  }catch(_e){}
  return AUTO_CICLO_DEFAULT;
}

function setAutoCicloSec(n){
  try{ localStorage.setItem(AUTO_CICLO_KEY, String(n)); }catch(_e){}
}

function getEffectiveCicloSec(){
  const target = getAutoCicloSec();
  if(autoCicloEffectiveSec === null) return target;
  return Math.max(target, autoCicloEffectiveSec);
}

function scheduleNextAutoCiclo(){
  if(autoCicloTimer){ clearTimeout(autoCicloTimer); autoCicloTimer = null; }
  const sec = getEffectiveCicloSec();
  autoCicloTimer = setTimeout(ejecutarCicloOrdenadoSonar, sec * 1000);
}

function onChangeAutoCicloInput(){
  const inp = document.getElementById('auto_ciclo_input');
  if(!inp) return;
  const raw = Number(inp.value || AUTO_CICLO_DEFAULT);
  const n = Math.max(AUTO_CICLO_MIN, Math.min(AUTO_CICLO_MAX, Math.floor(raw)));
  setAutoCicloSec(n);
  inp.value = String(n);
  // Reset del efectivo: el usuario cambio el target, recalculamos.
  autoCicloEffectiveSec = null;
  autoCicloFastStreak = 0;
  scheduleNextAutoCiclo();
  stats(`[Auto] Intervalo objetivo actualizado a ${n} s. Proximo ciclo en ${n} s.`);
}

function initAutoCicloInput(){
  const inp = document.getElementById('auto_ciclo_input');
  if(inp) inp.value = String(getAutoCicloSec());
}

async function ejecutarCicloOrdenadoSonar(){
  if(autoCicloEnEjecucion){ scheduleNextAutoCiclo(); return; }
  autoCicloEnEjecucion = true;
  const cicloStart = Date.now();
  try{
    const today = localDateISO();
    const from = addDaysISO(today, -1);
    const target = getAutoCicloSec();
    const effective = getEffectiveCicloSec();
    const bodyAuto = {event_id: document.getElementById('event_id').value, fecha_inicio: from, fecha_fin: today, filtro: document.getElementById('filtro').value};
    const bodyDespAuto = {fecha_inicio: from, fecha_fin: today, fleetId: '3638'};
    const intervaloTxt = (effective === target) ? `${target}s` : `${effective}s (target ${target}s)`;
    stats(`[Auto] Iniciando ciclo paralelo (cada ${intervaloTxt}): 104 + 101 + 110 + 129, luego Despachos | rango ${from} a ${today}`);
    const [r104, r101, r110, r129] = await Promise.allSettled([
      consultaCond104(true, bodyAuto),
      consultaCond101(true, bodyAuto),
      consultaCond110(true, bodyAuto),
      consultaCond129(true, bodyAuto),
    ]);
    await consultarDespachos(true, bodyDespAuto);
    await refreshDashboard();

    const cicloSecRaw = (Date.now() - cicloStart) / 1000;
    const cicloSec = cicloSecRaw.toFixed(1);
    const failed = [r104, r101, r110, r129].filter(x => x.status !== 'fulfilled').length;

    // Auto-ajuste del intervalo efectivo:
    //  - Si el ciclo se acerca al 90% del efectivo, lo subimos para dar aire.
    //  - Si el ciclo dura menos del 50% del efectivo en N corridas seguidas, recuperamos hacia el target.
    let ajusteMsg = '';
    if(cicloSecRaw >= effective * 0.9){
      const nuevo = Math.min(AUTO_CICLO_MAX, Math.max(target, Math.ceil(cicloSecRaw * 1.3)));
      if(nuevo > effective){
        autoCicloEffectiveSec = nuevo;
        autoCicloFastStreak = 0;
        ajusteMsg = ` | Intervalo auto-subido a ${nuevo}s (ciclo cerca del limite)`;
      }
    }else if(autoCicloEffectiveSec !== null && cicloSecRaw < effective * 0.5){
      autoCicloFastStreak++;
      if(autoCicloFastStreak >= AUTO_CICLO_RECUPERACION){
        autoCicloEffectiveSec = null;
        autoCicloFastStreak = 0;
        ajusteMsg = ` | Intervalo recuperado a ${target}s (ciclos rapidos sostenidos)`;
      }
    }else{
      autoCicloFastStreak = 0;
    }

    const nextSec = getEffectiveCicloSec();
    if(failed > 0){
      stats(`[Auto] Ciclo completado en ${cicloSec}s con ${failed} consulta(s) fallida(s). Proximo en ${nextSec}s${ajusteMsg}.`);
    }else{
      stats(`[Auto] Ciclo completado en ${cicloSec}s. Proximo en ${nextSec}s${ajusteMsg}.`);
    }
  }catch(e){
    stats(`[Auto] Error en ciclo ordenado: ${e.message}`);
  }finally{
    autoCicloEnEjecucion = false;
    scheduleNextAutoCiclo();
  }
}

try{
  const savedFocus = localStorage.getItem(FOCUS_UI_KEY) === '1';
  applyFocusListsMode(savedFocus);
}catch(_e){
  applyFocusListsMode(false);
}

initAutoCicloInput();
refreshDashboard();
setTimeout(ejecutarCicloOrdenadoSonar, 3000);
setInterval(syncCalendarWithToday, 60000);
