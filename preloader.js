
BasicGame.Preloader = function (game) {

  this.background = null;
  this.preloadBar = null;

  //this.ready = false;

};

BasicGame.Preloader.prototype = {

  preload: function () {

    //  Show the loading progress bar asset we loaded in boot.js
    this.stage.backgroundColor = '#2d2d2d';

    this.preloadBar = this.add.sprite(206, 400, 'preloaderBar');
    this.add.text(this.game.width/2, 360, "Loading...", { font: "32px monospace", fill: "#fff" }).anchor.setTo(0.5, 0.5);

    //  This sets the preloadBar sprite as a loader sprite.
    //  What that does is automatically crop the sprite from 0 to full-width as the files below are loaded in.
    this.load.setPreloadSprite(this.preloadBar);

    //  Here we load the rest of the assets our game needs.
    this.load.image('titlepage', 'assets/titlepage.png');
    this.load.image('sea', 'assets/sea.png');
    this.load.image('island1', 'assets/island1.png');
    this.load.image('island2', 'assets/island2.png');
    this.load.image('bullet', 'assets/bullet_2.png');
    this.load.image('enemyBullet', 'assets/bullet.png');
    this.load.image('powerup1', 'assets/powerup-scatter.png');
    this.load.image('powerupbar', 'assets/powerup-bar.png');
    this.load.spritesheet('greenEnemy', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('whiteEnemy', 'assets/shooting-enemy.png', 32, 32);
    this.load.spritesheet('boss', 'assets/boss.png', 93, 75);
    this.load.spritesheet('explosion', 'assets/explosion.png', 32, 32);
    this.load.spritesheet('player', 'assets/player.png', 64, 64);
    this.load.audio('explosion', ['assets/explosion.mp3']);
    this.load.audio('playerExplosion', ['assets/player-explosion.wav']);
    this.load.audio('enemyFire', ['assets/synthetic_gunshot_2.ogg']);
    this.load.audio('playerFire', ['assets/gun_fire.wav']);
    this.load.audio('powerUp', ['assets/powerup.wav']);
    this.load.audio('bossWarning', ['assets/warning.wav']);
    this.load.audio('gameMusic', ['assets/music_loop.mp3']);
    this.load.audio('victoryMusic', ['assets/victory.mp3']);
    //this.load.audio('titleMusic', ['audio/main_menu.mp3']);
    //  + lots of other required assets here

  },

  create: function () {
    //  Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
    this.preloadBar.cropEnabled = false;
  },

  update: function () {

    //  You don't actually need to do this, but I find it gives a much smoother game experience.
    //  Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
    //  You can jump right into the menu if you want and still play the music, but you'll have a few
    //  seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
    //  it's best to wait for it to decode here first, then carry on.
    
    //  If you don't have any music in your game then put the game.state.start line into the create function and delete
    //  the update function completely.
    
    //if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
    //{
    //  this.ready = true;
      this.state.start('MainMenu');
    //}

  }

};
