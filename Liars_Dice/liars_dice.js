const HAND = Object.freeze({
    RUNT: 0,
    PAIR: 1,
    TWO_PAIR: 2,
    SMALL_STRAIGHT: 3,
    THREE_OF_A_KIND: 4,
    FULL_HOUSE: 5,
    LARGE_STRAIGHT: 6,
    FOUR_OF_A_KIND: 7,
    FIVE_OF_A_KIND: 8
});

let p1_hand = [0, 0, 0, 0, 0];
let p2_hand = [0, 0, 0, 0, 0];
let p1_life = 0;
let p2_life = 0;
let curr_bid = 1;
let curr_player = 1;

var p1_disphand = [];
var p2_disphand = [];

var p1_displife = 0;
var p2_displife = 0;
var dispCurr_bid = 0;

addEventListener("load", initDispElements);

function initDispElements() {
    p1_disphand.push(document.getElementById("p1_hand_0"));
    p1_disphand.push(document.getElementById("p1_hand_1"));
    p1_disphand.push(document.getElementById("p1_hand_2"));
    p1_disphand.push(document.getElementById("p1_hand_3"));
    p1_disphand.push(document.getElementById("p1_hand_4"));
    p2_disphand.push(document.getElementById("p2_hand_0"));
    p2_disphand.push(document.getElementById("p2_hand_1"));
    p2_disphand.push(document.getElementById("p2_hand_2"));
    p2_disphand.push(document.getElementById("p2_hand_3"));
    p2_disphand.push(document.getElementById("p2_hand_4"));
    console.log("disphands initialized");
}

function restartGame() {
    p1_life = 5;
    p2_life = 5;
    newHand();
    curr_bid = 1;
    curr_player = 1;
}

function increaseBidAndPass() {
    curr_bid++;
    updateBidText();
    curr_player = curr_player === 1 ? 2 : 1;
    if(curr_player === 2) {
        p2Move();
        
    }
}

function displayP1Hand() {
    for(let i = 0; i < 5; i++){
        p1_disphand[i].src = numToDiceImage(p1_hand[i]);
    }
}

function displayP1Life() {
    p1_displife = document.getElementById("p1_life_count");
    p1_displife.innerHTML = p1_life;
}

function hideP2Hand() {
    for(let i = 0; i < p2_life; i++){
        p2_disphand[i].src = "dice_unknown.png";
    }
    for(let i = p2_life; i < 5; i++){
        p2_disphand[i].src = "dice_0.png"
    }
}

function displayP2Hand() {
    for(let i = 0; i < 5; i++){
        p2_disphand[i].src = numToDiceImage(p2_hand[i]);
    }
}

function numToDiceImage(n) {
    switch(n){
        case 0:
            return "dice_0.png";
        case 1:
            return "dice_1.png";
        case 2:
            return "dice_2.png";
        case 3:
            return "dice_3.png";
        case 4:
            return "dice_4.png";
        case 5:
            return "dice_5.png";
        case 6:
            return "dice_6.png";
        default:
            return "dice_unknown.png";
    }
}

function displayP2Life() {
    p2_displife = document.getElementById("p2_life_count");
    p2_displife.innerHTML = p2_life;
}

function callLiar() {
    displayP2Hand();
    let curr_hand = getBestHand();
    let dispCurr_hand = document.getElementById("dispCurr_hand");
    let dispOutcome = document.getElementById("dispOutcome");
    dispCurr_hand.innerHTML = "Actual Hand: " + handToString(curr_hand);
    if(curr_hand >= curr_bid && curr_player === 1 || curr_hand < curr_bid && curr_player === 2) {
        p1_life--;
        dispOutcome.innerHTML = "You Lose the Round!"
    } else {
        p2_life--;
        dispOutcome.innerHTML = "You Win the Round!"
    }
    setTimeout(hideP2Hand, 3000);
    setTimeout(newHand, 3000);
}

function p2Move() {
    check = randInt();
    if (check <= 2 ) {
        displayP2Response(1);
        callLiar();
        setTimeout(clearP2_Response, 3000);
    } else {
        displayP2Response(0);
        increaseBidAndPass();
        setTimeout(clearP2_Response, 1000);
    }
}

function randInt() {
    const minCiel = Math.ceil(7);
    const maxFloor = Math.floor(0);
    return Math.floor(Math.random() * (maxFloor - minCiel + 1) + minCiel);
}

