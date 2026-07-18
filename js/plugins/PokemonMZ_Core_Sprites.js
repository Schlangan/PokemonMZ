//=============================================================================
// RPG Maker MZ - PokemonMZ - Core plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core plugin for PokemonMZ
 * @author Schlangan
*/



//-----------------------------------------------------------------------------
// PokemonMZ_Sprite_Animation
//
// Variation of animation sprite to match pokemon center

function PokemonMZ_Sprite_Animation() {
    this.initialize(...arguments);
}

PokemonMZ_Sprite_Animation.prototype = Object.create(Sprite_Animation.prototype);
PokemonMZ_Sprite_Animation.prototype.constructor = PokemonMZ_Sprite_Animation;

PokemonMZ_Sprite_Animation.prototype.targetSpritePosition = function(sprite) {
    const point = new Point(sprite.width / 2, sprite.height / 2);
    if (this._animation.alignBottom) {
        point.y = sprite.height
    }
    sprite.updateTransform();
    return sprite.worldTransform.apply(point);
};


//-----------------------------------------------------------------------------
// PokemonMZ_Sprite_Gauge
//
// The sprite for displaying a status gauge for Pokemon

function PokemonMZ_Sprite_Gauge() {
    this.initialize(...arguments);
}

PokemonMZ_Sprite_Gauge.prototype = Object.create(Sprite_Gauge.prototype);
PokemonMZ_Sprite_Gauge.prototype.constructor = PokemonMZ_Sprite_Gauge;

PokemonMZ_Sprite_Gauge.prototype.initMembers = function() {
    Sprite_Gauge.prototype.initMembers.call(this);
    this._pokemon = null;
    this._displayHp = true;
    this._bitmapWidth = 200;
};
PokemonMZ_Sprite_Gauge.prototype.setup = function(pokemon, statusType) {
    this._pokemon = pokemon;
    Sprite_Gauge.prototype.setup.call(this, null, statusType);
};
PokemonMZ_Sprite_Gauge.prototype.isValid = function() {
    return true;
};
PokemonMZ_Sprite_Gauge.prototype.currentValue = function() {
    if (this._pokemon) {
        switch (this._statusType) {
            case "hp":
                return this._pokemon.hp();
        }
    }
    return NaN;
};
PokemonMZ_Sprite_Gauge.prototype.currentMaxValue = function() {
    if (this._pokemon) {
        switch (this._statusType) {
            case "hp":
                return this._pokemon.mhp();
        }
    }
    return NaN;
};
PokemonMZ_Sprite_Gauge.prototype.valueColor = function() {
    switch (this._statusType) {
        case "hp":
            return ColorManager.pokemonHpColor(this._pokemon);
        default:
            return ColorManager.normalColor();
    }
};
PokemonMZ_Sprite_Gauge.prototype.setBitmapWidth = function(width) {
    this._bitmapWidth = width;
    this.createBitmap();
};
PokemonMZ_Sprite_Gauge.prototype.bitmapWidth = function() {
    return this._bitmapWidth;
};
PokemonMZ_Sprite_Gauge.prototype.bitmapHeight = function() {
    return 32;
};
PokemonMZ_Sprite_Gauge.prototype.showHp = function() {
    this._displayHp = true;
};
PokemonMZ_Sprite_Gauge.prototype.hideHp = function() {
    this._displayHp = false;
};
PokemonMZ_Sprite_Gauge.prototype.gaugeX = function() {
    if (this._statusType === "time") {
        return 0;
    } else {
        return this.measureLabelWidth() + 10;
    }
};
PokemonMZ_Sprite_Gauge.prototype.drawValue = function() {
    const currentValue = Math.round(this.currentValue());
    const maxValue = this.currentMaxValue();
    const width = this.bitmapWidth();
    const height = this.textHeight();
    if (this._displayHp) {
        this.setupValueFont();
        const text = String(currentValue) + " / " + String(maxValue);
        this.bitmap.drawText(text, 0, 0, width, height, "right");
    }
};
PokemonMZ_Sprite_Gauge.prototype.isAnimationPlaying = function() {
    return this._duration > 0;
};



//-----------------------------------------------------------------------------
// PokemonMZ_Sprite_Trainer
//
// The sprite for displaying a trainer.

function PokemonMZ_Sprite_Trainer() {
    this.initialize(...arguments);
}

