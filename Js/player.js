import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from './playerStates.js'
import { CollisionAnimation } from './collisionAnimation.js';

export class Player {
    constructor(game){
        this.game = game;
        this.width = 100;
        this.height= 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.vy = 0;
        this.weight = 1;
        this.image = document.getElementById('player');
        this.framex = 0;
        this.framey = 0;
        this.maxFrame;
        this.fps = 20;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyConsumptionRate = 20;
        this.energyRegenerationRate = 20; 
        this.energyRegenerationDelay = 5000;
        this.energyReturnTimer = 0;
        this.isRegenerating = false;
        this.speed = 0;
        this.maxSpeed = 15;
        this.states = [
            new Sitting(this.game),
            new Running(this.game),
            new Jumping(this.game),
            new Falling(this.game),
            new Rolling(this.game),
            new Diving(this.game),
            new Hit(this.game)
        ];
    }

update(input, deltaTime) {
    this.checkCollision();
    this.currentState.handleInput(input);
    //horizontal movement
    if (this.currentState != this.states[6]) {
        this.x += this.speed;
        if (input.includes('ArrowRight')) this.speed = this.maxSpeed;
        else if (input.includes('ArrowLeft')) this.speed = -this.maxSpeed;
        else this.speed = 0;
    }
    // horizontal boundaries
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width) {
        this.x = this.game.width - this.width;
    }
    // vertical movement
    this.y += this.vy;
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;
    // vertical boundaries
    if (this.y > this.game.height - this.height - this.game.groundMargin) {
        this.y = this.game.height - this.height - this.game.groundMargin;
    }
    //animate
    if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0;
        if (this.framex < this.maxFrame) this.framex++;
        else this.framex = 0;
    } else {
        this.frameTimer += deltaTime;
    }
    // energy
    const dt = deltaTime / 1000;
    const isRolling = this.currentState === this.states[4];
    if (isRolling && this.energy > 0) {
        this.energy -= this.energyConsumptionRate * dt;
        this.isRegenerating = false;
        this.energyReturnTimer = 0;
        if (this.energy <= 0) {
            this.energy = 0;
            this.energyReturnTimer = 0;
        }
    }
    else if (this.energy === 0 && !this.isRegenerating) {
        this.energyReturnTimer += deltaTime;

        if (this.energyReturnTimer >= this.energyRegenerationDelay) {
            this.isRegenerating = true;
        }
    }
    if (this.isRegenerating && !isRolling) {
        this.energy += this.energyRegenerationRate * dt;
        if (this.energy >= this.maxEnergy) {
            this.energy = this.maxEnergy;
            this.isRegenerating = false;
        }
    }
}

draw(context) {
    if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    context.drawImage(
        this.image,
        this.framex * this.width,
        this.framey * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
    );
}

onGround() {
    return this.y >= this.game.height - this.height - this.game.groundMargin;
}

setState(state, speed){
    this.currentState = this.states[state];
    this.game.speed = this.game.maxSpeed * speed;
    this.currentState.enter();
}

checkCollision(){
    this.game.enemies.forEach(enemy => {
        if (
            enemy.x < this.x + this.width && 
            enemy.x + enemy.width > this.x &&
            enemy.y < this.y + this.height &&
            enemy.y + enemy.height > this.y
        ){
            enemy.markedForDeletion = true;

            this.game.collisions.push(
                new CollisionAnimation(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                )
            );

            if (this.currentState === this.states[4]) {
                this.game.score++;
            } else if (this.currentState === this.states[5]) {
                this.game.score++;
            } else {
                this.setState(6, 0);
            }
        } 
    });
    }
}