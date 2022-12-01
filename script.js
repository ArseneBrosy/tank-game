var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var canvasLifeP1 = document.getElementById('lifeP1');
var contextLifeP1 = canvasLifeP1.getContext('2d');
var canvasLifeP2 = document.getElementById('lifeP2');
var contextLifeP2 = canvasLifeP2.getContext('2d');

var bombsP1cont = document.getElementById("bombsP1");
var bombsP2cont = document.getElementById("bombsP2");

//#region global variables
var playerBase = {
    w: 50,
    h: 50,
    rSpeed: 3,
    speed: 3,
    bulletPos: 25,
    bulletSpeed: 20,
    bulletRadius: 6,
    fireRate: 300,
    bulletDamage: 1,
    maxLife: 5
}
// players
var player1 = {
    x: 50,
    y: 50,
    r: 135,
    fireTime: 0,
    life: playerBase.maxLife,
    bombs: 3
};
var p1Bullets = [];
var player2 = {
    x: canvas.width - 50,
    y: canvas.height - 50,
    r: 315,
    fireTime: 0,
    life: playerBase.maxLife,
    bombs: 3
};
var p2Bullets = [];

var winner = 0;

// speeds
var _rSpeed1 = 0;
var _dir1 = 0;
var _xSpeed1 = 0;
var _ySpeed1 = 0;

var _rSpeed2 = 0;
var _dir2 = 0;
var _xSpeed2 = 0;
var _ySpeed2 = 0;

// images
var playerImg = new Image();
playerImg.src = 'sprites/tank.png';
var groundImg = new Image();
groundImg.src = 'sprites/ground.jpg';
var mineImg = new Image();
mineImg.src = 'sprites/mine.png';

// ground tiles
var tilesX = 4;
var tilesY = 4;

// walls
var walls = []
var wallsSize = 75;
var fWallPercent = 80;
var wallBorderSize = 3;

// mines
var mines = [];
var mineSize = 30;
//#endregion

//#region Life Sliders
//fonts
contextLifeP1.font = "300% roboto";
contextLifeP2.font = "300% roboto";
context.font = "300% roboto";

//life slider p1
contextLifeP1.clearRect(0,0,canvasLifeP1.width,canvasLifeP1.height);
contextLifeP1.fillStyle = "red";
contextLifeP1.fillRect(3, 3, (canvasLifeP1.width - 6) / playerBase.maxLife * player1.life, canvasLifeP1.height - 6);
contextLifeP1.fillStyle = "white";
contextLifeP1.fillText(player1.life.toString(), canvasLifeP1.width / 2 - 12, canvasLifeP1.height - 8);

//life slider p2
contextLifeP2.clearRect(0,0,canvasLifeP2.width,canvasLifeP2.height);
contextLifeP2.fillStyle = "blue";
contextLifeP2.fillRect(3, 3, (canvasLifeP2.width - 6) / playerBase.maxLife * player2.life, canvasLifeP2.height - 6);
contextLifeP2.fillStyle = "white";
contextLifeP2.fillText(player2.life.toString(), canvasLifeP2.width / 2 - 12, canvasLifeP2.height - 8);
//#endregion

//#region GENERATE WALL
var sizeX = canvas.width / wallsSize;
var sizeY = canvas.height / wallsSize;
// first walls
for (var y = 0; y < sizeY; y++) {
    for (var x = 0; x < sizeX; x++) {
        if (y % 2 == 0 && x % 2 == 0 && x < sizeX - 2 && y < sizeY - 2 && !(x == 0 && y == 0) && !(x >= sizeX - 3 && y >= sizeY - 3) && getRandomInt(0, 100) <= fWallPercent) {
            var newWall = [0, 0, 0, 0];
            newWall[0] = (x + 1) * wallsSize;
            newWall[1] = (y + 1) * wallsSize;
            newWall[2] = (x + 2) * wallsSize;
            newWall[3] = (y + 2) * wallsSize;
            walls.push(newWall);
        }
    }
}
// second walls
var sWalls = [];
for (var i = 0; i < walls.length; i++) {
    var pos = getRandomInt(0, 4);
    if (pos == 0) {
        var newWall = [0, 0, 0, 0];
        newWall[0] = walls[i][0] + wallsSize;
        newWall[1] = walls[i][1];
        newWall[2] = walls[i][2] + wallsSize;
        newWall[3] = walls[i][3];
        sWalls.push(newWall);
    }
    if (pos == 1) {
        var newWall = [0, 0, 0, 0];
        newWall[0] = walls[i][0];
        newWall[1] = walls[i][1] + wallsSize;
        newWall[2] = walls[i][2];
        newWall[3] = walls[i][3] + wallsSize;
        sWalls.push(newWall);
    }
    if (pos == 2) {
        var newWall = [0, 0, 0, 0];
        newWall[0] = walls[i][0] - wallsSize;
        newWall[1] = walls[i][1];
        newWall[2] = walls[i][2] - wallsSize;
        newWall[3] = walls[i][3];
        sWalls.push(newWall);
    }
    if (pos == 3) {
        var newWall = [0, 0, 0, 0];
        newWall[0] = walls[i][0];
        newWall[1] = walls[i][1] - wallsSize;
        newWall[2] = walls[i][2];
        newWall[3] = walls[i][3] - wallsSize;
        sWalls.push(newWall);
    }
}
for (var i = 0; i < sWalls.length; i++) {
    walls.push(sWalls[i]);
}
//#endregion

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function placeMine(player) {
    var newMine = [player == 0 ? player1.x : player2.x, player == 0 ? player1.y : player2.y, player];
    if (player == 0) {
        player1.bombs --;
    } else {
        player2.bombs --;
    }
    mines.push(newMine);
}

