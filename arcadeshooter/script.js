/*
  By: Patricio Panico
*/

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, c.width, c.height);

var WIDTH = c.width;
var HEIGHT = c.height;
var frameCount = 0;
var uninteruptedFrameCount = 0;
var highestWave = [1, 0];
var score = 0;
var wave = 1;
var waveTimer = 0;
var enemiesLeft = [0, false, 0, 0, 0];
var enemiesLeftDisplay = 0;

var deathMenuHighScore = false;
var deathMenuFix = false;

var menuPos = 0;
var paused = false;
var started = [false, true];
var help = false;
var controls = false;
var options = false;
var stars = true;

var player;
var enemyList = {};
var bulletList = {};
var upgradeList = {};
var enemyWorthDropList = {};
var starList = {};

var Img = {};

Img.background = new Image();
Img.background.src = "assets/background.png";

Img.help = new Image();
Img.help.src = "assets/help.png";

Img.controls = new Image();
Img.controls.src = "assets/controls.png";

Img.player = new Image();
Img.player.src = "assets/playerShip.png";

Img.playerBullet = new Image();
Img.playerBullet.src = "assets/playerShipBullet.png";

Img.whiteEnemy = new Image();
Img.whiteEnemy.src = "assets/whiteEnemyShip.png";

Img.whiteEnemyBullet = new Image();
Img.whiteEnemyBullet.src = "assets/whiteEnemyShipBullet.png";

Img.redEnemy = new Image();
Img.redEnemy.src = "assets/redEnemyShip.png";

Img.redEnemyBullet = new Image();
Img.redEnemyBullet.src = "assets/redEnemyShipBullet.png";

Img.blueEnemy = new Image();
Img.blueEnemy.src = "assets/blueEnemyShip.png";

Img.blueEnemyBullet = new Image();
Img.blueEnemyBullet.src = "assets/blueEnemyShipBullet.png";

Img.lifeUpgrade = new Image();
Img.lifeUpgrade.src = "assets/life.png";

Img.scoreUpgrade = new Image();
Img.scoreUpgrade.src = "assets/score.png";

Img.atkSpdUpgrade = new Image();
Img.atkSpdUpgrade.src = "assets/atkSpd.png";

Img.teleportUpgrade = new Image();
Img.teleportUpgrade.src = "assets/teleport.png";

Img.movementUpgrade = new Image();
Img.movementUpgrade.src = "assets/movement.png";

function keyPressDown(event) {
  event = event || window.event;
  if (event.keyCode == 65 || event.keyCode == 37) {
    event.preventDefault();
    player.pressingLeft = true;
  } else if (event.keyCode == 68 || event.keyCode == 39) {
    event.preventDefault();
    player.pressingRight = true;
  }

  if (event.keyCode == 32 || event.keyCode == 87 || event.keyCode == 38 || event.keyCode == 13) {
    event.preventDefault();
    player.pressingShoot = true;

  }

  if (event.keyCode == 32 || event.keyCode == 13) {
    event.preventDefault();
    player.pressingEnter = true;
  }

  if (event.keyCode == 87 || event.keyCode == 38) {
    event.preventDefault();
    menuPos--;
  } else if (event.keyCode == 83 || event.keyCode == 40) {
    event.preventDefault();
    menuPos++;
  }

  if ((event.keyCode == 27 || event.keyCode == 80) && started[0] && started[1]) {
    event.preventDefault();
    menuPos = 0;
    paused = !paused;
  }
}

function keyPressUp(event) {
  event = event || window.event;
  if (event.keyCode == 65 || event.keyCode == 37) {
    player.pressingLeft = false;
  } else if (event.keyCode == 68 || event.keyCode == 39) {
    player.pressingRight = false;
  }

  if (event.keyCode == 32 || event.keyCode == 87 || event.keyCode == 38 || event.keyCode == 13) {
    player.pressingShoot = false;
  }

  if (event.keyCode == 32 || event.keyCode == 13) {
    player.pressingEnter = false;
  }
}

