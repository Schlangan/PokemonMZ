//=============================================================================
// RPG Maker MZ - PokemonMZ - Core Managers plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core managers plugin for PokemonMZ
 * @author Schlangan
*/

// DataManager edits
$PokemonMZ_gameBattle = null;

DataManager.parsePokemonMZ_Notes = function(note) {
    const data = {}
    if (note == "") {
        return data;
    }
    for (line of note.split("\n")) {
        try {
            const lineData = line.split(":");
            data[lineData[0]] = lineData[1];
        } catch(error) {
            console.error("Error parsing line " + line);
        }
    }
    return data;
};
DataManager.enhanceItems = function() {
    // Enhance $dataItems with infos from PokemonMZ_Items
    $dataItemsIndex = {}
    const itemFullData = {}
    for (item of $PokemonMZ_dataItems) {
        if (item) {
            itemFullData[item.id] = item;
        }
    }
    let counter = -1;
    for (item of $dataItems) {
        counter++;
        if (item) {
            noteData = DataManager.parsePokemonMZ_Notes(item.note)
            if (noteData.id) {
                $dataItemsIndex[noteData.id] = counter
                item.pkmz_data = itemFullData[noteData.id];
            }
        }
    }
};
DataManager.enhanceEnemies = function() {
    // Enhance $dataEnemies with infos from the notetags
    $dataPokemonsIndex = {}
    const pokemonFullData = {}
    for (pokemon of $PokemonMZ_dataPokemon) {
        if (pokemon) {
            pokemonFullData[pokemon.id] = pokemon;
        }
        
    }
    let counter = -1;
    for (enemy of $dataEnemies) {
        counter++;
        if (enemy) {
            noteData = DataManager.parsePokemonMZ_Notes(enemy.note)
            $dataPokemonsIndex[noteData.id] = counter;
            enemy.pkmz_data = pokemonFullData[noteData.id];
        }
    }
};
DataManager.enhanceSkills = function() {
    // Enhance $dataSkills with infos from the notetags
    // Create $dataSkillsIndex to associate numberId to stringId
    $dataSkillsIndex = {}
    const moveFullData = {}
    for (move of $PokemonMZ_dataMoves) {
        if (move) {
            moveFullData[move.id] = move;
        }
    }
    let counter = -1;
    for (skill of $dataSkills) {
        counter++;
        if (skill) {
            noteData = DataManager.parsePokemonMZ_Notes(skill.note)
            $dataSkillsIndex[noteData.id] = counter;
            skill.pkmz_data = moveFullData[noteData.id];
        }
    }
};
DataManager.enhanceTypes = function() {
    // Enhance $PokemonMZ_dataTypes
    $PokemonMZ_dataTypesIndex = {}

    let counter = -1;
    for (type of $PokemonMZ_dataTypes) {
        counter++;
        if (type) {
            $PokemonMZ_dataTypesIndex[type.id] = counter;
        }
    }
};
DataManager.enhanceTroops = function() {
    // Enhance $dataTroops with infos from  encounters
    const encounterFullData = {}
    for (encounter of $PokemonMZ_dataEncounters) {
        if (encounter) {
            encounterFullData[encounter.id] = encounter;
        }
    }
    let counter = -1;
    for (troop of $dataTroops) {
        if (troop) {
            troop.pkmz_data = encounterFullData[troop.name];
        }
    }
};
const PokemonMZ_DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    PokemonMZ_DataManager_createGameObjects.call(this);
    $gamePlayerTrainer = new PokemonMZ_Game_TrainerPlayer(PokemonMZ.playerActorID);
    $PokemonMZ_gameBattle = new PokemonMZ_Game_Battle();
};
const PokemonMZ_DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
    contents = PokemonMZ_DataManager_makeSaveContents.call(this);
    contents.playerTrainer = $gamePlayerTrainer;
    return contents;
};
const PokemonMZ_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    PokemonMZ_DataManager_extractSaveContents.call(this, contents);
    $gamePlayerTrainer = contents.playerTrainer;
};
DataManager.makeSavefileInfo = function() {
    const info = {};
    info.title = $dataSystem.gameTitle;
    info.playerUid = $gamePlayerTrainer.uid();
    info.playtime = $gameSystem.playtimeText();
    info.timestamp = Date.now();
    return info;
};

// AudioManager edits
AudioManager.playPokemonCry = function(id, slower) {
    if (id) {
        let se = {};
        if (slower) {
            se = {"name":id,"pan":0,"pitch":80,"volume":90};
        } else {
            se = {"name":id,"pan":0,"pitch":100,"volume":90};
        }
        
        // [Note] Do not play the same sound in the same frame.
        const latestBuffers = this._seBuffers.filter(
            buffer => buffer.frameCount === Graphics.frameCount
        );
        if (latestBuffers.find(buffer => buffer.name === se.name)) {
            return;
        }
        const buffer = this.createBuffer("pokemonCry/", se.name);
        this.updateSeParameters(buffer, se);
        buffer.play(false);
        this._seBuffers.push(buffer);
        this.cleanupSe();
    }
};
AudioManager.playStandardSe = function(seName) {
    AudioManager.playSe({
        "name":seName,
        "pan":0,
        "pitch":100,
        "volume":100,
    });
};

// ConfigManager edits
ConfigManager.battleAnimation = true;
ConfigManager.battleStyle = "shift";

PokemonMZ_ConfigManager_makeData = ConfigManager.makeData;
ConfigManager.makeData = function() {
    const config = PokemonMZ_ConfigManager_makeData.call(this);
    config.battleAnimation = this.battleAnimation;
    config.battleStyle = this.battleStyle;
    return config;
};

PokemonMZ_ConfigManager_applyData = ConfigManager.applyData;
ConfigManager.applyData = function(config) {
    PokemonMZ_ConfigManager_applyData.call(this, config);
    this.battleAnimation = this.readFlag(config, "battleAnimation", true);
    this.battleStyle = this.PokemonMZ_readString(config, "battleStyle", "shift");
};

ConfigManager.PokemonMZ_readString = function(config, name, defaultValue) {
    if (name in config) {
        return config[name];
    } else {
        return defaultValue;
    }
};


// ColorManager edits
ColorManager.pokemonHpColor = function(pokemon) {
    if (!pokemon) {
        return this.normalColor();
    } else if (pokemon.isFainted()) {
        return this.PokemonMZ_faintedColor();
    } else if (pokemon.isDangerHp()) {
        return this.PokemonMZ_dangerColor();
    } else if (pokemon.isHalfHp()) {
        return this.PokemonMZ_woundedColor();
    } else {
        return this.normalColor();
    }
};
ColorManager.PokemonMZ_woundedColor = function() {
    return this.textColor(6);
};
ColorManager.PokemonMZ_dangerColor = function() {
    return this.textColor(2);
};
ColorManager.PokemonMZ_faintedColor = function() {
    return this.textColor(18);
};

// ImageManager edits
ImageManager.PokemonMZ_loadPokemonFront = function(filename) {
    return this.loadBitmap("img/pokemon/front/", filename);
};
ImageManager.PokemonMZ_loadPokemonBack = function(filename) {
    return this.loadBitmap("img/pokemon/back/", filename);
};
Object.defineProperty(ImageManager, "pokemonSpriteWidth", {
    get: function() {
        return 160;
    },
    configurable: true
});
Object.defineProperty(ImageManager, "pokemonSpriteHeight", {
    get: function() {
        return 160;
    },
    configurable: true
});

// PokemonMZ_BattleManager
//
// The static class that manages battle progress.

function PokemonMZ_BattleManager() {
    throw new Error("This is a static class");
}

PokemonMZ_BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $PokemonMZ_gameBattle.setup(troopId);
    $gameScreen.onBattleStart();

    $gamePlayerTrainer.resetAllLeveledUpStates();

    // Init player battled table
    this._playerBattledTable = []

    if ($PokemonMZ_gameBattle.isWildBattle()) {
        let playerArray = []
        for (const pokemon of $gamePlayerTrainer.pokemons()) {
            playerArray.push(0);
        }
        this._playerBattledTable.push(playerArray)
    } else {
        const enemy = $PokemonMZ_gameBattle.enemy1();
        for (const enemyPokemon of enemy.pokemons()) {
            let playerArray = []
            for (const playerPokemon of $gamePlayerTrainer.pokemons()) {
                playerArray.push(0);
            }
            this._playerBattledTable.push(playerArray)
        }
    }
};
PokemonMZ_BattleManager.initMembers = function() {

    this._debugPhase = "";
    this._debugSubPhase = "";
    this._debugStep = "";

    this._phaseWaitForText = false;

    this._phase = "";
    this._subPhase = "";
    this._previousPhase = "";
    this._spriteset = null;
    this._pokemonListWindow = null;
    this._playerTeamStatusWindow = null;
    this._enemyTeamStatusWindow = null;
    this._playerChosenPokemon = null;
    this._enemyChosenPokemon = null;

    this._enemyNextPokemon = null;
    this._enemyNextPokemonIndex = null;

    this._currentEnemyIndex = -1
    this._currentPlayerIndex = -1

    this._playerHasShifted = null;
    this._playerSwitchingPokemonId = -1;
    this._enemySwitchingPokemonId = -1;
    this._playerBattledTable = [];
    this._playerXpGains = [];
    this._levelingUpPokemon = null;
    this._levelingUpPokemonExp = 0;

    this._playerPokemonStatusWindow = null;
    this._enemyPokemonStatusWindow = null;
    this._pokemonLevelUpWindow = null;
    this._playerHasSentPokemon = false;
    this._trainerInputWindow = null;
    this._yesNoWindow = null;
    this._trainerMovesWindow = null;
    this._regularMessageWindow = null;
    this._staticMessageWindow = null;
    this._pokedexDataWindow = null;
    this._switchRefusalReason = "";
    this._currentAction = null;
    this._levelUpData = {};

    this._moveAskedFor = null;

    
    this._playerUseItem = null;
    this._thrownBall = null;
    this._pokemonCaptureResult = null;
    this._capturedPokemon = null;

    this._playerEscapeAttempts = 0;
    this._playerFailedRunAway = null;
    this._playerSucceedRunAway = null;

    this._playerMove = null;
    this._enemyMove = null;
    this._battleActions = [];

    this._damageTransition = {"start":0,"end":0}
    this._phaseParams = [];
    this._subPhaseParams = [];

    this._evolvingPokemons = [];
};

PokemonMZ_BattleManager.capturedPokemon = function() {
    return this._capturedPokemon;
};
PokemonMZ_BattleManager.levelingUpPokemon = function() {
    return this._levelingUpPokemon;
}
PokemonMZ_BattleManager.moveAskedFor = function() {
    return this._moveAskedFor;
};
PokemonMZ_BattleManager.clearMoveAskedFor = function() {
    this._moveAskedFor = null;
}

