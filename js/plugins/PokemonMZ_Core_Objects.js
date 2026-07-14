//=============================================================================
// RPG Maker MZ - PokemonMZ - Core plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core plugin for PokemonMZ
 * @author Schlangan
*/


// Game_CharacterBase edits
const PokemonMZ_Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
    PokemonMZ_Game_CharacterBase_initMembers.call(this);
    this._onLedge = false;
    this._remainingSpinData = {"originalSpeed":0, "turns":0, "directions":0, "spinCount":0, "sound":false};
};
const PokemonMZ_Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
Game_CharacterBase.prototype.canPass = function(x, y, d) {
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    this._onLedge = false;
    let canPass = PokemonMZ_Game_CharacterBase_canPass.call(this,x,y,d);
    if (!canPass) {
        // Authorize ledge calculations if no npc is blocking the way
        if ($gameMap.PokemonMZ_isLedge(x,y,d) && !this.isCollidedWithCharacters(x2, y2)) {
            this._onLedge = true;
            canPass = true;
        }
    }
    return canPass;
};
const PokemonMZ_Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
Game_CharacterBase.prototype.moveStraight = function(d) {
    if (this._onLedge && !this.isJumping()) {
        this._onLedge = false;
        AudioManager.playStandardSe(PokemonMZ.playerJumpSE);
        switch (d) {
            case 2: //down
                this.jump(0,1);
            case 4: //left
                this.jump(-1,0);
            case 6: //right
                this.jump(1,0);
            case 8: //up
                this.jump(0,-1);
            default:
                PokemonMZ_Game_CharacterBase_moveStraight.call(this, d);
        }
        return;
    }
    PokemonMZ_Game_CharacterBase_moveStraight.call(this, d);
};
Game_CharacterBase.prototype.PokemonMZ_startSpinning = function(turns, soundOn) {
    AudioManager.playStandardSe(PokemonMZ.playerBumpSE);
    this._remainingSpinData = {
        "turns":turns, 
        "directions":4,
        "spinCount":5*turns,
        "sound":soundOn
    };
};
Game_CharacterBase.prototype.PokemonMZ_endSpinning = function() {
    this._remainingSpinData = {
        "turns":0, 
        "directions":0,
        "spinCount":0,
        "sound":false
    };
};
Game_CharacterBase.prototype.PokemonMZ_isSpinning = function() {
    return this._remainingSpinData && (this._remainingSpinData.turns > 0 || this._remainingSpinData.directions > 0);
};
const PokemonMZ_Game_CharacterBase_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
    if (this.PokemonMZ_isSpinning()) {
        this.PokemonMZ_updateSpin();
    }
    PokemonMZ_Game_CharacterBase_update.call(this);
};
Game_CharacterBase.prototype.PokemonMZ_updateSpin = function() {
    this._remainingSpinData.spinCount--;
    if (this._remainingSpinData.spinCount == 0) {
        this.turnRight90();
        this._remainingSpinData.directions--;
        if (this._remainingSpinData.directions == 0) {
            if (this._remainingSpinData.sound) {
                AudioManager.playStandardSe(PokemonMZ.playerBumpSE);
            }
            this._remainingSpinData.turns--;
            this._remainingSpinData.directions = 4;
        }
        if (this._remainingSpinData.turns == 0) {
            this.PokemonMZ_endSpinning();
        } else {
            this._remainingSpinData.spinCount = 5*this._remainingSpinData.turns;
        }
    }
};

// Game_Event edits
const PokemonMZ_Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    PokemonMZ_Game_Event_initialize.call(this, mapId, eventId);
    const notes = this.PokemonMZ_noteArgs();

    const limitedRegion = notes.limitRegion;
    this._limitedRegion = limitedRegion ? Number(limitedRegion) : -1;

    const aggroRange = notes.aggro;
    this._aggroRange = aggroRange ? Number(aggroRange) : 0;
    const aggroPage = notes.page;
    this._aggroPage = aggroPage ? Number(aggroPage) : 0;
};
Game_Event.prototype.PokemonMZ_isAggroing = function() {
    return this._aggroSequence;
};
Game_Event.prototype.PokemonMZ_startAggroSequence = function() {
    this._aggroSequence = true;
    this._goingToPlayer = true;
    $gameTemp.requestBalloon(this, 1);
};
const PokemonMZ_Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    PokemonMZ_Game_Event_update.call(this); 
    this.PokemonMZ_updateAggro();
};
Game_Event.prototype.PokemonMZ_updateAggro = function() {
    if (!this._aggroSequence || this._balloonPlaying || this.isMoving()) { return; }

    if (this._goingToPlayer) {
        if (Math.abs(this.x - $gamePlayer.x) + Math.abs(this.y - $gamePlayer.y) <= 1) {
            this._goingToPlayer = false;
        } else {
            this.moveTowardPlayer();
        }
    } else {
        const dir = this.direction();
        switch (dir) {
        case 2: // down
            $gamePlayer.setDirection(8);
            break;
        case 8: // up
            $gamePlayer.setDirection(2);
            break;
        case 6: // right
            $gamePlayer.setDirection(4);
            break;
        case 4: // left
            $gamePlayer.setDirection(6);
            break;
        }
        this._aggroSequence = false;
        this.start();
    }

};
Game_Event.prototype.PokemonMZ_isAgrroable = function() {
    return this._aggroRange > 0 && this._pageIndex == this._aggroPage - 1;
};
Game_Event.prototype.PokemonMZ_note = function() {
    return this.event().note.trim();
};
Game_Event.prototype.PokemonMZ_noteArgs = function() {
    const note = this.PokemonMZ_note();
    if (note == "") {
        return {};
    }
    const splitted_notes = note.split(",");
    const parsed_notes = {};
    for (splitted_note of splitted_notes) {
        const args = splitted_note.split(":");
        parsed_notes[args[0].trim()] = args[1].trim()
    }
    return parsed_notes;
};
const PokemonMZ_Game_Event_moveTypeRandom = Game_Event.prototype.moveTypeRandom;
Game_Event.prototype.moveTypeRandom = function() {
    if (this._limitedRegion > -1) {
        switch (Math.randomInt(6)) {
            case 0:
            case 1:
                this.PokemonMZ_moveRegionLimitedRandom(this._limitedRegion);
                break;
            case 2:
            case 3:
            case 4:
                this.PokemonMZ_moveRegionLimitedForward(this._limitedRegion);
                break;
            case 5:
                this.resetStopCount();
                break;
        }
    } else {
        PokemonMZ_Game_Event_moveTypeRandom.call(this);
    }
};
Game_Event.prototype.PokemonMZ_moveRegionLimitedRandom = function(limitedRegion) {
    const d = 2 + Math.randomInt(4) * 2;
    if (this.PokemonMZ_directionRegion(this.x, this.y, d) == limitedRegion) {
        if (this.canPass(this.x, this.y, d)) {
            this.moveStraight(d);
        }
    }
};
Game_Event.prototype.PokemonMZ_moveRegionLimitedForward = function(limitedRegion) {
    if (this.PokemonMZ_directionRegion(this.x, this.y, this.direction()) == limitedRegion) {
        this.moveForward();
    }
};
Game_Event.prototype.PokemonMZ_directionRegion = function(x,y,d) {
    const x2 = $gameMap.roundXWithDirection(this._x, d);
    const y2 = $gameMap.roundYWithDirection(this._y, d);
    return $gameMap.regionId(x2,y2);
};
Game_Event.prototype.PokemonMZ_posAggro = function(x,y) {
    const ex = this.x;
    const ey = this.y;
    const dir = this.direction();

    switch (dir) {
        case 2: // down
            return (x === ex) && (y > ey) && (y - ey <= this._aggroRange) && (y - ey >= 1);
        case 8: // up
            return (x === ex) && (y < ey) && (ey - y <= this._aggroRange) && (ey - y >= 1);
        case 6: // right
            return (y === ey) && (x > ex) && (x - ex <= this._aggroRange) && (x - ex >= 1);
        case 4: // left
            return (y === ey) && (x < ex) && (ex - x <= this._aggroRange) && (ex - x >= 1);
    }

    return false;
};

// Game_Player edits
Game_Player.prototype.refresh = function() {
    const characterName = $gamePlayerTrainer.characterName();
    const characterIndex = $gamePlayerTrainer.characterIndex();
    this.setImage(characterName, characterIndex);
    this._followers.refresh();
};
Game_Player.prototype.executeEncounter = function() {
    if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
        this.makeEncounterCount();
        const troopId = this.makeEncounterTroopId();
        if ($dataTroops[troopId]) {
            PokemonMZ_BattleManager.setup(troopId, true, false);
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};
Game_Player.prototype.increaseSteps = function() {
    Game_Character.prototype.increaseSteps.call(this);
    if (this.isNormal()) {
        $gameParty.increaseSteps();
        $gamePlayerTrainer.calculatePoisonOnMap();
    }
};
const PokemonMZ_Game_Player_startMapEvent = Game_Player.prototype.startMapEvent;
Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
    PokemonMZ_Game_Player_startMapEvent.call(this, x, y, triggers, normal);
    if (!$gameMap.isEventRunning()) {
        for (const event of $gameMap.PokemonMZ_eventsAggro(x, y)) {
            if (triggers.includes(1)) {
                event.PokemonMZ_startAggroSequence();
            }
        }
    }
};
const PokemonMZ_Game_Player_canMove = Game_Player.prototype.canMove;
Game_Player.prototype.canMove = function() {
    if ($gameMap.PokemonMZ_isUsingEscapeRope()) {
        return false;
    }
    return PokemonMZ_Game_Player_canMove.call(this);
};

// Game_Map edits
const PokemonMZ_Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    PokemonMZ_Game_Map_initialize.call(this);
    this._regionMapId = 0;
    this._regionMapPoiId = 0;
    this._pokemonPoisonedFainted = 0;
    this._checkAfterFainted = false;
    this._checkEvolution = false;
    this._ledgeRegions = {
        "up":-1,
        "down":-1,
        "left":-1,
        "right":-1,
    };
    this._isRopeEscapable = false;
    this._isUsingRope = false;
};
Game_Map.prototype.PokemonMZ_reinitialize = function() {
    // Used to create possible missing objects after update
    if (!this._ledgeRegions) {
        this._ledgeRegions = {
            "up":-1,
            "down":-1,
            "left":-1,
            "right":-1,
        };
    }

};
const PokemonMZ_Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    PokemonMZ_Game_Map_setup.call(this, mapId);
    this.PokemonMZ_reinitialize();

    // Read note tags and set variables
    const noteData = DataManager.parsePokemonMZ_Notes($dataMap.note);

    if (noteData.regionId) { this._regionMapId = Number(noteData.regionId) }
    if (noteData.regionPoi) { this._regionMapPoiId = Number(noteData.regionPoi) }
    if (noteData.ledgeDownRegion) { this._ledgeRegions.down = Number(noteData.ledgeDownRegion) }
    if (noteData.ledgeUpRegion) { this._ledgeRegions.up = Number(noteData.ledgeUpRegion) }
    if (noteData.ledgeLeftRegion) { this._ledgeRegions.left = Number(noteData.ledgeLeftRegion) }
    if (noteData.ledgeRightRegion) { this._ledgeRegions.right = Number(noteData.ledgeRightRegion) }
    this._isRopeEscapable = Boolean(noteData.escapeRope)
};
Game_Map.prototype.PokemonMZ_eventsAggro = function(x, y) {
    return this.events().filter(event => (event.PokemonMZ_isAgrroable() && event.PokemonMZ_posAggro(x,y)));
};
Game_Map.prototype.PokemonMZ_isLedge = function(x,y,d) {
    // Check if character has reached a ledge and is in the propre direction
    if (!this._ledgeRegions) { return false; }
    switch (d) {
        case 2: //down
            return this._ledgeRegions.down != -1 && this.regionId(x,y) == this._ledgeRegions.down;
        case 4: //left
            return this._ledgeRegions.left != -1 && this.regionId(x,y) == this._ledgeRegions.left;
        case 6: //right
            return this._ledgeRegions.right != -1 && this.regionId(x,y) == this._ledgeRegions.right;
        case 8: //up
            return this._ledgeRegions.up != -1 && this.regionId(x,y) == this._ledgeRegions.up;
    }
    return false;
};
const PokemonMZ_Game_Map_isDashDisabled = Game_Map.prototype.isDashDisabled;
Game_Map.prototype.isDashDisabled = function() {
    return PokemonMZ_Game_Map_isDashDisabled.call(this) || !$gamePlayerTrainer.canDash();
};
Game_Map.prototype.regionMapId = function() { // TODO get the true region value from map attributes
    return this._regionMapId;
};
Game_Map.prototype.regionMapPoiId = function() { // TODO get the true region POI value from map attributes
    return this._regionMapPoiId;
};
const PokemonMZ_Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
    PokemonMZ_Game_Map_update.call(this, sceneActive);

    // Consider player spinning for ropes
    if (this._isUsingRope) {
        if (!$gamePlayer.PokemonMZ_isSpinning()) {
            this._isUsingRope = false;
            AudioManager.playStandardSe(PokemonMZ.teleportSE);
            const location = $gamePlayerTrainer.respawnLocation();
            $gamePlayer.reserveTransfer(location.mapId,location.x,location.y,2,0);
            $gameSystem.enableMenu();
        }
        return;
    }

    // Add message if pokemon fainted due to poison
    if (this._pokemonPoisonedFainted && this._pokemonPoisonedFainted.length > 0) {
        this.updatePoisonedFainted();
    }
    // Once fainted messages seen, check if whole team is fainted
    if (this._checkAfterFainted) {
        this.updateAfterFainted();
    }
    // If asked after battle or item to check evolution
    if (this._checkEvolution) {
        this.checkEvolution();
    }
};
Game_Map.prototype.resetPoisonedFaintedList = function() {
    this._pokemonPoisonedFainted = [];
};
Game_Map.prototype.addPoisonedFaintedList = function(pokemon) {
    this._pokemonPoisonedFainted.push(pokemon);
};
Game_Map.prototype.updatePoisonedFainted = function() {
    if ($gameMap.isEventRunning() || $gameMessage.isBusy() || $gamePlayer.isMoving() ) { return; }
    const faintedPokemon = this._pokemonPoisonedFainted.splice(0,1)[0];
    AudioManager.playPokemonCry(faintedPokemon.id(), true)
    $gameMessage.add(faintedPokemon.name() + " fainted!")

    if (this._pokemonPoisonedFainted.length == 0) {
        this._checkAfterFainted = true;
    }
};
Game_Map.prototype.updateAfterFainted = function() {
    if ($gameMap.isEventRunning() || $gameMessage.isBusy() || $gamePlayer.isMoving() ) { return; }
    if ($gamePlayerTrainer.numberValidPokemon() == 0) {
        const lostMoney = $gamePlayerTrainer.loseMoneyAfterDefeat(); // Note the value will be used in further generations
        const message = $gamePlayerTrainer.name() + " is out of useable Pokémon!\n" +  $gamePlayerTrainer.name() + " blacked out!"
        $gameMessage.add(message);

        const location = $gamePlayerTrainer.respawnLocation();
        $gamePlayer.reserveTransfer(location.mapId,location.x,location.y,2,0);
        $gamePlayerTrainer.healTeam();
    }
    this._checkAfterFainted = false;
};
Game_Map.prototype.askForEvolutionCheck = function() {
    this._checkEvolution = true;
};
Game_Map.prototype.checkEvolution = function() {
    this._checkEvolution = false;
    this._evolvingPokemons = [];
    for (const pokemon of $gamePlayerTrainer.pokemons()) {
        if (pokemon.hasLeveledUp()) {
            let possibleEvolution = pokemon.firstPossibleEvolution("levelUp")
            if (possibleEvolution != "") {
                this._evolvingPokemons.push([pokemon, possibleEvolution]);
            }
        }
    }
    if (this._evolvingPokemons.length > 0) {
        SceneManager.push(PokemonMZ_Scene_Evolutions);
        SceneManager.prepareNextScene(
            this._evolvingPokemons, 
            AudioManager.saveBgm(),
            AudioManager.saveBgs()
        );
    };
};
const PokemonMZ_Game_Map_isEventRunning = Game_Map.prototype.isEventRunning
Game_Map.prototype.isEventRunning = function() {
    return PokemonMZ_Game_Map_isEventRunning.call(this) || this.PokemonMZ_isAnyEventAggroing();
};
Game_Map.prototype.PokemonMZ_isAnyEventAggroing = function() {
    return this.events().some(event => event.PokemonMZ_isAggroing());
};
Game_Map.prototype.PokemonMZ_isRopeEscapable = function() {
    return this._isRopeEscapable;
};
Game_Map.prototype.PokemonMZ_useEscapeRope = function() {
    this._isUsingRope = true;
    $gameSystem.disableMenu();
    $gamePlayer.PokemonMZ_startSpinning(3, true);
};
Game_Map.prototype.PokemonMZ_isUsingEscapeRope = function() {
    return this._isUsingRope;
};

