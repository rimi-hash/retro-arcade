/* ============================================
   RETRO ARCADE WEBSITE - JAVASCRIPT
   Navigation and games logic
   ============================================ */

// --- Sound Effect Placeholders ---
// To add sounds, create Audio objects and play them at these points:
// playSound('click')     - button clicks and navigation
// playSound('flip')      - memory card flip
// playSound('match')     - memory card match
// playSound('win')       - game won
// playSound('lose')      - game lost
// playSound('draw')      - tie game
// playSound('place')     - tic tac toe mark placed
// Example: const clickSound = new Audio('sounds/click.mp3'); clickSound.play();

/* ============================================
   NAVIGATION
   ============================================ */

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

/**
 * Show a specific section and update active nav link
 * @param {string} sectionId - ID of the section to display
 */
function showSection(sectionId) {
  sections.forEach(function (section) {
    section.classList.remove('active');
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
  }

  navLinks.forEach(function (link) {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });

  // Close mobile nav after selection
  mainNav.classList.remove('open');

  // Scroll to top of page smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Nav link clicks
navLinks.forEach(function (link) {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    showSection(link.dataset.section);
    // playSound('click');
  });
});

// Play Now buttons and Back to Home buttons
document.querySelectorAll('.play-btn, .back-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    showSection(btn.dataset.section);
    // playSound('click');
  });
});

// Game card click (whole card navigates to game)
document.querySelectorAll('.game-card').forEach(function (card) {
  card.addEventListener('click', function (event) {
    if (event.target.classList.contains('play-btn')) return;
    showSection(card.dataset.game);
  });
});

// Mobile nav toggle
navToggle.addEventListener('click', function () {
  mainNav.classList.toggle('open');
});

/* ============================================
   WIN ANIMATION OVERLAY
   ============================================ */

const winOverlay = document.getElementById('winOverlay');
const winOverlayText = document.getElementById('winOverlayText');

/**
 * Show a brief win animation overlay
 * @param {string} message - Text to display
 */
function showWinAnimation(message) {
  winOverlayText.textContent = message;
  winOverlay.classList.remove('hidden');

  // playSound('win');

  setTimeout(function () {
    winOverlay.classList.add('hidden');
  }, 2000);
}

/* ============================================
   TIC TAC TOE
   ============================================ */

const tttBoard = document.getElementById('tttBoard');
const tttStatus = document.getElementById('tttStatus');
const tttScoreX = document.getElementById('tttScoreX');
const tttScoreO = document.getElementById('tttScoreO');
const tttPlayerXNameInput = document.getElementById('tttPlayerXName');
const tttPlayerONameInput = document.getElementById('tttPlayerOName');
const tttScoreXLabel = document.getElementById('tttScoreXLabel');
const tttScoreOLabel = document.getElementById('tttScoreOLabel');
const tttConfirmNamesBtn = document.getElementById('tttConfirmNames');
const tttNameMessage = document.getElementById('tttNameMessage');

let tttState = ['', '', '', '', '', '', '', '', ''];
let tttCurrentPlayer = 'X';
let tttGameActive = true;
let tttScores = { X: 0, O: 0 };
let tttNamesConfirmed = false;

// All winning line combinations
const tttWinPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

/**
 * Get a cell button by board index
 * @param {number} index - Cell index 0-8
 * @returns {HTMLElement|null}
 */
function getTttCell(index) {
  return tttBoard.querySelector('.ttt-cell[data-index="' + index + '"]');
}

/**
 * Count how many cells have been played
 * @returns {number}
 */
function countTttMoves() {
  let count = 0;
  for (let i = 0; i < tttState.length; i++) {
    if (tttState[i] === 'X' || tttState[i] === 'O') {
      count++;
    }
  }
  return count;
}

/**
 * Both tic tac toe player names are required before moves are allowed.
 */
function hasTttPlayerNames() {
  return tttPlayerXNameInput.value.trim().length > 0 &&
    tttPlayerONameInput.value.trim().length > 0;
}

