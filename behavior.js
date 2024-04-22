const letters = "abcdefgh";


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
    const sqsize = get("a8").offsetHeight;
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
    }

    if (valid) {
        //await sleep(1000);
        //console.log("target: ", event.target);
        //console.log("id: ", data.id);
        //console.log("element: ", get(data.id));
        target.appendChild(get(data.id));
    }
}

function pawn_mv(data, dest) {
    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const colormap = {l: 1, d: -1};
    const dir = colormap[data.id[3]];

    const dest_el = get(dest);
    const origin_file = data.origin[0];
    const dest_file = dest[0];
    const origin_rank = data.origin[1];
    const dest_rank = dest[1];

    const next_rank = parseInt(origin_rank) + dir;

    // TODO: en passant and promotion

    //console.log(get(dest))
    if (check_capture_same_color(data.id, dest)) {
        return false;
    }

    if (dest_el.hasChildNodes()) {
        const hori_dist = (invletters[origin_file] - invletters[dest_file])**2;
        if (hori_dist === 1 && next_rank === parseInt(dest_rank)) {
            take_piece(dest_el.firstChild);
            return true;
        }
        return false;
    }
    if (origin_file === dest_file && next_rank === parseInt(dest_rank)) {
        return true;
    }
    if (data.origin === data.id.slice(0, 2) &&
        (next_rank + dir) === parseInt(dest_rank))
    {
        const three_or_six = (4.5-1.5*dir).toString();
        const rank_three_or_six_id = origin_file + three_or_six;
        //console.log("jumping: ", get(rank_three_or_six_id));
        //console.log("children: ", get(rank_three_or_six_id).children);
        if (!get(rank_three_or_six_id).hasChildNodes()) {
            return true;
        }
    }
    return false;
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
    if (possible.includes(get(dest))) {
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
    if (possible.includes(get(dest))) {
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

    if (possible.includes(get(dest))) {
        try_take(dest_el);
        return true;
    }
    return false;

}

function filter_color(available, piece_color) {
    const possible = [];
    for (const square of available) {
        if (square === null) {
            continue;
        }
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
    let x = origin_file;
    let y = parseInt(origin_rank);
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

function get(id) {
    return document.getElementById(id);
}


window.onload = setup;