// Game_Interpreter edits
Game_Interpreter.prototype.command302 = function(params) {
    if (!$gameParty.inBattle()) {
        const goods = [params];
        while (this.nextEventCode() === 605) {
            this._index++;
            goods.push(this.currentCommand().parameters);
        }
        SceneManager.push(PokemonMZ_Scene_Shop);
        SceneManager.prepareNextScene(goods, params[4]);
    }
    return true;
};
Game_Interpreter.prototype.command301 = function(params) {
    if (!$gameParty.inBattle()) {
        let troopId;
        if (params[0] === 0) {
            // Direct designation
            troopId = params[1];
        } else if (params[0] === 1) {
            // Designation with a variable
            troopId = $gameVariables.value(params[1]);
        } else {
            // Same as Random Encounters
            troopId = $gamePlayer.makeEncounterTroopId();
        }
        if ($dataTroops[troopId]) {
            PokemonMZ_BattleManager.setup(troopId, params[2], params[3]);
            PokemonMZ_BattleManager.setEventCallback(n => {
                this._branch[this._indent] = n;
            });
            $gamePlayer.makeEncounterCount();
            SceneManager.push(PokemonMZ_Scene_Battle);
        }
    }
    return true;
};

// PokemonMZ_Game_Trainer
// The base class for all game trainers
function PokemonMZ_Game_Trainer() {
    this.initialize(...arguments);
}
PokemonMZ_Game_Trainer.prototype.initialize = function(sourceActorId) {
    // SourceActorId: ID of the actor the images come from.
    this.initMembers(sourceActorId);
};
PokemonMZ_Game_Trainer.prototype.initMembers = function(sourceActorId) {
    this._actorId = sourceActorId;
    this._pokemons = [];
    this._money = 0;
    this._ia = "generic";
    this._iaModifiers = null;
    this._defeatText = "";
    this._victoryText = "";
};
PokemonMZ_Game_Trainer.prototype.money = function() {
    return this._money;
};
PokemonMZ_Game_Trainer.prototype.name = function() {
    return $gameActors.actor(this._actorId).name();
};
PokemonMZ_Game_Trainer.prototype.characterName = function() {
    return $gameActors.actor(this._actorId).characterName();
};
PokemonMZ_Game_Trainer.prototype.characterIndex = function() {
    return $gameActors.actor(this._actorId).characterIndex();
};
PokemonMZ_Game_Trainer.prototype.battlerName = function() {
    return $gameActors.actor(this._actorId).battlerName();
};
PokemonMZ_Game_Trainer.prototype.hasPokemon = function() {
   return this._pokemons.length > 0; 
};
PokemonMZ_Game_Trainer.prototype.setIa = function(ia) {
   this._ia = ia;
};
PokemonMZ_Game_Trainer.prototype.setIaModifiers = function(modifiers) {
   this._iaModifiers = modifiers;
};
PokemonMZ_Game_Trainer.prototype.ia = function() {
   return this._ia;
};
PokemonMZ_Game_Trainer.prototype.iaModifiers = function() {
   return this._iaModifiers;
};
PokemonMZ_Game_Trainer.prototype.setMoney = function(money) {
   this._money = money;
};
PokemonMZ_Game_Trainer.prototype.setDefeatText = function(text) {
   this._defeatText = text;
};
PokemonMZ_Game_Trainer.prototype.setVictoryText = function(text) {
   this._victoryText = text;
};
PokemonMZ_Game_Trainer.prototype.defeatText = function() {
   return this._defeatText;
};
PokemonMZ_Game_Trainer.prototype.victoryText = function() {
   return this._victoryText;
};
PokemonMZ_Game_Trainer.prototype.canUse = function(item) { 
    // Cannot use items not usable by trainer
    if (item.pkmz_data.user != "trainer") {
        return false;
    }
    // If item is for pokemon, must have pokemon
    if (item.pkmz_data.target == 'pokemon') {
        if (!$gamePlayerTrainer.hasPokemon()) {
            return false;
        }
    }
    return true;
};
PokemonMZ_Game_Trainer.prototype.canToss = function(item) { //TODO
    // TODO: Forbid tossing key items
    return true;
};
PokemonMZ_Game_Trainer.prototype.addPokemonToParty = function(pokemon) {
    this._pokemons.push(pokemon);
};
PokemonMZ_Game_Trainer.prototype.firstPokemon = function() {
    return this._pokemons.length > 0 ? this._pokemons[0] : null;
};
PokemonMZ_Game_Trainer.prototype.firstBattleReadyPokemon = function() {
    for (const pokemon of this._pokemons) {
        if (!pokemon.isFainted()) { return pokemon; }
    }
    return null;
};
PokemonMZ_Game_Trainer.prototype.firstBattleReadyPokemonIndex = function() {
    for (let i=0; i < this._pokemons.length; i++) {
        let pokemon = this._pokemons[i]
        if (!pokemon.isFainted()) { return i; }
    }
    return null;
};
PokemonMZ_Game_Trainer.prototype.hasRemainingBattleReadyPokemon = function() {
    for (const pokemon of this._pokemons) {
        if (!pokemon.isFainted()) { return true; }
    }
    return false;
};
PokemonMZ_Game_Trainer.prototype.pokemon = function(index) {
    if (this._pokemons.length > index) {
        return this._pokemons[index];
    } else {
        return null;
    }
};
PokemonMZ_Game_Trainer.prototype.pokemons = function() {
    return this._pokemons;
};
PokemonMZ_Game_Trainer.prototype.numPokemons = function() {
    return this._pokemons.length;
};
PokemonMZ_Game_Trainer.prototype.healTeam = function() {
    for (const pokemon of this._pokemons) {
        pokemon.heal();
    }
};
PokemonMZ_Game_Trainer.prototype.numberValidPokemon = function() {
    // Return the number of non fainted Pokemon inside the party
    let validPokemon = 0;
    for (const pokemon of this._pokemons) {
        if (!pokemon.isFainted()) { validPokemon++; }
    }
    return validPokemon;
};
PokemonMZ_Game_Trainer.prototype.swapPokemons = function(index1, index2) {
    const pokemon1 = this._pokemons[index1];
    const pokemon2 = this._pokemons[index2];

    this._pokemons[index1] = pokemon2;
    this._pokemons[index2] = pokemon1;
};

