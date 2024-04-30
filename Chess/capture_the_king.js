"use strict";

const letters = "abcdefgh";
const turns = true;

let whites_turn = true;
let en_passant = null;


function setup() {
    setup_chess();
}

// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
// Credit to Colin M.L. Burnett for chess piece images
function setup_chess() {
    const board = get("board");

    for (let i = 0; i < 8; i++) {
        const row = make_row(i);
        board.appendChild(row);
    }
    add_pieces();

    get("restart").onclick = restart;



    //win("l");
}

function add_pieces() {
    add_chess_piece("a8", "rd");
    add_chess_piece("b8", "nd");
    add_chess_piece("c8", "bd");
    add_chess_piece("d8", "qd");
    add_chess_piece("e8", "kd");
    add_chess_piece("f8", "bd");
    add_chess_piece("g8", "nd");
    add_chess_piece("h8", "rd");
    add_chess_piece("a7", "pd");
    add_chess_piece("b7", "pd");
    add_chess_piece("c7", "pd");
    add_chess_piece("d7", "pd");
    add_chess_piece("e7", "pd");
    add_chess_piece("f7", "pd");
    add_chess_piece("g7", "pd");
    add_chess_piece("h7", "pd");

    add_chess_piece("a1", "rl");
    add_chess_piece("b1", "nl");
    add_chess_piece("c1", "bl");
    add_chess_piece("d1", "ql");
    add_chess_piece("e1", "kl");
    add_chess_piece("f1", "bl");
    add_chess_piece("g1", "nl");
    add_chess_piece("h1", "rl");
    add_chess_piece("a2", "pl");
    add_chess_piece("b2", "pl");
    add_chess_piece("c2", "pl");
    add_chess_piece("d2", "pl");
    add_chess_piece("e2", "pl");
    add_chess_piece("f2", "pl");
    add_chess_piece("g2", "pl");
    add_chess_piece("h2", "pl");
}

function remove_pieces() {
    const board = get("board");
    for (const row of board.children) {
        for (const square of row.children) {
            square.replaceChildren();
        }
    }
    get("BCP").replaceChildren();
    get("WCP").replaceChildren();
}

function make_row(i) {
    const row = document.createElement("div");
    row.id = i;
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.flexGrow = 1;
    row.style.flexBasis = 0;
    row.style.overflow = "hidden";
    row.className = "row";

    for (let j = 0; j < 8; j++) {
        const square = make_square(j, i);
        row.appendChild(square);
    }
    return row;
}

function make_square(j, i) {
    const square = document.createElement("div");
    square.id = make_id(j, 8 - i);

    square.style.flexGrow = 1;
    square.style.flexBasis = 0;
    square.style.textAlign = "center";
    square.style.aspectRatio = "1/1";
    square.className = "square";
    square.ondrop = drop;
    square.ondragover = allow_drop;

    if ((i + j) % 2 === 0) {
        square.style.background = "#F0EAD6";
    } else {
        square.style.background = "SaddleBrown";
    }
    return square;
}

function add_chess_piece(squareid, piece) {
    const size = get(squareid).offsetWidth - 1;
    const filename = "Chess_" + piece + "t45.svg.png";
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
        image.has_moved = false;
    }

    square.appendChild(image);
}

function allow_drop(event) {
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

    const color = get_color(data.id);
    const piece = get_piece(data.id);

    const white = color === "l";

    const your_turn = whites_turn === white || !turns;
    if (your_turn) {
        const valid = check_valid(data, dest);

        if (valid) {
            if (piece !== "p") {
                en_passant = null;
            }
            target.appendChild(get(data.id));
            whites_turn = !whites_turn;
        }
    } else {
        console.log("not your turn");
        // early return would be good here instead of the if-else
    }
}

function check_valid(data, dest) {
    let valid = false;
    const piece = get_piece(data.id);
    if (piece === "p") {
        valid = pawn_mv(data, dest);
    } else if (piece === "r") {
        valid = rook_mv(data, dest);
    } else if (piece === "b") {
        valid = bishop_mv(data, dest);
    } else if (piece === "n") {
        valid = knight_mv(data, dest);
    } else if (piece === "q") {
        valid = queen_mv(data, dest);
    } else if (piece === "k") {
        valid = king_mv(data, dest);
    } else {
        alert("unknown piece!");
        console.log("piece: ", piece);
        console.log("id: ", data.id);
        console.log("data: ", data);
    }
    return valid;
}

