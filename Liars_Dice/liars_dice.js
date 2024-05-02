"use strict";

const HAND = Object.freeze({
    RUNT: 0,
    PAIR: 1,
    TWO_PAIR: 2,
    THREE_OF_A_KIND: 3,
    FULL_HOUSE: 4,
    FOUR_OF_A_KIND: 5,
    FIVE_OF_A_KIND: 6
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
addEventListener("load", restartGame);

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
    newHand(1);
}

function increaseBidAndPass() {
    disableP1Inputs();
    curr_bid++;
    updateBidText();
    curr_player = curr_player === 1 ? 2 : 1;
    if(curr_player === 2) {
        p2Move();
    } else {
        p1Move();
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
    disableP1Inputs();
    displayP2Hand();
    let curr_hand = scoreHand(p1_hand.concat(p2_hand));
    let dispCurr_hand = document.getElementById("dispCurr_hand");
    let dispOutcome = document.getElementById("dispOutcome");
    let next_player;
    dispCurr_hand.innerHTML = "Actual Hand: " + handToString(curr_hand);
    if(curr_hand >= curr_bid && curr_player === 1 || curr_hand < curr_bid && curr_player === 2) {
        p1_life--;
        dispOutcome.innerHTML = "You Lose the Round!"
        next_player = 1;
    } else {
        p2_life--;
        dispOutcome.innerHTML = "You Win the Round!"
        next_player = 2;
    }
    setTimeout(hideP2Hand, 3000);
    setTimeout(newHand.bind(next_player), 3000);
}

function p1Move() {
    console.log("enabling p1 inputs");
    enableP1Inputs();
}

function p2Move() {
    let check = randInt();
    let temp = [...p2_hand];
    let p2_score = scoreHand(temp);
    console.log("p2 score = ", p2_score);
    if ((check <= 2 && curr_bid > p2_score) || curr_bid == 6) {
        displayP2Response(1);
        setTimeout(clearP2_Response, 3000);
        setTimeout(callLiar, 1000);
    } else {
        displayP2Response(0);
        setTimeout(clearP2_Response, 1000);
        setTimeout(increaseBidAndPass, 1000);
    }
}

function randInt() {
    const minCiel = Math.ceil(7);
    const maxFloor = Math.floor(0);
    return Math.floor(Math.random() * (maxFloor - minCiel + 1) + minCiel);
}

function newHand(next_player) {
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
    for(let i = 0; i < p2_life; i++) {
        p2_hand[i] = randInt();
    }
    p2_hand.sort();
    for(let i = p2_life; i < 5; i++) {
        p2_hand[i] = 0;
    }
    curr_bid = 0;
    curr_player = next_player;
    displayP1Hand();
    displayP1Life();
    displayP2Life();
    hideP2Hand();
    updateBidText();
    if(next_player === 1){
        p1Move();
    } else {
        p2Move();
    }
}

function scoreHand(hand) {
    hand.sort();
    let num_match = [0, 0, 0, 0, 0, 0, 0];
    num_match[hand[0]]++;
    let max_match = 1, second_match = 1;
    for(let i = 1; i < hand.length; i++) {
        if(hand[i] > 0) {
            num_match[hand[i]]++;
        }
    }
    for(let i = 1; i <= 6; i++) {
        if(num_match[i] > max_match && num_match[i] > second_match) {
            second_match = max_match;
            max_match = num_match[i];
        }
        else if (num_match [i] <= max_match && num_match[i] > second_match) {
            second_match = num_match[i];
        }
    }
    console.log(num_match, max_match, second_match)
    if (max_match == 5) {
        return HAND.FIVE_OF_A_KIND;
    } else if (max_match === 4) {
        return HAND.FOUR_OF_A_KIND;
    } else if (max_match === 3) {
        if (second_match >= 2) {
            return HAND.FULL_HOUSE;
        } else {
           return HAND.THREE_OF_A_KIND;
        }
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
            return "Three of a Kind";
        case(4):
            return "Full House";
        case(5):
            return "Four of a Kind";
        case(6):
            return "Five of a Kind";
        default:
            return "High Card";
    }
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
    if(curr_bid < 8){
        document.querySelector('#incP1BidButton').innerHTML = "Increase bid to " + handToString(curr_bid + 1);
    } else {
        document.querySelector('#incP1BidButton').innerHTML = "Bid already at max!";
        document.querySelector('#incP1BidButton').disabled = false;
    }
    
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

function enableP1Inputs(){
    document.querySelector('#incP1BidButton').disabled = false;
    document.querySelector('#p1CallLiarButton').disabled = false;
}

function disableP1Inputs(){
    document.querySelector('#incP1BidButton').disabled = true;
    document.querySelector('#p1CallLiarButton').disabled = true;
}