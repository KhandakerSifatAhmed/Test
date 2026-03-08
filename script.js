/**
 * Sneha City Run - Endless Runner Logic
 */

class AudioManager {
    constructor() {
        this.enabled = true;
        this.sounds = {
            lay: document.getElementById('sfx-lay'),
            break: document.getElementById('sfx-break'),
            over: document.getElementById('sfx-over'),
            level: document.getElementById('sfx-level')
        };
    }
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(() => {});
    }
}

class Game {
    constructor() {
        this.audio = new AudioManager();
        this.score = 0;
        this.level = 1;
        this.gameActive = false;
        this.lastTime = 0;
        
        this.lane = 1; // 0: Left, 1: Center, 2: Right
        this.laneX = [20, 50, 80]; // Percentage widths
        
        this.objects = [];
        this.spawnTimer = 0;
        this.eggTimer = 0;
        
        this.isJumping = false;
        this.isSliding = false;
        this.baseSpeed = 400;

        this.initUI();
        this.initControls();
        this.runSplash();
    }

    initUI() {
        this.ui = {
            splash: document.getElementById('splash-screen'),
            clock: document.getElementById('splash-clock'),
            message: document.getElementById('splash-message'),
            menu: document.getElementById('main-menu'),
            gameOver: document.getElementById('game-over-screen'),
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            sneha: document.getElementById('sneha'),
            snehaImg: document.getElementById('sneha-img'),
            finalScore: document.getElementById('final-score'),
            highScore: document.getElementById('high-score-total')
        };

        document.getElementById('start-btn').onclick = () => this.startGame();
        document.getElementById('restart-btn').onclick = () => this.startGame();
        document.getElementById('menu-btn-over').onclick = () => this.showMenu();
    }

