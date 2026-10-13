"""Manejo de versiones de la PWA (un solo comando).

La version aparece en varios lugares que deben ir siempre iguales:
  - index.html : <meta name="app-version">  y  ?v=X.Y.Z  de css/js
  - sw.js      : const VERSION = "ccsd-mobile-vX.Y.Z"  y  ?v=X.Y.Z  del precache
Este script los cambia todos juntos y anota el cambio en CHANGELOG.md.

Uso (desde la carpeta del proyecto):
  python tools/version.py                          -> muestra la version actual y revisa que todo coincida
  python tools/version.py patch "Que cambio"       -> 1.0.11 -> 1.0.12  (arreglos y cambios chicos)
  python tools/version.py minor "Que cambio"       -> 1.0.11 -> 1.1.0   (funcionalidad nueva)
  python tools/version.py major "Que cambio"       -> 1.0.11 -> 2.0.0
  python tools/version.py 1.2.3 "Que cambio"       -> version exacta

Despues: git add -A && git commit -m "..." && git push
Al publicarse en GitHub Pages, la app instalada en los celulares se actualiza sola.
"""
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
SW = ROOT / "sw.js"
CHANGELOG = ROOT / "CHANGELOG.md"

SEMVER = r"\d+\.\d+\.\d+"
RE_SW_VERSION = re.compile(r'(const VERSION = "ccsd-mobile-v)(' + SEMVER + r')(";)')
RE_META = re.compile(r'(<meta name="app-version" content=")(' + SEMVER + r')(")')
RE_QUERY = re.compile(r"(\?v=)(" + SEMVER + r")")


def read(path):
    # newline="" conserva los finales de linea originales (CRLF o LF).
    with open(path, encoding="utf-8", newline="") as f:
        return f.read()


def write(path, text):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)


def found_versions():
    index, sw = read(INDEX), read(SW)
    return {
        "sw.js VERSION": [m.group(2) for m in RE_SW_VERSION.finditer(sw)],
        "sw.js ?v=": [m.group(2) for m in RE_QUERY.finditer(sw)],
        "index.html app-version": [m.group(2) for m in RE_META.finditer(index)],
        "index.html ?v=": [m.group(2) for m in RE_QUERY.finditer(index)],
    }


def current_version():
    found = found_versions()
    sw_version = found["sw.js VERSION"]
    if len(sw_version) != 1:
        sys.exit('ERROR: no se encontro (o hay mas de uno) const VERSION = "ccsd-mobile-vX.Y.Z" en sw.js')
    return sw_version[0], found


def bump(version, kind):
    major, minor, patch = map(int, version.split("."))
    if kind == "patch":
        return f"{major}.{minor}.{patch + 1}"
    if kind == "minor":
        return f"{major}.{minor + 1}.0"
    if kind == "major":
        return f"{major + 1}.0.0"
    if re.fullmatch(SEMVER, kind):
        return kind
    sys.exit(f'ERROR: "{kind}" no es patch, minor, major ni una version X.Y.Z')


def as_tuple(version):
    return tuple(map(int, version.split(".")))


def report(version, found):
    print(f"Version actual: {version}")
    ok = True
    for where, values in found.items():
        distinct = sorted(set(values))
        state = "ok" if distinct == [version] else "NO COINCIDE"
        ok = ok and state == "ok"
        print(f"  {where:<24} {len(values)} lugar(es): {', '.join(distinct) or '(ninguno)'}  [{state}]")
    return ok


def add_changelog_entry(version, message):
    today = datetime.date.today().isoformat()
    entry = f"## {version} - {today}\n\n- {message}\n\n"
    text = read(CHANGELOG) if CHANGELOG.exists() else "# Cambios\n\n"
    marker = text.find("\n## ")
    if marker == -1:
        text = text.rstrip("\n") + "\n\n" + entry
    else:
        text = text[:marker + 1] + entry + text[marker + 1:]
    write(CHANGELOG, text)


def main(argv):
    version, found = current_version()
    if len(argv) == 0:
        sys.exit(0 if report(version, found) else 1)
    if len(argv) != 2 or not argv[1].strip():
        sys.exit('Uso: python tools/version.py patch|minor|major|X.Y.Z "Que cambio"')

    new_version = bump(version, argv[0])
    if as_tuple(new_version) <= as_tuple(version):
        sys.exit(f"ERROR: la nueva version ({new_version}) debe ser mayor que la actual ({version})")

    index, sw = read(INDEX), read(SW)
    index = RE_META.sub(lambda m: m.group(1) + new_version + m.group(3), index)
    index = RE_QUERY.sub(lambda m: m.group(1) + new_version, index)
    sw = RE_SW_VERSION.sub(lambda m: m.group(1) + new_version + m.group(3), sw)
    sw = RE_QUERY.sub(lambda m: m.group(1) + new_version, sw)
    write(INDEX, index)
    write(SW, sw)
    add_changelog_entry(new_version, argv[1].strip())

    print(f"{version} -> {new_version}")
    if not report(new_version, found_versions()):
        sys.exit("ERROR: quedaron versiones distintas; revisa index.html y sw.js")
    print("CHANGELOG.md actualizado.")
    print('Siguiente paso: git add -A && git commit -m "..." && git push')


if __name__ == "__main__":
    main(sys.argv[1:])
