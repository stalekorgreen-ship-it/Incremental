# ЛЕНТА.EXE

Инкрементальная игра-сатира: ты — алгоритм ленты соцсети в вымышленном городе Вальдия.

- `game/index.html` — собранная игра, открывается в браузере.
- `game/src/` — исходники: `sim.js` (симуляция людей и экономика), `stories.js` (ветвящиеся истории), `ui.js` (интерфейс ЛентаОС), `world.js`, `base.js`, `art.js`, `shell.html`.
- `avatars/` — аватарки персонажей.
- `photos/` — фотографии персонажей.

Сборка: `cat game/src/shell.html game/src/{base,world,art,stories,sim,ui}.js > game/index.html && echo '</script></body></html>' >> game/index.html`
