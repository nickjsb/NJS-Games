const GRID_SPACING = 30;
const INVISIBLE_Y = 2;
const GAME_OVER_Y = 4;
const GRID_COLOR = 40;
const X = 12;
const Y = 22;
const RATE = 30;
const RATE_SPEEDUP_INTERVAL = 600;
const CONTROL_RATE = 3;
const DIR_KEY_DELAY = 5;
const PLAY_STATE = 0;
const GAME_OVER_STATE = 1;

const TETRONIMOS = {
  L: {
    color: { r: 0, g: 255, b: 255 },
    coords: [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  J: {
    color: { r: 255, g: 0, b: 255 },
    coords: [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  },
  S: {
    color: { r: 255, g: 255, b: 0 },
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ],
  },
  Z: {
    color: { r: 0, g: 255, b: 0 },
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  O: {
    color: { r: 255, g: 0, b: 0 },
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  T: {
    color: { r: 255, g: 255, b: 255 },
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ],
  },
  I: {
    color: { r: 0, g: 0, b: 255 },
    coords: [
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
  },
};

BLACK = { r: 0, g: 0, b: 0 };

function setup() {
  createCanvas(X * GRID_SPACING, (Y - INVISIBLE_Y) * GRID_SPACING);
  new_tetronimo();
}

function draw_square_at_coords(x, y, col) {
  push();
  fill(col.r, col.g, col.b);
  rect(x * GRID_SPACING, y * GRID_SPACING, GRID_SPACING, GRID_SPACING);
  pop();
}

function new_tetronimo() {
  let keys = Object.keys(TETRONIMOS);
  let random_tetronimo = TETRONIMOS[keys[(keys.length * Math.random()) << 0]];
  current_tetronimo.piece = random_tetronimo;
  current_tetronimo.piece = random_tetronimo;
  current_tetronimo.trans = { x: X / 2, y: 2 };
  current_tetronimo.orient = 0;
}

var current_tetronimo = {
  piece: null,
  orient: 0,
  trans: { x: X / 2, y: 2 },
};

var i = 0;
var rot = 0;
var dir = 0;
var tick = 0;
var state = PLAY_STATE;
var score = 0;
var high_score = 0;
var dirKeyLastPressed = 0;
var grid = Array(X * Y).fill(BLACK);

function get_grid(x, y) {
  return grid[y * X + x];
}
function set_grid(x, y, val) {
  grid[y * X + x] = val;
}

function rotate_point(point, rot) {
  if (rot == 0) {
    return { x: point.x, y: point.y };
  } else if (rot == 1) {
    return { x: -point.y, y: point.x };
  } else if (rot == 2) {
    return { x: -point.x, y: -point.y };
  } else if (rot == 3) {
    return { x: point.y, y: -point.x };
  }
}

function get_tetronimo_grid_points(x, y, rot) {
  let new_coords = [];

  for (coord of current_tetronimo.piece.coords) {
    let rot_coord = rotate_point(coord, (current_tetronimo.orient + rot) % 4);
    let trans_coord = {
      x: rot_coord.x + current_tetronimo.trans.x + x,
      y: rot_coord.y + current_tetronimo.trans.y + y,
    };
    new_coords.push(trans_coord);
  }
  return new_coords;
}

function move_tetronimo(x, y, rot) {
  let new_coords = get_tetronimo_grid_points(x, y, rot);
  let old_coords = get_tetronimo_grid_points(0, 0, 0);

  for (coord of new_coords) {
    if (coord.x >= X || coord.x < 0) {
      return;
    }
  }

  let collided = tetronimo_would_collide(old_coords, new_coords)
  if (collided && (y == 1)) {
    let color = current_tetronimo.piece.color;
    for (coord of old_coords) {
      set_grid(coord.x, coord.y, color);
    }

    let highest_square = Math.floor(grid.findIndex((x) => !is_black(x)) / X);
    if (highest_square <= GAME_OVER_Y) {
      state = GAME_OVER_STATE;
      if (score > high_score) {
        high_score = score;
      }
      return;
    }
    clearGrid();
    new_tetronimo();
    return;
  }
  else if (collided) {
      return
  }

  current_tetronimo.orient = (current_tetronimo.orient + rot) % 4;
  current_tetronimo.trans = {
    x: current_tetronimo.trans.x + x,
    y: current_tetronimo.trans.y + y,
  };

  for (old_coord of old_coords) {
    set_grid(old_coord.x, old_coord.y, BLACK);
  }

  for (new_coord of new_coords) {
    set_grid(new_coord.x, new_coord.y, current_tetronimo.piece.color);
  }
}

function point_eq(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function is_black(col) {
  return col.r == 0 && col.g == 0 && col.b == 0;
}

function tetronimo_would_collide(old_coords, new_coords) {
  for (coord of new_coords) {
    if (coord.y == Y) {
      return true;
    }
    let in_tetronimo = old_coords.some((old_coord) =>
      point_eq(old_coord, coord)
    );

    if (!in_tetronimo) {
      let col = get_grid(coord.x, coord.y);
      if (!is_black(col)) {
        return true;
      }
    }
  }
  return false;
}

function keyPressed() {
  if (keyCode == UP_ARROW) {
    rot = 1;
  }
  if (keyCode == DOWN_ARROW) {
    rot = 3;
  }
  if (keyCode == LEFT_ARROW) {
    dir = -1;
    dirKeyLastPressed = tick;
  }

  if (keyCode == RIGHT_ARROW) {
    dir = 1;
    dirKeyLastPressed = tick;
  }

  if (keyCode == 32 && state == GAME_OVER_STATE) {
    grid = Array(X * Y).fill(BLACK);
    new_tetronimo();
    state = PLAY_STATE;
    score = 0;
    tick = 0;
  }
}

function drawGrid() {
  for (var x = 0; x < X; x += 1) {
    for (var y = 0; y < Y; y += 1) {
      stroke(GRID_COLOR);
      strokeWeight(1);
      line(x * GRID_SPACING, 0, x * GRID_SPACING, X * GRID_SPACING);
      line(0, y * GRID_SPACING, Y * GRID_SPACING, y * GRID_SPACING);
    }
  }
}

function clearGrid() {
  let rows_to_clear = [];
  for (i = 0; i < Y; i++) {
    let row = grid.slice(i * X, (i + 1) * X);
    if (row.every((x) => !is_black(x))) {
      rows_to_clear.push(i);
    }
  }
  if (rows_to_clear.length != 0) {
    for (idx of rows_to_clear) {
      grid.splice(idx * X, X);
    }
    grid.unshift(...Array(rows_to_clear.length * X).fill(BLACK));

    score += Math.pow(rows_to_clear.length, 2);
  }
}

function draw() {
  if (state == GAME_OVER_STATE) {
    clear();
    background(0, 0, 0);
    fill(255);
    textSize(30);
    strokeWeight(0.5);

    textAlign(CENTER, TOP);
    text(
      "GAME OVER",
      (X * GRID_SPACING) / 2,
      ((Y - INVISIBLE_Y) * GRID_SPACING) / 2 - 100,
      0
    );
    text(
      `SCORE:${score}`,
      (X * GRID_SPACING) / 2,
      ((Y - INVISIBLE_Y) * GRID_SPACING) / 2,
      0
    );
    text(
      `HIGH SCORE:${high_score}`,
      (X * GRID_SPACING) / 2,
      ((Y - INVISIBLE_Y) * GRID_SPACING) / 2 + 100,
      0
    );
  } else if (state == PLAY_STATE) {
    clear();
    background(0, 0, 0);
    drawGrid();

    let num_squares = grid.filter((x) => !is_black(x)).length;

    let rate = Math.floor(
      RATE / (tick / (RATE_SPEEDUP_INTERVAL * (num_squares + 1)) + 1)
    );

    if (keyIsDown(32)) {
      rate = 1;
    }

    for (i = 0; i < X; i++) {
      for (j = INVISIBLE_Y; j < Y; j++) {
        let col = get_grid(i, j);
        draw_square_at_coords(i, j - INVISIBLE_Y, col);
      }
    }

    push();
    textSize(20);
    strokeWeight(0.5);
    textAlign(CENTER, TOP);
    fill(255);
    text(
      `SCORE:${score}`,
      (X * GRID_SPACING) / 2,
      INVISIBLE_Y * GRID_SPACING - 30,
      0
    );
    pop();

    tick += 1;

    if (tick % CONTROL_RATE == 0) {
      move_tetronimo(dir, 0, rot);
      rot = 0;

      if (keyIsDown(LEFT_ARROW) && tick - dirKeyLastPressed > DIR_KEY_DELAY) {
        dir = -1;
      } else if (
        keyIsDown(RIGHT_ARROW) &&
        tick - dirKeyLastPressed > DIR_KEY_DELAY
      ) {
        dir = 1;
      } else {
        dir = 0;
      }
    }

    if (tick % rate == 0) {
      move_tetronimo(0, 1, 0);
    }
  }
}
