const letters = "abcdefgh";
const turns = false;

let whites_turn = true;


function setup() {
    setup_chess();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function min(a, b) {
    if (a > b) {
        return b;
    }
    return a;
}

function max(a, b) {
    if (a < b) {
        return b;
    }
    return a;
}

// https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces
// Credit to Colin M.L. Burnett for chess piece images
function setup_chess() {
    const board = get("board");

    for (let i=0; i<8; i++) {
        let row = document.createElement("div")
        row.id = i;
        row.style.display = "flex";
        row.style.flexDirection = "row";
        row.style.flexGrow = 1;
        row.style.flexBasis = 0;
        row.style.overflow = "hidden";
        row.className = "row";
        board.appendChild(row);

        for (let j=0; j<8; j++) {
            let square = document.createElement("div")
            square.id = letters[j] + (8-i).toString();

            square.style.flexGrow = 1;
            square.style.flexBasis = 0;
            square.style.textAlign = "center";
            square.className = "square";
            square.ondrop = drop;
            square.ondragover = allow_drop;
            row.appendChild(square);

            if ((i + j) % 2 == 0) {
                square.style.background = "white";
            } else {
                square.style.background = "SaddleBrown";
            }
        }
    }
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

function add_chess_piece(squareid, file) {
    // janky static variable
    if (!("size" in this)) {
        this.size = get(squareid).offsetWidth;
    }
    const filename = "Chess_" + file + "t45.svg.png";
    const square = get(squareid);
    const image = document.createElement("img");
    image.id = squareid + file;
    image.alt = file;
    image.draggable = true;
    image.ondragstart = drag;
    image.height = this.size;
    image.width = this.size;
    image.src = filename;
    square.appendChild(image);
}


function allow_drop(event) {
    event.preventDefault();
}

function drag(event) {
    const data = {
        id: event.target.id,
        origin: get(event.target.id).parentElement.id,
    }
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
            alert("Problem! Non-square target")
            console.log(event.target);
            console.log(event.target.id);
            console.log(event.target.classList);
        }
    }
    const target = get(dest)

    const white = data.id[3] === "l";

    if (whites_turn !== white && turns) {
        console.log("not your turn");
        return;
    }
    
    let valid = false;
    const piece = data.id[2];
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
    }

    if (valid) {
        //await sleep(1000);
        //console.log("target: ", event.target);
        //console.log("id: ", data.id);
        //console.log("element: ", get(data.id));
        target.appendChild(get(data.id));
    }
    whites_turn = !whites_turn;
}

function pawn_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = piece_id[3];
    const other_color = {"l": "d", "d": "l"}[piece_color];
    const dir = {"l": 1, "d": -1}[piece_color];

    [x, y] = parse_data(data);

    const forward_two = get(letters[x] + (y + dir).toString());
    let no_capture = [forward_two];

    const starting_square = data.id.slice(0, 2);
    if (data.origin === starting_square) {
        no_capture.push(get(letters[x] + (y + 2*dir).toString()));
    }

    no_capture = filter_color(no_capture, piece_color);
    no_capture = filter_color(no_capture, other_color);

    const yes_capture = pawn_options(x, y, dir);
    const viable = filter_color(yes_capture, piece_color);
    const possible = [];
    for (const square of viable) {
        if (square.hasChildNodes()) {
            possible.push(square);
        }
    }

    possible.push(...no_capture);

    return may_move_and_take(possible, dest_el);
}

function pawn_options(x, y, dir) {
    const id1 = letters[x + 1] + (y + dir).toString();
    const id3 = letters[x - 1] + (y + dir).toString();

    const ids = [id1, id3];

    const squares = [];
    for (const id of ids) {
        squares.push(get(id));
    }

    const result = [];
    for (const square of squares) {
        if (square !== null) {
            result.push(square);
        }
    }
    return result;
}


function rook_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = piece_id[3];

    const available = [];

    [x, y] = parse_data(data);

    available.push(...add_dir(x, y, 1, 0));
    available.push(...add_dir(x, y, -1, 0));
    available.push(...add_dir(x, y, 0, 1));
    available.push(...add_dir(x, y, 0, -1));

    const possible = filter_color(available, piece_color);

    //console.log(possible);
    //console.log(dest);
    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;
}

function bishop_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = piece_id[3];

    const available = [];

    [x, y] = parse_data(data);

    available.push(...add_dir(x, y, 1, 1));
    available.push(...add_dir(x, y, 1, -1));
    available.push(...add_dir(x, y, -1, 1));
    available.push(...add_dir(x, y, -1, -1));

    const possible = filter_color(available, piece_color);

    //console.log(possible);
    //console.log(dest);
    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;
}

