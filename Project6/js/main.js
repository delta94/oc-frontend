const imageDir = `https://aashutoshrathi.tk/oc-frontend/Project6/images/`;
const weaponImages = `https://www.greeksymbols.net/img/`;

const hurdleBlock = `<img src="${imageDir}tree.png"></img>`;
const BOARD_SIZE = 10;

const gameSettings = {
  boardSize: 10,
  gameId: "game",
  moveLimit: 3,
  weaponTypes: [
    {
      image: `${weaponImages}alpha-symbol.png`,
      score: 10,
      name: "alpha"
    },
    {
      image: `${weaponImages}beta-symbol.png`,
      score: 20,
      name: "beta"
    },
    {
      image: `${weaponImages}gamma-symbol.png`,
      score: 30,
      name: "gamma"
    },
    {
      image: `${weaponImages}delta-symbol.png`,
      score: 40,
      name: "delta"
    },
    {
      image: `${weaponImages}pi-symbol.png`,
      score: 50,
      name: "pi"
    }
  ],
  players: [
    {
      name: "Player One"
    },
    {
      name: "Player Two"
    }
  ]
};

function Game(gameSettings) {
  this.settings = gameSettings;
  this.activePlayer = 0;
  this.moveLimit = gameSettings.moveLimit;
  this.players = gameSettings.players.map((player, idx) => {
    player["id"] = idx;
    return new Player(player, this);
  }, this);
  this.grid = new Array(100).fill(0);

  // Render that bad boy
  this.renderBoard();
}

function Player(player) {
  this.id = player.id;
  this.score = 100;
  this.weapon = -1;
  this.name = player.name | `Player ${this.id}`;
  this.position;
}

Game.prototype.setPlayerPositions = function(one, two) {
  // console.log(`Setting players at ${one} and ${two}`);
  const newPos = [one, two];
  newPos.forEach((pos, i) => {
    targetBox = document.querySelector(`#box-${pos}`);
    if (targetBox.children[0] && targetBox.children[0].className === "weapon") {
      this.settings.weaponTypes.forEach((weapon, idx) => {
        if (weapon.name === targetBox.children[0].alt) {
          this.players[this.activePlayer].weapon = idx;
        }
      });
      targetBox.innerHTML = "";
    }

    if (targetBox.children.length < 1)
      targetBox.innerHTML += `<img width="45px" src="${imageDir}p${i +
        1}.png" alt="P${i + 1}"/>`;
  });
};

function generateNUniqueNumbers(length, range) {
  var arr = [];
  while (arr.length < length) {
    var r = Math.floor(Math.random() * range) + 1;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

function initEmptyBoard() {
  board = document.querySelector("#board");

  for (let i = 0; i < BOARD_SIZE; i++) {
    board.innerHTML += `<div class="row" id="row-${i + 1}"></div>`;
    row = document.querySelector(`#row-${i + 1}`);
    for (let j = 0; j < BOARD_SIZE; j++) {
      row.innerHTML += `<div class="box" id="box-${i * BOARD_SIZE + j}"></div>`;
    }
  }
}

Game.prototype.addHurdles = function(hurdles) {
  var that = this;
  console.log(this);
  hurdles.forEach(hurdle => {
    targetBox = document.querySelector(`#box-${hurdle}`);
    targetBox.innerHTML += hurdleBlock;
    that.grid[hurdle] = "H";
  });
};

function resetBox(boxNum) {
  box = document.querySelector(`#box-${boxNum}`);
  box.innerHTML = "";
  box.outerHTML = box.outerHTML;
}

Game.prototype.onClickThing = function() {
  const that = this;
  const dirtyFellows = document.getElementsByClassName("possible");
  Object.values(dirtyFellows).forEach(fellow => {
    fellow.className = "box";
    fellow.outerHTML = fellow.outerHTML;
  });

  that.activePlayer = (that.activePlayer + 1) % 2; // And after click the turn changes.
  const turnIndicator = document.querySelector("#turn");
  turnIndicator.src = `${imageDir}p${that.activePlayer + 1}.png`;

  that.updateBoard();
  
  for (let id = 1; id <= 2; id++) {
    document.querySelector(`#p${id}-score`).innerText = this.players[
      id - 1
    ].score;
    document.querySelector(`#p${id}-weapon`).innerText =
      this.players[id - 1].weapon === -1
        ? "None"
        : this.settings.weaponTypes[this.players[id - 1].weapon].name;
  }

};

Game.prototype.addWeapons = function(weapons) {
  var that = this;
  weapons.forEach((weapon, idx) => {
    targetBox = document.querySelector(`#box-${weapon}`);
    that.grid[weapon] = "W";
    const { image, name, score } = that.settings.weaponTypes[idx];
    targetBox.innerHTML += `<img class="weapon" src="${image}" alt="${name}" title="${score}"/>`;
  });
};

Game.prototype.renderBoard = function() {
  initEmptyBoard();
  randomNumbers = generateNUniqueNumbers(17, 99);
  hurdles = randomNumbers.slice(0, 10);
  weapons = randomNumbers.slice(10, 15);

  playerOnePosition = randomNumbers[15];
  playerTwoPosition = randomNumbers[16];
  this.players[0].position = playerOnePosition;
  this.players[1].position = playerTwoPosition;

  for (let id = 1; id <= 2; id++) {
    document.querySelector(`#p${id}-score`).innerText = this.players[
      id - 1
    ].score;
    document.querySelector(`#p${id}-weapon`).innerText =
      this.players[id - 1].weapon === -1
        ? "None"
        : this.settings.weaponTypes[this.players[id - 1].weapon].name;
  }

  this.setPlayerPositions(playerOnePosition, playerTwoPosition);

  this.addHurdles(hurdles, this);
  this.addWeapons(weapons, this);
  this.getValidMoves();
};

Game.prototype.updateBoard = function() {
  this.setPlayerPositions(this.players[0].position, this.players[1].position);
  this.getValidMoves();
};

Game.prototype.getValidMoves = function() {
  var that = this;
  point = that.players[that.activePlayer].position;
  parentRow = parseInt(point / 10);
  parentCol = point % 10;
  directions = [1, -1, 10, -10]; // First one is for left, then right then top bottom.
  // Every cell (i,j) in grid has number 10*i+j+1
  directions.forEach(dir => {
    for (let i = 1; i <= that.moveLimit; i++) {
      const target = point + dir * i;
      if (that.grid[target] === "H") {
        // H is for Hurdles
        break;
      }

      tCol = target % 10;
      tRow = parseInt(target / 10);
      // console.table({ point, target, tCol, parentCol, tRow, parentRow });

      const verticalCon = tCol === parentCol && Math.abs(dir) == 10;
      const horizontalCon = tRow === parentRow && Math.abs(dir) == 1;
      const rangeCondition = target >= 0 && target < 100;
      if (rangeCondition && (verticalCon || horizontalCon)) {
        document.querySelector(`#box-${target}`).className += " possible"; // possible class gives yellow bg to cell
        document
          .querySelector(`#box-${target}`)
          .addEventListener("click", function() {
            resetBox(that.players[that.activePlayer].position);
            that.players[that.activePlayer].position = target;
            that.onClickThing();
          }); // this is onclick event which will move player soon.
      }
    }
  });
};

game = new Game(gameSettings);