    initControls() {
        let touchStartX = 0, touchStartY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 30) this.changeLane(1);
                else if (dx < -30) this.changeLane(-1);
            } else {
                if (dy < -30) this.jump();
                else if (dy > 30) this.slide();
            }
        }, { passive: false });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.changeLane(-1);
            if (e.key === 'ArrowRight') this.changeLane(1);
            if (e.key === 'ArrowUp') this.jump();
            if (e.key === 'ArrowDown') this.slide();
        });
    }

    runSplash() {
        let sc = 50;
        const it = setInterval(() => {
            sc++;
            this.ui.clock.textContent = `11:59:${sc}`;
            if (sc >= 60) {
                clearInterval(it);
                this.ui.clock.textContent = "12:00:00";
                this.ui.snehaImg.src = 'sneha_awake.png';
                this.ui.message.textContent = "Sneha wakes up!";
                setTimeout(() => {
                    this.ui.splash.classList.add('hidden');
                    this.ui.menu.classList.remove('hidden');
                }, 1500);
            }
        }, 100);
    }

    startGame() {
        this.score = 0; this.level = 1; this.lane = 1;
        this.objects.forEach(o => o.el.remove());
        this.objects = [];
        this.gameActive = true;
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.eggTimer = 1;
        
        this.ui.menu.classList.add('hidden');
        this.ui.gameOver.classList.add('hidden');
        this.ui.sneha.classList.add('running');
        this.ui.sneha.style.left = `${this.laneX[this.lane]}%`;
        
        this.updateUI();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        if (!this.gameActive) return;
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this.spawnObstacle();
            this.spawnTimer = Math.max(0.6, 2.0 - (this.level * 0.1));
        }

        this.eggTimer -= dt;
        if (this.eggTimer <= 0) {
            this.spawnEgg();
            this.eggTimer = Math.random() * 2 + 1;
        }

        this.updateObjects(dt);
        this.checkCollisions();
        requestAnimationFrame((t) => this.loop(t));
    }

    changeLane(dir) {
        if (!this.gameActive) return;
        this.lane = Math.max(0, Math.min(2, this.lane + dir));
        this.ui.sneha.style.left = `${this.laneX[this.lane]}%`;
    }

    jump() {
        if (this.isJumping || this.isSliding) return;
        this.isJumping = true;
        this.ui.sneha.classList.add('jumping');
        setTimeout(() => {
            this.isJumping = false;
            this.ui.sneha.classList.remove('jumping');
        }, 600);
    }

    slide() {
        if (this.isJumping || this.isSliding) return;
        this.isSliding = true;
        this.ui.sneha.classList.add('sliding');
        setTimeout(() => {
            this.isSliding = false;
            this.ui.sneha.classList.remove('sliding');
        }, 500);
    }

    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3);
        const types = ['box', 'car', 'fence'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const el = document.createElement('div');
        el.className = `obstacle ${type}`;
        el.style.left = `${this.laneX[lane]}%`;
        el.style.top = `-100px`;
        if (type === 'box') el.textContent = '📦';
        if (type === 'car') el.textContent = '🚗';
        if (type === 'fence') el.textContent = '🚧';
        
        document.getElementById('game-world').appendChild(el);
        this.objects.push({ el, lane, type, y: -100, active: true });
    }

    spawnEgg() {
        const lane = Math.floor(Math.random() * 3);
        const el = document.createElement('div');
        el.className = 'egg';
        el.style.left = `${this.laneX[lane]}%`;
        el.style.top = `-100px`;
        el.onpointerdown = (e) => {
            e.preventDefault();
            this.breakEgg(el);
        };
        
        document.getElementById('game-world').appendChild(el);
        this.objects.push({ el, lane, type: 'egg', y: -100, active: true });
    }

    breakEgg(el) {
        const obj = this.objects.find(o => o.el === el);
        if (obj && obj.active) {
            obj.active = false;
            el.remove();
            this.score += 10;
            this.audio.play('break');
            if (this.score % 100 === 0) {
                this.level++;
                this.audio.play('level');
            }
            this.updateUI();
        }
    }

    updateObjects(dt) {
        const speed = this.baseSpeed + (this.level * 50);
        this.objects.forEach(o => {
            o.y += speed * dt;
            o.el.style.top = `${o.y}px`;
            
            // Perspective scaling
            const scale = 0.5 + (o.y / window.innerHeight) * 1.5;
            o.el.style.transform = `translateX(-50%) scale(${scale})`;

            if (o.y > window.innerHeight) {
                o.el.remove();
                o.active = false;
            }
        });
        this.objects = this.objects.filter(o => o.active);
    }

    checkCollisions() {
        const snehaRect = this.ui.sneha.getBoundingClientRect();
        this.objects.forEach(o => {
            if (o.type !== 'egg') {
                const oRect = o.el.getBoundingClientRect();
                if (this.isRectColliding(snehaRect, oRect)) {
                    // Skill-based dodging
                    if (o.type === 'fence' && this.isJumping) return;
                    if (o.type === 'car' && this.isSliding) return;
                    this.endGame();
                }
            }
        });
    }

    isRectColliding(r1, r2) {
        return !(r2.left > r1.right - 15 || 
                 r2.right < r1.left + 15 || 
                 r2.top > r1.bottom - 15 ||
                 r2.bottom < r1.top + 15);
    }

    updateUI() {
        this.ui.score.textContent = this.score;
        this.ui.level.textContent = this.level;
    }

    endGame() {
        this.gameActive = false;
        this.audio.play('over');
        this.ui.sneha.classList.remove('running');
        this.ui.finalScore.textContent = this.score;
        const hi = localStorage.getItem('hi_runner') || 0;
        if (this.score > hi) localStorage.setItem('hi_runner', this.score);
        this.ui.highScore.textContent = localStorage.getItem('hi_runner');
        this.ui.gameOver.classList.remove('hidden');
    }

    showMenu() {
        this.ui.gameOver.classList.add('hidden');
        this.ui.menu.classList.remove('hidden');
    }
}

window.onload = () => { window.game = new Game(); };