PokemonMZ_Sprite_Trainer.prototype = Object.create(Sprite.prototype);
PokemonMZ_Sprite_Trainer.prototype.constructor = PokemonMZ_Sprite_Trainer;

PokemonMZ_Sprite_Trainer.prototype.initialize = function(trainer) {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.setTrainer(trainer);
};
PokemonMZ_Sprite_Trainer.prototype.initMembers = function() {
    this._trainer = null;
    this._trainerBattler = null;
    this._maxHeight = 200;
};
PokemonMZ_Sprite_Trainer.prototype.setTrainer = function(trainer) {
    this._trainer = trainer;
    this.bitmap = null;
    this.updateBitmap();
};
PokemonMZ_Sprite_Trainer.prototype.updateBitmap = function() {
    if (this.isImageChanged()) {
        this._trainerBattler = this._trainer.battlerName();
        const bitmap = ImageManager.loadSvActor(this._trainerBattler);
        bitmap.addLoadListener(this.setBitmap.bind(this, bitmap))
    }
};
PokemonMZ_Sprite_Trainer.prototype.setBitmap = function(bitmap) {
    this.bitmap = bitmap;
    const scaleHeight = this._maxHeight / this.bitmap.height;
    this.scale.x = scaleHeight;
    this.scale.y = scaleHeight;
};
PokemonMZ_Sprite_Trainer.prototype.isImageChanged = function() {
    if (!this._trainer) {
        return false;
    } else {
        return this._trainerBattler !== this._trainer.battlerName();
    }
};


//-----------------------------------------------------------------------------
// PokemonMZ_Sprite_Pokemon
//
// The sprite for displaying a pokemon.

function PokemonMZ_Sprite_Pokemon() {
    this.initialize(...arguments);
}

PokemonMZ_Sprite_Pokemon.prototype = Object.create(Sprite.prototype);
PokemonMZ_Sprite_Pokemon.prototype.constructor = PokemonMZ_Sprite_Pokemon;

PokemonMZ_Sprite_Pokemon.prototype.initialize = function(side) {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this._side = side;
    this._bottomCenterX = 0;
    this._bottomCenterY = 0;
    this.clearDestination();
};
PokemonMZ_Sprite_Pokemon.prototype.initMembers = function() {
    this._pokemon = null;
    this._side = null;
    this._imageFile = null;
};
PokemonMZ_Sprite_Pokemon.prototype.isImageChanged = function() {
    if (!this._pokemon) {
        return false;
    } else {
        return this._imageFile !== this._pokemon.battleImageId();
    }
};
PokemonMZ_Sprite_Pokemon.prototype.setPokemon = function(pokemon) {
    this._pokemon = pokemon;
    this.updateBitmap();
};
PokemonMZ_Sprite_Pokemon.prototype.updateBitmap = function() {
    if (this.isImageChanged()) {
        this._imageFile = this._pokemon.battleImageId();

        switch(this._side) {
            case "front":
                const bitmap1 = ImageManager.PokemonMZ_loadPokemonFront(this._imageFile);
                bitmap1.addLoadListener(this.setBitmap.bind(this, bitmap1))
                break;
            case "back":
                const bitmap2 = ImageManager.PokemonMZ_loadPokemonBack(this._imageFile);
                bitmap2.addLoadListener(this.setBitmap.bind(this, bitmap2))
                break;
        }
        
    }
};
PokemonMZ_Sprite_Pokemon.prototype.setBitmap = function(bitmap) {
    this.bitmap = bitmap;
};
PokemonMZ_Sprite_Pokemon.prototype.updateVisibility = function() {
    Sprite.prototype.updateVisibility.call(this);
    if (!this._pokemon) {
        this.visible = false;
    }
};
PokemonMZ_Sprite_Pokemon.prototype.updateBottomCenterPlacement = function(x,y) {
    if (this.bitmap) {
        const width = this.bitmap.width * this.scale.x;
        const height = this.bitmap.height * this.scale.y;
        this.x = this._bottomCenterX - width/2;
        this.y = this._bottomCenterY - height;
    } else {
        this.x = x;
        this.y = y;
    }
};