PokemonMZ_BattleManager.changePhase = function(newPhase) {
    this._previousPhase = this._phase;
    this._phase = newPhase;
};
PokemonMZ_BattleManager.clearSubPhase = function() {
    this._subPhase = "";
    this._subPhaseParams = [];
};
PokemonMZ_BattleManager.changeSubPhase = function(newPhase) {
    this._subPhase = newPhase;
};
PokemonMZ_BattleManager.resetPlayerEscapeAttempts = function() {
    this._playerEscapeAttempts = 0;
}
PokemonMZ_BattleManager.setPlayerMoveIndex = function(moveIndex) {
    this._playerMoveIndex = moveIndex;
};
PokemonMZ_BattleManager.setEnemyMoveIndex = function(moveIndex) {
    this._enemyMoveIndex = moveIndex;
};
PokemonMZ_BattleManager.setEventCallback = function(callback) {
    this._eventCallback = callback;
};
PokemonMZ_BattleManager.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};
PokemonMZ_BattleManager.setTeamStatusWindows = function(playerWindow, enemyWindow) {
    this._playerTeamStatusWindow = playerWindow;
    this._enemyTeamStatusWindow = enemyWindow;
};
PokemonMZ_BattleManager.setPokemonStatusWindows = function(playerWindow, enemyWindow) {
    this._playerPokemonStatusWindow = playerWindow;
    this._enemyPokemonStatusWindow = enemyWindow;
};
PokemonMZ_BattleManager.setTrainerInputWindow = function(window) {
    this._trainerInputWindow = window;
};
PokemonMZ_BattleManager.setYesNoWindow = function(window) {
    this._yesNoWindow = window;
};
PokemonMZ_BattleManager.setPokemonListWindow = function(window) {
    this._pokemonListWindow = window;
};
PokemonMZ_BattleManager.setTrainerMovesWindow = function(window) {
    this._trainerMovesWindow = window;
};
PokemonMZ_BattleManager.setRegularMessageWindow = function(window) {
    this._regularMessageWindow = window;
};
PokemonMZ_BattleManager.setStaticMessageWindow = function(window) {
    this._staticMessageWindow = window;
};
PokemonMZ_BattleManager.setPokemonLevelUpWindow = function(window) {
    this._pokemonLevelUpWindow = window;
};
PokemonMZ_BattleManager.setPokedexDataWindow = function(window) {
    this._pokedexDataWindow = window;
};
PokemonMZ_BattleManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
};
PokemonMZ_BattleManager.playBattleBgm = function() {
    AudioManager.playBgm($gameSystem.battleBgm());
    AudioManager.stopBgs();
};
PokemonMZ_BattleManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};
PokemonMZ_BattleManager.startBattle = function() {
    if ($PokemonMZ_gameBattle.isTrainerBattle()) {
        this.initializeEnterTrainers();
        this.changePhase("enterTrainers");
    } else if ($PokemonMZ_gameBattle.isWildBattle()) {
        this.initializeEnterTrainerVsWild();
        this.changePhase("enterWild");
    };
};
PokemonMZ_BattleManager.playerPokemon = function() {
    return this._playerChosenPokemon;
};
PokemonMZ_BattleManager.canSwitchPokemon = function(newPokemon) {
    if (newPokemon.isFainted()) {
        this._switchRefusalReason = "There's no will to fight!"
        return false;
    }
    if (newPokemon == this._playerChosenPokemon) {
        this._switchRefusalReason = this._playerChosenPokemon.name() + " is already out!"
        return false;
    }

    this._switchRefusalReason = "";
    return true;
};
PokemonMZ_BattleManager.switchRefusalReason = function() {
    return this._switchRefusalReason;
};
PokemonMZ_BattleManager.setPlayerShiftingPokemon = function(index) {
    this._playerHasShifted = true;
    this._playerSwitchingPokemonId = index;
};
PokemonMZ_BattleManager.setPlayerSwitchingPokemon = function(index) {
    this._playerSwitchingPokemonId = index;
};
PokemonMZ_BattleManager.setEnemySwitchingPokemon = function(index) {
    this._enemySwitchingPokemonId = index;
};
PokemonMZ_BattleManager.changePlayerPokemon = function(pokemon, pokemonIndex) {
    this._currentPlayerIndex = pokemonIndex;
    this._playerChosenPokemon = pokemon;
};
PokemonMZ_BattleManager.changeEnemyPokemon = function(pokemon, pokemonIndex) {
    this._currentEnemyIndex = pokemonIndex;
    this._enemyChosenPokemon = pokemon;
};
PokemonMZ_BattleManager.isGaugeAnimationPlaying = function() {
    let playing = false;
    if (this._playerPokemonStatusWindow && this._playerPokemonStatusWindow.isGaugeAnimationPlaying()) {
        playing = true;
    }
    if (this._enemyPokemonStatusWindow && this._enemyPokemonStatusWindow.isGaugeAnimationPlaying()) {
        playing = true;
    }
    return playing;
}