function newHand() {
    if(p1_life === 0 || p2_life === 0) {
        restartGame();
    }
    clearRoundEndText();
    p1_hand = [99, 99, 99, 99, 99];
    p2_hand = [99, 99, 99, 99, 99];
    for(let i = 0; i < p1_life; i++) {
        p1_hand[i] = randInt();
    }
    p1_hand.sort();
    for(let i = p1_life; i < 5; i++) {
        p1_hand[i] = 0;
    }
    for(let i = 0; i < 5; i++) {
        if (i < p2_life){
            p2_hand[i] = randInt();
        }
    }
    p2_hand.sort();
    for(let i = p2_life; i < 5; i++) {
        p2_hand[i] = 0;
    }
    curr_bid = 1;
    curr_player = 1;
    displayP1Hand();
    displayP1Life();
    displayP2Life();
    hideP2Hand();
    updateBidText();
}

function getBestHand() {
    combineHand = p1_hand.concat(p2_hand);
    combineHand.sort();
    let num_match = [0, 0, 0, 0, 0, 0, 0];
    num_match[combineHand[0]]++;
    let max_match = 1, second_match = 1, curr_straight = 1, max_straight = 1;
    for(let i = 1; i < p1_life + p2_life; i++) {
        if(combineHand[i] > 0) {
            num_match[combineHand[i]]++;
        }
        if (combineHand[i] === combineHand[i - 1] + 1){
            curr_straight++;
            if(curr_straight > max_straight) {
                max_straight = curr_straight;
            }
        } else {
            curr_straight = 1;
        }
    }
    for(let i = 1; i <= 6; i++) {
        if(num_match[i] > max_match && num_match[i] > second_match) {
            max_match = num_match[i];
            second_match = max_match;
        }
        else if (num_match [i] < max_match && num_match[i] > second_match) {
            second_match = num_match[i];
        }
    }
    if (max_match >= 5) {
        return HAND.FIVE_OF_A_KIND;
    } else if (max_match === 4) {
        return HAND.FOUR_OF_A_KIND;
    } else if (max_straight >= 5) {
        return HAND.LARGE_STRAIGHT;
    } else if (max_match === 3) {
        if (second_match >= 2) {
            return HAND.FULL_HOUSE;
        } else {
           return HAND.THREE_OF_A_KIND;
        }
    } else if (max_straight === 4) {
        return HAND.SMALL_STRAIGHT;
    } else if (max_match === 2) {
        if (second_match === 2) {
            return HAND.TWO_PAIR;
        } else {
            return HAND.PAIR;
        }
    } else {
        return HAND.RUNT;
    }
}

function handToString(h) {
    switch(h) {
        case(1):
            return "Pair";
        case(2):
            return "Two Pair";
        case(3):
            return "Small Straight";
        case(4):
            return "Three of a Kind";
        case(5):
            return "Full House";
        case(6):
            return "Large Straight";
        case(7):
            return "Four of a Kind";
        case(8):
            return "Five of a Kind";
        default:
            return "High Card";
    }
}

function test_getBestHand() {
    console.log(getBestHand());
}

function reduceP1_Life() {
    p1_life--;
}

function reduceP2_Life() {
    p2_life--;
    console.log(p2_life);
}

function displayP2Response(r) {
    let p2_response = document.getElementById("p2_response");
    if(r == 0) {
        p2_response.innerHTML = handToString(curr_bid + 1);
    } else {
        p2_response.innerHTML = "Liar!";
    }
}

function clearP2_Response() {
    let p2_response = document.getElementById("p2_response");
    p2_response.innerHTML = "&#10;&#13;";
}

function updateBidText() {
    dispCurr_bid = document.getElementById("curr_bid");
    dispCurr_bid.innerHTML = handToString(curr_bid);
    document.querySelector('#increaseBidButton').value = "Increase bid to " + handToString(curr_bid + 1);
}

function clearRoundEndText() {
    let dispCurr_hand = document.getElementById("dispCurr_hand");
    let dispOutcome = document.getElementById("dispOutcome");
    dispOutcome.innerHTML = "";
    dispCurr_hand.innerHTML = "";
}

function logGameState() {
    console.log(p1_life, p1_hand);
    console.log(p2_life, p2_hand);
    console.log(curr_bid, curr_player);
}