const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const startBtn = document.getElementById('start-btn');

// Game constants
const gridSize = 20;
let tileCount;
let tileSize;

// Game state
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoopId;

let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let lastUpdateTime = 0;
let gameSpeed = 150; // ms per move

// Initialize
function init() {
    resizeCanvas();
    highScoreElement.textContent = formatScore(highScore);
    
    // Update msg for mobile
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        overlayMsg.textContent = "Tap Start to Play";
    }
    
    resetGame();
}

function resizeCanvas() {
    const size = canvas.clientWidth;
    canvas.width = size;
    canvas.height = size;
    tileCount = gridSize;
    tileSize = canvas.width / tileCount;
}

function formatScore(num) {
    return num.toString().padStart(3, '0');
}

function resetGame() {
    score = 0;
    scoreElement.textContent = formatScore(score);
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    nextDx = 0;
    nextDy = -1;
    createFood();
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Ensure food doesn't land on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        createFood();
    }
}

function startGame() {
    if (gameRunning) return;
    resetGame();
    gameRunning = true;
    overlay.classList.add('hidden');
    lastUpdateTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    overlay.classList.remove('hidden');
    overlayTitle.textContent = "GAME OVER";
    overlayMsg.textContent = `You scored ${score} points!`;
    startBtn.textContent = "TRY AGAIN";
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = formatScore(highScore);
    }
}

// Input handling
window.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { nextDx = 0; nextDy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { nextDx = 1; nextDy = 0; }
            break;
        case ' ':
            if (!gameRunning) startGame();
            break;
    }
});

startBtn.addEventListener('click', startGame);

// Mobile Controls
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (dy !== 1) { nextDx = 0; nextDy = -1; } });
downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (dy !== -1) { nextDx = 0; nextDy = 1; } });
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (dx !== 1) { nextDx = -1; nextDy = 0; } });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (dx !== -1) { nextDx = 1; nextDy = 0; } });

// Also add click for debugging on desktop or for non-touch mobile browsers
upBtn.addEventListener('click', () => { if (dy !== 1) { nextDx = 0; nextDy = -1; } });
downBtn.addEventListener('click', () => { if (dy !== -1) { nextDx = 0; nextDy = 1; } });
leftBtn.addEventListener('click', () => { if (dx !== 1) { nextDx = -1; nextDy = 0; } });
rightBtn.addEventListener('click', () => { if (dx !== -1) { nextDx = 1; nextDy = 0; } });

window.addEventListener('resize', resizeCanvas);

// Prevent scrolling on mobile when touching the game
document.body.addEventListener('touchmove', (e) => {
    if (gameRunning) e.preventDefault();
}, { passive: false });

// Game Loop
function gameLoop(currentTime) {
    if (!gameRunning) return;

    requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastUpdateTime;
    if (deltaTime < gameSpeed) return;

    lastUpdateTime = currentTime;
    update();
    draw();
}

function update() {
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = formatScore(score);
        createFood();
        // Speed up slightly
        if (gameSpeed > 70) gameSpeed -= 1;
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }

    // Draw Food
    const foodPadding = tileSize * 0.2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007a';
    ctx.fillStyle = '#ff007a';
    ctx.beginPath();
    ctx.arc(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        (tileSize / 2) - foodPadding,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const padding = isHead ? 2 : 3;
        
        ctx.shadowBlur = isHead ? 10 : 0;
        ctx.shadowColor = '#00f2ff';
        
        // Gradient color based on position
        const alpha = 1 - (index / snake.length) * 0.6;
        ctx.fillStyle = isHead ? '#00f2ff' : `rgba(112, 0, 255, ${alpha})`;
        
        drawRoundedRect(
            segment.x * tileSize + padding,
            segment.y * tileSize + padding,
            tileSize - padding * 2,
            tileSize - padding * 2,
            isHead ? 6 : 4
        );
    });
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
}

// Initial Call
init();
draw(); // Draw initial state