PokemonMZ_BattleManager.update = function(timeActive) {
    this.updatePhase();
};
PokemonMZ_BattleManager.updatePhase = function(timeActive) {
    if (PokemonMZ.debugLog) {
        if (this._debugPhase != this._phase) {
            this._debugPhase = this._phase;
            console.log("PokemonMZ_BattleManager.updatePhase > " + this._debugPhase);
        }
    }
    switch (this._phase) {
        case "enterTrainers":
            this.updateEnterTrainers();
            break;
        case "enterWild":
            this.updateEnterWild();
            break;
        case "enemyTrainerWin":
            this.updateEnemyTrainerWin();
            break;
        case "enemyTrainerLose":
            this.updateEnemyTrainerLose();
            break;
        case "displayTrainerMessage":
            this.displayTrainerMessage();
            break;
        case "displayWildPokemonMessage":
            this.displayWildPokemonMessage();
            break;
        case "enemyTrainerLeave":
            this.enemyTrainerLeave();
            break;
        case "enemySendFirstPokemon":
            this.enemySendFirstPokemon();
            break;
        case "enemySendNextPokemon":
            this.enemySendNextPokemon();
            break;
        case "enemyPokemonAppear":
            this.enemyPokemonAppear();
            break;
        case "displayWildPokemonStatus":
            this.displayWildPokemonStatus();
            break;
        case "playerTrainerLeave":
            this.playerTrainerLeave();
            break;
        case "playerSendFirstPokemon":
            this.playerSendFirstPokemon();
            break;
        case "playerSendNextPokemon":
            this.playerSendPokemon();
            break;
        case "playerPokemonSwitchBegin":
            this.playerPokemonSwitchBegin();
            break;
        case "playerPokemonRecall":
            this.playerPokemonRecall();
            break;
        case "playerPokemonAppear":
            this.playerPokemonAppear();
            break;
        case "startPlayerInput":
            this.startPlayerInput();
            break;
        case "afterItemFailure":
            break;
        case "playerInput":
            break;
        case "playerMoveForbidden":
            this.playerMoveForbidden();
            break;
        case "nextBattleAction":
            this.nextBattleAction();
            break;
        case "tryRunAway":
            this.tryRunAway();
            break;
        case "throwBall":
            this.startThrowBall();
            break;
        case "animateBallThrow":
            this.animateBallThrow();
            break;
        case "finishWildBallThrow":
            this.finishWildBallThrow();
            break;
        case "rejectTrainerBallThrow":
            this.rejectTrainerBallThrow();
            break; 
        case "animateBallWobble":
            this.animateBallWobble();
            break;
        case "pokemonBreakFree":
            this.pokemonBreakFree();
            break;
        case "pokemonCaught":
            this.pokemonCaught();
            break;
        case "displayPokedexEntry":
            this.displayPokedexEntry();
            break;
        case "askForNickname":
            this.askForNickname();
            break;
        case "playerResolveActionSteps":
        case "enemyResolveActionSteps":
            this.updateSubPhase();
            break;
        case "endPlayerFaintedPokemon":
            this.endPlayerFaintedPokemon();
            break;
        case "endEnemyFaintedPokemon":
            this.endEnemyFaintedPokemon();
            break;
        case "playerPokemonLeveledUp":
            this.playerPokemonLeveledUp();
            break;
        case "afterPlayerFaintedPokemon":
            this.afterPlayerFaintedPokemon();
            break;
        case "afterEnemyFaintedPokemon":
            this.afterEnemyFaintedPokemon();
            break;
        case "askForPokemonChange":
            this.askForPokemonChange();
            break;
        case "nextExpGains":
            this.nextExpGains();
            break;
        case "startLearningMove":
            this.startLearningMove();
            break;
        case "proceedLearningMove":
            this.proceedLearningMove();
            break;
        case "waitReplacingMove":
            this.waitReplacingMove();
            break;
        case "finishReplacingMove":
            this.finishReplacingMove();
            break;
        case "displayEnemyTrainerDefeatMessage":
            this.displayEnemyTrainerDefeatMessage();
            break;
        case "displayEnemyTrainerVictoryMessage":
            this.displayEnemyTrainerVictoryMessage();
            break;
        case "givePlayerMoney":
            this.givePlayerMoney();
            break;
        case "winBattle":
            this.winBattle();
            break;
        case "loseBattle":
            this.loseBattle();
            break; 
        case "endPlayerEscape":
            this.escapeBattle();
            break;
        case "gameOver":
            this.gameOver();
            break;
        case "afterGameOver":
            this.afterGameOver();
            break;
        case "addWildToParty":
            this.addWildToParty();
            break;
        case "addWildToBox":
            this.addWildToBox();
            break;

        case "checkIfEvolution":
            this.checkIfEvolution();
            break;
        case "exitBattleScene":
            this.exitBattleScene();
            break;
    }
};
PokemonMZ_BattleManager.updateSubPhase = function(timeActive) {
    // Debug logger
    if (PokemonMZ.debugLog) {
        if (this._debugSubPhase != this._subPhase) {
            this._debugSubPhase = this._subPhase;
            if (this._debugSubPhase != "") {
                console.log("PokemonMZ_BattleManager.updateSubPhase > " + this._debugSubPhase);
            }
            
        }
    }
    switch (this._subPhase) {
        case "":
            this.resolveNextResultStep();
            break;
        case "targetHitAnimation":
            this.targetHitAnimation();
            break;
        case "playSe":
            this.playSe();
            break;
        case "startDamageOpponent":
            this.startDamageOpponent();
            break;
        case "proceedDamageOpponent":
            this.proceedDamageOpponent();
            break;
        case "startHealOpponent":
            this.startHealOpponent();
            break;
        case "proceedHealOpponent":
            this.proceedHealOpponent();
            break;
        case "startDamageUser":
            this.startDamageUser();
            break;
        case "proceedDamageUser":
            this.proceedDamageUser();
            break;
        case "displayAutoText":
            this.displayAutoText();
            break; 
        case "displayWaitText":
            this.displayWaitText();
            break;
        case "displayInstantText":
            this.displayInstantText();
            break;
        case "faintPokemon":
            this.startFaintPokemon();
            break;
        case "animateFaintPokemon":
            this.proceedFaintPokemon();
            break; 
        case "inflictPokemonStatus":
            this.inflictPokemonStatus();
            break;
        case "animateUserEffect":
            this.animateUserEffect();
            break;
    }
};
PokemonMZ_BattleManager.initializeEnterTrainerVsWild = function() { 
    const playerSprite = this._spriteset.playerTrainerSprite();
    playerSprite.x = Graphics.boxWidth;
    playerSprite.y = Graphics.boxHeight - 180 - playerSprite.height*playerSprite.scale.y;
    playerSprite.visible = true;
    const pokemon = $PokemonMZ_gameBattle.wildPokemon();
    $gamePlayerTrainer.addSeenPokemon(pokemon._data.id);

    const enemySprite = this._spriteset.enemyPokemonSprite();
    enemySprite.setPokemon(pokemon);
    enemySprite.placeBottomCenter(-100,350);
    enemySprite.visible = true;
    pokemon.setBattleSprite(enemySprite);
    this._enemyChosenPokemon = pokemon;
    this._currentEnemyIndex = 0;
};
PokemonMZ_BattleManager.initializeEnterTrainers = function() {
    const playerSprite = this._spriteset.playerTrainerSprite();
    playerSprite.x = Graphics.boxWidth;
    playerSprite.y = Graphics.boxHeight - 180 - playerSprite.height*playerSprite.scale.y;
    playerSprite.visible = true;

    for (const sprite of this._spriteset.enemyTrainerSprites()) {
        sprite.x = -100;
        sprite.y = 50;
        sprite.visible = true;
    }
};
PokemonMZ_BattleManager.updateEnterTrainers = function() {
    let phaseCompleted = true;
    const playerSprite = this._spriteset.playerTrainerSprite();

    if (playerSprite.x > 50) {
        phaseCompleted = false;
        playerSprite.x -= 10;
    }
    for (const sprite of this._spriteset.enemyTrainerSprites()) {
        if (sprite.x < Graphics.boxWidth - sprite.width*sprite.scale.x - 50) {
            phaseCompleted = false;
            sprite.x += 10;
        }      
    }
    if (phaseCompleted) {
        this.changePhase("displayTrainerMessage");
    }
};
PokemonMZ_BattleManager.updateEnterWild = function() {
    let phaseCompleted = true;
    const playerSprite = this._spriteset.playerTrainerSprite();
    const enemySprite = this._spriteset.enemyPokemonSprite();

    if (playerSprite.x > 50) {
        phaseCompleted = false;
        playerSprite.x -= 10;
    }
    if (enemySprite._bottomCenterX < 570) {
        enemySprite.placeBottomCenter(enemySprite._bottomCenterX + 10,350);
        phaseCompleted = false;
    }      
    if (phaseCompleted) {
        this._enemyChosenPokemon.playCry();
        this.changePhase("displayWildPokemonMessage");
    }
};
PokemonMZ_BattleManager.updateEnemyTrainerLose = function() {
    if ($gameMessage.isBusy()) { return; }

    let phaseCompleted = true;
    for (const sprite of this._spriteset.enemyTrainerSprites()) {
        const destination = Graphics.boxWidth - 50 - sprite.width * sprite.scale.x;
        if (sprite.x > destination) {
            phaseCompleted = false;
            sprite.x -= 10;
        }      
    }
    if (phaseCompleted) {
        this.changePhase("displayEnemyTrainerDefeatMessage");
    }
};
PokemonMZ_BattleManager.updateEnemyTrainerWin = function() {
    if ($gameMessage.isBusy()) { return; }

    let phaseCompleted = true;
    for (const sprite of this._spriteset.enemyTrainerSprites()) {
        const destination = Graphics.boxWidth - 50 - sprite.width * sprite.scale.x;
        if (sprite.x > destination) {
            phaseCompleted = false;
            sprite.x -= 10;
        }      
    }
    if (phaseCompleted) {
        this.changePhase("displayEnemyTrainerVictoryMessage");
    }
};
PokemonMZ_BattleManager.displayTrainerMessage = function() {
    this._playerTeamStatusWindow.refresh();
    this._enemyTeamStatusWindow.refresh();

    this._playerTeamStatusWindow.show();
    this._enemyTeamStatusWindow.show();
    
    const enemy = $PokemonMZ_gameBattle.enemy1();
    const message = enemy.name() + " wants to fight!"
    $gameMessage.add(message);
    this.changePhase("enemyTrainerLeave");
};
PokemonMZ_BattleManager.displayWildPokemonMessage = function() {
    this._playerTeamStatusWindow.refresh();
    this._playerTeamStatusWindow.show();
    
    const pokemon = this._enemyChosenPokemon;;
    const message = "Wild " + pokemon.name() + " appeared!"
    $gameMessage.add(message);
    this.changePhase("displayWildPokemonStatus");
};
PokemonMZ_BattleManager.displayWildPokemonStatus = function() {
    this._enemyPokemonStatusWindow.setPokemon(this._enemyChosenPokemon);
    this._enemyPokemonStatusWindow.show();
    this.changePhase("playerTrainerLeave");
};
PokemonMZ_BattleManager.enemyTrainerLeave = function() {
    if ($gameMessage.isBusy()) { return; }

    if (this._enemyTeamStatusWindow.visible) {
        this._enemyTeamStatusWindow.hide();
    }

    let phaseCompleted = true;
    for (const sprite of this._spriteset.enemyTrainerSprites()) {
        if (sprite.x < Graphics.boxWidth) {
            phaseCompleted = false;
            sprite.x += 10;
        }      
    }
    if (phaseCompleted) {
        this.changePhase("enemySendFirstPokemon");
    }
};
PokemonMZ_BattleManager.markBattledPokemons = function() {
    if (this._currentEnemyIndex > - 1 && this._currentPlayerIndex > -1) {
        this._playerBattledTable[this._currentEnemyIndex][this._currentPlayerIndex] = 1;
    }
};
PokemonMZ_BattleManager.enemySendFirstPokemon = function() {
    const enemy = $PokemonMZ_gameBattle.enemy1();
    this._enemyChosenPokemon = enemy.firstPokemon();
    this._currentEnemyIndex = 0;
    this.enemySendPokemon();
};
PokemonMZ_BattleManager.enemySendNextPokemon = function() {
    this._enemyChosenPokemon = this._enemyNextPokemon;
    this._currentEnemyIndex = this._enemyNextPokemonIndex;
    this.enemySendPokemon();
};
PokemonMZ_BattleManager.enemySendPokemon = function() {
    // Change sprite
    this._enemyTeamStatusWindow.hide();
    const pokemonSprite = this._spriteset.enemyPokemonSprite();
    const enemy = $PokemonMZ_gameBattle.enemy1();
    const pokemon = this._enemyChosenPokemon;
    if (!this._playerHasShifted) {
        // If shifted, no xp gain for the pokemon that left
        this.markBattledPokemons();
    }
    
    // Add to pokedex
    $gamePlayerTrainer.addSeenPokemon(pokemon._data.id);

    pokemon.resetStageModifiers();
    this._enemyPokemonStatusWindow.setPokemon(pokemon);
    pokemonSprite.setPokemon(pokemon);
    pokemonSprite.placeBottomCenter(570,350);
    pokemonSprite.setScale(0.1);
    pokemonSprite.visible = true;
    pokemon.setBattleSprite(pokemonSprite);
    this.changePhase("enemyPokemonAppear");
    const message = enemy.name() + " sent out " + pokemon.name() + "!\\|\\^"
    $gameMessage.add(message);
};
PokemonMZ_BattleManager.enemyPokemonAppear = function() {
    const pokemonSprite = this._spriteset.enemyPokemonSprite();
    if (pokemonSprite.scale.x < 1.0) {
        pokemonSprite.modifyScale(0.1);
    } else {
        this._enemyPokemonStatusWindow.show();
        const pokemon = this._enemyChosenPokemon;
        pokemon.playCry();
        if (this._playerHasSentPokemon) {
            if (this._playerHasShifted) {
                this.changePhase("playerPokemonSwitchBegin");
            } else {
                this.changePhase("startPlayerInput");
            }
            
        } else {
            this.changePhase("playerTrainerLeave");
            
        }
    }
};
PokemonMZ_BattleManager.playerTrainerLeave = function() {
    if ($gameMessage.isBusy()) { return; }

    if (this._playerTeamStatusWindow.visible) {
        this._playerTeamStatusWindow.hide();
    }

    let phaseCompleted = true;
    const playerSprite = this._spriteset.playerTrainerSprite();
    if (playerSprite.x > -playerSprite.width*playerSprite.scale.x) {
            phaseCompleted = false;
            playerSprite.x -= 10;
        }      
    if (phaseCompleted) {
        this.changePhase("playerSendFirstPokemon");
    }
};
PokemonMZ_BattleManager.playerSendFirstPokemon = function() {
    this._playerChosenPokemon = $gamePlayerTrainer.firstBattleReadyPokemon();
    const index = $gamePlayerTrainer.firstBattleReadyPokemonIndex();
    this._currentPlayerIndex = index;
    this._playerHasSentPokemon = true;
    this.playerSendPokemon();
};
PokemonMZ_BattleManager.playerSendPokemon = function() {
    this.markBattledPokemons();

    const pokemonSprite = this._spriteset.playerPokemonSprite();
    const pokemon = this._playerChosenPokemon;
    pokemon.resetStageModifiers();
    this._playerPokemonStatusWindow.setPokemon(pokemon);
    pokemonSprite.setPokemon(pokemon);
    pokemonSprite.placeBottomCenter(130,445);
    pokemonSprite.setScale(0.1);
    pokemonSprite.visible = true;
    pokemon.setBattleSprite(pokemonSprite);
    this.changePhase("playerPokemonAppear");
    const message = "Go, " + pokemon.name() + "!\\|\\^"
    $gameMessage.add(message);
};
PokemonMZ_BattleManager.playerPokemonSwitchBegin = function() {
    if ($gameMessage.isBusy()) { return; }
    const pokemon = this._playerChosenPokemon;
    pokemon.resetStageModifiers();
    const message = pokemon.name() + ", enough! Come back!\\|\\^"
    $gameMessage.add(message);
    this.changePhase("playerPokemonRecall");
}
PokemonMZ_BattleManager.playerPokemonRecall = function() {
    if ($gameMessage.isBusy()) { return; }
    
    const pokemon = this._playerChosenPokemon;
    pokemon.removeTemporaryStatuses();

    const pokemonSprite = this._spriteset.playerPokemonSprite();

    if (pokemonSprite.scale.x == 1.0) {
        this._playerPokemonStatusWindow.hide();
    } else if (pokemonSprite.scale.x > 0) {
        pokemonSprite.modifyScale(-0.1);
    } else {
        pokemonSprite.scale.x = 0;
        this._playerChosenPokemon = $gamePlayerTrainer.pokemon(this._playerSwitchingPokemonId);
        this._currentPlayerIndex = this._playerSwitchingPokemonId;
        this.changePhase("playerSendNextPokemon")
    }
};
PokemonMZ_BattleManager.playerPokemonAppear = function() {
    const pokemonSprite = this._spriteset.playerPokemonSprite();
    if (pokemonSprite.scale.x < 1.0) {
        pokemonSprite.modifyScale(0.1);
    } else {
        this._playerPokemonStatusWindow.show();
        const pokemon = this._playerChosenPokemon;
        pokemon.playCry();
        if (this._playerSwitchingPokemonId > -1) {
            this._playerSwitchingPokemonId = -1;

            if (this._playerHasShifted) {
                this._playerHasShifted = false;
                this.changePhase("startPlayerInput");
            } else {
                this._battleActions.push("enemyMove");
                this.changePhase("nextBattleAction"); 
            }
            return;
        } else {
            this.changePhase("startPlayerInput");
        }
        
    }
};
PokemonMZ_BattleManager.startPlayerInput = function() {
    if ($gameMessage.isBusy() || this._regularMessageWindow.isClosing()) { return; }
    const pokemon = this._playerChosenPokemon;

    this._trainerInputWindow.open()
    this._trainerInputWindow.activate()
    this._staticMessageWindow.setText("What should " + pokemon.name() + " do?")
    this._staticMessageWindow.show()
    this.changePhase("playerInput");
};
PokemonMZ_BattleManager.startPlayerItemUse = function(item) {
    $gamePlayerTrainer.gainBagItem(item.id, -1);
    this._playerUseItem = item;
    this._playerMove = null;
    this._playerMoveIndex = null;
};
PokemonMZ_BattleManager.tryRunAway = function() {
    let escapeSuccess = false;
    const basePlayerSpeed = this._playerChosenPokemon.spd();
    const baseEnemySpeed = this._enemyChosenPokemon.spd();
    const playerSpeed = this._playerChosenPokemon.spdModified();
    const enemySpeed = this._enemyChosenPokemon.spdModified();

    if (playerSpeed > enemySpeed) {
        escapeSuccess = true;
        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.tryRunAway >":
                {
                    "Player Speed":{"Base":basePlayerSpeed, "Modified":playerSpeed}, 
                    "Enemy Speed":{"Base":baseEnemySpeed, "Modified":enemySpeed}, 
                    "Result":"Guaranteed"
                }
            })
        }
    } else {
        this._playerEscapeAttempts++;
        const odds = Math.floor(((playerSpeed*32)/((enemySpeed/4) % 256))) + 30 * this._playerEscapeAttempts;
        const randomValue = Math.randomInt(256);
        escapeSuccess = randomValue < odds;

        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.tryRunAway >":
                {
                    "Player Speed":{"Base":basePlayerSpeed, "Modified":playerSpeed},
                    "Enemy Speed":{"Base":baseEnemySpeed, "Modified":enemySpeed},
                    "Escape Attempts":this._playerEscapeAttempts, 
                    "Odds":odds, 
                    "RandomValue":randomValue, 
                    "Result":escapeSuccess ? "Success":"Failure"
                }
            })
        }
    }
    if (escapeSuccess) {
        this._playerSucceedRunAway = true;
        this._playerFailedRunAway = false;
        this.startPlayerEscape();

    } else {
        this._playerSucceedRunAway = false;
        this._playerFailedRunAway = true;
        $gameMessage.add("Can't escape!");
        this.calculateComputerMove();
    }
};
PokemonMZ_BattleManager.startPlayerEscape = function(move) {
    SoundManager.playEscape();
    const message = "Got away safely!"
    $gameMessage.add(message);
    this.changePhase("endPlayerEscape");
};
PokemonMZ_BattleManager.captureAttempt = function() {
    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        return this.captureAttemptGen1();
    }
};
PokemonMZ_BattleManager.captureAttemptGen1 = function() {
    const ball = this._thrownBall;
    const pokemon = this._enemyChosenPokemon;
    const rate = ball.pkmz_data.gen1rate;

    // Immediate capture for rate -1, for ex. Master balls
    if (rate == -1) {
        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.captureAttemptGen1 >":
                {
                    "Data":{
                        "Ball Rate":rate,
                        "Wobble":3
                    },
                    "Steps":[
                        "Ball rate equals -1",
                        "Capture success, wobble three times",
                    ]
                }
            })

        }
        return {"capture":true, "wobble":3}
    } 

    // Check for immediate capture or failure
    const statusEffect = this.captureStatusEffectGen1(pokemon)
    const hpDivide = Math.max(pokemon.hp()/4,1);
    const hpFactor = Math.min((pokemon.mhp()*255 / ball.pkmz_data.gen1hpFactor)/hpDivide,255);

    const randomValue1 = Math.randomInt(rate+1)
    const randomizer = randomValue1 - statusEffect.randomizerBonus;
    if (randomizer < 0) {
        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.captureAttemptGen1 >":
                {
                    "Data":{
                        "Ball Rate":rate,
                        "Pokemon Status":{"Status":pokemon.status(),"Randomizer Bonus":statusEffect.randomizerBonus},
                        "Random number":{"Initial":randomValue1,"With Status bonus":randomizer},
                        "Wobble":3
                    },
                    "Steps":[
                        "Ball rate above -1 (" + String(rate) + ")",
                        "Status affected random number #1 (" + String(randomizer) + ") below 0",
                        "Capture success, wobble three times"
                    ]
                    
                }
            })
        }
        return {"capture":true, "wobble":3}
    }
    if (pokemon._data.catchRate < randomizer) {
        // Immediate fail
        const fail1 = this.captureFailWobbleGen1(pokemon, ball, hpFactor, statusEffect);

        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.captureAttemptGen1 >":
                {
                    "Data":{
                        "Ball Rate":{"Rate":rate,"Hp Factor Divider":ball.pkmz_data.gen1hpFactor},
                        "Pokemon catch rate":pokemon._data.catchRate,
                        "Pokemon Status":{
                            "Status":pokemon.status(),
                            "Randomizer Bonus":statusEffect.randomizerBonus,
                            "Wobble Bonus":statusEffect.wobbleBonus,
                            "Current hp":pokemon.hp(),
                            "Current hp divided (hp/4)":hpDivide,
                            "Max hp":pokemon.mhp(),
                            "Final hp factor":hpFactor
                        },
                        "Random number #1":{"Initial":randomValue1,"With Status bonus":randomizer},
                        "Wobble":{"Factor":fail1.wobbleFactor, "Times":fail1.wobble}
                    },
                    "Steps":[
                        "Ball rate above -1 (" + String(rate) + ")",
                        "Status affected random number #1 (" + String(randomizer) + ") above 0",
                        "Status affected random number #1 (" + String(randomizer) + ") above pokemon catch rate (" + String(pokemon._data.catchRate) + ")",
                        "Capture failure",
                        "Wobble calculation factor (" + String(fail1.wobbleFactor) + ") gives " + String(fail1.wobble) + " wobble(s)",
                    ]
                }
            })
        }
        return fail1;
    }

    const randomizer2 = Math.randomInt(256);
    if (randomizer2 <= hpFactor) {
        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.captureAttemptGen1 >":
                {
                    "Data":{
                        "Ball Rate":{"Rate":rate,"Hp Factor Divider":ball.pkmz_data.gen1hpFactor},
                        "Pokemon catch rate":pokemon._data.catchRate,
                        "Pokemon Status":{
                            "Status":pokemon.status(),
                            "Randomizer Bonus":statusEffect.randomizerBonus,
                            "Current hp":pokemon.hp(),
                            "Current hp divided (hp/4)":hpDivide,
                            "Max hp":pokemon.mhp(),
                            "Final hp factor":hpFactor
                        },
                        "Random number #1":{"Initial":randomValue1,"With Status bonus":randomizer},
                        "Random number #2":randomizer2,
                        "Wobble":3
                    },
                    "Steps":[
                        "Ball rate above -1 (" + String(rate) + ")",
                        "Status affected random number #1 (" + String(randomizer) + ") above 0",
                        "Status affected random number #1 (" + String(randomizer) + ") below pokemon catch rate (" + String(pokemon._data.catchRate) + ")",
                        "Random number #2 (" + String(randomizer2) + ") below or equal to pokemon+ball Hp Factor (" + String(hpFactor) + ")",
                        "Capture success, wobble three times"
                    ]
                    
                }
            })
        }
        return {"capture":true, "wobble":3}
    } else {
        const fail2 = this.captureFailWobbleGen1(pokemon, ball, hpFactor, statusEffect);
        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_BattleManager.captureAttemptGen1 >":
                {
                    "Data":{
                        "Ball Rate":{"Rate":rate,"Hp Factor Divider":ball.pkmz_data.gen1hpFactor},
                        "Pokemon catch rate":pokemon._data.catchRate,
                        "Pokemon Status":{
                            "Status":pokemon.status(),
                            "Randomizer Bonus":statusEffect.randomizerBonus,
                            "Wobble Bonus":statusEffect.wobbleBonus,
                            "Current hp":pokemon.hp(),
                            "Current hp divided (hp/4)":hpDivide,
                            "Max hp":pokemon.mhp(),
                            "Final hp factor":hpFactor
                        },
                        "Random number #1":{"Initial":randomValue1,"With Status bonus":randomizer},
                        "Random number #2":randomizer2,
                        "Wobble":{"Factor":fail2.wobbleFactor, "Times":fail2.wobble}
                    },
                    "Steps":[
                        "Ball rate above -1 (" + String(rate) + ")",
                        "Status affected random number #1 (" + String(randomizer) + ") above 0",
                        "Status affected random number #1 (" + String(randomizer) + ") below pokemon catch rate (" + String(pokemon._data.catchRate) + ")",
                        "Random number #2 (" + String(randomizer2) + ") above pokemon+ball Hp Factor (" + String(hpFactor) + ")",
                        "Capture failure",
                        "Wobble calculation factor (" + String(fail2.wobbleFactor) + ") gives " + String(fail2.wobble) + " wobble(s)",
                    ]
                }
            })
        }
        return fail2;
    }
};
PokemonMZ_BattleManager.captureStatusEffectGen1 = function(pokemon) {
    if (pokemon.isFrozen() || pokemon.isAsleep()) {
        return {"randomizerBonus":25, "wobbleBonus":10};
    } else if (pokemon.isPoisoned() || pokemon.isBurned() || pokemon.isParalyzed()) {
        return {"randomizerBonus":12, "wobbleBonus":5};
    } else {
        return {"randomizerBonus":0, "wobbleBonus":0};
    }
};
PokemonMZ_BattleManager.captureFailWobbleGen1 = function(pokemon, ball, hpFactor, statusEffect) {
    let wobbleFactor = Math.floor((pokemon._data.catchRate*100 / ball.pkmz_data.gen1rate) * hpFactor/255 + statusEffect.wobbleBonus);
    if (wobbleFactor < 10) {
        return {"capture":false, "wobble":0, "wobbleFactor":wobbleFactor}
    } else if (wobbleFactor < 30) {
        return {"capture":false, "wobble":1, "wobbleFactor":wobbleFactor}
    } else if (wobbleFactor < 70) {
        return {"capture":false, "wobble":2, "wobbleFactor":wobbleFactor}
    } else {
        return {"capture":false, "wobble":3, "wobbleFactor":wobbleFactor}
    }
};
PokemonMZ_BattleManager.startThrowBall = function() {
    this._pokemonCaptureResult = null;
    const ball = this._thrownBall;

    const ballPictureFile = "PokemonMZ_throw_" + ball.pkmz_data.id;
    const bitmap = ImageManager.loadPicture(ballPictureFile);
    bitmap.addLoadListener(this.onPokeballBitmapLoad.bind(this, bitmap))

    if ($PokemonMZ_gameBattle.isWildBattle()) {
        const message = $gamePlayerTrainer.name() + " used " + ball.name + "!\\|\\^"
        $gameMessage.add(message);  
    }
    this.changePhase("animateBallThrow");
};
PokemonMZ_BattleManager.onPokeballBitmapLoad = function(bitmap) {
    this._spriteset.setBallSprite(bitmap);
    const sprite = this._spriteset.ballSprite();
    AudioManager.playStandardSe(PokemonMZ.ballThrowSE);
    sprite.x = 100;
    sprite.y = 400;
    sprite.visible = true;
}
PokemonMZ_BattleManager.animateBallThrow = function() {
    const ballSprite = this._spriteset.ballSprite();
    const pokemonSprite = this._spriteset.enemyPokemonSprite();

    const originX = 100;
    const originY = 400;
    const finalX = 550;
    const finalY = 290;
    const H = 120;

    let t = (ballSprite.x - originX)/(finalX - originX);
    if (ballSprite.x < finalX) {
        t += 0.03;
        ballSprite.x = originX + (finalX - originX)*t
        ballSprite.y = originY + (finalY - originY)*t - 4*H*t*(1-t);
        
    } else {
        if ($PokemonMZ_gameBattle.isTrainerBattle()) {
            AudioManager.playStandardSe(PokemonMZ.ballRejectSE);
            this.changePhase("rejectTrainerBallThrow");
        } else {
            this.changePhase("finishWildBallThrow");
        }
    }
};
PokemonMZ_BattleManager.finishWildBallThrow = function() {
    const pokemonSprite = this._spriteset.enemyPokemonSprite();
    if (pokemonSprite.visible) {
        pokemonSprite.visible = false;
    } else {
        this._pokemonCaptureResult = this.captureAttempt();
        this._pokemonCaptureResult.wobblingPhase = "start";
        this._pokemonCaptureResult.currentWobble = this._pokemonCaptureResult.wobble;
        this.changePhase("animateBallWobble")
    }
};
PokemonMZ_BattleManager.rejectTrainerBallThrow = function() {
    const ballSprite = this._spriteset.ballSprite();
    const finalY = 500;
    if (ballSprite.y < finalY) {
        ballSprite.x -= 10;
        ballSprite.y += 15;
    } else {
        ballSprite.visible = false;
        $gameMessage.add("The trainer blocked the Ball! Don't be a thief!");
        this.changePhase("nextBattleAction")
    }
};
PokemonMZ_BattleManager.animateBallWobble = function() { 
    const ballSprite = this._spriteset.ballSprite();
    const maxAngle = 30;
    const moveAngle = 5;

    if (this._pokemonCaptureResult.currentWobble > 0) {
        switch(this._pokemonCaptureResult.wobblingPhase) {
        case "start":
            AudioManager.playStandardSe(PokemonMZ.ballWobbleSE);
            this._pokemonCaptureResult.wobblingPhase = "left";
        case "left":
            if (ballSprite.angle > -maxAngle) {
                ballSprite.angle -= moveAngle;
            } else {
                this._pokemonCaptureResult.wobblingPhase = "right";
            }
            break;
        case "right":
            if (ballSprite.angle < 0) {
                ballSprite.angle += moveAngle;
            } else {
                this._pokemonCaptureResult.wobblingPhase = "wait";
                this._pokemonCaptureResult.wait = 30;
            }
            break;
        case "wait":
            if (this._pokemonCaptureResult.wait > 0) {
                this._pokemonCaptureResult.wait--;
            } else {
                this._pokemonCaptureResult.currentWobble--;
                this._pokemonCaptureResult.wobblingPhase = "start";
            }
            break;
        }
    } else {
        if (ballSprite.angle < maxAngle) {
            ballSprite.angle += moveAngle;
        } else {
            if (this._pokemonCaptureResult.capture) {
                this.changePhase("pokemonCaught");
            } else {
                this.changePhase("pokemonBreakFree");
            }
        }
    }
};
PokemonMZ_BattleManager.pokemonBreakFree = function() {
    const ballSprite = this._spriteset.ballSprite();
    const pokemonSprite = this._spriteset.enemyPokemonSprite();

    ballSprite.visible = false;
    pokemonSprite.visible = true;

    AudioManager.playStandardSe(PokemonMZ.ballEscapeSE);
    switch(this._pokemonCaptureResult.wobble) {
    case 0:
        $gameMessage.add("The ball missed the Pokémon!");
        break;
    case 1:
        $gameMessage.add("Darn! The Pokémon broke free!");
        break;
    case 2:
        $gameMessage.add("Aww! It appeared to be caught!");
        break;
    case 3:
        $gameMessage.add("Shoot! It was so close too!");
        break;
    }
    this.changePhase("nextBattleAction")
};
PokemonMZ_BattleManager.pokemonCaught = function() {
    const ballSprite = this._spriteset.ballSprite();
    const pokemonSprite = this._spriteset.enemyPokemonSprite();
    AudioManager.playMe({"name":PokemonMZ.caughtPokemonME,"pan":0,"volume":100, "pitch":100})

    this._capturedPokemon = new PokemonMZ_Game_Pokemon(this._enemyChosenPokemon.intEnemyId(), this._enemyChosenPokemon.level())
    this._capturedPokemon.cloneFromWildPokemon(this._enemyChosenPokemon);

    const pokemonStrId = this._capturedPokemon._data.id;
    const pokemonName = this._capturedPokemon.name();

    $gameMessage.add("All right! " + pokemonName + " was caught!");
    
    if (!$gamePlayerTrainer.isPokemonCaptured(pokemonStrId)) {
        $gamePlayerTrainer.addCapturedPokemon(pokemonStrId);
        $gameMessage.add("New Pokédex data will be added for " + pokemonName + "!")
        this.changePhase("displayPokedexEntry");
    } else {
        this.changePhase("askForNickname");
    }
};
PokemonMZ_BattleManager.displayPokedexEntry = function() {
    if ($gameMessage.isBusy()) { return; }
    if (!this._pokedexDataWindow.visible) {
        this._pokedexDataWindow.setPokemon(this._capturedPokemon._data.id)
        this._pokedexDataWindow.show();
        this._pokedexDataWindow.activate();
    }
};
PokemonMZ_BattleManager.askForNickname = function() {
    if ($gameMessage.isBusy() || this._regularMessageWindow.isClosing()) { return; }
    const pokemon = this._capturedPokemon;
    this._staticMessageWindow.setText("Do you want to give a nickname\nto " + pokemon.name() + "?")
    this._staticMessageWindow.show()
    this._yesNoWindow.setMode("nickname")
    this._yesNoWindow.open()
    this._yesNoWindow.activate();
    this.changePhase("playerInput");
};
PokemonMZ_BattleManager.endPlayerFaintedPokemon = function() {
    if ($gameMessage.isBusy()) { return; }

    this._playerChosenPokemon.cleanAfterFaint();

    // Player turn is removed after faint
    let index = this._battleActions.indexOf("playerMove");
    while (index > -1) {
        this._battleActions.splice(index,1);
        index = this._battleActions.indexOf("playerMove");
    }

    this.changePhase("afterPlayerFaintedPokemon");
};
PokemonMZ_BattleManager.endEnemyFaintedPokemon = function() { 
    if ($gameMessage.isBusy()) { return; }

    this._enemyChosenPokemon.cleanAfterFaint();

    // Enemy turn is removed after faint
    let index = this._battleActions.indexOf("enemyMove");
    while (index > -1) {
        this._battleActions.splice(index,1);
        index = this._battleActions.indexOf("enemyMove");
    }

    const enemyIndex = this._currentEnemyIndex;
    const xpGain = this._enemyChosenPokemon.expProvided($PokemonMZ_gameBattle.isTrainerBattle());

    let counter = 0;
    this._playerXpGains = [];
    for (let i=0; i<$gamePlayerTrainer._pokemons.length; i++) {
        let pokemon = $gamePlayerTrainer.pokemon(i);
        if (this._playerBattledTable[this._currentEnemyIndex][i] == 1) {
            if (!pokemon.isFainted()) {
                counter++;
                this._playerXpGains.push(1);
            } else {
                this._playerXpGains.push(0);
            }
        } else {
            this._playerXpGains.push(0);
        }
    }

    const splittedExp = Math.floor(xpGain / counter);
    for (let i=0; i<$gamePlayerTrainer._pokemons.length; i++) {
        if (this._playerXpGains[i] > 0) {
            this._playerXpGains[i] = splittedExp;
        }
    };

    if (counter > 0) {
        this.changePhase("nextExpGains");
    } else {
        this.changePhase("playerResolveActionSteps");
    }

};
PokemonMZ_BattleManager.nextExpGains = function() { 
    if ($gameMessage.isBusy()) { return; }
    this._pokemonLevelUpWindow.hide();
    const evGain = this._enemyChosenPokemon.evProvided();

    let gaveXp = false;
    for (let i=0; i<$gamePlayerTrainer._pokemons.length; i++) {
        this._levelingUpPokemon = $gamePlayerTrainer.pokemon(i);
        this._levelingUpPokemonExp = this._playerXpGains[i];;

        if (this._levelingUpPokemonExp > 0) {
            this._playerXpGains[i] = 0;
            gaveXp = true;
            const message = this._levelingUpPokemon.name() + " gained " + String(this._levelingUpPokemonExp) + " experience points!"
            $gameMessage.add(message);
            if (this._levelingUpPokemon.wouldLevelUpWithExp(this._levelingUpPokemonExp)) {
                this.changePhase("playerPokemonLeveledUp")
            } else {
                this._levelingUpPokemon.gainExp(this._levelingUpPokemonExp);
                this._levelingUpPokemon.gainEv(evGain.hp, evGain.patk, evGain.pdef, evGain.satk, evGain.sdef, evGain.spd);
                this.changePhase("nextExpGains");   
            }
            break;
        }
    };
    if (!gaveXp) {
        this.changePhase("afterEnemyFaintedPokemon");
    }
};
PokemonMZ_BattleManager.playerPokemonLeveledUp = function() {
    if ($gameMessage.isBusy()) { return; }

    AudioManager.playStandardSe(PokemonMZ.levelUpSE);
    const evGain = this._enemyChosenPokemon.evProvided();
    this._levelingUpPokemon.gainExp(this._levelingUpPokemonExp);
    this._levelingUpPokemon.gainEv(evGain.hp, evGain.patk, evGain.pdef, evGain.satk, evGain.sdef, evGain.spd);
    this._levelingUpPokemon.setHasLeveledUp();
    this._playerPokemonStatusWindow.refresh(true);
    const newLevel = this._levelingUpPokemon.level();
    const message = this._levelingUpPokemon.name() + " grew to level " + String(newLevel) + "!"

    this._pokemonLevelUpWindow.setPokemon(this._levelingUpPokemon);
    this._pokemonLevelUpWindow.show();

    $gameMessage.add(message)
    this.changePhase("startLearningMove");
};
PokemonMZ_BattleManager.startLearningMove = function() {
    if ($gameMessage.isBusy()) { return; }
    const newMoves = this._levelingUpPokemon.movesLearnWaitlist();
    if (newMoves.length > 0) {
        this.changePhase("proceedLearningMove");
    } else {
        this.changePhase("nextExpGains");
    }
};
PokemonMZ_BattleManager.proceedLearningMove = function() { 
    this._pokemonLevelUpWindow.hide();
    const pokemon = this._levelingUpPokemon;
    if (pokemon.moves().length < 4) {
        this.proceedLearningMoveInstant();
    } else {
        this.proceedLearningMoveAsk();
    }
};
PokemonMZ_BattleManager.proceedLearningMoveInstant = function() {
    AudioManager.playStandardSe(PokemonMZ.learnMoveSE);
    const pokemon = this._levelingUpPokemon;
    const moveStringId = this._levelingUpPokemon.getNextMoveLearned();
    pokemon.learnMove(moveStringId);
    const moveName = pokemon.moveNameFromStringId(moveStringId);
    const message = pokemon.name() + " learned " + moveName + "!";
    $gameMessage.add(message)
    this.changePhase("startLearningMove");
}
PokemonMZ_BattleManager.proceedLearningMoveAsk = function() {
    if ($gameMessage.isBusy() || this._regularMessageWindow.isClosing()) { return; }

    if (!this._moveAskedFor) {
        this._moveAskedFor = this._levelingUpPokemon.getNextMoveLearned();
    }
    
    const pokemon = this._levelingUpPokemon;
    const pokemonName = pokemon.name();
    const moveName = pokemon.moveNameFromStringId(this._moveAskedFor);

    let message = pokemonName + " is trying to learn " +  moveName + "!";
    message += "\nBut, " + pokemonName + " can't learn more than 4 moves!";
    $gameMessage.add(message);

    this.changePhase("waitReplacingMove");
}
PokemonMZ_BattleManager.waitReplacingMove = function() { 
    if ($gameMessage.isBusy() || this._regularMessageWindow.isClosing()) { return; }
    const pokemon = this._levelingUpPokemon;
    const moveName = pokemon.moveNameFromStringId(this._moveAskedFor);

    this._staticMessageWindow.setText("Delete an older move to make room for\n" + moveName + "?")
    this._staticMessageWindow.show()
    this._yesNoWindow.setMode("learnMove")
    this._yesNoWindow.open()
    this._yesNoWindow.activate();
    this._yesNoWindow.show();
    this.changePhase("playerInput");
};
PokemonMZ_BattleManager.finishReplacingMove = function() { 
    // Simply display learn message and play sound (move alreayd learnt in Scene)
    if ($gameMessage.isBusy() || this._regularMessageWindow.isClosing()) { return; }
    AudioManager.playStandardSe(PokemonMZ.learnMoveSE);
    const pokemon = this._levelingUpPokemon;
    const moveName = pokemon.moveNameFromStringId(this._moveAskedFor);
    const message = pokemon.name() + " learned " + moveName + "!";
    this.clearMoveAskedFor();
    $gameMessage.add(message)
    this.changePhase("startLearningMove");
}
PokemonMZ_BattleManager.afterEnemyFaintedPokemon = function() {
    if ($gameMessage.isBusy()) { return; }

    this._pokemonLevelUpWindow.hide();

    // Do we still have result steps?
    if (this._currentAction.hasRemainingResultSteps()) {
        this._battleActions.push("afterEnemyFainted");
        this.changePhase("playerResolveActionSteps");
        return;
    }
    
    if ($PokemonMZ_gameBattle.isTrainerBattle()) {
        this._enemyTeamStatusWindow.refresh();
        this._enemyTeamStatusWindow.show();

        const enemy = $PokemonMZ_gameBattle.enemy1();
        if  (enemy.hasRemainingBattleReadyPokemon()) {
            // GENERATION 1 : SEND NEXT POKEMON, NO MATTER WHAT
            this._enemyNextPokemon = enemy.firstBattleReadyPokemon();;
            this._enemyNextPokemonIndex = enemy.firstBattleReadyPokemonIndex();
            if (ConfigManager.battleStyle == "shift") {
                this.changePhase("askForPokemonChange")
            } else {
                this.changePhase("enemySendNextPokemon")
            }
        } else {
            PokemonMZ_BattleManager.playVictoryMe();
            const message = $gamePlayerTrainer.name() + " has defeated " + enemy.name() + "!"
            $gameMessage.add(message);
            this.changePhase("enemyTrainerLose");
        }
    } else {
        // Wild Battle, it is over.
        this.winBattle();
    }


};
PokemonMZ_BattleManager.askForPokemonChange = function() {
    if ($gameMessage.isBusy() || this._regularMessageWindow.isClosing()) { return; }

    const enemy = $PokemonMZ_gameBattle.enemy1();
    let shiftMessage = enemy.name() + " is about to use " + this._enemyNextPokemon.name() + "!"
    shiftMessage += "\nWill " + $gamePlayerTrainer.name() + " change Pokémon?"
    this._staticMessageWindow.setText(shiftMessage)
    this._staticMessageWindow.show()
    this._yesNoWindow.setMode("shift")
    this._yesNoWindow.open()
    this._yesNoWindow.activate();
    this.changePhase("playerInput");
};
PokemonMZ_BattleManager.afterPlayerFaintedPokemon = function() {
    if ($gameMessage.isBusy()) { return; }

    // Do we still have result steps?
    if (this._currentAction.hasRemainingResultSteps()) {
        this._battleActions.push("afterPlayerFainted");
        this.changePhase("enemyResolveActionSteps");
        return;
    }

    if ($gamePlayerTrainer.hasRemainingBattleReadyPokemon()) {
        if ($PokemonMZ_gameBattle.isTrainerBattle()) {

            if (this._enemyChosenPokemon.isFainted()) {
                // Enemy down - we don't need to change
                this.changePhase("afterEnemyFaintedPokemon");
            } else {
                // FORCE POKEMON CHANGE
                SceneManager._scene._pokemonSelectMode = "sendPokemon";
                this._pokemonListWindow.forbidCancel();
                this._pokemonListWindow.show();
                this._pokemonListWindow.activate();
                this.changePhase("playerInput");
            }
        } else if ($PokemonMZ_gameBattle.isWildBattle()) {
            // Wild battle
            if (this._enemyChosenPokemon.isFainted()) {
                // Enemy down - we don't need to change
                this.changePhase("afterEnemyFaintedPokemon");
            } else {
                // Ask for next pokemon if enemy still standing
                this._staticMessageWindow.setText("Use next Pokémon?")
                this._staticMessageWindow.show()
                this._yesNoWindow.setMode("nextPokemon")
                this._yesNoWindow.open()
                this._yesNoWindow.activate();
                this.changePhase("playerInput");
            }
        };
    } else {
        if ($PokemonMZ_gameBattle.isTrainerBattle()) {
            // Go to enemy victory message if there is a message
            const enemy = $PokemonMZ_gameBattle.enemy1();
            const victoryText = enemy.victoryText();
            if (victoryText) {
                this._enemyPokemonStatusWindow.hide();
                this._spriteset.enemyPokemonSprite().hide();
                this.changePhase("enemyTrainerWin");
            } else {
                if (this._canLose) {
                    this.changePhase("loseBattle");
                } else {
                    this.changePhase("gameOver");
                }
            }
        } else {
            this.changePhase("gameOver");
        }

    }
};
PokemonMZ_BattleManager.displayEnemyTrainerVictoryMessage = function() {
    if ($gameMessage.isBusy()) { return; }

    const enemy = $PokemonMZ_gameBattle.enemy1();
    const actor = $gameActors.actor(enemy._actorId);

    $gameMessage.setSpeakerName(enemy.name());
    $gameMessage.setFaceImage(actor._faceName, actor._faceIndex);
    $gameMessage.add(enemy.victoryText());
    if (this._canLose) {
        this.changePhase("loseBattle");
    } else {
        this.changePhase("gameOver");
    }
    
};
PokemonMZ_BattleManager.displayEnemyTrainerDefeatMessage = function() {
    if ($gameMessage.isBusy()) { return; }

    const enemy = $PokemonMZ_gameBattle.enemy1();
    const actor = $gameActors.actor(enemy._actorId);

    $gameMessage.setSpeakerName(enemy.name());
    $gameMessage.setFaceImage(actor._faceName, actor._faceIndex);
    $gameMessage.add(enemy.defeatText());
    this.changePhase("givePlayerMoney");
};
PokemonMZ_BattleManager.givePlayerMoney = function() {
    if ($gameMessage.isBusy()) { return; }

    const enemy = $PokemonMZ_gameBattle.enemy1();
    const money = enemy.money();
    $gamePlayerTrainer.addMoney(money);

    const message = $gamePlayerTrainer.name() + " got " + String(money) + TextManager.currencyUnit + " for winning!"
    $gameMessage.add(message);
    this.changePhase("winBattle");
};
PokemonMZ_BattleManager.gameOver = function() {
    if ($gameMessage.isBusy()) { return; }
    const lostMoney = $gamePlayerTrainer.loseMoneyAfterDefeat(); // Note the value will be used in further generations
    const message = $gamePlayerTrainer.name() + " is out of useable Pokémon!\n" +  $gamePlayerTrainer.name() + " blacked out!"
    $gameMessage.add(message);

    const location = $gamePlayerTrainer.respawnLocation();
    $gamePlayer.reserveTransfer(location.mapId,location.x,location.y,2,0);

    $gamePlayerTrainer.healTeam();
    this.changePhase("afterGameOver");
};
PokemonMZ_BattleManager.playVictoryMe = function() {
    AudioManager.playMe($gameSystem.victoryMe());
};
PokemonMZ_BattleManager.winBattle = function() {
    if ($gameMessage.isBusy()) { return; }
    this._playerChosenPokemon.removeTemporaryStatuses();
    if (this._eventCallback) {
        this._eventCallback(0);
    }
    $gameSystem.onBattleWin();
    $gameMap.askForEvolutionCheck();
    this.exitBattleScene();
};
PokemonMZ_BattleManager.loseBattle = function() {
    if ($gameMessage.isBusy()) { return; }

    this._playerChosenPokemon.removeTemporaryStatuses();

    if (this._eventCallback) {
        this._eventCallback(2);
    }
    this.exitBattleScene();
};
PokemonMZ_BattleManager.escapeBattle = function() {
    if ($gameMessage.isBusy()) { return; }

    this._playerChosenPokemon.removeTemporaryStatuses();
    if (this._eventCallback) {
        this._eventCallback(1);
    }
    $gameSystem.onBattleEscape();
    this.exitBattleScene();
};
PokemonMZ_BattleManager.exitBattleScene = function() {
    this.replayBgmAndBgs();
    SceneManager.pop();
};