function testCollisionRectRect(rect1, rect2) {
  return rect1.x <= rect2.x + rect2.width &&
    rect2.x <= rect1.x + rect1.width &&
    rect1.y <= rect2.y + rect2.height &&
    rect2.y <= rect1.y + rect1.height;
}

function Entity(type, id, x, y, spdX, spdY, width, height, img) {
  var self = {
    type: type,
    id: id,
    x: x,
    y: y,
    spdX: spdX,
    spdY: spdY,
    width: width,
    height: height,
    img: img
  };
  self.update = function () {
    self.updatePosition();
    self.draw();
  };
  self.draw = function () {
    ctx.drawImage(self.img, self.x, self.y, self.width, self.height);
  };
  self.testCollision = function (entity2) {
    var rect1 = {
      x: self.x,
      y: self.y,
      width: self.width,
      height: self.height,
    };
    var rect2 = {
      x: entity2.x,
      y: entity2.y,
      width: entity2.width,
      height: entity2.height,
    };
    return testCollisionRectRect(rect1, rect2);
  };
  self.updatePosition = function () {
    self.x += self.spdX;
    self.y += self.spdY;
  };
  return self;
}

function Actor(type, id, x, y, spdX, spdY, width, height, img, lives, atkSpd) {
  var self = Entity(type, id, x, y, spdX, spdY, width, height, img);

  self.lives = lives;
  self.defaultAtkSpd = atkSpd;
  self.defaultMovement = spdX;
  self.atkSpd = atkSpd;
  self.shootTimer = 0;

  var super_update = self.update;
  self.update = function () {
    super_update();
    self.counters();
  };

  return self;
}

function Player() {
  var size = 48;
  var self = Actor("player", "myId", WIDTH / 2 - size / 2, HEIGHT - 100, 12, 0, size, size, Img.player, 3, 14);

  self.updatePosition = function () {
    if (self.pressingRight) {
      self.x += self.spdX;
    }
    if (self.pressingLeft) {
      self.x += -self.spdX;
    }

    if (self.x < 0) {
      if (self.teleportUpgradeActive) {
        self.x = WIDTH - self.width;
      } else {
        self.x = 0;
      }
    }
    if (self.x > WIDTH - self.width) {
      if (self.teleportUpgradeActive) {
        self.x = 0;
      } else {
        self.x = WIDTH - self.width;
      }
    }
  };

  self.counters = function () {
    if (self.pressingShoot && self.shootTimer >= self.atkSpd) {
      self.shootTimer = 0;
      generateBullet(self);
    }
    if (self.shootTimer < self.atkSpd) {
      self.shootTimer++;
    }

    function timer(ctr, spd, string, img) {
      if (ctr < spd && ctr / spd != 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(WIDTH - 25 - self.upgradesActive.indexOf(string) * 50, HEIGHT - 28, 17, -(Math.PI / 2), ((2 * Math.PI) * -(ctr / spd)) - Math.PI / 2, false);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#3C0";
        ctx.stroke();
        ctx.drawImage(img, WIDTH - 34.5 - self.upgradesActive.indexOf(string) * 50, HEIGHT - 38.5, 19, 19);
        ctx.restore();
      }
    }

    if (self.atkSpdUpgradeActive) {
      if (self.atkSpdUpgradeCtr >= self.atkSpdUpgradeSpd) {
        self.atkSpd = self.defaultAtkSpd;
        self.atkSpdUpgradeActive = false;
        self.atkSpdUpgradeCtr = 0;
        self.upgradesActive.splice(self.upgradesActive.indexOf("atkSpd"), 1);
      }
      timer(self.atkSpdUpgradeCtr++, self.atkSpdUpgradeSpd, "atkSpd", Img.atkSpdUpgrade);
    }

    if (self.teleportUpgradeActive) {
      if (self.teleportUpgradeCtr >= self.teleportUpgradeSpd) {
        self.teleportUpgradeActive = false;
        self.teleportUpgradeCtr = 0;
        self.upgradesActive.splice(self.upgradesActive.indexOf("teleport"), 1);
      }
      timer(self.teleportUpgradeCtr++, self.teleportUpgradeSpd, "teleport", Img.teleportUpgrade);
    }

    if (self.movementUpgradeActive) {
      if (self.movementUpgradeCtr >= self.movementUpgradeSpd) {
        self.spdX = self.defaultMovement;
        self.movementUpgradeActive = false;
        self.movementtUpgradeCtr = 0;
        self.upgradesActive.splice(self.upgradesActive.indexOf("movement"), 1);
      }
      timer(self.movementUpgradeCtr++, self.movementUpgradeSpd, "movement", Img.movementUpgrade);
    }
  };

  self.upgradesActive = [];

  self.movementUpgradeActive = false;
  self.movementUpgradeCtr = 0;
  self.movementUpgradeSpd = 400;

  self.teleportUpgradeActive = false;
  self.teleportUpgradeCtr = 0;
  self.teleportUpgradeSpd = 1200;

  self.atkSpdUpgradeActive = false;
  self.atkSpdUpgradeCtr = 0;
  self.atkSpdUpgradeSpd = 100;

  self.pressingEnter = false;
  self.pressingShoot = false;
  self.pressingLeft = false;
  self.pressingRight = false;
  return self;
}

