export class UI {
    constructor(game){
        this.game = game;
        this.fontSize = 30;
        this.fontFamily = 'Helvetica';
    }

    draw(context){
        context.save();

        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0;

        context.textAlign = 'left';
        context.fillStyle = this.game.fontColor;

        // ------------------
        // SCORE
        // ------------------
        context.font = this.fontSize + 'px ' + this.fontFamily;
        context.fillText('score: ' + this.game.score, 20, 50);

        // ------------------
        // TIMER
        // ------------------
        context.font = this.fontSize * 0.8 + 'px ' + this.fontFamily;
        context.fillText('Time: ' + (this.game.time * 0.001).toFixed(1), 20, 80);

        // ------------------
        // ENERGY BAR
        // ------------------
        const barX = 20;
        const barY = 95;
        const barWidth = 200;
        const barHeight = 15;

        const energy = this.game.player.energy;
        const maxEnergy = this.game.player.maxEnergy;
        const energyRatio = energy / maxEnergy;

        // background
        context.fillStyle = 'black';
        context.fillRect(barX, barY, barWidth, barHeight);

        // fill
        context.fillStyle = 'lime';
        context.fillRect(barX, barY, barWidth * energyRatio, barHeight);

        // border
        context.strokeStyle = 'white';
        context.strokeRect(barX, barY, barWidth, barHeight);

        // ------------------
        // GAME OVER SCREEN
        // ------------------
        
        if (this.game.state === 'GAMEOVER') {

            context.fillStyle = 'rgba(0,0,0,0.6)';
            context.fillRect(0, 0, this.game.width, this.game.height);

            context.textAlign = 'center';
            context.fillStyle = this.game.fontColor;
            context.font = this.fontSize * 2 + 'px ' + this.fontFamily;

            if (this.game.score >= this.game.scoreToWin) {
                context.fillText(
                    'You Win!',
                    this.game.width / 2,
                    this.game.height / 2 - 20
                );
            } else {
                context.fillText(
                    'You Lose!',
                    this.game.width / 2,
                    this.game.height / 2 - 20
                );

                context.font = this.fontSize + 'px ' + this.fontFamily;
                context.fillText(
                    (this.game.scoreToWin - this.game.score) + ' Kills Left!',
                    this.game.width / 2,
                    this.game.height / 2 + 30
                );
            }
        }

        context.restore();
    }
}