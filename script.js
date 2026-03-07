const gameContainer = document.getElementById('game-container');
const chicken = document.getElementById('chicken');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');

let score = 0;
let gameActive = false;
const eggImgSrc = 'pixel_egg.png';

// --- Game Settings ---
const CHICKEN_SPEED = 2000; // ms for transition
const LAY_RATE = 1200; // Lay an egg every 1.2s

// Current Chicken State
let currentX = 50;
let currentY = 50;
let moveInterval, layInterval;

// --- Start Game Logic ---
startBtn.addEventListener('click', () => {
    score = 0;
    scoreDisplay.textContent = score;
    overlay.classList.add('hidden');
    gameActive = true;
    
    // Start intervals
    moveChicken(); // First move
    moveInterval = setInterval(moveChicken, CHICKEN_SPEED);
    layInterval = setInterval(layEgg, LAY_RATE);
});

// --- Walking Chicken Logic ---
function moveChicken() {
    if (!gameActive) return;

    // Random new position
    const nextX = Math.random() * 70 + 10;
    const nextY = Math.random() * 60 + 20;

    // Determine direction (flip image)
    if (nextX > currentX) {
        chicken.style.transform = 'scaleX(1)'; // Face right
    } else {
        chicken.style.transform = 'scaleX(-1)'; // Face left
    }

    chicken.style.left = `${nextX}%`;
    chicken.style.top = `${nextY}%`;

    currentX = nextX;
    currentY = nextY;
}

// --- Egg Laying Logic (From the back!) ---
function layEgg() {
    if (!gameActive) return;

    const egg = document.createElement('div');
    egg.className = 'egg';
    
    // Position egg slightly BEHIND the chicken's current position
    // We use a small timeout to let the chicken move a bit before dropping
    const eggX = currentX;
    const eggY = currentY + 5; 

    egg.style.left = `${eggX}%`;
    egg.style.top = `${eggY}%`;

    const img = document.createElement('img');
    img.src = eggImgSrc;
    egg.appendChild(img);

    // Blast Interaction
    egg.addEventListener('pointerdown', (e) => {
        if (!gameActive) return;
        shatterEgg(egg, e.clientX, e.clientY);
    });

    gameContainer.appendChild(egg);

    // Auto-remove if too old
    setTimeout(() => {
        if (egg.parentNode === gameContainer) {
            egg.style.opacity = '0';
            setTimeout(() => egg.remove(), 500);
        }
    }, 6000);
}

// --- NEW Shatter Blast Logic ---
function shatterEgg(egg, mouseX, mouseY) {
    score += 10;
    scoreDisplay.textContent = score;

    const rect = gameContainer.getBoundingClientRect();
    const x = mouseX - rect.left;
    const y = mouseY - rect.top;

    // Create Shatter Particles (Shell fragments)
    const fragmentCount = 15;
    for (let i = 0; i < fragmentCount; i++) {
        const frag = document.createElement('div');
        frag.className = 'fragment';
        
        // Random shell shape characteristics
        const size = Math.random() * 12 + 4;
        frag.style.width = `${size}px`;
        frag.style.height = `${size}px`;
        frag.style.backgroundColor = i % 3 === 0 ? '#fff' : '#fff9e6';
        frag.style.left = `${x}px`;
        frag.style.top = `${y}px`;
        frag.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        gameContainer.appendChild(frag);

        // Explode outward
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 250 + 100;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;

        frag.animate([
            { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => frag.remove();
    }

    // Shockwave effect
    const shock = document.createElement('div');
    shock.className = 'blast'; // Reuse old blast class for ring effect
    shock.style.left = `${x}px`;
    shock.style.top = `${y}px`;
    gameContainer.appendChild(shock);
    setTimeout(() => shock.remove(), 400);

    egg.remove();
}

// Prevent context menu to keep interaction smooth
window.addEventListener('contextmenu', (e) => e.preventDefault());
