BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
    create: function () {
        this.sea = this.add.tileSprite(0, 0, 1024, 768, 'sea');
        this.setupIslands();

        this.setupPlayer();
        this.setupPlayerIcons();
        this.setupEnemies();
        this.setupBullets();
        this.setupExplosions();
        this.setupText();
        this.setupAudio();
        this.setupPowerUpTimer();
        this.setupDebugMode();

        this.cursors = this.input.keyboard.createCursorKeys();
    },

    setupIslands: function () {
        this.island1Pool = this.add.group();
        this.island1Pool.enableBody = true;
        this.island1Pool.physicsBodyType = Phaser.Physics.ARCADE;

        this.island1Pool.createMultiple(5, 'island1');
        this.island1Pool.setAll('anchor.x', 0.5);
        this.island1Pool.setAll('anchor.y', 0.5);
        this.island1Pool.setAll('outOfBoundsKill', true);
        this.island1Pool.setAll('checkWorldBounds', true);

        this.nextIsland1At = 0;
        this.nextIsland1Delay = this.getRandomInt(30, 60) * 1000;

        this.island2Pool = this.add.group();
        this.island2Pool.enableBody = true;
        this.island2Pool.physicsBodyType = Phaser.Physics.ARCADE;

        this.island2Pool.createMultiple(5, 'island2');
        this.island2Pool.setAll('anchor.x', 0.5);
        this.island2Pool.setAll('anchor.y', 0.5);
        this.island2Pool.setAll('outOfBoundsKill', true);
        this.island2Pool.setAll('checkWorldBounds', true);

        this.nextIsland2At = 0;
        this.nextIsland2Delay = this.getRandomInt(50, 80) * 1000;
    },

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    setupDebugMode: function () {
        this.debug_key = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debug_key.onDown.add(this.toggleDebugMode, this);
    },

    setupPowerUpTimer: function () {
        this.powerup1_timer = this.time.create(false);
        this.powerup1_remaining = 10;

        this.powerup1_bar = this.add.bitmapData(10, 126);
        this.powerup1_bar.context.fillStyle = '#fff';
        this.add.sprite(22, 453, this.powerup1_bar);

        this.powerup1_bar_container = this.add.sprite(20, 450, 'powerupbar');
        this.powerup1_bar_icon = this.add.sprite(12, 585, 'powerup1');
        this.powerup1_bar_container.kill();
        this.powerup1_bar_icon.kill();
    },

    toggleDebugMode: function () {
        this.debug_mode = !this.debug_mode;
        this.debugText.text = 'Debug mode: ' + this.debug_mode;
    },

    setupAudio: function () {
        this.explosionSFX = this.add.audio('explosion');
        this.playerExplosionSFX = this.add.audio('playerExplosion');
        this.enemyFireSFX = this.add.audio('enemyFire');
        this.playerFireSFX = this.add.audio('playerFire');
        this.powerUpSFX = this.add.audio('powerUp');
        this.bossWarning = this.add.audio('bossWarning');
    },

    checkCollisions: function () {
        this.physics.arcade.overlap(
            this.bulletPool, this.enemyPool, this.enemyHit, null, this
        );
        this.physics.arcade.overlap(
            this.bulletPool, this.shooterPool, this.enemyHit, null, this
        );
        this.physics.arcade.overlap(
            this.player, this.enemyPool, this.playerHit, null, this
        );
        this.physics.arcade.overlap(
            this.player, this.shooterPool, this.playerHit, null, this
        );
        this.physics.arcade.overlap(
            this.player, this.enemyBulletPool, this.playerHit, null, this
        );
        this.physics.arcade.overlap(
            this.player, this.powerUpPool, this.playerPowerUp, null, this
        );

        if (this.bossApproaching === false) {
            this.physics.arcade.overlap(
                this.bulletPool, this.bossPool, this.enemyHit, null, this
            );
            this.physics.arcade.overlap(
                this.player, this.bossPool, this.playerHit, null, this
            );
        }
    },

    playerPowerUp: function (player, powerUp) {
        this.addToScore(powerUp.reward);
        powerUp.kill();
        this.powerUpSFX.play();

        if (this.weaponLevel < 5) {
            this.weaponLevel++;
        }

        this.powerup1_timer.stop();

        this.powerup1_remaining = 10;
        this.powerup1_timer.loop(1000, this.updatePowerUp1Counter, this);
        this.powerup1_timer.start();

        this.drawPowerUpBar();
    },

    drawPowerUpBar: function () {
        if (this.powerup1_remaining > 0) {
            this.powerup1_bar_container.revive();
            this.powerup1_bar_icon.revive()
        } else {
            this.powerup1_bar_container.kill();
            this.powerup1_bar_icon.kill();
        }

        var bar_height = 12.6 * this.powerup1_remaining,
            y_pos = this.powerup1_bar.height - bar_height;

        this.powerup1_bar.context.clearRect(0, 0, this.powerup1_bar.width, this.powerup1_bar.height);
        this.powerup1_bar.context.fillRect(0, y_pos, 10, bar_height);
        this.powerup1_bar.dirty = true;
    },

    updatePowerUp1Counter: function () {
        if (this.powerup1_remaining > 0) {
            this.powerup1_remaining -= 1;

            this.drawPowerUpBar();

            if (this.powerup1_remaining < 1) {
                this.weaponLevel = 0;
                this.powerup1_timer.stop();

                this.powerup1_bar.context.clearRect(0, 0, this.powerup1_bar.width, this.powerup1_bar.height);
                this.powerup1_bar_container.kill();
                this.powerup1_bar_icon.kill();
            }
        }


    },

    spawnIslands: function () {
        if (this.nextIsland1At < this.time.now && this.island1Pool.countDead() > 0) {
            this.nextIsland1At = this.time.now + this.nextIsland1Delay;

            var island = this.island1Pool.getFirstExists(false);
            island.reset(this.rnd.integerInRange(20, this.game.width/2), 0);
            island.body.velocity.y = 10;
        }

        if (this.nextIsland2At < this.time.now && this.island2Pool.countDead() > 0) {
            this.nextIsland2At = this.time.now + this.nextIsland2Delay;

            var island = this.island2Pool.getFirstExists(false);
            island.reset(this.rnd.integerInRange(20, this.game.width/2), 0);
            island.body.velocity.y = 10;
        }
    },

    spawnEnemies: function () {
        if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
            this.nextEnemyAt = this.time.now + this.enemyDelay;

            var enemy = this.enemyPool.getFirstExists(false);
            enemy.reset(this.rnd.integerInRange(20, this.game.width-20), 0, this.enemyInitialHealth);
            enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
            enemy.play('fly');
        }

        if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
            this.nextShooterAt = this.time.now + this.shooterDelay;

            var shooter = this.shooterPool.getFirstExists(false);
            shooter.reset(this.rnd.integerInRange(20, this.game.width-20), 0, this.shooterIntialHealth);

            // destination to fly to
            var target = this.rnd.integerInRange(20, this.game.width-20);

            // rotate & move to target
            shooter.rotation = this.physics.arcade.moveToXY(
                shooter,
                target,
                768,
                this.rnd.integerInRange(30, 80)
            ) - Math.PI / 2;

            shooter.play('fly');

            shooter.nextShotAt = 0;
        }
    },

    processPlayerInput: function () {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
        }

        if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -this.player.speed;
        } else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.player.speed;
        }

        if (this.game.input.activePointer.isDown
            && this.game.physics.arcade.distanceToPointer(this.player) > 15) {
            this.game.physics.arcade.moveToPointer(this.player, this.player.speed);
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
            if (this.returnText && this.returnText.exists) {
                this.quitGame();
            } else {
                this.fire();
            }
        }
    },

    quitGame: function (pointer) {
        this.sea.destroy();
        this.player.destroy();
        this.enemyPool.destroy();
        this.bulletPool.destroy();
        this.explosionPool.destroy();
        this.shooterPool.destroy();
        this.enemyBulletPool.destroy();
        this.powerUpPool.destroy();
        this.bossPool.destroy();
        this.instructions.destroy();
        this.scoreText.destroy();
        this.endText.destroy();
        this.returnText.destroy();

        this.state.start('MainMenu');
    },

    processDelayedEffects: function () {
        if (this.instructions.exists && this.time.now > this.instExpire) {
            this.instructions.destroy();
        }

        if (this.ghostUntil && this.ghostUntil < this.time.now) {
            this.ghostUntil = null;
            this.player.play('fly');
        }

        if (this.showReturn && this.time.now > this.showReturn) {
            this.returnText = this.add.text(
                this.game.width/2, 400,
                'Press Z or tap game to go back to main menu',
                {font: '16px "8bit_wondernominal"', fill: '#fff'}
            );
            this.returnText.anchor.setTo(0.5, 0);
            this.showReturn = false;
        }

        if (this.bossApproaching && this.boss.y > 80) {
            this.bossApproaching = false;
            this.bossWarning.stop();
            this.bossApproachingText.kill();
            this.boss.health = 500;
            this.boss.nextShotAt = 0;

            this.boss.body.velocity.y = 0;
            this.boss.body.velocity.x = 200;
            this.boss.body.bounce.x = 1;
            this.boss.body.collideWorldBounds = true;
        }
    },

    displayEnd: function (win) {
        if (this.endText && this.endText.exists) {
            return;
        }

        this.powerup1_timer.stop();
        this.powerup1_bar_container.kill();
        this.powerup1_bar_icon.kill();
        this.powerup1_bar.context.clearRect(0, 0, this.powerup1_bar.width, this.powerup1_bar.height);

        var msg = win ? 'You win!' : 'Game Over';
        this.endText = this.add.text(
            this.game.width/2, 320,
            msg,
            {font: '72px "8bit_wondernominal"', fill: '#fff'}
        );
        this.endText.anchor.setTo(0.5, 0);
        this.showReturn = this.time.now + 2000;
    },

    update: function () {
        this.sea.tilePosition.y += 0.2;
        this.spawnIslands();

        this.checkCollisions();
        this.spawnEnemies();
        this.enemyFire();
        this.processPlayerInput();
        this.processDelayedEffects();
    },

    enemyFire: function () {
        this.shooterPool.forEachAlive(function (shooter) {
            if (this.time.now > shooter.nextShotAt && this.enemyBulletPool.countDead() > 0) {
                var bullet = this.enemyBulletPool.getFirstExists(false);
                bullet.reset(shooter.x, shooter.y);
                this.physics.arcade.moveToObject(bullet, this.player, 150);
                shooter.nextShotAt = this.time.now + this.shooterShotDelay;
                this.enemyFireSFX.play();
            }
        }, this);

        if (this.bossApproaching === false
            && this.boss.alive
            && this.boss.nextShotAt < this.time.now
            && this.enemyBulletPool.countDead() > 9) {

            this.boss.nextShotAt = this.time.now + 1000;
            this.enemyFireSFX.play();

            for (var i = 0; i < 5; i++) {
                var leftBullet = this.enemyBulletPool.getFirstExists(false);
                leftBullet.reset(this.boss.x - 10 - i * 10, this.boss.y + 20);

                var rightBullet = this.enemyBulletPool.getFirstExists(false);
                rightBullet.reset(this.boss.x + 10 - i * 10, this.boss.y + 20);

                if (this.boss.health > 250) {
                    //aim directly at player
                    this.physics.arcade.moveToObject(leftBullet, this.player, 150);
                    this.physics.arcade.moveToObject(rightBullet, this.player, 150);
                } else {
                    // aim off centre
                    this.physics.arcade.moveToXY(
                        leftBullet, this.player.x - i * 100, this.player.y, 150
                    );
                    this.physics.arcade.moveToXY(
                        rightBullet, this.player.x + i * 100, this.player.y, 150
                    );
                }
            }
        }
    },

    setupPlayer: function () {
        this.player = this.add.sprite(400, 650, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('fly', [0, 1, 2], 20, true);
        this.player.animations.add('ghost', [3, 0, 3, 1], 20, true);
        this.player.play('fly');
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.speed = 300;
        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(20, 20, 0, -5);
        this.weaponLevel = 0;
    },

    setupPlayerIcons: function () {
        this.powerUpPool = this.add.group();
        this.powerUpPool.enableBody = true;
        this.powerUpPool.physicsBodyType = Phaser.Physics.ARCADE;

        this.powerUpPool.createMultiple(50, 'powerup1');
        this.powerUpPool.setAll('anchor.x', 0.5);
        this.powerUpPool.setAll('anchor.y', 0.5);
        this.powerUpPool.setAll('outOfBoundsKill', true);
        this.powerUpPool.setAll('checkWorldBounds', true);
        this.powerUpPool.setAll('reward', 100, false, false, 0, true);

        this.lives = this.add.group();
        for (var i = 0; i < 3; i++) {
            var life = this.lives.create(924 + (30 * i), 30, 'player');
            life.scale.setTo(0.5, 0.5);
            life.anchor.setTo(0.5, 0.5);
        }
    },

    setupEnemies: function () {
        this.enemyPool = this.add.group();
        this.enemyPool.enableBody = true;
        this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;

        this.enemyPool.createMultiple(50, 'greenEnemy');
        this.enemyPool.setAll('anchor.x', 0.5);
        this.enemyPool.setAll('anchor.y', 0.5);
        this.enemyPool.setAll('outOfBoundsKill', true);
        this.enemyPool.setAll('checkWorldBounds', true);
        this.enemyPool.setAll('reward', 100, false, false, 0, true);
        this.enemyPool.setAll('dropRate', 0.3, false, false, 0, true);

        this.enemyPool.forEach(function (enemy) {
            enemy.animations.add('fly', [0, 1, 2], 20, true);
            enemy.animations.add('hit', [3, 1, 3, 2], 20, false);
            enemy.events.onAnimationComplete.add(function (e) {
                e.play('fly');
            }, this);
        });

        this.nextEnemyAt = 0;
        this.enemyDelay = 1000;
        this.enemyInitialHealth = 2;

        this.shooterPool = this.add.group();
        this.shooterPool.enableBody = true;
        this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.shooterPool.createMultiple(20, 'whiteEnemy');
        this.shooterPool.setAll('anchor.x', 0.5);
        this.shooterPool.setAll('anchor.y', 0.5);
        this.shooterPool.setAll('outOfBoundsKill', true);
        this.shooterPool.setAll('checkWorldBounds', true);
        this.shooterPool.setAll('reward', 400, false, false, 0, true);
        this.shooterPool.setAll('dropRate', 0.1, false, false, 0, true);

        this.shooterPool.forEach(function (shooter) {
            shooter.animations.add('fly', [0, 1, 2], 20, true);
            shooter.animations.add('hit', [3, 1, 3, 2], 20, false);
            shooter.events.onAnimationComplete.add(function (s) {
                s.play('fly');
            }, this);
        });

        // start spawning 5 seconds into the game
        this.nextShooterAt = this.time.now + 5000;
        this.shooterDelay = 3000;
        this.shooterShotDelay = 2000;
        this.shooterIntialHealth = 5;

        this.bossPool = this.add.group();
        this.bossPool.enableBody = true;
        this.bossPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.bossPool.createMultiple(1, 'boss');
        this.bossPool.setAll('anchor.x', 0.5);
        this.bossPool.setAll('anchor.y', 0.5);
        this.bossPool.setAll('outOfBoundsKill', true);
        this.bossPool.setAll('checkWorldBounds', true);
        this.bossPool.setAll('reward', 10000, false, false, 0, true);
        this.bossPool.setAll('dropRate', 0, false, false, 0, true);

        this.bossPool.forEach(function (boss) {
            boss.animations.add('fly', [0, 1, 2], 20, true);
            boss.animations.add('hit', [3, 1, 3, 2], 20, false);
            boss.events.onAnimationComplete.add(function (b) {
                b.play('fly');
            }, this);
        });

        this.boss = this.bossPool.getTop();
        this.bossApproaching = false;
        this.bossInitialHealth = 30;
    },

    setupBullets: function () {
        this.enemyBulletPool = this.add.group();
        this.enemyBulletPool.enableBody = true;
        this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBulletPool.createMultiple(100, 'enemyBullet');
        this.enemyBulletPool.setAll('anchor.x', 0.5);
        this.enemyBulletPool.setAll('anchor.y', 0.5);
        this.enemyBulletPool.setAll('outOfBoundsKill', true);
        this.enemyBulletPool.setAll('checkWorldBounds', true);
        this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);

        this.bulletPool = this.add.group();
        this.bulletPool.enableBody = true;
        this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;

        this.bulletPool.createMultiple(200, 'bullet');

        this.bulletPool.setAll('anchor.x', 0.5);
        this.bulletPool.setAll('anchor.y', 0.5);
        this.bulletPool.setAll('outOfBoundsKill', true);
        this.bulletPool.setAll('checkWorldBounds', true);

        this.nextShotAt = 0;
        this.shotDelay = 100;
    },

    setupExplosions: function () {
        this.explosionPool = this.add.group();
        this.explosionPool.enableBody = true;
        this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;

        this.explosionPool.createMultiple(100, 'explosion');
        this.explosionPool.setAll('anchor.x', 0.5);
        this.explosionPool.setAll('anchor.y', 0.5);

        this.explosionPool.forEach(function (explosion) {
            explosion.animations.add('boom');
        });
    },

    setupText: function () {
        this.instructions = this.add.text(
            this.game.width/2, 600,
            'Use arrow keys to move, Press Z to fire\n' + 'Tapping/Clicking does both',
            {font: '16px "8bit_wondernominal"', fill: '#fff', align: 'center'}
        );
        this.instructions.anchor.setTo(0.5, 0, 5);
        this.instExpire = this.time.now + 10000;

        this.score = 0;
        this.scoreText = this.add.text(
            this.game.width/2, 30,
            '' + this.score,
            {font: '16px "8bit_wondernominal"', fill: '#fff', align: 'center'}
        );
        this.scoreText.anchor.setTo(0.5, 0.5);

        // Debug Mode
        this.debug_mode = false;
        this.debugText = this.add.text(
            this.game.width/2, 60,
            'Debug mode: ' + this.debug_mode,
            {font: '16px "8bit_wondernominal"', fill: '#fff', align: 'center'}
        );
        this.debugText.anchor.setTo(0.5, 0.5);
    },

    render: function () {
//        this.game.debug.body(this.player);
    },

    explode: function (sprite) {
        if (this.explosionPool.countDead() === 0) {
            return
        }

        var explosion = this.explosionPool.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('boom', 15, false, true);

        explosion.body.velocity.x = sprite.body.velocity.x;
        explosion.body.velocity.y = sprite.body.velocity.y;
    },

    playerHit: function (player, enemy) {
        if (this.ghostUntil && this.ghostUntil > this.time.now) {
            return;
        }

        if (this.debug_mode) {
            return;
        }

        this.playerExplosionSFX.play();

        this.damageEnemy(enemy, 5);

        var life = this.lives.getFirstAlive();

        if (life) {
            life.kill();
            this.weaponLevel = 0;

            this.powerup1_remaining = 0;
            this.drawPowerUpBar();

            this.ghostUntil = this.time.now + 3000;
            this.player.play('ghost');
        } else {
            this.explode(player);
            player.kill();
            this.displayEnd(false);
        }
    },

    fire: function () {
        if (!this.player.alive || this.nextShotAt > this.time.now) {
            return;
        }

        this.nextShotAt = this.time.now + this.shotDelay;
        this.playerFireSFX.play();

        var bullet;


        if (this.weaponLevel === 0) {
            if (this.bulletPool.countDead() === 0) {
                return;
            }

            bullet = this.bulletPool.getFirstExists(false);
            bullet.reset(this.player.x, this.player.y - 20);
            bullet.body.velocity.y = -500;
        } else {
            if (this.bulletPool.countDead() < this.weaponLevel * 2) {
                return;
            }

            for (var i = 0; i < this.weaponLevel; i++) {
                bullet = this.bulletPool.getFirstExists(false);

                // spawn left bullet slightly left off center
                bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
                bullet.angle = -5 - i * 10;

                // the left bullets spread from -95 degrees to -135 degrees
                this.physics.arcade.velocityFromAngle(
                    -95 - i * 10,
                    500,
                    bullet.body.velocity
                );

                bullet = this.bulletPool.getFirstExists(false);

                // spawn right bullet slightly right off center
                bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
                bullet.angle = 5 + i * 10;

                // the right bullets spread from -85 degrees to -45
                this.physics.arcade.velocityFromAngle(
                    -85 + i * 10,
                    500,
                    bullet.body.velocity
                );
            }
        }
    },

    enemyHit: function (bullet, enemy) {
        bullet.kill();
        this.damageEnemy(enemy, 1);
    },

    damageEnemy: function (enemy, damage) {
        enemy.damage(damage);

        if (enemy.alive) {
            enemy.play('hit');
        } else {
            this.explode(enemy);
            this.explosionSFX.play();
            this.spawnPowerUp(enemy);
            this.addToScore(enemy.reward);

            if (enemy.key === 'boss') {
                this.enemyPool.destroy();
                this.shooterPool.destroy();
                this.bossPool.destroy();
                this.enemyBulletPool.destroy();
                this.bossWarning.destroy();
                this.displayEnd(true);
            }
        }
    },

    spawnPowerUp: function (enemy) {
        if (this.powerUpPool.countDead() === 0 || this.weaponLevel === 5) {
            return;
        }

        if (this.rnd.frac() < enemy.dropRate) {
            var powerUp = this.powerUpPool.getFirstExists(false);
            powerUp.reset(enemy.x, enemy.y);
            powerUp.body.velocity.y = 100;
        }
    },

    addToScore: function (score) {
        this.score += score;
        this.scoreText.text = this.score;

        if (this.score >= 2000 && this.bossPool.countDead() === 1) {
            this.spawnBoss();
        }
    },

    spawnBoss: function () {
        this.bossApproaching = true;
        this.boss.reset(this.game.width/2, 0, this.bossInitialHealth);
        this.physics.enable(this.boss, Phaser.Physics.ARCADE);
        this.boss.body.velocity.y = 15;
        this.boss.play('fly');
        this.bossWarning.play('', 0, 1, true);

        this.bossApproachingText = this.add.sprite(this.game.width/2, 320, 'bossWarningText');
        this.bossApproachingText.anchor.setTo(0.5, 0.5);
        this.bossApproachingText.animations.add('blink', [0, 1], 4, true);
        this.bossApproachingText.play('blink');
    }
};