import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy } from './enemies.js';
import { UI } from './UI.js';

window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;

            this.fontColor = 'Black';
            this.groundMargin = 80;

            this.speed = 0; 
            this.maxSpeed = 5;

            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);

            this.maxParticles = 50;
            this.enemies = [];
            this.particles = [];
            this.collisions = [];

            this.enemyTimer = 0;
            this.enemyInterval = 2000;

            this.debug = false;

            this.score = 0;
            this.scoreToWin = 40;

            this.time = 0;
            this.maxTime = 60000;

            this.state = 'HOME'; // HOME | PLAYING | GAMEOVER

            this.gameOverTimer = 0;

            this.fps = 0;

            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }

        resetGame(){
            this.score = 0;
            this.time = 0;

            this.enemies = [];
            this.particles = [];
            this.collisions = [];

            this.enemyTimer = 0;

            this.player.energy = this.player.maxEnergy;
            this.player.x = 0;
            this.player.y = this.height - this.player.height - this.groundMargin;
            this.player.vy = 0;

            this.player.setState(0, 0);
        }

        update(deltaTime){

            // -------------------------
            // HOME
            // -------------------------
            if (this.state === 'HOME') return;

            // -------------------------
            // GAME OVER
            // -------------------------
            if (this.state === 'GAMEOVER') {
                this.gameOverTimer += deltaTime;

                if (this.gameOverTimer > 2000) {
                    this.gameOverTimer = 0;
                    this.state = 'HOME';
                    this.resetGame();
                }

                return;
            }

            // -------------------------
            // PLAYING
            // -------------------------
            this.time += deltaTime;

            if (this.time > this.maxTime || this.score >= this.scoreToWin) {
                this.state = 'GAMEOVER';
            }

            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            this.enemyInterval =
                this.player.currentState === this.player.states[4]
                ? 2000 / 3
                : 2000;

            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
                if (enemy.markedForDeletion)
                    this.enemies.splice(this.enemies.indexOf(enemy), 1);
            });

            this.particles.forEach(particle => {
                particle.update();
                if (particle.markedForDeletion)
                    this.particles.splice(this.particles.indexOf(particle), 1);
            });

            if (this.particles.length > this.maxParticles) {
                this.particles = this.particles.slice(0, this.maxParticles);
            }

            this.collisions.forEach(collision => {
                collision.update(deltaTime);
                if (collision.markedForDeletion)
                    this.collisions.splice(this.collisions.indexOf(collision), 1);
            });
        }

        draw(context){

            // -------------------------
            // HOME SCREEN
            // -------------------------
            if (this.state === 'HOME') {
                context.fillStyle = 'black';
                context.fillRect(0, 0, this.width, this.height);

                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.font = '40px Helvetica';
                context.fillText('PLAY', this.width / 2, this.height / 2);

                return;
            }

            // -------------------------
            // GAME WORLD
            // -------------------------
            this.background.draw(context);
            this.player.draw(context);

            this.enemies.forEach(enemy => enemy.draw(context));
            this.particles.forEach(particle => particle.draw(context));
            this.collisions.forEach(collision => collision.draw(context));

            this.UI.draw(context);
        }

        addEnemy(){
            if ((this.speed > 0) && (Math.random() < 0.5))
                this.enemies.push(new GroundEnemy(this));
            else if ((this.speed > 0) && (Math.random() >= 0.5))
                this.enemies.push(new ClimbingEnemy(this));

            this.enemies.push(new FlyingEnemy(this));
        }
    }

    const game = new Game(canvas.width, canvas.height);

    let lastTime = 0;

    // -------------------------
    // FPS CAP
    // -------------------------
    const fpsCap = 60;
    const frameInterval = 1000 / fpsCap;
    let frameTimer = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        frameTimer += deltaTime;

        if (frameTimer >= frameInterval) {
            game.fps = Math.round(1000 / frameTimer);
            frameTimer = 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            game.update(deltaTime);
            game.draw(ctx);
        }

        requestAnimationFrame(animate);
    }

    animate(0);

    // -------------------------
    // START GAME FROM HOME
    // -------------------------
    canvas.addEventListener('click', () => {
        if (game.state === 'HOME') {
            game.state = 'PLAYING';
        }
    });
});