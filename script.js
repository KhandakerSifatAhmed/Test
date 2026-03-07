const gameContainer = document.getElementById('game-container');
const chicken = document.getElementById('chicken');
const scoreDisplay = document.getElementById('score');

let score = 0;
const eggImgSrc = 'pixel_egg.png';

// Game constants
const LAY_INTERVAL = 1500; // Lay an egg every 1.5s
const MOVE_INTERVAL = 2000; // Move chicken every 2s

// Chicken Position State
let chickenX = 50; // percentage
let chickenY = 50; // percentage

// --- Chicken Movement Logic ---
function moveChicken() {
    const maxX = 80;
    const maxY = 80;
    const minX = 10;
    const minY = 10;

    chickenX = Math.random() * (maxX - minX) + minX;
    chickenY = Math.random() * (maxY - minY) + minY;

    chicken.style.left = `${chickenX}%`;
    chicken.style.top = `${chickenY}%`;
}

// --- Egg Laying Logic ---
function layEgg() {
    const egg = document.createElement('div');
    egg.className = 'egg';
    
    // Position egg slightly offset from chicken's center
    const eggX = chickenX + (Math.random() * 5 - 2.5);
    const eggY = chickenY + 5; 

    egg.style.left = `${eggX}%`;
    egg.style.top = `${eggY}%`;

    const img = document.createElement('img');
    img.src = eggImgSrc;
    img.alt = 'Fresh Egg';
    egg.appendChild(img);

    // Click to Blast (Responsive for touch/mouse)
    egg.addEventListener('pointerdown', (e) => {
        blastEgg(egg, e.clientX, e.clientY);
    });

    gameContainer.appendChild(egg);

    // Optional: Eggs fade out/expire after 10s if not clicked
    setTimeout(() => {
        if (egg.parentNode === gameContainer) {
            egg.style.opacity = '0';
            setTimeout(() => {
                if (egg.parentNode === gameContainer) gameContainer.removeChild(egg);
            }, 500);
        }
    }, 10000);
}

// --- Blast Effect Logic ---
function blastEgg(egg, x, y) {
    // Increase Score
    score += 10;
    scoreDisplay.textContent = score;

    // Create Blast Element at click location
    const blast = document.createElement('div');
    blast.className = 'blast';
    
    // Convert click coordinates to container relative
    const rect = gameContainer.getBoundingClientRect();
    const relativeX = x - rect.left;
    const relativeY = y - rect.top;

    blast.style.left = `${relativeX}px`;
    blast.style.top = `${relativeY}px`;

    gameContainer.appendChild(blast);

    // Particle Effect
    createParticles(relativeX, relativeY);

    // Remove egg and blast element
    gameContainer.removeChild(egg);
    setTimeout(() => {
        gameContainer.removeChild(blast);
    }, 400);
}

function createParticles(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = i % 2 === 0 ? '#ffd700' : '#ffffff';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.opacity = '1';
        
        gameContainer.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => particle.remove();
    }
}

// --- Initial Launch ---
moveChicken();
setInterval(moveChicken, MOVE_INTERVAL);
setInterval(layEgg, LAY_INTERVAL);

// Initial Score setup
scoreDisplay.textContent = '0';