// end
function drawEndScreen() {
    context.clearRect(0,0,canvas.width,canvas.height);
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            context.drawImage(groundImg, canvas.width / tilesX * x, canvas.height / tilesY * y, canvas.width / tilesX, canvas.height / tilesY);
        }
    }
    context.fillStyle = "white";
    context.fillText("Joueur " + (winner == 1 ? "rouge" : "bleu") + " l'emporte !", 35, canvas.height / 2);
}

function isInWall(x, y, margin = 0) {
    var result = false;
    for (var i = 0; i < walls.length; i++) {
        if (x >= walls[i][0] - margin && x <= walls[i][2] + margin && y >= walls[i][1] - margin && y <= walls[i][3] + margin) {
            result = true;
        }
    }
    return result;
}

// game loop
function loop() {
    if (winner == 0) {
        requestAnimationFrame(loop);
    } else {
        drawEndScreen();
        return;
    }
    
    context.clearRect(0,0,canvas.width,canvas.height);
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            context.drawImage(groundImg, canvas.width / tilesX * x, canvas.height / tilesY * y, canvas.width / tilesX, canvas.height / tilesY);
        }
    }

    //#region DRAWMINES
    for (var i = 0; i < mines.length; i++) {
        context.drawImage(mineImg, mines[i][0] - mineSize / 2, mines[i][1] - mineSize / 2, mineSize, mineSize);
    }
    //#endregion

    //#region PLAYER1
    // draw player 1
    context.translate(player1.x, player1.y);
    context.rotate(player1.r * (Math.PI/180));
    context.drawImage(playerImg, -playerBase.w / 2, -playerBase.h / 2, playerBase.w, playerBase.h);
    context.rotate(-player1.r * (Math.PI/180));
    context.translate(-player1.x, -player1.y);

    // draw color
    context.fillStyle = "red";
    context.beginPath();
    context.arc(player1.x, player1.y, 7, 0, 2 * Math.PI);
    context.fill();

    // move player 1
    _xSpeed1 = Math.cos((player1.r - 90) * (Math.PI/180)) * playerBase.speed * _dir1;
    _ySpeed1 = Math.sin((player1.r - 90) * (Math.PI/180)) * playerBase.speed * _dir1;
    if (!isInWall(player1.x + _xSpeed1, player1.y, 25)) {
        player1.x += _xSpeed1;
    }
    if (!isInWall(player1.x, player1.y + _ySpeed1, 25)) {
        player1.y += _ySpeed1;
    }
    player1.r += _rSpeed1;

    // clamp player 1 position
    if (player1.x >= canvas.width - 25) {
        player1.x = canvas.width - 25;
    }
    if (player1.x <= 25) {
        player1.x = 25;
    }
    if (player1.y >= canvas.height - 25) {
        player1.y = canvas.height - 25;
    }
    if (player1.y <= 25) {
        player1.y = 25;
    }

    // death
    if (player1.life <= 0) {
        winner = 2;
    }

    // bombs
    bombsP1cont.innerHTML = "";
    for (var i = 0; i < player1.bombs; i++) {
        bombsP1cont.innerHTML += '<img src="' + mineImg.src + '" height="50px", width="50px">';
    }
    //#endregion

    //#region PLAYER2
    // draw player 2
    context.translate(player2.x, player2.y);
    context.rotate(player2.r * (Math.PI/180));
    context.drawImage(playerImg, -playerBase.w / 2, -playerBase.h / 2, playerBase.w, playerBase.h);
    context.rotate(-player2.r * (Math.PI/180));
    context.translate(-player2.x, -player2.y);

    // draw color
    context.fillStyle = "blue";
    context.beginPath();
    context.arc(player2.x, player2.y, 7, 0, 2 * Math.PI);
    context.fill();
    
    // move player 2
    _xSpeed2 = Math.cos((player2.r - 90) * (Math.PI/180)) * playerBase.speed * _dir2;
    _ySpeed2 = Math.sin((player2.r - 90) * (Math.PI/180)) * playerBase.speed * _dir2;
    if (!isInWall(player2.x + _xSpeed2, player2.y, 25)) {
        player2.x += _xSpeed2;
    }
    if (!isInWall(player2.x, player2.y + _ySpeed2, 25)) {
        player2.y += _ySpeed2;
    }
    player2.r += _rSpeed2;
    
    // clamp player 2 position
    if (player2.x >= canvas.width - 25) {
        player2.x = canvas.width - 25;
    }
    if (player2.x <= 25) {
        player2.x = 25;
    }
    if (player2.y >= canvas.height - 25) {
        player2.y = canvas.height - 25;
    }
    if (player2.y <= 25) {
        player2.y = 25;
    }

    // death
    if (player2.life <= 0) {
        winner = 1;
    }

    // bombs
    bombsP2cont.innerHTML = "";
    for (var i = 0; i < player2.bombs; i++) {
        bombsP2cont.innerHTML += '<img src="' + mineImg.src + '" height="50px", width="50px">';
    }
    //#endregion

    //#region DRAWWALLS
    for (var i = 0; i < walls.length; i++) {
        // background
        context.fillStyle = "#E2E289";
        context.fillRect(walls[i][0] - 1, walls[i][1] - 1, walls[i][2] - walls[i][0] + 2, walls[i][3] - walls[i][1] + 2);
        //#region BORDERS
        context.fillStyle = "white"
        // left
        if (!isInWall(walls[i][0] - (wallsSize / 2), walls[i][1] + (wallsSize / 2))) {
            context.fillRect(walls[i][0] - 1, walls[i][1] - 1, wallBorderSize, walls[i][3] - walls[i][1] + 2);
        }
        // right
        if (!isInWall(walls[i][2] + (wallsSize / 2), walls[i][1] + (wallsSize / 2))) {
            context.fillRect(walls[i][2] - wallBorderSize + 1, walls[i][1] - 1, wallBorderSize, walls[i][3] - walls[i][1] + 2);
        }
        // up
        if (!isInWall(walls[i][0] + (wallsSize / 2), walls[i][1] - (wallsSize / 2))) {
            context.fillRect(walls[i][0] - 1, walls[i][1] - 1, walls[i][2] - walls[i][0] + 2, wallBorderSize);
        }
        // down
        if (!isInWall(walls[i][0] + (wallsSize / 2), walls[i][3] + (wallsSize / 2))) {
            context.fillRect(walls[i][0] - 1, walls[i][3] - wallBorderSize + 1, walls[i][2] - walls[i][0] + 2, wallBorderSize);
        }
        //#endregion
    }
    //#endregion

    //#region P1BULLETS
    context.fillStyle = "red"
    for(var i = 0; i < p1Bullets.length; i++) {
        // move
        p1Bullets[i][0] += Math.cos((p1Bullets[i][2] - 90) * (Math.PI/180)) * playerBase.bulletSpeed;
        p1Bullets[i][1] += Math.sin((p1Bullets[i][2] - 90) * (Math.PI/180)) * playerBase.bulletSpeed;
        // draw
        context.beginPath();
        context.arc(p1Bullets[i][0], p1Bullets[i][1], playerBase.bulletRadius, 0, 2 * Math.PI);
        context.fill();
        // remove
        if (p1Bullets[i][0] < 0 || p1Bullets[i][0] > canvas.width || p1Bullets[i][1] < 0 || p1Bullets[i][1] > canvas.height) {
            p1Bullets.splice(i, 1);
        }
        // hit wall
        if (isInWall(p1Bullets[i][0], p1Bullets[i][1], playerBase.bulletRadius / 2)) {
            p1Bullets.splice(i, 1);
        }
        // hit ennemy
        else if (Math.sqrt(Math.pow(player2.x - p1Bullets[i][0], 2) + Math.pow(player2.y - p1Bullets[i][1], 2)) <= 30) {
            player2.life -= playerBase.bulletDamage;
            p1Bullets.splice(i, 1);

            //life slider
            contextLifeP2.clearRect(0,0,canvasLifeP2.width,canvasLifeP2.height);
            contextLifeP2.fillStyle = "blue";
            contextLifeP2.fillRect(3, 3, (canvasLifeP2.width - 6) / playerBase.maxLife * player2.life, canvasLifeP2.height - 6);
            contextLifeP2.fillStyle = "white";
            contextLifeP2.fillText(player2.life.toString(), canvasLifeP2.width / 2 - 12, canvasLifeP2.height - 8);
        }
    }
    //#endregion

    //#region P2BULLETS
    context.fillStyle = "blue"
    for(var i = 0; i < p2Bullets.length; i++) {
        // move
        p2Bullets[i][0] += Math.cos((p2Bullets[i][2] - 90) * (Math.PI/180)) * playerBase.bulletSpeed;
        p2Bullets[i][1] += Math.sin((p2Bullets[i][2] - 90) * (Math.PI/180)) * playerBase.bulletSpeed;
        // draw
        context.beginPath();
        context.arc(p2Bullets[i][0], p2Bullets[i][1], playerBase.bulletRadius, 0, 2 * Math.PI);
        context.fill();
        // remove
        if (p2Bullets[i][0] < 0 || p2Bullets[i][0] > canvas.width || p2Bullets[i][1] < 0 || p2Bullets[i][1] > canvas.height) {
            p2Bullets.splice(i, 1);
        }
        // hit wall
        if (isInWall(p2Bullets[i][0], p2Bullets[i][1], playerBase.bulletRadius / 2)) {
            p2Bullets.splice(i, 1);
        }
        // hit ennemy
        else if (Math.sqrt(Math.pow(player1.x - p2Bullets[i][0], 2) + Math.pow(player1.y - p2Bullets[i][1], 2)) <= 30) {
            player1.life -= playerBase.bulletDamage;
            p2Bullets.splice(i, 1);

            //life slider
            contextLifeP1.clearRect(0,0,canvasLifeP1.width,canvasLifeP1.height);
            contextLifeP1.fillStyle = "red";
            contextLifeP1.fillRect(3, 3, (canvasLifeP1.width - 6) / playerBase.maxLife * player1.life, canvasLifeP1.height - 6);
            contextLifeP1.fillStyle = "white";
            contextLifeP1.fillText(player1.life.toString(), canvasLifeP1.width / 2 - 12, canvasLifeP1.height - 8);
        }
    }
    //#endregion
}