function get_dest_color(dest_el) {
    if (dest_el.hasChildNodes()) {
        return dest_el.firstChild.id[3];
    }
    return null;
}

function add_dir(x, y, x_dir, y_dir) {
    const arr = [];
    let open = true;
    for (let i=1; i<8 && open; i++) {
        let next_id = letters[x + x_dir*i] + (y + y_dir*i).toString();
        let next = get(next_id);
        open = free_square(next);
        arr.push(next);
    }
    return arr;
}

function knight_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = piece_id[3];

    [x, y] = parse_data(data);

    const available = [];

    available.push(...knight_available(x, y, 1, 1));
    available.push(...knight_available(x, y, 1, -1));
    available.push(...knight_available(x, y, -1, 1));
    available.push(...knight_available(x, y, -1, -1));

    //console.log("av: ", available);
    
    const possible = filter_color(available, piece_color);
    //console.log("pos: ", possible);

    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;

}

function knight_available(x, y, dir1, dir2) {
    const id1 = letters[x + dir1*1] + (y + dir2*2).toString();
    const id2 = letters[x + dir1*2] + (y + dir2*1).toString();

    const square1 = get(id1);
    const square2 = get(id2);

    const result = [];
    if (square1 !== null) {
        result.push(square1);
    }
    if (square2 !== null) {
        result.push(square2);
    }
    return result;
}

function queen_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = piece_id[3];

    const available = [];

    [x, y] = parse_data(data);

    available.push(...add_dir(x, y, 1, 0));
    available.push(...add_dir(x, y, -1, 0));
    available.push(...add_dir(x, y, 0, 1));
    available.push(...add_dir(x, y, 0, -1));

    available.push(...add_dir(x, y, 1, 1));
    available.push(...add_dir(x, y, 1, -1));
    available.push(...add_dir(x, y, -1, 1));
    available.push(...add_dir(x, y, -1, -1));

    const possible = filter_color(available, piece_color);

    //console.log(possible);
    //console.log(dest);
    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;
}

function king_mv(data, dest) {
    const dest_el = get(dest);
    const piece_id = data.id;
    const piece_color = piece_id[3];

    [x, y] = parse_data(data);

    const available = king_options(x, y);

    const possible = filter_color(available, piece_color);

    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;
}

function king_options(x, y) {
    const id1 = letters[x + 1] + (y + 1).toString();
    const id2 = letters[x + 1] + (y).toString();
    const id3 = letters[x + 1] + (y - 1).toString();

    const id4 = letters[x] + (y + 1).toString();

    const id5 = letters[x] + (y - 1).toString();

    const id6 = letters[x - 1] + (y + 1).toString();
    const id7 = letters[x - 1] + (y).toString();
    const id8 = letters[x - 1] + (y - 1).toString();

    const ids = [id1, id2, id3, id4, id5, id6, id7, id8];

    const squares = [];

    for (const id of ids) {
        squares.push(get(id));
    }


    const result = [];
    for (const square of squares) {
        if (square !== null) {
            result.push(square);
        }
    }
    return result;
}

function filter_color(available, piece_color) {
    const possible = [];
    for (const square of available) {
        if (square === null) {
            continue;
        }
        //console.log("square: ", square);
        if (!square.hasChildNodes()) {
            possible.push(square);
            continue;
        }
        if (square.firstChild.id[3] !== piece_color) {
            possible.push(square);
        }
    }
    return possible;
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
    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const origin_file = invletters[data.origin[0]];
    const origin_rank = data.origin[1];
    const x = origin_file;
    const y = parseInt(origin_rank);
    return [x, y];
}

function check_capture_same_color(data_id, dest) {
    const dest_el = get(dest);
    if (dest_el.hasChildNodes()) {
        if (dest_el.firstChild.id[3] === data_id[3]) {
            return true;
        }
    }
}

function try_take(square) {
    if (square.hasChildNodes()) {
        take_piece(square.firstChild);
    }
}

function take_piece(piece) {
    const map = {"l": "BCP", "d": "WCP"};
    //console.log("PID: ", piece.id);
    const captured = get(map[piece.id[3]]);
    captured.appendChild(piece);
}

function may_move_and_take(possible, dest_el) {
    if (possible.includes(dest_el)) {
        try_take(dest_el);
        return true;
    }
    return false;
}


function get(id) {
    return document.getElementById(id);
}


window.onload = setup;
