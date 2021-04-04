const WIDTH = 1024;
const HEIGHT = 512;
const CLOUD_SPACING = 50;
const GRAVITY = 20;
const INIT_SPEED = 3;
const JUMP_SPEED = -400;
const SPEED_INCREMENT = 0.001;
const JUMP_DEAD_TIME = 0;
const CLOUD_SCROLL_SCALE = 0.5;
const PIPE_LIP = 8;
const GAMEOVERTIME = 200;
const PIPE_WIDTH = 60;
const CHAR_X = 100;
const delT = 1/60;

var clouds
var gameOver
var achievedBestScore
var jumpDeadTimer
var x_dist
var speed
var y_dist
var y_vel
var jump
var score
var bestScore
var pipes
var bestScore = 0
var wingAngle
var jumpSound

function preload()
{
    soundFormats('mp3', 'wav')

    jumpSound = loadSound('assets/whoosh.wav')
}

function init()
{
    clouds = [
        {x_pos: 200, y_pos: 100, size: 50},
        {x_pos: 700, y_pos: 120, size: 70},
        {x_pos: 1200, y_pos: 80, size: 50},
        {x_pos: 1700, y_pos: 89, size: 70},
        {x_pos: 2200, y_pos: 59, size: 40},
        {x_pos: 2700, y_pos: 150, size: 80},
        {x_pos: 3200, y_pos: 130, size: 70}
    ]
    pipes = [
        {x_pos: 500, y_pos: 200, gap: 200},
        {x_pos: 800, y_pos: 300, gap: 200},
        {x_pos: WIDTH + 100, y_pos: 150, gap: 200},
    ]
    gameOver = false;
    gameOverTimer = 0;
    jumpDeadTimer = JUMP_DEAD_TIME;
    x_dist = 0
    y_dist = HEIGHT / 2
    y_vel = 0
    score = 0
    wingAngle = 0
    speed = INIT_SPEED
    jump = false
    achievedBestScore = false
}


function setup()
{
    createCanvas(WIDTH, HEIGHT);
    init()
}

function move()
{
    y_dist = y_dist + y_vel * delT
    y_vel = y_vel + GRAVITY
    x_dist += speed
    if (jump && jumpDeadTimer > JUMP_DEAD_TIME)
        {
            y_vel = JUMP_SPEED
            jumpDeadTimer = 0
        }
    jumpDeadTimer += 1
    jump = false;
}


function checkInBounds()
{
    if (y_dist > HEIGHT || y_dist < 0)
        {
            endGame()
        }
}

function checkPipeCollision()
{
    for (pipe of pipes)
        {
        if ((CHAR_X > pipe.x_pos) && (CHAR_X <= (pipe.x_pos + PIPE_WIDTH)))
            {
                if (y_dist < pipe.y_pos || y_dist > pipe.y_pos + pipe.gap)
                    {
                        endGame()
                        return;
                    }
            }
        }
}

function endGame()
{
    gameOver = true;
        if (score > bestScore)
            {
                bestScore = score
                achievedBestScore = true;
            }
        else
            {
                achievedBestScore = false;
            }
}

function draw()
{
    if (gameOver)
        {
            background(0, 0, 0);
            text("GAME OVER", WIDTH / 2, 100);
            text("You reached: " + score + "m", WIDTH/2, 200)
                if (achievedBestScore)
                {
                    text("New personal best!",WIDTH/2, 300 )
                }
                else
                {
                    text("Personal best: " + bestScore + "m", WIDTH / 2, 300);
                }
        fill(255)
        textSize(50);
            if (jump)
            {
                init()
            }
        return;

    }
    checkInBounds()
    checkPipeCollision()
	background(100, 155, 255); // fill the sky blue

    // Draw clouds.
    for (cloud of clouds)
        {
            drawCloud(cloud);
        }
    for (pipe of pipes)
        {
            drawPipe(pipe);
        }

    moveClouds();
    movePipes();

    move()
    score = Math.ceil(x_dist / 50);
	// Draw game character.
	drawGameChar(CHAR_X, y_dist)
    textAlign(CENTER);
    fill(0);
    noStroke();
    textSize(30);
    text("distance: " + score + "m", WIDTH / 2, 30);
    text("best: " + bestScore + "m", WIDTH / 2 + 200, 30);

    jump = false;
    speed += SPEED_INCREMENT;
    if (wingAngle > 0)
        {
            wingAngle /= 1.2
        }
}

