
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
    const board = document.getElementById("board");
    const letters = "abcdefgh";

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
    const sqsize = document.getElementById("a8").offsetHeight;
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
        this.size = document.getElementById(squareid).offsetWidth;
    }
    const filename = "Chess_" + file + "t45.svg.png";
    const square = document.getElementById(squareid);
    const image = document.createElement("img");
    image.id = squareid + file;
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
        origin: document.getElementById(event.target.id).parentElement.id,
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
    const target = document.getElementById(dest)
    
    let valid = false;
    if (data.id[2] === "p") {
        valid = pawn_mv(data, dest);
    } else if (data.id[2] === "r") {
        valid = rook_mv(data, dest);
    } else if (data.id[2] === "b") {
        valid = bishop_mv(data, dest);
    }

    if (valid) {
        //await sleep(1000);
        //console.log("target: ", event.target);
        //console.log("id: ", data.id);
        //console.log("element: ", document.getElementById(data.id));
        target.appendChild(document.getElementById(data.id));
    }
}

function pawn_mv(data, dest) {
    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const colormap = {l: 1, d: -1};
    const dir = colormap[data.id[3]];

    const dest_el = document.getElementById(dest);
    const origin_file = data.origin[0];
    const dest_file = dest[0];
    const origin_rank = data.origin[1];
    const dest_rank = dest[1];

    const next_rank = parseInt(origin_rank) + dir;

    // TODO: en passant and promotion

    //console.log(document.getElementById(dest))
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
        //console.log("jumping: ", document.getElementById(rank_three_or_six_id));
        //console.log("children: ", document.getElementById(rank_three_or_six_id).children);
        if (!document.getElementById(rank_three_or_six_id).hasChildNodes()) {
            return true;
        }
    }
    return false;
}

function rook_mv(data, dest) {
    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const dest_el = document.getElementById(dest);
    const origin_file = invletters[data.origin[0]];
    const dest_file = invletters[dest[0]];
    const origin_rank = data.origin[1];
    const dest_rank = dest[1];

    if (check_capture_same_color(data.id, dest)) {
        return false;
    }

    const test1 = rook_checking(
        origin_rank, dest_rank,
        origin_file, dest_file,
        dest_el, vert_id_rook
    );
    if (test1 === true) {
        return true;
    } else if (test1 === false) {
        return false;
    }

    const test2 = rook_checking(
        origin_file, dest_file,
        origin_rank, dest_rank,
        dest_el, hori_id_rook
    );
    if (test2 === true) {
        return true;
    } else if (test2 === false) {
        return false;
    }
    return false;
}

function vert_id_rook(origin_rank, i) {
    const letters = "abcdefgh";
    return vert_id = letters[i] + origin_rank;
}
function hori_id_rook(origin_file, i) {
    const letters = "abcdefgh";
    return letters[origin_file] + i.toString();
}

function rook_checking(match1, match2, diff1, diff2, dest_el, id_func) {
    if (match1 === match2) {
        const start = min(diff1, diff2);
        const end = max(diff1, diff2);
        //console.log(start);
        //console.log(end);
        for (let i=start; i<end; i++) {
            let test_id = id_func(match1, i);
            //console.log(test_id);
            let test_el = document.getElementById(test_id);
            //console.log(test_el);
            if (test_el.hasChildNodes() && i !== start) {
                return false;
            }
        }
        if (dest_el.hasChildNodes()) {
            take_piece(dest_el.firstChild);
        }
        return true;
    }
    return null;
}

function bishop_mv(data, dest) {
    const invletters = {a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7};
    const dest_el = document.getElementById(dest);
    const origin_file = invletters[data.origin[0]];
    const dest_file = invletters[dest[0]];
    const origin_rank = data.origin[1];
    const dest_rank = dest[1];

    if (check_capture_same_color(data.id, dest)) {
        return false;
    }

    if (dest_file - origin_file === dest_rank - origin_rank) {
        const start = min(dest_file, origin_file);
        const end = max(diff1, diff2);
        //console.log(start);
        //console.log(end);
        for (let i=start; i<end; i++) {
            let test_id = id_func(match1, i);
            //console.log(test_id);
            let test_el = document.getElementById(test_id);
            //console.log(test_el);
            if (test_el.hasChildNodes() && i !== start) {
                return false;
            }
        }
        if (dest_el.hasChildNodes()) {
            take_piece(dest_el.firstChild);
        }
    }
}

function check_capture_same_color(data_id, dest) {
    const dest_el = document.getElementById(dest);
    if (dest_el.hasChildNodes()) {
        if (dest_el.firstChild.id[3] === data_id[3]) {
            return true;
        }
    }
}

function take_piece(piece) {
    const map = {"l": "BCP", "d": "WCP"};
    //console.log("PID: ", piece.id);
    const captured = document.getElementById(map[piece.id[3]]);
    captured.appendChild(piece);
}


window.onload = setup;
