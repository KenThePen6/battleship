/* Battleship — browser rebuild of the C# console game.
   Core rules mirror the original: 10x10 board, ship lengths
   Carrier 5 / Battleship 4 / Destroyer 3 / Submarine 3 / Patrol Boat 2,
   Horizontal => x+i, Vertical => y+i, hit / miss / sunk, win when all sunk. */

const SIZE = 10;
const SHIP_TYPES = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Destroyer", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Patrol Boat", length: 2 },
];

// ---- Ship (mirrors C# Ship: occupied points, damage, sunk) ----
class Ship {
  constructor(name, x, y, direction, length) {
    this.name = name;
    this.length = length;
    this.direction = direction; // "Horizontal" | "Vertical"
    this.occupied = pointsFor(x, y, direction, length);
    this.damaged = new Set(); // keys "x,y"
  }
  isHit(x, y) { return this.occupied.some(p => p.x === x && p.y === y); }
  applyDamage(x, y) { this.damaged.add(`${x},${y}`); }
  get isSunk() { return this.damaged.size >= this.length; }
}

function pointsFor(x, y, direction, length) {
  const pts = [];
  for (let i = 0; i < length; i++) {
    pts.push({ x: direction === "Horizontal" ? x + i : x,
               y: direction === "Vertical" ? y + i : y });
  }
  return pts;
}
function inBounds(x, y) { return x >= 0 && x < SIZE && y >= 0 && y < SIZE; }
function fits(x, y, dir, len) { return pointsFor(x, y, dir, len).every(p => inBounds(p.x, p.y)); }
function overlaps(pts, ships) {
  return pts.some(p => ships.some(s => s.occupied.some(o => o.x === p.x && o.y === p.y)));
}
function randomFleet() {
  const ships = [];
  for (const t of SHIP_TYPES) {
    let placed = false;
    while (!placed) {
      const dir = Math.random() < 0.5 ? "Horizontal" : "Vertical";
      const x = Math.floor(Math.random() * SIZE);
      const y = Math.floor(Math.random() * SIZE);
      if (!fits(x, y, dir, t.length)) continue;
      const pts = pointsFor(x, y, dir, t.length);
      if (overlaps(pts, ships)) continue;
      ships.push(new Ship(t.name, x, y, dir, t.length));
      placed = true;
    }
  }
  return ships;
}

// ---- Game state ----
const state = {
  phase: "setup",           // setup | battle | over
  orient: "Horizontal",
  selected: null,           // ship type index being placed
  playerShips: [],
  enemyShips: [],
  playerShots: new Set(),   // enemy fires here (keys "x,y")
  enemyShots: new Set(),    // player fires here
  aiQueue: [],              // hunt/target queue
};

// ---- DOM ----
const el = {
  playerBoard: document.getElementById("player-board"),
  enemyBoard: document.getElementById("enemy-board"),
  roster: document.getElementById("roster"),
  phase: document.getElementById("phase-label"),
  orient: document.getElementById("orient"),
  btnRotate: document.getElementById("btn-rotate"),
  btnRandom: document.getElementById("btn-random"),
  btnClear: document.getElementById("btn-clear"),
  btnStart: document.getElementById("btn-start"),
  btnNew: document.getElementById("btn-new"),
  log: document.getElementById("log"),
  playerLeft: document.getElementById("player-left"),
  enemyLeft: document.getElementById("enemy-left"),
};

function buildBoard(container) {
  container.innerHTML = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const c = document.createElement("div");
      c.className = "cell";
      c.dataset.x = x;
      c.dataset.y = y;
      container.appendChild(c);
    }
  }
}
function cellAt(container, x, y) {
  return container.children[y * SIZE + x];
}
function log(msg, cls) {
  const li = document.createElement("li");
  li.textContent = msg;
  if (cls) li.className = cls;
  el.log.prepend(li);
}
function shipsLeft(ships) { return ships.filter(s => !s.isSunk).length; }
function updateScore() {
  el.playerLeft.textContent = shipsLeft(state.playerShips);
  el.enemyLeft.textContent = shipsLeft(state.enemyShips);
}

