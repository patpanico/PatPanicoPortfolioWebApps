/*
  By: Patricio Panico
*/

var credits = 500;

function play() {
  a = Math.floor(Math.random() * 12) + 1;
  b = Math.floor(Math.random() * 12) + 1;
  c = Math.floor(Math.random() * 12) + 1;

  credits -= 10;

  document.getElementById("creditCount").innerHTML = credits;
  document.getElementById("wonCount").innerHTML = 0;
  document.getElementById("starterButton").disabled = true;

  for (i = 1; i <= 3; i++) {
    document.getElementById("overwrite" + i).style.visibility = "hidden";
    document.getElementById("symbols" + i).style.animationPlayState = "running";
    document.getElementById("overwrite" + i + "img").style.animation = "swing 1s ease 1 paused";
  }

  setTimeout(function() {
    document.getElementById("overwrite1").style.visibility = "visible";
    document.getElementById("overwrite1img").src = "assets/symbols/symb_" + a + ".png";
    document.getElementById("overwrite1img").style.animationPlayState = "running";
  }, 1000);

  setTimeout(function() {
    document.getElementById("overwrite2").style.visibility = "visible";
    document.getElementById("overwrite2img").src = "assets/symbols/symb_" + b + ".png";
    document.getElementById("overwrite2img").style.animationPlayState = "running";
  }, 2000);

  setTimeout(function() {
    document.getElementById("overwrite3").style.visibility = "visible";
    document.getElementById("overwrite3img").src = "assets/symbols/symb_" + c + ".png";
    document.getElementById("overwrite3img").style.animationPlayState = "running";

    checkFor();

    setTimeout(function() {
      document.getElementById("starterButton").disabled = false;

      for (i = 1; i <= 3; i++) {
        document.getElementById("overwrite" + i + "img").style.animation = "";
      }
    }, 1000);
  }, 3000);
}

function checkFor() {
  var fruits = [1, 2, 3, 4, 5, 6];

  function addCredits(won) {
    credits += won;
    document.getElementById("wonCount").innerHTML = won;
    document.getElementById("creditCount").innerHTML = credits;
  }

  if (a == 12 && b == 12 && c == 12) {
    addCredits(2000);
  } else if (a == 11 && b == 11 && c == 11) {
    addCredits(1250);
  } else if (a == 10 && b == 10 && c == 10) {
    addCredits(800);
  } else if ((a == 9 && b == 10 && c == 9) || (a == 10 && b == 9 && c == 10)) {
    addCredits(600);
  } else if (a == 9 && b == 9 && c == 9) {
    addCredits(400);
  } else if (a == 8 && b == 8 && c == 8) {
    addCredits(200);
  } else if (a == 7 && b == 7 && c == 7) {
    addCredits(150);
  } else if ((a == 1 && b == 1 && c == 1) || (a == 2 && b == 2 && c == 2) ||
    (a == 3 && b == 3 && c == 3) || (a == 4 && b == 4 && c == 4) ||
    (a == 5 && b == 5 && c == 5) || (a == 6 && b == 6 && c == 6)) {
    addCredits(100);
  } else if (fruits.indexOf(a) != -1 && fruits.indexOf(b) != -1 && fruits.indexOf(c) != -1) {
    addCredits(70);
  } else if (a == b || a == c || b == c || c == a) {
    addCredits(30);
  } else if (credits < 10) {
    document.getElementById("loseScreen").style.visibility = "visible";
  }
}

function replay() {
  credits = 500;
  document.getElementById("loseScreen").style.visibility = "hidden";
  document.getElementById("creditCount").innerHTML = credits;
}