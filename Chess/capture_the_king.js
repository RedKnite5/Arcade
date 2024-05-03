"use strict";

const BOARD_SIZE = 8;
const letters = "abcdefgh";
const turns = true;


let whitesTurn = true;
let enPassant = null;


function setup() {
    setupChess();
}

// https://commons.wikimedia.org/wiki/Category:SVGChessPieces
// Credit to Colin M.L. Burnett for chess piece images
function setupChess() {
    const board = get("board");

    for (let i = 0; i < BOARD_SIZE; i++) {
        const row = makeRow(i);
        board.appendChild(row);
    }
    addPieces();
    window.addEventListener('resize', resize_pieces, true);

    get("restart").onclick = restart;
}

function addPieces() {
    addChessPiece("a8", "rd");
    addChessPiece("b8", "nd");
    addChessPiece("c8", "bd");
    addChessPiece("d8", "qd");
    addChessPiece("e8", "kd");
    addChessPiece("f8", "bd");
    addChessPiece("g8", "nd");
    addChessPiece("h8", "rd");
    addChessPiece("a7", "pd");
    addChessPiece("b7", "pd");
    addChessPiece("c7", "pd");
    addChessPiece("d7", "pd");
    addChessPiece("e7", "pd");
    addChessPiece("f7", "pd");
    addChessPiece("g7", "pd");
    addChessPiece("h7", "pd");

    addChessPiece("a1", "rl");
    addChessPiece("b1", "nl");
    addChessPiece("c1", "bl");
    addChessPiece("d1", "ql");
    addChessPiece("e1", "kl");
    addChessPiece("f1", "bl");
    addChessPiece("g1", "nl");
    addChessPiece("h1", "rl");
    addChessPiece("a2", "pl");
    addChessPiece("b2", "pl");
    addChessPiece("c2", "pl");
    addChessPiece("d2", "pl");
    addChessPiece("e2", "pl");
    addChessPiece("f2", "pl");
    addChessPiece("g2", "pl");
    addChessPiece("h2", "pl");
}

function removePieces() {
    const board = get("board");
    for (const row of board.children) {
        for (const square of row.children) {
            square.replaceChildren();
        }
    }
    get("BCP").replaceChildren();
    get("WCP").replaceChildren();
}

function makeRow(i) {
    const row = document.createElement("div");
    row.id = i;
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.flexGrow = 1;
    row.style.flexBasis = 0;
    row.style.overflow = "hidden";
    row.className = "row";

    for (let j = 0; j < BOARD_SIZE; j++) {
        const square = makeSquare(j, i);
        row.appendChild(square);
    }
    return row;
}

function makeSquare(j, i) {
    const square = document.createElement("div");
    square.id = makeId(j, BOARD_SIZE - i);

    square.style.flexGrow = 1;
    square.style.flexBasis = 0;
    square.style.textAlign = "center";
    square.style.aspectRatio = "1/1";
    square.className = "square";
    square.ondrop = drop;
    square.ondragover = allowDrop;

    if ((i + j) % 2 === 0) {
        square.style.background = "#F0EAD6";
    } else {
        square.style.background = "SaddleBrown";
    }
    return square;
}

function addChessPiece(squareid, piece) {
    const size = get(squareid).offsetWidth - 1;
    const filename = "./Chess_" + piece + "t45.svg.png";
    const square = get(squareid);
    const image = document.createElement("img");
    image.id = squareid + piece;
    image.alt = piece;
    image.draggable = true;
    image.ondragstart = drag;
    image.height = size;
    image.width = size;
    image.src = filename;

    if ("rk".includes(piece[0])) {
        image.hasMoved = false;
    }

    square.appendChild(image);
}

function resize_pieces(event) {
    const board = get("board");
    const size = get("a1").offsetWidth - 1;
    for (const row of board.children) {
        for (const square of row.children) {
            if (square.hasChildNodes()) {
                square.firstChild.height = size;
                square.firstChild.width = size;
            }
        }
    }
    for (const piece of get("BCP").children) {
        piece.height = size;
        piece.width = size;
    }
    for (const piece of get("WCP").children) {
        piece.height = size;
        piece.width = size;
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    const data = {
        id: event.target.id,
        origin: get(event.target.id).parentElement.id,
    };
    event.dataTransfer.setData("text", JSON.stringify(data));
}

function drop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData("text"));

    let dest;
    if (event.target.nodeName === "IMG") {
        dest = event.target.parentElement.id;
    } else {
        dest = event.target.id;

        if (!event.target.classList.contains("square")) {
            alert("Problem! Non-square target");
            console.log(event.target);
            console.log(event.target.id);
            console.log(event.target.classList);
        }
    }
    const target = get(dest);

    const color = getColor(data.id);
    const piece = getPiece(data.id);

    const white = color === "l";

    const yourTurn = whitesTurn === white || !turns;
    // early return would be good here instead of putting everything in the if
    if (yourTurn) {
        const valid = checkValid(data, dest);
        if (valid) {
            if (piece !== "p") {
                enPassant = null;
            }
            target.appendChild(get(data.id));
            whitesTurn = !whitesTurn;
        }
    }
}

