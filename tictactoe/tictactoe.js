"use strict";

// Credit to Justin Kim, angle943 on GitHub, for the
// parts of this code
// https://github.com/angle943/tic-tac-toe

const xSymbol = '×';
const oSymbol = '○';

let gameIsLive = true;
let xIsNext = true;


const letterToSymbol = (letter) => letter === 'x' ? xSymbol : oSymbol;

const handleWin = (letter) => {
  const statusDiv = document.querySelector('.status');
  gameIsLive = false;
  if (letter === 'x') {
    statusDiv.textContent = `${letterToSymbol(letter)} has won!`;
    statusDiv.style.color = "#545454";
  } else {
    statusDiv.textContent = `${letterToSymbol(letter)} has won!`;
    statusDiv.style.color = "#F2EBD3";
  }
};

const checkGameStatus = () => {
  const cellDivs = document.querySelectorAll('.game-cell');
  const statusDiv = document.querySelector('.status');
  const topLeft = cellDivs[0].classList[1];
  const topMiddle = cellDivs[1].classList[1];
  const topRight = cellDivs[2].classList[1];
  const middleLeft = cellDivs[3].classList[1];
  const middleMiddle = cellDivs[4].classList[1];
  const middleRight = cellDivs[5].classList[1];
  const bottomLeft = cellDivs[6].classList[1];
  const bottomMiddle = cellDivs[7].classList[1];
  const bottomRight = cellDivs[8].classList[1];

  // check winner
  if (topLeft && topLeft === topMiddle && topLeft === topRight) {
    handleWin(topLeft);
    cellDivs[0].classList.add('won');
    cellDivs[1].classList.add('won');
    cellDivs[2].classList.add('won');
  } else if (middleLeft && middleLeft === middleMiddle && middleLeft === middleRight) {
    handleWin(middleLeft);
    cellDivs[3].classList.add('won');
    cellDivs[4].classList.add('won');
    cellDivs[5].classList.add('won');
  } else if (bottomLeft && bottomLeft === bottomMiddle && bottomLeft === bottomRight) {
    handleWin(bottomLeft);
    cellDivs[6].classList.add('won');
    cellDivs[7].classList.add('won');
    cellDivs[8].classList.add('won');
  } else if (topLeft && topLeft === middleLeft && topLeft === bottomLeft) {
    handleWin(topLeft);
    cellDivs[0].classList.add('won');
    cellDivs[3].classList.add('won');
    cellDivs[6].classList.add('won');
  } else if (topMiddle && topMiddle === middleMiddle && topMiddle === bottomMiddle) {
    handleWin(topMiddle);
    cellDivs[1].classList.add('won');
    cellDivs[4].classList.add('won');
    cellDivs[7].classList.add('won');
  } else if (topRight && topRight === middleRight && topRight === bottomRight) {
    handleWin(topRight);
    cellDivs[2].classList.add('won');
    cellDivs[5].classList.add('won');
    cellDivs[8].classList.add('won');
  } else if (topLeft && topLeft === middleMiddle && topLeft === bottomRight) {
    handleWin(topLeft);
    cellDivs[0].classList.add('won');
    cellDivs[4].classList.add('won');
    cellDivs[8].classList.add('won');
  } else if (topRight && topRight === middleMiddle && topRight === bottomLeft) {
    handleWin(topRight);
    cellDivs[2].classList.add('won');
    cellDivs[4].classList.add('won');
    cellDivs[6].classList.add('won');
  } else if (topLeft && topMiddle && topRight && middleLeft && middleMiddle && middleRight && bottomLeft && bottomMiddle && bottomRight) {
    gameIsLive = false;
    statusDiv.textContent = 'Game is tied!';
  } else {
    xIsNext = !xIsNext;
    if (xIsNext) {
      statusDiv.textContent = `${xSymbol} is next`;
      statusDiv.style.color = "#545454";
    } else {
      statusDiv.textContent = `${oSymbol} is next`;
      statusDiv.style.color = "#F2EBD3";
    }
  }
};


// event Handlers
const handleReset = () => {
  const cellDivs = document.querySelectorAll('.game-cell');
  const statusDiv = document.querySelector('.status');
  xIsNext = true;
  statusDiv.textContent = `${xSymbol} is next`;
  statusDiv.style.color = "#545454";
  for (const cellDiv of cellDivs) {
    cellDiv.classList.remove('x');
    cellDiv.classList.remove('o');
    cellDiv.classList.remove('won');
  }
  gameIsLive = true;
};

const handleCellClick = (e) => {
  const classList = e.target.classList;

  if (!gameIsLive || classList[1] === 'x' || classList[1] === 'o') {
    return;
  }

  if (xIsNext) {
    classList.add('x');
    checkGameStatus();
  } else {
    classList.add('o');
    checkGameStatus();
  }
};


const eventListeners = () => {
  const cellDivs = document.querySelectorAll('.game-cell');
  const resetDiv = document.querySelector('.reset');
  resetDiv.addEventListener('click', handleReset);

  for (const cellDiv of cellDivs) {
    cellDiv.addEventListener('click', handleCellClick)
  }
}

window.onload = eventListeners;