function moveClouds()
{
    for (cloud of clouds)
        {
            cloud.x_pos += -CLOUD_SCROLL_SCALE*speed
        }
    if (clouds[0].x_pos < - WIDTH)
        {
            clouds.shift();
            y_pos = Math.random()* (HEIGHT / 2) + 100
            size = Math.random() * 20 + 40
            newCloud = {x_pos: 2*WIDTH, y_pos: y_pos, size: size}
            clouds.push(newCloud)
        }
}

function movePipes()
{
    for (pipe of pipes)
    {
        pipe.x_pos += -speed
    }
    if (pipes[0].x_pos < - PIPE_WIDTH)
        {
            pipes.shift();
            y_pos = Math.random()* (HEIGHT / 2) + 100
            size = Math.random() * 150 + 90
            newPipe = {x_pos: WIDTH + PIPE_WIDTH, y_pos: y_pos, gap: size}
            pipes.push(newPipe)
        }
}

function keyPressed()
{
    if(keyCode == 32)
        {
            jump = true;
            wingAngle = PI / 3
            jumpSound.play();
        }
}


function drawGameChar(x, y)
{
    //head
    push();
     noStroke();
     fill(255, 204, 123);
     ellipse(x, y, 22, 22);
     //eyes
     fill(255);
     ellipse(x + 5, y - 5, 5, 5);
     fill(0);
     ellipse(x + 5, y - 5, 2.5, 2.5);
     // Wing
     fill(255);
     translate(x - 5, y)
     rotate(wingAngle)
     ellipse(-5, 0, 20, 10);

    // // spaceship
    // fill(160, 160, 160)
    // beginShape();
    // vertex(x - 20, y + 20);
    // vertex(x - 10, y + 0);
    // vertex(x - 20, y - 20);
    // vertex(x + 20, y);
    // endShape(CLOSE);
    //
    // // flame
    // fill(255, 128, 0)
    // beginShape();
    // vertex(x - 15, y - 10);
    // vertex(x - 30, y);
    // vertex(x - 15, y + 10);
    // vertex(x - 10, y);
    // endShape(CLOSE);
    pop();


}

function drawCloud(cloud)
{
    push();
    noStroke();
    fill(255);
    ellipse(cloud.x_pos - 100, cloud.y_pos, cloud.size);
    ellipse(cloud.x_pos - 60, cloud.y_pos, cloud.size);
    ellipse(cloud.x_pos - 130, cloud.y_pos, cloud.size, cloud.size/1.2);
    ellipse(cloud.x_pos - 30, cloud.y_pos, cloud.size, cloud.size/1.2);
    pop();
}

function drawPipe(pipe)
{
    push();
    noStroke();
    fill(0, 255, 0);
    rect(pipe.x_pos, 0, PIPE_WIDTH, pipe.y_pos);
    rect(pipe.x_pos - PIPE_LIP, pipe.y_pos - PIPE_LIP, PIPE_WIDTH + 2*PIPE_LIP, PIPE_LIP);
    let h = pipe.y_pos + pipe.gap
    rect(pipe.x_pos, h, PIPE_WIDTH, HEIGHT);
    rect(pipe.x_pos - PIPE_LIP, h - PIPE_LIP, PIPE_WIDTH + 2*PIPE_LIP, PIPE_LIP);
    pop();
}