// inputs
document.addEventListener('keydown', function(e) {
    console.log(e.which);
    // player 1
    if (e.which === 65) {
        _rSpeed1 = -playerBase.rSpeed;
    }
    if (e.which === 68) {
        _rSpeed1 = playerBase.rSpeed;
    }
    if (e.which === 87) {
        _dir1 = 1;
    }
    if (e.which === 83) {
        _dir1 = -1
    }
    if (e.which === 226) {
        placeMine(0);
    }

    // player 2
    if (e.which === 37) {
        _rSpeed2 = -playerBase.rSpeed;
    }
    if (e.which === 39) {
        _rSpeed2 = playerBase.rSpeed;
    }
    if (e.which === 38) {
        _dir2 = 1;
    }
    if (e.which === 40) {
        _dir2 = -1
    }
    if (e.which === 16) {
        placeMine(1);
    }

    // player 1 fire
    if (e.which === 32 && player1.fireTime + playerBase.fireRate <= Date.now()) {
        var newBullet = [3];
        newBullet[0] = player1.x + (Math.cos((player1.r - 90) * (Math.PI/180)) * playerBase.bulletPos);
        newBullet[1] = player1.y + (Math.sin((player1.r - 90) * (Math.PI/180)) * playerBase.bulletPos);
        newBullet[2] = player1.r;
        player1.fireTime = Date.now();
        p1Bullets.push(newBullet);
    }
    
    // player 2 fire
    if ((e.which === 96 || e.which == 45) && player2.fireTime + playerBase.fireRate <= Date.now()) {
        var newBullet = [3];
        newBullet[0] = player2.x + (Math.cos((player2.r - 90) * (Math.PI/180)) * playerBase.bulletPos);
        newBullet[1] = player2.y + (Math.sin((player2.r - 90) * (Math.PI/180)) * playerBase.bulletPos);
        newBullet[2] = player2.r;
        player2.fireTime = Date.now();
        p2Bullets.push(newBullet);
    }
});
document.addEventListener('keyup', function(e) {
    // player 1
    if (e.which === 65 || e.which === 68) {
        _rSpeed1 = 0;
    }
    if (e.which === 87 || e.which === 83) {
        _dir1 = 0;
    }

    // player 2
    if (e.which === 37 || e.which === 39) {
        _rSpeed2 = 0;
    }
    if (e.which === 38 || e.which === 40) {
        _dir2 = 0;
    }
});

// start the game
requestAnimationFrame(loop);