function checkValid(data, dest) {
    let valid = false;
    const piece = getPiece(data.id);
    if (piece === "p") {
        valid = pawnMv(data, dest);
    } else if (piece === "r") {
        valid = rookMv(data, dest);
    } else if (piece === "b") {
        valid = bishopMv(data, dest);
    } else if (piece === "n") {
        valid = knightMv(data, dest);
    } else if (piece === "q") {
        valid = queenMv(data, dest);
    } else if (piece === "k") {
        valid = kingMv(data, dest);
    } else {
        alert("unknown piece!");
        console.log("piece: ", piece);
        console.log("id: ", data.id);
        console.log("data: ", data);
    }
    return valid;
}

function pawnMv(data, dest) {
    const destEl = get(dest);
    const pieceId = data.id;
    const pieceColor = getColor(pieceId);
    const dir = getPawnDir(pieceColor);

    const [x, y] = parseData(data);

    const yesCapture = pawnOptions(x, y, dir);
    const viable = filterColor(yesCapture, pieceColor);
    const possible = filterPawnCaptures(viable, dir);

    const forwardTwoId = makeId(x, y + 2*dir);
    const forwardTwo = get(forwardTwoId);

    const noCapture = forwardMoves(x, y, dir, data, forwardTwo, pieceColor);

    possible.push(...noCapture);

    const enPassantSquare = get(enPassant);

    const [destX, destY] = parseId(dest);
    const testEnPassantSquare = getSq(destX, destY - dir);
    if (testEnPassantSquare === enPassantSquare) {
        tryTake(enPassantSquare);
    }

    const valid = checkMoveAndTake(possible, destEl);
    if (valid) {
        if (destEl === forwardTwo) {
            enPassant = forwardTwoId;
        } else {
            enPassant = null;
        }

        if (destY === 1 || destY === BOARD_SIZE) {
            const promotionModal = get("promotion-modal-" + pieceColor);
            promotionModal.style.display = "block";
            makePromotionOptions(pieceColor, get(pieceId));
        }
    }

    return valid;
}

function forwardMoves(x, y, dir, data, forwardTwo, pieceColor) {
    const otherColor = getOtherColor(pieceColor);
    const forward = getSq(x, y + dir);
    const forwardOptions = [forward];

    const startingSquare = data.id.slice(0, 2);
    if (data.origin === startingSquare) {
        forwardOptions.push(forwardTwo);
    }

    const noCaptureSelf = filterColor(forwardOptions, pieceColor);
    const noCapture = filterColor(noCaptureSelf, otherColor);
    return noCapture;
}

function filterPawnCaptures(viable, dir) {
    const possible = [];
    for (const square of viable) {
        const enPassantCond = checkEnPassant(square.id, enPassant, dir);
        if (square.hasChildNodes() || enPassantCond) {
            possible.push(square);
        }
    }
    return possible;
}

function pawnOptions(x, y, dir) {
    const id1 = makeId(x+1, y+dir);
    const id3 = makeId(x-1, y+dir);
    const ids = [id1, id3];
    const squares = getAll(ids);
    return filterExists(squares);
}

function checkEnPassant(squareId, enPassant, dir) {
    const [enPassantX, enPassantY] = parseId(enPassant);
    const [squareX, squareY] = parseId(squareId);
    return enPassantX === squareX && (squareY - dir) === enPassantY;
}

function makePromotionOptions(color, pawn) {
    const modalDisplay = get("modal-display-" + color);
    for (const letter of "qrbn") {
        modalDisplay.appendChild(makePromotionOption(letter + color, pawn));
    }
}

function makePromotionOption(piece, pawn) {
    const button = document.createElement("button");
    button.id = "button-" + piece;

    const filename = "Chess_" + piece + "t45.svg.png";
    const image = makePromotionImage(piece, filename);
    button.appendChild(image);

    const [x, y] = parseId(pawn.parentElement.id);
    const color = getColor(pawn.id);
    const dir = getPawnDir(color);

    const modalDisplay = get("modal-display-" + color);

    function promotePawn() {
        pawn.src = filename;
        pawn.id = makeId(x, y + dir) + piece;
        pawn.alt = piece;

        modalDisplay.replaceChildren();
        modalDisplay.parentElement.style.display = "none";
    }
    button.onclick = promotePawn;

    return button;
}

