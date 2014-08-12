BasicGame.MainMenu = function (game) {

    this.music = null;
    this.playButton = null;

};

BasicGame.MainMenu.prototype = {
    create: function () {

        //  We've already preloaded our assets, so let's kick right into the Main Menu itself.
        //  Here all we're doing is playing some music and adding a picture and button
        //  Naturally I expect you to do something significantly better :)

        this.add.sprite(0, 0, 'titlepage');

        console.log(this.game.width);

        this.loadingText = this.add.text(this.game.width/2, 520, "Press Z or tap game to start", {
            font: "18px '8bit_wondernominal'",
            fill: "#fff"
        });

        this.loadingText.anchor.setTo(Math.round(this.loadingText.width * 0.5) / this.loadingText.width, 0.5);

    },

    update: function () {

        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
            this.startGame();
        }
        //  Do some nice funky main menu effect here

    },

    startGame: function (pointer) {

        //  Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        // this.music.stop();

        //  And start the actual game
        this.state.start('Game');

    }

};
