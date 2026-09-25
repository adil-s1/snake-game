# 🐍 Snake

A classic Snake game built from scratch with **HTML, CSS and vanilla JavaScript**, using no libraries or game engines.

**▶ Play it here:** https://adil-s1.github.io/snake-game

## Features
- Smooth grid movement drawn with the **Canvas API**
- Score counter, plus a **best score** saved in the browser (`localStorage`)
- The game **speeds up** every 5 points
- **Pause** with the Space bar
- Works on **phones**: swipe on the board or use the on-screen arrows
- Keyboard controls: arrow keys or WASD

## How it works
- The snake is an array of `{x, y}` squares, with the head first.
- Every tick, a new head is added in the current direction.
- If the snake eats the food it keeps its tail (so it grows); otherwise the tail is removed.
- The game ends if the head goes off the board or hits the snake's own body.
- The snake can't turn straight back on itself (for example, from left to right).

## Files
| File | What it does |
|---|---|
| `index.html` | Page layout, scoreboard, overlay and touch controls |
| `style.css` | Dark theme, responsive layout and d-pad |
| `game.js` | Game loop, movement, collisions, scoring and controls |

## Run it locally
Download the files and open `index.html` in any browser.

---
Part of my [portfolio](https://adil-s1.github.io).