function Enemy(id, diff, x, y, spdX, spdY, width, height, img, lives, atkSpd, worth) {
  var self = Actor("enemy", id, x, y, spdX, spdY, width, height, img, lives, atkSpd);

  self.diff = diff;
  self.worth = worth;

  self.counters = function () {
    if (self.shootTimer >= self.atkSpd) {
      self.shootTimer = 0;
      generateBullet(self);
    }
    if (self.shootTimer < self.atkSpd) {
      self.shootTimer++;
    }
  };

  enemyList[id] = self;
}

function generateEnemy(input) {
  switch (input) {
    case "blueEnemy":
      var id = Math.random();
      var diff = "blueEnemy";
      var width = 75;
      var height = 75;
      var x = -width;
      var y = 100;
      var spdX = 4;
      var spdY = 0;
      var img = Img.blueEnemy;
      var lives = 3;
      var atkSpd = 20;
      var worth = 50;
      Enemy(id, diff, x, y, spdX, spdY, width, height, img, lives, atkSpd, worth);
      break;
    case "redEnemy":
      var id = Math.random();
      var diff = "redEnemy";
      var width = 50;
      var height = 50;
      var x = Math.floor(Math.random() * ((WIDTH - width) - 0 + 1)) + 0;
      var y = -height;
      var spdX = 0;
      var spdY = 6;
      var img = Img.redEnemy;
      var lives = 2;
      var atkSpd = 50;
      var worth = 25;
      Enemy(id, diff, x, y, spdX, spdY, width, height, img, lives, atkSpd, worth);
      break;
    default:
      var id = Math.random();
      var diff = "whiteEnemy";
      var width = 40;
      var height = 40;
      var x = Math.floor(Math.random() * ((WIDTH - width) - 0 + 1)) + 0;
      var y = -height;
      var spdX = 0;
      var spdY = 4;
      var img = Img.whiteEnemy;
      var lives = 1;
      var atkSpd = 50;
      var worth = 10;
      Enemy(id, diff, x, y, spdX, spdY, width, height, img, lives, atkSpd, worth);
  }
}

function enemysUpdate() {
  for (var key in enemyList) {
    var object = enemyList[key];

    object.update();

    var toRemove = false;
    if (object.y > HEIGHT) {
      player.lives--;
      toRemove = true;
    }
    if (object.x > WIDTH) {
      toRemove = true;
    }
    if (toRemove) {
      delete enemyList[key];
      enemiesLeftDisplay--;
    }
  }
}