PokemonMZ_Sprite_Pokemon.prototype.placeBottomCenter = function(x,y) {
    this._bottomCenterX = x;
    this._bottomCenterY = y;
    this.updateBottomCenterPlacement();
};
PokemonMZ_Sprite_Pokemon.prototype.setScale = function(scale) {
    this.scale.x = scale;
    this.scale.y = scale;
    this.updateBottomCenterPlacement();
};
PokemonMZ_Sprite_Pokemon.prototype.modifyScale = function(modifier) {
    this.scale.x += modifier;
    this.scale.y += modifier;
    this.updateBottomCenterPlacement();
};
PokemonMZ_Sprite_Pokemon.prototype.getAnimationPosition = function() {
    const bounds = this.getBounds();

    return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
    };
};
PokemonMZ_Sprite_Pokemon.prototype.setDestination = function(deltaX,deltaY,duration) {
    this._destinationSet = true;
    this._destinationData.x = this._bottomCenterX + deltaX;
    this._destinationData.y = this._bottomCenterY + deltaY;
    this._destinationData.dx = deltaX/duration;
    this._destinationData.dy = deltaY/duration;
};
PokemonMZ_Sprite_Pokemon.prototype.clearDestination = function(x,y) {
    this._destinationSet = false;
    this._destinationData = {"x":0,"y":0,"dx":0,"dy":0};
};
PokemonMZ_Sprite_Pokemon.prototype.hasReachedDestination = function() {
    return this._bottomCenterX == this._destinationData.x && this._bottomCenterY == this._destinationData.y;
};
PokemonMZ_Sprite_Pokemon.prototype.hasDestination = function() {
    return this._destinationSet;
};
PokemonMZ_Sprite_Pokemon.prototype.advanceToDestination = function() {
    if (this.hasDestination()) {
        this._bottomCenterX += this._destinationData.dx;
        this._bottomCenterY += this._destinationData.dy;

        if (
            (this._destinationData.dx > 0 && this._bottomCenterX > this._destinationData.x) ||
            (this._destinationData.dx < 0 && this._bottomCenterX < this._destinationData.x)
        ) { 
            this._bottomCenterX = this._destinationData.x 
        }

        if (
            (this._destinationData.dy > 0 && this._bottomCenterY > this._destinationData.y) ||
            (this._destinationData.dy < 0 && this._bottomCenterY < this._destinationData.y)
        ) { 
            this._bottomCenterY = this._destinationData.y 
        }
    }
    this.updateBottomCenterPlacement()
};


//-----------------------------------------------------------------------------
// PokemonMZ_Spriteset_Battle
//
// The set of sprites on the battle screen.

function PokemonMZ_Spriteset_Battle() {
    this.initialize(...arguments);
}

PokemonMZ_Spriteset_Battle.prototype = Object.create(Spriteset_Base.prototype);
PokemonMZ_Spriteset_Battle.prototype.constructor = PokemonMZ_Spriteset_Battle;

PokemonMZ_Spriteset_Battle.prototype.initialize = function() {
    Spriteset_Base.prototype.initialize.call(this);
    this._battlebackLocated = false;
};

PokemonMZ_Spriteset_Battle.prototype.createLowerLayer = function() {
    Spriteset_Base.prototype.createLowerLayer.call(this);
    this.createBackground();
    this.createBattleback();
    this.createBattleField();
    this.createPokemons();
    this.createTrainers();
    this.createPokeball();
    // this.createEnemies();
    // this.createActors();
};