// ---- Roster (setup) ----
function renderRoster() {
  el.roster.innerHTML = "";
  SHIP_TYPES.forEach((t, i) => {
    const placed = state.playerShips.some(s => s.name === t.name);
    const chip = document.createElement("div");
    chip.className = "ship-chip" + (placed ? " placed" : "") +
      (state.selected === i && !placed ? " selected" : "");
    const cells = Array.from({ length: t.length }, () => "<i></i>").join("");
    chip.innerHTML = `<span class="cells">${cells}</span><span>${t.name}</span>`;
    if (!placed) chip.addEventListener("click", () => { state.selected = i; renderRoster(); });
    el.roster.appendChild(chip);
  });
  el.btnStart.disabled = state.playerShips.length !== SHIP_TYPES.length;
}

function renderPlayerShips() {
  for (let i = 0; i < 100; i++) el.playerBoard.children[i].className = "cell";
  for (const s of state.playerShips) {
    for (const p of s.occupied) {
      const cell = cellAt(el.playerBoard, p.x, p.y);
      cell.classList.add("ship");
      if (s.damaged.has(`${p.x},${p.y}`)) cell.classList.add(s.isSunk ? "sunk" : "hit");
    }
  }
  // show misses from enemy on player board
  for (const key of state.playerShots) {
    const [x, y] = key.split(",").map(Number);
    const onShip = state.playerShips.some(s => s.isHit(x, y));
    if (!onShip) cellAt(el.playerBoard, x, y).classList.add("miss");
  }
}

// ---- Setup interactions ----
function setupHover() {
  el.playerBoard.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("mouseenter", () => {
      if (state.phase !== "setup" || state.selected === null) return;
      const t = SHIP_TYPES[state.selected];
      const x = +cell.dataset.x, y = +cell.dataset.y;
      const pts = pointsFor(x, y, state.orient, t.length);
      const ok = fits(x, y, state.orient, t.length) && !overlaps(pts, state.playerShips);
      pts.forEach(p => {
        if (inBounds(p.x, p.y)) cellAt(el.playerBoard, p.x, p.y)
          .classList.add(ok ? "preview" : "preview-bad");
      });
    });
    cell.addEventListener("mouseleave", () => {
      el.playerBoard.querySelectorAll(".preview,.preview-bad")
        .forEach(c => c.classList.remove("preview", "preview-bad"));
    });
    cell.addEventListener("click", () => {
      if (state.phase !== "setup" || state.selected === null) return;
      const t = SHIP_TYPES[state.selected];
      const x = +cell.dataset.x, y = +cell.dataset.y;
      const pts = pointsFor(x, y, state.orient, t.length);
      if (!fits(x, y, state.orient, t.length) || overlaps(pts, state.playerShips)) {
        log(`Can't place ${t.name} there.`);
        return;
      }
      state.playerShips.push(new Ship(t.name, x, y, state.orient, t.length));
      state.selected = null;
      renderRoster();
      renderPlayerShips();
    });
  });
}

// ---- Battle interactions ----
function enableEnemyBoard(on) {
  el.enemyBoard.querySelectorAll(".cell").forEach(cell => {
    cell.classList.toggle("clickable", on);
  });
}
function onEnemyClick(cell) {
  if (state.phase !== "battle") return;
  const x = +cell.dataset.x, y = +cell.dataset.y;
  const key = `${x},${y}`;
  if (state.enemyShots.has(key)) return; // already fired
  state.enemyShots.add(key);

  const ship = state.enemyShips.find(s => s.isHit(x, y));
  if (ship) {
    ship.applyDamage(x, y);
    if (ship.isSunk) {
      ship.occupied.forEach(p => cellAt(el.enemyBoard, p.x, p.y)
        .classList.remove("hit"));
      ship.occupied.forEach(p => cellAt(el.enemyBoard, p.x, p.y)
        .classList.add("sunk"));
      log(`You sank the enemy ${ship.name}!`, "you");
    } else {
      cell.classList.add("hit");
      log(`Hit at (${x},${y})!`, "you");
    }
  } else {
    cell.classList.add("miss");
    log(`You fired at (${x},${y}) — miss.`, "you");
  }
  updateScore();

  if (state.enemyShips.every(s => s.isSunk)) { endGame(true); return; }

  // Enemy takes a turn
  enemyTurn();
}