PokemonMZ_BattleManager.afterGameOver = function() {
    if ($gameMessage.isBusy()) { return; }
    this._playerChosenPokemon.removeTemporaryStatuses();
    this.replayBgmAndBgs();
    if ($gameMap && $gameMap._interpreter) {
        $gameMap._interpreter.terminate();  
    }
    SceneManager.pop();
};
PokemonMZ_BattleManager.addWildToParty = function() { 
    $gamePlayerTrainer.givePokemonAfterNickname(this._capturedPokemon);
    this.changePhase("winBattle");
};
PokemonMZ_BattleManager.addWildToBox = function() { 
    $gamePlayerTrainer.addPokemonToCurrentBox(this._capturedPokemon);
    const message = this._capturedPokemon.name() + " was transferred to " + $gamePlayerTrainer.currentBoxName() + "!";
    $gameMessage.add(message);
    this.changePhase("winBattle");
};
PokemonMZ_BattleManager.hasAnyMoveUseable = function(pokemon) {
    return pokemon.hasAnyMoveUseable();
};
PokemonMZ_BattleManager.hasPlayerAnyMoveUseable = function() {
    return this.hasAnyMoveUseable(this._playerChosenPokemon);
};
PokemonMZ_BattleManager.hasEnemyAnyMoveUseable = function() {
    return this.hasAnyMoveUseable(this._playerChosenPokemon);
};
PokemonMZ_BattleManager.moveUseability = function(pokemon, moveIndex) {
    return pokemon.moveUseability(moveIndex);
};
PokemonMZ_BattleManager.playerMoveUseability = function(moveIndex) {
    return this.moveUseability(this._playerChosenPokemon, moveIndex);
};
PokemonMZ_BattleManager.enemyMoveUseability = function(moveIndex) {
    return this.moveUseability(this._enemyChosenPokemon, moveIndex);
};
PokemonMZ_BattleManager.playerMoveForbidden = function() {
    if ($gameMessage.isBusy()) { return; }
    this.changePhase("playerInput");
    this._staticMessageWindow.show();
    this._trainerInputWindow.show();
    this._trainerMovesWindow.show();
    this._trainerMovesWindow.activate();
};
PokemonMZ_BattleManager.calculateComputerMove = function() { //TODO
    const trainer = $PokemonMZ_gameBattle.enemy1();
    const enemy = this._enemyChosenPokemon;

    // TODO - check forced moves
    const availableMoves = [];
    const moves = enemy.moves();
    for (let i=0; i<moves.length; i++) {
        if (this.enemyMoveUseability(i) == "") {
            availableMoves.push(i)
        }
    }

    const numAvailableMoves = availableMoves.length;
    const ia = $PokemonMZ_gameBattle.isTrainerBattle() ? trainer.ia() : "generic"

    if (numAvailableMoves > 0) {
        switch (ia) {
        case "generic":
            // Random move
            this._enemyMoveIndex = Math.randomInt(availableMoves.length)
        }
    } else {
        this._enemyMoveIndex = -1;
    }

    // Determine skill order
    this.calculateBattleActions();
};
PokemonMZ_BattleManager.calculateBattleActions = function() {
    // Determine skill order, but also other effect like switching

    // No battle calculating for switching in order to animate first
    // However the computer move is already set, targeted at the previous pokemon
    if (this._playerSwitchingPokemonId > -1) {
        this.playerPokemonSwitchBegin();
        return;
    }

    // If player failed its escape - player move is emptied
    if (this._playerFailedRunAway) {
        this._battleActions.push("playerFailedRunAway");
        this._battleActions.push("enemyMove");
        this.changePhase("nextBattleAction"); 
        return;
    }

    // If player used item - moved first
    if (this._playerUseItem) {
        
        // Checks if item is already applied on pokemon in menu,
        // or if the item is direct, like a pokeball
        switch (this._playerUseItem.pkmz_data.effect) {
        case "ball":
            this._battleActions.push("playerStartUsingItem");
            break;
        default:
            this._playerUseItem = null;
            this._battleActions.push("playerUsedItem");
        }
        this._battleActions.push("enemyMove");
        this.changePhase("nextBattleAction"); 
        return;
    }

    const playerMovePriority = this._playerChosenPokemon.movePriority(this._playerMoveIndex);
    const enemyMovePriority = this._enemyChosenPokemon.movePriority(this._enemyMoveIndex);
    if (playerMovePriority > enemyMovePriority) {
        this._battleActions.push("playerMove");
        this._battleActions.push("enemyMove");
        this.changePhase("nextBattleAction"); 
        return;
    } else if (enemyMovePriority > playerMovePriority) {
        this._battleActions.push("enemyMove");
        this._battleActions.push("playerMove");
        this.changePhase("nextBattleAction"); 
        return;
    }

    // Calculate speed to determine order
    const playerSpeed = this._playerChosenPokemon.spdModified();
    const enemySpeed = this._enemyChosenPokemon.spdModified();

    if (playerSpeed > enemySpeed) {
        this._battleActions.push("playerMove");
        this._battleActions.push("enemyMove");
        this.changePhase("nextBattleAction"); 
        return;
    } else if (enemySpeed > playerSpeed) {
        this._battleActions.push("enemyMove");
        this._battleActions.push("playerMove");
        this.changePhase("nextBattleAction"); 
        return;
    }

    // Equal speed, random decision
    const isPlayerFirst = Math.random() < 0.5;
    if (isPlayerFirst) {
        this._battleActions.push("playerMove");
        this._battleActions.push("enemyMove");
    } else {
        this._battleActions.push("enemyMove");
        this._battleActions.push("playerMove");
    }
    this.changePhase("nextBattleAction"); 
};
PokemonMZ_BattleManager.nextBattleAction = function() {
    if ($gameMessage.isBusy() || this.isGaugeAnimationPlaying()) { return; }

    if (this._battleActions.length > 0) {
        const action = this._battleActions.splice(0,1)[0];
        switch (action) {
            case "playerStartUsingItem":
                this.startPlayerItem();
                break;
            case "playerUsedItem":
                this.endPlayerItem();
                break;
            case "playerMove":
                this.startPlayerMove();
                break;
            case "enemyMove":
                this.startEnemyMove();
                break;
            case "afterPlayerFainted":
                this.changePhase("afterPlayerFaintedPokemon");
                break;
            case "afterEnemyFainted":
                this.changePhase("afterEnemyFaintedPokemon");
                break;
        }
    } else {
        // Remove flinch status after actions
        this._playerChosenPokemon.unflinch();
        this._enemyChosenPokemon.unflinch();
        this.startPlayerInput();
    }
};




