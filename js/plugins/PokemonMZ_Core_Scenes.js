//=============================================================================
// RPG Maker MZ - PokemonMZ - Core Scene plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core scene plugin for PokemonMZ
 * @author Schlangan
*/




// Scene_Base edits for identical functions between Scene_Menu and Scene_Battle
Scene_Base.prototype.PokemonMZ_updateItemEffects = function() {
    if (this._pokemonRecoveringData) {
        switch (this._pokemonRecoveringData.type) {
        case "recoverHp":
            this.updatePokemonRecover();
            break;
        case "cureStatus":
            this.updatePokemonCureStatus();
            break;
        case "increaseLevel":
            this.updatePokemonIncreaseLevel();
            break;
        }
    }
}
Scene_Base.prototype.PokemonMZ_createRecoveryData = function(pokemon, effect, listWindow) {
    switch (effect.effect) {
    case "recoverHp":
        this._pokemonRecoveringData = {
            "type":"recoverHp",
            "pokemon":pokemon,
            "windowIndex":listWindow.index(),
            "recoverValue":effect.value,
            "finalValue":pokemon.hp() + effect.value,
            "valuePerFrame":1.2*effect.value / effect.percentValue
        }
        break;
    case "cureStatus":
        this._pokemonRecoveringData = {
            "type":"cureStatus",
            "pokemon":pokemon,
            "windowIndex":listWindow.index(),
            "statusCured":effect.status
        }
        break;
    case "increaseLevel":
        this._pokemonRecoveringData = {
            "type":"increaseLevel",
            "pokemon":pokemon,
            "windowIndex":listWindow.index()
        }
        break;
    }
}
Scene_Base.prototype.PokemonMZ_updatePokemonRecover = function(listWindow, messageWindow) {
    // Pokemon is recovering in menu due to potion
    const pokemon = this._pokemonRecoveringData.pokemon;
    if (pokemon) {
        const recoveredValue = this._pokemonRecoveringData.recoverValue;
        
        let newHp = pokemon.hp() + this._pokemonRecoveringData.valuePerFrame;
        if (newHp >= this._pokemonRecoveringData.finalValue) {
            newHp = this._pokemonRecoveringData.finalValue;
            pokemon.setHp(newHp);
            listWindow.clearItem(this._pokemonRecoveringData.windowIndex);
            listWindow.drawItem(this._pokemonRecoveringData.windowIndex);
            this._mustReturnToItemMenu = true;
            this._pokemonRecoveringData = null;

            const message = pokemon.name() + " recovered by " + String(recoveredValue) + ".";
            listWindow.deactivate();
            messageWindow.setText(message);
            messageWindow.startMessage();

            return true; // Must return to menu/battle
        } else {
            pokemon.setHp(newHp);
            listWindow.drawItem(this._pokemonRecoveringData.windowIndex);
            return false;
        }
    }
}
Scene_Base.prototype.PokemonMZ_updatePokemonCureStatus = function(listWindow, messageWindow) { 
    // Pokemon is curing status
    const pokemon = this._pokemonRecoveringData.pokemon;
    const status = this._pokemonRecoveringData.statusCured;

    if (pokemon) {
        let message = "";

        switch(status) {
        case "poison":
            pokemon.unpoison();
            message = pokemon.name() + " was cured of poison!";
            break;
        case "burn":
            pokemon.unburn();
            message = pokemon.name() + "'s burn was healed!'";
            break;
        case "paralysis":
            pokemon.unparalyze();
            message = pokemon.name() + "'s rid of paralysis!'";
            break;
        case "freeze":
            pokemon.unfreeze();
            message = pokemon.name() + " was defrosted!";
            break;
        case "sleep":
            pokemon.unsleep();
            message = pokemon.name() + " woke up!";
            break;
        case "all":
            // Note: Gen2+ fullheal will also remove confusion
            pokemon.unpoison();
            pokemon.unburn();
            pokemon.unparalyze();
            pokemon.unfreeze();
            pokemon.unsleep();
            message = pokemon.name() + "'s health returned!";
            break;
        }

        listWindow.clearItem(this._pokemonRecoveringData.windowIndex);
        listWindow.drawItem(this._pokemonRecoveringData.windowIndex);
        this._pokemonRecoveringData = null;
        listWindow.deactivate();
        messageWindow.setText(message);
        messageWindow.startMessage();
        return true;
    }
};



// Scene_Boot
const PokemonMZ_Scene_Boot_create = Scene_Boot.prototype.create;
Scene_Boot.prototype.create = function() {
    // Add new data files
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataRegionMaps", src: "PokemonMZ_RegionMaps.json" });
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataPokemon", src: "PokemonMZ_Pokemon.json" });
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataMoves", src: "PokemonMZ_Moves.json" });
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataTypes", src: "PokemonMZ_Types.json" });
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataItems", src: "PokemonMZ_Items.json" });
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataEncounters", src: "PokemonMZ_Encounters.json" });
    DataManager._databaseFiles.push({ name: "$PokemonMZ_dataAnimationsList", src: "PokemonMZ_Animations.json" });
    PokemonMZ_Scene_Boot_create.call(this);
};
const PokemonMZ_Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function() {
    PokemonMZ_Scene_Boot_onDatabaseLoaded.call(this);
    DataManager.enhanceItems();
    DataManager.enhanceEnemies();
    DataManager.enhanceSkills();
    DataManager.enhanceTypes();
    DataManager.enhanceTroops();
    DataManager.enhanceAnimations();
};

// Scene_Title
Scene_Title.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._hasContinue = DataManager.isAnySavefileExists();
    if (this._hasContinue === true) {
        // Load save to prepare continue screen
        DataManager.loadGlobalInfo();
        DataManager.loadGame(1);
    }
};
Scene_Title.prototype.continueHeight = function() {
    return 200;
};
Scene_Title.prototype.createCommandWindow = function() {
    const background = $dataSystem.titleCommandWindow.background;
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_TitleCommand(rect, this.continueHeight());
    this._commandWindow.setBackgroundType(background);
    this._commandWindow.setHandler("continue", this.commandContinue.bind(this));
    this._commandWindow.setHandler("newGame", this.commandNewGame.bind(this));
    this._commandWindow.setHandler("options", this.commandOptions.bind(this));
    this._commandWindow.setHandler("exit", this.commandExit.bind(this));
    this.addWindow(this._commandWindow);
};
Scene_Title.prototype.commandWindowRect = function() {
    const ww = this.calculateWindowWidth();
    const wh = this.calculateWindowHeight();
    const wx = 50;
    const wy = Graphics.boxHeight - 32 - wh;
    return new Rectangle(wx, wy, ww, wh);
};
Scene_Title.prototype.calculateWindowWidth = function() {
    return 500;
};
Scene_Title.prototype.calculateWindowHeight = function() {
    if (this._hasContinue) {
        return this.calcWindowHeight(3, true) + this.continueHeight();
    } else {
        return this.calcWindowHeight(3, true);
    }
};
Scene_Title.prototype.commandContinue = function() {
    Scene_Load.prototype.executeLoad.call(this, 1);
};
Scene_Title.prototype.commandExit = function() {
    this.fadeOutAll()
    SceneManager.exit()
};
Scene_Title.prototype.executeLoad = function(savefileId) {
    Scene_Load.prototype.executeLoad.call(this, savefileId);
};
Scene_Title.prototype.commandContinue = function() {
    Scene_Load.prototype.executeLoad.call(this, 1);
};
Scene_Title.prototype.onLoadSuccess = function() {
    Scene_Load.prototype.onLoadSuccess.call(this, 1);
    $gamePlayerTrainer.reloadAllPokemonData();
    $gameSystem.onAfterLoad();
};
Scene_Title.prototype.reloadMapIfUpdated = function() {
    Scene_Load.prototype.reloadMapIfUpdated.call(this);
};
Scene_Title.prototype.onLoadFailure = function() {
    SoundManager.playBuzzer();
};


// Scene_Options
Scene_Options.prototype.maxCommands = function() {
    // Increase this value when adding option items.
    return 7;
};


// Scene Map
Scene_Map.prototype.callMenu = function() {
    SoundManager.playOk();
    SceneManager.push(PokemonMZ_Scene_Menu);
    Window_MenuCommand.initCommandPosition();
    $gameTemp.clearDestination();
    this._mapNameWindow.hide();
    this._waitCount = 2;
};
Scene_Map.prototype.update = function() {
    Scene_Message.prototype.update.call(this);
    $gameTemp._fromEvolution = false;
    this.updateDestination();
    this.updateMenuButton();
    this.updateMapNameWindow();
    this.updateMainMultiply();
    if (this.isSceneChangeOk()) {
        this.updateScene();
    } else if (SceneManager.isNextScene(PokemonMZ_Scene_Battle)) {
        this.updateEncounterEffect();
    }
    this.updateWaitCount();
};
Scene_Map.prototype.stop = function() {
    Scene_Message.prototype.stop.call(this);
    $gamePlayer.straighten();
    this._mapNameWindow.close();
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else if (SceneManager.isNextScene(Scene_Map)) {
        this.fadeOutForTransfer();
    } else if (SceneManager.isNextScene(PokemonMZ_Scene_Battle)) {
        this.launchBattle();
    }
};
Scene_Map.prototype.terminate = function() {
    Scene_Message.prototype.terminate.call(this);
    if (!SceneManager.isNextScene(PokemonMZ_Scene_Battle)) {
        this._spriteset.update();
        this._mapNameWindow.hide();
        this.hideMenuButton();
        SceneManager.snapForBackground();
    }
    $gameScreen.clearZoom();
};
Scene_Map.prototype.needsFadeIn = function() {
    return (
        SceneManager.isPreviousScene(PokemonMZ_Scene_Battle) ||
        SceneManager.isPreviousScene(PokemonMZ_Scene_Evolutions) ||
        SceneManager.isPreviousScene(Scene_Load)
    );
};
Scene_Map.prototype.updateEncounter = function() {
    if ($gamePlayer.executeEncounter()) {
        SceneManager.push(PokemonMZ_Scene_Battle);
    }
};
Scene_Map.prototype.launchBattle = function() {
    PokemonMZ_BattleManager.saveBgmAndBgs();
    this.stopAudioOnBattleStart();
    SoundManager.playBattleStart();
    this.startEncounterEffect();
    this._mapNameWindow.hide();
};

// Scene_Save
Scene_Save.prototype.isSavefileEnabled = function(savefileId) {
    return true;
};


