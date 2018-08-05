var canvas = document.getElementById('game');
var canvasCtx = canvas.getContext('2d');

const CONFIG = {
    ballConfig: {
        ballSize: 10,
        ballSpeed: 2,
        maxSpeed: 5,
        delta: {
            x: 1,
            y: 1
        },
        speedIncrease: 0.01,
        color: "orange",
        startPos: {
            x: canvas.width / 2,
            y: canvas.height / 2
        }
    },
    paddleConfig: {
        width: 100,
        height: 20,
        speed: 8,
        color: "blue",
        startPos: {
            x: canvas.width / 2
        }
    },
    brickConfig: {
        width: 50,
        height: 20,
        spacing: 3,
        maxX: 9
    }
};

window.Breakout = {};

(function() {
    function Ball() {
        this.config = CONFIG.ballConfig;
        this.posX  = this.config.startPos.x;
        this.posY = this.config.startPos.y;
        this.dx = this.config.delta.x;
        this.dy = this.config.delta.y;
        this.speed = this.config.ballSpeed;
        this.col = this.config.color;
        this.ballSize = this.config.ballSize;
    }

    Ball.prototype.update = function () {
        this.checkPos();
        this.draw();
        this.move();
    };

    Ball.prototype.move = function () {
        // var sx = this.dx * this.speed;
        // var sy = this.dy * this.speed;
        // var max = this.config.maxSpeed;
        // this.posX += Math.abs(sx) > max ? sx < 0 ? -max : max : sx;
        // this.posY += Math.abs(sy) > max ? sy < 0 ? -max : max : sy;
    };

    Ball.prototype.checkForOOB = function () {
        // if (this.posY > canvas.height - this.ballSize) {
        //     this.speed = 0;
        //     return true;
        // }
        return false;
    };

    Ball.prototype.checkPos = function () {
        if (this.posX + this.dx > canvas.width - this.ballSize || this.posX + this.dx < this.ballSize) {
            this.dx *= -1;
            this.speed += this.config.speedIncrease;
            if (this.posX > canvas.width - this.ballSize) {
                this.posX = canvas.width - this.ballSize;
            } else if (this.posX < this.ballSize) {
                this.posX = this.ballSize;
            }
        }

        if (this.posY < this.ballSize) {
            this.posY = this.ballSize;
            this.dy *= -1;
            this.speed += this.config.speedIncrease;
        }
    };

    Ball.prototype.draw = function () {
        canvasCtx.beginPath();
        canvasCtx.arc(this.posX,this.posY,this.ballSize,0,Math.PI*2);
        canvasCtx.fillStyle = this.col;
        canvasCtx.fill();
        canvasCtx.closePath();
    };

    Ball.prototype.bounceBrick = function (xFactor, yFactor) {
        this.dx *= xFactor ? -1 : 1;
        this.dy *= yFactor ? -1 : 1;
    };

    Ball.prototype.bouncePaddle = function (xFactor, spin) {
        this.dx += xFactor || 0;
        this.dx += spin || 0;
        this.dy *= -1;
        this.speed += this.config.speedIncrease;
    };

    Breakout.Ball = Ball;
})();

(function(){
    function Brick(index, pos, hitPoints) {
        this.index = index;
        this.hp = hitPoints;
        this.pos = pos;
        this.config = CONFIG.brickConfig;
        this.status = 1;
    }

    Brick.prototype.update = function () {
        this.draw();
    };

    Brick.prototype.draw = function () {
        canvasCtx.beginPath();
        canvasCtx.rect(this.pos.x, this.pos.y,this.config.width, this.config.height);
        canvasCtx.fillStyle = this.getColor();
        canvasCtx.fill();
        canvasCtx.closePath();
    };

    Brick.prototype.checkForBallCollision = function (ball) {
        if (ball.posX > this.pos.x - ball.ballSize && ball.posX <= this.pos.x + this.config.width + ball.ballSize) {
            if (ball.posY >= this.pos.y - ball.ballSize && ball.posY <= this.pos.y + this.config.height + ball.ballSize) {
                var xMin = Math.floor(Math.abs(ball.posX + ball.ballSize - this.pos.x));
                var xMax = Math.floor(Math.abs(ball.posX - ball.ballSize - this.pos.x));
                console.log("min: " + xMin + " max: " + xMax);
                if (xMin <= 1 || xMax === this.config.width) {
                    ball.bounceBrick(true, false);
                } else {
                    ball.bounceBrick(false, true);
                }
                this.hp -= 1;
                if (this.hp <= 0) {
                    this.status = 0;
                }
            }
        }
    };

    Brick.prototype.getColor = function () {
        switch (this.hp) {
            case 1:
                return "blue";
            case 2:
                return "red";
            default:
                return "green";
        }
    };

    Breakout.Brick = Brick;

})();