function Upgrade(id, x, y, spdX, spdY, width, height, category, img) {
  var self = Entity("upgrade", id, x, y, spdX, spdY, width, height, img);

  self.category = category;

  upgradeList[id] = self;
}

function randomlyGenerateUpgrade() {
  var id = Math.random();
  var height = 25;
  var width = 25;
  var spdX = 0;
  var spdY = 3;
  var img;
  var category;

  var r = Math.random();
  if (r <= 0.3) {
    category = "score";
    img = Img.scoreUpgrade;
    height = 35;
    width = 35;
  } else if (r <= 0.4) {
    category = "life";
    img = Img.lifeUpgrade;
  } else if (r <= 0.6) {
    category = "movement";
    img = Img.movementUpgrade;
  } else if (r <= 0.9) {
    category = "atkSpd";
    img = Img.atkSpdUpgrade;
  } else {
    category = "teleport";
    img = Img.teleportUpgrade;
  }

  var x = Math.floor(Math.random() * ((WIDTH - width) - 0 + 1)) + 0;
  var y = -height;

  Upgrade(id, x, y, spdX, spdY, width, height, category, img);
}

function upgradesUpdate() {
  for (var key in upgradeList) {
    var object = upgradeList[key];

    object.update();

    var isColliding = player.testCollision(object);
    if (isColliding) {
      if (object.category == "score") {
        score += 100;
      }
      if (object.category == "atkSpd") {
        player.atkSpd = 6;
        player.atkSpdUpgradeCtr = 0;
        player.atkSpdUpgradeActive = true;
        if (player.upgradesActive.indexOf("atkSpd") == -1) {
          player.upgradesActive.push("atkSpd");
        }
      }
      if (object.category == "life") {
        player.lives++;
      }
      if (object.category == "teleport") {
        player.teleportUpgradeCtr = 0;
        player.teleportUpgradeActive = true;
        if (player.upgradesActive.indexOf("teleport") == -1) {
          player.upgradesActive.push("teleport");
        }
      }
      if (object.category == "movement") {
        player.spdX = 18;
        player.movementUpgradeCtr = 0;
        player.movementUpgradeActive = true;
        if (player.upgradesActive.indexOf("movement") == -1) {
          player.upgradesActive.push("movement");
        }
      }

      delete upgradeList[key];
    }
  }
}

function Bullet(id, x, y, spdX, spdY, width, height, img, combatType) {
  var self = Entity("bullet", id, x, y, spdX, spdY, width, height, img);

  self.combatType = combatType;

  bulletList[id] = self;
}

function generateBullet(actor) {
  var id = Math.random();
  var width = 6;
  var height = 15;
  var x = actor.x + actor.width / 2 - width / 2;
  var y = actor.y;
  var spdX;
  var spdY;
  var img;
  switch (actor.diff) {
    case "blueEnemy":
      spdX = 0;
      spdY = 12;
      img = Img.blueEnemyBullet;
      break;
    case "redEnemy":
      spdX = 0;
      spdY = 12;
      img = Img.redEnemyBullet;
      break;
    case "whiteEnemy":
      spdX = 0;
      spdY = 12;
      img = Img.whiteEnemyBullet;
      break;
    default:
      spdX = 0;
      spdY = -24;
      img = Img.playerBullet;
      break;
  }
  Bullet(id, x, y, spdX, spdY, width, height, img, actor.type);
}