function makePromotionImage(piece, filename) {
    const size = getSq(0, 1).offsetWidth - 1;
    const image = document.createElement("img");
    image.id = "promotion-" + piece;
    image.alt = piece;
    image.height = size;
    image.width = size;
    image.src = filename;
    return image;
}

function rookMv(data, dest) {
    const destEl = get(dest);
    const pieceId = data.id;
    const pieceColor = getColor(pieceId);
    const [x, y] = parseData(data);

    const possible = rookOptions(x, y, pieceColor);

    const valid = checkMoveAndTake(possible, destEl);
    if (valid) {
        get(pieceId).hasMoved = true;
    }
    return valid;
}

function rookOptions(x, y, pieceColor) {
    const available = [];
    available.push(...addDir(x, y, 1, 0));
    available.push(...addDir(x, y, -1, 0));
    available.push(...addDir(x, y, 0, 1));
    available.push(...addDir(x, y, 0, -1));

    return filterColor(available, pieceColor);
}

function bishopMv(data, dest) {
    const destEl = get(dest);
    const pieceId = data.id;
    const pieceColor = getColor(pieceId);
    const [x, y] = parseData(data);

    const possible = bishopOptions(x, y, pieceColor);

    return checkMoveAndTake(possible, destEl);
}

function bishopOptions(x, y, pieceColor) {
    const available = [];
    available.push(...addDir(x, y, 1, 1));
    available.push(...addDir(x, y, 1, -1));
    available.push(...addDir(x, y, -1, 1));
    available.push(...addDir(x, y, -1, -1));

    return filterColor(available, pieceColor);
}

function addDir(x, y, xDir, yDir) {
    const arr = [];
    let open = true;
    let i = 1;
    while (i < BOARD_SIZE && open) {
        const nextId = makeId(x + xDir * i, y + yDir * i);
        const next = get(nextId);
        open = freeSquare(next);
        arr.push(next);
        i++;
    }
    return arr;
}

function knightMv(data, dest) {
    const destEl = get(dest);
    const pieceId = data.id;
    const pieceColor = getColor(pieceId);

    const [x, y] = parseData(data);

    const possible = knightOptions(x, y, pieceColor);

    return checkMoveAndTake(possible, destEl);
}

function knightOptions(x, y, pieceColor) {
    const available = [];
    available.push(...knightAvailable(x, y, 1, 1));
    available.push(...knightAvailable(x, y, 1, -1));
    available.push(...knightAvailable(x, y, -1, 1));
    available.push(...knightAvailable(x, y, -1, -1));

    return filterColor(available, pieceColor);
}

function knightAvailable(x, y, xDir, yDir) {
    const id1 = makeId(x + xDir, y + yDir * 2);
    const id2 = makeId(x + xDir * 2, y + yDir);
    const ids = [id1, id2];
    const squares = getAll(ids);
    return filterExists(squares);
}

function queenMv(data, dest) {
    const destEl = get(dest);
    const pieceId = data.id;
    const pieceColor = getColor(pieceId);

    const [x, y] = parseData(data);

    const possible = queenOptions(x, y, pieceColor);

    return checkMoveAndTake(possible, destEl);
}

function queenOptions(x, y, pieceColor) {
    const available = [];
    available.push(...addDir(x, y, 1, 0));
    available.push(...addDir(x, y, -1, 0));
    available.push(...addDir(x, y, 0, 1));
    available.push(...addDir(x, y, 0, -1));

    available.push(...addDir(x, y, 1, 1));
    available.push(...addDir(x, y, 1, -1));
    available.push(...addDir(x, y, -1, 1));
    available.push(...addDir(x, y, -1, -1));

    return filterColor(available, pieceColor);
}

function kingMv(data, dest) {
    const destEl = get(dest);
    const pieceId = data.id;
    const pieceColor = getColor(pieceId);
    const [x, y] = parseData(data);

    const possible = kingOptions(x, y, pieceColor);

    const castling = checkCastling(get(pieceId));
    possible.push(...filterExists(castling));

    const valid = checkMoveAndTake(possible, destEl);
    if (valid) {
        get(pieceId).hasMoved = true;

        if (destEl === castling[0]) {
            const SHORTRKDIST = 3;
            const shortRk = getSq(x + SHORTRKDIST, y).firstChild;
            getSq(x + 1, y).appendChild(shortRk);
        }
        if (destEl === castling[1]) {
            const LONGRKDIST = -4;
            const longRk = getSq(x + LONGRKDIST, y).firstChild;
            getSq(x - 1, y).appendChild(longRk);
        }
    }
    return valid;
}