function pawn_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = get_color(piece_id);
    const dir = get_pawn_dir(piece_color);

    const [x, y] = parse_data(data);

    const yes_capture = pawn_options(x, y, dir);
    const viable = filter_color(yes_capture, piece_color);
    const possible = filter_pawn_captures(viable, dir);

    const forward_two_id = make_id(x, y + 2*dir);
    const forward_two = get(forward_two_id);

    const no_capture = forward_moves(x, y, dir, data, forward_two, piece_color);

    possible.push(...no_capture);

    const en_passant_square = get(en_passant);

    const [dest_x, dest_y] = parse_id(dest);
    const test_en_passant_square = get_sq(dest_x, dest_y - dir);
    if (test_en_passant_square === en_passant_square) {
        try_take(en_passant_square);
    }

    const valid = check_move_and_take(possible, dest_el);

    if (valid) {
        if (dest_el === forward_two) {
            en_passant = forward_two_id;
        } else {
            en_passant = null;
        }

        if (dest_y === 1 || dest_y === 8) {
            const promotion_modal = get("promotion-modal-" + piece_color);
            promotion_modal.style.display = "block";

            make_promotion_options(piece_color, get(piece_id));
        }
    }

    return valid;
}

function forward_moves(x, y, dir, data, forward_two, piece_color) {
    const other_color = get_other_color(piece_color);
    const forward = get_sq(x, y + dir);
    const forward_options = [forward];

    const starting_square = data.id.slice(0, 2);
    if (data.origin === starting_square) {
        forward_options.push(forward_two);
    }

    const no_capture_self = filter_color(forward_options, piece_color);
    const no_capture = filter_color(no_capture_self, other_color);
    return no_capture;
}

function filter_pawn_captures(viable, dir) {
    const possible = [];
    for (const square of viable) {
        const en_passant_cond = check_en_passant(square.id, en_passant, dir);
        if (square.hasChildNodes() || en_passant_cond) {
            possible.push(square);
        }
    }
    return possible;
}

function pawn_options(x, y, dir) {
    const id1 = make_id(x+1, y+dir);
    const id3 = make_id(x-1, y+dir);
    const ids = [id1, id3];
    const squares = get_all(ids);
    return filter_exists(squares);
}

function check_en_passant(square_id, en_passant, dir) {
    const [en_passant_x, en_passant_y] = parse_id(en_passant);
    const [square_x, square_y] = parse_id(square_id);
    return en_passant_x === square_x && (square_y - dir) === en_passant_y;
}

function make_promotion_options(color, pawn) {
    const modal_display = get("modal-display-" + color);
    for (const letter of "qrbn") {
        modal_display.appendChild(make_promotion_option(letter + color, pawn));
    }
}

function make_promotion_option(piece, pawn) {
    const button = document.createElement("button");
    button.id = "button_" + piece;

    const filename = "Chess_" + piece + "t45.svg.png";
    const image = make_promotion_image(piece, filename);
    button.appendChild(image);

    const [x, y] = parse_id(pawn.parentElement.id);
    const color = get_color(pawn.id);
    const dir = get_pawn_dir(color);

    const modal_display = get("modal-display-" + color);

    function promote_pawn() {
        pawn.src = filename;
        pawn.id = make_id(x, y + dir) + piece;
        pawn.alt = piece;

        modal_display.replaceChildren();
        modal_display.parentElement.style.display = "none";
    }
    button.onclick = promote_pawn;

    return button;
}

function make_promotion_image(piece, filename) {
    const size = get_sq(0, 1).offsetWidth - 1;
    const image = document.createElement("img");

    image.id = "promotion_" + piece;
    image.alt = piece;
    image.height = size;
    image.width = size;
    image.src = filename;
    return image;
}