function bulletsUpdate() {
  for (var key in bulletList) {
    var object = bulletList[key];

    object.update();

    var toRemove = false;

    if (object.y < 0 || object.y > HEIGHT) {
      toRemove = true;
    }
    if (object.combatType == "player") {
      for (var key2 in enemyList) {
        var object2 = enemyList[key2];

        if (object.testCollision(object2)) {
          toRemove = true;
          object2.lives--;
          if (object2.lives <= 0) {
            score += object2.worth;
            generateEnemyWorthDrop(object2.x, object2.y, object2.width, object2.height, object2.worth);
            enemiesLeftDisplay--;
            delete enemyList[key2];
          }
        }
      }
    } else if (object.combatType == "enemy") {
      if (object.testCollision(player)) {
        toRemove = true;
        player.lives--;
      }
    }
    if (toRemove) {
      delete bulletList[key];
    }
  }
}

function enemyWorthDrop(id, x, y, spdX, spdY, width, height, text, time) {
  var self = Entity("enemyWorthDrop", id, x, y, spdX, spdY, width, height);

  self.text = text;
  self.time = time;

  enemyWorthDropList[id] = self;
}

function generateEnemyWorthDrop(x, y, width, height, text) {
  var id = Math.random();
  var spdX = 0;
  var spdY = -2;
  var time = 10;
  enemyWorthDrop(id, x, y, spdX, spdY, width, height, text, time);
}

function enemyWorthUpdate() {
  for (var key in enemyWorthDropList) {
    var object = enemyWorthDropList[key];

    object.updatePosition();
    object.time--;

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.font = "Bold 24px Verdana";
    ctx.textAlign = "center";
    ctx.fillText(object.text, object.x + object.width / 2, object.y + object.height / 2 + 10);
    ctx.restore();

    if (object.time <= 0) {
      delete enemyWorthDropList[key];
    }
  }
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function menuSelector(selectors, yOver, yDisOver, xOver) {
  if (yOver == null) {
    yOver = HEIGHT / 2;
  }
  if (yDisOver == null) {
    yDisOver = 80;
  }

  if (menuPos > selectors.length - 1) {
    menuPos = 0;
  } else if (menuPos < 0) {
    menuPos = selectors.length - 1;
  }
  for (var i = 0; i < selectors.length; i++) {
    var xOverVar;
    if (xOver != null) {
      if (i == xOver[0]) {
        xOverVar = xOver[1];
      } else {
        xOverVar = 0;
      }
    } else {
      xOverVar = 0;
    }

    if (menuPos == i) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#5BF004";
    } else {
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#060";
    }
    ctx.fillText(selectors[i], WIDTH / 2 + xOverVar, yOver + (i * yDisOver));
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#060";
  }
}

function pauseMenu() {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0A0A0A";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#3C0";
  roundRect(WIDTH / 2 - 260, HEIGHT / 2 - 250, 520, 450, 50);
  ctx.restore();

  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  ctx.font = "Bold 64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Paused", WIDTH / 2, HEIGHT / 2 - 170);
  ctx.font = "46px Verdana";
  menuSelector(["Resume", "Restart", "Return to Main Menu"]);
  if (menuPos == 0 && player.pressingEnter) {
    paused = !paused;
    player.pressingEnter = false;
  }
  if (menuPos == 1 && player.pressingEnter) {
    menuPos = 0;
    startNewGame();
    player.pressingEnter = false;
  } else if (menuPos == 2 && player.pressingEnter) {
    menuPos = 0;
    started[1] = false;
    paused = false;
    player.pressingEnter = false;
  }
}

function mainMenu() {
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  ctx.font = "Bold 72px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Arcade Shooter", WIDTH / 2, HEIGHT / 2 - 170);
  ctx.font = "54px Verdana";
  menuSelector(["Play", "Help", "Controls", "Options"]);
  if (menuPos == 0 && player.pressingEnter) {
    started[0] = true;
    player.pressingEnter = false;
  } else if (menuPos == 1 && player.pressingEnter) {
    help = true;
    player.pressingEnter = false;
  } else if (menuPos == 2 && player.pressingEnter) {
    controls = true;
    player.pressingEnter = false;
  } else if (menuPos == 3 && player.pressingEnter) {
    options = true;
    player.pressingEnter = false;
  }
}

