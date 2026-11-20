#!/bin/sh
# Сборка: game/index.html из исходников (imgs.js — встроенные аватарки и фото)
cd "$(dirname "$0")/game/src"
cat shell.html base.js world.js art.js imgs.js stories.js chains.js sim.js tech.js scale.js explain.js ui.js ui2.js > ../index.html
echo '</script></body></html>' >> ../index.html