PokemonMZ_BattleManager.startMove = function(side) {
    let nextPhase;
    let pokemon;
    let oppositePokemon;
    let move;
    let moveIndex;

    if (side == "player") {
        nextPhase = "playerResolveActionSteps";
        pokemon = this._playerChosenPokemon;
        oppositePokemon = this._enemyChosenPokemon;
        moveIndex = this._playerMoveIndex;
    } else if (side == "enemy") {
        nextPhase = "enemyResolveActionSteps";
        pokemon = this._enemyChosenPokemon;
        oppositePokemon = this._playerChosenPokemon;
        moveIndex = this._enemyMoveIndex;
    }

    if (moveIndex == -1) {
        move = pokemon.moveStruggle();
    } else {
        move = pokemon.move(moveIndex);
    }

    const moveName = pokemon.moveName(move)
    this._currentAction = new PokemonMZ_Game_Action(pokemon, side);

    // Do not move if flinched
    if (pokemon.isFlinched()) {
        this._currentAction.addResultSteps(["autotext","isFlinched",this._currentAction.side()])
        this.changePhase(nextPhase);
        return;
    };

    // Calculate paralysis
    if (pokemon.isParalyzed() && Math.random() < 0.25) {
        this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "paralyzed"])
        this._currentAction.addResultSteps(["autotext","isParalyzed",this._currentAction.side()])
        this.changePhase(nextPhase);
        return;
    }

    // Calculate freeze
    if (pokemon.isFrozen()) {
        this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "frozen"])
        this._currentAction.addResultSteps(["autotext","isFrozen",this._currentAction.side()])
        this.changePhase(nextPhase);
        return;
    }

    // Calculate sleep
    // Gen 1 : doesn't move when wakes up
    if (pokemon.isAsleep()) {
        pokemon.nextSleepTurn();
        let message = ""
        if (pokemon.isAsleep()) {
            this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "asleep"])
            this._currentAction.addResultSteps(["autotext","isAsleep",this._currentAction.side()])
        } else {
            this._currentAction.addResultSteps(["autotext","wokeUp",this._currentAction.side()])
        }
        this.changePhase(nextPhase);
        return;
    }

    // Calculate confusion
    if (pokemon.isConfused()) {
        pokemon.nextConfusionTurn();
        if (pokemon.isConfused()) {
            this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "confused"])
            this._currentAction.addResultSteps(["autotext","isConfused",this._currentAction.side()])
            if (Math.random() < 0.5) {
                this._currentAction.addResultSteps(["autotext","confusedHurt",this._currentAction.side()])
                move = pokemon.moveSelfHurtConfusion();
                this._currentAction.setMove(move.id, pokemon);
                this._currentAction.calculate();
                this.changePhase(nextPhase);
                return;
            }
        } else {
            // Add message but plays action as intended
            this._currentAction.addResultSteps(["autotext","outConfusion",this._currentAction.side()])
        }
    }

    // Get battle result index to insert text
    const battleIndex = this._currentAction.resultStepsLength();

    // Consume PP
    pokemon.consumePP(moveIndex);
    this._currentAction.setMove(move.id, oppositePokemon);
    this._currentAction.calculate();

    if (moveIndex == -1) {
        this._currentAction.insertResultStepsAt(["autotext","noMovesLeft",this._currentAction.side()], battleIndex)
        battleIndex++;
    };
    this._currentAction.insertResultStepsAt(["autotext","useMove",this._currentAction.side(),moveName], battleIndex)
    this.changePhase(nextPhase);
};