// PokemonMZ_Scene_Menu
// The scene class of the menu screen. Herited from RPG Maker MZ default menu.
function PokemonMZ_Scene_Menu() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Menu.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_Menu.prototype.constructor = PokemonMZ_Scene_Menu;
PokemonMZ_Scene_Menu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};
PokemonMZ_Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createSaveMessageWindow();
    this.createSaveConfirmWindow();
};
PokemonMZ_Scene_Menu.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    const commandWindow = new PokemonMZ_Window_MenuCommand(rect);
    commandWindow.setHandler("pokedex", this.commandPokedex.bind(this));
    commandWindow.setHandler("pokemon", this.commandPokemon.bind(this));
    commandWindow.setHandler("item", this.commandItem.bind(this));
    commandWindow.setHandler("player", this.commandPlayer.bind(this));
    commandWindow.setHandler("save", this.commandSave.bind(this));
    commandWindow.setHandler("options", this.commandOptions.bind(this));
    commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
    commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(commandWindow);
    this._commandWindow = commandWindow;
};
PokemonMZ_Scene_Menu.prototype.createSaveMessageWindow = function() {
    const rect = this.createSaveMessageWindowRect()
    const saveMessageWindow = new PokemonMZ_Window_SaveMessage(rect)
    this.addWindow(saveMessageWindow);
    this._saveMessageWindow = saveMessageWindow;
};
PokemonMZ_Scene_Menu.prototype.createSaveConfirmWindow = function() {
    const rect = this.createSaveConfirmWindowRect()
    const saveConfirmWindow = new PokemonMZ_Window_SaveConfirm(rect)
    saveConfirmWindow.setHandler("saveYes", this.commandSaveYes.bind(this));
    saveConfirmWindow.setHandler("saveNo", this.commandSaveNo.bind(this));
    saveConfirmWindow.setHandler("cancel", this.commandSaveNo.bind(this));
    this.addWindow(saveConfirmWindow);
    this._saveConfirmWindow = saveConfirmWindow;
};
PokemonMZ_Scene_Menu.prototype.commandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.mainAreaHeight();
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Menu.prototype.createSaveMessageWindowRect = function() {
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Menu.prototype.createSaveConfirmWindowRect = function() {
    const ww = this.mainCommandWidth()
    const wh = this.calcWindowHeight(2, true);
    const wx = 0;
    const wy = Graphics.boxHeight - wh - this.calcWindowHeight(4, false) - 8;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Menu.prototype.commandPokedex = function() {
    SceneManager.push(PokemonMZ_Scene_Pokedex_Gen1);
    SceneManager.prepareNextScene($gamePlayerTrainer.pokedexRegion());
};
PokemonMZ_Scene_Menu.prototype.commandPokemon = function() {
    SceneManager.push(PokemonMZ_Scene_PokemonMenu);
};
PokemonMZ_Scene_Menu.prototype.commandItem = function() {
    switch (PokemonMZ.bagMechanicsGeneration) {
    case 1:
        SceneManager.push(PokemonMZ_Scene_Item_Gen1);
        break;
    }
};
PokemonMZ_Scene_Menu.prototype.commandPlayer = function() {
    SceneManager.push(PokemonMZ_Scene_Player);
};
PokemonMZ_Scene_Menu.prototype.commandSave = function() {
    let saveMessage = "Would you like to save the game?"
    if (DataManager.savefileInfo(1)) {
        // Existing save, check internal player id
        const info = DataManager.savefileInfo(1);
        if (info.playerUid != $gamePlayerTrainer.uid()) {
            saveMessage = "Another player save already exists.\nAre you sure you want to overwrite that\ngame?"
        }
    }
    this._commandWindow.deactivate();
    this._saveMessageWindow.displayWithText(saveMessage)
    this._saveConfirmWindow.open();
    this._saveConfirmWindow.activate();
};
PokemonMZ_Scene_Menu.prototype.commandSaveYes = function() {
    Scene_Save.prototype.executeSave.call(this, 1);
    this._saveMessageWindow.close();
    this._saveConfirmWindow.close();
    this._commandWindow.activate();
};
PokemonMZ_Scene_Menu.prototype.commandSaveNo = function() {
    SoundManager.playCancel();
    this._saveMessageWindow.close();
    this._saveConfirmWindow.close();
    this._commandWindow.activate();
};
PokemonMZ_Scene_Menu.prototype.onSaveFailure = function() {
    SoundManager.playBuzzer();
};
PokemonMZ_Scene_Menu.prototype.onSaveSuccess = function() {
    SoundManager.playSave();
};
PokemonMZ_Scene_Menu.prototype.commandOptions = function() {
    SceneManager.push(Scene_Options);
};
PokemonMZ_Scene_Menu.prototype.commandGameEnd = function() {
    SceneManager.push(Scene_GameEnd);
};


// PokemonMZ_Scene_Pokedex
// The scene class for the pokedex - first generation
function PokemonMZ_Scene_Pokedex_Gen1() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Pokedex_Gen1.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_Pokedex_Gen1.prototype.constructor = PokemonMZ_Scene_Item_Gen1;
PokemonMZ_Scene_Pokedex_Gen1.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._region = "";
    this._pokedexContent = [];
    this._pokedexMaxNumber = 0;
    this._selectedPokemonStrId = "";
    this._selectedPokemonIndex = 0;
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.prepare = function(region) {
    this._region = region;

    for (const enemy of $dataEnemies) {
        if (!enemy) { continue; }
        if (!enemy.pkmz_data) { continue; }
        if (!enemy.pkmz_data.pokedex) { continue }

        let pokedexData = enemy.pkmz_data.pokedex;
        for (const pokedex of pokedexData) {
            const pokemonStrId = enemy.pkmz_data.id;
            if (pokedex.region == this._region) {
                if (pokedex.number > this._pokedexMaxNumber) {
                    this._pokedexMaxNumber = pokedex.number;
                }
                if ($gamePlayerTrainer.isPokemonSeen(pokemonStrId) || $gamePlayerTrainer.isPokemonCaptured(pokemonStrId)) {
                    this._pokedexContent[pokedex.number-1] = enemy.pkmz_data.id;
                }
            }
        }
    }
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createPokedexStatsWindow();
    this.createPokedexCommandWindow();
    this.createPokemonListWindow();
    this.createPokedexDataWindow();
    this.createPokedexAreaWindow();
    this.createPokedexUnknownAreaWindow();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.createPokemonListWindow = function() {
    const rect = this.pokemonListWindowRect();
    this._pokemonListWindow = new PokemonMZ_Window_Pokedex_Gen1_PokemonList(rect, false);
    this._pokemonListWindow.setContent(this._pokedexContent, this._pokedexMaxNumber);
    this._pokemonListWindow.setHandler("ok", this.onPokemonListOk.bind(this));
    this._pokemonListWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._pokemonListWindow);
    this._pokemonListWindow.activate();
    this._pokemonListWindow.smoothSelect(0);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.pokemonListWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.createPokedexStatsWindow = function() {
    const rect = this.pokedexStatsWindowRect();
    this._pokedexStatsWindow = new PokemonMZ_Window_Pokedex_Gen1_PokedexStats(rect, false);
    this.addWindow(this._pokedexStatsWindow);
    this._pokedexStatsWindow.refresh();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.pokedexStatsWindowRect = function() {
    const wy = this.mainAreaTop();
    const ww = this.mainCommandWidth();
    const wx = Graphics.boxWidth - ww;
    const wh = this.calcWindowHeight(5, false);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.createPokedexCommandWindow = function() {
    const rect = this.pokedexCommandWindowRect();
    this._pokedexCommandWindow = new PokemonMZ_Window_Pokedex_Gen1_PokedexCommand(rect, false);
    this._pokedexCommandWindow.openness = 0;
    this._pokedexCommandWindow.setHandler("ok", this.onPokedexCommandOk.bind(this));
    this._pokedexCommandWindow.setHandler("cancel", this.onPokedexCommandCancel.bind(this));
    this.addWindow(this._pokedexCommandWindow);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.pokedexCommandWindowRect = function() {
    const statsRect = this.pokedexStatsWindowRect();
    const wy = statsRect.y + statsRect.height;
    const ww = this.mainCommandWidth();
    const wh = Graphics.boxHeight - wy;
    const wx = Graphics.boxWidth - ww;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.createPokedexDataWindow = function() {
    const rect = this.pokedexDataWindowRect();
    this._pokedexDataWindow = new PokemonMZ_Window_Pokedex_Gen1_PokedexData(rect, false);
    this._pokedexDataWindow.setPokedexNumberPadding(this._pokedexMaxNumber);
    this._pokedexDataWindow.setPokedexRegion(this._region);
    this._pokedexDataWindow.setHandler("pageup", this.onPokedexDataPrevious.bind(this));
    this._pokedexDataWindow.setHandler("pagedown", this.onPokedexDataNext.bind(this));
    this._pokedexDataWindow.setHandler("ok", this.onPokedexDataCancel.bind(this));
    this._pokedexDataWindow.setHandler("cancel", this.onPokedexDataCancel.bind(this));
    this._pokedexDataWindow.hide();
    this.addWindow(this._pokedexDataWindow);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.pokedexDataWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.createPokedexAreaWindow = function() {
    const rect = this.pokedexAreaWindowRect();
    this._pokedexAreaWindow = new PokemonMZ_Window_RegionMap(rect,"pokedexArea");
    this._pokedexAreaWindow.setHandler("ok", this.onPokedexAreaCancel.bind(this));
    this._pokedexAreaWindow.setHandler("cancel", this.onPokedexAreaCancel.bind(this));
    this._pokedexAreaWindow.hide();
    this.addWindow(this._pokedexAreaWindow);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.pokedexAreaWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.createPokedexUnknownAreaWindow = function() {
    const rect = this.pokedexUnknownAreaWindowRect();
    this._pokedexUnknownAreaWindow = new PokemonMZ_Window_Pokedex_Gen1_UnknownArea(rect);
    this._pokedexUnknownAreaWindow.hide();
    this.addWindow(this._pokedexUnknownAreaWindow);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.pokedexUnknownAreaWindowRect = function() {
    const top = this.mainAreaTop();
    const ww = Graphics.boxWidth - 400;
    const wx = (Graphics.boxWidth - ww)/2;
    const wh = this.calcWindowHeight(1,true)
    const wy = top + (Graphics.boxHeight - top - wh) / 2
    return new Rectangle(wx,wy,ww,wh);
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokemonListOk = function() {
    const index = this._pokemonListWindow.index();
    const pokemonStrId = this._pokedexContent[index];
    if (pokemonStrId) {
        this._selectedPokemonStrId = pokemonStrId;
        this._selectedPokemonIndex = index;
        this._pokedexCommandWindow.open();
        this._pokedexCommandWindow.activate();
    } else {
        SoundManager.playBuzzer();
        this._pokemonListWindow.activate();
    }
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokedexCommandOk = function() {
    switch(this._pokedexCommandWindow.currentSymbol()) {
        case "data":
            this._pokedexCommandWindow.close();
            this._pokedexDataWindow.setPokemon(this._selectedPokemonStrId)
            this._pokedexDataWindow.show();
            this._pokedexDataWindow.activate();
            break;
        case "cry":
            AudioManager.playPokemonCry(this._selectedPokemonStrId);
            this._pokedexCommandWindow.activate();
            break;  
        case "area":
            this._pokedexCommandWindow.close();
            this._pokedexAreaWindow.setPokemon(this._selectedPokemonStrId)
            this._pokedexAreaWindow.show();
            this._pokedexAreaWindow.activate();
            if (this._pokedexAreaWindow.unknownAreaVisible()) {
                this._pokedexUnknownAreaWindow.show()
                this._pokedexUnknownAreaWindow.refresh()
            } else {
                this._pokedexUnknownAreaWindow.hide()
            }
            break;
    }
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokedexCommandCancel = function() {
    this._pokedexCommandWindow.close();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokedexDataCancel = function() {
    this._pokedexDataWindow.hide();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokedexDataPrevious = function() {
    const startIndex = this._selectedPokemonIndex;
    let pokemonStrId = null;

    // Start by going up
    for (let i=startIndex-1; i>=0; i--) {
        pokemonStrId = this._pokedexContent[i]
        if (pokemonStrId) {
            this.changeDataWindowPokemon(pokemonStrId, i)
            return;
        }
    }

    // If not found yet, start again from the end
    for (let i=this._pokedexContent.length-1; i>startIndex; i--) {
        pokemonStrId = this._pokedexContent[i]
        if (pokemonStrId) {
            this.changeDataWindowPokemon(pokemonStrId, i)
            return;
        }
    }

    // Nothing else
    SoundManager.playBuzzer();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokedexDataNext = function() {
    const startIndex = this._selectedPokemonIndex;
    let pokemonStrId = null;

    // Start by going down
    for (let i=startIndex+1; i<this._pokedexContent.length; i++) {
        pokemonStrId = this._pokedexContent[i]
        if (pokemonStrId) {
            this.changeDataWindowPokemon(pokemonStrId, i)
            return;
        }
    }

    // If not found yet, start again from the beginning
    for (let i=0; i<startIndex; i++) {
        pokemonStrId = this._pokedexContent[i]
        if (pokemonStrId) {
            this.changeDataWindowPokemon(pokemonStrId, i)
            return;
        }
    }

    // Nothing else
    SoundManager.playBuzzer();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.changeDataWindowPokemon = function(pokemonStrId, windowIntIndex) {
    this._selectedPokemonIndex = windowIntIndex;
    this._selectedPokemonStrId = pokemonStrId;
    this._pokemonListWindow.smoothSelect(windowIntIndex);
    this._pokedexDataWindow.setPokemon(pokemonStrId);
    this._pokedexDataWindow.activate();
};
PokemonMZ_Scene_Pokedex_Gen1.prototype.onPokedexAreaCancel = function() {
    this._pokedexAreaWindow.hide();
    this._pokedexUnknownAreaWindow.hide();
    this._pokemonListWindow.activate();
};



// PokemonMZ_Scene_Item_Gen1
// The scene class for the items - first generation mechanics
function PokemonMZ_Scene_Item_Gen1() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Item_Gen1.prototype = Object.create(Scene_ItemBase.prototype);
PokemonMZ_Scene_Item_Gen1.prototype.constructor = PokemonMZ_Scene_Item_Gen1;
PokemonMZ_Scene_Item_Gen1.prototype.initialize = function() {
    Scene_ItemBase.prototype.initialize.call(this);
    this._itemSelectMode = '';
    this._usingTm = false;
};
PokemonMZ_Scene_Item_Gen1.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createItemWindow();
    this.createHelpWindow();
    this.createItemSelectWindow();
    this.createItemNumberWindow();
    this.createMessageWindow();
    this.createYesNoWindow();
};
PokemonMZ_Scene_Item_Gen1.prototype.createItemWindow = function() {
    const rect = this.itemWindowRect();
    this._itemWindow = new PokemonMZ_Window_ItemList_Gen1(rect, false);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.popScene.bind(this));
    this._itemWindow.activate();
    this.addWindow(this._itemWindow);
};
PokemonMZ_Scene_Item_Gen1.prototype.createMessageWindow = function() {
    const rect = this.messageWindowRect();
    this._messageWindow = new PokemonMZ_Window_MenuPokemonMessage(rect);
    this._messageWindow.setHandler("messageTerminated", this.onMessageTerminated.bind(this))
    this._messageWindow.setHandler("messageDisplayed", this.onMessageDisplayed.bind(this))
    this.addWindow(this._messageWindow);
};
PokemonMZ_Scene_Item_Gen1.prototype.messageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Item_Gen1.prototype.item = function() {
    return this._itemWindow.item();
};
PokemonMZ_Scene_Item_Gen1.prototype.itemWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaBottom() - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Item_Gen1.prototype.createItemSelectWindow = function() {
    const rect = this.itemSelectWindowRect();
    this._itemSelectWindow = new PokemonMZ_Window_ItemListCommand_Gen1(rect);
    this._itemSelectWindow.setHandler("use", this.onItemSelectUse.bind(this));
    this._itemSelectWindow.setHandler("toss", this.onItemSelectToss.bind(this));
    this._itemSelectWindow.setHandler("cancel", this.onItemSelectCancel.bind(this));
    this.addWindow(this._itemSelectWindow);
};
PokemonMZ_Scene_Item_Gen1.prototype.itemSelectWindowRect = function() {
    const wx = 0;
    const wy = 0
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Item_Gen1.prototype.createItemNumberWindow = function() {
    this._numberWindow = new PokemonMZ_Window_ComputerItemsNumber();
    this._numberWindow.setHandler("numberOk", this.onItemNumberOk.bind(this));
    this._numberWindow.setHandler("numberCancel", this.onItemNumberCancel.bind(this));
    this.addWindow(this._numberWindow);
};
PokemonMZ_Scene_Item_Gen1.prototype.createYesNoWindow = function() {
    const rect = this.yesNoWindowRect();
    this._yesNoWindow = new PokemonMZ_BattleYesNoWindow(rect);
    this._yesNoWindow.setHandler("yes", this.commandYes.bind(this));
    this._yesNoWindow.setHandler("no", this.commandNo.bind(this));
    this._yesNoWindow.openness = 0;
    this.addWindow(this._yesNoWindow);
};
PokemonMZ_Scene_Item_Gen1.prototype.yesNoWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    const wx = Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - this._messageWindow.height - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Item_Gen1.prototype.onItemOk = function() {
    const item = this.item();
    if (item) {
        this._itemWindow.deactivate();
        const rect = this._itemWindow.itemRect(this._itemWindow.index());
        const newX = this._itemWindow.x + rect.x + rect.width - this._itemSelectWindow.width;
        const newY = this._itemWindow.y + rect.y + rect.height + this._itemSelectWindow.itemPadding();
        if (newY > this._itemWindow.y + this._itemWindow.height) {
            newY = this._itemWindow.y + rect.y - this._itemSelectWindow.height - this._itemSelectWindow.itemPadding();
        }
        this._itemSelectWindow.setItem(item);
        this._itemSelectWindow.refresh();
        this._itemSelectWindow.setLocation(newX, newY);
        this._itemSelectWindow.open();
        this._itemSelectWindow.activate();
    } else {
        SoundManager.playBuzzer();
        this._itemWindow.activate();
    }
};
PokemonMZ_Scene_Item_Gen1.prototype.onItemSelectUse = function() {
    const itemDict = this.item();
    
    switch(itemDict.pkmz_data.effect) {
        case "lockedItem":
            this._messageWindow.setText(itemDict.pkmz_data.useMessage);
            this._messageWindow.startMessage();
            break;
        case "townMap":
            this._itemSelectWindow.close();
            this._itemWindow.activate();
            SceneManager.push(PokemonMZ_Scene_RegionMap);
            break;
        case "ball":
            this._messageWindow.setText("This isn't the time to use that!");
            this._messageWindow.startMessage();
            break;
        case "tm":
            const moveStrId = itemDict.pkmz_data.move;
            let tmName = "????"
            if (moveStrId) {
                const moveIntId = $dataSkillsIndex[moveStrId];
                tmName = $dataSkills[moveIntId].name;
            }
            this._usingTm = true;
            this._itemSelectWindow.close();
            this._messageWindow.setText("Booted up a TM!\nIt contained " + tmName + "!\nTeach " + tmName + " to a Pokémon?");
            this._messageWindow.startMessage();
            break;
        case "escapeRope":
            if ($gameMap.PokemonMZ_isRopeEscapable()) {
                $gamePlayerTrainer.gainBagItem(itemDict.id, -1);
                SceneManager.pop();
                SceneManager.pop();
                $gameMap.PokemonMZ_useEscapeRope();
            } else {
                this._messageWindow.setText("This isn't the time to use that!");
                this._messageWindow.startMessage();
            }
            break;
        default:
            // Open Pokemon menu
            SceneManager.push(PokemonMZ_Scene_PokemonMenu);
            SceneManager.prepareNextScene(itemDict);
    }

};
PokemonMZ_Scene_Item_Gen1.prototype.onMessageDisplayed = function() {
    if (this._usingTm) {
        this._messageWindow.deactivate();
        this._yesNoWindow.setMode("useTm");
        this._yesNoWindow.open();
        this._yesNoWindow.activate();
    }
};
PokemonMZ_Scene_Item_Gen1.prototype.onMessageTerminated = function() {
    this._itemSelectWindow.close();
    this._itemSelectWindow.deactivate();
    this._itemWindow.activate();

};
PokemonMZ_Scene_Item_Gen1.prototype.onItemSelectToss = function() {
    const itemDict = this.item();

     // Protected items are not tossable
    if (itemDict.pkmz_data.category == "key") {
        this._messageWindow.setText("That's too important to toss!");
        this._messageWindow.startMessage();
    } else {
        this._itemSelectMode = 'toss';
        const itemCount = $gamePlayerTrainer.numBagItems(itemDict.id);
        
        this._numberWindow.setMinValue(0);
        this._numberWindow.setMaxValue(itemCount);
        this._numberWindow.setInitialValue(itemCount);
        this._numberWindow.refreshSize();
        let newX = this._itemSelectWindow.x - this._numberWindow.width;
        if (newX < 0) {
            newX = this._itemSelectWindow.x + this._itemSelectWindow.width;
        }
        const newY = this._itemSelectWindow.y;
        
        this._numberWindow.setLocation(newX, newY);
        this._numberWindow.start();
    }
};
PokemonMZ_Scene_Item_Gen1.prototype.onItemSelectCancel = function() {
    this._itemSelectWindow.close();
    this._itemWindow.activate();
};
PokemonMZ_Scene_Item_Gen1.prototype.onItemNumberOk = function() {
    const item = this.item();
    const amount = this._numberWindow.getValue();
    switch (this._itemSelectMode) {
    case 'toss':
        $gamePlayerTrainer.gainBagItem(item.id, -amount);
    }
    this._numberWindow.close();
    this._itemSelectWindow.close();
    this._itemWindow.refresh();
    if (this._itemWindow._data.length > 0) {
        this._itemWindow.activate();
    } else {
        this.popScene();
    }
};
PokemonMZ_Scene_Item_Gen1.prototype.onItemNumberCancel = function() {
    this._numberWindow.close();
    this._itemSelectWindow.activate();
};
PokemonMZ_Scene_Item_Gen1.prototype.commandYes = function() {
    const itemDict = this.item();
    SceneManager.push(PokemonMZ_Scene_PokemonMenu);
    SceneManager.prepareNextScene(itemDict);
};
PokemonMZ_Scene_Item_Gen1.prototype.commandNo = function() {
    this._usingTm = false;
    this._yesNoWindow.close();
    this._yesNoWindow.deactivate();
    this._messageWindow.activate();
    this._messageWindow.pause = false;
    this._messageWindow.terminateMessage();

    this.onMessageTerminated()

};



// PokemonMZ_Scene_Player
// The scene class of the player status screen
function PokemonMZ_Scene_Player() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Player.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_Player.prototype.constructor = PokemonMZ_Scene_Player;
PokemonMZ_Scene_Player.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};
PokemonMZ_Scene_Player.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createProfileWindow();
    this.createBadgesWindow();
};
PokemonMZ_Scene_Player.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    this._profileWindow.refresh();
};
PokemonMZ_Scene_Player.prototype.createProfileWindow = function() {
    const rect = this.profileWindowRect();
    this._profileWindow = new PokemonMZ_Window_PlayerProfile(rect);
    this._profileWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._profileWindow);
};
PokemonMZ_Scene_Player.prototype.profileWindowRect = function() {
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight / 2 - wy;
    const wx = 0;

    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Player.prototype.createBadgesWindow = function() {
    const rect = this.badgesWindowRect();
    this._badgesWindow = new PokemonMZ_Window_PlayerBadges(rect);
    this._badgesWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._badgesWindow);
};
PokemonMZ_Scene_Player.prototype.badgesWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight / 2;
    const wx = 0;
    const wy = Graphics.boxHeight / 2;
    return new Rectangle(wx, wy, ww, wh);
};

// PokemonMZ_Scene_ComputerItems
// The scene class of the player computer
function PokemonMZ_Scene_ComputerItems() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_ComputerItems.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_ComputerItems.prototype.constructor = PokemonMZ_Scene_ComputerItems;
PokemonMZ_Scene_ComputerItems.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};
PokemonMZ_Scene_ComputerItems.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createItemListWindow();
    this.createItemNumberWindow();
};
PokemonMZ_Scene_ComputerItems.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    const commandWindow = new PokemonMZ_Window_ComputerItemsMenu(rect);
    commandWindow.setHandler("withdraw", this.commandWithdraw.bind(this));
    commandWindow.setHandler("deposit", this.commandDeposit.bind(this));
    commandWindow.setHandler("toss", this.commandToss.bind(this));
    commandWindow.setHandler("logoff", this.popScene.bind(this));
    commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(commandWindow);
    this._commandWindow = commandWindow;
};
PokemonMZ_Scene_ComputerItems.prototype.commandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.mainAreaHeight();
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerItems.prototype.createItemListWindow = function() {
    const rect = this.itemListWindowRect();
    const itemWindow = new PokemonMZ_Window_ComputerItemsList(rect);
    itemWindow.setHandler("ok", this.onItemOk.bind(this));
    itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(itemWindow);
    this._itemWindow = itemWindow;
};
PokemonMZ_Scene_ComputerItems.prototype.itemListWindowRect = function() {
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this.mainAreaHeight();
    const wx = 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerItems.prototype.createItemNumberWindow = function() {
    this._numberWindow = new PokemonMZ_Window_ComputerItemsNumber();
    this._numberWindow.setHandler("numberOk", this.onItemNumberOk.bind(this));
    this.addWindow(this._numberWindow);
};
PokemonMZ_Scene_ComputerItems.prototype.commandWithdraw = function() {
    this._itemWindow.setMode("withdraw");
    this._itemWindow.open();
    this._itemWindow.activate();
};
PokemonMZ_Scene_ComputerItems.prototype.commandDeposit = function() {
    this._itemWindow.setMode("deposit");
    this._itemWindow.open();
    this._itemWindow.activate();
};
PokemonMZ_Scene_ComputerItems.prototype.commandToss = function() {
    this._itemWindow.setMode("toss");
    this._itemWindow.open();
    this._itemWindow.activate();
};
PokemonMZ_Scene_ComputerItems.prototype.currentItemCount = function(item) {
    switch(this._itemWindow.mode()) {
    case "withdraw":
    case "toss":
        return $gamePlayerTrainer.numStoredItems(item.id) || 0;
    case "deposit":
        return $gamePlayerTrainer.numBagItems(item.id) || 0;
    }

}
PokemonMZ_Scene_ComputerItems.prototype.onItemOk = function() {
    const item = this._itemWindow.item();
    const itemCount = this.currentItemCount(item);
    
    // Ready number window if required
    const rect = this._itemWindow.itemRect(this._itemWindow.index());
    this._numberWindow.setMinValue(0);
    this._numberWindow.setMaxValue(itemCount);
    this._numberWindow.setInitialValue(itemCount);
    this._numberWindow.refreshSize();

    const newX = this._itemWindow.x + rect.x + rect.width - this._numberWindow.width;
    const newY = this._itemWindow.y + rect.y + rect.height + this._numberWindow.itemPadding();
    if (newY > this._itemWindow.y + this._itemWindow.height) {
        newY = this._itemWindow.y + rect.y - this._numberWindow.height - this._numberWindow.itemPadding();
    }
    this._numberWindow.setLocation(newX, newY);

    if (itemCount > 1) {
        this._numberWindow.start();
    } else {
        // No need for input number window for one item
        this._numberWindow.setValue(1);
        this.onItemNumberOk();
    }
};
PokemonMZ_Scene_ComputerItems.prototype.onItemNumberOk = function() {
    const item = this._itemWindow.item();
    const amount = this._numberWindow.getValue();

    switch(this._itemWindow.mode()) {
    case "withdraw":
        $gamePlayerTrainer.gainStoredItem(item.id, -amount)
        $gamePlayerTrainer.gainBagItem(item.id, amount)
        break;
    case "deposit":
        $gamePlayerTrainer.gainStoredItem(item.id, amount)
        $gamePlayerTrainer.gainBagItem(item.id, -amount)
        break;
    case "toss":
        $gamePlayerTrainer.gainStoredItem(item.id, -amount);
    };
    this._itemWindow.refresh();
    this._commandWindow.refresh();
    this._numberWindow.close();
    if (this._itemWindow._data.length > 0) {
        this._itemWindow.activate();
    } else {
        this.onItemCancel();
    }
};
PokemonMZ_Scene_ComputerItems.prototype.onItemCancel = function() {
    this._itemWindow.close();
    this._numberWindow.close();
    this._commandWindow.activate();
};


// PokemonMZ_Scene_ComputerItems
// The scene class of the pokemon computer
function PokemonMZ_Scene_ComputerPokemons() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_ComputerPokemons.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_ComputerPokemons.prototype.constructor = PokemonMZ_Scene_ComputerPokemons;
PokemonMZ_Scene_ComputerPokemons.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._mode = "";
    this._selectedPokemonIndex = 0;
};
PokemonMZ_Scene_ComputerPokemons.prototype.mainCommandWidth = function() {
    return 300;
};
PokemonMZ_Scene_ComputerPokemons.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createSelectedBoxWindow();
    this.createBoxListWindow();
    this.createPokemonListWindow();
    this.createPokemonCommandWindow();
    this.createPokemonStatusWindow();
    this.createReleaseConfirmWindow();
};
PokemonMZ_Scene_ComputerPokemons.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    const commandWindow = new PokemonMZ_Window_ComputerPokemonsMenu(rect);
    commandWindow.setHandler("withdraw", this.commandWithdraw.bind(this));
    commandWindow.setHandler("deposit", this.commandDeposit.bind(this));
    commandWindow.setHandler("release", this.commandRelease.bind(this));
    commandWindow.setHandler("changeBox", this.commandChangeBox.bind(this));
    commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(commandWindow);
    this._commandWindow = commandWindow;
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.mainAreaHeight() - this.calcWindowHeight(1,true);
    const wx = Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerPokemons.prototype.createSelectedBoxWindow = function() {
    const rect = this.selectedBoxWindowRect();
    const selectedBoxWindow = new PokemonMZ_Window_ComputerPokemonsSelectedBox(rect);
    this.addWindow(selectedBoxWindow);
    this._selectedBoxWindow = selectedBoxWindow;
};
PokemonMZ_Scene_ComputerPokemons.prototype.selectedBoxWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1,true);
    const wx = Graphics.boxWidth - ww;
    const wy = this.mainAreaTop() + this.mainAreaHeight() - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerPokemons.prototype.createBoxListWindow = function() {
    const rect = this.boxListWindowRect();
    const boxListWindow = new PokemonMZ_Window_ComputerPokemonsBoxList(rect);
    boxListWindow.setHandler("selectBox", this.commandSelectBox.bind(this));
    boxListWindow.setHandler("cancelBoxSelect", this.commandCancelBoxSelect.bind(this));
    boxListWindow.openness = 0;
    this.addWindow(boxListWindow);
    this._boxListWindow = boxListWindow;
};
PokemonMZ_Scene_ComputerPokemons.prototype.boxListWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.mainAreaHeight()
    const wx = Graphics.boxWidth - 2*ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerPokemons.prototype.createPokemonListWindow = function() {
    const rect = this.boxListWindowRect();
    const pokemonListWindow = new PokemonMZ_Window_ComputerPokemonsBoxPokemonList(rect);
    pokemonListWindow.setHandler("selectPokemon", this.commandSelectPokemon.bind(this));
    pokemonListWindow.setHandler("cancelPokemonSelect", this.commandCancelPokemonSelect.bind(this));
    pokemonListWindow.openness = 0;
    this.addWindow(pokemonListWindow);
    this._pokemonListWindow = pokemonListWindow;
};
PokemonMZ_Scene_ComputerPokemons.prototype.createPokemonCommandWindow = function() {
    const rect = this.commandPokemonWindowRect();
    const pokemonCommandWindow = new PokemonMZ_Window_ComputerPokemonsCommandPokemon(rect);
    pokemonCommandWindow.setHandler("commandPokemon", this.commandPokemon.bind(this));
    pokemonCommandWindow.setHandler("cancelPokemon", this.commandCancelPokemon.bind(this));
    pokemonCommandWindow.openness = 0;
    this.addWindow(pokemonCommandWindow);
    this._pokemonCommandWindow = pokemonCommandWindow;
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandPokemonWindowRect = function() {
    const ww = Graphics.boxWidth - 2*this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true)
    const wx = 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerPokemons.prototype.createPokemonStatusWindow = function() {
    const rect = this.createPokemonStatusWindowRect();
    const pokemonStatusWindow = new PokemonMZ_Window_MenuPokemonStatus(rect);
    pokemonStatusWindow.setHandler("ok", this.onCloseStatus.bind(this));
    pokemonStatusWindow.setHandler("cancel", this.onCloseStatus.bind(this));
    pokemonStatusWindow.openness = 0;
    this.addWindow(pokemonStatusWindow);
    this._pokemonStatusWindow = pokemonStatusWindow;

};
PokemonMZ_Scene_ComputerPokemons.prototype.createPokemonStatusWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerPokemons.prototype.createReleaseConfirmWindow = function() {
    const rect = this.createReleaseConfirmWindowRect();
    const releaseConfirmWindow = new PokemonMZ_Window_ComputerPokemonsRelease(rect);
    releaseConfirmWindow.setHandler("ok", this.commandConfirmRelease.bind(this));
    releaseConfirmWindow.setHandler("cancel", this.commandCancelRelease.bind(this));
    releaseConfirmWindow.openness = 0;
    this.addWindow(releaseConfirmWindow);
    this._releaseConfirmWindow = releaseConfirmWindow;
};
PokemonMZ_Scene_ComputerPokemons.prototype.createReleaseConfirmWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop() + this.calcWindowHeight(2, true);
    const ww = Graphics.boxWidth - 2*this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandWithdraw = function() {
    const mode = "withdraw";
    this._mode = mode;
    this._pokemonCommandWindow.setMode(mode);
    this._pokemonCommandWindow.refresh();
    this._pokemonListWindow.setMode(mode);
    this._pokemonListWindow.refresh();
    this._pokemonListWindow.select(0);
    this._pokemonListWindow.open();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandDeposit = function() {
    const mode = "deposit";
    this._mode = mode;
    this._pokemonCommandWindow.setMode(mode);
    this._pokemonCommandWindow.refresh();
    this._pokemonListWindow.setMode(mode);
    this._pokemonListWindow.refresh();
    this._pokemonListWindow.select(0);
    this._pokemonListWindow.open();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandRelease = function() {
    const mode = "release";
    this._mode = mode;
    this._pokemonCommandWindow.setMode(mode);
    this._pokemonCommandWindow.refresh();
    this._pokemonListWindow.setMode(mode);
    this._pokemonListWindow.refresh();
    this._pokemonListWindow.select(0);
    this._pokemonListWindow.open();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandChangeBox = function() { 
    this._commandWindow.deactivate();
    this._boxListWindow.refresh();
    this._boxListWindow.open();
    this._boxListWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandSelectBox = function() {
    $gamePlayerTrainer.setSelectedBox(this._boxListWindow.index());
    this._commandWindow.refresh();
    this._boxListWindow.deactivate()
    this._boxListWindow.close();
    this._commandWindow.activate();
    this._selectedBoxWindow.refresh();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandCancelBoxSelect = function() {
    this._boxListWindow.deactivate()
    this._boxListWindow.close();
    this._commandWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandSelectPokemon = function() {
    this._selectedPokemonIndex = Number(this._pokemonListWindow.currentSymbol())
    this._pokemonCommandWindow.open();
    this._pokemonCommandWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandCancelPokemonSelect = function() {
    this._mode = "";
    this._pokemonListWindow.close();
    this._commandWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandPokemon = function() {
    const choice = this._pokemonCommandWindow.currentSymbol();
    switch(choice) {
        case "withdraw":
            this.withdrawPokemon();
            break;
        case "deposit":
            this.depositPokemon();
            break;
        case "release":
            this._releaseConfirmWindow.open();
            this._releaseConfirmWindow.activate();
            break;
        case "stats":
            this.displayStats();
            break;
    }

};
PokemonMZ_Scene_ComputerPokemons.prototype.displayStats = function() {
    const pokemon = this.selectedPokemon();
    this._pokemonStatusWindow.setPokemon(pokemon);
    AudioManager.playPokemonCry(pokemon.id());
    this._pokemonStatusWindow.open();
    this._pokemonStatusWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.depositPokemon = function() {
    const pokemon = this.selectedPokemon();
    const depositedPokemon = new PokemonMZ_Game_Pokemon(pokemon.intEnemyId(), pokemon.level());
    depositedPokemon.cloneFromPokemon(pokemon);
    $gamePlayerTrainer.addPokemonToCurrentBox(pokemon);
    $gamePlayerTrainer.removePokemonAtIndex(this._selectedPokemonIndex);
    this.refreshWindowsAfterAction();
};
PokemonMZ_Scene_ComputerPokemons.prototype.withdrawPokemon = function() {
    const pokemon = this.selectedPokemon();
    const withdrawnPokemon = new PokemonMZ_Game_Pokemon(pokemon.intEnemyId(), pokemon.level());
    withdrawnPokemon.cloneFromPokemon(pokemon);
    $gamePlayerTrainer.addPokemonToParty(pokemon);
    $gamePlayerTrainer.removePokemonFromCurrentBoxAtIndex(this._selectedPokemonIndex);
    this.refreshWindowsAfterAction();
};
PokemonMZ_Scene_ComputerPokemons.prototype.releasePokemon = function() {
    const pokemon = this.selectedPokemon();
    $gamePlayerTrainer.removePokemonFromCurrentBoxAtIndex(this._selectedPokemonIndex);
    this.refreshWindowsAfterAction();
};
PokemonMZ_Scene_ComputerPokemons.prototype.refreshWindowsAfterAction = function() {
    this._releaseConfirmWindow.close();
    this._pokemonCommandWindow.close();
    this._pokemonListWindow.close();
    this._commandWindow.refresh();
    this._commandWindow.activate();
    this._pokemonListWindow.refresh();
    this._selectedBoxWindow.refresh();
};
PokemonMZ_Scene_ComputerPokemons.prototype.onCloseStatus = function() {
    this._pokemonStatusWindow.close();
    this._pokemonCommandWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandCancelPokemon = function() {
    this._pokemonCommandWindow.close();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandConfirmRelease = function() {
    this.releasePokemon();
};
PokemonMZ_Scene_ComputerPokemons.prototype.commandCancelRelease = function() {
    this._releaseConfirmWindow.close();
    this._pokemonCommandWindow.activate();
};
PokemonMZ_Scene_ComputerPokemons.prototype.selectedPokemon = function() {
    switch (this._mode) {
        case "withdraw":
        case "release":
            return $gamePlayerTrainer.currentBoxPokemon(this._selectedPokemonIndex);
        case "deposit":
            return $gamePlayerTrainer.pokemon(this._selectedPokemonIndex);
    }
};


// PokemonMZ_Scene_RegionMap
// The scene class of the region map item
function PokemonMZ_Scene_RegionMap() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_RegionMap.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_RegionMap.prototype.constructor = PokemonMZ_Scene_RegionMap;
PokemonMZ_Scene_RegionMap.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._regionData = null;
    this._regionPoiData = null;
};
PokemonMZ_Scene_RegionMap.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHelpWindow();
    this.createMainWindow();
};
PokemonMZ_Scene_RegionMap.prototype.createMainWindow = function() {
    const rect = this.mainWindowRect();
    this._mainWindow = new PokemonMZ_Window_RegionMap(rect, "playerMap");
    this._mainWindow.setHandler("cancel", this.popScene.bind(this));
    this._mainWindow.setHelpWindow(this._helpWindow);
    this.addWindow(this._mainWindow);
    this._mainWindow.activate();
};
PokemonMZ_Scene_RegionMap.prototype.mainWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight(); 
    const wx = 0;
    const wy = this.mainAreaBottom() - wh;
    return new Rectangle(wx, wy, ww, wh);
};

// PokemonMZ_Scene_PokemonNickname
// The scene class to choose a Pokemon Nickname
function PokemonMZ_Scene_PokemonNickname() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_PokemonNickname.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_PokemonNickname.prototype.constructor = PokemonMZ_Scene_PokemonNickname;
PokemonMZ_Scene_PokemonNickname.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._pokemon = $gameTemp.pokemon;
    this._nicknameText = "Do you want to give a nickname to " + this._pokemon.name() + "?";
    this._maxLength = 16;
};
PokemonMZ_Scene_PokemonNickname.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this.addChild(this._backgroundSprite);
    this.setBackgroundOpacity(255);
};
PokemonMZ_Scene_PokemonNickname.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createChoiceListWindow();
    this.createMessageWindow();
    this.createEditWindow();
    this.createInputWindow();
    this.associateWindows();
    this._messageWindow.startMessage();
};
PokemonMZ_Scene_PokemonNickname.prototype.associateWindows = function() {
    this._messageWindow.setChoiceListWindow(this._choiceListWindow);
    this._choiceListWindow.setMessageWindow(this._messageWindow);
};
PokemonMZ_Scene_PokemonNickname.prototype.createChoiceListWindow = function() {
    this._choiceListWindow = new PokemonMZ_Window_ChoiceList_PokemonNickname();
    this._choiceListWindow.setHandler("yes_nickname", this.wantsNickname.bind(this));
    this._choiceListWindow.setHandler("no_nickname", this.refuseNickname.bind(this));
    this.addWindow(this._choiceListWindow);
};
PokemonMZ_Scene_PokemonNickname.prototype.createMessageWindow = function() {
    const rect = this.messageWindowRect();
    this._messageWindow = new PokemonMZ_Window_Message_PokemonNickname(rect);
    this._messageWindow.setText(this._nicknameText);
    this.addWindow(this._messageWindow);
};
PokemonMZ_Scene_PokemonNickname.prototype.messageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonNickname.prototype.createEditWindow = function() {
    const rect = this.editWindowRect();
    this._editWindow = new PokemonMZ_Window_PokemonNameEdit(rect);
    this._editWindow.setup(this._pokemon, this._maxLength);
    this._editWindow.openness = 0;
    this._editWindow.setHandler("gave_nickname", this.hasGivenNickname.bind(this));
    this.addWindow(this._editWindow);
};
PokemonMZ_Scene_PokemonNickname.prototype.editWindowRect = function() {
    const inputWindowHeight = this.calcWindowHeight(9, true);
    const padding = $gameSystem.windowPadding();
    const ww = 600;
    const wh = ImageManager.standardFaceHeight + padding * 2;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonNickname.prototype.createInputWindow = function() {
    const rect = this.inputWindowRect();
    this._inputWindow = new PokemonMZ_Window_NameInput(rect);
    this._inputWindow.setEditWindow(this._editWindow);
    this._inputWindow.openness = 0;
    this._inputWindow.setHandler("gave_nickname", this.hasGivenNickname.bind(this));
    this.addWindow(this._inputWindow);
};
PokemonMZ_Scene_PokemonNickname.prototype.inputWindowRect = function() {
    const wx = this._editWindow.x;
    const wy = this._editWindow.y + this._editWindow.height + 8;
    const ww = this._editWindow.width;
    const wh = this.calcWindowHeight(9, true);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonNickname.prototype.wantsNickname = function() {
    this._choiceListWindow.close();
    this._messageWindow.terminateMessage();
    this._inputWindow.open()
    this._editWindow.open()
    this._editWindow.refresh();
};
PokemonMZ_Scene_PokemonNickname.prototype.refuseNickname = function() {
    this._choiceListWindow.close();
    this._messageWindow.terminateMessage();
    this._messageWindow.close();
    $gamePlayerTrainer.givePokemonAfterNickname(this._pokemon);
    SceneManager.pop(this);
};
PokemonMZ_Scene_PokemonNickname.prototype.hasGivenNickname = function() {
    this._pokemon.setNickname(this._editWindow.name());
    $gamePlayerTrainer.givePokemonAfterNickname(this._pokemon);
    SceneManager.pop(this);
};


// PokemonMZ_Scene_PokemonMenu
// The scene class for the Pokemon Menu
function PokemonMZ_Scene_PokemonMenu() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_PokemonMenu.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_PokemonMenu.prototype.constructor = PokemonMZ_Scene_PokemonMenu;
PokemonMZ_Scene_PokemonMenu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._mustExit = false;
    this._evolutionItem = null;
    this._pokemon = $gamePlayerTrainer.firstPokemon();

    if ($gameTemp._fromEvolution)
    {
        // Return from evolution scene
        $gameTemp._fromEvolution = false;
        this._usedItem = $gameTemp._menuUsedItem;
        this._evolutionItem = $gameTemp._menuUsedEvolutionItem;
        this._forceIndex = $gameTemp._menuSelectedPokemonIndex;
        if ($gamePlayerTrainer.numBagItems(this._usedItem.id) <= 0 ) {
            this._mustExit = true;
        };
    }

    this._item = null;
    this._learnedMove = null;
    
    this._hasLearnedMove = null;
    this._hasLeveledUp = null;
    this._pokemonEvolvesTo = null;

    this._hasUsedRecoveryItem = null;
    this._hasUsedIncreaseLevelItem = null;
    this._hasUsedLearnMoveItem = null;
    this._hasUsedEvolutionItem = null;

    this._pokemonRecoveringData = null;
    this._mustReturnToItemMenu = false;
    this._afterTextPhase = "";
};
PokemonMZ_Scene_PokemonMenu.prototype.prepare = function(item) {
    this._usedItem = item;
    if (item.pkmz_data.effect == "tm") {
        const moveStrId = item.pkmz_data.move;
        const moveIntId = $dataSkillsIndex[moveStrId];
        this._learnedMove = $dataSkills[moveIntId];
    }
    if (item.pkmz_data.effect == "evolutionItem") {
        this._evolutionItem = item;
    }
}
PokemonMZ_Scene_PokemonMenu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    if (this._mustExit) {
        this._mustExit = false; 
        this.popScene(); 
    }
};

PokemonMZ_Scene_PokemonMenu.prototype.pokemon = function() {
    return this._pokemon;
};
PokemonMZ_Scene_PokemonMenu.prototype.usedItem = function() {
    return this._usedItem;
};
PokemonMZ_Scene_PokemonMenu.prototype.isUsingItem = function() {
    return this._usedItem != null;
};
PokemonMZ_Scene_PokemonMenu.prototype.isUsingEvolutionItem = function() {
    return this._evolutionItem != null;
};
PokemonMZ_Scene_PokemonMenu.prototype.isLearningMove = function() {
    return this._learnedMove != null;
};
PokemonMZ_Scene_PokemonMenu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createPokemonListWindow();
    this.createPokemonCommandWindow();
    this.createPokemonStatusWindow();
    this.createPokemonMessageWindow();
    this.createMoveWindow();
    this.createYesNoWindow();
    this.createPokemonLevelUpWindow();

    this._messageWindow.setPokemonListWindow(this._listWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.createPokemonListWindow = function() {
    const rect = this.pokemonListWindowRect();
    this._listWindow = new PokemonMZ_Window_MenuPokemonList(rect);
    this._listWindow.setHandler("ok", this.onSelectPokemon.bind(this));
    this._listWindow.setHandler("cancel", this.onCancelPokemon.bind(this));
    if (this._learnedMove) {
        this._listWindow.setLearningMove(this._learnedMove);
    }
    if (this._evolutionItem) {
        this._listWindow.setEvolutionItem(this._evolutionItem);
    }
    if (this._forceIndex) {
        this._listWindow._index = this._forceIndex;
        this._forceIndex = null;
    }
    this.addWindow(this._listWindow);
    this._listWindow.activate();
};
const PokemonMZ_Scene_MenuBase_update = Scene_MenuBase.prototype.update;
PokemonMZ_Scene_PokemonMenu.prototype.update = function() {
    PokemonMZ_Scene_MenuBase_update.call(this);
    this.PokemonMZ_updateItemEffects();
};
PokemonMZ_Scene_PokemonMenu.prototype.pokemonListWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.createPokemonCommandWindow = function() {
    const rect = this.pokemonCommandWindowRect();
    this._commandWindow = new PokemonMZ_Window_MenuPokemonCommand(rect, false);
    this._commandWindow.openness = 0;
    this._commandWindow.setHandler("ok", this.onSelectCommand.bind(this));
    this._commandWindow.setHandler("cancel", this.onCancelCommand.bind(this));
    this.addWindow(this._commandWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.pokemonCommandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true); // To change with gen2 if more items
    const wx = 0
    const wy = 0
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.createPokemonStatusWindow = function() {
    const rect = this.pokemonStatusWindowRect();
    this._statusWindow = new PokemonMZ_Window_MenuPokemonStatus(rect);
    this._statusWindow.openness = 0;
    this._statusWindow.setHandler("cancel", this.onCancelStatus.bind(this));
    this.addWindow(this._statusWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.pokemonStatusWindowRect = function() {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.createPokemonMessageWindow = function() {
    const rect = this.messageWindowRect();
    this._messageWindow = new PokemonMZ_Window_MenuPokemonMessage(rect);
    this._messageWindow.setHandler("messageTerminated", this.onMessageTerminated.bind(this))
    this._messageWindow.setHandler("messageDisplayed", this.onMessageDisplayed.bind(this))
    this.addWindow(this._messageWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.createMoveWindow = function() {
    const rect2 = this.forgetPokemonMovesWindowRect();
    this._forgetPokemonMovesWindow = new PokemonMZ_Window_PokemonForgetMoves(rect2);
    this._forgetPokemonMovesWindow.openness = 0;
    this._forgetPokemonMovesWindow.setHandler("ok", this.onSelectForgetPokemonMove.bind(this));
    this._forgetPokemonMovesWindow.setHandler("cancel", this.onCancelForgetPokemonMove.bind(this));
    this.addWindow(this._forgetPokemonMovesWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.forgetPokemonMovesWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(4, true);
    const wx = Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - this._messageWindow.height - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.createYesNoWindow = function() {
    const rect = this.yesNoWindowRect();
    this._yesNoWindow = new PokemonMZ_BattleYesNoWindow(rect);
    this._yesNoWindow.setHandler("yes", this.commandForgetYes.bind(this));
    this._yesNoWindow.setHandler("no", this.commandForgetNo.bind(this));
    this._yesNoWindow.openness = 0;
    this.addWindow(this._yesNoWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.yesNoWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    const wx = Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - this._messageWindow.height - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.messageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.createPokemonLevelUpWindow = function() {
    const rect = this.pokemonLevelUpWindowRect();
    this._pokemonLevelUpWindow = new PokemonMZ_PokemonLevelUpWindow(rect);
    this.addWindow(this._pokemonLevelUpWindow);
};
PokemonMZ_Scene_PokemonMenu.prototype.pokemonLevelUpWindowRect = function() {
    const ww = 200;
    const wh = this.calcWindowHeight(4, false);
    const wx = Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - 2*wh - 8;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_PokemonMenu.prototype.selectedPokemon = function() {
    return $gamePlayerTrainer.pokemon(this._listWindow.index());
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectPokemon = function() {
    if (this._listWindow.formationMode()) {
        this.onSelectPokemonSwitch();
    } else if (this.isLearningMove()) {
        this.onSelectPokemonLearn();
    } else if (this.isUsingEvolutionItem()) {
        this.onSelectPokemonEvolutionItem();
    } else if (this.isUsingItem()) {
        this.onSelectPokemonUse();
    } else {
        this.onSelectPokemonInfo();
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onCancelPokemon = function() {
    if (this._listWindow.formationMode()) {
        this._listWindow.select(this._listWindow.pendingIndex());
        this._listWindow.setFormationMode(false);
        this._listWindow.setPendingIndex(-1);
        this._listWindow.activate();
    } else {
        this.popScene();
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectPokemonInfo = function() {
    const pokemon = this.selectedPokemon();
    const rect = this._listWindow.itemRect(this._listWindow.index());
    const commandHeight = this._commandWindow.height;
    const newX = this._listWindow.x + rect.x + rect.width - this._commandWindow.width;
    let newY = this._listWindow.y + rect.y + rect.height + this._commandWindow.itemPadding();
    if (newY + commandHeight > this._listWindow.y + this._listWindow.height) {
        newY = this._listWindow.y + rect.y - commandHeight - this._commandWindow.itemPadding();
    }
    this._commandWindow.setLocation(newX, newY);
    this._commandWindow.open();
    this._commandWindow.activate();
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectPokemonUse = function() {
    const pokemon = this.selectedPokemon();
    const useResult = pokemon.canUseItemOn(this._usedItem);

    if (useResult.success) {
        //$gamePlayerTrainer.gainBagItem(this._usedItem.id, -1);
        const effect = pokemon.itemEffect(this._usedItem);
        this._hasUsedRecoveryItem = true;
        this.PokemonMZ_createRecoveryData(pokemon, effect, this._listWindow);
    } else {
        // Display message if there is one
        this._listWindow.deactivate();
        this._messageWindow.setText(useResult.message);
        this._messageWindow.startMessage();
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectPokemonLearn = function() {
    const moveName = this._learnedMove.name;
    const moveStrId = this._learnedMove.pkmz_data.id;
    const pokemon = this.selectedPokemon();
    const pokemonName = pokemon.name();

    if (pokemon.knowsMove(moveStrId)) {
        SoundManager.playBuzzer();
        this._listWindow.deactivate();
        this._messageWindow.setText(pokemonName + " knows " + moveName + "!");
        this._messageWindow.startMessage();
    } else if (!pokemon.canLearnMove(moveStrId)) {
        SoundManager.playBuzzer();
        this._listWindow.deactivate();
        this._messageWindow.setText(pokemonName + " is not compatible with " + moveName + ".\nIt can't learn " + moveName + ".");
        this._messageWindow.startMessage();
    } else {
        this._listWindow.deactivate();
        this._hasUsedLearnMoveItem = true;
        this.proceedLearningMove();
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectPokemonEvolutionItem = function() {
    const pokemon = this.selectedPokemon();
    const firstEvolution = pokemon.firstPossibleEvolution("useItem", this._evolutionItem.pkmz_data.id);

    if (firstEvolution != "") {
        $gamePlayerTrainer.gainBagItem(this._usedItem.id, -1);
        $gameTemp._menuUsedItem = this._usedItem;
        $gameTemp._menuUsedEvolutionItem = this._evolutionItem;
        $gameTemp._menuSelectedPokemonIndex = this._listWindow._index;
        SceneManager.push(PokemonMZ_Scene_Evolutions);
        SceneManager.prepareNextScene(
            [[pokemon, firstEvolution]], 
            AudioManager.saveBgm(),
            AudioManager.saveBgs()
        );
        this._listWindow.activate();
    } else {
        SoundManager.playBuzzer();
        this._listWindow.deactivate();
        this._messageWindow.setText("It won't have any effect.");
        this._messageWindow.startMessage();
    }
};

PokemonMZ_Scene_PokemonMenu.prototype.proceedLearningMove = function() {
    const pokemon = this.selectedPokemon();
    if (pokemon.moves().length < 4) {
        this.proceedLearningMoveInstant();
    } else {
        this.proceedLearningMoveAsk();
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.proceedLearningMoveInstant = function() {
    AudioManager.playStandardSe(PokemonMZ.learnMoveSE);
    const pokemon = this.selectedPokemon();
    const moveName = this._learnedMove.name;
    const moveStringId = this._learnedMove.pkmz_data.id;
    pokemon.learnMove(moveStringId);
    const message = pokemon.name() + " learned " + moveName + "!";
    this._hasLearnedMove = true;
    this._afterTextPhase = "";
    this._messageWindow.setText(message)
    this._messageWindow.startMessage();
};
PokemonMZ_Scene_PokemonMenu.prototype.proceedLearningMoveAsk = function() {
    const pokemon = this.selectedPokemon();
    const pokemonName = pokemon.name();
    const moveName = this._learnedMove.name;
    const moveStringId = this._learnedMove.pkmz_data.id;

    let message = pokemonName + " is trying to learn " +  moveName + "!";
    message += "\nBut, " + pokemonName + " can't learn more than 4 moves!";
    message += "\n\nDelete an older move to make room for " + moveName + "?";
    this._messageWindow.setText(message)
    this._messageWindow.startMessage();
    this._afterTextPhase = "yesNoLearnMove"
};
PokemonMZ_Scene_PokemonMenu.prototype.onMessageDisplayed = function() {
    switch (this._afterTextPhase) {
    case "yesNoLearnMove":
        this._afterTextPhase = "";
        this._messageWindow.deactivate();
        this._yesNoWindow.setMode("learnMove")
        this._yesNoWindow.open();
        this._yesNoWindow.activate();
        break;
    case "yesNoAbandonMove":
        this._afterTextPhase = "";
        this._messageWindow.deactivate();
        this._yesNoWindow.setMode("abandonMove")
        this._yesNoWindow.activate();
        this._yesNoWindow.select(0);
        this._yesNoWindow.open();
        break;
    case "selectForgottenMove":
        this._afterTextPhase = "";
        this._messageWindow.deactivate();
        this._forgetPokemonMovesWindow.show();
        this._forgetPokemonMovesWindow.open();
        this._forgetPokemonMovesWindow.activate();
        this._forgetPokemonMovesWindow.select(0);
        break;
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onMessageTerminated = function() {
    if (this._hasUsedIncreaseLevelItem) {
        this.onUsingLevelUp();
    } else if (this._hasUsedLearnMoveItem) {
        this.onUsingTmHm();
    } else if (this._hasUsedRecoveryItem) {
        this.afterUsingItem();
    } else {
        this._listWindow.activate();
    }
};

PokemonMZ_Scene_PokemonMenu.prototype.onUsingTmHm = function() {
    if (this._afterTextPhase == "forgotMove") {
        // Forgot a move
        this._afterTextPhase = "";
        this.finishReplacingMove();
    } else if (this._hasLearnedMove) {
        // Finished learning a move
        this.afterUsingItem(true);
    } else {
        // Didn't learn a move
        this._listWindow.activate();
    }
};

PokemonMZ_Scene_PokemonMenu.prototype.onUsingLevelUp = function() {
    if (this._afterTextPhase == "forgotMove") {
        // Forgot a move
        this._afterTextPhase = "";
        this.finishReplacingMove();
    } else if (this._afterTextPhase == "levelingUp" && (this._learnedMove)) {
        // Level up has a move learned
        this._afterTextPhase = "";
        this._pokemonLevelUpWindow.hide();
        this.proceedLearningMove();
    } else if (this._hasLearnedMove) {
        // After learning move
        this._hasLearnedMove = null;
        this._learnedMove = null;
        this.afterUsingItem(false);
    } else {
        // No move learned
        this._learnedMove = null;
        this._pokemonLevelUpWindow.hide();
        this.afterUsingItem(false);
    }
};



PokemonMZ_Scene_PokemonMenu.prototype.afterUsingItem = function(forceClose) {
    // Decrease item count and close window if necessary
    this._hasUsedRecoveryItem = null;
    this._hasUsedIncreaseLevelItem = null;
    this._hasUsedLearnMoveItem = null;
    this._hasLeveledUp = null;
    this._hasLearnedMove = null;
    $gamePlayerTrainer.gainBagItem(this._usedItem.id, -1);
    if (this._pokemonEvolvesTo) {
        $gameTemp._menuUsedItem = this._usedItem;
        $gameTemp._menuSelectedPokemonIndex = this._listWindow._index;
        SceneManager.push(PokemonMZ_Scene_Evolutions);
        SceneManager.prepareNextScene(
            [[this.selectedPokemon(), this._pokemonEvolvesTo]], 
            AudioManager.saveBgm(),
            AudioManager.saveBgs()
        );
        this._listWindow.activate();
    } else if ($gamePlayerTrainer.numBagItems(this._usedItem.id) <= 0 || forceClose) {
        this.popScene();
    } else {
        this._listWindow.activate();
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectCommand = function() {
    switch (this._commandWindow.currentSymbol()) {
        case "stats":
            this.onSelectCommandStats();
            break;
        case "switch":
            this.onSelectCommandSwitch();
            break;
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectCommandSwitch = function() {
    this._commandWindow.close();
    this._listWindow.setFormationMode(true);
    this._listWindow.setPendingIndex(this._listWindow.index());
    this._listWindow.activate();
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectCommandStats = function() {
    const pokemon = $gamePlayerTrainer.pokemon(this._listWindow.index());
    this._commandWindow.close();
    this._statusWindow.setPokemon(pokemon);
    AudioManager.playPokemonCry(pokemon._data.id)
    this._statusWindow.open();
    this._statusWindow.activate();
};
PokemonMZ_Scene_PokemonMenu.prototype.onCancelCommand = function() {
    this._commandWindow.close();
    this._listWindow.activate();
};
PokemonMZ_Scene_PokemonMenu.prototype.onCancelStatus = function() {
    this._statusWindow.close();
    this._listWindow.activate();
};
PokemonMZ_Scene_PokemonMenu.prototype.updatePokemonRecover = function() {
    this._mustReturnToItemMenu = this.PokemonMZ_updatePokemonRecover(
         this._listWindow, 
         this._messageWindow
    )
};
PokemonMZ_Scene_PokemonMenu.prototype.updatePokemonCureStatus = function() { 
    this._mustReturnToItemMenu = this.PokemonMZ_updatePokemonCureStatus(
         this._listWindow, 
         this._messageWindow
    );
};
PokemonMZ_Scene_PokemonMenu.prototype.updatePokemonIncreaseLevel = function() { 
    const pokemon = this._pokemonRecoveringData.pokemon;
    if (pokemon) {
        AudioManager.playStandardSe(PokemonMZ.levelUpSE);
        pokemon.forceLevelUp();
        this._hasUsedIncreaseLevelItem = true;
        const message = pokemon.name() + " grew to level " + String(pokemon.level()) + "!";
        const learnedMove = pokemon.getNextMoveLearned();
        if (learnedMove) {
            const moveIntId = $dataSkillsIndex[learnedMove];
            this._learnedMove = $dataSkills[moveIntId];
        } else {
            this._learnedMove = null;
        }

        const possibleEvolution = pokemon.firstPossibleEvolution("levelUp")
        if (possibleEvolution != "") {
            this._pokemonEvolvesTo = possibleEvolution;
        }

        this._listWindow.clearItem(this._pokemonRecoveringData.windowIndex);
        this._listWindow.drawItem(this._pokemonRecoveringData.windowIndex);
        this._pokemonLevelUpWindow.setPokemon(pokemon);
        this._pokemonLevelUpWindow.show();
        this._pokemonRecoveringData = null;
        this._listWindow.deactivate();
        this._messageWindow.setText(message);
        this._messageWindow.startMessage();
        this._afterTextPhase = "levelingUp";
        return true;

    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onMenuSwitchOk = function() {
};
PokemonMZ_Scene_PokemonMenu.prototype.onMenuCancelOk = function() {
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectPokemonSwitch = function() {
    const index1 = this._listWindow.index();
    const index2 = this._listWindow.pendingIndex();
    $gamePlayerTrainer.swapPokemons(index1, index2);
    this._listWindow.setFormationMode(false);
    this._listWindow.setPendingIndex(-1);
    this._listWindow.refresh();
    this._listWindow.activate();
};
PokemonMZ_Scene_PokemonMenu.prototype.commandForgetYes = function() {
    // Pressed yes on yes/no window
    const mode = this._yesNoWindow.mode();
    const pokemon = this.selectedPokemon();
    const pokemonName = pokemon.name();
    const moveName = this._learnedMove.name;
    const moveStringId = this._learnedMove.pkmz_data.id;
    
    switch(mode) {
    case "learnMove":
        // Said yes to delete an older move
        this._yesNoWindow.close();
        this._forgetPokemonMovesWindow.clearCommandList();
        this._forgetPokemonMovesWindow.setPokemon(pokemon);
        this._afterTextPhase = "selectForgottenMove"
        this._messageWindow.terminateMessage();
        this._messageWindow.pause = false;
        this._messageWindow.activate();
        this._messageWindow.setText("Which move should be forgotten?");
        this._messageWindow.startMessage();
        break;
    case "abandonMove":
        // Said yes to abandon move
        this._yesNoWindow.close();
        const message = pokemonName + " did not learn " + moveName + "!";
        //this._afterTextPhase = ""
        this._messageWindow.terminateMessage();
        this._messageWindow.pause = false;
        this._messageWindow.activate();
        this._messageWindow.setText(message);
        this._messageWindow.startMessage();
        break;
    }

};
PokemonMZ_Scene_PokemonMenu.prototype.commandForgetNo = function() {
    // Pressed yes on yes/no window
    const mode = this._yesNoWindow.mode();
    const pokemon = this.selectedPokemon();
    const moveName = this._learnedMove.name;
    
    switch(mode) {
    case "learnMove":
        // Said no to delete an older move
        this._yesNoWindow.close();
        const message = "Abandon learning " + moveName + "?";
        this._afterTextPhase = "yesNoAbandonMove"
        this._messageWindow.terminateMessage();
        this._messageWindow.pause = false;
        this._messageWindow.activate();
        this._messageWindow.setText(message);
        this._messageWindow.startMessage();
        break;
    case "abandonMove":
        // Said no to abandon move
        this._yesNoWindow.close();
        this._messageWindow.terminateMessage();
        this._messageWindow.pause = false;
        this._messageWindow.activate();
        this.proceedLearningMoveAsk();
        break;
    }
};
PokemonMZ_Scene_PokemonMenu.prototype.onSelectForgetPokemonMove = function() {
    const pokemon = this.selectedPokemon();
    const moveName = this._learnedMove.name;
    const moveStringId = this._learnedMove.pkmz_data.id;

    this._forgetPokemonMovesWindow.close();
    this._yesNoWindow.close();
    AudioManager.playStandardSe(PokemonMZ.forgetMoveSE);

    const index = this._forgetPokemonMovesWindow.currentSymbol();
    const forgottenMove = pokemon.moveNameFromIndex(index);
    pokemon.replaceMoveAtIndexBy(index, moveStringId);
    const message = "1, 2 and... Poof!\n" + pokemon.name() + " forgot " + forgottenMove + "!\nAnd..."
    this._afterTextPhase = "forgotMove"
    this._messageWindow.terminateMessage();
    this._messageWindow.pause = false;
    this._messageWindow.activate();
    this._messageWindow.setText(message);
    this._messageWindow.startMessage();
};
PokemonMZ_Scene_PokemonMenu.prototype.onCancelForgetPokemonMove = function() {
    const moveName = this._learnedMove.name;
    this._forgetPokemonMovesWindow.close();
    this._yesNoWindow.close();
    const message = "Abandon learning " + moveName + "?";
    this._afterTextPhase = "yesNoAbandonMove"
    this._messageWindow.terminateMessage();
    this._messageWindow.pause = false;
    this._messageWindow.activate();
    this._messageWindow.setText(message);
    this._messageWindow.startMessage();
};
PokemonMZ_Scene_PokemonMenu.prototype.finishReplacingMove = function() { 
    AudioManager.playStandardSe(PokemonMZ.learnMoveSE);
    const pokemon = this.selectedPokemon();
    const moveName = this._learnedMove.name;
    const moveStringId = this._learnedMove.pkmz_data.id;
    const message = pokemon.name() + " learned " + moveName + "!";
    this._learnedMove = null;
    this._hasLearnedMove = true;
    this._afterTextPhase = "";
    this._messageWindow.setText(message)
    this._messageWindow.startMessage();
};






// PokemonMZ_Scene_Shop
// The scene class for the Shop
function PokemonMZ_Scene_Shop() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Shop.prototype = Object.create(Scene_Shop.prototype);
PokemonMZ_Scene_Shop.prototype.constructor = PokemonMZ_Scene_PokemonMenu;
PokemonMZ_Scene_Shop.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};
PokemonMZ_Scene_Shop.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createGoldWindow();
    this.createCommandWindow();
    this.createDummyWindow();
    this.createNumberWindow();
    this.createStatusWindow();
    this.createBuyWindow();
    this.createSellWindow();
};
PokemonMZ_Scene_Shop.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new PokemonMZ_Window_Money(rect);
    this.addWindow(this._goldWindow);
};
PokemonMZ_Scene_Shop.prototype.createStatusWindow = function() {
    const rect = this.statusWindowRect();
    this._statusWindow = new PokemonMZ_Window_ShopStatus(rect);
    this._statusWindow.hide();
    this.addWindow(this._statusWindow);
};
PokemonMZ_Scene_Shop.prototype.createBuyWindow = function() {
    const rect = this.buyWindowRect();
    this._buyWindow = new PokemonMZ_Window_ShopBuy(rect);
    this._buyWindow.setupGoods(this._goods);
    this._buyWindow.setHelpWindow(this._helpWindow);
    this._buyWindow.setStatusWindow(this._statusWindow);
    this._buyWindow.hide();
    this._buyWindow.setHandler("ok", this.onBuyOk.bind(this));
    this._buyWindow.setHandler("cancel", this.onBuyCancel.bind(this));
    this.addWindow(this._buyWindow);
};
PokemonMZ_Scene_Shop.prototype.createSellWindow = function() {
    const rect = this.sellWindowRect();
    this._sellWindow = new PokemonMZ_Window_ShopSell(rect);
    this._sellWindow.setHelpWindow(this._helpWindow);
    this._sellWindow.hide();
    this._sellWindow.setHandler("ok", this.onSellOk.bind(this));
    this._sellWindow.setHandler("cancel", this.onSellCancel.bind(this));
    this.addWindow(this._sellWindow);
    this._sellWindow.createContents();
};
PokemonMZ_Scene_Shop.prototype.sellWindowRect = function() {
    const wx = 0;
    const wy = this._commandWindow.y + this._commandWindow.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight() - this._commandWindow.height;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Shop.prototype.commandSell = function() {
    this._dummyWindow.hide();
    this._sellWindow.show();
    this._sellWindow.deselect();
    this._sellWindow.refresh();
    this.onCategoryOk();
};
PokemonMZ_Scene_Shop.prototype.activateSellWindow = function() {
    this._sellWindow.refresh();
    this._sellWindow.show();
    this._sellWindow.activate();
    this._statusWindow.hide();
};
PokemonMZ_Scene_Shop.prototype.onBuyOk = function() {
    this._item = this._buyWindow.item();
    const buyable = $gamePlayerTrainer.numBagItems(this._item.id) < $gamePlayerTrainer.maxSingleBagItemQuantity();

    if (buyable) {
        this._buyWindow.hide();
        this._numberWindow.setup(this._item, this.maxBuy(), this.buyingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
    } else {
        SoundManager.playBuzzer();
        this._buyWindow.activate();
    }
};
PokemonMZ_Scene_Shop.prototype.onBuyCancel = function() {
    this._commandWindow.activate();
    this._dummyWindow.show();
    this._buyWindow.hide();
    this._statusWindow.hide();
    this._statusWindow.setItem(null);
};
PokemonMZ_Scene_Shop.prototype.onSellOk = function() {
    this._item = this._sellWindow.item();
    let sellable = true;
    if (this._item.pkmz_data.category == "key") {
        sellable = false;
    }
    if (sellable) {
        this._sellWindow.hide();
        this._numberWindow.setup(this._item, this.maxSell(), this.sellingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
        this._statusWindow.setItem(this._item);
        this._statusWindow.show();
    } else {
        SoundManager.playBuzzer();
        this._sellWindow.activate();
    }
};
PokemonMZ_Scene_Shop.prototype.onSellCancel = function() {
    this._sellWindow.deselect();
    this._statusWindow.setItem(null);
    this.onCategoryCancel();
};
PokemonMZ_Scene_Shop.prototype.onCategoryCancel = function() {
    this._commandWindow.activate();
    this._dummyWindow.show();
    this._sellWindow.hide();
};
PokemonMZ_Scene_Shop.prototype.maxBuy = function() {
    const num = $gamePlayerTrainer.numBagItems(this._item.id);
    const max = $gamePlayerTrainer.maxSingleBagItemQuantity() - num;
    const price = this.buyingPrice();
    if (price > 0) {
        return Math.min(max, Math.floor(this.money() / price));
    } else {
        return max;
    }
};
PokemonMZ_Scene_Shop.prototype.maxSell = function() {
    return $gamePlayerTrainer.numBagItems(this._item.id);
};
PokemonMZ_Scene_Shop.prototype.doBuy = function(number) {
    $gamePlayerTrainer.removeMoney(number * this.buyingPrice());
    $gamePlayerTrainer.gainBagItem(this._item.id, number);
};
PokemonMZ_Scene_Shop.prototype.sellingPrice = function() {
    return Math.floor(this._item.pkmz_data.price / 2);
};
PokemonMZ_Scene_Shop.prototype.doSell = function(number) {
    $gamePlayerTrainer.addMoney(number * this.sellingPrice());
    $gamePlayerTrainer.gainBagItem(this._item.id, -number);
};


// PokemonMZ_Scene_Evolutions
// The scene class for Pokemon volution
function PokemonMZ_Scene_Evolutions() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Evolutions.prototype = Object.create(Scene_MenuBase.prototype);
PokemonMZ_Scene_Evolutions.prototype.constructor = PokemonMZ_Scene_Evolutions;
PokemonMZ_Scene_Evolutions.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._evolvingPokemons = [];
    this._currentlyEvolvingPokemonData = null;
    this._waitCount = 0;
    this._animatePhase = 0;
    this._animateCount = 0;
    this._phase = "";
    this._mapBgm = null;
    this._mapBgs = null;
    this._futurePokemon = null;
    this._oldName = "";
    this._nextLearnedAttack = null;
    this._moveAskedFor = null;
};
PokemonMZ_Scene_Evolutions.prototype.prepare = function(evolvingPokemons, mapBgm, mapBgs) {
    this._evolvingPokemons = evolvingPokemons;
    this._mapBgm = mapBgm;
    this._mapBgs = mapBgs;
};
PokemonMZ_Scene_Evolutions.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createMessageWindow();
    this.createYesNoWindow();
    this.createMoveWindow();
    this.createPokemonSprite();
    this.createFlashingSprite();
};
PokemonMZ_Scene_Evolutions.prototype.createMessageWindow = function() {
    const rect = this.messageWindowRect();
    this._staticMessageWindow = new PokemonMZ_BattleStaticMessageWindow(rect);
    this._staticMessageWindow.show();
    this.addWindow(this._staticMessageWindow);
};
PokemonMZ_Scene_Evolutions.prototype.messageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, true);
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Evolutions.prototype.createMoveWindow = function() {
    const rect2 = this.forgetPokemonMovesWindowRect();
    this._forgetPokemonMovesWindow = new PokemonMZ_Window_PokemonForgetMoves(rect2);
    this._forgetPokemonMovesWindow.openness = 0;
    this._forgetPokemonMovesWindow.setHandler("ok", this.onSelectForgetPokemonMove.bind(this));
    this._forgetPokemonMovesWindow.setHandler("cancel", this.onCancelForgetPokemonMove.bind(this));
    this.addWindow(this._forgetPokemonMovesWindow);
};
PokemonMZ_Scene_Evolutions.prototype.forgetPokemonMovesWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(4, true);
    const wx = Graphics.boxWidth - ww;
    const wy = this._staticMessageWindow.y - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Evolutions.prototype.createYesNoWindow = function() {
    const rect = this.yesNoWindowRect();
    this._yesNoWindow = new PokemonMZ_BattleYesNoWindow(rect);
    this._yesNoWindow.setHandler("yes", this.commandYes.bind(this));
    this._yesNoWindow.setHandler("no", this.commandNo.bind(this));
    this._yesNoWindow.openness = 0;
    this.addWindow(this._yesNoWindow);
};
PokemonMZ_Scene_Evolutions.prototype.yesNoWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    const wx = Graphics.boxWidth - ww;
    const wy = this._staticMessageWindow.y - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Evolutions.prototype.createPokemonSprite = function() {
    this._pokemonSprite = new PokemonMZ_Sprite_Pokemon("front");
    this.addChild(this._pokemonSprite);
};
PokemonMZ_Scene_Evolutions.prototype.createFlashingSprite = function() {
    this._whiteScreen = new ScreenSprite();
    this._whiteScreen.setWhite();
    this._whiteScreen.opacity = 0;
    this.addChild(this._whiteScreen);
};
PokemonMZ_Scene_Evolutions.prototype.initializeSprite = function(pokemon) {
    this._pokemonSprite.scale.x = 1.0;
    this._pokemonSprite.scale.y = 1.0;
    this._pokemonSprite.setPokemon(pokemon);
    this._pokemonSprite.show();
};
PokemonMZ_Scene_Evolutions.prototype.centerSprite = function() {
    const zoneWidth = Graphics.boxWidth;
    const zoneHeight = Graphics.boxHeight - this._staticMessageWindow.height;
    this._pokemonSprite.x = (zoneWidth - this._pokemonSprite.width*this._pokemonSprite.scale.x)/2;
    this._pokemonSprite.y = (zoneHeight - this._pokemonSprite.height*this._pokemonSprite.scale.y)/2;
};
PokemonMZ_Scene_Evolutions.prototype.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};
PokemonMZ_Scene_Evolutions.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this.startFadeIn(this.fadeSpeed(), false);
    this._phase = "fadeIn";
};
PokemonMZ_Scene_Evolutions.prototype.isTriggeredCancel = function() {
    return Input.isTriggered("cancel");
};
PokemonMZ_Scene_Evolutions.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);

    if (this.isTriggeredCancel() && this._phase == "animateEvolution") {
        this._phase = "cancelEvolution";
    }

    let pokemon;
    if (this._pokemonSprite.bitmap) {
        this.centerSprite();
    }
    if (this._waitCount > 0) {
        this._waitCount--;
        return;
    };
    switch(this._phase) {
    case "fadeIn":
        if (this._fadeDuration == 0) {
            this._phase = "nextPokemon";
            AudioManager.playBgm({"name":PokemonMZ.evolutionBGM, "pan":0, "volume":100, "pitch":100})
        };
        break;
    case "nextPokemon":
        this._currentlyEvolvingPokemonData = this._evolvingPokemons.splice(0,1)[0];
        pokemon = this._currentlyEvolvingPokemonData[0]
        this._futurePokemon = new PokemonMZ_Game_Pokemon(pokemon.intEnemyId(), pokemon.level())
        this._futurePokemon.cloneFromPokemon(pokemon);
        this._futurePokemon.evolveTo(this._currentlyEvolvingPokemonData[1])
        this._staticMessageWindow.setText("What? " + pokemon.name() + " is evolving!")
        AudioManager.playPokemonCry(pokemon.id())
        this.initializeSprite(pokemon);
        this._waitCount = 120;
        this._animateCount = 299;
        this._animatePhase = 0;
        this._phase = "animateEvolution";
        break;
    case "animateEvolution":
        if (this._animateCount > 10) {
            this._pokemonSprite.setBlendColor([255, 255, 255, 255]);

            const scaleChange = this._animatePhase == 0 ? -0.05 : 0.05;
            this._pokemonSprite.scale.x += scaleChange;
            this._pokemonSprite.scale.y += scaleChange;

            if (this._animateCount % 10 == 0) {
                this._animatePhase = this._animatePhase == 0 ? 1 : 0;
                this._pokemonSprite.setPokemon(
                    this._animatePhase == 0 ? this._currentlyEvolvingPokemonData[0] : this._futurePokemon
                );
                
            }
            this._animateCount --;
        } else if (this._animateCount > 0) {
            this._pokemonSprite.setBlendColor([255, 255, 255, 255]);
            this._pokemonSprite.setPokemon(this._futurePokemon);

            const scaleChange = 0.05;
            this._pokemonSprite.scale.x += scaleChange;
            this._pokemonSprite.scale.y += scaleChange;
            this._whiteScreen.opacity += 25.5
            this._animateCount --;
        } else if (this._animateCount > -10) {
            this._pokemonSprite.scale.x = 1.0;
            this._pokemonSprite.scale.y = 1.0;
            this._pokemonSprite.setBlendColor([0, 0, 0, 0]);
            this._whiteScreen.opacity -= 25.5
            this._animateCount --;
        } else {
            this._waitCount = 30;
            this._phase = "finishEvolution";
        }
        break;
    case "finishEvolution":
        pokemon = this._currentlyEvolvingPokemonData[0];
        this._oldName = pokemon.name();
        const newId = this._currentlyEvolvingPokemonData[1];
        pokemon.evolveTo(newId);
        AudioManager.playPokemonCry(pokemon.id())
        this.initializeSprite(pokemon);
        $gamePlayerTrainer.addSeenPokemon(newId);
        $gamePlayerTrainer.addCapturedPokemon(newId);
        this._waitCount = 80;
        this._phase = "jingleEvolution";
        break;
    case "jingleEvolution":
        pokemon = this._currentlyEvolvingPokemonData[0];
        AudioManager.playMe({"name":PokemonMZ.evolvedPokemonME, "pan":0, "volume":100, "pitch":100})
        this._waitCount = 200;
        this._staticMessageWindow.setText(this._oldName + " evolved into " + pokemon.speciesName() + "!")
        this._phase = "startLearningMoves";
        break;

    case "cancelEvolution":
        pokemon = this._currentlyEvolvingPokemonData[0];
        this._pokemonSprite.setPokemon(pokemon);
        this._pokemonSprite.scale.x = 1.0;
        this._pokemonSprite.scale.y = 1.0;
        this._pokemonSprite.setBlendColor([0, 0, 0, 0]);
        this._staticMessageWindow.setText("Huh? " + pokemon.name() + " stopped evolving!")
        this._phase = "finishCancelEvolution";
        this._waitCount = 240;
        break;

    case "finishCancelEvolution":
        this.updateToNextPokemon();
        break;
    case "startLearningMoves":
        pokemon = this._currentlyEvolvingPokemonData[0];
        pokemon.calculateEvolutionMoves();
        this._phase = "learnNextMove";
        break;
    case "learnNextMove":
        pokemon = this._currentlyEvolvingPokemonData[0];
        const moveList = pokemon.movesLearnWaitlist();
        if (moveList.length > 0) {
            this._nextLearnedAttack = pokemon.getNextMoveLearned();
            this._phase = "learningMove";
            this.proceedLearningMove();
        } else {
            this.updateToNextPokemon();
        }
        break;
    case "finishReplacingMove":
        this.finishReplacingMove();
        break;
    case "exitScene":
        $gameTemp._fromEvolution = true;
        this.replayBgmAndBgs();
        SceneManager.pop();
        break;
    }
};
PokemonMZ_Scene_Evolutions.prototype.updateToNextPokemon = function() {
    if (this._evolvingPokemons.length > 0) {
        this._pokemonSprite.hide();
        this.startFadeIn(this.fadeSpeed(), false);
        this._phase = "fadeIn";
    } else {
        this._waitCount = 30;
        this._phase = "exitScene";
        this._pokemonSprite.hide();
        this.startFadeOut(this.fadeSpeed(), false);
    }
};
PokemonMZ_Scene_Evolutions.prototype.proceedLearningMove = function() {
    const pokemon = this._currentlyEvolvingPokemonData[0];
    if (pokemon.moves().length < 4) {
        this.proceedLearningMoveInstant();
    } else {
        this.proceedLearningMoveAsk();
    }
};
PokemonMZ_Scene_Evolutions.prototype.proceedLearningMoveInstant = function() {
    AudioManager.playStandardSe(PokemonMZ.learnMoveSE);
    const pokemon = this._currentlyEvolvingPokemonData[0];
    const moveStringId = this._nextLearnedAttack;
    pokemon.learnMove(moveStringId);
    const moveName = pokemon.moveNameFromStringId(moveStringId);
    const message = pokemon.name() + " learned " + moveName + "!";
    this._staticMessageWindow.setText(message)
    this._waitCount = 150;
    this._phase = "learnNextMove";
};
PokemonMZ_Scene_Evolutions.prototype.proceedLearningMoveAsk = function() {
    const pokemon = this._currentlyEvolvingPokemonData[0];
    const pokemonName = pokemon.name();
    const moveName = pokemon.moveNameFromStringId(this._nextLearnedAttack);

    let message = pokemonName + " is trying to learn " +  moveName + "!";
    message += "\nBut, " + pokemonName + " can't learn more than 4 moves!";
    message += "\n\nDelete an older move to make room for " + moveName + "?";
    this._staticMessageWindow.setText(message)
    this._waitCount = 200;
    this._yesNoWindow.setMode("learnMove")
    this._yesNoWindow.open()
    this._yesNoWindow.activate();
    this._phase = "playerInput";
};
PokemonMZ_Scene_Evolutions.prototype.commandYes = function() {
    // Pressed yes on yes/no window
    const mode = this._yesNoWindow.mode();
    
    switch(mode) {
    case "learnMove":
        // Said yes to delete an older move
        this._yesNoWindow.close();
        this._forgetPokemonMovesWindow.clearCommandList();
        const pokemon1 = this._currentlyEvolvingPokemonData[0];
        this._forgetPokemonMovesWindow.setPokemon(pokemon1);
        this._staticMessageWindow.setText("Which move should be forgotten?");
        this._forgetPokemonMovesWindow.show();
        this._forgetPokemonMovesWindow.open();
        this._forgetPokemonMovesWindow.activate();
        this._forgetPokemonMovesWindow.select(0);
        break;
    case "abandonMove":
        // Said yes to abandon move
        this._yesNoWindow.close();
        const move = this._nextLearnedAttack;
        const pokemon2 = this._currentlyEvolvingPokemonData[0];
        const moveName = pokemon2.moveNameFromStringId(move);
        const message = pokemon2.name() + " did not learn " + moveName + "!";
        this._staticMessageWindow.setText(message)
        this._waitCount = 150;
        this._phase = "learnNextMove";
        break;
    }
};
PokemonMZ_Scene_Evolutions.prototype.commandNo = function() {
    // Pressed yes on yes/no window
    const mode = this._yesNoWindow.mode();
    
    switch(mode) {
    case "learnMove":
        // Said no to delete an older move
        this._yesNoWindow.close();
        const move = this._nextLearnedAttack;
        const pokemon = this._currentlyEvolvingPokemonData[0];
        const moveName = pokemon.moveNameFromStringId(move);
        const message = "Abandon learning " + moveName + "?";
        this._staticMessageWindow.setText(message);
        this._yesNoWindow.setMode("abandonMove")
        this._yesNoWindow.activate();
        this._yesNoWindow.select(0);
        this._yesNoWindow.open();
        break;
    case "abandonMove":
        // Said no to abandon move
        this._yesNoWindow.close();
        this.proceedLearningMoveAsk();
        break;
    }
};
PokemonMZ_Scene_Evolutions.prototype.onSelectForgetPokemonMove = function() {
    this._forgetPokemonMovesWindow.close();
    this._yesNoWindow.close();
    AudioManager.playStandardSe(PokemonMZ.forgetMoveSE);
    const move = this._nextLearnedAttack;
    const pokemon = this._currentlyEvolvingPokemonData[0];
    const moveName = pokemon.moveNameFromStringId(move);
    const forgottenMove = pokemon.moveNameFromIndex(index);
    const index = this._forgetPokemonMovesWindow.currentSymbol();
    pokemon.replaceMoveAtIndexBy(index, move);
    const message = "1, 2 and... Poof!\n" + pokemon.name() + " forgot " + forgottenMove + "!\nAnd..."
    this._staticMessageWindow.setText(message)
    this._waitCount = 150;
    this._phase = "finishReplacingMove";
};
PokemonMZ_Scene_Evolutions.prototype.onCancelForgetPokemonMove = function() {
    this._forgetPokemonMovesWindow.close();
    this._yesNoWindow.close();
    const move = this._nextLearnedAttack;
    const pokemon = this._currentlyEvolvingPokemonData[0];
    const moveName = pokemon.moveNameFromStringId(move);
    const message = "Abandon learning " + moveName + "?";
    this._staticMessageWindow.setText(message);
    this._yesNoWindow.setMode("abandonMove");
    this._yesNoWindow.select(1);
    this._yesNoWindow.activate();
    this._yesNoWindow.open();
};
PokemonMZ_Scene_Evolutions.prototype.finishReplacingMove = function() { 
    AudioManager.playStandardSe(PokemonMZ.learnMoveSE);
    const pokemon = this._currentlyEvolvingPokemonData[0];
    const moveName = pokemon.moveNameFromStringId(this._nextLearnedAttack);
    const message = pokemon.name() + " learned " + moveName + "!";
    this._nextLearnedAttack = null;
    this._staticMessageWindow.setText(message)
    this._waitCount = 150;
    this._staticMessageWindow.setText(message)
    this._phase = "learnNextMove";
};

// PokemonMZ_Scene_Battle
// The scene class for the Battle
function PokemonMZ_Scene_Battle() {
    this.initialize(...arguments);
}
PokemonMZ_Scene_Battle.prototype = Object.create(Scene_Message.prototype);
PokemonMZ_Scene_Battle.prototype.constructor = PokemonMZ_Scene_Battle;
PokemonMZ_Scene_Battle.prototype.initialize = function() {
    Scene_Message.prototype.initialize.call(this);
    this._pokemonSelectMode = null;
    this._pokemonRecoveringData = null;
    this._mustReturnToBattle = false;
    this._pokedexRegion = "";
    this._pokedexMaxNumber = 0;
};
PokemonMZ_Scene_Battle.prototype.prepare = function(phase) {
    this._phase = phase
}
PokemonMZ_Scene_Battle.prototype.start = function() {
    Scene_Message.prototype.start.call(this);
    this._pokedexRegion = $gamePlayerTrainer.pokedexRegion();
    this.setPokedexMaxNumber();
    this._pokedexDataWindow.setPokedexRegion(this._pokedexRegion);
    this._pokedexDataWindow.setPokedexNumberPadding(this._pokedexMaxNumber);
    PokemonMZ_BattleManager.playBattleBgm();
    PokemonMZ_BattleManager.startBattle();
    this.startFadeIn(this.fadeSpeed(), false);
};
PokemonMZ_Scene_Battle.prototype.setPokedexMaxNumber = function() {
    for (const enemy of $dataEnemies) {
        if (!enemy) { continue; }
        if (!enemy.pkmz_data) { continue; }
        if (!enemy.pkmz_data.pokedex) { continue }

        let pokedexData = enemy.pkmz_data.pokedex;
        for (const pokedex of pokedexData) {
            const pokemonStrId = enemy.pkmz_data.id;
            if (pokedex.region == this._pokedexRegion) {
                if (pokedex.number > this._pokedexMaxNumber) {
                    this._pokedexMaxNumber = pokedex.number;
                }
            }
        }
    }
};
PokemonMZ_Scene_Battle.prototype.stop = function() {
    Scene_Message.prototype.stop.call(this);
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else {
        this.startFadeOut(this.fadeSpeed(), false);
    }
    // this._statusWindow.close();
    // this._partyCommandWindow.close();
    // this._actorCommandWindow.close();
};
PokemonMZ_Scene_Battle.prototype.terminate = function() {
    Scene_Message.prototype.terminate.call(this);
    for (const pokemon of $gamePlayerTrainer.pokemons()) {
        pokemon._battleSprite = null;
    }
    AudioManager.stopMe();
    if (this.shouldAutosave()) {
        this.requestAutosave();
    }
};
PokemonMZ_Scene_Battle.prototype.needsSlowFadeOut = function() {
    return (
        SceneManager.isNextScene(Scene_Title) ||
        SceneManager.isNextScene(Scene_Gameover)
    );
};
PokemonMZ_Scene_Battle.prototype.shouldAutosave = function() {
    return SceneManager.isNextScene(Scene_Map);
};
PokemonMZ_Scene_Battle.prototype.create = function() {
    Scene_Message.prototype.create.call(this);
    this.createDisplayObjects();
    this.linkWindows();
};
PokemonMZ_Scene_Battle.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
    this.createButtons();
};
PokemonMZ_Scene_Battle.prototype.createAllWindows = function() {
    Scene_Message.prototype.createAllWindows.call(this);
    this._messageWindow.height = this.calcWindowHeight(4, true);
    this._messageWindow.y = Graphics.boxHeight - this._messageWindow.height;
    this.createPlayerInputWindow();
    this.createStaticMessageWindow();
    this.createTrainerTeamStatusWindows();
    this.createPokemonStatusWindows();
    this.createHelpWindow();
    this.createItemWindow();
    this.createPokemonListWindow();
    this.createPokemonCommandWindow();
    this.createPokemonMenuMessageWindow();
    this.createPokemonCompleteStatusWindow();
    this.createPokemonMovesWindows();
    this.createPokemonLevelUpWindow();
    this.createPokedexWindow();
    this.createYesNoWindow();
    this.createNicknameWindows();
};
PokemonMZ_Scene_Battle.prototype.linkWindows = function() {
    PokemonMZ_BattleManager.setSpriteset(this._spriteset);
    PokemonMZ_BattleManager.setRegularMessageWindow(this._messageWindow);
    PokemonMZ_BattleManager.setTeamStatusWindows(
        this._playerTeamStatusWindow,
        this._enemyTeamStatusWindow
    )
    PokemonMZ_BattleManager.setPokemonStatusWindows(
        this._playerPokemonStatusWindow,
        this._enemyPokemonStatusWindow
    )
    PokemonMZ_BattleManager.setTrainerInputWindow(this._playerInputWindow);
    PokemonMZ_BattleManager.setTrainerMovesWindow(this._pokemonMovesWindow);
    PokemonMZ_BattleManager.setStaticMessageWindow(this._staticMessageWindow);
    PokemonMZ_BattleManager.setPokemonLevelUpWindow(this._pokemonLevelUpWindow);
    PokemonMZ_BattleManager.setPokedexDataWindow(this._pokedexDataWindow);
    PokemonMZ_BattleManager.setYesNoWindow(this._yesNoWindow);
    PokemonMZ_BattleManager.setPokemonListWindow(this._pokemonListWindow);
};
PokemonMZ_Scene_Battle.prototype.helpAreaTop = function() {
    return this.buttonAreaBottom();
};
PokemonMZ_Scene_Battle.prototype.helpAreaBottom = function() {
    return this.helpAreaTop() + this.helpAreaHeight();
};
PokemonMZ_Scene_Battle.prototype.helpAreaHeight = function() {
    return this.calcWindowHeight(2, false);
};
PokemonMZ_Scene_Battle.prototype.buttonAreaTop = function() {
    return 0;
};
PokemonMZ_Scene_Battle.prototype.windowAreaHeight = function() {
    return this.calcWindowHeight(4, true);
};
PokemonMZ_Scene_Battle.prototype.createButtons = function() {
    if (ConfigManager.touchUI) {
        this.createCancelButton();
    }
};
PokemonMZ_Scene_Battle.prototype.createCancelButton = function() {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
};
PokemonMZ_Scene_Battle.prototype.createTrainerTeamStatusWindows = function() {
    const rect1 = this.playerTeamStatusWindowRect();
    this._playerTeamStatusWindow = new PokemonMZ_TrainerTeamStatusWindow(rect1, "player");
    this.addWindow(this._playerTeamStatusWindow);

    const rect2 = this.enemyTeamStatusWindowRect();
    this._enemyTeamStatusWindow = new PokemonMZ_TrainerTeamStatusWindow(rect2, "enemy");
    this.addWindow(this._enemyTeamStatusWindow);
};
PokemonMZ_Scene_Battle.prototype.playerTeamStatusWindowRect = function() {
    const wx = 450;
    const wy = 350;
    const ww = 300;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.enemyTeamStatusWindowRect = function() {
    const wx = 50;
    const wy = 50;
    const ww = 300;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonStatusWindows = function() {
    const rect1 = this.playerPokemonStatusWindowRect();
    this._playerPokemonStatusWindow = new PokemonMZ_PokemonBattleStatusWindow(rect1, "player");
    this.addWindow(this._playerPokemonStatusWindow);

    const rect2 = this.enemyPokemonStatusWindowRect();
    this._enemyPokemonStatusWindow = new PokemonMZ_PokemonBattleStatusWindow(rect2, "enemy");
    this.addWindow(this._enemyPokemonStatusWindow);
};
PokemonMZ_Scene_Battle.prototype.playerPokemonStatusWindowRect = function() {
    const wx = 450;
    const ww = 300;
    const wh = this.calcWindowHeight(2, false);
    const wy = Graphics.boxHeight - this._playerInputWindow.height - wh - 10;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.enemyPokemonStatusWindowRect = function() {
    const wx = 50;
    const wy = 50;
    const ww = 300;
    const wh = this.calcWindowHeight(2, false);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPlayerInputWindow = function() {
    const rect = this.playerInputWindowRect();
    this._playerInputWindow = new PokemonMZ_BattleInputWindow(rect);
    this._playerInputWindow.setHandler("fight", this.commandFight.bind(this));
    this._playerInputWindow.setHandler("pokemon", this.commandPokemon.bind(this));
    this._playerInputWindow.setHandler("item", this.commandItem.bind(this));
    this._playerInputWindow.setHandler("run", this.commandRun.bind(this));
    this.addWindow(this._playerInputWindow);
};
PokemonMZ_Scene_Battle.prototype.playerInputWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(4, true);
    const wx = Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createYesNoWindow = function() {
    const rect = this.playerInputWindowRect();
    this._yesNoWindow = new PokemonMZ_BattleYesNoWindow(rect);
    this._yesNoWindow.setHandler("yes", this.commandYes.bind(this));
    this._yesNoWindow.setHandler("no", this.commandNo.bind(this));
    this.addWindow(this._yesNoWindow);
};
PokemonMZ_Scene_Battle.prototype.createNicknameWindows = function() {
    const rect1 = this.nicknameEditWindowRect();
    this._nicknameEditWindow = new PokemonMZ_Window_PokemonNameEdit(rect1);
    this._nicknameEditWindow.openness = 0;
    this._nicknameEditWindow.setHandler("gave_nickname", this.hasGivenNickname.bind(this));
    this.addWindow(this._nicknameEditWindow);
    const rect2 = this.nicknameInputWindowRect();
    this._nicknameInputWindow = new PokemonMZ_Window_NameInput(rect2);
    this._nicknameInputWindow.setEditWindow(this._nicknameEditWindow);
    this._nicknameInputWindow.openness = 0;
    this._nicknameInputWindow.setHandler("gave_nickname", this.hasGivenNickname.bind(this));
    this.addWindow(this._nicknameInputWindow);
};
PokemonMZ_Scene_Battle.prototype.nicknameEditWindowRect = function() {
    const inputWindowHeight = this.calcWindowHeight(9, true);
    const padding = $gameSystem.windowPadding();
    const ww = 600;
    const wh = ImageManager.standardFaceHeight + padding * 2;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.nicknameInputWindowRect = function() {
    const wx = this._nicknameEditWindow.x;
    const wy = this._nicknameEditWindow.y + this._nicknameEditWindow.height + 8;
    const ww = this._nicknameEditWindow.width;
    const wh = this.calcWindowHeight(9, true);
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createStaticMessageWindow = function() {
    const rect = this.staticMessageWindowRect();
    this._staticMessageWindow = new PokemonMZ_BattleStaticMessageWindow(rect);
    this.addWindow(this._staticMessageWindow);
};
PokemonMZ_Scene_Battle.prototype.staticMessageWindowRect = function() {
    const ww = Graphics.boxWidth - this._playerInputWindow.width;
    const wh = this.calcWindowHeight(4, true);
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createHelpWindow = function() {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this._helpWindow.hide();
    this.addWindow(this._helpWindow);
};
PokemonMZ_Scene_Battle.prototype.helpWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createItemWindow = function() {
    const rect = this.itemWindowRect();
    this._itemWindow = new PokemonMZ_Window_ItemList_Gen1(rect, true);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this._itemWindow.hide();
    this.addWindow(this._itemWindow);
};
PokemonMZ_Scene_Battle.prototype.item = function() {
    return this._itemWindow.item();
};
PokemonMZ_Scene_Battle.prototype.itemWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaBottom();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonListWindow = function() {
    const rect = this.pokemonListWindowRect();
    this._pokemonListWindow = new PokemonMZ_Window_MenuPokemonList(rect);
    this._pokemonListWindow.setHandler("ok", this.onSelectPokemon.bind(this));
    this._pokemonListWindow.setHandler("cancel", this.onCancelPokemon.bind(this));
    this.addWindow(this._pokemonListWindow);
    this._pokemonListWindow.hide();
};
PokemonMZ_Scene_Battle.prototype.pokemonListWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonCommandWindow = function() {
    const rect = this.pokemonCommandWindowRect();
    this._pokemonCommandWindow = new PokemonMZ_Window_MenuPokemonCommand(rect, true);
    this._pokemonCommandWindow.openness = 0;
    this._pokemonCommandWindow.deactivate();
    this._pokemonCommandWindow.setHandler("ok", this.onSelectPokemonCommand.bind(this));
    this._pokemonCommandWindow.setHandler("cancel", this.onCancelPokemonCommand.bind(this));
    this.addWindow(this._pokemonCommandWindow);
};
PokemonMZ_Scene_Battle.prototype.pokemonCommandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true); // To change with gen2 if more items
    const wx = 0
    const wy = 0
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonMenuMessageWindow = function() {
    const rect = this.pokemonMenuMessageWindowRect();
    this._pokemonMenuMessageWindow = new PokemonMZ_Window_MenuPokemonMessage(rect);
    this._pokemonMenuMessageWindow.setHandler("messageTerminated", this.onPokemonMenuMessageTerminated.bind(this))
    this.addWindow(this._pokemonMenuMessageWindow);
};
PokemonMZ_Scene_Battle.prototype.pokemonMenuMessageWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonCompleteStatusWindow = function() {
    const rect = this.pokemonCompleteStatusWindowRect();
    this._completeStatusWindow = new PokemonMZ_Window_MenuPokemonStatus(rect);
    this._completeStatusWindow.openness = 0;
    this._completeStatusWindow.setHandler("cancel", this.onCancelCompleteStatus.bind(this));
    this.addWindow(this._completeStatusWindow);
};
PokemonMZ_Scene_Battle.prototype.pokemonCompleteStatusWindowRect = function() {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonMovesWindows = function() {
    const rect1 = this.pokemonMovesWindowRect();
    this._pokemonMovesWindow = new PokemonMZ_Window_PokemonBattleMoves(rect1);
    this._pokemonMovesWindow.openness = 0;
    this._pokemonMovesWindow.setHandler("ok", this.onSelectPokemonMove.bind(this));
    this._pokemonMovesWindow.setHandler("cancel", this.onCancelPokemonMove.bind(this));
    this.addWindow(this._pokemonMovesWindow);

    const rect2 = this.forgetPokemonMovesWindowRect();
    this._forgetPokemonMovesWindow = new PokemonMZ_Window_PokemonForgetMoves(rect2);
    this._forgetPokemonMovesWindow.openness = 0;
    this._forgetPokemonMovesWindow.setHandler("ok", this.onSelectForgetPokemonMove.bind(this));
    this._forgetPokemonMovesWindow.setHandler("cancel", this.onCancelForgetPokemonMove.bind(this));
    this.addWindow(this._forgetPokemonMovesWindow);
};
PokemonMZ_Scene_Battle.prototype.pokemonMovesWindowRect = function() {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, true);
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.forgetPokemonMovesWindowRect = function() {
    const ww = this.mainCommandWidth()*2;
    const wh = this.calcWindowHeight(4, true);
    const wx = Graphics.boxWidth - ww;
    const wy = this._staticMessageWindow.y - wh;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokemonLevelUpWindow = function() {
    const rect = this.pokemonLevelUpWindowRect();
    this._pokemonLevelUpWindow = new PokemonMZ_PokemonLevelUpWindow(rect);
    this.addWindow(this._pokemonLevelUpWindow);
};
PokemonMZ_Scene_Battle.prototype.pokemonLevelUpWindowRect = function() {
    const ww = 200;
    const wh = this.calcWindowHeight(4, false);
    const wh2 = this.calcWindowHeight(2, false);
    const wx = 750 - ww;
    const wy = Graphics.boxHeight - wh*2 - wh2 - 50;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createPokedexWindow = function() {
    const rect = this.pokedexDataWindowRect();
    this._pokedexDataWindow = new PokemonMZ_Window_Pokedex_Gen1_PokedexData(rect, false);
    this._pokedexDataWindow.setPokedexNumberPadding(this._pokedexMaxNumber);
    this._pokedexDataWindow.setHandler("ok", this.onPokedexDataClose.bind(this));
    this._pokedexDataWindow.setHandler("cancel", this.onPokedexDataClose.bind(this));
    this._pokedexDataWindow.hide();
    this.addWindow(this._pokedexDataWindow);
};
PokemonMZ_Scene_Battle.prototype.pokedexDataWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
};
PokemonMZ_Scene_Battle.prototype.createSpriteset = function() {
    this._spriteset = new PokemonMZ_Spriteset_Battle();
    this.addChild(this._spriteset);
};
PokemonMZ_Scene_Battle.prototype.update = function() {
    const active = this.isActive();
    $gameTimer.update(active);
    $gameScreen.update();
    this.updateVisibility();
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
    }
    this.PokemonMZ_updateItemEffects();
    Scene_Message.prototype.update.call(this);
};
PokemonMZ_Scene_Battle.prototype.updateVisibility = function() {
    let visible = this.isAnyInputWindowActive();
    visible = visible && !this._playerInputWindow.active;
    visible = visible && !this._pokemonMovesWindow.active;
    if (this._helpWindow) { this._helpWindow.visible = visible; }
    if (this._cancelButton) { this._cancelButton.visible = visible; }
};
PokemonMZ_Scene_Battle.prototype.updateBattleProcess = function() {
    PokemonMZ_BattleManager.update(this.isTimeActive());
};
PokemonMZ_Scene_Battle.prototype.updatePokemonRecover = function() {
    this._mustReturnToBattle = this.PokemonMZ_updatePokemonRecover(
         this._pokemonListWindow, 
         this._pokemonMenuMessageWindow
    )
};
PokemonMZ_Scene_Battle.prototype.updatePokemonCureStatus = function() { 
    this._mustReturnToBattle = this.PokemonMZ_updatePokemonCureStatus(
         this._pokemonListWindow, 
         this._pokemonMenuMessageWindow
    )
};
PokemonMZ_Scene_Battle.prototype.isTimeActive = function() {
    // if (BattleManager.isActiveTpb()) {
    //     return !this._skillWindow.active && !this._itemWindow.active;
    // } else {
    //     return !this.isAnyInputWindowActive();
    // }
    return false;
};
PokemonMZ_Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return (
        this._playerInputWindow.active ||
        this._itemWindow.active ||
        this._pokemonListWindow.active ||
        this._pokemonCommandWindow.active ||
        this._pokemonMovesWindow.active
    )
};
PokemonMZ_Scene_Battle.prototype.menuSelectedPokemon = function() {
    return $gamePlayerTrainer.pokemon(this._pokemonListWindow.index());
};
PokemonMZ_Scene_Battle.prototype.commandFight = function() {
    const pokemon = PokemonMZ_BattleManager.playerPokemon();
    const enemyPokemon = PokemonMZ_BattleManager.enemyPokemon();

    // Bide - Cannot choose moves
    if (pokemon.isBiding()) {
        this.forceMove(pokemon.lastMoveIndex());
        return;
    }

    // Opponent bound // player bound- Keep binding
    if (pokemon.isBound() || enemyPokemon.isBound()) {
        this.forceMove(pokemon.lastMoveIndex());
        return;
    }

    if (PokemonMZ_BattleManager.hasPlayerAnyMoveUseable()) {
        const lastIndex = pokemon.lastMoveIndex();
        this._pokemonMovesWindow.setPokemon(pokemon);
        if (lastIndex) {
            if (lastIndex < pokemon.moves().length) {
                this._pokemonMovesWindow.select(lastIndex);
            } else {
                this._pokemonMovesWindow.select(0);
            }
        } else {
            this._pokemonMovesWindow.select(0);
        }
        this._pokemonMovesWindow.open();
        this._pokemonMovesWindow.activate();
        this._playerInputWindow.deactivate();
    } else {
        // Force struggle action
        this.forceMove(-1);
    }
};
PokemonMZ_Scene_Battle.prototype.forceMove = function(index) {
    this._pokemonCommandWindow.close();
    this._pokemonMovesWindow.close();
    this._playerInputWindow.close();
    this._staticMessageWindow.hide();
    PokemonMZ_BattleManager.resetPlayerEscapeAttempts();
    PokemonMZ_BattleManager.setPlayerMoveIndex(index);
    PokemonMZ_BattleManager.calculateComputerMove();
};

PokemonMZ_Scene_Battle.prototype.commandPokemon = function() {
    this._pokemonSelectMode = "commandPokemon";
    this._pokemonListWindow.authorizeCancel();
    this._pokemonListWindow.show();
    this._pokemonListWindow.activate();
    this._itemWindow.deactivate();
};
PokemonMZ_Scene_Battle.prototype.commandItem = function() {
    this._itemWindow.refresh();
    this._itemWindow.show();
    this._itemWindow.activate();
    this._itemWindow.selectLastIndex();
    this._playerInputWindow.deactivate();
};
PokemonMZ_Scene_Battle.prototype.commandRun = function() { 
    this._playerInputWindow.close();
    this._staticMessageWindow.hide();
    PokemonMZ_BattleManager.changePhase("tryRunAway");
};
PokemonMZ_Scene_Battle.prototype.onItemOk = function() {
    const selectedItem = this._itemWindow.item()
    if (selectedItem) {
        switch(selectedItem.pkmz_data.effect) {
        case "ball":
            if ($gamePlayerTrainer.canGetPokemon()) {
                this.onDirectItemUse(selectedItem)
            } else {
                this._itemWindow.hide();
                this._itemWindow.deactivate();
                this._playerInputWindow.close();
                this._staticMessageWindow.hide();
                $gameMessage.add("The Pokémon Box is full! Can't use that item!")
                PokemonMZ_BattleManager.changePhase("startPlayerInput")
            }
            break;
        default:
            this._pokemonSelectMode = "useItem";
            this._pokemonListWindow.authorizeCancel();
            this._pokemonListWindow.show();
            this._pokemonListWindow.activate();
            this._itemWindow.deactivate();
        }
    } else {
        SoundManager.playBuzzer();
        this._itemWindow.activate();
    }
    
};
PokemonMZ_Scene_Battle.prototype.onDirectItemUse = function(item) {
    this._itemWindow.hide();
    this._itemWindow.deactivate();
    this._playerInputWindow.close();
    this._staticMessageWindow.hide();
    PokemonMZ_BattleManager.startPlayerItemUse(item);
    PokemonMZ_BattleManager.calculateComputerMove();
};
PokemonMZ_Scene_Battle.prototype.onItemCancel = function() {
    this._itemWindow.deactivate();
    this._itemWindow.hide();
    this._playerInputWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.onSelectPokemon = function() {
    const pokemon = this.menuSelectedPokemon();
    const pokemonIndex = this._pokemonListWindow.index()
    switch(this._pokemonSelectMode) {
    case "commandPokemon":
        const rect = this._pokemonListWindow.itemRect(this._pokemonListWindow.index());
        const newX = this._pokemonListWindow.x + rect.x + rect.width - this._pokemonCommandWindow.width;
        const commandHeight = this._pokemonCommandWindow.height;

        let newY = this._pokemonListWindow.y + rect.y + rect.height + this._pokemonCommandWindow.itemPadding();
        if (newY + commandHeight > this._pokemonListWindow.y + this._pokemonListWindow.height) {
            newY = this._pokemonListWindow.y + rect.y - commandHeight + this._pokemonCommandWindow.itemPadding();
        }
        this._pokemonCommandWindow.setLocation(newX, newY);
        this._pokemonCommandWindow.open();
        this._pokemonCommandWindow.activate();
        break;

    case "useItem":
        const selectedItem = this._itemWindow.item()
        const useResult = pokemon.canUseItemOn(selectedItem);
        if (useResult.success) {
            PokemonMZ_BattleManager.startPlayerItemUse(selectedItem)
            const effect = pokemon.itemEffect(selectedItem);
            this.PokemonMZ_createRecoveryData(pokemon, effect, this._pokemonListWindow);
        } else {
            this._pokemonListWindow.deactivate();
            this._pokemonMenuMessageWindow.setText(useResult.message);
            this._pokemonMenuMessageWindow.startMessage();
        }
        break;
    case "sendPokemon":
        if (PokemonMZ_BattleManager.canSwitchPokemon(pokemon)) {
            this._pokemonListWindow.hide();
            this._staticMessageWindow.hide();
            PokemonMZ_BattleManager.changePlayerPokemon(pokemon, pokemonIndex);
            PokemonMZ_BattleManager.changePhase("playerSendNextPokemon");
        } else {
            this._pokemonMenuMessageWindow.setText(PokemonMZ_BattleManager.switchRefusalReason());
            this._pokemonMenuMessageWindow.startMessage();
        }
        break;
    case "shiftPokemon":
        if (PokemonMZ_BattleManager.canSwitchPokemon(pokemon)) {
            this._pokemonListWindow.hide();
            this._staticMessageWindow.hide();
            PokemonMZ_BattleManager.setPlayerShiftingPokemon(this._pokemonListWindow.index());
            PokemonMZ_BattleManager.changePhase("enemySendNextPokemon");
        } else {
            this._pokemonMenuMessageWindow.setText(PokemonMZ_BattleManager.switchRefusalReason());
            this._pokemonMenuMessageWindow.startMessage();
        }
        break;
    }
};
PokemonMZ_Scene_Battle.prototype.onPokemonMenuMessageTerminated = function() {
    switch(this._pokemonSelectMode) {
    case "commandPokemon":
        this._pokemonCommandWindow.close();
        this._pokemonListWindow.activate();
        break;
    case "useItem":
        this._itemWindow.setLastIndex(this._itemWindow.index());
        if  (this._mustReturnToBattle) {
            this._mustReturnToBattle = false;
            this._pokemonCommandWindow.deactivate();
            this._pokemonCommandWindow.close();
            this._pokemonListWindow.deactivate();
            this._pokemonListWindow.hide();
            this._itemWindow.deactivate();
            this._itemWindow.hide();
            this._pokemonMovesWindow.close();
            this._playerInputWindow.close();
            this._staticMessageWindow.hide();
            PokemonMZ_BattleManager.calculateComputerMove();
        } else {
            this._pokemonListWindow.deactivate();
            this._pokemonListWindow.hide();
            this._itemWindow.activate();
        }
        break;
    case "sendPokemon":
    case "shiftPokemon":
        this._pokemonListWindow.activate();
        break;
    }
}
PokemonMZ_Scene_Battle.prototype.onCancelPokemon = function() {
    switch(this._pokemonSelectMode) {
    case "commandPokemon":
        this._pokemonListWindow.deactivate();
        this._pokemonListWindow.hide();
        this._playerInputWindow.activate();
        break;
    case "useItem":
        this._pokemonListWindow.deactivate();
        this._pokemonListWindow.hide();
        this._itemWindow.activate();
        break;
    case "shiftPokemon":
        this._pokemonListWindow.deactivate();
        this._pokemonListWindow.hide();
        PokemonMZ_BattleManager.changePhase("enemySendNextPokemon");
        break;
    }
};
PokemonMZ_Scene_Battle.prototype.onSelectPokemonCommand = function() {
    const pokemon = this.menuSelectedPokemon();
    switch(this._pokemonCommandWindow.currentSymbol()) {
        case "stats":
            this.onSelectPokemonCommandStats(pokemon);
            break;
        case "switch":
            this.onSelectPokemonCommandSwitch(pokemon);
            break;
    }

};
PokemonMZ_Scene_Battle.prototype.onCancelPokemonCommand = function() {
    this._pokemonCommandWindow.deactivate();
    this._pokemonCommandWindow.close();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.onSelectPokemonCommandStats = function(pokemon) {
    this._pokemonCommandWindow.close();
    this._completeStatusWindow.setPokemon(pokemon);
    this._completeStatusWindow.open();
    this._completeStatusWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.onSelectPokemonCommandSwitch = function(pokemon) { 
    if (PokemonMZ_BattleManager.canSwitchPokemon(pokemon)) {
        const pokemon = this.menuSelectedPokemon();
        this._mustReturnToBattle = false;
        this._pokemonCommandWindow.deactivate();
        this._pokemonCommandWindow.close();
        this._pokemonListWindow.deactivate();
        this._pokemonListWindow.hide();
        this._itemWindow.deactivate();
        this._itemWindow.hide();
        this._pokemonMovesWindow.close();
        this._playerInputWindow.close();
        this._staticMessageWindow.hide();
        PokemonMZ_BattleManager.setPlayerSwitchingPokemon(this._pokemonListWindow.index());
        PokemonMZ_BattleManager.calculateComputerMove();
    } else {
        // Display refusal message
        this._pokemonListWindow.deactivate();
        this._pokemonMenuMessageWindow.setText(PokemonMZ_BattleManager.switchRefusalReason());
        this._pokemonMenuMessageWindow.startMessage();
    }
};
PokemonMZ_Scene_Battle.prototype.onCancelCompleteStatus = function() {
    this._completeStatusWindow.close();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.onSelectPokemonMove = function() { 
    const moveIndex = this._pokemonMovesWindow.currentSymbol();
    const moveUseability = PokemonMZ_BattleManager.playerMoveUseability(moveIndex);

    if (moveUseability == "") {
        const pokemon = PokemonMZ_BattleManager.playerPokemon();
        pokemon.setLastMoveIndex(moveIndex);
        this._pokemonCommandWindow.close();
        this._pokemonMovesWindow.close();
        this._playerInputWindow.close();
        this._staticMessageWindow.hide();
        PokemonMZ_BattleManager.resetPlayerEscapeAttempts();
        PokemonMZ_BattleManager.setPlayerMoveIndex(this._pokemonMovesWindow.currentSymbol());
        PokemonMZ_BattleManager.calculateComputerMove();
    } else {
        this._staticMessageWindow.hide();
        this._pokemonMovesWindow.hide();
        this._playerInputWindow.hide();
        PokemonMZ_BattleManager.changePhase("playerMoveForbidden");
        $gameMessage.add(moveUseability);
    }

};
PokemonMZ_Scene_Battle.prototype.onCancelPokemonMove = function() {
    this._pokemonMovesWindow.close();
    this._playerInputWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.onPokedexDataClose = function() {
    this._pokedexDataWindow.hide();
    PokemonMZ_BattleManager.changePhase("askForNickname")
};
PokemonMZ_Scene_Battle.prototype.commandYes = function() {
    // Pressed yes on yes/no window
    const mode = this._yesNoWindow.mode();
    
    switch(mode) {
    case "nickname":
        // Said yes to give Pokémon nickname
        this._yesNoWindow.close();
        this._playerInputWindow.hide();
        this._staticMessageWindow.hide();
        this._nicknameEditWindow.setup(PokemonMZ_BattleManager.capturedPokemon(), 16);
        this._nicknameEditWindow.open();
        this._nicknameEditWindow.refresh();
        this._nicknameInputWindow.open();
        break;
    case "nextPokemon":
        // Said yes to send next pokémon
        this._yesNoWindow.close();
        this.chooseNextPokemon();
        break;
    case "shift":
        // Said yes to choose another pokémon when enemy changes
        this._yesNoWindow.close();
        this.shiftNextPokemon();
        break;
    case "learnMove":
        // Said yes to delete an older move
        this._forgetPokemonMovesWindow.clearCommandList();
        const pokemon1 = PokemonMZ_BattleManager.levelingUpPokemon();
        this._forgetPokemonMovesWindow.setPokemon(pokemon1);
        this._staticMessageWindow.setText("Which move should be forgotten?");
        this._forgetPokemonMovesWindow.show();
        this._forgetPokemonMovesWindow.open();
        this._forgetPokemonMovesWindow.activate();
        this._forgetPokemonMovesWindow.select(0);
        break;
    case "abandonMove":
        // Said yes to abandon move
        this._yesNoWindow.close();
        const move = PokemonMZ_BattleManager.moveAskedFor();
        const pokemon2 = PokemonMZ_BattleManager.levelingUpPokemon();
        const moveName = pokemon2.moveNameFromStringId(move);
        const message = pokemon2.name() + " did not learn " + moveName + "!";
        this._playerInputWindow.hide();
        this._staticMessageWindow.hide();
        $gameMessage.add(message)
        PokemonMZ_BattleManager.clearMoveAskedFor();
        PokemonMZ_BattleManager.changePhase("startLearningMove");
        break;
    }
}
PokemonMZ_Scene_Battle.prototype.commandNo = function() {
    // Pressed yes on yes/no window
    const mode = this._yesNoWindow.mode();
    
    
    switch(mode) {
    case "nickname":
        // Said no to give Pokémon nickname
        this._yesNoWindow.close();
        this._playerInputWindow.hide();
        this._staticMessageWindow.hide();
        this.finishCapture();
        break;
    case "nextPokemon":
        // Said no to send next pokemon
        this._yesNoWindow.close();
        this._playerInputWindow.hide();
        this._staticMessageWindow.hide();
        PokemonMZ_BattleManager.startPlayerEscape();
        break;
    case "shift":
        // Said no to change pokemon
        this._yesNoWindow.close();
        this._playerInputWindow.show();
        this._staticMessageWindow.hide();
        PokemonMZ_BattleManager.changePhase("enemySendNextPokemon");
        break;
    case "learnMove":
        // Said no to delete an older move
        this._yesNoWindow.close();
        const move = PokemonMZ_BattleManager.moveAskedFor();
        const pokemon = PokemonMZ_BattleManager.levelingUpPokemon();
        const moveName = pokemon.moveNameFromStringId(move);
        const message = "Abandon learning " + moveName + "?";
        this._staticMessageWindow.setText(message);
        this._yesNoWindow.setMode("abandonMove")
        this._yesNoWindow.activate();
        this._yesNoWindow.select(0);
        this._yesNoWindow.show();
        break;
    case "abandonMove":
        // Said no to abandon move
        this._yesNoWindow.close();
        this._staticMessageWindow.hide();
        PokemonMZ_BattleManager.proceedLearningMoveAsk();
        break;
    }
}
PokemonMZ_Scene_Battle.prototype.hasGivenNickname = function() {
    const pokemon = PokemonMZ_BattleManager.capturedPokemon()
    pokemon.setNickname(this._nicknameEditWindow.name());
    this._nicknameEditWindow.close();
    this._nicknameInputWindow.close();
    this.finishCapture();
}
PokemonMZ_Scene_Battle.prototype.finishCapture = function() {
    this._playerInputWindow.hide();
    this._staticMessageWindow.hide();

    if ($gamePlayerTrainer.canGetPokemonInParty()) {
        PokemonMZ_BattleManager.changePhase("addWildToParty");
    } else {
        PokemonMZ_BattleManager.changePhase("addWildToBox");
    }
};
PokemonMZ_Scene_Battle.prototype.chooseNextPokemon = function() {
    this._pokemonSelectMode = "sendPokemon";
    this._pokemonListWindow.forbidCancel();
    this._pokemonListWindow.refreshAll();
    this._pokemonListWindow.show();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.shiftNextPokemon = function() {
    this._staticMessageWindow.hide();
    this._pokemonSelectMode = "shiftPokemon";
    this._pokemonListWindow.authorizeCancel();
    this._pokemonListWindow.show();
    this._pokemonListWindow.activate();
};
PokemonMZ_Scene_Battle.prototype.onSelectForgetPokemonMove = function() {
    this._forgetPokemonMovesWindow.close();
    this._yesNoWindow.close();
    this._staticMessageWindow.hide();
    AudioManager.playStandardSe(PokemonMZ.forgetMoveSE);
    const move = PokemonMZ_BattleManager.moveAskedFor();
    const pokemon = PokemonMZ_BattleManager.levelingUpPokemon();
    const moveName = pokemon.moveNameFromStringId(move);
    const index = this._forgetPokemonMovesWindow.currentSymbol();
    const forgottenMove = pokemon.moveNameFromIndex(index);
    pokemon.replaceMoveAtIndexBy(index, move);
    const message = "1, 2 and... Poof! " + pokemon.name() + " forgot " + forgottenMove + "! And..."
    $gameMessage.add(message)
    PokemonMZ_BattleManager.changePhase("finishReplacingMove");
};
PokemonMZ_Scene_Battle.prototype.onCancelForgetPokemonMove = function() {
    this._forgetPokemonMovesWindow.close();
    this._yesNoWindow.close();
    const move = PokemonMZ_BattleManager.moveAskedFor();
    const pokemon = PokemonMZ_BattleManager.levelingUpPokemon();
    const moveName = pokemon.moveNameFromStringId(move);
    const message = "Abandon learning " + moveName + "?";
    this._staticMessageWindow.setText(message);
    this._yesNoWindow.setMode("abandonMove")
    this._yesNoWindow.select(1);
    this._yesNoWindow.activate();
    this._yesNoWindow.show();
};