function rook_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = get_color(piece_id);

    const [x, y] = parse_data(data);

    const possible = rook_options(x, y, piece_color);

    const valid = check_move_and_take(possible, dest_el);
    if (valid) {
        get(piece_id).has_moved = true;
    }
    return valid;
}

function rook_options(x, y, piece_color) {
    const available = [];
    available.push(...add_dir(x, y, 1, 0));
    available.push(...add_dir(x, y, -1, 0));
    available.push(...add_dir(x, y, 0, 1));
    available.push(...add_dir(x, y, 0, -1));

    return filter_color(available, piece_color);
}

function bishop_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = get_color(piece_id);

    const [x, y] = parse_data(data);

    const possible = bishop_options(x, y, piece_color);

    //console.log(possible);
    //console.log(dest);
    return check_move_and_take(possible, dest_el);
}

function bishop_options(x, y, piece_color) {
    const available = [];
    available.push(...add_dir(x, y, 1, 1));
    available.push(...add_dir(x, y, 1, -1));
    available.push(...add_dir(x, y, -1, 1));
    available.push(...add_dir(x, y, -1, -1));

    return filter_color(available, piece_color);
}

function add_dir(x, y, x_dir, y_dir) {
    const arr = [];
    let open = true;
    let i = 1;
    while (i < 8 && open) {
        const next_id = make_id(x + x_dir * i, y + y_dir * i);
        const next = get(next_id);
        open = free_square(next);
        arr.push(next);
        i++;
    }
    return arr;
}

function knight_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = get_color(piece_id);

    const [x, y] = parse_data(data);

    const possible = knight_options(x, y, piece_color);

    //console.log("pos: ", possible);
    return check_move_and_take(possible, dest_el);
}

function knight_options(x, y, piece_color) {
    const available = [];
    available.push(...knight_available(x, y, 1, 1));
    available.push(...knight_available(x, y, 1, -1));
    available.push(...knight_available(x, y, -1, 1));
    available.push(...knight_available(x, y, -1, -1));

    //console.log("av: ", available);
    return filter_color(available, piece_color);
}

function knight_available(x, y, x_dir, y_dir) {
    const id1 = make_id(x + x_dir, y + y_dir * 2);
    const id2 = make_id(x + x_dir * 2, y + y_dir);
    const ids = [id1, id2];
    const squares = get_all(ids);
    return filter_exists(squares);
}

function queen_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = get_color(piece_id);

    const [x, y] = parse_data(data);

    const possible = queen_options(x, y, piece_color);

    //console.log(possible);
    //console.log(dest);
    return check_move_and_take(possible, dest_el);
}

function queen_options(x, y, piece_color) {
    const available = [];
    available.push(...add_dir(x, y, 1, 0));
    available.push(...add_dir(x, y, -1, 0));
    available.push(...add_dir(x, y, 0, 1));
    available.push(...add_dir(x, y, 0, -1));

    available.push(...add_dir(x, y, 1, 1));
    available.push(...add_dir(x, y, 1, -1));
    available.push(...add_dir(x, y, -1, 1));
    available.push(...add_dir(x, y, -1, -1));

    return filter_color(available, piece_color);
}

function king_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = get_color(piece_id);

    const [x, y] = parse_data(data);

    const possible = king_options(x, y, piece_color);

    const castling = check_castling(get(piece_id));

    possible.push(...filter_exists(castling));

    const valid = check_move_and_take(possible, dest_el);
    if (valid) {
        get(piece_id).has_moved = true;

        if (dest_el === castling[0]) {
            const SHORT_RK_DIST = 3;
            const short_rk = get_sq(x + SHORT_RK_DIST, y).firstChild;
            get_sq(x + 1, y).appendChild(short_rk);
        }
        if (dest_el === castling[1]) {
            const LONG_RK_DIST = -4;
            const long_rk = get_sq(x + LONG_RK_DIST, y).firstChild;
            get_sq(x - 1, y).appendChild(long_rk);
        }
    }
    return valid;
}

function king_options(x, y, piece_color) {
    const id1 = make_id(x+1, y+1);
    const id2 = make_id(x+1, y);
    const id3 = make_id(x+1, y-1);

    const id4 = make_id(x, y+1);

    const id5 = make_id(x, y-1);

    const id6 = make_id(x-1, y+1);
    const id7 = make_id(x-1, y);
    const id8 = make_id(x-1, y-1);

    const ids = [id1, id2, id3, id4, id5, id6, id7, id8];

    const squares = get_all(ids);

    return filter_color(filter_exists(squares), piece_color);
}