PokemonMZ_BattleManager.startPlayerMove = function() {
    this.startMove("player")
};
PokemonMZ_BattleManager.startEnemyMove = function() {
    this.startMove("enemy");
};






PokemonMZ_BattleManager.startPlayerItem = function() {
    // Direct item uses
    switch (this._playerUseItem.pkmz_data.effect) {
        case "ball":
            //TODO LOCK CAPTURE FOR TRAINER AND GHOST MAROWAK
            this._thrownBall = this._playerUseItem;
            this._playerUseItem = null;
            this.changePhase("throwBall");
            break;
    }
};
PokemonMZ_BattleManager.endPlayerItem = function() {
    // Called to deal with after effects such as burn, and so on
    this._playerPokemonStatusWindow.refresh(true);
    const pokemon = this._playerChosenPokemon;
    this._currentAction = new PokemonMZ_Game_Action(pokemon, "player");
    this._currentAction.calculateStatusEffects(pokemon.hp());
    this.changePhase("playerResolveActionSteps");
};
PokemonMZ_BattleManager.resolveNextResultStep = function() {
    if ($gameMessage.isBusy() || this._spriteset.isAnimationPlaying() ) { return; }
    const resultSteps = this._currentAction.resultSteps();
    if (this._currentAction.hasRemainingResultSteps()) {
        const step = this._currentAction.getNextResultStep();

        if (PokemonMZ.debugLog) {
            if (this._debugStep != step[0]) {
                this._debugStep = step[0];
                console.log("PokemonMZ_BattleManager.resolveNextResultStep > " + this._debugStep);
            }
        }
        switch (step[0]) {
            case "hitAnimation":
                this.changeSubPhase("targetHitAnimation");
                this._subPhaseParams = [step[1], step[2]];
                break;
            case "se":
                this.changeSubPhase("playSe");
                this._subPhaseParams = [step[1]];
                break;
            case "damageOpponent":
                this.changeSubPhase("startDamageOpponent");
                this._subPhaseParams = [step[1]];
                break;
            case "damageUser":
                this.changeSubPhase("startDamageUser");
                this._subPhaseParams = [step[1]];
                break;
            case "healOpponent":
                this.changeSubPhase("startHealOpponent");
                this._subPhaseParams = [step[1]];
                break;
            case "autotext":
                this.changeSubPhase("displayAutoText");
                this._subPhaseParams = [step[1], step[2], step[3]];
                break;
            case "instanttext":
                this.changeSubPhase("displayInstantText");
                this._subPhaseParams = [step[1], step[2], step[3]];
                break;
            case "animateUserEffect":
                this.changeSubPhase("animateUserEffect");
                this._subPhaseParams = [step[1], step[2], step[3]];
                break;
            case "waittext":
                this.changeSubPhase("displayWaitText");
                this._subPhaseParams = [step[1], step[2], step[3]];
                break;
            case "faintPokemon":
                this.changeSubPhase("faintPokemon");
                this._subPhaseParams = [step[1], step[2]];
                break;
            case "burnPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["burn", step[1]];
                break;
            case "confusePokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["confusion", step[1]];
                break;
            case "flinchPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["flinch", step[1]];
                break;
            case "seedPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["seed", step[1]];
                break;  
            case "sleepPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["sleep", step[1]];
                break;  
            case "poisonPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["poison", step[1]];
                break;
            case "paralyzePokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["paralysis", step[1]];
                break;
        }
    } else {
        if (PokemonMZ.debugLog) {
            if (this._debugStep != "") {
                this._debugStep = "";
                console.log("PokemonMZ_BattleManager.resolveNextResultStep > nextBattleAction");
            }
        }
        this.nextBattleAction();
    }
};
PokemonMZ_BattleManager.targetHitAnimation = function() {

    if (ConfigManager.battleAnimation) {
        const sprite = this._subPhaseParams[0];
        const animationId = this._subPhaseParams[1];
        if (animationId) {
            const request = {
                targets: [sprite],
                animationId: animationId,
                mirror: false
            };
            this._spriteset.createAnimation(request);
            sprite.updateTransform();
        }
    }
    this.clearSubPhase();
};
PokemonMZ_BattleManager.playSe = function() {
    const se = this._subPhaseParams[0];
    let seName = "";
    switch(se) {
        case "normal":
            AudioManager.playStandardSe(PokemonMZ.normalDamageSE);
            break
        case "weak":
            AudioManager.playStandardSe(PokemonMZ.weakDamageSE);
            break;
        case "strong":
            AudioManager.playStandardSe(PokemonMZ.strongDamageSE);
            break;
    }
    this.clearSubPhase();
};
PokemonMZ_BattleManager.startDamageOpponent = function() {
    const opponent = this._currentAction.opponent();
    const damage = this._subPhaseParams[0];

    this._damageTransition.start = opponent.hp();
    this._damageTransition.end = opponent.hp() - damage;

    // Calculate how fast the hp bar will drop down
    // If attack drops between 0-100% hp, the curve is linear, 
    // up to 200 frames for 100% hp
    // If attack drops above 100% hp, the curvez is linear decrease
    // up to 30 frames for 1000% hp
    // If attack drops above 1000% hp, the curve is contant, 30 frames
    const percentDamage = damage / opponent.mhp() * 100;
    const numFramesCompleteBar = 120;
    const numFramesOverkill = 30;
    let coefA = 0;
    let coefB = 0;

    if (percentDamage <= 100) {
        coefA = numFramesCompleteBar/100;
        coefB = 0;
    } else if (percentDamage <= 1000) {
        coefA = (numFramesOverkill - numFramesCompleteBar) / (1000 - 100);
        coefB = numFramesCompleteBar - 100*coefA;
    } else {
        coefA = 0;
        coefB = numFramesOverkill;
    }

    const numFrames = coefA * percentDamage + coefB;
    this._subPhaseParams[0] = damage / numFrames;

    this.changeSubPhase("proceedDamageOpponent");
};
PokemonMZ_BattleManager.proceedDamageOpponent = function() {
    const opponent = this._currentAction.opponent();
    const damage = this._subPhaseParams[0];
    const opponentHp = opponent.hp();

    if (opponentHp > this._damageTransition.end && opponentHp > 0) {
        let newHp = (opponentHp - this._subPhaseParams[0]).clamp(this._damageTransition.end, opponent.mhp());
        if (newHp < 0) { newHp = 0; }

        opponent.setHp(newHp)

        if (this._phase == "playerResolveActionSteps") {
            this._enemyPokemonStatusWindow.refresh(true);
        } else if (this._phase == "enemyResolveActionSteps") {
            this._playerPokemonStatusWindow.refresh(true);
        }
    } else {
        this.clearSubPhase();
    }
};
PokemonMZ_BattleManager.startHealOpponent = function() {
    const opponent = this._currentAction.opponent();
    const heal = this._subPhaseParams[0];

    this._damageTransition.start = opponent.hp();
    this._damageTransition.end = (opponent.hp() + heal).clamp(0, opponent.mhp());

    // Calculate how fast the hp bar will go up
    // If attack drops between 0-100% hp, the curve is linear, 
    // up to 200 frames for 100% hp
    // If attack drops above 100% hp, the curvez is linear decrease
    // up to 30 frames for 1000% hp
    // If attack drops above 1000% hp, the curve is contant, 30 frames
    const percentDamage = heal / opponent.mhp() * 100;
    const numFramesCompleteBar = 120;
    const numFramesOverkill = 30;
    let coefA = 0;
    let coefB = 0;

    if (percentDamage <= 100) {
        coefA = numFramesCompleteBar/100;
        coefB = 0;
    } else if (percentDamage <= 1000) {
        coefA = (numFramesOverkill - numFramesCompleteBar) / (1000 - 100);
        coefB = numFramesCompleteBar - 100*coefA;
    } else {
        coefA = 0;
        coefB = numFramesOverkill;
    }

    const numFrames = coefA * percentDamage + coefB;
    this._subPhaseParams[0] = heal / numFrames;

    this.changeSubPhase("proceedHealOpponent");
};
PokemonMZ_BattleManager.proceedHealOpponent = function() {
    const opponent = this._currentAction.opponent();
    const heal = this._subPhaseParams[0];
    const opponentHp = opponent.hp();
    const opponentMhp = opponent.mhp();

    if (opponentHp < this._damageTransition.end && opponentHp > 0 && opponentHp < opponentMhp) {
        let newHp = (opponentHp + heal).clamp(0, this._damageTransition.end);
        if (newHp > opponentMhp) { newHp = opponentMhp; }

        opponent.setHp(newHp)

        if (this._phase == "playerResolveActionSteps") {
            this._enemyPokemonStatusWindow.refresh(true);
        } else if (this._phase == "enemyResolveActionSteps") {
            this._playerPokemonStatusWindow.refresh(true);
        }
    } else {
        this.clearSubPhase();
    }
};