function secondaryMenu() {
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  ctx.font = "Bold 72px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Arcade Shooter", WIDTH / 2, HEIGHT / 2 - 170);
  ctx.font = "54px Verdana";
  menuSelector(["Continue", "Restart", "Controls", "Options"]);
  if (menuPos == 0 && player.pressingEnter) {
    started[1] = true;
    player.pressingEnter = false;
  } else if (menuPos == 1 && player.pressingEnter) {
    started[1] = true;
    startNewGame();
    player.pressingEnter = false;
  } else if (menuPos == 2 && player.pressingEnter) {
    controls = true;
    player.pressingEnter = false;
  } else if (menuPos == 3 && player.pressingEnter) {
    options = true;
    player.pressingEnter = false;
  }
}

function helpMenu() {
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#5BF004";
  ctx.font = "54px Verdana";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  menuSelector(["< Back to Main Menu"], 80);
  ctx.drawImage(Img.help, WIDTH / 2 - 350, 0, 700, 700);
  if (menuPos == 0 && player.pressingEnter) {
    help = false;
    player.pressingEnter = false;
  }
}

function controlsMenu() {
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#5BF004";
  ctx.font = "54px Verdana";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  menuSelector(["< Back to Main Menu"], 80);
  ctx.drawImage(Img.controls, WIDTH / 2 - 350, 0, 700, 700);
  if (menuPos == 0 && player.pressingEnter) {
    controls = false;
    player.pressingEnter = false;
  }
}

function optionsMenu() {
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#5BF004";
  ctx.font = "54px Verdana";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  menuSelector(["< Back to Main Menu", "Stars"], 250, 150, [1, -100]);
  ctx.fillStyle = "rgba(51, 51, 51, 0.5)";
  ctx.fillRect(WIDTH / 2, 360, 240, 45);
  if (stars) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#5BF004";
    ctx.fillStyle = "rgba(91, 240, 4, 0.4)";
    ctx.fillRect(WIDTH / 2, 360, 120, 45);
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#060";
  } else {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#5BF004";
    ctx.fillStyle = "rgba(91, 240, 4, 0.4)";
    ctx.fillRect(WIDTH / 2 + 120, 360, 120, 45);
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#060";
  }
  if (menuPos == 0 && player.pressingEnter) {
    options = false;
    player.pressingEnter = false;
  } else if (menuPos == 1 && player.pressingEnter) {
    stars = !stars;
    player.pressingEnter = false;
  }
}

function deathMenu() {
  if (!deathMenuFix) {
    menuPos = 0;
    deathMenuFix = true;
  }
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  ctx.font = "Bold 72px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", WIDTH / 2, HEIGHT / 2 - 205);
  ctx.font = "Bold 52px Arial";
  if ((wave > highestWave[0]) || (wave == highestWave[0] && score > highestWave[1]) || deathMenuHighScore) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#5BF004";
    ctx.fillText("New", WIDTH / 2 - 180, HEIGHT / 2 - 100);
    ctx.fillText("High Score!", WIDTH / 2 - 180, HEIGHT / 2 - 40);
    ctx.fillText("Wave: " + wave, WIDTH / 2 - 180, HEIGHT / 2 + 20);
    ctx.fillText("Score: " + score, WIDTH / 2 - 180, HEIGHT / 2 + 80);
    ctx.fillText("Previous", WIDTH / 2 + 180, HEIGHT / 2 - 100);
    ctx.fillText("High Score", WIDTH / 2 + 180, HEIGHT / 2 - 40);
    ctx.fillText("Wave: " + highestWave[0], WIDTH / 2 + 180, HEIGHT / 2 + 20);
    ctx.fillText("Score: " + highestWave[1], WIDTH / 2 + 180, HEIGHT / 2 + 80);
    deathMenuHighScore = true;
  } else {
    ctx.fillText("Last Game", WIDTH / 2 - 180, HEIGHT / 2 - 60);
    ctx.fillText("Wave: " + wave, WIDTH / 2 - 180, HEIGHT / 2);
    ctx.fillText("Score: " + score, WIDTH / 2 - 180, HEIGHT / 2 + 60);
    ctx.fillText("High Score", WIDTH / 2 + 180, HEIGHT / 2 - 60);
    ctx.fillText("Wave: " + highestWave[0], WIDTH / 2 + 180, HEIGHT / 2);
    ctx.fillText("Score: " + highestWave[1], WIDTH / 2 + 180, HEIGHT / 2 + 60);
  }
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#060";
  ctx.font = "54px Verdana";
  menuSelector(["Restart", "Return to Main Menu"], HEIGHT / 2 + 200);
  if (menuPos == 0 && player.pressingEnter) {
    if ((wave > highestWave[0]) || (wave == highestWave[0] && score > highestWave[1]) || deathMenuHighScore) {
      highestWave = [wave, score];
    }
    startNewGame();
    deathMenuHighScore = false;
    deathMenuFix = false;
    player.pressingEnter = false;
  } else if (menuPos == 1 && player.pressingEnter) {
    menuPos = 0;
    started[0] = false;
    if ((wave > highestWave[0]) || (wave == highestWave[0] && score > highestWave[1]) || deathMenuHighScore) {
      highestWave = [wave, score];
    }
    startNewGame();
    deathMenuHighScore = false;
    deathMenuFix = false;
    player.pressingEnter = false;
  }
}

