// ==========================================================
// Snake — built with vanilla JavaScript and the Canvas API
// ==========================================================

// ---------- Setup ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID = 20;                       // the board is 20 x 20 squares
const CELL = canvas.width / GRID;      // size of one square in pixels
const START_SPEED = 130;               // milliseconds between moves (lower = faster)
const MIN_SPEED = 60;                  // the fastest the game can get

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');

// Direction vectors: how x and y change for each direction
const DIRECTIONS = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1 },
  left:  { x: -1, y: 0 },
  right: { x: 1,  y: 0 },
};

// ---------- Game state ----------
let snake, direction, nextDirection, food, score, speed, timer;
let running = false;
let paused = false;
let best = loadBest();
bestEl.textContent = best;

// ---------- Best score (saved in the browser) ----------
function loadBest() {
  try { return Number(localStorage.getItem('snake-best')) || 0; }
  catch (e) { return 0; }   // storage can be blocked in private windows
}

function saveBest(value) {
  try { localStorage.setItem('snake-best', value); } catch (e) { /* ignore */ }
}

// ---------- Start a new game ----------
function startGame() {
  snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }]; // head first
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  speed = START_SPEED;
  scoreEl.textContent = 0;
  food = randomFood();

  running = true;
  paused = false;
  overlay.classList.add('hidden');

  clearInterval(timer);
  timer = setInterval(tick, speed);
  draw();
}

// ---------- Place food on a random empty square ----------
function randomFood() {
  let spot;
  do {
    spot = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(part => part.x === spot.x && part.y === spot.y));
  return spot;
}

// ---------- One step of the game ----------
function tick() {
  direction = nextDirection;
  const move = DIRECTIONS[direction];
  const head = { x: snake[0].x + move.x, y: snake[0].y + move.y };

  // Hit a wall?
  const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
  // Hit itself? (ignore the tail, because it moves out of the way this turn)
  const hitSelf = snake.slice(0, -1).some(part => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head); // add the new head

  if (head.x === food.x && head.y === food.y) {
    // Ate the food: score goes up, snake keeps its tail (so it grows)
    score++;
    scoreEl.textContent = score;
    food = randomFood();
    speedUp();
  } else {
    snake.pop(); // didn't eat: remove the tail so the length stays the same
  }

  draw();
}

// ---------- Get a little faster every 5 points ----------
function speedUp() {
  if (score % 5 === 0 && speed > MIN_SPEED) {
    speed -= 10;
    clearInterval(timer);
    timer = setInterval(tick, speed);
  }
}

// ---------- End of game ----------
function gameOver() {
  clearInterval(timer);
  running = false;

  const newBest = score > best;
  if (newBest) {
    best = score;
    bestEl.textContent = best;
    saveBest(best);
  }

  overlayTitle.textContent = newBest ? 'New best! 🎉' : 'Game over';
  overlayText.textContent = `You scored ${score}. ${newBest ? 'That\'s your highest yet.' : `Your best is ${best}.`}`;
  startBtn.textContent = 'Play again';
  overlay.classList.remove('hidden');
}

// ---------- Pause / resume ----------
function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(timer);
    overlayTitle.textContent = 'Paused';
    overlayText.textContent = 'Press Space or the button to carry on.';
    startBtn.textContent = 'Resume';
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    timer = setInterval(tick, speed);
  }
}

// ---------- Drawing ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // faint grid dots
  ctx.fillStyle = '#262626';
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);
    }
  }

  // food
  ctx.fillStyle = '#f2f2f2';
  roundRect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8, 5);

  // snake: head is brightest, body fades towards the tail
  snake.forEach((part, i) => {
    const fade = 1 - (i / snake.length) * 0.6;
    ctx.fillStyle = `rgba(74, 222, 128, ${fade})`;
    roundRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2, 5);
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// ---------- Changing direction ----------
function setDirection(newDir) {
  const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
  // you can't turn straight back into yourself
  if (newDir !== opposite[direction]) nextDirection = newDir;
}

// Keyboard: arrow keys, WASD and Space
const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
};

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    running ? togglePause() : startGame();
    return;
  }
  const dir = KEYS[e.key] || KEYS[e.key.toLowerCase()];
  if (dir) {
    e.preventDefault(); // stop the page scrolling
    setDirection(dir);
  }
});

// On-screen buttons (phones)
document.querySelectorAll('.pad button').forEach(btn => {
  btn.addEventListener('click', () => setDirection(btn.dataset.dir));
});

// Swipe on the board (phones)
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 'right' : 'left');
    else setDirection(dy > 0 ? 'down' : 'up');
  }
  touchStart = null;
});

// Start / resume button
startBtn.addEventListener('click', () => {
  if (running && paused) togglePause();
  else startGame();
});

// Draw an empty board when the page first loads
snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
food = { x: 14, y: 10 };
draw();