PokemonMZ_BattleManager.startDamageUser = function() {
    const user = this._currentAction.user();
    const damage = this._subPhaseParams[0];

    this._damageTransition.start = user.hp();
    this._damageTransition.end = user.hp() - damage;

    // Calculate how fast the hp bar will drop down
    // If attack drops between 0-100% hp, the curve is linear, 
    // up to 200 frames for 100% hp
    // If attack drops above 100% hp, the curvez is linear decrease
    // up to 30 frames for 1000% hp
    // If attack drops above 1000% hp, the curve is contant, 30 frames
    const percentDamage = damage / user.mhp() * 100;
    const numFramesCompleteBar = 120;
    const numFramesOverkill = 30;
    let coefA = 0;
    let coefB = 0;

    if (percentDamage <= 100) {
        coefA = numFramesCompleteBar/100;
        coefB = 0;
    } else if (percentDamage <= 1000) {
        coefA = (numFramesOverkill - numFramesCompleteBar) / (1000 - 100);
        coefB = numFramesCompleteBar - 100*coefA;
    } else {
        coefA = 0;
        coefB = numFramesOverkill;
    }

    const numFrames = coefA * percentDamage + coefB;
    this._subPhaseParams[0] = damage / numFrames;

    this.changeSubPhase("proceedDamageUser");
};
PokemonMZ_BattleManager.proceedDamageUser = function() {
    const user = this._currentAction.user();
    const damage = this._subPhaseParams[0];
    const userHp = user.hp();

    if (userHp > this._damageTransition.end && userHp > 0) {
        let newHp = (userHp - this._subPhaseParams[0]).clamp(this._damageTransition.end, user.mhp());
        if (newHp < 0) { newHp = 0; }

        user.setHp(newHp)

        if (this._phase == "playerResolveActionSteps") {
            this._playerPokemonStatusWindow.refresh(true);
        } else if (this._phase == "enemyResolveActionSteps") {
            this._enemyPokemonStatusWindow.refresh(true);
        }
    } else {
        this.clearSubPhase();
    }
};
PokemonMZ_BattleManager.inflictPokemonStatus = function() {
    // Remove all turn phases for KO
    const status = this._subPhaseParams[0];
    const target = this._subPhaseParams[1];

    switch (status) {
        case "burn":
            target.burn();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "poison":
            target.poison();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "paralysis":
            target.paralyze();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "freeze":
            target.freeze();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "sleep":
            target.sleep();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "confusion":
            target.confuse();
            break;
        case "flinch":
            target.flinch();
            break;
        case "seed":
            target.seed();
            break;
    }
    this.clearSubPhase();
};
PokemonMZ_BattleManager.startFaintPokemon = function() {
    // Remove all turn phases for KO
    const targetType = this._subPhaseParams[0];
    const targetSprite = this._subPhaseParams[1];

    if (this._phase == "playerResolveActionSteps") {
        if (targetType == "opponent") {
            AudioManager.playPokemonCry(this._enemyChosenPokemon._data.id, true);
            this.changeSubPhase("animateFaintPokemon");
            this._subPhaseParams = ["enemy", targetSprite];
        } else if (targetType == "user") {
            AudioManager.playPokemonCry(this._playerChosenPokemon._data.id, true);
            //AudioManager.playStandardSe(PokemonMZ.faintSE);
            this.changeSubPhase("animateFaintPokemon");
            this._subPhaseParams = ["player", targetSprite];
        }


    } else if (this._phase == "enemyResolveActionSteps") {
        if (targetType == "opponent") {
            AudioManager.playPokemonCry(this._playerChosenPokemon._data.id, true);
            this.changeSubPhase("animateFaintPokemon");
            this._subPhaseParams = ["player", targetSprite];
        } else if (targetType == "user") {
            AudioManager.playPokemonCry(this._enemyChosenPokemon._data.id, true);
            this.changeSubPhase("animateFaintPokemon");
            this._subPhaseParams = ["enemy", targetSprite];
        }
    };
};
PokemonMZ_BattleManager.proceedFaintPokemon = function() {
    const side = this._subPhaseParams[0];
    const targetSprite = this._subPhaseParams[1];

    if (targetSprite.scale.x > 0.0) {
        targetSprite.modifyScale(-0.1);
        if (targetSprite.scale.x < 0 || targetSprite.scale.y < 0) {
            targetSprite.scale.x = 0;
            targetSprite.scale.y = 0;
        }
    } else {
        this.clearSubPhase();
        if (side == "player") {
            this._playerPokemonStatusWindow.hide();
            const message1 = this._playerChosenPokemon.name() + " fainted!"
            $gameMessage.add(message1);
            this.changePhase("endPlayerFaintedPokemon");
        } else if (side == "enemy") {
            this._enemyPokemonStatusWindow.hide();
            const message2 = "Enemy " + this._enemyChosenPokemon.name() + " fainted!"
            $gameMessage.add(message2);
            this.changePhase("endEnemyFaintedPokemon");
        }
    };
};


