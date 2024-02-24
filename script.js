var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

c.width = window.innerWidth;
c.height = window.innerHeight;

var frameCount = 0;
var starList = {};

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
	self.update = function() {
		self.updatePosition();
		self.draw();
	};
	self.draw = function() {
		ctx.drawImage(self.img, self.x, self.y, self.width, self.height);
	};
	self.testCollision = function(entity2) {
		var rect1 = {
			x: self.x,
			y: self.y,
			width: self.width,
			height: self.height
		};
		var rect2 = {
			x: entity2.x,
			y: entity2.y,
			width: entity2.width,
			height: entity2.height
		};
		return testCollisionRectRect(rect1, rect2);
	};
	self.updatePosition = function() {
		self.x += self.spdX;
		self.y += self.spdY;
	};
	return self;
}

function Star(id, x, y, spdX, spdY, width, height) {
	var self = Entity('star', id, x, y, spdX, spdY, width, height);

	starList[id] = self;
}

function randomlyGenerateStar() {
	var id = Math.random();
	var size = Math.floor(Math.random() * (6 - 4 + 1)) + 4;
	var x = Math.floor(Math.random() * (c.width - size - 0 + 1)) + 0;
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
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.fillRect(object.x, object.y, object.width, object.height);
		ctx.restore();

		if (object.y > c.height) {
			delete starList[key];
		}
	}
}

function update() {
	ctx.clearRect(0, 0, c.width, c.height);

	c.width = window.innerWidth;
	c.height = window.innerHeight;

	if (frameCount % 5 == 0) {
		randomlyGenerateStar();
	}
	starsUpdate();

	frameCount++;
}

window.addEventListener('resize', function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

setInterval(update, 40);
