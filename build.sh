#!/bin/sh
# Сборка ЛЕНТА.EXE v8 → game/index.html. Старая версия (регионы, политика) — ./build_legacy.sh → game/legacy.html
cd "$(dirname "$0")/game"
cat src/shell.html src/art.js src/imgs.js src8/data8.js src8/sim8.js src8/sys8.js src8/ui8.js > index.html
echo '</script></body></html>' >> index.html