PokemonMZ_BattleManager.animateUserEffect = function() {
    if (ConfigManager.battleAnimation) {
        const sprite = this._subPhaseParams[0];
        const animationType = this._subPhaseParams[1];
        let animationId = 0;


        switch(animationType) {
            case "frozen":
                animationId = PokemonMZ.frozenAnimation;
                break;
            case "poisoned":
                animationId = PokemonMZ.poisonedAnimation;
                break;
            case "burned":
                animationId = PokemonMZ.burnedAnimation;
                break;
            case "paralyzed":
                animationId = PokemonMZ.paralyzedAnimation;
                break;
            case "asleep":
                animationId = PokemonMZ.asleepAnimation;
                break;
            case "confused":
                animationId = PokemonMZ.confusedAnimation;
                break;
            case "seeded":
                animationId = PokemonMZ.seededAnimation;
                break; 
            case "seedHealed":
                animationId = PokemonMZ.seedHealedAnimation;
                break; 
        }

        if (animationId) {
            const request = {
                targets: [sprite],
                animationId: animationId,
                mirror: false
            };
            this._spriteset.createAnimation(request);
            sprite.updateTransform();
        }
    }
    this.clearSubPhase();
};

PokemonMZ_BattleManager.textFromKey = function(key, side, ext1) {
    const prefix = (side == "enemy") ? "Enemy " : "";
    const pokemon = (side == "enemy") ? this._enemyChosenPokemon : this._playerChosenPokemon;

    switch(key) {

    case "noMovesLeft":
        return prefix + pokemon.name() + " has no moves left!";
    case "useMove":
        return prefix + pokemon.name() + " used " + ext1 + "!";
    case "missed":
        return prefix + pokemon.name() + "'s attack missed!";
    case "defenseRose":
        return prefix + pokemon.name() + "'s defense rose!";
    case "evasionRose":
        return prefix + pokemon.name() + "'s evasion rose!";
    case "accuracyFell":
        return prefix + pokemon.name() + "'s accuracy fell!";
    case "attackFell":
        return prefix + pokemon.name() + "'s attack fell!";
    case "defenseFell":
        return prefix + pokemon.name() + "'s defense fell!";
    case "speedFell":
        return prefix + pokemon.name() + "'s speed fell!";
    case "statusFailed":
        return "But, it failed!";
    case "statusNothing":
        return "Nothing happened!";
    case "noeffect":
        return "Placeholder text NO EFFECT";
    case "noAffect":
        return "It didn't affect " + prefix + pokemon.name() + "!";
    case "weak":
        return "It's not very effective...";
    case "evaded":
        return prefix + pokemon.name() + " evaded attack!";
    case "strong":
        return "It's super effective!";
    case "critical":
        return "Critical hit!";
    case "hitTimes":
        if (ext1 == 1) {
            return "Hit 1 time!";
        } else {
            return "Hit " + String(ext1) + " times!";
        }
    case "hitRecoil":
        return prefix + pokemon.name() + "'s hit with recoil!";
    case "burned":
        return prefix + pokemon.name() + " was burned!";
    case "hurtburn":
        return prefix + pokemon.name() + "'s hurt by the burn!";
    case "seeded":
        return prefix + pokemon.name() + " was seeded!";
    case "hurtseed":
        return "Leech Seed saps " + prefix + pokemon.name() + "!";
    case "poisoned":
        return prefix + pokemon.name() + " was poisoned!";
    case "hurtpoison":
        return prefix + pokemon.name() + "'s hurt by poison!";
    case "paralyzed":
        return prefix + pokemon.name() + "'s paralyzed! It may not attack!";
    case "frozen":
        return prefix + pokemon.name() + " was frozen solid!";
    case "fireUnfrozen":
        return "Fire defrosted " + prefix + pokemon.name() + "!";
    case "confused":
        return prefix + pokemon.name() + " became confused!";
    case "sleep":
        return prefix + pokemon.name() + " fell asleep!";
    case "alreadySleeping":
        return prefix + pokemon.name() + "'s already asleep!";
    case "isFrozen":
        return prefix + pokemon.name() + " is frozen solid!";
    case "isFlinched":
        return prefix + pokemon.name() + " flinched!";
    case "isParalyzed":
        return prefix + pokemon.name() + "'s fully paralyzed!";
    case "isAsleep":
        return prefix + pokemon.name() + " is fast asleep!";
    case "wokeUp":
        return prefix + pokemon.name() + " woke up!";
    case "isConfused":
        return prefix + pokemon.name() + " is confused!";
    case "confusedHurt":
        return "It hurt itself in its confusion!";
    case "outConfusion":
        return prefix + pokemon.name() + "'s confused no more!";


    }

    return ""
};
PokemonMZ_BattleManager.displayWaitText = function() {
    const key = this._subPhaseParams[0];
    const side = this._subPhaseParams[1];
    const message = this.textFromKey(key, side);
    $gameMessage.add(message);
    this.clearSubPhase();
}; 
PokemonMZ_BattleManager.displayAutoText = function() {
    const key = this._subPhaseParams[0];
    const side = this._subPhaseParams[1];
    const ext1 = this._subPhaseParams[2];
    const message = this.textFromKey(key, side, ext1);
    $gameMessage.add(message + "\\|\\^");
    this.clearSubPhase();
}; 
PokemonMZ_BattleManager.displayInstantText = function() {
    const key = this._subPhaseParams[0];
    const side = this._subPhaseParams[1];
    const ext1 = this._subPhaseParams[2];
    const message = this.textFromKey(key, side, ext1);
    $gameMessage.add(message + "\\^");
    this.clearSubPhase();
}; 
