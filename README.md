# Despachos CC San Diego

Panel movil PWA enfocado exclusivamente en la operacion de despachos del punto CC San Diego (Almacentro).

## Funcionalidades incluidas

- **Llegadas Almacentro** (pestana activa por defecto)
- **Despachos Sonar** (despachos en curso)
- **Historial despachos** (con cancelacion y edicion de pasajeros/observaciones)
- **Boton Despacho manual** (modal global, accesible desde cualquier pestana)

Las demas pestanas del panel completo (Mapa vehiculos, Tabla llegadas, Asistencia biometrica, Preoperacionales SICOV, etc.) no estan disponibles en esta version recortada.

## PWA optimizada para movil

- `manifest.webmanifest` configurado para instalarse en celular con orientacion portrait.
- Nombre de la app: **Despachos CC San Diego** (short_name: `Despachos CCSD`).
- Service Worker con auto-actualizacion: cuando se publica una nueva version, la app se refresca sola sin pedir Ctrl+F5.
- Tablas en modo card en pantallas <= 860px, inputs con altura comoda al tap.

## Como abrir localmente

Como la app usa Service Worker, conviene servirla con un servidor estatico:

```powershell
cd "C:\Users\coordesarrollo\Documents\despachosccsandiego"
python -m http.server 8001
```

Abrir luego `http://127.0.0.1:8001/`.

> Doble click en `index.html` (file://) tambien funciona, pero el Service Worker queda deshabilitado.

## Origen

Esta version es una copia recortada del panel completo `enturnamientosa`. Comparte el mismo backend (Supabase Edge Functions: sonar-dispatch, sonar-cancel, sonar-despachos) y la misma tabla `llegadas_104` con Realtime. La unica diferencia es la interfaz: aqui solo se exponen las pestanas necesarias para el operativo de CC San Diego.

## Para actualizar tras cambios

1. Editar los archivos del frontend.
2. Subir `VERSION` en `sw.js` (ej. `ccsd-mobile-v1.0.1`) para que la PWA actualice sola.
3. `git add . && git commit -m "..." && git push` &mdash; GitHub Pages reconstruye en ~1 minuto.