function canPlayTtt() {
  return hasTttPlayerNames() && tttNamesConfirmed;
}

function getTttPlayerName(mark) {
  const name = mark === 'X' ? tttPlayerXNameInput.value.trim() : tttPlayerONameInput.value.trim();
  return name || 'Player ' + mark;
}

function setTttBoardEnabled(enabled) {
  tttBoard.querySelectorAll('.ttt-cell').forEach(function (cell) {
    cell.disabled = !enabled;
  });
  tttBoard.classList.toggle('game-locked', !enabled);
}

function updateTttStartState() {
  tttScoreXLabel.textContent = getTttPlayerName('X');
  tttScoreOLabel.textContent = getTttPlayerName('O');
  tttConfirmNamesBtn.disabled = !hasTttPlayerNames();

  const canPlay = tttGameActive && canPlayTtt();
  setTttBoardEnabled(canPlay);

  if (!hasTttPlayerNames()) {
    tttNameMessage.textContent = 'Enter both player names to start the game.';
    tttNameMessage.classList.remove('hidden');
    tttStatus.textContent = "Player X's turn";
  } else if (!tttNamesConfirmed) {
    tttNameMessage.textContent = 'Confirm to continue.';
    tttNameMessage.classList.remove('hidden');
    tttStatus.textContent = "Player X's turn";
  } else if (tttGameActive) {
    tttNameMessage.textContent = '';
    tttNameMessage.classList.add('hidden');
    tttStatus.textContent = getTttPlayerName(tttCurrentPlayer) + "'s turn";
  }
}

/**
 * Check for win or draw
 * @returns {string|null} 'X', 'O', 'draw', or null if game continues
 */
function checkTttResult() {
  for (let i = 0; i < tttWinPatterns.length; i++) {
    const pattern = tttWinPatterns[i];
    const a = pattern[0];
    const b = pattern[1];
    const c = pattern[2];
    const mark = tttState[a];

    if (mark && mark === tttState[b] && mark === tttState[c]) {
      // Highlight winning cells
      getTttCell(a).classList.add('cell-win');
      getTttCell(b).classList.add('cell-win');
      getTttCell(c).classList.add('cell-win');
      return mark;
    }
  }

  if (countTttMoves() === 9) {
    return 'draw';
  }

  return null;
}

/**
 * Handle cell click
 * @param {number} index - Cell index 0-8
 */
function handleTttClick(index) {
  if (!tttGameActive) return;
  if (!canPlayTtt()) return;
  if (index < 0 || index > 8) return;
  if (tttState[index] !== '') return;

  const cell = getTttCell(index);
  if (!cell) return;

  // Place the current player's mark
  tttState[index] = tttCurrentPlayer;
  cell.textContent = tttCurrentPlayer;
  cell.classList.add('taken');
  if (tttCurrentPlayer === 'O') {
    cell.classList.add('cell-o');
  }

  // playSound('place');

  const result = checkTttResult();

  if (result === 'X' || result === 'O') {
    tttGameActive = false;
    setTttBoardEnabled(false);
    tttScores[result]++;
    tttScoreX.textContent = tttScores.X;
    tttScoreO.textContent = tttScores.O;
    tttStatus.textContent = getTttPlayerName(result) + ' wins!';
    showWinAnimation(getTttPlayerName(result).toUpperCase() + ' WINS!');
    // playSound('win');
    return;
  }

  if (result === 'draw') {
    tttGameActive = false;
    setTttBoardEnabled(false);
    tttStatus.textContent = "It's a draw!";
    // playSound('draw');
    return;
  }

  // Switch to the other player
  tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
  tttStatus.textContent = getTttPlayerName(tttCurrentPlayer) + "'s turn";
}

/**
 * Reset the tic tac toe board for a new round
 */