PokemonMZ_Spriteset_Battle.prototype.createTrainers = function() {
    const sprites = [];
    const enemySprites = [];

    if ($PokemonMZ_gameBattle.isTrainerBattle()) {
        // Enemy trainer
        for (const enemy of $PokemonMZ_gameBattle._enemies) {
            const enemySprite = new PokemonMZ_Sprite_Trainer(enemy);
            enemySprites.push(enemySprite);
            sprites.push(enemySprite);
        }
    }
    
    // Player trainer
    const playerSprite = new PokemonMZ_Sprite_Trainer($gamePlayerTrainer)
    sprites.push(playerSprite);

    // Add sprites to battle field
    for (const sprite of sprites) {
        this._battleField.addChild(sprite);
    }
    this._playerTrainerSprite = playerSprite;
    if ($PokemonMZ_gameBattle.isTrainerBattle()) {
        this._enemyTrainerSprites = enemySprites;
    };
};
PokemonMZ_Spriteset_Battle.prototype.playerTrainerSprite = function() {
    return this._playerTrainerSprite;
};
PokemonMZ_Spriteset_Battle.prototype.enemyTrainerSprites = function() {
    return this._enemyTrainerSprites;
};
PokemonMZ_Spriteset_Battle.prototype.createPokemons = function() {
    const playerSprite = new PokemonMZ_Sprite_Pokemon("back");
    const enemySprite = new PokemonMZ_Sprite_Pokemon("front");
    this._battleField.addChild(enemySprite);
    this._battleField.addChild(playerSprite);
    this._playerPokemonSprite = playerSprite;
    this._enemyPokemonSprite = enemySprite;
};
PokemonMZ_Spriteset_Battle.prototype.playerPokemonSprite = function() {
    return this._playerPokemonSprite;
};
PokemonMZ_Spriteset_Battle.prototype.enemyPokemonSprite = function() {
    return this._enemyPokemonSprite;
};
PokemonMZ_Spriteset_Battle.prototype.createPokeball = function() {
    const pokeballSprite = new Sprite(null);
    pokeballSprite.anchor.x = 0.5;
    pokeballSprite.anchor.y = 0.5;
    pokeballSprite.visible = false;
    this._battleField.addChild(pokeballSprite);
    this._pokeballSprite = pokeballSprite;
};
PokemonMZ_Spriteset_Battle.prototype.setBallSprite = function(ballBitmap) {
    this._pokeballSprite.bitmap = ballBitmap;
};
PokemonMZ_Spriteset_Battle.prototype.ballSprite = function(ballBitmap) {
    return this._pokeballSprite;
};
PokemonMZ_Spriteset_Battle.prototype.createBackground = function() {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this._baseSprite.addChild(this._backgroundSprite);
};
PokemonMZ_Spriteset_Battle.prototype.createBattleback = function() {
    this._back1Sprite = new Sprite_Battleback(0);
    this._back2Sprite = new Sprite_Battleback(1);
    this._baseSprite.addChild(this._back1Sprite);
    this._baseSprite.addChild(this._back2Sprite);
};
PokemonMZ_Spriteset_Battle.prototype.createBattleField = function() {
    const width = Graphics.boxWidth;
    const height = Graphics.boxHeight;
    const x = (Graphics.width - width) / 2;
    const y = (Graphics.height - height) / 2;
    this._battleField = new Sprite();
    this._battleField.setFrame(0, 0, width, height);
    this._battleField.x = x;
    this._battleField.y = y - this.battleFieldOffsetY();
    this._baseSprite.addChild(this._battleField);
    this._effectsContainer = this._battleField;
};
PokemonMZ_Spriteset_Battle.prototype.battleFieldOffsetY = function() {
    return 24;
};
PokemonMZ_Spriteset_Battle.prototype.update = function() {
    Spriteset_Base.prototype.update.call(this);
    //this.updateTrainers();
    this.updateBattleback();
    this.updateAnimations();
};
PokemonMZ_Spriteset_Battle.prototype.updateBattleback = function() {
    if (!this._battlebackLocated) {
        this._back1Sprite.adjustPosition();
        this._back2Sprite.adjustPosition();
        this._battlebackLocated = true;
    }
};
PokemonMZ_Spriteset_Battle.prototype.findTargetSprite = function(target) {
    return target;
};
PokemonMZ_Spriteset_Battle.prototype.isMVAnimation = function(animation) {
    if (animation) {
        return !!animation.frames;
    } else {
        return false;
    }
    
};
PokemonMZ_Spriteset_Battle.prototype.createAnimationSprite = function(targets, animation, mirror, delay) {
    const mv = this.isMVAnimation(animation);
    const sprite = new (mv ? Sprite_AnimationMV : PokemonMZ_Sprite_Animation)();
    const targetSprites = this.makeTargetSprites(targets);
    const baseDelay = this.animationBaseDelay();
    const previous = delay > baseDelay ? this.lastAnimationSprite() : null;
    if (this.animationShouldMirror(targets[0])) {
        mirror = !mirror;
    }
    sprite.targetObjects = targets;
    sprite.setup(targetSprites, animation, mirror, delay, previous);
    this._effectsContainer.addChild(sprite);
    this._animationSprites.push(sprite);
};