function Star(id, x, y, spdX, spdY, width, height) {
  var self = Entity("star", id, x, y, spdX, spdY, width, height);

  starList[id] = self;
}

function randomlyGenerateStar() {
  var id = Math.random();
  var size = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
  var x = Math.floor(Math.random() * ((WIDTH - size) - 0 + 1)) + 0;
  var y = -size;
  var spdX = 0;
  var spdY = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
  Star(id, x, y, spdX, spdY, size, size);
}

function starsUpdate() {
  for (var key in starList) {
    var object = starList[key];

    object.updatePosition();

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(object.x, object.y, object.width, object.height);
    ctx.restore();

    if (object.y > HEIGHT) {
      delete starList[key];
    }
  }
}

function waves() {
  function waveSpawner(maxEnemies, whiteEnemys, redEnemys, blueEnemys, enemyTimer) {
    if (!enemiesLeft[1]) {
      enemiesLeft = [maxEnemies, true, whiteEnemys, redEnemys, blueEnemys];
      enemiesLeftDisplay = maxEnemies;
    }
    if (frameCount % 50 == 0 && enemiesLeft[0] > 0) {
      var enemiesLeftChange = [enemiesLeft[2], enemiesLeft[3], enemiesLeft[4]];
      do {
        var r = Math.random();
        if (r <= 0.3 && enemiesLeft[2] > 0) {
          generateEnemy();
          enemiesLeft[0]--;
          enemiesLeft[2]--;
        } else if (r <= 0.6 && enemiesLeft[3] > 0) {
          generateEnemy("redEnemy");
          enemiesLeft[0]--;
          enemiesLeft[3]--;
        } else if (enemiesLeft[4] > 0) {
          generateEnemy("blueEnemy");
          enemiesLeft[0]--;
          enemiesLeft[4]--;
        }
      } while (enemiesLeft[2] == enemiesLeftChange[0] && enemiesLeft[3] == enemiesLeftChange[1] && enemiesLeft[4] == enemiesLeftChange[2]);
    } else if (enemiesLeft[0] <= 0 && enemiesLeftDisplay <= 0) {
      if (waveTimer >= enemyTimer) {
        enemiesLeft[1] = false;
        wave++;
        score += 500;
        waveTimer = 0;
      } else {
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "72px Arial";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#5BF004";
        ctx.fillText("Wave " + wave + " Completed", WIDTH / 2, HEIGHT / 2);
        ctx.restore();
        waveTimer++;
      }
    }
  }
  if (wave == 1) {
    waveSpawner(20, 15, 5, 0, 50);
  } else if (wave == 2) {
    waveSpawner(24, 17, 6, 1, 50);
  } else if (wave == 3) {
    waveSpawner(28, 17, 8, 3, 50);
  } else if (wave == 4) {
    waveSpawner(32, 19, 9, 4, 50);
  } else if (wave == 5) {
    waveSpawner(36, 20, 10, 6, 50);
  } else if (wave == 6) {
    waveSpawner(40, 20, 12, 8, 50);
  } else if (wave == 7) {
    waveSpawner(44, 22, 14, 8, 49);
  } else if (wave == 8) {
    waveSpawner(48, 24, 16, 8, 46);
  } else if (wave == 9) {
    waveSpawner(52, 26, 18, 8, 43);
  } else if (wave == 10) {
    waveSpawner(56, 26, 20, 10, 40);
  } else if (wave == 11) {
    waveSpawner(60, 28, 22, 10, 37);
  } else if (wave == 12) {
    waveSpawner(60, 28, 22, 10, 34);
  } else if (wave == 13) {
    waveSpawner(60, 28, 22, 10, 31);
  } else if (wave == 14) {
    waveSpawner(60, 28, 22, 10, 28);
  } else if (wave >= 15) {
    waveSpawner(60, 28, 22, 10, 25);
  }
}