function resetTttBoard() {
  tttState = ['', '', '', '', '', '', '', '', ''];
  tttCurrentPlayer = 'X';
  tttGameActive = true;
  tttStatus.textContent = "Player X's turn";

  tttBoard.querySelectorAll('.ttt-cell').forEach(function (cell) {
    cell.textContent = '';
    cell.classList.remove('taken', 'cell-o', 'cell-win');
  });

  updateTttStartState();
}

// Use event delegation so every empty cell stays clickable for both players
tttBoard.addEventListener('click', function (event) {
  const cell = event.target.closest('.ttt-cell');
  if (!cell || !tttBoard.contains(cell)) return;

  event.preventDefault();
  event.stopPropagation();

  const index = Number(cell.dataset.index);
  handleTttClick(index);
});

document.getElementById('tttRestart').addEventListener('click', resetTttBoard);

function handleTttNameInput() {
  tttNamesConfirmed = false;
  updateTttStartState();
}

tttPlayerXNameInput.addEventListener('input', handleTttNameInput);
tttPlayerONameInput.addEventListener('input', handleTttNameInput);

tttConfirmNamesBtn.addEventListener('click', function () {
  if (!hasTttPlayerNames()) return;
  tttNamesConfirmed = true;
  updateTttStartState();
});

/* ============================================
   MEMORY CARD GAME
   ============================================ */

const memoryBoard = document.getElementById('memoryBoard');
const memoryMovesEl = document.getElementById('memoryMoves');
const memoryTimerEl = document.getElementById('memoryTimer');
const memoryPairsEl = document.getElementById('memoryPairs');
const memorySuccess = document.getElementById('memorySuccess');
const memoryPlayerNameInput = document.getElementById('memoryPlayerName');
const memoryConfirmNameBtn = document.getElementById('memoryConfirmName');
const memoryNameMessage = document.getElementById('memoryNameMessage');

// Card symbols (8 pairs = 16 cards)
const memorySymbols = ['🎮', '👾', '🕹️', '⭐', '💎', '🔥', '🎯', '🚀'];

let memoryCards = [];
let memoryFlipped = [];
let memoryMatchedCount = 0;
let memoryMoves = 0;
let memoryTimer = null;
let memorySeconds = 0;
let memoryLock = false;
let memoryNameConfirmed = false;

function hasMemoryPlayerName() {
  return memoryPlayerNameInput.value.trim().length > 0;
}

function canPlayMemory() {
  return hasMemoryPlayerName() && memoryNameConfirmed;
}

function updateMemoryStartState() {
  const canPlay = canPlayMemory();
  memoryConfirmNameBtn.disabled = !hasMemoryPlayerName();
  memoryBoard.classList.toggle('game-locked', !canPlay);

  if (!hasMemoryPlayerName()) {
    stopMemoryTimer();
    memoryNameMessage.textContent = 'Enter your name to start the game.';
    memoryNameMessage.classList.remove('hidden');
    memorySuccess.classList.add('hidden');
  } else if (!memoryNameConfirmed) {
    stopMemoryTimer();
    memoryNameMessage.textContent = 'Confirm to continue.';
    memoryNameMessage.classList.remove('hidden');
    memorySuccess.classList.add('hidden');
  } else if (memoryMatchedCount < 8) {
    memoryNameMessage.textContent = '';
    memoryNameMessage.classList.add('hidden');
    memorySuccess.classList.add('hidden');
    memorySuccess.innerHTML =
      '<p class="win-message glow-green">YOU WIN!</p>' +
      '<p>All pairs matched!</p>';
  } else {
    memoryNameMessage.textContent = '';
    memoryNameMessage.classList.add('hidden');
    memorySuccess.classList.remove('hidden');
    memorySuccess.innerHTML =
      '<p class="win-message glow-green">YOU WIN!</p>' +
      '<p>All pairs matched!</p>';
  }
}

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Format seconds as MM:SS
 * @param {number} totalSeconds - Elapsed seconds
 * @returns {string} Formatted time
 */
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

/**
 * Start the memory game timer
 */