function enemyTurn() {
  let x, y;
  // target mode
  while (state.aiQueue.length) {
    const t = state.aiQueue.shift();
    if (!state.playerShots.has(`${t.x},${t.y}`) && inBounds(t.x, t.y)) { x = t.x; y = t.y; break; }
  }
  // hunt mode (checkerboard-biased random)
  if (x === undefined) {
    const open = [];
    for (let yy = 0; yy < SIZE; yy++)
      for (let xx = 0; xx < SIZE; xx++)
        if (!state.playerShots.has(`${xx},${yy}`)) open.push({ x: xx, y: yy });
    const parity = open.filter(p => (p.x + p.y) % 2 === 0);
    const pool = parity.length ? parity : open;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    x = pick.x; y = pick.y;
  }

  state.playerShots.add(`${x},${y}`);
  const ship = state.playerShips.find(s => s.isHit(x, y));
  if (ship) {
    ship.applyDamage(x, y);
    // queue orthogonal neighbors
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
      const nx = x+dx, ny = y+dy;
      if (inBounds(nx,ny) && !state.playerShots.has(`${nx},${ny}`)) state.aiQueue.push({x:nx,y:ny});
    });
    if (ship.isSunk) { state.aiQueue = []; log(`Enemy sank your ${ship.name}!`, "enemy"); }
    else log(`Enemy hit your ship at (${x},${y}).`, "enemy");
  } else {
    log(`Enemy fired at (${x},${y}) — miss.`, "enemy");
  }
  renderPlayerShips();
  updateScore();

  if (state.playerShips.every(s => s.isSunk)) endGame(false);
}

function endGame(playerWon) {
  state.phase = "over";
  enableEnemyBoard(false);
  // reveal remaining enemy ships
  for (const s of state.enemyShips) {
    for (const p of s.occupied) {
      const cell = cellAt(el.enemyBoard, p.x, p.y);
      if (!cell.classList.contains("hit") && !cell.classList.contains("sunk"))
        cell.classList.add("ship");
    }
  }
  log(playerWon ? "🎉 Victory! You sank the entire enemy fleet."
                : "💥 Defeat — your fleet was destroyed.",
      playerWon ? "win" : "lose");
  el.btnNew.classList.remove("hidden");
}

// ---- Phase control ----
function startBattle() {
  if (state.playerShips.length !== SHIP_TYPES.length) return;
  state.phase = "battle";
  state.enemyShips = randomFleet();
  el.phase.textContent = "Phase: Battle — fire at Enemy Waters";
  el.btnRotate.disabled = el.btnRandom.disabled = el.btnClear.disabled = true;
  el.btnStart.classList.add("hidden");
  state.selected = null;
  renderRoster();
  el.roster.querySelectorAll(".ship-chip").forEach(c => c.style.pointerEvents = "none");
  enableEnemyBoard(true);
  log("Battle started! Click Enemy Waters to fire.");
}

function newGame() {
  state.phase = "setup";
  state.orient = "Horizontal";
  state.selected = null;
  state.playerShips = [];
  state.enemyShips = [];
  state.playerShots = new Set();
  state.enemyShots = new Set();
  state.aiQueue = [];
  el.orient.textContent = "Horizontal";
  el.phase.textContent = "Phase: Place your fleet";
  el.btnRotate.disabled = el.btnRandom.disabled = el.btnClear.disabled = false;
  el.btnStart.classList.remove("hidden");
  el.btnStart.disabled = true;
  el.btnNew.classList.add("hidden");
  el.log.innerHTML = "";
  buildBoard(el.playerBoard);
  buildBoard(el.enemyBoard);
  setupHover();
  el.enemyBoard.querySelectorAll(".cell").forEach(c =>
    c.addEventListener("click", () => onEnemyClick(c)));
  renderRoster();
  renderPlayerShips();
  updateScore();
}

// ---- Wire up controls ----
el.btnRotate.addEventListener("click", () => {
  state.orient = state.orient === "Horizontal" ? "Vertical" : "Horizontal";
  el.orient.textContent = state.orient;
});
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "r" && state.phase === "setup") el.btnRotate.click();
});
el.btnRandom.addEventListener("click", () => {
  if (state.phase !== "setup") return;
  state.playerShips = randomFleet();
  state.selected = null;
  renderRoster();
  renderPlayerShips();
});
el.btnClear.addEventListener("click", () => {
  if (state.phase !== "setup") return;
  state.playerShips = [];
  renderRoster();
  renderPlayerShips();
});
el.btnStart.addEventListener("click", startBattle);
el.btnNew.addEventListener("click", newGame);

// ---- Boot ----
newGame();
