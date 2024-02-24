/*
  By: Patricio Panico
*/

var buttonSwitch = false;
var dealerCards = [];
var playerCards = [];
var cardsDelt = [];
var cardValue = [null,
  2, 2, 2, 2, 3, 3, 3, 3,
  4, 4, 4, 4, 5, 5, 5, 5,
  6, 6, 6, 6, 7, 7, 7, 7,
  8, 8, 8, 8, 9, 9, 9, 9,
  10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 11, 11,
  11, 11
];
var playerScore = 0;
var dealerScore = 0;
var pCardCount = 2;
var dCardCount = 2;
var dealerTotalScore = 0;
var playerTotalScore = 0;

var flipCard = new Audio("assets/cardFlip.mp3");
flipCard.volume = 0.3;

function updateDealerScore() { document.getElementById("dealerScore").innerHTML = "Score: " + dealerScore; }

function updatePlayerScore() { document.getElementById("playerScore").innerHTML = "Score: " + playerScore; }

function incDealerTotalScore() { document.getElementById("dealerTotalScore").innerHTML = "Dealer: " + ++dealerTotalScore; }

function incPlayerTotalScore() { document.getElementById("playerTotalScore").innerHTML = "Player: " + ++playerTotalScore; }

function displayDealerText(text) { document.getElementById("dealerText").innerHTML = text; }

function displayPlayerText(text) { document.getElementById("playerText").innerHTML = text; }

function disableButtons(bool=true) {
  document.getElementById("hitButton").disabled = bool;
  document.getElementById("standButton").disabled = bool;
}

function starter() {
  if (buttonSwitch) {
    dealerCards = [];
    playerCards = [];
    cardsDelt = [];
    playerScore = 0;
    dealerScore = 0;
    pCardCount = 2;
    dCardCount = 2;

    document.getElementById("dcards").innerHTML = '<img class="card" id="d1" src="assets/cards/back.png" /><img class="card" id="d0" src="assets/cards/back.png" />';
    document.getElementById("pcards").innerHTML = '<img class="card" id="p0" src="assets/cards/back.png" /><img class="card" id="p1" src="assets/cards/back.png" />';

    disableButtons();
    document.getElementById("starterButton").innerHTML = "DEAL";

    displayDealerText("DEALER");
    displayPlayerText("PLAYER");
    updatePlayerScore("--");
    updateDealerScore("--");

    buttonSwitch = false;
  } else {
    disableButtons(false);
    document.getElementById("starterButton").disabled = true;
    document.getElementById("starterButton").innerHTML = "NEW";
    
    deal("d0", 0, dealerCards);
    deal("p0", null, playerCards);
    deal("p1", 2, playerCards);

    buttonSwitch = true;
  }
}

function aceOrBust(x, y) {
  if (x == 0) {
    if (dealerScore > 21) {
      for (i = 0; i < dealerCards.length; i++) {
        if (dealerScore > 21) {
          if (dealerCards[i] == 11) {
            dealerScore -= 10;
            dealerCards[i] = -(dealerCards[i]);
            updateDealerScore();
          }
        }
      }
      if (dealerScore > 21) {
        disableButtons();
        updateDealerScore()
        displayDealerText("DEALER - Busted!");
      }
    } else if (dealerScore == 21) {
      disableButtons();
      if (y == 0) {
        updateDealerScore()
        displayDealerText("DEALER - Blackjack!");
      } else {
        updateDealerScore()
      }
    }
  } else if (x == 1) {
    if (playerScore > 21) {
      for (i = 0; i < playerCards.length; i++) {
        if (playerScore > 21) {
          if (playerCards[i] == 11) {
            playerScore -= 10;
            playerCards[i] = -(playerCards[i]);
            updatePlayerScore();
          }
        }
      }
      if (playerScore > 21) {
        disableButtons();
        updatePlayerScore()
        displayPlayerText("PLAYER - Busted!");
        dealerTurn();
      }
    } else if (playerScore == 21) {
      disableButtons();
      if (y == 0) {
        updatePlayerScore()
        displayPlayerText("PLAYER - Blackjack!");
        deal("d1", 3, dealerCards);
        if (dealerScore != 21) {
          incPlayerTotalScore()
        }
        document.getElementById("starterButton").disabled = false;
      } else {
        dealerTurn();
      }
    }
  }
}

function deal(x, y, z) {
  flipCard.pause();
  flipCard.play();
  do {
    var r = Math.floor(Math.random() * 52) + 1;
  }
  while (cardsDelt.indexOf(r) != -1)
  cardsDelt.push(r);
  z.push(cardValue[r]);
  if (y == 0 || y == 1) {
    dealerScore += cardValue[r];
    updateDealerScore();
    aceOrBust(0, 0);
  } else if (y == 2) {
    for (i = 0; i < playerCards.length; i++) {
      playerScore += playerCards[i];
    }
    updatePlayerScore()
    aceOrBust(1, 0);
  } else if (y == 3) {
    dealerScore += cardValue[r];
    updateDealerScore();
    aceOrBust(0, 0);
  } else if (y == 4) {
    dealerScore += cardValue[r];
    document.getElementById("dcards").innerHTML += '<img class="card" id="' + x + '" />';
    updateDealerScore();
    aceOrBust(0, 1);
  } else if (y == 5) {
    playerScore += cardValue[r];
    updatePlayerScore()
    document.getElementById("pcards").innerHTML += '<img class="card" id="' + x + '" />';
    aceOrBust(1, 1);
  }
  document.getElementById(x).src = "assets/cards/" + r + ".png";
}

function hit() {
  deal("p" + pCardCount++, 5, playerCards);
}

function dealerTurn() {
  disableButtons();
  deal("d1", 1, dealerCards);
  setTimeout(dealerHits, 750);

  function dealerHits() {
    if (dealerScore < 17) {
      deal("d" + dCardCount++, 4, dealerCards);
      setTimeout(dealerHits, 750);
    } else {
      score();
    }
  }
}

function score() {
  if (playerScore <= 21) {
    if (dealerScore <= 21) {
      if (playerScore > dealerScore) {
        updatePlayerScore()
        displayPlayerText("PLAYER - Wins!");
        incPlayerTotalScore()
      } else if (dealerScore > playerScore) {
        updateDealerScore();
        displayDealerText("DEALER - Wins!");
        incDealerTotalScore()
      } else {
        updatePlayerScore()
        displayPlayerText("PLAYER - Push!");
        updateDealerScore();
        displayDealerText("DEALER - Push!");
      }
    } else if (dealerScore > 21) {
      updatePlayerScore()
      displayPlayerText("PLAYER - Wins!");
      incPlayerTotalScore()
    }
  } else if (dealerScore <= 21) {
    updateDealerScore();
    displayDealerText("DEALER - Wins!");
    incDealerTotalScore()
  }
  document.getElementById("starterButton").disabled = false;
}