function startMemoryTimer() {
  if (memoryTimer) return;
  memoryTimer = setInterval(function () {
    memorySeconds++;
    memoryTimerEl.textContent = formatTime(memorySeconds);
  }, 1000);
}

/**
 * Stop the memory game timer
 */
function stopMemoryTimer() {
  if (memoryTimer) {
    clearInterval(memoryTimer);
    memoryTimer = null;
  }
}

/**
 * Handle memory card click
 * @param {number} index - Card index
 */
function handleMemoryClick(index) {
  if (!canPlayMemory()) return;
  if (memoryLock) return;
  if (memoryCards[index].matched) return;
  if (memoryFlipped.includes(index)) return;

  const cardEl = memoryBoard.children[index];
  cardEl.classList.add('flipped');
  memoryFlipped.push(index);

  // playSound('flip');

  if (memoryFlipped.length === 1) {
    startMemoryTimer();
  }

  if (memoryFlipped.length === 2) {
    memoryMoves++;
    memoryMovesEl.textContent = memoryMoves;
    memoryLock = true;

    const first = memoryFlipped[0];
    const second = memoryFlipped[1];

    if (memoryCards[first].symbol === memoryCards[second].symbol) {
      // Match found
      memoryCards[first].matched = true;
      memoryCards[second].matched = true;
      memoryBoard.children[first].classList.add('matched');
      memoryBoard.children[second].classList.add('matched');
      memoryMatchedCount++;
      memoryPairsEl.textContent = memoryMatchedCount + ' / 8';
      memoryFlipped = [];
      memoryLock = false;

      // playSound('match');

      if (memoryMatchedCount === 8) {
        stopMemoryTimer();
        memorySuccess.classList.remove('hidden');
        showWinAnimation('MEMORY MASTER!');
        // playSound('win');
      }
    } else {
      // No match — flip back after delay
      setTimeout(function () {
        memoryBoard.children[first].classList.remove('flipped');
        memoryBoard.children[second].classList.remove('flipped');
        memoryFlipped = [];
        memoryLock = false;
      }, 900);
    }
  }
}

/**
 * Build and reset the memory game board
 */
function initMemoryGame() {
  stopMemoryTimer();
  memoryCards = [];
  memoryFlipped = [];
  memoryMatchedCount = 0;
  memoryMoves = 0;
  memorySeconds = 0;
  memoryLock = false;

  memoryMovesEl.textContent = '0';
  memoryTimerEl.textContent = '00:00';
  memoryPairsEl.textContent = '0 / 8';
  memorySuccess.classList.add('hidden');
  memoryBoard.innerHTML = '';

  // Create pairs and shuffle
  const pairs = memorySymbols.concat(memorySymbols);
  const shuffled = shuffleArray(pairs);

  shuffled.forEach(function (symbol, index) {
    memoryCards.push({ symbol: symbol, matched: false });

    const card = document.createElement('div');
    card.className = 'memory-card';
    card.innerHTML =
      '<div class="memory-card-inner">' +
        '<div class="memory-card-face memory-card-front">?</div>' +
        '<div class="memory-card-face memory-card-back">' + symbol + '</div>' +
      '</div>';

    card.addEventListener('click', function () {
      handleMemoryClick(index);
    });

    memoryBoard.appendChild(card);
  });

  updateMemoryStartState();
}

document.getElementById('memoryRestart').addEventListener('click', initMemoryGame);

memoryPlayerNameInput.addEventListener('input', function () {
  memoryNameConfirmed = false;
  updateMemoryStartState();
});

memoryConfirmNameBtn.addEventListener('click', function () {
  if (!hasMemoryPlayerName()) return;
  memoryNameConfirmed = true;
  updateMemoryStartState();
});

/* ============================================
   ROCK PAPER SCISSORS
   ============================================ */

const RPS_TOTAL_ROUNDS = 5;

const rpsChoices = ['rock', 'paper', 'scissors'];
const rpsEmojis = { rock: '✊', paper: '✋', scissors: '✌️' };

