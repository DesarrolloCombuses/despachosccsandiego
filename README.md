# Despachos CC San Diego

Panel movil PWA enfocado exclusivamente en la operacion de despachos del punto CC San Diego (Almacentro).

## Funcionalidades incluidas

- **Realizar despacho** (pestana activa por defecto): formulario guiado de despacho manual
- **Historial despachos** (con cancelacion y edicion de pasajeros/observaciones)
- **Boton Despacho manual** (modal global, accesible desde cualquier pestana)

Las demas pestanas del panel completo (Llegadas Almacentro, Despachos Sonar, Mapa vehiculos, Tabla llegadas, Asistencia biometrica, Preoperacionales SICOV, etc.) estan ocultas en esta version recortada.

## PWA optimizada para movil

- `manifest.webmanifest` configurado para instalarse en celular con orientacion portrait.
- Nombre de la app: **Despachos CC San Diego** (short_name: `Despachos CCSD`).
- Service Worker con auto-actualizacion: cuando se publica una nueva version, la app se refresca sola sin pedir Ctrl+F5.
- Liviana: la unica libreria externa es `supabase-js`, con version fija (2.117.3), verificada con SRI y guardada en cache por el Service Worker. Usa la fuente del sistema (no descarga fuentes).
- La version actual se ve en la pantalla de acceso y en la barra superior (ej. `v1.1.0`).
- Tablas en modo card en pantallas <= 860px, inputs con altura comoda al tap.

## Como abrir localmente

Como la app usa Service Worker, conviene servirla con un servidor estatico:

```powershell
cd "C:\Users\coordesarrollo\Documents\centrocomercial\despachosccsandiego"
python -m http.server 8001
```

Abrir luego `http://127.0.0.1:8001/`.

> Doble click en `index.html` (file://) tambien funciona, pero el Service Worker queda deshabilitado.

## Origen

Esta version es una copia recortada del panel completo `enturnamientosa`. Comparte el mismo backend (Supabase Edge Functions: sonar-dispatch, sonar-cancel, sonar-despachos) y la misma tabla `llegadas_104` con Realtime. La unica diferencia es la interfaz: aqui solo se exponen las pestanas necesarias para el operativo de CC San Diego.

## Versiones y publicacion

La version aparece en `index.html` y en `sw.js`, y debe ir igual en todos lados. **No se cambia a mano**: se usa `tools/version.py`, que la cambia en todos los lugares y anota el cambio en [CHANGELOG.md](CHANGELOG.md).

1. Editar los archivos del frontend.
2. Subir la version:
   ```powershell
   python tools/version.py patch "Que cambio"   # 1.1.0 -> 1.1.1 (arreglos y cambios chicos)
   python tools/version.py minor "Que cambio"   # 1.1.0 -> 1.2.0 (funcionalidad nueva)
   python tools/version.py                      # solo revisa la version actual
   ```
3. `git add -A && git commit -m "..." && git push` &mdash; GitHub Pages publica en ~1 minuto y la app instalada en los celulares se actualiza sola (al abrirla, al volver a ella o como maximo a los 5 minutos).

Para cambiar la version de `supabase-js`, actualizar la URL y el `integrity` en `index.html` y la misma URL en `CDN_ASSETS` de `sw.js`.