function update() {
  ctx.fillStyle = "#3C0";
  ctx.font = "30px Arial";
  ctx.shadowBlur = 0;

  if (paused) {
    pauseMenu();
    return;
  }

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(Img.background, 0, 0, WIDTH, HEIGHT);

  uninteruptedFrameCount++;
  if (stars) {
    if (uninteruptedFrameCount % 5 == 0) {
      randomlyGenerateStar();
    }
    starsUpdate();
  }

  ctx.save();
  if (player.lives <= 0) {
    deathMenu();
    return;
  }
  if (help) {
    helpMenu();
    return;
  }
  if (controls) {
    controlsMenu();
    return;
  }
  if (options) {
    optionsMenu();
    return;
  }
  if (!started[0]) {
    mainMenu();
    return;
  }
  if (!started[1]) {
    secondaryMenu();
    return;
  }
  ctx.restore();

  frameCount++;

  if (frameCount % 125 == 0) {
    randomlyGenerateUpgrade();
  }

  bulletsUpdate();
  upgradesUpdate();
  enemysUpdate();
  enemyWorthUpdate();

  player.update();

  waves();

  ctx.shadowBlur = 10;
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 12, 35);
  ctx.textAlign = "right";
  ctx.fillText("Enemies Left: " + enemiesLeftDisplay, WIDTH - 10, 35);
  ctx.fillText("Wave: " + wave, WIDTH - 10, 70);
  if (player.lives < 8) {
    for (var i = 0; i < player.lives; i++) {
      ctx.shadowBlur = 0;
      ctx.drawImage(Img.player, 20 + i * 45, HEIGHT - 45, 30, 30);
    }
  } else {
    ctx.textAlign = "left";
    ctx.fillText("Lives: " + player.lives, 15, HEIGHT - 15);
  }
  ctx.shadowBlur = 0;
}

function startNewGame() {
  paused = false;
  player.atkSpd = player.defaultAtkSpd;
  player.spdX = player.defaultMovement;
  player.atkSpdUpgradeActive = false;
  player.teleportUpgradeActive = false;
  player.movementUpgradeActive = false;
  player.upgradesActive = [];
  player.lives = 3;
  player.x = WIDTH / 2 - player.width / 2;
  frameCount = 0;
  score = 0;
  wave = 1;
  enemiesLeft = [0, false, 0, 0, 0];
  enemyList = {};
  bulletList = {};
  upgradeList = {};
  enemyWorthDropList = {};
}

player = Player();
setInterval(update, 40);