#!/bin/sh
# Сборка ЛЕНТА.EXE v10 → game/index.html. Старая версия (регионы, политика) — ./build_legacy.sh → game/legacy.html
cd "$(dirname "$0")/game"
cat src/shell.html src/art.js src/imgs.js src8/data8.js src10/core10.js src10/df10.js src10/sys10.js src10/ui10.js > index.html
echo '</script></body></html>' >> index.html