function kingOptions(x, y, pieceColor) {
    const id1 = makeId(x+1, y+1);
    const id2 = makeId(x+1, y);
    const id3 = makeId(x+1, y-1);

    const id4 = makeId(x, y+1);

    const id5 = makeId(x, y-1);

    const id6 = makeId(x-1, y+1);
    const id7 = makeId(x-1, y);
    const id8 = makeId(x-1, y-1);

    const ids = [id1, id2, id3, id4, id5, id6, id7, id8];

    const squares = getAll(ids);

    return filterColor(filterExists(squares), pieceColor);
}

function checkCastling(king) {
    if (king.hasMoved) {
        return [];
    }

    const [x, y] = parseId(king.parentElement.id);

    const short = checkShortCastle(x, y);
    const long = checkLongCastle(x, y);

    return [short, long];
}

function checkLongCastle(x, y) {
    const longSquare = getSq(x - 2, y);
    const longRk = getSq(x - 4, y);
    const rk2_mvd = checkRookMoved(longRk);

    const mid2_square1 = getSq(x - 1, y);
    const mid2_square2 = getSq(x - 2, y);
    const mid2_square3 = getSq(x - 3, y);
    const middle2_free = checkNoChildren([
        mid2_square1,
        mid2_square2,
        mid2_square3
    ]);

    let long = null;
    if (!rk2_mvd && middle2_free) {
        long = longSquare;
    }
    return long;
}

function checkShortCastle(x, y) {
    const shortSquare = getSq(x + 2, y);
    const shortRk = getSq(x + 3, y);
    const rk1_mvd = checkRookMoved(shortRk);

    const midSquare1 = getSq(x + 1, y);
    const midSquare2 = getSq(x + 2, y);
    const middleFree = checkNoChildren([midSquare1, midSquare2]);

    let short = null;
    if (!rk1_mvd && middleFree) {
        short = shortSquare;
    }
    return short;
}

function checkNoChildren(arr) {
    for (const el of arr) {
        if (el.hasChildNodes()) {
            return false;
        }
    }
    return true;
}

function checkRookMoved(rkSquare) {
    const potentialRook = rkSquare.firstChild;
    if (potentialRook !== null) {
        return potentialRook.hasMoved;
    }
    return true;
}

function checkMoveAndTake(possible, destEl) {
    if (possible.includes(destEl)) {
        tryTake(destEl);
        return true;
    }
    return false;
}

function tryTake(square) {
    if (square.hasChildNodes()) {
        if (getPiece(square.firstChild.id) === "k") {
            win(getColor(square.firstChild.id));
        }
        takePiece(square.firstChild);
    }
}

function win(loser) {
    const modalText = get("victory-text");
    const winner = {l: "Black", d: "White"}[loser];
    modalText.textContent = winner + " Wins!!!";
    modalText.parentElement.parentElement.style.display = "block";
}

function restart() {
    removePieces();
    addPieces();

    const modal = get("victory-modal");
    modal.style.display = "none";

    whitesTurn = true;
}

function takePiece(piece) {
    const map = {l: "BCP", d: "WCP"};
    const captured = get(map[getColor(piece.id)]);
    captured.appendChild(piece);
}


function filterColor(available, pieceColor) {
    const possible = [];
    for (const square of available) {
        if (square !== null) {
            const noChildren = !square.hasChildNodes();
            if (noChildren ||
                getColor(square.firstChild.id) !== pieceColor) {
                possible.push(square);
            }
        }
    }
    return possible;
}

function filterExists(squares) {
    const result = [];
    for (const square of squares) {
        if (square !== null) {
            result.push(square);
        }
    }
    return result;
}

function freeSquare(testNext) {
    if (testNext === null) {
        return false;
    }
    if (testNext.hasChildNodes()) {
        return false;
    }
    return true;
}

function parseData(data) {
    return parseId(data.origin);
}

function parseId(id) {
    if (id === null) {
        return [null, null];
    }

    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const x = invletters[id[0]];
    const rank = id[1];
    const y = parseInt(rank);
    return [x, y];
}

function getPawnDir(color) {
    const mapping = {l: 1, d: -1};
    return mapping[color];
}

function getOtherColor(color) {
    const map = {l: "d", d: "l"};
    return map[color];
}

function makeId(x, y) {
    return letters[x] + y.toString();
}

function getColor(id) {
    return id[3];
}

function getPiece(id) {
    return id[2];
}

function getSq(x, y) {
    return get(makeId(x, y));
}

function getAll(ids) {
    const squares = [];
    for (const id of ids) {
        squares.push(get(id));
    }
    return squares;
}

function get(id) {
    return document.getElementById(id);
}

window.onload = setup;