(function() {
    function Paddle() {
        this.config = CONFIG.paddleConfig;
        this.posX = this.config.startPos.x - (this.config.width / 2);
        this.posY = canvas.height - this.config.height;
        this.col = this.config.color;
        this.dx = this.config.speed;
        this.sizeX = this.config.width;
        this.sizeY = this.config.height;
        this.lastPosX = this.posX;
        this.lastPosTick = 0;
    }

    Paddle.prototype.checkPos = function () {
        if (this.posX - this.dx < 0) {
            return -1;
        }

        if (this.posX + this.dx > canvas.width - this.sizeX) {
            return 1;
        }

        return 0;
    };

    Paddle.prototype.draw = function () {
        canvasCtx.beginPath();
        canvasCtx.rect(this.posX, this.posY, this.sizeX, this.sizeY);
        canvasCtx.fillStyle = this.col;
        canvasCtx.fill();
        canvasCtx.closePath();
    };

    Paddle.prototype.update = function () {
        this.draw();
        this.move();
    };

    Paddle.prototype.move = function () {
        if (Breakout.paddleControls.right && this.checkPos() < 1) {
            this.posX += this.dx;
        }

        if (Breakout.paddleControls.left && this.checkPos() > -1) {
            this.posX -= this.dx;
        }

        if (this.lastPosTick >= 2) {
            this.lastPosX = this.posX;
            this.lastPosTick = 0;
        } else {
            this.lastPosTick += 1;
        }
    };

    Paddle.prototype.checkForBallCollision = function (ball) {
        if (ball.posX > this.posX && ball.posX <= this.posX + this.sizeX) {
            if (ball.posY >= this.posY - ball.ballSize) {
                var xFactor = (this.posX + (this.sizeX / 2)) - ball.posX;
                xFactor = Math.clamp(-2,2,-xFactor / (this.sizeX / 2));

                var spin = Math.clamp(-1,1, this.lastPosX - this.posX);
                spin *= -1;
                ball.bouncePaddle(xFactor, spin);
            }
        }
    };

    Breakout.Paddle = Paddle;
})();

(function() {
    var ball = new Breakout.Ball();
    var paddle = new Breakout.Paddle();
    var bricks = [];
    var deltaTime = 0;
    var timePassed = performance.now();

    Breakout.paddleControls = {
        left: false,
        right: false
    };

    Breakout.update = function (time) {
        deltaTime = time - timePassed;
        var self = this;
        canvasCtx.clearRect(0,0,canvas.width, canvas.height);
        ball.update();
        paddle.update();
        paddle.checkForBallCollision(ball);
        for (var i = 0; i < bricks.length; i++) {
            if (bricks[i].status === 1) {
                bricks[i].update();
                bricks[i].checkForBallCollision(ball);
            }
        }
        if (ball.checkForOOB()) {
            alert("GAME OVER");
            return;
        }
        requestAnimationFrame(function (time) { self.update(time);});
        timePassed = time;
    };

    Breakout.play = function () {
        var self = this;
        var brickConf = CONFIG.brickConfig;
        var brickIndex = 0;
        var pos = {x: brickConf.spacing, y: brickConf.spacing};
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < brickConf.maxX; j++) {
                var brick = new Breakout.Brick(brickIndex,{x: pos.x, y: pos.y}, 1);
                pos.x += brickConf.width + brickConf.spacing;
                brickIndex += 1;
                bricks.push(brick);
            }
            pos.x = brickConf.spacing;
            pos.y += brickConf.height + brickConf.spacing;
        }
        requestAnimationFrame(function (time) { self.update(time);});
    };

    window.addEventListener('keydown', function (ev) {
       switch (ev.keyCode) {
           case 37:
               Breakout.paddleControls.left = true;
               break;
           case 39:
               Breakout.paddleControls.right = true;
               break;
       }
    });

    window.addEventListener('keyup', function (ev) {
        switch (ev.keyCode) {
            case 37:
                Breakout.paddleControls.left = false;
                break;
            case 39:
                Breakout.paddleControls.right = false;
                break;
        }
    });

    window.addEventListener('mousemove', function (ev) {
        var rect = canvas.getBoundingClientRect();
        ball.posX = ev.clientX - rect.left;
        ball.posY = ev.clientY - rect.top;
    });
})();

Math.clamp = function (min, max, value) {
    var val = 0;
    if (value < min) {
        val = min;
    } else if (value > max) {
        val = max;
    } else {
        val = value;
    }

    return val;
};

window.onload = function (ev) {
    Breakout.play();
};