function check_castling(king) {
    if (king.has_moved) {
        return [];
    }

    const [x, y] = parse_id(king.parentElement.id);

    const short = check_short_castle(x, y);
    const long = check_long_castle(x, y);

    return [short, long];
}

function check_long_castle(x, y) {
    const long_square = get_sq(x - 2, y);
    const long_rk = get_sq(x - 4, y);
    const rk2_mvd = check_rook_moved(long_rk);

    const mid2_square1 = get_sq(x - 1, y);
    const mid2_square2 = get_sq(x - 2, y);
    const mid2_square3 = get_sq(x - 3, y);
    const middle2_free = check_no_children([
        mid2_square1,
        mid2_square2,
        mid2_square3
    ]);

    let long = null;
    if (!rk2_mvd && middle2_free) {
        long = long_square;
    }
    return long;
}

function check_short_castle(x, y) {
    const short_square = get_sq(x + 2, y);
    const short_rk = get_sq(x + 3, y);
    const rk1_mvd = check_rook_moved(short_rk);

    const mid_square1 = get_sq(x + 1, y);
    const mid_square2 = get_sq(x + 2, y);
    const middle_free = check_no_children([mid_square1, mid_square2]);

    let short = null;
    if (!rk1_mvd && middle_free) {
        short = short_square;
    }
    return short;
}

function check_no_children(arr) {
    for (const el of arr) {
        if (el.hasChildNodes()) {
            return false;
        }
    }
    return true;
}

function check_rook_moved(rk_square) {
    const potential_rook = rk_square.firstChild;
    if (potential_rook !== null) {
        return potential_rook.has_moved;
    }
    return true;
}

function check_move_and_take(possible, dest_el) {
    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;
}

function try_take(square) {
    if (square.hasChildNodes()) {
        if (get_piece(square.firstChild.id) === "k") {
            win(get_color(square.firstChild.id));
        }
        take_piece(square.firstChild);
    }
}

function win(loser) {
    const modal_text = get("victory-text");
    const winner = {l: "Black", d: "White"}[loser];
    modal_text.textContent = winner + " Wins!!!";
    modal_text.parentElement.parentElement.style.display = "block";
}

function restart() {
    remove_pieces();
    add_pieces();

    const modal = get("victory-modal");
    modal.style.display = "none";
}

function take_piece(piece) {
    const map = {l: "BCP", d: "WCP"};
    //console.log("PID: ", piece.id);
    const captured = get(map[get_color(piece.id)]);
    captured.appendChild(piece);
}


function filter_color(available, piece_color) {
    const possible = [];
    for (const square of available) {
        //console.log("square: ", square);
        if (square !== null) {
            const no_children = !square.hasChildNodes();
            if (no_children ||
                get_color(square.firstChild.id) !== piece_color) {
                possible.push(square);
            }
        }
    }
    return possible;
}

function filter_exists(squares) {
    const result = [];
    for (const square of squares) {
        if (square !== null) {
            result.push(square);
        }
    }
    return result;
}

function free_square(test_next) {
    if (test_next === null) {
        return false;
    }
    if (test_next.hasChildNodes()) {
        return false;
    }
    return true;
}

function parse_data(data) {
    return parse_id(data.origin);
}

function parse_id(id) {
    if (id === null) {
        return [null, null];
    }

    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const x = invletters[id[0]];
    const rank = id[1];
    const y = parseInt(rank);
    return [x, y];
}

function get_pawn_dir(color) {
    const mapping = {l: 1, d: -1};
    return mapping[color];
}

function get_other_color(color) {
    const map = {l: "d", d: "l"};
    return map[color];
}

function make_id(x, y) {
    return letters[x] + y.toString();
}

function get_color(id) {
    return id[3];
}

function get_piece(id) {
    return id[2];
}

function get_sq(x, y) {
    return get(make_id(x, y));
}

function get_all(ids) {
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
