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

let p1Hand = [0, 0, 0, 0, 0];
let p2Hand = [0, 0, 0, 0, 0];
let p1Life = 0;
let p2Life = 0;
let currBid = 1;
let currPlayer = 1;

var p1Disphand = [];
var p2Disphand = [];

var p1Displife = 0;
var p2Displife = 0;
var dispCurrBid = 0;

addEventListener("load", initDispElements);
addEventListener("load", restartGame);

function initDispElements() {
    p1Disphand.push(document.getElementById("p1_hand_0"));
    p1Disphand.push(document.getElementById("p1_hand_1"));
    p1Disphand.push(document.getElementById("p1_hand_2"));
    p1Disphand.push(document.getElementById("p1_hand_3"));
    p1Disphand.push(document.getElementById("p1_hand_4"));
    p2Disphand.push(document.getElementById("p2_hand_0"));
    p2Disphand.push(document.getElementById("p2_hand_1"));
    p2Disphand.push(document.getElementById("p2_hand_2"));
    p2Disphand.push(document.getElementById("p2_hand_3"));
    p2Disphand.push(document.getElementById("p2_hand_4"));
    console.log("disphands initialized");
}

function restartGame() {
    p1Life = 5;
    p2Life = 5;
    newHand(1);
}

function increaseBidAndPass() {
    disableP1Inputs();
    currBid++;
    updateBidText();
    currPlayer = currPlayer === 1 ? 2 : 1;
    if(currPlayer === 2) {
        p2Move();
    } else {
        p1Move();
    }
}

function displayP1Hand() {
    for(let i = 0; i < 5; i++){
        p1Disphand[i].src = numToDiceImage(p1Hand[i]);
    }
}

function displayP1Life() {
    p1Displife = document.getElementById("p1_life_count");
    p1Displife.textContent = p1Life;
}

function hideP2Hand() {
    for(let i = 0; i < p2Life; i++){
        p2Disphand[i].src = "dice_unknown.png";
    }
    for(let i = p2Life; i < 5; i++){
        p2Disphand[i].src = "dice_0.png"
    }
}

function displayP2Hand() {
    for(let i = 0; i < 5; i++){
        p2Disphand[i].src = numToDiceImage(p2Hand[i]);
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
    p2Displife = document.getElementById("p2_life_count");
    p2Displife.textContent = p2Life;
}

function callLiar() {
    disableP1Inputs();
    displayP2Hand();
    let currHand = scoreHand(p1Hand.concat(p2Hand));
    let dispCurrHand = document.getElementById("dispCurr_hand");
    let dispOutcome = document.getElementById("dispOutcome");
    let nextPlayer;
    dispCurrHand.textContent = "Actual Hand: " + handToString(currHand);
    if(currHand >= currBid && currPlayer === 1 || currHand < currBid && currPlayer === 2) {
        p1Life--;
        dispOutcome.textContent = "You Lose the Round!"
        nextPlayer = 1;
    } else {
        p2Life--;
        dispOutcome.textContent = "You Win the Round!"
        nextPlayer = 2;
    }

    setTimeout(hideP2Hand, 3000);
    setTimeout(newHand.bind(nextPlayer), 3000);
}

function p1Move() {
    console.log("enabling p1 inputs");
    enableP1Inputs();
}

function p2Move() {
    let check = randInt();
    let temp = [...p2Hand];
    let p2Score = scoreHand(temp);
    console.log("p2 score = ", p2Score);
    if ((check <= 2 && currBid > p2Score) || currBid == 6) {
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
    const max = 6;
    const min = 1;
    return Math.floor(Math.random() * max + min);
}

function newHand(nextPlayer) {
    if(p1Life === 0 || p2Life === 0) {
        if(p1Life == 0) {
            document.getElementById("dispOutcome").innerHTML = "YOU LOSE!";
        } else if (p2Life == 0) {
            document.getElementById("dispOutcome").innerHTML = "YOU WIN!";
        }
        setTimeout(restartGame, 3000);
        return;
    }
    clearRoundEndText();
    p1Hand = [99, 99, 99, 99, 99];
    p2Hand = [99, 99, 99, 99, 99];
    for(let i = 0; i < p1Life; i++) {
        p1Hand[i] = randInt();
    }
    p1Hand.sort();
    for(let i = p1Life; i < 5; i++) {
        p1Hand[i] = 0;
    }
    for(let i = 0; i < p2Life; i++) {
        p2Hand[i] = randInt();
    }
    p2Hand.sort();
    for(let i = p2Life; i < 5; i++) {
        p2Hand[i] = 0;
    }
    currBid = 0;
    currPlayer = nextPlayer;
    displayP1Hand();
    displayP1Life();
    displayP2Life();
    hideP2Hand();
    updateBidText();
    if(nextPlayer === 1){
        p1Move();
    } else {
        p2Move();
    }
}

function scoreHand(hand) {
    hand.sort();
    let numMatch = [0, 0, 0, 0, 0, 0, 0];
    numMatch[hand[0]]++;
    let maxMatch = 1, secondMatch = 1;
    for(let i = 1; i < hand.length; i++) {
        if(hand[i] > 0) {
            numMatch[hand[i]]++;
        }
    }
    for(let i = 1; i <= 6; i++) {
        if(numMatch[i] > maxMatch && numMatch[i] > secondMatch) {
            secondMatch = maxMatch;
            maxMatch = numMatch[i];
        }
        else if (numMatch [i] <= maxMatch && numMatch[i] > secondMatch) {
            secondMatch = numMatch[i];
        }
    }
    console.log(numMatch, maxMatch, secondMatch)
    if (maxMatch == 5) {
        return HAND.FIVE_OF_A_KIND;
    } else if (maxMatch === 4) {
        return HAND.FOUR_OF_A_KIND;
    } else if (maxMatch === 3) {
        if (secondMatch >= 2) {
            return HAND.FULL_HOUSE;
        } else {
           return HAND.THREE_OF_A_KIND;
        }
    } else if (maxMatch === 2) {
        if (secondMatch === 2) {
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
    let p2Response = document.getElementById("p2_response");
    if(r == 0) {
        p2Response.textContent = handToString(currBid + 1);
    } else {
        p2Response.textContent = "Liar!";
    }
}

function clearP2_Response() {
    let p2Response = document.getElementById("p2_response");
    p2Response.textContent = "\r\n";
}

function updateBidText() {
    dispCurrBid = document.getElementById("curr_bid");
    dispCurrBid.textContent = handToString(currBid);
    if(currBid < 6){
        document.getElementById("incP1BidButton").textContent = "Increase bid to " + handToString(currBid + 1);
    } else {
        document.getElementById("incP1BidButton").textContent = "Bid already at max!";
        document.getElementById("incP1BidButton").disabled = false;
    }
    
}

function clearRoundEndText() {
    let dispCurrHand = document.getElementById("dispCurr_hand");
    let dispOutcome = document.getElementById("dispOutcome");
    dispOutcome.textContent = "";
    dispCurrHand.textContent = "";
}

function logGameState() {
    console.log(p1Life, p1Hand);
    console.log(p2Life, p2Hand);
    console.log(currBid, currPlayer);
}

function enableP1Inputs(){
    document.getElementById("incP1BidButton").disabled = false;
    document.getElementById("p1CallLiarButton").disabled = false;
}

function disableP1Inputs(){
    document.getElementById("incP1BidButton").disabled = true;
    document.getElementById("p1CallLiarButton").disabled = true;
}