const rpsPlayerNameInput = document.getElementById('rpsPlayerName');
const rpsRoundEl = document.getElementById('rpsRound');
const rpsPlayerScoreEl = document.getElementById('rpsPlayerScore');
const rpsComputerScoreEl = document.getElementById('rpsComputerScore');
const rpsDrawScoreEl = document.getElementById('rpsDrawScore');
const rpsPlayerChoiceEl = document.getElementById('rpsPlayerChoice');
const rpsComputerChoiceEl = document.getElementById('rpsComputerChoice');
const rpsResultEl = document.getElementById('rpsResult');
const rpsMatchResultEl = document.getElementById('rpsMatchResult');
const rpsButtonsEl = document.getElementById('rpsButtons');
const rpsConfirmNameBtn = document.getElementById('rpsConfirmName');
const rpsNameMessage = document.getElementById('rpsNameMessage');

let rpsScores = { player: 0, computer: 0, draw: 0 };
let rpsRound = 0;
let rpsMatchActive = true;
let rpsNameConfirmed = false;

/**
 * Enable or disable RPS choice buttons
 * @param {boolean} enabled - Whether buttons can be clicked
 */
function setRpsButtonsEnabled(enabled) {
  rpsButtonsEl.querySelectorAll('.btn-rps').forEach(function (btn) {
    btn.disabled = !enabled;
  });
  rpsButtonsEl.classList.toggle('rps-disabled', !enabled);
}

/**
 * A player name is required before a match can begin.
 */
function hasRpsPlayerName() {
  return rpsPlayerNameInput.value.trim().length > 0;
}

function canPlayRps() {
  return hasRpsPlayerName() && rpsNameConfirmed;
}

/**
 * Keep the choice controls locked until the player enters a name.
 */
function updateRpsStartState() {
  const canPlay = rpsMatchActive && rpsRound < RPS_TOTAL_ROUNDS && canPlayRps();
  rpsConfirmNameBtn.disabled = !hasRpsPlayerName();
  setRpsButtonsEnabled(canPlay);

  if (rpsRound === 0 && rpsMatchActive) {
    rpsResultEl.classList.remove('lose', 'draw');

    if (!hasRpsPlayerName()) {
      rpsNameMessage.textContent = 'Enter your name to start the game.';
      rpsNameMessage.classList.remove('hidden');
      rpsResultEl.textContent = 'Round 1 — Make your move!';
    } else if (!rpsNameConfirmed) {
      rpsNameMessage.textContent = 'Confirm to continue.';
      rpsNameMessage.classList.remove('hidden');
      rpsResultEl.textContent = 'Round 1 — Make your move!';
    } else {
      rpsNameMessage.textContent = '';
      rpsNameMessage.classList.add('hidden');
      rpsResultEl.textContent = 'Round 1 — Make your move!';
    }
  }
}

/**
 * Reset the current 5-round match
 */
function resetRpsMatch() {
  rpsScores = { player: 0, computer: 0, draw: 0 };
  rpsRound = 0;
  rpsMatchActive = true;

  rpsPlayerScoreEl.textContent = '0';
  rpsComputerScoreEl.textContent = '0';
  rpsDrawScoreEl.textContent = '0';
  rpsRoundEl.textContent = '0 / ' + RPS_TOTAL_ROUNDS;
  rpsPlayerChoiceEl.textContent = '?';
  rpsComputerChoiceEl.textContent = '?';
  rpsResultEl.textContent = 'Round 1 — Make your move!';
  rpsResultEl.classList.remove('lose', 'draw');
  rpsMatchResultEl.classList.add('hidden');
  rpsMatchResultEl.innerHTML = '';

  updateRpsStartState();
}

/**
 * Finish the match after 5 rounds and show the individual match result
 */