// PokemonMZ_Game_TrainerPlayer
// The class for player trainer, dealing with items, pokedex, etc.
function PokemonMZ_Game_TrainerPlayer() {
    this.initialize(...arguments);
}
PokemonMZ_Game_TrainerPlayer.prototype = Object.create(PokemonMZ_Game_Trainer.prototype);
PokemonMZ_Game_TrainerPlayer.prototype.constructor = PokemonMZ_Game_TrainerPlayer;
PokemonMZ_Game_TrainerPlayer.prototype.initMembers = function(sourceActorId) {
    PokemonMZ_Game_Trainer.prototype.initMembers.call(this, sourceActorId);
    this._uid = crypto.getRandomValues(new Uint32Array(1))[0];
    this._trainedId = crypto.getRandomValues(new Uint16Array(1))[0];
    this._badges = [];
    this._coins = 0;
    this._ia = "player";
    this._respawnLocation = {"mapId":1,"x":0,"y":0};
    this.initializeItems();
    this.initializeBoxes();
    this.initializePokedex();
};
PokemonMZ_Game_TrainerPlayer.prototype.initializeItems = function() {
    this._items = {};
    this._storedItems = {};
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        this._items.everything = {};
        this._storedItems.everything = {};
        break;
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.numBoxes = function() {
    return 12;
};
PokemonMZ_Game_TrainerPlayer.prototype.pokemonsPerBox = function() {
    return 20;
};
PokemonMZ_Game_TrainerPlayer.prototype.initializeBoxes = function() {
    const boxCount = this.numBoxes();
    this._boxes = [];
    this._selectedBoxIndex = 0;

    for (let i=0; i<boxCount; i++) {
        this._boxes.push({
            "name":"Box No. " + String(i+1),
            "enabled":true,
            "pokemons":[]
        })
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.initializePokedex = function() {
    this._pokedexRegion = "";
    this._seenPokemons = [];
    this._capturedPokemons = [];
};
PokemonMZ_Game_TrainerPlayer.prototype.givePokedex = function(region) {
    this._pokedexRegion = region;
};
PokemonMZ_Game_TrainerPlayer.prototype.hasPokedex = function() {
    return this._pokedexRegion != "";
};
PokemonMZ_Game_TrainerPlayer.prototype.pokedexRegion = function() {
    return this._pokedexRegion;
};
PokemonMZ_Game_TrainerPlayer.prototype.reloadAllPokemonData = function() {
    for (const pokemon of this._pokemons) {
        pokemon.reloadData();
    }
    for (const box of this._boxes) {
        for (const pokemon of box.pokemons) {
            pokemon.reloadData();
        }
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.addSeenPokemon = function(pokemonStrId) {
    if (!this._seenPokemons.includes(pokemonStrId)) {
        this._seenPokemons.push(pokemonStrId);
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.addCapturedPokemon = function(pokemonStrId) {
    if (!this._capturedPokemons.includes(pokemonStrId)) {
        this._capturedPokemons.push(pokemonStrId);
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.isPokemonSeen = function(pokemonStrId) {
    return this._seenPokemons.includes(pokemonStrId);
};
PokemonMZ_Game_TrainerPlayer.prototype.isPokemonCaptured = function(pokemonStrId) {
    return this._capturedPokemons.includes(pokemonStrId);
};
PokemonMZ_Game_TrainerPlayer.prototype.numPokemonSeen = function() {
    return this._seenPokemons.length;
};
PokemonMZ_Game_TrainerPlayer.prototype.numPokemonCaptured = function() {
    return this._capturedPokemons.length;
};
PokemonMZ_Game_TrainerPlayer.prototype.selectedBox = function() {
    return this._selectedBoxIndex;
};
PokemonMZ_Game_TrainerPlayer.prototype.setSelectedBox = function(intBoxId) {
    this._selectedBoxIndex = intBoxId;
};
PokemonMZ_Game_TrainerPlayer.prototype.boxName = function(intBoxId) {
    return this._boxes[intBoxId].name;
};
PokemonMZ_Game_TrainerPlayer.prototype.boxHasPokemons = function(intBoxId) {
    return this._boxes[intBoxId].pokemons.length > 0;
};
PokemonMZ_Game_TrainerPlayer.prototype.boxPokemonCount = function(intBoxId) {
    return this._boxes[intBoxId].pokemons.length;
};
PokemonMZ_Game_TrainerPlayer.prototype.boxHasRoom = function(intBoxId) {
    return this._boxes[intBoxId].pokemons.length < this.pokemonsPerBox();
};
PokemonMZ_Game_TrainerPlayer.prototype.currentBoxName = function() {
    return this.boxName(this._selectedBoxIndex);
};
PokemonMZ_Game_TrainerPlayer.prototype.currentBoxHasPokemon = function() {
    return this.boxHasPokemons(this._selectedBoxIndex);
};
PokemonMZ_Game_TrainerPlayer.prototype.currentBoxPokemonCount = function() {
    return this.boxPokemonCount(this._selectedBoxIndex);
};
PokemonMZ_Game_TrainerPlayer.prototype.currentBoxPokemons = function() {
    return this._boxes[this._selectedBoxIndex].pokemons;
};
PokemonMZ_Game_TrainerPlayer.prototype.currentBoxPokemon = function(index) {
    return this._boxes[this._selectedBoxIndex].pokemons[index];
};
PokemonMZ_Game_TrainerPlayer.prototype.currentBoxHasRoom = function() {
    return this.boxHasRoom(this._selectedBoxIndex);
};
PokemonMZ_Game_TrainerPlayer.prototype.canDepositInCurrentBox = function() {
    return this.currentBoxHasRoom() && this.numPokemons() > 1;
};
PokemonMZ_Game_TrainerPlayer.prototype.ia = function() {
   return "player";
};
PokemonMZ_Game_TrainerPlayer.prototype.uid = function() {
    return this._uid;
};
PokemonMZ_Game_TrainerPlayer.prototype.trainerId = function() {
    return this._trainedId;
};
PokemonMZ_Game_TrainerPlayer.prototype.respawnLocation = function() {
    return this._respawnLocation;
};
PokemonMZ_Game_TrainerPlayer.prototype.setRespawnLocation = function(mapId, x, y) {
    this._respawnLocation = {"mapId":mapId,"x":x,"y":y};
};
PokemonMZ_Game_TrainerPlayer.prototype.addMoney = function(amount) {
    this._money += amount;
};
PokemonMZ_Game_TrainerPlayer.prototype.removeMoney = function(amount) {
    this._money -= amount;
};
PokemonMZ_Game_TrainerPlayer.prototype.badgesCount = function() {
    return this._badges.length;
};
PokemonMZ_Game_TrainerPlayer.prototype.hasBadge = function(id) {
    return this._badges.includes(id);
};
PokemonMZ_Game_TrainerPlayer.prototype.canDash = function() {
    // Placeholder for later - running Shoes
    return false;
}
PokemonMZ_Game_TrainerPlayer.prototype.hasBagItems = function() {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return Object.keys(this._items.everything).length > 0;
    default:
        return false;
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.hasStoredItems = function() {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return Object.keys(this._storedItems.everything).length > 0;
    default:
        return false;
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.maxSingleBagItemQuantity = function() {
    return 99;
};
PokemonMZ_Game_TrainerPlayer.prototype.numBagItems = function(itemIntId) {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return this._items.everything[itemIntId] || 0;
    default:
        return 0;
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.numStoredItems = function(itemIntId) {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return this._storedItems.everything[itemIntId] || 0;
    default:
        return 0;
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.hasItem = function(itemIntId) {
    return this.numBagItems(itemIntId) > 0;
};
PokemonMZ_Game_TrainerPlayer.prototype.gainBagItem = function(itemIntId, amount) {
    const lastNumber = this.numBagItems(itemIntId);
    const newNumber = lastNumber + amount;
    
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        if (newNumber > 0) {
            this._items.everything[itemIntId] = newNumber;
        } else {
            delete this._items.everything[itemIntId]
        }
        break;
    }

    $gameMap.requestRefresh();
};
PokemonMZ_Game_TrainerPlayer.prototype.loseBagItem = function(itemIntId) {
    this.gainBagItem(itemIntId, -1);
};
PokemonMZ_Game_TrainerPlayer.prototype.gainStoredItem = function(itemIntId, amount) {
    const lastNumber = this.numStoredItems(itemIntId);
    const newNumber = lastNumber + amount;
    
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        if (newNumber > 0) {
            this._storedItems.everything[itemIntId] = newNumber;
        } else {
            delete this._storedItems.everything[itemIntId]
        }
        break;
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.bagItems = function() {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return Object.keys(this._items.everything).map(id => $dataItems[id]);
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.battleBagItems = function() {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return Object.keys(this._items.everything)
            .filter(id => $dataItems[id].pkmz_data.battle)
            .map(id => $dataItems[id]);
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.storedItems = function() {
    switch(PokemonMZ.bagMechanicsGeneration) {
    case 1:
        return Object.keys(this._storedItems.everything).map(id => $dataItems[id]);
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.canGetPokemon = function() {
    // Check if player has room in party or current box
    return (
        this.canGetPokemonInParty() ||
        this.canGetPokemonInCurrentBox()
    );
};
PokemonMZ_Game_TrainerPlayer.prototype.canGetPokemonInParty = function() {
    return this._pokemons.length < 6;
};
PokemonMZ_Game_TrainerPlayer.prototype.canGetPokemonInCurrentBox = function() { //TODO
    return this.currentBoxHasRoom(); 
};
PokemonMZ_Game_TrainerPlayer.prototype.givePokemonBeforeNickname = function(pokemon) {
    // Create Pokemon and display nickname windows
    $gameTemp.pokemon = pokemon;
    SceneManager.push(PokemonMZ_Scene_PokemonNickname);
};
PokemonMZ_Game_TrainerPlayer.prototype.givePokemonAfterNickname = function(pokemon) {
    this.addSeenPokemon(pokemon._data.id);
    this.addCapturedPokemon(pokemon._data.id);

    // Now add the pokemon to the party, or the box
    if (this.canGetPokemonInParty()) {
        this.addPokemonToParty(pokemon);
    } else if (this.canGetPokemonInCurrentBox()) {
        // TODO : DISPLAY SENT TO BOX MESSAGE
    } else {
        // TODO : DISPLAY NOT POSSIBLE
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.addPokemonToBox = function(pokemon, intBoxId) { //TODO
    // CHECK IF ROOM
    this._boxes[intBoxId].pokemons.push(pokemon);
};
PokemonMZ_Game_TrainerPlayer.prototype.addPokemonToCurrentBox = function(pokemon) {
    this.addPokemonToBox(pokemon, this._selectedBoxIndex);
};
PokemonMZ_Game_TrainerPlayer.prototype.removePokemonAtIndex = function(intIndex) {
    this._pokemons.splice(intIndex,1);
};
PokemonMZ_Game_TrainerPlayer.prototype.removePokemonFromCurrentBoxAtIndex = function(intIndex) {
    this._boxes[this._selectedBoxIndex].pokemons.splice(intIndex,1);
};
PokemonMZ_Game_TrainerPlayer.prototype.loseMoneyAfterDefeat = function() {
    // Generation 1 - Lose half money
    const lostMoney = Math.floor(this._money / 2);
    this._money -= lostMoney;
    return lostMoney;
};
PokemonMZ_Game_TrainerPlayer.prototype.calculatePoisonOnMap = function() {
    // Generation 1 - Pokemon lose hp every four steps if poisoned
    const poisonDamage = 1;    
    const numStepsDivider = 4;
    if ($gameParty.steps() % numStepsDivider != 0) { return; }

    let isAnyPokemonPoisoned = false;
    for (const pokemon of this._pokemons) {
        if (pokemon.isPoisoned()) { 
            isAnyPokemonPoisoned = true;
        }
    }

    if (isAnyPokemonPoisoned) {
        AudioManager.playStandardSe(PokemonMZ.poisonStepSE);
        $gameScreen.startShake(3, 3, 20);
    }

    $gameMap.resetPoisonedFaintedList();

    for (const pokemon of this._pokemons) {
        if (!pokemon.isPoisoned()) { continue; }
        let pokemonMaxHp = pokemon.mhp();

        let newHp = (pokemon.hp() - poisonDamage).clamp(0,pokemonMaxHp);
        pokemon.setHp(newHp);
        if (pokemon.isFainted()) {
            pokemon.cleanAfterFaint();
            $gameMap.addPoisonedFaintedList(pokemon);    
        }
    }
};
PokemonMZ_Game_TrainerPlayer.prototype.resetAllLeveledUpStates = function() {
    for (const pokemon of this._pokemons) {
        pokemon.resetHasLeveledUp();
    }
}

// PokemonMZ_Pokemon
// The class for a pokemon
function PokemonMZ_Game_Pokemon() {
    this.initialize(...arguments);
}
PokemonMZ_Game_Pokemon.prototype.initialize = function(enemyId, level) {
    this._enemyId = enemyId;
    this._data = $dataEnemies[this._enemyId].pkmz_data;
    this._nickname = "";
    this._level = level;
    this._exp = this.expForLevel(this._level);
    this._moves = [];
    this._pp = [];
    this._hp = 0;
    this._originalTrainerId = 0;
    this._originalTrainerName = "";
    this._dv = {"hp":0,"patk":0,"pdef":0,"satk":0,"spd":0}; //Note: spc is set into satk
    this._ev = {"hp":0,"patk":0,"pdef":0,"satk":0,"spd":0}; //Note: spc is set into satk
    this._status = "";
    this._battleSprite = null;
    this._damageDealt = 0;
    this._movesLearnWaitlist = []
    this._lastMoveIndex = 0;
    this.resetStageModifiers();
    this.randomizeDv();
    this.setDefaultMoves();
    this.heal();
    this._isBurned = false;
    this._isParalyzed = false;
    this._isAsleep = false;
    this._isPoisoned = false;
    this._isFrozen = false; 
    this._isFlinched = false;
    this._isSeeded = false;
    this._isConfused = false;
    this._turnsSleep = 0;
    this._turnsConfusion = 0;
    this._receivedItems = [];

    this._hasBattled = false;
    this._hasLeveledUp = false;
};
PokemonMZ_Game_Pokemon.prototype.reloadData = function() {
    this._data = $dataEnemies[this._enemyId].pkmz_data;
    const newMhp = this.mhp();
    if (this._hp > newMhp) { this._hp = newMhp; }
};
PokemonMZ_Game_Pokemon.prototype.cloneFromPokemon = function(pokemon) {
    this._nickname = pokemon._nickname;
    this._exp = pokemon._exp;
    this._moves = [];
    for (const move of pokemon._moves) {
        this._moves.push({"id":move.id, "pp":move.pp, "ppup":move.ppup});
    }
    this._pp = pokemon._pp;
    this._hp = pokemon._hp;
    this._originalTrainerId = pokemon._originalTrainerId;
    this._originalTrainerName = pokemon._originalTrainerName;
    this._dv = {
        "hp":pokemon._dv.hp,
        "patk":pokemon._dv.patk,
        "pdef":pokemon._dv.pdef,
        "satk":pokemon._dv.satk,
        "spd":pokemon._dv.spd,
    }
    this._ev = {
        "hp":pokemon._ev.hp,
        "patk":pokemon._ev.patk,
        "pdef":pokemon._ev.pdef,
        "satk":pokemon._ev.satk,
        "spd":pokemon._ev.spd,
    }
    this._status = pokemon._status;
    this._isBurned = pokemon._isBurned;
    this._isParalyzed = pokemon._isParalyzed;
    this._isAsleep = pokemon._isAsleep;
    this._isPoisoned = pokemon._isPoisoned;
    this._isFrozen = pokemon._isFrozen;
};
PokemonMZ_Game_Pokemon.prototype.cloneFromWildPokemon = function(pokemon) {
    this.cloneFromPokemon(pokemon);
    this._originalTrainerId = $gamePlayerTrainer.trainerId();
    this._originalTrainerName = $gamePlayerTrainer.name();
};
PokemonMZ_Game_Pokemon.prototype.setBattleSprite = function(sprite) {
    this._battleSprite = sprite;
};
PokemonMZ_Game_Pokemon.prototype.clearBattleSprite = function() {
    this._battleSprite = null;
};
PokemonMZ_Game_Pokemon.prototype.battleImageId = function() { // TODO substitute or morph
    return this.id();
};
PokemonMZ_Game_Pokemon.prototype.lastMoveIndex = function() {
    return this._lastMoveIndex;
}
PokemonMZ_Game_Pokemon.prototype.setLastMoveIndex = function(index) {
    this._lastMoveIndex = index;
}
PokemonMZ_Game_Pokemon.prototype.exp = function() {
    return this._exp;
};
PokemonMZ_Game_Pokemon.prototype.resetHasLeveledUp = function() {
    this._hasLeveledUp = false;
};
PokemonMZ_Game_Pokemon.prototype.setHasLeveledUp = function() {
    this._hasLeveledUp = true;
};
PokemonMZ_Game_Pokemon.prototype.hasLeveledUp = function() {
    return this._hasLeveledUp;
};
PokemonMZ_Game_Pokemon.prototype.wouldLevelUpWithExp = function(expPoints) {
    return (this.canLevelUp() && this.expForNextLevel() <= expPoints);
};
PokemonMZ_Game_Pokemon.prototype.gainExp = function(expPoints) {
    if (this.canLevelUp()) {
        const oldLevel = this.level();
        const currentmHp = this.mhp();

        this._movesLearnWaitlist = [];

        let remainingExp = expPoints;
        let nextLevelExp = this.expForNextLevel();
        while (remainingExp >= nextLevelExp) {
            this._exp += nextLevelExp;
            this._level += 1;
            if (this.canLevelUp()) {
                remainingExp -= nextLevelExp;
                nextLevelExp = this.expForNextLevel();
            } else {
                // Reached max level
                remainingExp = 0;
                this._exp = this.expForLevel(PokemonMZ.pokemonMaxLevel);
                break;
            }
        }
        this._exp += remainingExp;
        const newMhp = this.mhp();
        if (newMhp > currentmHp) {
            this._hp += (newMhp - currentmHp);
        }

        const currentLevel = this.level();
        for (const moveInfo of this._data.learnedMoves) {
            if (moveInfo.lvl >= oldLevel + 1 && moveInfo.lvl <= currentLevel && !this._movesLearnWaitlist.includes(moveInfo.move)) {
                if (!this.knowsMove(moveInfo.move)) {
                    this._movesLearnWaitlist.push(moveInfo.move);
                }
            }
        }
    } else {
        this._exp = this.expForLevel(PokemonMZ.pokemonMaxLevel);
    }
};
PokemonMZ_Game_Pokemon.prototype.calculateEvolutionMoves = function() {
    // Return level 1 learned moves when evolving
    this._movesLearnWaitlist = [];
    for (const moveInfo of this._data.learnedMoves) {
        if (moveInfo.lvl == 1 && !this.knowsMove(moveInfo.move) && !this._movesLearnWaitlist.includes(moveInfo.move)) {
            this._movesLearnWaitlist.push(moveInfo.move);
        }
    }
};
PokemonMZ_Game_Pokemon.prototype.gainEv = function(hp,patk,pdef,satk,sdef,spd) {
    if (PokemonMZ.pokemonMechanicsGeneration <= 2) {
        // In first/second generations, Evs are limited to 65535
        // No ev for special defense - special atk accounts for both atk/def
        const evLimit = 65535;
        const oldMhp = this.mhp();
        this._ev.hp += hp;
        this._ev.patk += patk;
        this._ev.pdef += pdef;
        this._ev.satk += satk;
        this._ev.spd += spd;
        this._ev.hp.clamp(0, evLimit);
        this._ev.patk.clamp(0, evLimit);
        this._ev.pdef.clamp(0, evLimit);
        this._ev.satk.clamp(0, evLimit);
        this._ev.spd.clamp(0, evLimit);

        // Increase current hp
        const newMhp = this.mhp();
        this._hp += (newMhp - oldMhp);

    };
};
PokemonMZ_Game_Pokemon.prototype.evProvided = function() {
    // Calculate the Ev provided by the pokemon

    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        // First generation : base stats added to evs 
        return {
            "hp":this._data.baseStats.hp,
            "patk":this._data.baseStats.patk,
            "pdef":this._data.baseStats.pdef,
            "satk":this._data.baseStats.satk,
            "sdef":0,
            "spd":this._data.baseStats.spd,
        }
    }
};
PokemonMZ_Game_Pokemon.prototype.expForLevel = function(level) {
    let xpValue = 0;
    switch(this._data.expCurve) {
    case "erratic":
        // Gen 3+ only
        if (level < 50) {
            xpValue = (Math.pow(level,3)*(100-level))/50;
        } else if (level < 68) {
            xpValue = (Math.pow(level,3)*(150-level))/100;
        } else if (level < 98) {
            xpValue = (Math.pow(level,3)*((1911-10*level)/3))/500;
        } else {
            xpValue = (Math.pow(level,3)*(160-level))/100;
        }
        break;
    case "fast":
        xpValue = 4*Math.pow(level,3)/5;
        break;
    case "mediumFast":
        xpValue = Math.pow(level,3);
        break;
    case "mediumSlow":
        xpValue = 6/5*Math.pow(level,3)-15*Math.pow(level,2)+100*level-140;
        break;
    case "slow":
        xpValue = 5*Math.pow(level,3)/4;
        break;
    case "fluctuating":
        // Gen 3+ only
        if (level < 15) {
            xpValue = (Math.pow(level,3)*(((level+1)/3)+24))/50;
        } else if (level < 36) {
            xpValue = (Math.pow(level,3)*(level+14))/50;
        } else {
            xpValue = (Math.pow(level,3)*((level/2)+32))/50;
        }
        break;
    }
    return Math.floor(xpValue);
};
PokemonMZ_Game_Pokemon.prototype.expForNextLevel = function() {
    const currentExp = this._exp;
    if (this._level < PokemonMZ.pokemonMaxLevel) {
        const nextLevelExp = this.expForLevel(this._level + 1);
        return nextLevelExp - currentExp;
    } else {
        return 0;
    }
};
PokemonMZ_Game_Pokemon.prototype.movesLearnWaitlist = function() {
    return this._movesLearnWaitlist;
};
PokemonMZ_Game_Pokemon.prototype.getNextMoveLearned = function() {
    return this._movesLearnWaitlist.splice(0,1)[0];
};
PokemonMZ_Game_Pokemon.prototype.heal = function() {
    this._hp = this.mhp();
    for (move of this._moves) {
        move.pp = this.movePP(move.id, move.ppup);
    }
    this.removeTemporaryStatuses();
    this.unburn();
    this.unfreeze();
    this.unparalyze();
    this.unpoison();
    this.unsleep();
};
PokemonMZ_Game_Pokemon.prototype.resetStageModifiers = function() {
    this._stageModifiers = {
        "patk":0,
        "pdef":0,
        "satk":0,
        "sdef":0,
        "spd":0,
        "acc":0,
        "eva":0,
        "crit":0
    }
};
PokemonMZ_Game_Pokemon.prototype.hp = function() {
    return this._hp;
};
PokemonMZ_Game_Pokemon.prototype.setHp = function(newHp) {
    this._hp = newHp;
};
PokemonMZ_Game_Pokemon.prototype.canRecoverHp = function() {
    return this._hp < this.mhp();
};
PokemonMZ_Game_Pokemon.prototype.intEnemyId = function() {
    return this._enemyId;
};
PokemonMZ_Game_Pokemon.prototype.id = function() {
    return this._data.id;
};
PokemonMZ_Game_Pokemon.prototype.isDangerHp = function() {
    return this._hp <= 0.2*this.mhp();
};
PokemonMZ_Game_Pokemon.prototype.isHalfHp = function() {
    return this._hp <= 0.5*this.mhp();
};
PokemonMZ_Game_Pokemon.prototype.level = function() {
    return this._level;
};
PokemonMZ_Game_Pokemon.prototype.moveBasePP = function(moveId) {
    const move = $dataSkills[$dataSkillsIndex[moveId]];
    if (move) {
        const moveData = move.pkmz_data;
        return moveData.pp ? moveData.pp : 0;
    } else {
        console.error("Unknown move data for id " + moveId);
        return 0;
    }
}
PokemonMZ_Game_Pokemon.prototype.movePP = function(moveId, ppUp) {
    const basePP = this.moveBasePP(moveId);
    if (basePP == 40 && PokemonMZ.pokemonMechanicsGeneration < 3 ) {
        // First and second generations were limited to 63 in memory, hence they gave 7 pp per pp-up instead of 8
        return basePP + ppUp*7;
    } else {
        return basePP + ppUp*basePP/5;
    }
};
PokemonMZ_Game_Pokemon.prototype.consumePP = function(index) {
    // No PP consumption for index -1 -> struggle
    if (index != -1) {
        // 1 PP for now - will change with Gen 3 Pressure for ex.
        this._moves[index].pp --;
    }
};
PokemonMZ_Game_Pokemon.prototype.moveName = function(move) {
    if (move) {
        return this.moveNameFromStringId(move.id);
    }
};
PokemonMZ_Game_Pokemon.prototype.moveNameFromStringId = function(moveStringId) {
    if (Object.keys($dataSkillsIndex).includes(moveStringId)) {
        const moveIntId = $dataSkillsIndex[moveStringId];
        return $dataSkills[moveIntId].name;
    } else {
        return "????"
    }
};
PokemonMZ_Game_Pokemon.prototype.moves = function() {
    return this._moves;
};
PokemonMZ_Game_Pokemon.prototype.move = function(index) {
    return this._moves[index];
};
PokemonMZ_Game_Pokemon.prototype.movePriority = function(index) {
    const moveData = this.moveDataFromIndex(index);
    if (moveData) {
        return moveData.priority? moveData.priority : 0;
    } else {
        // Struggle
        return 0;
    }
};
PokemonMZ_Game_Pokemon.prototype.hasAnyMoveUseable = function() {
    let anyUsable = false;
    for (let i=0; i< this._moves.length; i++) {
        anyUsable = anyUsable || (this.moveUseability(i) == "");
    }
    return anyUsable;
};
PokemonMZ_Game_Pokemon.prototype.moveStruggle = function() {
    return {"id":"struggle","pp":0, "ppup":0}
};
PokemonMZ_Game_Pokemon.prototype.moveSelfHurtConfusion = function() {
    return {"id":"selfHurtConfusion","pp":0, "ppup":0}
};
PokemonMZ_Game_Pokemon.prototype.moveUseability = function(index) {
    const move = this._moves[index];
    if (move.pp == 0) {
        return "No PP left for this move!"
    }
    //TODO Disable etc

    return "";
};
PokemonMZ_Game_Pokemon.prototype.isMoveStatusOnly = function(index) {
    // Returns if a move only sets a status to the target
    const move = this.moveDataFromIndex(index);
    if (move.category != "status") { return false; }
    for (const effect of move.effects) {
        if (
            effect.type == "sleepTarget" ||
            effect.type == "paralyzeTarget" ||
            effect.type == "poisonTarget"
        ) {
            return true;
        }
    }
    return false;
};
PokemonMZ_Game_Pokemon.prototype.isMoveSeedOnly = function(index) {
    // Returns if a move only sets a status to the target
    const move = this.moveDataFromIndex(index);
    if (move.category != "status") { return false; }
    for (const effect of move.effects) {
        if (effect.type == "seedTarget") { return true; }
    }
    return false;
};
PokemonMZ_Game_Pokemon.prototype.isMoveConfuseOnly = function(index) {
    // Returns if a move only sets a status to the target
    const move = this.moveDataFromIndex(index);
    if (move.category != "status") { return false; }
    for (const effect of move.effects) {
        if (effect.type == "confuseTarget") { return true; }
    }
    return false;
};
PokemonMZ_Game_Pokemon.prototype.moveNameFromIndex = function(index) {
    const move = this._moves[index];
    return this.moveName(move);
};
PokemonMZ_Game_Pokemon.prototype.moveDataFromIndex = function(index) {
    const move = this.move(index);
    if (move) {
        if (Object.keys($dataSkillsIndex).includes(move.id)) {
            const skillIndex = $dataSkillsIndex[move.id];
            return $dataSkills[skillIndex].pkmz_data;
        } else {
            return "????"
        }
    }
};
PokemonMZ_Game_Pokemon.prototype.addReceivedItem = function(itemStrId) {
    this._receivedItems.push(itemStrId);
};
PokemonMZ_Game_Pokemon.prototype.receivedItemCount = function(itemStrId) {
    let counter = 0;
    for (const strId of this._receivedItems) {
        if (strId == itemStrId) { counter++; }
    }
    return counter;
};
PokemonMZ_Game_Pokemon.prototype.damageDealt = function() {
    return this._damageDealt;
};
PokemonMZ_Game_Pokemon.prototype.setDamageDealt = function(damage) {
    this._damageDealt = damage;
};
PokemonMZ_Game_Pokemon.prototype.name = function() {
    if (this._nickname != "") {
        return this._nickname;
    } else {
        return this.speciesName();
    }
};
PokemonMZ_Game_Pokemon.prototype.speciesName = function() {
    const enemy = $dataEnemies[this._enemyId];
    return enemy ? enemy.name : "Enemy name error";
};
PokemonMZ_Game_Pokemon.prototype.nextExpLevel = function() {
    if (this.canLevelUp()) {
        return this._level + 1;
    } else {
        return PokemonMZ.pokemonMaxLevel;
    }
};
PokemonMZ_Game_Pokemon.prototype.canLevelUp = function() {
    return (this._level < PokemonMZ.pokemonMaxLevel);
};
PokemonMZ_Game_Pokemon.prototype.expProvided = function(isTrainerBattle) { //TODO ADJUST
    const baseExpYield = this._data.xpYield;
    const trainerBattleFactor = isTrainerBattle ? 1.5 : 1.0;
    const luckyEggFactor = 1.0 // Will change in gen 2+
    const multiExpFactor = 1.0 // Will be calculated if multiexp
    const foreignFactor = 1.0 // Has to be adjusted if exchanged 

    return Math.floor((baseExpYield * this._level)/7 * (1 / multiExpFactor) * luckyEggFactor * trainerBattleFactor * foreignFactor);
};
PokemonMZ_Game_Pokemon.prototype.originalTrainerId = function() {
    return this._originalTrainerId;
};
PokemonMZ_Game_Pokemon.prototype.originalTrainerName = function() {
    return this._originalTrainerName;
};
PokemonMZ_Game_Pokemon.prototype.playCry = function() {
    AudioManager.playPokemonCry(this.id());
};
PokemonMZ_Game_Pokemon.prototype.randomizeDv = function() {
    this._dv.patk = Math.floor(Math.random() * 16);
    this._dv.pdef = Math.floor(Math.random() * 16);
    this._dv.satk = Math.floor(Math.random() * 16);
    this._dv.spd = Math.floor(Math.random() * 16);
    this._dv.hp = this.calculateHpDv();
};
PokemonMZ_Game_Pokemon.prototype.setDv = function(atk,def,spc,spd) {
    this._dv.patk = atk;
    this._dv.pdef = def;
    this._dv.satk = spc;
    this._dv.spd = spd;
    this._dv.hp = this.calculateHpDv();
};
PokemonMZ_Game_Pokemon.prototype.calculateHpDv = function() {
    let dv = 0;
    if (this._dv.patk % 2 != 0) { dv += 8 };
    if (this._dv.pdef % 2 != 0) { dv += 4 };
    if (this._dv.spd % 2 != 0) { dv += 2 };
    if (this._dv.satk % 2 != 0) { dv += 1 };
    return dv;
};
PokemonMZ_Game_Pokemon.prototype.setEv = function(hp,atk,def,spc,spd) {
    this._ev.hp = hp;
    this._ev.atk = atk;
    this._ev.def = def;
    this._ev.satk = spc;
    this._ev.sdef = spc;
    this._ev.spd = spd;
};
PokemonMZ_Game_Pokemon.prototype.setDefaultMoves = function() {
    this._moves = [];
    const learnedMoves = this._data.learnedMoves;
    if (learnedMoves) {
        for (move of learnedMoves) {
            if (move.lvl <= this._level && !this.knowsMove(move.move)) {
                this.learnMove(move.move);
            }
        }
        this.removeOlderMoves();
    }
};
PokemonMZ_Game_Pokemon.prototype.removeOlderMoves = function() {
    const numMoves = this._moves.length;
    if (numMoves > 4) {
        this._moves.splice(0, numMoves - 4);
    }
};
PokemonMZ_Game_Pokemon.prototype.learnMove = function(moveStringId) {
    this._moves.push({
        "id":moveStringId,
        "pp":this.movePP(moveStringId, 0),
        "ppup":0,
    });
};
PokemonMZ_Game_Pokemon.prototype.replaceMoveAtIndexBy = function(index, moveStringId) {
    this._moves.splice(index, 1, {
        "id":moveStringId,
        "pp":this.movePP(moveStringId, 0),
        "ppup":0,
    });
};
PokemonMZ_Game_Pokemon.prototype.knowsMove = function(moveStringId) {
    for (const move of this._moves) {
        if (move.id == moveStringId) {
            return true;
        }
    }
    return false;
};
PokemonMZ_Game_Pokemon.prototype.setNickname = function(nickname) {
    this._nickname = nickname;
};
PokemonMZ_Game_Pokemon.prototype.setTrainerInfo = function(trainerId, trainerName) {
    this._originalTrainerId = trainerId;
    this._originalTrainerName = trainerName;
};
PokemonMZ_Game_Pokemon.prototype.type1 = function() {
    if (!this._data.types) {
        return null;
    }
    if (this._data.types.length >= 1) {
        return this._data.types[0];
    }
    return null;
};
PokemonMZ_Game_Pokemon.prototype.type2 = function() {
    if (!this._data.types) {
        return null;
    }
    if (this._data.types.length >= 2) {
        return this._data.types[1];
    }
    return null;
};
PokemonMZ_Game_Pokemon.prototype.hasType = function(type) {
    return (this.type1() == type || this.type2() == type);
};
PokemonMZ_Game_Pokemon.prototype.hasStab = function(moveType) {
    return this.hasType(moveType);
};
PokemonMZ_Game_Pokemon.prototype.typeName = function(type) {
    if (type) {
        if (Object.keys($PokemonMZ_dataTypesIndex).includes(type)) {
            const index = $PokemonMZ_dataTypesIndex[type];
            return $PokemonMZ_dataTypes[index].name;
        } else {
            return "???"
        }
    } else {
        return "";
    }
};
PokemonMZ_Game_Pokemon.prototype.canUseItemOn = function(item) {
    const canUseResult = {"success":true, "message":""}
    const cannotUseResult = {"success":false, "message":"It won't have any effect."}

    switch(item.pkmz_data.effect) {
    case "recover_hp_fixed":
        if (this.canRecoverHp()) { return canUseResult; }
        break;
    case "cureStatus":
        switch(item.pkmz_data.status) {
        case "poison":
            if (this.isPoisoned()) { return canUseResult; }
            break;
        case "paralysis":
            if (this.isParalyzed()) { return canUseResult; }
            break;
        case "burn":
            if (this.isBurned()) { return canUseResult; }
            break;
        case "sleep":
            if (this.isAsleep()) { return canUseResult; }
            break;
        case "all":
            if (this.hasStatus()) { return canUseResult; }
            break;
        }
    }
    return cannotUseResult;
};
PokemonMZ_Game_Pokemon.prototype.itemEffect = function(item) {
    switch(item.pkmz_data.effect) {
    case "recover_hp_fixed":
        const currentHp = this.hp();
        const nextHp = (this.hp() + item.pkmz_data.value).clamp(0,this.mhp());
        const recovered = nextHp - currentHp;
        const recoverPercent = 100 * recovered / this.mhp();
        return {"effect":"recoverHp","value":recovered,"percentValue":recoverPercent};
    case "cureStatus":
        return {"effect":"cureStatus","status":item.pkmz_data.status};
    }
    return {"effect":""};
};
PokemonMZ_Game_Pokemon.prototype.mhp = function() {
    const base = this._data.baseStats ? this._data.baseStats.hp : 0;
    if (PokemonMZ.pokemonMechanicsGeneration == 1) {

        const unbuffed = this.gen1_calc_hp(base, this._level, this._dv.hp, this._ev.hp);
        const buffed = unbuffed; // TODO...
        return Math.floor(buffed);
    }
    return 0
};
PokemonMZ_Game_Pokemon.prototype.patk = function() {
    const base = this._data.baseStats ? this._data.baseStats.patk : 0;

    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        const unbuffed = this.gen1_calc_stat(base, this._level, this._dv.patk, this._ev.patk);
        const buffed = unbuffed; // TODO...
        return Math.floor(buffed);
    }
    return 0
};
PokemonMZ_Game_Pokemon.prototype.pdef = function() {
    const base = this._data.baseStats ? this._data.baseStats.pdef : 0;

    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        const unbuffed = this.gen1_calc_stat(base, this._level, this._dv.pdef, this._ev.pdef);
        const buffed = unbuffed; // TODO...
        return Math.floor(buffed);
    }
    return 0
};
PokemonMZ_Game_Pokemon.prototype.satk = function() {
    const base = this._data.baseStats ? this._data.baseStats.satk : 0;
    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        return this.spc();
    }
    return 0
};
PokemonMZ_Game_Pokemon.prototype.sdef = function() {
    const base = this._data.baseStats ? this._data.baseStats.sdef : 0;
    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        return this.spc();
    }
    return 0;
};
PokemonMZ_Game_Pokemon.prototype.spc = function() {
    const base = this._data.baseStats ? this._data.baseStats.spc : 0;
    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        const unbuffed = this.gen1_calc_stat(base, this._level, this._dv.satk, this._ev.satk);
        const buffed = unbuffed; // TODO...
        return Math.floor(buffed);
    }
    return 0;
};
PokemonMZ_Game_Pokemon.prototype.spd = function() {
    const base = this._data.baseStats ? this._data.baseStats.spd : 0;

    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        const unbuffed = this.gen1_calc_stat(base, this._level, this._dv.spd, this._ev.spd);
        const buffed = unbuffed; // TODO...
        return Math.floor(buffed);
    }
};
PokemonMZ_Game_Pokemon.prototype.patkModified = function() {
    const modifier = [0.25, 0.28, 0.33, 0.40, 0.50, 0.66, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    let value = this.patk();

    if (PokemonMZ.pokemonMechanicsGeneration == 1) {
        // In generation 1, a burned pokemon has its attack stat divided by two
        if (this.isBurned()) { value *= 0.5; }
    }

    return Math.floor(value * modifier[this._stageModifiers.patk + 6]);
};
PokemonMZ_Game_Pokemon.prototype.pdefModified = function() {
    const modifier = [0.25, 0.28, 0.33, 0.40, 0.50, 0.66, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    let value = this.pdef();
    return Math.floor(value * modifier[this._stageModifiers.pdef + 6]);
};
PokemonMZ_Game_Pokemon.prototype.satkModified = function() {
    const modifier = [0.25, 0.28, 0.33, 0.40, 0.50, 0.66, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    let value = this.satk();
    return Math.floor(value * modifier[this._stageModifiers.satk + 6]);
};
PokemonMZ_Game_Pokemon.prototype.sdefModified = function() {
    const modifier = [0.25, 0.28, 0.33, 0.40, 0.50, 0.66, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    let value = this.sdef();
    return Math.floor(value * modifier[this._stageModifiers.sdef + 6]);
};
PokemonMZ_Game_Pokemon.prototype.spdModified = function() {
    const modifier = [0.25, 0.28, 0.33, 0.40, 0.50, 0.66, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    let value = this.spd();
    value = Math.floor(value * modifier[this._stageModifiers.spd + 6]);

    // Paralysis reduce effective speed by 75%
    value = this.isParalyzed() ? Math.floor(value*0.25) : value;
    return value;
};
PokemonMZ_Game_Pokemon.prototype.accuracy = function() {
    const modifier = [0.25, 0.28, 0.33, 0.40, 0.50, 0.66, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]
    return modifier[this._stageModifiers.acc + 6];
};
PokemonMZ_Game_Pokemon.prototype.evasion = function() {
    const modifier = [4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.66, 0.50, 0.40, 0.33, 0.28, 0.25]
    return modifier[this._stageModifiers.eva + 6];
};
PokemonMZ_Game_Pokemon.prototype.gen1_calc_hp = function(base, level, dv, ev) {
    return ((((base + dv)*2 + (Math.sqrt(ev)/4))*level)/100) + level + 10;
};
PokemonMZ_Game_Pokemon.prototype.gen1_calc_stat = function(base, level, dv, ev) {
    return ((((base + dv)*2 + (Math.sqrt(ev)/4)) * level)/100) + 5;
};
PokemonMZ_Game_Pokemon.prototype.status = function() {
    if (this.isBurned()) {
        return "BRN";
    }
    if (this.isParalyzed()) {
        return "PAR";
    }
    if (this.isAsleep()) {
        return "SLP";
    }
    if (this.isPoisoned()) {
        return "PSN";
    }
    if (this.isFrozen()) {
        return "FRZ";
    }
    if (this.isFainted()) {
        return "FNT";
    }
    return "OK";
};
PokemonMZ_Game_Pokemon.prototype.hasStatus = function() {
    return this.isBurned() || this.isParalyzed() || this.isAsleep() || this.isPoisoned() || this.isFrozen();
};
PokemonMZ_Game_Pokemon.prototype.cleanAfterFaint = function() {
    if (this.isFainted()) {
        this.removeTemporaryStatuses();
        this.unburn();
        this.unfreeze();
        this.unparalyze();
        this.unpoison();
        this.unsleep();
    }
};
PokemonMZ_Game_Pokemon.prototype.removeTemporaryStatuses = function() {
    this.resetStageModifiers();
    this.unflinch();
    this.unseed();
    this.unconfuse();
};
PokemonMZ_Game_Pokemon.prototype.isFainted = function() {
    return this._hp == 0;
};
PokemonMZ_Game_Pokemon.prototype.isBurned = function() {
    return this._isBurned;
};
PokemonMZ_Game_Pokemon.prototype.isFrozen = function() {
    return this._isFrozen;
};
PokemonMZ_Game_Pokemon.prototype.isParalyzed = function() {
    return this._isParalyzed;
};
PokemonMZ_Game_Pokemon.prototype.isPoisoned = function() {
    return this._isPoisoned;
};
PokemonMZ_Game_Pokemon.prototype.isAsleep = function() {
    return this._isAsleep;
};
PokemonMZ_Game_Pokemon.prototype.nextSleepTurn = function() {
    this._turnsSleep--;
    if (this._turnsSleep == 0) {
        this.unsleep();
    }
};
PokemonMZ_Game_Pokemon.prototype.isFlinched = function() {
    return this._isFlinched;
};
PokemonMZ_Game_Pokemon.prototype.isSeeded = function() {
    return this._isSeeded;
};
PokemonMZ_Game_Pokemon.prototype.isConfused = function() {
    return this._isConfused;
};
PokemonMZ_Game_Pokemon.prototype.nextConfusionTurn = function() {
    this._turnsConfusion--;
    if (this._turnsConfusion == 0) {
        this.unconfuse();
    }
};
PokemonMZ_Game_Pokemon.prototype.isBurnable = function() {
    // Cannot burn pokemon with PSN/SLP/FRZ/PAR/BRN/FNT
    if (this.hasStatus() || this.isFainted()) {
        return false;
    }

    // Fire types cannot be burned
    if (this.hasType("fire")) {
        return false;
    }

    return true;
};
PokemonMZ_Game_Pokemon.prototype.isFreezable = function() {
    // Cannot burn pokemon with PSN/SLP/FRZ/PAR/BRN/FNT
    if (this.hasStatus() || this.isFainted()) {
        return false;
    }
    return true;
};
PokemonMZ_Game_Pokemon.prototype.isParalyzable = function() {
    // Cannot poison pokemon with PSN/SLP/FRZ/PAR/BRN/FNT
    if (this.hasStatus() || this.isFainted()) {
        return false;
    }
    return true;
};
PokemonMZ_Game_Pokemon.prototype.isPoisonable = function() {
    // Cannot poison pokemon with PSN/SLP/FRZ/PAR/BRN/FNT
    if (this.hasStatus() || this.isFainted()) {
        return false;
    }

    // Poison types cannot be poisoned
    if (this.hasType("poison")) {
        return false;
    }

    return true;
};
PokemonMZ_Game_Pokemon.prototype.isSleepable = function() {
    // Cannot burn pokemon with PSN/SLP/FRZ/PAR/BRN/FNT
    if (this.hasStatus() || this.isFainted()) {
        return false;
    }
    return true;
};
PokemonMZ_Game_Pokemon.prototype.isFlinchable = function() {
    // Cannot flinch FNT pokemon
    if (this.isFainted()) {
        return false;
    }
    return true;
};
PokemonMZ_Game_Pokemon.prototype.isSeedable = function() {
    // Cannot flinch FNT/SEEDED pokemon
    if (this.isFainted() || this.isSeeded()) {
        return false;
    }

    // Grass types cannot be seeded
    if (this.type1() == "grass" || this.type2() == "grass") {
        return false;
    }

    return true;
};
PokemonMZ_Game_Pokemon.prototype.isConfusable = function() {
    // Cannot flinch FNT/CONFUSED pokemon
    if (this.isFainted() || this.isConfused()) {
        return false;
    }

    return true;
};
PokemonMZ_Game_Pokemon.prototype.burn = function(force) {
    if (this.isBurnable() || force) {
        this._isBurned = true;
    }
};
PokemonMZ_Game_Pokemon.prototype.freeze = function(force) {
    if (this.isFreezable() || force) {
        this._isFrozen = true;
    }
};
PokemonMZ_Game_Pokemon.prototype.paralyze = function(force) {
    if (this.isParalyzable() || force) {
        this._isParalyzed = true;
    }
};
PokemonMZ_Game_Pokemon.prototype.poison = function(force) {
    if (this.isPoisonable() || force) {
        this._isPoisoned = true;
    }
};
PokemonMZ_Game_Pokemon.prototype.sleep = function(force) {
    if (this.isSleepable() || force) {
        this._isAsleep = true;
        this._turnsSleep = Math.randomInt(7) + 1;
    }
};
PokemonMZ_Game_Pokemon.prototype.flinch = function(force) {
    if (this.isFlinchable() || force) {
        this._isFlinched = true;
    }
};
PokemonMZ_Game_Pokemon.prototype.seed = function(force) {
    if (this.isSeedable() || force) {
        this._isSeeded = true;
    }
};
PokemonMZ_Game_Pokemon.prototype.confuse = function(turns, force) {
    if (this.isConfusable() || force) {
        this._isConfused = true;
        this._turnsConfusion = Math.randomInt(4) + 2;   // 2 to 5
    }
};
PokemonMZ_Game_Pokemon.prototype.unburn = function() {
    if (this.isBurned()) {
        this._isBurned = false;
    }
};
PokemonMZ_Game_Pokemon.prototype.unfreeze = function() {
    if (this.isFrozen()) {
        this._isFrozen = false;
    }
};
PokemonMZ_Game_Pokemon.prototype.unparalyze = function() {
    if (this.isParalyzed()) {
        this._isParalyzed = false;
    }
};
PokemonMZ_Game_Pokemon.prototype.unpoison = function() {
    if (this.isPoisoned()) {
        this._isPoisoned = false;
    }
};
PokemonMZ_Game_Pokemon.prototype.unsleep = function() {
    if (this.isAsleep()) {
        this._isAsleep = false;
        this._turnsSleep = 0;
    }
};
PokemonMZ_Game_Pokemon.prototype.unflinch = function() {
    if (this.isFlinched()) {
        this._isFlinched = false;
    }
};
PokemonMZ_Game_Pokemon.prototype.unseed = function() {
    if (this.isSeeded()) {
        this._isSeeded = false;
    }
};
PokemonMZ_Game_Pokemon.prototype.unconfuse = function() {
    if (this.isConfused()) {
        this._isConfused = false;
        this._turnsConfusion = 0;
    }
};
PokemonMZ_Game_Pokemon.prototype.firstPossibleEvolution = function(evolutionMode) {
    switch(evolutionMode) {
    case "levelUp":
        return this.firstPossibleEvolutionLevelUp();
    }
    return "";
}
PokemonMZ_Game_Pokemon.prototype.firstPossibleEvolutionLevelUp = function() {
    for (const evolution of this._data.evolutions) {
        if (evolution.mode == "level" && this._level >= evolution.level) {
            return evolution.to;
        }
    }
    return "";
}
PokemonMZ_Game_Pokemon.prototype.evolveTo = function(newPokemonStrId) {
    const enemyId = $dataPokemonsIndex[newPokemonStrId];
    const currentHpFactor = this._hp / this.mhp();
    this._enemyId = enemyId;
    this._data = $dataEnemies[this._enemyId].pkmz_data;
    this._hp = Math.floor(this.mhp() * currentHpFactor);
};

// PokemonMZ_Game_Battle
// The class for a pokemon battle
function PokemonMZ_Game_Battle() {
    this.initialize(...arguments);
}
PokemonMZ_Game_Battle.prototype.initialize = function() {
    this._allies = [];
    this._enemies = [];
    this._type = ""
    this._wildPokemon = null;
};
PokemonMZ_Game_Battle.prototype.setup = function(troopId) {
    this._troopId = troopId;
    this._allies = [];
    this._enemies = [];
    this._wildPokemon = null;

    const troopData = $dataTroops[troopId].pkmz_data;
    this._type = troopData.type;

    switch (this._type) {
    case "wild":
        this._wildPokemon = this.chooseWildPokemon(troopData.pokemons)
        break;
    case "trainer":
        this._enemies.push(
            this.createTrainer(troopData)
        );
        break;
    }
};
PokemonMZ_Game_Battle.prototype.chooseWildPokemon = function(pokemons) {
    // Choose wild pokemon from troop
    const rates = [];
    let minRate = 0;
    let maxRate = 0;
    for (let i=0; i< pokemons.length; i++) {
        // TODO : Check appearance conditions
        maxRate += pokemons[i].rate;
        rates.push({"id":i, "minRate":minRate, "maxRate":maxRate})
        minRate = maxRate;
    };
    
    let chosenId = -1;
    const randomNumber = Math.randomInt(maxRate);
    for (const rate of rates) {
        if (randomNumber >= rate.minRate && randomNumber < rate.maxRate) {
            chosenId = rate.id;
        }
    }

    const chosenPokemon = pokemons[chosenId];
    if (chosenPokemon.levelMin < chosenPokemon.levelMax) {
        const level = chosenPokemon.levelMin + Math.randomInt(chosenPokemon.levelMax - chosenPokemon.levelMin + 1)
        return this.createWildPokemon(chosenPokemon.id, level);
    } else {
        return this.createWildPokemon(chosenPokemon.id, chosenPokemon.levelMin);
    }
};
PokemonMZ_Game_Battle.prototype.createTrainer = function(trainerData) {
    const trainer = new PokemonMZ_Game_Trainer(trainerData.trainerActor);
    for (pokemonData of trainerData.pokemons) {
        const pokemon = this.createTrainerPokemon(pokemonData);
        trainer.addPokemonToParty(pokemon);
    }
    trainer.setIa(trainerData.ia);
    trainer.setIaModifiers(trainerData.iaModifiers);
    trainer.setDefeatText(trainerData.defeatText);
    trainer.setVictoryText(trainerData.victoryText);
    trainer.setMoney(trainerData.money);
    return trainer;
};
PokemonMZ_Game_Battle.prototype.createTrainerPokemon = function(pokemonData) {
    const pokemonId = $dataPokemonsIndex[pokemonData.id]
    const pokemon = new PokemonMZ_Game_Pokemon(pokemonId, pokemonData.level)

    // Set up DVs
    switch(pokemonData.dv) {
        case "default":
            pokemon.setDv(9,8,8,8); // Default DV values for trainers in gen1
            break;
        case "random":
            pokemon.randomizeDv();
            break;
    }

    // Set up EVs
    switch(pokemonData.ev) {
        case "default":
            pokemon.setEv(0,0,0,0,0); // Default EV values for trainers in gen1
            break;
    }

    // Set up moveset
    switch(pokemonData.moveset) {
        case "default":
            // Default moves by leveling up
            pokemon.setDefaultMoves();
            break;
        case "add":
            // Default moves by leveling up then add specific moves
            pokemon.setDefaultMoves();
            for (const addedMove of pokemonData.addMoves) {
                pokemon.learnMove(addedMove);
            }
            pokemon.removeOlderMoves();
            break;
    }   

    // Heal pokemon
    pokemon.heal();

    return pokemon;
};
PokemonMZ_Game_Battle.prototype.createWildPokemon = function(id, level) {
    const pokemonId = $dataPokemonsIndex[id]
    const pokemon = new PokemonMZ_Game_Pokemon(pokemonId, level)

    // Set up DVs
    pokemon.randomizeDv();
  
    // Set up EVs
    pokemon.setEv(0,0,0,0,0);

    // Set up moveset
    pokemon.setDefaultMoves();

    // Heal pokemon
    pokemon.heal();

    return pokemon;
};
PokemonMZ_Game_Battle.prototype.isWildBattle = function() {
    return this._type == "wild"
};
PokemonMZ_Game_Battle.prototype.isTrainerBattle = function() {
    return this._type == "trainer"
};
PokemonMZ_Game_Battle.prototype.enemy1 = function() {
    return this._enemies[0];
};
PokemonMZ_Game_Battle.prototype.wildPokemon = function() {
    return this._wildPokemon;
};
PokemonMZ_Game_Battle.prototype.canRunAway = function() {
    return this.isWildBattle();
};


// PokemonMZ_Game_Battle
// The class for a pokemon action in battle
function PokemonMZ_Game_Action() {
    this.initialize(...arguments);
}
PokemonMZ_Game_Action.prototype.initialize = function(user, side) {
    this._user = user;
    this._opponent = null;
    this._move = null;
    this._moveData = null;
    this._moveAnimationId = null;
    this._item = null;
    this._resultSteps = [];
    this._side = side;
    this._moveHits = 0;
    this._moveRemainingHits = 0;
    this._moveExecutedHits = 0;
    this._userStatusRemoved = [];
    this._opponentStatusRemoved = [];
};
PokemonMZ_Game_Action.prototype.side = function() {
    return this._side;
};
PokemonMZ_Game_Action.prototype.userBattleSprite = function() {
    return this._user._battleSprite;
};
PokemonMZ_Game_Action.prototype.opponentBattleSprite = function() {
    return this._opponent._battleSprite;
};
PokemonMZ_Game_Action.prototype.oppositeSide = function() {
    return this._side == "enemy" ? "player" : "enemy";
};
PokemonMZ_Game_Action.prototype.setMove = function(moveId, opponent) {
    this._move = moveId;
    if (Object.keys($dataSkillsIndex).includes(moveId)) {
        const skillIndex = $dataSkillsIndex[moveId];
        this._moveData = $dataSkills[skillIndex].pkmz_data;
        this._moveAnimationId = $dataSkills[skillIndex].animationId;
    }
    this._opponent = opponent;
};
PokemonMZ_Game_Action.prototype.setItem = function(item) {
    this._item = item;
};
PokemonMZ_Game_Action.prototype.isItem = function() {
    return (this._item);
};
PokemonMZ_Game_Action.prototype.isMove = function() {
    return (this._move);
};
PokemonMZ_Game_Action.prototype.opponent = function() {
    return this._opponent;
};
PokemonMZ_Game_Action.prototype.user = function() {
    return this._user;
};
PokemonMZ_Game_Action.prototype.hasRemainingResultSteps = function() {
    return this._resultSteps.length > 0;
};
PokemonMZ_Game_Action.prototype.resultSteps = function() {
    return this._resultSteps;
};
PokemonMZ_Game_Action.prototype.resultStepsLength = function() {
    return this._resultSteps.length;
};
PokemonMZ_Game_Action.prototype.addResultSteps = function(step) {
    this._resultSteps.push(step);
};
PokemonMZ_Game_Action.prototype.insertResultStepsAt = function(step, index) {
    this._resultSteps.splice(index, 0, step);
};
PokemonMZ_Game_Action.prototype.getNextResultStep = function() {
    return this._resultSteps.splice(0,1)[0];
};
PokemonMZ_Game_Action.prototype.isResultHit = function() {
    for (const step of this._resultSteps) {
        if (step[0] == "hitAnimation") {
            return true;
        }
    }
    return false;
};
PokemonMZ_Game_Action.prototype.isResultIneffective = function() {
    for (const step of this._resultSteps) {
        if (step[0] == "ineffective") {
            return true;
        }
    }
    return false;
};
PokemonMZ_Game_Action.prototype.isResultNotEffective = function() {
    for (const step of this._resultSteps) {
        if (step[0] == "notEffective") {
            return true;
        }
    }
    return false;
};
PokemonMZ_Game_Action.prototype.isResultSuperEffective = function() {
    for (const step of this._resultSteps) {
        if (step[0] == "superEffective") {
            return true;
        }
    }
    return false;
};
PokemonMZ_Game_Action.prototype.typeInfo = function(typeId) {
    if (Object.keys($PokemonMZ_dataTypesIndex).includes(typeId)) {
        return $PokemonMZ_dataTypes[$PokemonMZ_dataTypesIndex[typeId]];
    } else {
        return {};
    }
};
PokemonMZ_Game_Action.prototype.typeEffectiveness = function(offensiveType, defensiveType) {
    const defensiveInfo = this.typeInfo(defensiveType);

    if (defensiveInfo.immune.includes(offensiveType)) {
        return 0.0;
    } else if (defensiveInfo.strong.includes(offensiveType)) {
        return 0.5;
    } else if (defensiveInfo.weak.includes(offensiveType)) {
        return 2.0;
    } else {
        return 1.0;
    }
};
PokemonMZ_Game_Action.prototype.calculate = function(item) {
    if (this.isItem()) {
        this.calculateItem();
    } else if (this.isMove()) {
        this.calculateMove();
    }
};
PokemonMZ_Game_Action.prototype.calculateItem = function() { //TODO  
    const item = $dataItems[$dataItemsIndex[this._item]];
    const effect = this._user.itemEffect(item);
    this._userEvolvingHp = this._user.hp();
    this._userStatusRemoved = [];

    switch (effect.effect) {
        case "recoverHp":
            this._resultSteps.push(["healUser", effect.value])
            this._userEvolvingHp += effect.value;
            this._userEvolvingHp.clamp(0,this._user.mhp())
            break;
        case "cureStatus":
            switch (effect.status) {
                case "burn":
                    this._resultSteps.push(["burnHeal",this._user]);
                    this._userStatusRemoved.push("burn");
                    break;
                case "paralysis":
                    this._resultSteps.push(["paralyzeHeal",this._user]);
                    break;
                case "poison":
                    this._resultSteps.push(["poisonHeal",this._user]);
                    this._userStatusRemoved.push("poison");
                    break;
                case "sleep":
                    this._resultSteps.push(["sleepHeal",this._user]);
                    break;
                case "freeze":
                    this._resultSteps.push(["freezeHeal",this._user]);
                    break;
                case "all":
                    this._resultSteps.push(["allStatusHeal",this._user]);
                    this._userStatusRemoved.push("burn");
                    this._userStatusRemoved.push("poison");
                    break;
            }
            break;
    }
    this._resultSteps.push(["waittext","usedItem",this.side(), item.name]);
    this.calculateStatusEffects(this._userEvolvingHp, this._opponentEvolvingHp);
};
PokemonMZ_Game_Action.prototype.calculateNumHits = function() {
    // Calculate number of time the move will hit
    this._moveHits = 1;
    this._moveRemainingHits = 1;
    this._moveExecutedHits = 0;

    for (const effect of this._moveData.effects) {
        if (effect.type == "multiHit") {
            const hitArray = [];
            let rndMax = 0;
            for (let i=effect.min; i<=effect.max; i++) {
                rndMax += effect.percentChances[i-effect.min];
                hitArray.push(rndMax)
            }

            const rndValue = Math.randomInt(rndMax);
            for (let i=effect.min; i<=effect.max; i++) {
                if (rndValue < hitArray[i-effect.min]) {
                    this._moveHits = i;
                    this._moveRemainingHits = i;
                    break;
                }
            }
        }
    };
};
PokemonMZ_Game_Action.prototype.calculateMove = function() { //TODO
    let hit = false;
    let crit = false;
    let opponentDamage = 0;
    let opponentStatus = "";
    let userDamage = 0;
    let userStatus = "";
    let data = [];

    this._userEvolvingHp = this._user.hp();
    this._opponentEvolvingHp = this._opponent.hp();

    // Prepare for multi hits
    this.calculateNumHits();

    while (this._moveRemainingHits > 0)  {
        switch (this._moveData.category) {
        case "status":
            this.calculateMoveStatus();
            break;
        default:
            this.calculateMoveAttack();
            break;
        }
    }
};
PokemonMZ_Game_Action.prototype.calculateMoveAttack = function() { 
    let enemyWillFaint = false;
    let userWillFaint = false;

    // Hit calculation is only required for the first hit
    hit = this.moveHit() || this._moveData.target == "user";

    if (hit || this._moveExecutedHits > 0) {
        if (this._moveData.target == "opponent") {
            this._resultSteps.push(["hitAnimation", this._opponent._battleSprite, this._moveAnimationId]);
        } else if (this._moveData.target == "user") {
            this._resultSteps.push(["hitAnimation", this._user._battleSprite, this._moveAnimationId]);
        }
        
        crit = this.moveCritical();
        

        const damage = this.moveDamage(crit);
        userDamage = damage.user;
        opponentDamage = damage.opponent
        efficiency = damage.efficiency

        if (opponentDamage > 0) {
            if (efficiency < 1) {
                this._resultSteps.push(["se","weak"]);
                this._resultSteps.push(["damageOpponent",opponentDamage]);

                if (this._moveExecutedHits == 0) {
                    this._resultSteps.push(["autotext","weak",this.side()])
                }
            } else if (efficiency > 1) {
                this._resultSteps.push(["se","strong"]);
                this._resultSteps.push(["damageOpponent",opponentDamage]);
                if (this._moveExecutedHits == 0) {
                    this._resultSteps.push(["autotext","strong",this.side()])
                }
            } else {
                this._resultSteps.push(["se","normal"]);
                this._resultSteps.push(["damageOpponent",opponentDamage]);
            }
            if (crit) {
                this._resultSteps.push(["autotext","critical",this.side()]);
            }
            const effectsResult = this.calculateMoveEffects({
                "damageDealt":opponentDamage
            });
            this._opponentEvolvingHp -= opponentDamage;
            if (this._opponentEvolvingHp <= 0) {
                this._moveRemainingHits = 1;
                enemyWillFaint = true;
            }
            if (effectsResult.userDamage) {
                this._userEvolvingHp -= effectsResult.userDamage
                if (this._userEvolvingHp <= 0) {
                    this._moveRemainingHits = 1;
                    userWillFaint = true;
                    
                }
            }
            this._moveExecutedHits++;
            this._moveRemainingHits--;

        } else if (userDamage > 0) {

            if (efficiency < 1) {
                this._resultSteps.push(["se","weak"]);
                this._resultSteps.push(["damageUser",userDamage]);

                if (this._moveExecutedHits == 0) {
                    this._resultSteps.push(["autotext","weak",this.side()])
                }
            } else if (efficiency > 1) {
                this._resultSteps.push(["se","strong"]);
                this._resultSteps.push(["damageUser",userDamage]);
                if (this._moveExecutedHits == 0) {
                    this._resultSteps.push(["autotext","strong",this.side()])
                }
            } else {
                this._resultSteps.push(["se","normal"]);
                this._resultSteps.push(["damageUser",userDamage]);
            }
            if (crit) {
                this._resultSteps.push(["autotext","critical",this.side()]);
            }
            const effectsResult = this.calculateMoveEffects({
                "damageDealt":userDamage
            });
            this._userEvolvingHp -= userDamage;
            if (this._userEvolvingHp <= 0) {
                this._moveRemainingHits = 1;
                userWillFaint = true;
            }
            if (effectsResult.opponentDamage) {
                this._opponentEvolvingHp -= effectsResult.opponentDamage
                if (this._opponentEvolvingHp <= 0) {
                    this._moveRemainingHits = 1;
                    enemyWillFaint = true;
                    
                }
            }
            this._moveExecutedHits++;
            this._moveRemainingHits--;

        } else {
            this._moveRemainingHits = 0;
            if (efficiency == 0) {
               this._resultSteps.push(["autotext","noeffect",this.oppositeSide()]);
            } 
            
        }
    } else {
        this._moveRemainingHits = 0;
        this._resultSteps.push(["autotext","missed",this.side()])
    }

    if (this._moveRemainingHits == 0) {
        if (this._moveHits > 1 && this._moveExecutedHits > 0) {
            this._resultSteps.push(["autotext","hitTimes",this.side(), this._moveExecutedHits]);
        }

        if (enemyWillFaint) {
            this._resultSteps.push(["faintPokemon","opponent",this._opponent._battleSprite]);
        }
        if (userWillFaint) {
            this._resultSteps.push(["faintPokemon","user",this._user._battleSprite]);
        }


        this.calculateStatusEffects(this._userEvolvingHp, this._opponentEvolvingHp);
    }
};
PokemonMZ_Game_Action.prototype.calculateMoveStatus = function() { 
    hit = this.moveHit() || this._moveData.target == "user";
    if (this.side() == "enemy" && this._moveData.target == "opponent") {
        // In generation 1, opponent status moves have an additional 1/4 chance to fail
        const rnd = Math.random();
        hit = hit && (rnd < 0.75);
    }
    if (hit) {
        const nextResultIndex = this._resultSteps.length;
        effectResults = this.calculateMoveEffects({"damageDealt":0});
        if (effectResults.success) {
            if (this._moveData.target == "opponent") {
                this._resultSteps.splice(nextResultIndex, 0, ["hitAnimation", this._opponent._battleSprite, this._moveAnimationId]);
            } else if (this._moveData.target == "user") {
                this._resultSteps.splice(nextResultIndex, 0, ["hitAnimation", this._user._battleSprite, this._moveAnimationId]);
            };
        }
    } else {
        // Leech seed has an evaded message
        // Powders have a no affect message
        let failTextKey = "statusFailed";
        for (const effect of this._moveData.effects) {
            if (effect.type == "seedTarget") {
                failTextKey = "evaded";
            } else if (["poisonTarget","sleepTarget","paralyzeTarget"].includes(effect.type)) {
                failTextKey = "noAffect";
            }
        }
        this._resultSteps.push(["autotext",failTextKey,this.oppositeSide()])
    }

    this._moveExecutedHits++;
    this._moveRemainingHits--;

    this.calculateStatusEffects(this._user.hp(), this._opponent.hp());
};
PokemonMZ_Game_Action.prototype.calculateMoveEffects = function(battleData) { // TODO ADD ALL MOVE EFFECTS
    const effects = this._moveData.effects;
    if (!effects) { return {}; }

    let effectResults = {"success":false};

    for (const effect of this._moveData.effects) {
        effectResults = this.calculateMoveEffect(battleData, effect, effectResults)
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.isMoveEffectExcepted = function(effect, target) {
    // Check if target is excepted from effect (ex. electric type for thundershock)
    if (effect.except) {
        for (exceptData of effect.except) {
            if (exceptData.type && target.hasType(exceptData.type)) { return true;}
        }
    } else {
        return false;
    }
};
PokemonMZ_Game_Action.prototype.calculateMoveEffect = function(battleData, effect, effectResults) { 
    switch (effect.type) {
    case "burnTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_burnTarget(battleData, effect, effectResults);
        }
        break;
    case "confuseTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_confuseTarget(battleData, effect, effectResults);
        }
        break;
    case "flinchTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_flinchTarget(battleData, effect, effectResults);
        }
        break;
    case "paralyzeTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_paralyzeTarget(battleData, effect, effectResults);
        } else {
        }
        break;
    case "poisonTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_poisonTarget(battleData, effect, effectResults);
        }
        break;
    case "seedTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_seedTarget(battleData, effect, effectResults);
        }
        break;
    case "sleepTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_sleepTarget(battleData, effect, effectResults);
        }
        break;
    case "accDownTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_accDownTarget(battleData, effect, effectResults);
        }
        break;    
    case "patkDownTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_patkDownTarget(battleData, effect, effectResults);
        }
        break;
    case "pdefDownTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_pdefDownTarget(battleData, effect, effectResults);
        }
        break;
    case "spdDownTarget":
        if (!this.isMoveEffectExcepted(effect, this._opponent)) {
            effectResults = this.effect_spdDownTarget(battleData, effect, effectResults);
        }
        break;
    case "pdefUpUser":
        if (!this.isMoveEffectExcepted(effect, this._user)) {
            effectResults = this.effect_pdefUpUser(battleData, effect, effectResults);
        }
        break;
    case "evaUpUser":
        if (!this.isMoveEffectExcepted(effect, this._user)) {
            effectResults = this.effect_evaUpUser(battleData, effect, effectResults);
        }
        break;

    case "recoilPercent":
        if (!this.isMoveEffectExcepted(effect, this._user)) {
            effectResults = this.effect_recoilPercent(battleData, effect, effectResults);
        }
        break;
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.calculateStatusEffects = function(userHp, opponentHp) {
    let userRemainingHp = userHp;
    let oppponentRemainingHp = opponentHp;

    if (this._user.isBurned() && !this._user.isFainted() && !this._userStatusRemoved.includes("burn")) {
        userRemainingHp = this.calculateBurnEffect(userRemainingHp);
    }
    if (this._user.isPoisoned() && !this._user.isFainted() && !this._userStatusRemoved.includes("poison")) {
        userRemainingHp = this.calculatePoisonEffect(userRemainingHp);
    }
    if (this._user.isSeeded() && !this._user.isFainted() && !this._opponent.isFainted()) {
        userRemainingHp = this.calculateSeedDamageEffect(userRemainingHp);
        opponentRemainingHp = this.calculateSeedHealEffect(oppponentRemainingHp, userRemainingHp <= 0);
    }
};
PokemonMZ_Game_Action.prototype.moveHit = function() {
    if (this._moveData.noAccuracy) { return true; } // Non missable move, like hurting from confusion

    switch (this._moveData.target) {
        case "opponent":
            const moveAccuracy = this._moveData.accuracy ? this._moveData.accuracy : 100;
            const userAccuracy = this._user.accuracy();
            const targetEvasion = this._opponent.evasion();
            const brightPowder = 0;

            const accuracyModified = Math.floor(moveAccuracy * userAccuracy * targetEvasion - brightPowder).clamp(0,100);

            const randomValue = Math.randomInt(100);
            const isHitting = randomValue <= accuracyModified;
            if (PokemonMZ.debugLog) {
                console.log({"PokemonMZ_Game_Action.moveHit > ":
                    {
                        "01. Move Accuracy":moveAccuracy,
                        "02. User Accuracy":userAccuracy,
                        "03. Target Evasion":targetEvasion,
                        "04. Calculated Accuracy":accuracyModified,
                        "05. Random value":randomValue,
                        "06. Hitting":isHitting
                    }
                })
            }

            return isHitting;
    }

    return true;
};
PokemonMZ_Game_Action.prototype.moveCritical = function() { 
    if (this._moveData.noCritical) { return false; } // Non criticable move, like hurting from confusion
    if (!this._moveData.power) { return false; }
    
    let highCritical = false;
    for (const effect of this._moveData.effects) {
        if (effect.type == "highCritical") {
            highCritical = true;
        }
    };

    let isCritical = false;
    const criticalStage = 0;
    //TODO : Evolution of critical stage - item held, abilites, use of items, certains moves

    // GEN 1 critical calculation
    switch (PokemonMZ.pokemonMechanicsGeneration) {
        case 1:
            const criticalFactor = highCritical ? 8 : 1;
            const threshold = Math.floor(criticalFactor * this._user.spd() / 2).clamp(0,255); 
            const randomValue = Math.randomInt(256);
            isCritical = randomValue < threshold

            if (PokemonMZ.debugLog) {
                console.log({"PokemonMZ_Game_Action.moveCritical > ":
                    {
                        "01. User speed":this._user.spd(),
                        "02. Move critical factor":criticalFactor,
                        "03. Threshold":threshold,
                        "04. Random value":randomValue,
                        "05. Is critical":isCritical
                    }
                })
            }
        break;
    }

    return isCritical;
};
PokemonMZ_Game_Action.prototype.moveDamageCategory = function() {
    // Determine if move is physical or special

    // GEN 1 : type determines the move nature
    return this.typeInfo(this._moveData.type).damage
};
PokemonMZ_Game_Action.prototype.moveDamage = function(critical) {
    const damageCategory = this.moveDamageCategory();
    let attackBaseStat = 0;
    let attackModifiedStats = 0;
    let defenseBaseStat = 0;
    let defenseModifiedStats = 0;
    let barrierAmplifier = 1;
    let destructionDivider = 1;

    const debugLogging = {}

    switch(damageCategory) {
        case "physical":
            debugLogging.category = "physical"
            debugLogging.attackStats = {"base":this._user.patk(), "modified":this._user.patkModified()}

            attackBaseStat = this._user.patk();
            attackModifiedStats = this._user.patkModified();

            if (this._moveData.target == "opponent") {
                debugLogging.defenseStats = {"base":this._opponent.pdef(), "modified":this._opponent.pdefModified()}
                defenseBaseStat = this._opponent.pdef();
                defenseModifiedStats = this._opponent.pdefModified();
            } else if (this._moveData.target == "user") {
                debugLogging.defenseStats = {"base":this._user.pdef(), "modified":this._user.pdefModified()}
                defenseBaseStat = this._user.pdef();
                defenseModifiedStats = this._user.pdefModified();
            }

            // TODO : barrierAmplifier=2 if reflect is up on opponent side and not critical
            break;
        case "special":
            debugLogging.category = "special"
            debugLogging.attackStats = {"base":this._user.satk(), "modified":this._user.satkModified()}
            attackBaseStat = this._user.satk();
            attackModifiedStats = this._user.satkModified();

            if (this._moveData.target == "opponent") {
                debugLogging.defenseStats = {"base":this._opponent.sdef(), "modified":this._opponent.sdefModified()}
                defenseBaseStat = this._opponent.sdef();
                defenseModifiedStats = this._opponent.sdefModified();

            } else if (this._moveData.target == "user") {
                debugLogging.defenseStats = {"base":this._user.sdef(), "modified":this._user.sdefModified()}
                defenseBaseStat = this._user.sdef();
                defenseModifiedStats = this._user.sdefModified();
            }

            // TODO : barrierAmplifier=2 if light screen is up on opponent side and not critical
            break;
    }

    const effectiveAttack = (critical ? attackBaseStat : attackModifiedStats);
    const effectiveDefense = Math.max(
        (critical ? defenseBaseStat : defenseModifiedStats) * barrierAmplifier / destructionDivider, 
        1
    );

    debugLogging.attackStats.effective = effectiveAttack;
    debugLogging.defenseStats.effective = effectiveDefense;
    debugLogging.defenseStats.barrierAmplifier = barrierAmplifier;
    debugLogging.defenseStats.destructionDivider = destructionDivider;

    const criticalCoef = critical ? 2.0 : 1.0;
    const moveType = this._moveData.type
    const movePower = this._moveData.power;
    const level = this._user.level();
    const stabFactor = this._user.hasStab(moveType) ? 1.5 : 1.0;
    
    let efficiency = 1.0;
    let opponentType1 = this._opponent.type1();
    let opponentType2 = this._opponent.type2();
    
    if (opponentType1) { efficiency *= this.typeEffectiveness(moveType, opponentType1) }
    if (opponentType2) { efficiency *= this.typeEffectiveness(moveType, opponentType2) }

    debugLogging.criticalCoef = criticalCoef;
    debugLogging.stabFactor = stabFactor;
    debugLogging.efficiency = efficiency;

    let variance = 1.0
    if (!this._moveData.noVariance) {  // Moves such as hurting from confusion do not get variance
        variance = (Math.randomInt(39) + 217) / 255;
    }
    
    debugLogging.variance = variance;

    const damage = Math.floor(
        ((
            ((2 * level * criticalCoef)/5)
            * movePower * effectiveAttack / effectiveDefense
        ) /50 + 2)
        * stabFactor * efficiency * variance
    );

    debugLogging.damage = damage

    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.moveDamage > ":debugLogging})
    }

    if (this._moveData.target == "opponent") {
        return {"user":0, "opponent":damage, "efficiency":efficiency};
    } else if (this._moveData.target == "user") {
        return {"user":damage, "opponent":0, "efficiency":efficiency};
    }
};

// FROM HERE CALCULATE STATUS EFFECTS
PokemonMZ_Game_Action.prototype.calculateBurnEffect = function(userRemainingHp) {
    this.addResultSteps(["animateUserEffect", this.userBattleSprite(), "burned"])
    this.addResultSteps(["waittext","hurtburn",this.side()]);
    const burnDamage = Math.floor(this._user.mhp() / 16).clamp(1,this._user.mhp());

    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.calculateBurnEffect > ":{"mhp":this._user.mhp(), "damage":burnDamage}})
    }

    this._resultSteps.push(["damageUser",burnDamage]);
    userRemainingHp -= burnDamage;
    if (userRemainingHp <= 0) {
        this._resultSteps.push(["faintPokemon","user",this._user._battleSprite]);
    }
    return userRemainingHp;
};
PokemonMZ_Game_Action.prototype.calculatePoisonEffect = function(userRemainingHp) {
    this.addResultSteps(["animateUserEffect", this.userBattleSprite(), "poisoned"])
    this.addResultSteps(["waittext","hurtpoison",this.side()]);
    const poisonDamage = Math.floor(this._user.mhp() / 16).clamp(1,this._user.mhp());

    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.calculatePoisonEffect > ":{"mhp":this._user.mhp(), "damage":poisonDamage}})
    }

    this._resultSteps.push(["damageUser",poisonDamage]);
    userRemainingHp -= poisonDamage;
    if (userRemainingHp <= 0) {
        this._resultSteps.push(["faintPokemon","user",this._user._battleSprite]);
    }
    return userRemainingHp;
};
PokemonMZ_Game_Action.prototype.calculateSeedDamageEffect = function(userRemainingHp) {
    this.addResultSteps(["animateUserEffect", this.userBattleSprite(), "seeded"])

    const seedDamage = Math.floor(this._user.mhp() / 16).clamp(1,this._user.mhp());

    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.calculateSeedDamageEffect > ":{"mhp":this._user.mhp(), "damage":seedDamage}})
    }

    this._resultSteps.push(["damageUser",seedDamage]);
    userRemainingHp -= seedDamage;
    return userRemainingHp;
};
PokemonMZ_Game_Action.prototype.calculateSeedHealEffect = function(opponentRemainingHp, userKo) {
    const seedHeal = Math.floor(this._opponent.mhp() / 16).clamp(1,this._opponent.mhp());
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.calculateSeedHealEffect > ":{"mhp":this._user.mhp(), "heal":seedHeal}})
    }

    this.addResultSteps(["animateUserEffect", this.opponentBattleSprite(), "seedHealed"])
    this.addResultSteps(["healOpponent",seedHeal]);
    this.addResultSteps(["waittext","hurtseed",this.side()]);

    if (userKo) {
        this._resultSteps.push(["faintPokemon","user",this._user._battleSprite]);
    }

    opponentRemainingHp += seedHeal.clamp(0, this._opponent.mhp());
    return opponentRemainingHp;
};

// FROM HERE CALCULATE MOVE EFFECTS
PokemonMZ_Game_Action.prototype.effect_burnTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_burnTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent.isBurnable()) {
            effectResults.success = true;
            this._resultSteps.push(["waittext","burned",this.oppositeSide()])
            this._resultSteps.push(["burnPokemon",this._opponent])
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_confuseTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_confuseTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent.isConfusable()) {
            effectResults.success = true;
            this._resultSteps.push(["waittext","confused",this.oppositeSide()])
            this._resultSteps.push(["confusePokemon",this._opponent])
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_flinchTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_flinchTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent.isFlinchable()) {
            effectResults.success = true;
            this._resultSteps.push(["flinchPokemon",this._opponent])
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_paralyzeTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_paralyzeTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent.isParalyzable()) {
            effectResults.success = true;
            this._resultSteps.push(["waittext","paralyzed",this.oppositeSide()])
            this._resultSteps.push(["paralyzePokemon",this._opponent])
        } else {
            if (battleData.damageDealt == 0) {
                this._resultSteps.push(["waittext","noAffect",this.oppositeSide()]);
            };
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_poisonTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_poisonTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent.isPoisonable()) {
            effectResults.success = true;
            this._resultSteps.push(["waittext","poisoned",this.oppositeSide()])
            this._resultSteps.push(["poisonPokemon",this._opponent])
        } else {
            if (battleData.damageDealt == 0) {
                this._resultSteps.push(["waittext","noAffect",this.oppositeSide()]);
            };
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_seedTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    if (this._opponent.isSeedable()) {
        effectResults.success = true;
        this._resultSteps.push(["waittext","seeded",this.oppositeSide()]);
        this._resultSteps.push(["seedPokemon",this._opponent]);
    } else {
        this._resultSteps.push(["waittext","evaded",this.oppositeSide()]);
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_sleepTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) { 
        // No effect if target will faint
        return effectResults;
    }
    if (this._opponent.isSleepable()) {
        effectResults.success = true;
        this._resultSteps.push(["waittext","sleep",this.oppositeSide()]);
        this._resultSteps.push(["sleepPokemon",this._opponent]);
    } else {
        if (battleData.damageDealt == 0) {
            if (this._opponent.isAsleep()) {
                this._resultSteps.push(["waittext","alreadySleeping",this.oppositeSide()]);
            } else {
                this._resultSteps.push(["waittext","noAffect",this.oppositeSide()]);
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_pdefUpUser = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) {
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_effect_pdefUpUser > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber, "stageBefore":this._user._stageModifiers.pdef}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._user._stageModifiers.pdef < 6) {
            this._user._stageModifiers.pdef += effect.stage;
            this._user._stageModifiers.pdef.clamp(-6,6);
            effectResults.success = true;
            this._resultSteps.push(["autotext","defenseRose",this.side()])
        } else {
            if (battleData.damageDealt == 0) {
                // Message nothing if no damage dealt, else simply nothing happens
                this._resultSteps.push(["autotext","statusNothing",this.side()])
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_evaUpUser = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) {
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_evaUpUser > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber, "stageBefore":this._user._stageModifiers.eva}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._user._stageModifiers.eva < 6) {
            this._user._stageModifiers.eva += effect.stage;
            this._user._stageModifiers.eva.clamp(-6,6);
            effectResults.success = true;
            this._resultSteps.push(["autotext","evasionRose",this.side()])
        } else {
            if (battleData.damageDealt == 0) {
                // Message nothing if no damage dealt, else simply nothing happens
                this._resultSteps.push(["autotext","statusNothing",this.side()])
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_accDownTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) {
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_accDownTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber, "stageBefore":this._opponent._stageModifiers.acc}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent._stageModifiers.acc > -6) {
            this._opponent._stageModifiers.acc -= effect.stage;
            this._opponent._stageModifiers.acc.clamp(-6,6);
            effectResults.success = true;
            this._resultSteps.push(["autotext","accuracyFell",this.oppositeSide()])
        } else {
            if (battleData.damageDealt == 0) {
                // Message nothing if no damage dealt, else simply nothing happens
                this._resultSteps.push(["autotext","statusNothing",this.side()])
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_patkDownTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) {
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_patkDownTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber, "stageBefore":this._opponent._stageModifiers.patk}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent._stageModifiers.patk > -6) {
            this._opponent._stageModifiers.patk -= effect.stage;
            this._opponent._stageModifiers.patk.clamp(-6,6);
            effectResults.success = true;
            this._resultSteps.push(["autotext","attackFell",this.oppositeSide()])
        } else {
            if (battleData.damageDealt == 0) {
                // Message nothing if no damage dealt, else simply nothing happens
                this._resultSteps.push(["autotext","statusNothing",this.side()])
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_pdefDownTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) {
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_flinchTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent._stageModifiers.pdef > -6) {
            this._opponent._stageModifiers.pdef -= effect.stage;
            this._opponent._stageModifiers.pdef.clamp(-6,6);
            effectResults.success = true;
            this._resultSteps.push(["autotext","defenseFell",this.oppositeSide()])
        } else {
            if (battleData.damageDealt == 0) {
                // Message nothing if no damage dealt, else simply nothing happens
                this._resultSteps.push(["autotext","statusNothing",this.side()])
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_spdDownTarget = function(battleData, effect, effectResults) {
    if (this._opponent.hp() - battleData.damageDealt <= 0) {
        // No effect if target will faint
        return effectResults;
    }
    const randomNumber = Math.randomInt(100)
    if (PokemonMZ.debugLog) {
        console.log({"PokemonMZ_Game_Action.effect_spdDownTarget > ":{
            "chance":effect.percentChance, "randomNumber":randomNumber, "stageBefore":this._opponent._stageModifiers.spd}
        })
    }
    if (randomNumber < effect.percentChance) {
        if (this._opponent._stageModifiers.spd > -6) {
            this._opponent._stageModifiers.spd -= effect.stage;
            this._opponent._stageModifiers.spd.clamp(-6,6);
            effectResults.success = true;
            this._resultSteps.push(["autotext","speedFell",this.oppositeSide()])
        } else {
            if (battleData.damageDealt == 0) {
                // Message nothing if no damage dealt, else simply nothing happens
                this._resultSteps.push(["autotext","statusNothing",this.side()])
            }
        }
    }
    return effectResults;
};
PokemonMZ_Game_Action.prototype.effect_recoilPercent = function(battleData, effect, effectResults) {
    const damageDealt = Math.floor(battleData.damageDealt * effect.value/100);
    if (damageDealt > 0) {
        if (PokemonMZ.debugLog) {
            console.log({"PokemonMZ_Game_Action.effect_recoilPercent > ":{
                "originalDamage":battleData.damageDealt, "effect":effect.value, "recoilDamage":damageDealt}
            })
        }
        effectResults.success = true;
        this._resultSteps.push(["autotext","hitRecoil",this.side()])
        this._resultSteps.push(["damageUser",damageDealt]);
    }
    effectResults.userDamage = damageDealt;
    return effectResults;
};
