#!/usr/bin/env bash
# Copia las fotos de Free Exercise DB (dominio público) para los ejercicios del catálogo.
# Uso: scripts/fotos.sh /ruta/a/free-exercise-db   (requiere ImageMagick)
set -euo pipefail
DB="$1"; OUT="$(dirname "$0")/../public/ex"; mkdir -p "$OUT"
node -e '
const src=require("fs").readFileSync(process.argv[1],"utf8");
for (const m of src.matchAll(/id: \x27([^\x27]+)\x27[^\n]*photo: \x27([^\x27]+)\x27/g)) console.log(m[1]+" "+m[2]);
' "$(dirname "$0")/../src/db/catalog.ts" | while read -r id folder; do
  for n in 0 1; do
    f="$DB/exercises/$folder/$n.jpg"
    if [ -f "$f" ]; then convert "$f" -resize 360x -strip -quality 68 "$OUT/$id-$n.webp"; else echo "falta: $folder/$n.jpg"; fi
  done
done