function finishRpsMatch() {
  rpsMatchActive = false;
  setRpsButtonsEnabled(false);

  let matchTitle = '';
  let matchClass = 'draw';

  if (rpsScores.player > rpsScores.computer) {
    matchTitle = 'YOU WIN THE MATCH!';
    matchClass = 'win';
    showWinAnimation('MATCH WINNER!');
  } else if (rpsScores.computer > rpsScores.player) {
    matchTitle = 'COMPUTER WINS THE MATCH!';
    matchClass = 'lose';
  } else {
    matchTitle = 'MATCH DRAW!';
    matchClass = 'draw';
  }

  const summary =
    'Final score — You: ' + rpsScores.player +
    ' | Computer: ' + rpsScores.computer +
    ' | Draws: ' + rpsScores.draw;

  rpsResultEl.textContent = matchTitle;
  rpsResultEl.classList.remove('lose', 'draw');
  if (matchClass === 'lose') {
    rpsResultEl.classList.add('lose');
  } else if (matchClass === 'draw') {
    rpsResultEl.classList.add('draw');
  }

  const matchEarned = rpsScores.player;

  rpsMatchResultEl.innerHTML =
    '<p class="win-message glow-green">' + matchTitle + '</p>' +
    '<p>' + summary + '</p>' +
    '<p>Your score this match: ' + matchEarned + '</p>' +
    '<p>Click "Play Again" to play again.</p>';
  rpsMatchResultEl.classList.remove('hidden');
}

/**
 * Determine round winner
 * @param {string} player - Player choice
 * @param {string} computer - Computer choice
 * @returns {string} 'player', 'computer', or 'draw'
 */
function getRpsWinner(player, computer) {
  if (player === computer) return 'draw';

  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'player';
  }

  return 'computer';
}

/**
 * Play one round of rock paper scissors
 * @param {string} playerChoice - rock, paper, or scissors
 */
function playRps(playerChoice) {
  if (!rpsMatchActive || rpsRound >= RPS_TOTAL_ROUNDS || !canPlayRps()) {
    return;
  }

  const computerChoice = rpsChoices[Math.floor(Math.random() * 3)];

  rpsPlayerChoiceEl.textContent = rpsEmojis[playerChoice];
  rpsComputerChoiceEl.textContent = rpsEmojis[computerChoice];

  const winner = getRpsWinner(playerChoice, computerChoice);

  rpsResultEl.classList.remove('lose', 'draw');

  if (winner === 'player') {
    rpsScores.player++;
    rpsResultEl.textContent = 'You win this round!';
  } else if (winner === 'computer') {
    rpsScores.computer++;
    rpsResultEl.textContent = 'Computer wins this round!';
    rpsResultEl.classList.add('lose');
  } else {
    rpsScores.draw++;
    rpsResultEl.textContent = "It's a draw!";
    rpsResultEl.classList.add('draw');
  }

  rpsRound++;
  rpsPlayerScoreEl.textContent = rpsScores.player;
  rpsComputerScoreEl.textContent = rpsScores.computer;
  rpsDrawScoreEl.textContent = rpsScores.draw;
  rpsRoundEl.textContent = rpsRound + ' / ' + RPS_TOTAL_ROUNDS;

  if (rpsRound >= RPS_TOTAL_ROUNDS) {
    finishRpsMatch();
    return;
  }

  rpsResultEl.textContent += ' — Round ' + (rpsRound + 1) + ' next';
}

document.querySelectorAll('.btn-rps').forEach(function (btn) {
  btn.addEventListener('click', function () {
    playRps(btn.dataset.choice);
    // playSound('click');
  });
});

rpsPlayerNameInput.addEventListener('input', function () {
  rpsNameConfirmed = false;
  updateRpsStartState();
});

rpsConfirmNameBtn.addEventListener('click', function () {
  if (!hasRpsPlayerName()) return;
  rpsNameConfirmed = true;
  updateRpsStartState();
});

document.getElementById('rpsReset').addEventListener('click', resetRpsMatch);

/* ============================================
   INITIALIZE ON PAGE LOAD
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  resetTttBoard();
  initMemoryGame();
  resetRpsMatch();
});
