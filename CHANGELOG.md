# Cambios

Historial de versiones de la PWA. Las entradas nuevas las agrega `python tools/version.py`.

## 1.1.0 - 2026-10-13

- App mas liviana: sin ExcelJS, XLSX, Leaflet ni fuente Inter (~82% menos descarga); supabase-js fijado en 2.117.3 con SRI y cache; version visible en la app y manejo de versiones con tools/version.py.

## 1.0.11 - 2026-10-13

- Se quita la pestaña Despachos Sonar (despachos en curso); la app abre en Realizar despacho.

## 1.0.10 - 2026-10-13

- Campo Conductor con desplegable propio: busca sin tildes y en cualquier orden por nombre, cédula o dr_id, y muestra los inhabilitados como no seleccionables.
- La lista de conductores se recarga al abrir el formulario si tiene más de 5 minutos, reintenta si falla la red y conserva la última lista buena.
- Enter/Escape con el desplegable abierto eligen/cierran la opción en vez de enviar o cerrar el formulario.

## 1.0.9 - 2026-06-05

- Pestaña Realizar despacho con formulario guiado y desplegable de internos.

## 1.0.1 - 2026-06-01

- Solo queda el itinerario 4504 (ccsandiego-tunel-aeropuerto).

## 1.0.0 - 2026-06-01

- Versión inicial: copia recortada del panel completo `enturnamientosa` para el punto CC San Diego.
