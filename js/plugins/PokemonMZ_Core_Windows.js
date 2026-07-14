//=============================================================================
// RPG Maker MZ - PokemonMZ - Core Window plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core window plugin for PokemonMZ
 * @author Schlangan
*/


// Window_Base edits
Window_Base.prototype.setLocation = function(x,y) {
    this.x = x;
    this.y = y;
};
const PokemonMZ_WindowBase_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
    text = PokemonMZ_WindowBase_convertEscapeCharacters.call(this,text);

    // Add replacement for /PK[x] as pokemon (Enemy) name.
    text = text.replace(/\x1bPK\[(\d+)\]/gi, (_, p1) =>
        this.PokemonMZ_pokemonName(parseInt(p1))
    );
    text = text.replace(/\x1bPKS/gi, $gamePlayerTrainer.numPokemonSeen());
    text = text.replace(/\x1bPKO/gi, $gamePlayerTrainer.numPokemonCaptured());

    return text;
};
Window_Base.prototype.PokemonMZ_pokemonName = function(n) {
    const enemy = n >= 1 ? $dataEnemies[n] : null;
    return enemy ? enemy.name : "";
};
Window_Base.prototype.PokemonMZ_drawPokemon = function(bitmap, x, y, width, height) {
    width = width || ImageManager.pokemonSpriteWidth;
    height = height || ImageManager.pokemonSpriteHeight;
    const pw = ImageManager.pokemonSpriteWidth;
    const ph = ImageManager.pokemonSpriteHeight;
    const sw = Math.min(width, pw);
    const sh = Math.min(height, ph);
    const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    const sx = 0;
    const sy = 0;
    this.contents.blt(bitmap, sx, sy, pw, pw, dx, dy, width, height);
};
Window_Base.prototype.PokemonMZ_drawPokemonFront = function(pokemon, x, y, width, height) {
    const bitmap = ImageManager.PokemonMZ_loadPokemonFront(pokemon._data.id);
    bitmap.addLoadListener(this.PokemonMZ_drawPokemon.bind(this, bitmap, x, y, width, height))
};
Window_Base.prototype.PokemonMZ_drawPokemonBack = function(pokemon, x, y, width, height) {
    const bitmap = ImageManager.PokemonMZ_loadPokemonBack(pokemon._data.id);
    bitmap.addLoadListener(this.PokemonMZ_drawPokemon.bind(this, bitmap, x, y, width, height))
};
Window_Base.prototype.PokemonMZ_drawHorzLine = function(x,y,width) {
    this.drawRect(x, y, width, 3);
};
Window_Base.prototype.PokemonMZ_drawVertLine = function(x,y,height) {
    this.drawRect(x, y, 3, height);
};
Window_Base.prototype.PokemonMZ_drawTextWrap = function(text, x, y, maxWidth, lineHeight, align = "left") {
    if (!text) return 0;

    text = String(text);
    text = this.convertEscapeCharacters(text);

    lineHeight = lineHeight || this.lineHeight();
    maxWidth = maxWidth || this.contentsWidth() - x;

    let lines = [];
    let currentLine = "";
    const words = text.split(/(\s+|\n)/);
    for (let word of words) {
        if (word === "\n") {
            lines.push(currentLine);
            currentLine = "";
            continue;
        }
        const testLine = currentLine + word;
        const testWidth = this.textWidth(testLine);
        if (testWidth > maxWidth && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine.trim());
    }

    let ty = y;
    let totalHeight = 0;

    for (let line of lines) {
        if (line.length > 0) {
            this.drawText(line, x, ty, maxWidth, align);
        }
        ty += lineHeight;
        totalHeight += lineHeight;
    }

    return totalHeight;
};


// Window_TitleCommand
const PokemonMZ_Window_TitleCommand_initialize = Window_TitleCommand.prototype.initialize;
Window_TitleCommand.prototype.initialize = function(rect, height) {
	this._hasContinue = DataManager.isAnySavefileExists();
    this._continueHeight = height;
    PokemonMZ_Window_TitleCommand_initialize.call(this, rect);
};
Window_TitleCommand.prototype.makeCommandList = function() {
    if (this._hasContinue == true) {
        this.addCommand("Continue", "continue");
    }
    this.addCommand("New Game", "newGame");
    this.addCommand("Options", "options");
	this.addCommand("Quit", "exit");
};
const PokemonMZ_Window_TitleCommand_drawItem = Window_TitleCommand.prototype.drawItem;
Window_TitleCommand.prototype.drawItem = function(index) {
    if (this._hasContinue == false || index > 0) {
        PokemonMZ_Window_TitleCommand_drawItem.call(this, index);
    } else {
        this.drawContinue(index);
    }    
};
Window_TitleCommand.prototype.itemRect = function(index) {
    if (this._hasContinue == false) {
        return Window_Selectable.prototype.itemRect.call(this, index);
    } else {
        const rect = Window_Selectable.prototype.itemRect.call(this, index);
        const maxCols = this.maxCols();
        const rowSpacing = this.rowSpacing();
        if (index == 0) {
            const y = rowSpacing / 2 - this.scrollBaseY();
            const height = this._continueHeight - rowSpacing;
            return new Rectangle(rect.x, y, rect.width, height);
        } else {
            const itemHeight = this.itemHeight();
            const row = Math.floor(index / maxCols) - 1;
            const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY() + this._continueHeight;
            return new Rectangle(rect.x, y, rect.width, rect.height);
        }
    }

};
Window_TitleCommand.prototype.drawContinue = function(index) {
    const info = DataManager.savefileInfo(1);
    const rect = this.itemRectWithPadding(index);
    const align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));

    const lineHeight = this.lineHeight();
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    this.changeTextColor(ColorManager.crisisColor());
    this.drawText($gamePlayerTrainer.name(), rect.x, rect.y + lineHeight, 96, 'center')
    this.resetTextColor();
    this.drawCharacter($gamePlayerTrainer.characterName(), $gamePlayerTrainer.characterIndex(), rect.x + 50, rect.y + lineHeight*4);
    const x2 = rect.x + 150;
    const x3 = x2 + 130;
    const w2 = rect.width - 150;
    const w3 = w2 - 130;
    this.contents.fontSize = $gameSystem.mainFontSize() - 3;
    this.drawText('Badges:', x2, rect.y + lineHeight*2, w2, 'left')
    this.drawText($gamePlayerTrainer.badgesCount(), x3, rect.y + lineHeight*2, w2, 'left')
    this.drawText('Pokedex:', x2, rect.y + lineHeight*3, w2, 'left')
    this.drawText($gamePlayerTrainer.numPokemonCaptured(), x3, rect.y + lineHeight*3, w2, 'left')
    this.drawText('Playtime:', x2, rect.y + lineHeight*4, w2, 'left')
    this.drawText(info.playtime, x3, rect.y + lineHeight*4, w2, 'left')
    this.contents.fontSize = $gameSystem.mainFontSize();
};
Window_TitleCommand.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
    const bitmap = ImageManager.loadCharacter(characterName);
    bitmap.addLoadListener(
        Window_Base.prototype.drawCharacter.bind(
            this, characterName, characterIndex,x,y
        )
    );
};

// Window_Options
Window_Options.prototype.makeCommandList = function() {
    this.addGeneralOptions();
    this.addPokemonOptions();
    this.addVolumeOptions();
};
Window_Options.prototype.addGeneralOptions = function() {
    //this.addCommand(TextManager.alwaysDash, "alwaysDash");
    //this.addCommand(TextManager.commandRemember, "commandRemember");
    this.addCommand(TextManager.touchUI, "touchUI");
};
Window_Options.prototype.addPokemonOptions = function() {
    //this.addCommand(TextManager.alwaysDash, "alwaysDash");
    //this.addCommand(TextManager.commandRemember, "commandRemember");
    this.addCommand("Battle Animation", "battleAnimation");
    this.addCommand("Battle Style", "battleStyle");
};
const PokemonMZ_Window_Options_statusText = Window_Options.prototype.statusText;
Window_Options.prototype.statusText = function(index) {
    const symbol = this.commandSymbol(index);
    const value = this.getConfigValue(symbol);
    if (this.PokemonMZ_isBattleStyleSymbol(symbol)) {
        return this.PokemonMZ_battleStyleText(value);
    } else {
        return PokemonMZ_Window_Options_statusText.call(this, index);
    }
};

Window_Options.prototype.PokemonMZ_isBattleStyleSymbol = function(symbol) {
    return symbol == "battleStyle";
};
Window_Options.prototype.PokemonMZ_battleStyleText = function(value) {
    if (value == "shift") {
        return "Shift"
    } else if (value == "set") {
        return "Set"
    } else {
        return "";
    }
};
const PokemonMZ_Window_Options_processOk = Window_Options.prototype.processOk;
Window_Options.prototype.processOk = function() {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.PokemonMZ_isBattleStyleSymbol(symbol)) {
        this.PokemonMZ_changeBattleStyle();
    } else {
        PokemonMZ_Window_Options_processOk.call(this);
    }
};
const PokemonMZ_Window_Options_cursorRight = Window_Options.prototype.cursorRight;
Window_Options.prototype.cursorRight = function() {
    const index = this.index();
    const symbol = this.commandSymbol(index);

    if (this.PokemonMZ_isBattleStyleSymbol(symbol)) {
        this.PokemonMZ_changeBattleStyle();
    } else {
        PokemonMZ_Window_Options_cursorRight.call(this);
    }
};
const PokemonMZ_Window_Options_cursorLeft = Window_Options.prototype.cursorLeft;
Window_Options.prototype.cursorLeft = function() {
    const index = this.index();
    const symbol = this.commandSymbol(index);

    if (this.PokemonMZ_isBattleStyleSymbol(symbol)) {
        this.PokemonMZ_changeBattleStyle();
    } else {
        PokemonMZ_Window_Options_cursorLeft.call(this);
    }
};
Window_Options.prototype.PokemonMZ_changeBattleStyle = function() {
    const symbol = "battleStyle";
    const lastValue = this.getConfigValue(symbol);
    let newValue = "shift";
    if (lastValue == "shift") {
        newValue = "set";
    }
    this.setConfigValue(symbol, newValue);
    this.redrawItem(this.findSymbol(symbol));
    this.playCursorSound();
}

// Window_Gold
Window_Gold.prototype.value = function() {
    return $gamePlayerTrainer.money();
};



// PokemonMZ_Window_MenuCommand
// The window for selecting a command on the menu screen.
function PokemonMZ_Window_MenuCommand() {
    this.initialize(...arguments);
}
PokemonMZ_Window_MenuCommand.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_MenuCommand.prototype.constructor = PokemonMZ_Window_MenuCommand;
PokemonMZ_Window_MenuCommand.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this.selectLast();
    this._canRepeat = false;
};
PokemonMZ_Window_MenuCommand._lastCommandSymbol = null;
PokemonMZ_Window_MenuCommand.initCommandPosition = function() {
    this._lastCommandSymbol = null;
};
PokemonMZ_Window_MenuCommand.prototype.makeCommandList = function() {
    if ($gamePlayerTrainer.hasPokedex()) {
        this.addCommand("Pokédex", "pokedex", true);
    }
    if ($gamePlayerTrainer.hasPokemon()) {
        this.addCommand("Pokémon", "pokemon", true);
    }
    this.addCommand("Item", "item", $gamePlayerTrainer.hasBagItems());
    this.addCommand($gamePlayerTrainer.name(), "player", true);
    this.addCommand("Save", "save", this.isSaveEnabled());
    this.addCommand("Option", "options", true);
    this.addCommand("Exit", "gameEnd", true);
};
PokemonMZ_Window_MenuCommand.prototype.isSaveEnabled = function() {
    return !DataManager.isEventTest() && $gameSystem.isSaveEnabled();
};
PokemonMZ_Window_MenuCommand.prototype.processOk = function() {
    PokemonMZ_Window_MenuCommand._lastCommandSymbol = this.currentSymbol();
    Window_Command.prototype.processOk.call(this);
};
PokemonMZ_Window_MenuCommand.prototype.selectLast = function() {
    this.selectSymbol(PokemonMZ_Window_MenuCommand._lastCommandSymbol);
};

// PokemonMZ_Window_SaveMessage
// The window for displaying a message before save
function PokemonMZ_Window_SaveMessage() {
    this.initialize(...arguments);
}
PokemonMZ_Window_SaveMessage.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_SaveMessage.prototype.constructor = PokemonMZ_Window_SaveMessage;
PokemonMZ_Window_SaveMessage.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.openness = 0;
    this._text = "";
};
PokemonMZ_Window_SaveMessage.prototype.displayWithText = function(text) {
    this._text = text;
    this.open();
    this.refresh();
}
PokemonMZ_Window_SaveMessage.prototype.refresh = function() {
    Window_Selectable.prototype.refresh.call(this);
    const lineHeight = this.lineHeight();
    const lines = this._text.split("\n");
    let y = 10;
    for (line of lines) {
        this.drawText(line, 10, y, Graphics.boxWidth, 32, "left");
        y += lineHeight;
    }

    
}

// PokemonMZ_Window_SaveConfirm
// The window for asking save confirmation
function PokemonMZ_Window_SaveConfirm() {
    this.initialize(...arguments);
}
PokemonMZ_Window_SaveConfirm.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_SaveConfirm.prototype.constructor = PokemonMZ_Window_SaveConfirm;
PokemonMZ_Window_SaveConfirm.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this.openness = 0;
};
PokemonMZ_Window_SaveConfirm.prototype.makeCommandList = function() {
    this.addCommand("Yes", "saveYes", true);
    this.addCommand("No", "saveNo", true);
};

// PokemonMZ_Window_ItemList_Gen1
// The window for item list with first generation mechanics (one single bag)
function PokemonMZ_Window_ItemList_Gen1() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ItemList_Gen1.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_ItemList_Gen1.prototype.constructor = PokemonMZ_Window_ItemList_Gen1;
PokemonMZ_Window_ItemList_Gen1.prototype.initialize = function(rect, inBattle) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._data = [];
    this._inBattle = inBattle;
    this._lastIndex = -1;
    this.refresh();
};
PokemonMZ_Window_ItemList_Gen1.prototype.maxCols = function() {
    return 2;
};
PokemonMZ_Window_ItemList_Gen1.prototype.maxItems = function() {
    return this._data ? this._data.length : 0;
};
PokemonMZ_Window_ItemList_Gen1.prototype.makeItemList = function() {
    if (this._inBattle) {
        this._data = $gamePlayerTrainer.battleBagItems();
    } else {
        this._data = $gamePlayerTrainer.bagItems();
    }
    
    if (this._data.length > 0) {
        this._index = 0;
    }
};
PokemonMZ_Window_ItemList_Gen1.prototype.drawItem = function(index) {
    const item = this.itemAt(index);
    if (item) {
        const numberWidth = this.numberWidth();
        const rect = this.itemLineRect(index);
        this.changePaintOpacity(this.isEnabled(item));
        this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
        this.drawItemNumber(item, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
    }
};
PokemonMZ_Window_ItemList_Gen1.prototype.updateHelp = function() {
    this.setHelpWindowItem(this.item());
};
PokemonMZ_Window_ItemList_Gen1.prototype.refresh = function() {
    this.makeItemList();
    Window_Selectable.prototype.refresh.call(this);
};
PokemonMZ_Window_ItemList_Gen1.prototype.itemAt = function(index) {
    return this._data && index >= 0 ? this._data[index] : null;
};
PokemonMZ_Window_ItemList_Gen1.prototype.numberWidth = function() {
    return this.textWidth("000");
};
PokemonMZ_Window_ItemList_Gen1.prototype.drawItemNumber = function(item, x, y, width) {
    if (this.needsNumber()) {
        this.drawText(":", x, y, width - this.textWidth("000"), "right");
        this.drawText($gamePlayerTrainer.numBagItems(item.id), x, y, width, "right");
    }
};
PokemonMZ_Window_ItemList_Gen1.prototype.isEnabled = function(item) {
    return true;
};
PokemonMZ_Window_ItemList_Gen1.prototype.needsNumber = function() {
    return true;
};
PokemonMZ_Window_ItemList_Gen1.prototype.item = function() {
    return this.itemAt(this.index());
};
PokemonMZ_Window_ItemList_Gen1.prototype.setLastIndex = function(index) {
    this._lastIndex = index;
};
PokemonMZ_Window_ItemList_Gen1.prototype.lastIndex = function() {
    return this._lastIndex;
};
PokemonMZ_Window_ItemList_Gen1.prototype.selectLastIndex = function() {
    if (this._lastIndex > -1) {
        if (this._lastIndex < this._data.length) {
            this.smoothSelect(this._lastIndex);
        } else if (this._data.length > 0) {
            this.smoothSelect(this._data.length - 1);
        } else {
            this.smoothSelect(-1);
        }
    } else {
        if (this._data.length > 0) {
            this.smoothSelect(0);
        } else {
            this.smoothSelect(-1);
        }
    } 

};


// PokemonMZ_Window_ItemListCommand_Gen1
// The window to display the Use/Toss command when selecting an item
function PokemonMZ_Window_ItemListCommand_Gen1() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ItemListCommand_Gen1.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ItemListCommand_Gen1.prototype.constructor = PokemonMZ_Window_ItemListCommand_Gen1;
PokemonMZ_Window_ItemListCommand_Gen1.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this._openness = 0;
    this._item = null;
};
PokemonMZ_Window_ItemListCommand_Gen1.prototype.setItem = function(item) {
    this._item = item;
};
PokemonMZ_Window_ItemListCommand_Gen1.prototype.makeCommandList = function() {
    const usable = this._item ? $gamePlayerTrainer.canUse(this._item) : false;
    const tossable = this._item ? $gamePlayerTrainer.canToss(this._item) : false;
    this.clearCommandList();
    this.addCommand("Use", "use", usable);
    this.addCommand("Toss", "toss", tossable);
};


// PokemonMZ_Window_PlayerProfile
// The window to display the player profile.
function PokemonMZ_Window_PlayerProfile() {
    this.initialize(...arguments);
}
PokemonMZ_Window_PlayerProfile.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_PlayerProfile.prototype.constructor = PokemonMZ_Window_PlayerProfile;
PokemonMZ_Window_PlayerProfile.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._playerActor = $gameActors.actor(PokemonMZ.playerActorID);
    this.loadFaceImage();
    this.activate();
};
PokemonMZ_Window_PlayerProfile.prototype.loadFaceImage = function() {
    const bitmap = ImageManager.loadFace(this._playerActor.faceName());
    bitmap.addLoadListener(this.refresh.bind(this));
};
PokemonMZ_Window_PlayerProfile.prototype.refresh = function() {
    Window_Selectable.prototype.refresh.call(this);

    this.drawFace(this._playerActor.faceName(), this._playerActor.faceIndex(), 50, 50, 144, 144);
    this.drawText("Name : " + this._playerActor.name(), 250, 50, 500);
    this.drawText("Money : " + $gamePlayerTrainer.money(), 250, 100, 1000);
    this.drawText("Playtime : " + $gameSystem.playtimeText(), 250, 150, 500);
};

// PokemonMZ_Window_PlayerBadges
// The window to display the player badges.
function PokemonMZ_Window_PlayerBadges() {
    this.initialize(...arguments);
}
PokemonMZ_Window_PlayerBadges.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_PlayerBadges.prototype.constructor = PokemonMZ_Window_PlayerBadges;
PokemonMZ_Window_PlayerBadges.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.refresh();
};
PokemonMZ_Window_PlayerBadges.prototype.refresh = function() {
    Window_Selectable.prototype.refresh.call(this);

    this.drawText("Badges:", 50, 50, 500);

    let index = 0;

    this.contents.fontSize -= 5;
    for (badgeId of PokemonMZ.badgeItemIds) {
        const badgeItem = $dataItems[badgeId];

        const x = index*50 + 100;
        const y = 100;

        if ($gamePlayerTrainer.hasBadge(badgeId)) {
            this.drawIcon(badgeItem.iconIndex, x, y)
        }
        index++;

        this.drawText(String(index), x+10, y+30, 50);
    }
    this.contents.fontSize += 5;
};

// PokemonMZ_Window_ComputerItemsMenu
// The window to display the Withdraw/Deposit/Toss menu inside computer
function PokemonMZ_Window_ComputerItemsMenu() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ComputerItemsMenu.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ComputerItemsMenu.prototype.constructor = PokemonMZ_Window_ComputerItemsMenu;
PokemonMZ_Window_ComputerItemsMenu.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ComputerItemsMenu.prototype.makeCommandList = function() {
    this.addCommand("Withdraw Item", "withdraw", $gamePlayerTrainer.hasStoredItems());
    this.addCommand("Deposit Item", "deposit", $gamePlayerTrainer.hasBagItems());
    this.addCommand("Toss Item", "toss", $gamePlayerTrainer.hasStoredItems());
    this.addCommand("Log off", "logoff", true);
};

// PokemonMZ_Window_ComputerItemsList
// The window to list the items inside storage or player bag
function PokemonMZ_Window_ComputerItemsList() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ComputerItemsList.prototype = Object.create(Window_ItemList.prototype);
PokemonMZ_Window_ComputerItemsList.prototype.constructor = PokemonMZ_Window_ComputerItemsList;
PokemonMZ_Window_ComputerItemsList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.openness = 0;
    this._data = [];
    this._mode = "";
};
PokemonMZ_Window_ComputerItemsList.prototype.setMode = function(mode) {
    if (this._mode !== mode) {
        this._mode = mode;
        this.refresh();
        this.scrollTo(0, 0);
        if (this._data.length > 0) {
            this._index = 0;
        }
    }
};
PokemonMZ_Window_ComputerItemsList.prototype.mode = function() {
    return this._mode;
};
PokemonMZ_Window_ComputerItemsList.prototype.maxCols = function() {
    return 2;
};
PokemonMZ_Window_ComputerItemsList.prototype.colSpacing = function() {
    return 16;
};
PokemonMZ_Window_ComputerItemsList.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
};
PokemonMZ_Window_ComputerItemsList.prototype.makeItemList = function() {
    switch(this._mode) {
    case "deposit":
        this._data = $gamePlayerTrainer.bagItems();
        break;
    case "withdraw":
    case "toss":
         this._data = $gamePlayerTrainer.storedItems();
        break;
    default:
        this._data = []
    }
};
PokemonMZ_Window_ComputerItemsList.prototype.isEnabled = function(item) {
    return true;
};
PokemonMZ_Window_ComputerItemsList.prototype.drawItemNumber = function(item, x, y, width) {
    let amount = 0;
    switch(this._mode) {
    case "deposit":
        amount = $gamePlayerTrainer.numBagItems(item.id);
        break;
    case "withdraw":
    case "toss":
        amount = $gamePlayerTrainer.numStoredItems(item.id);
        break;
    default:
        this._data = []
    }
    this.drawText(":", x, y, width - this.textWidth("000"), "right");
    this.drawText(amount, x, y, width, "right");
};

// PokemonMZ_Window_ComputerItemsNumber
// The window to select the amount of items to deal with
function PokemonMZ_Window_ComputerItemsNumber() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ComputerItemsNumber.prototype = Object.create(Window_NumberInput.prototype);
PokemonMZ_Window_ComputerItemsNumber.prototype.constructor = PokemonMZ_Window_ComputerItemsNumber;
PokemonMZ_Window_ComputerItemsNumber.prototype.initialize = function() {
    Window_NumberInput.prototype.initialize.call(this);
    this._minValue = 0;
    this._maxValue = 0;
    this._initialValue = 0;
    this._number = 0;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.setInitialValue = function(value) {
    this._initialValue = value;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.setMinValue = function(value) {
    this._minValue = value;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.setMaxValue = function(value) {
    this._maxValue = value;
    this._maxDigits = String(value).length;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.start = function() {
    this._number = this._initialValue;
    if (this._number < this._minValue) { this._number = this._minValue; }
    if (this._number > this._maxValue) { this._number = this._maxValue; }
    this.placeButtons();
    this.createContents();
    this.refresh();
    this.open();
    this.activate();
    this.select(0);
};
const PokemonMZ_Window_NumberInput_changeDigit = Window_NumberInput.prototype.changeDigit;
PokemonMZ_Window_ComputerItemsNumber.prototype.changeDigit = function(up) {
    PokemonMZ_Window_NumberInput_changeDigit.call(this,up);
    const currentNumber = this.getValue();
    if (this._number < this._minValue) { this._number = this._minValue; }
    if (this._number > this._maxValue) { this._number = this._maxValue; }
    if (this._number != currentNumber) {
        this.refresh();
    }

};
PokemonMZ_Window_ComputerItemsNumber.prototype.setValue = function(value) {
    this._number = value;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.getValue = function() {
    return this._number;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.refreshSize = function() {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
};
PokemonMZ_Window_ComputerItemsNumber.prototype.setLocation = function(x,y) {
    this.refreshSize();
    this.x = x;
    this.y = y;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.processOk = function() {
    this.playOkSound();
    this.updateInputData();
    this.deactivate();
    this.close();
    this.callHandler("numberOk");
};
PokemonMZ_Window_ComputerItemsNumber.prototype.isCancelEnabled = function() {
    return true;
};
PokemonMZ_Window_ComputerItemsNumber.prototype.callCancelHandler = function() {
    this.callHandler("numberCancel");
};


// PokemonMZ_Window_ComputerPokemonsMenu
// The window to display the Withdraw/Deposit/Release/Change menu inside computer
function PokemonMZ_Window_ComputerPokemonsMenu() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ComputerPokemonsMenu.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ComputerPokemonsMenu.prototype.constructor = PokemonMZ_Window_ComputerPokemonsMenu;
PokemonMZ_Window_ComputerPokemonsMenu.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ComputerPokemonsMenu.prototype.makeCommandList = function() {
    this.addCommand("Withdraw Pokémon", "withdraw", $gamePlayerTrainer.currentBoxHasPokemon() && $gamePlayerTrainer.canGetPokemonInParty());
    this.addCommand("Deposit Pokémon", "deposit", $gamePlayerTrainer.canDepositInCurrentBox());
    this.addCommand("Release Pokémon", "release", $gamePlayerTrainer.currentBoxHasPokemon());
    this.addCommand("Change Box", "changeBox", true);
    this.addCommand("See ya!", "cancel", true);
};

// PokemonMZ_Window_ComputerPokemonsMenu
// The window to display the selected box inside computer
function PokemonMZ_Window_ComputerPokemonsSelectedBox() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ComputerPokemonsSelectedBox.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_ComputerPokemonsSelectedBox.prototype.constructor = PokemonMZ_Window_ComputerPokemonsSelectedBox;
PokemonMZ_Window_ComputerPokemonsSelectedBox.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.refresh();
};
PokemonMZ_Window_ComputerPokemonsSelectedBox.prototype.refresh = function() {
    this.contents.clear();
    const boxName = $gamePlayerTrainer.currentBoxName();
    const boxCurrent = $gamePlayerTrainer.currentBoxPokemonCount();
    const boxMax = $gamePlayerTrainer.pokemonsPerBox();
    this.drawText(boxName + " (" + String(boxCurrent) + "/" + String(boxMax) + ")", 0, 0, this.contents.width, "right");
};

// PokemonMZ_Window_ComputerPokemonsBoxPokemonList
// The window to display the list of pokemons inside the box
function PokemonMZ_Window_ComputerPokemonsBoxPokemonList() {
    this.initialize(...arguments);
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.constructor = PokemonMZ_Window_ComputerPokemonsBoxPokemonList;
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this._mode = "";
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.setMode = function(mode) {
    this._mode = mode;
}
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.itemTextAlign = function() {
    return "left";
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.makeCommandList = function() {
    Window_Command.prototype.makeCommandList.call(this);
    let counter = 0;

    switch(this._mode) {
        case "withdraw":
        case "release":
            counter = 0;
            for (const pokemon of $gamePlayerTrainer.currentBoxPokemons()) {
                let text = pokemon.name() + " - Lvl. " + String(pokemon.level());
                this.addCommand(text, counter, true)
                counter++;
            }
            break;
        case "deposit":
            // Pokemon can be deposited if they are not the only non fainted pokemon
            const singleNonFainted = $gamePlayerTrainer.numberValidPokemon() == 1;

            counter = 0;
            for (const pokemon of $gamePlayerTrainer.pokemons()) {
                let text = pokemon.name() + " - Lvl. " + String(pokemon.level());
                if (singleNonFainted) {
                    this.addCommand(text, counter, pokemon.isFainted())
                } else {
                    this.addCommand(text, counter, true)
                }
                counter++;
            }
            break;
    }
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.isOkEnabled = function() {
    return this.isHandled("selectPokemon");
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.isCancelEnabled = function() {
    return this.isHandled("cancelPokemonSelect");
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.callOkHandler = function() {
    this.callHandler("selectPokemon")
};
PokemonMZ_Window_ComputerPokemonsBoxPokemonList.prototype.callCancelHandler = function() {
    this.callHandler("cancelPokemonSelect");
};

// PokemonMZ_Window_ComputerPokemonsCommandPokemon
// The window to display the options after selecting a pokemon
function PokemonMZ_Window_ComputerPokemonsCommandPokemon() {
    this.initialize(...arguments);
};
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.constructor = PokemonMZ_Window_ComputerPokemonsCommandPokemon;
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this._mode = "";
};
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.setMode = function(mode) {
    this._mode = mode;
}
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.makeCommandList = function() {
    Window_Command.prototype.makeCommandList.call(this);

    switch(this._mode) {
        case "withdraw":
            this.addCommand("Withdraw","withdraw", true);
            break;
        case "release":
            this.addCommand("Release","release", true);
            break;
        case "deposit":
            this.addCommand("Deposit","deposit", true);
            break;
    }
    this.addCommand("Stats","stats", true);

};
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.isOkEnabled = function() {
    return this.isHandled("commandPokemon");
};
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.isCancelEnabled = function() {
    return this.isHandled("cancelPokemon");
};
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.callOkHandler = function() {
    this.callHandler("commandPokemon")
};
PokemonMZ_Window_ComputerPokemonsCommandPokemon.prototype.callCancelHandler = function() {
    this.callHandler("cancelPokemon");
};


// PokemonMZ_Window_ComputerPokemonsBoxList
// The window to display the computer boxes
function PokemonMZ_Window_ComputerPokemonsBoxList() {
    this.initialize(...arguments);
};
PokemonMZ_Window_ComputerPokemonsBoxList.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.constructor = PokemonMZ_Window_ComputerPokemonsBoxList;
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.makeCommandList = function() {
    for (let i=0; i < $gamePlayerTrainer.numBoxes(); i++) {
        let boxName = $gamePlayerTrainer.boxName(i);
        let boxCurrent = $gamePlayerTrainer.boxPokemonCount(i);
        let boxMax = $gamePlayerTrainer.pokemonsPerBox();
        let text = boxName + " (" + String(boxCurrent) + "/" + String(boxMax) + ")";
        this.addCommand(text, i, $gamePlayerTrainer.selectedBox() != i);
    }
};
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.isOkEnabled = function() {
    return this.isHandled("selectBox");
};
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.isCancelEnabled = function() {
    return this.isHandled("cancelBoxSelect");
};
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.callOkHandler = function() {
    this.callHandler("selectBox")
};
PokemonMZ_Window_ComputerPokemonsBoxList.prototype.callCancelHandler = function() {
    this.callHandler("cancelBoxSelect");
};



// PokemonMZ_Window_ComputerPokemonsRelease
function PokemonMZ_Window_ComputerPokemonsRelease() {
    this.initialize(...arguments);
};
PokemonMZ_Window_ComputerPokemonsRelease.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_ComputerPokemonsRelease.prototype.constructor = PokemonMZ_Window_ComputerPokemonsRelease;
PokemonMZ_Window_ComputerPokemonsRelease.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ComputerPokemonsRelease.prototype.makeCommandList = function() {
    this.addCommand("Confirm", "ok", true);
    this.addCommand("Cancel", "cancel", true);
};

// PokemonMZ_Window_RegionMap
// The window to display the region map
function PokemonMZ_Window_RegionMap() {
    this.initialize(...arguments);
}
PokemonMZ_Window_RegionMap.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_RegionMap.prototype.constructor = PokemonMZ_Window_RegionMap;
PokemonMZ_Window_RegionMap.prototype.initialize = function(rect, mode) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._mode = mode;
    this._regionData = null;
    this._regionBitmap = null;
    this._cursorVisible = true;
    this._playerAnimationIndex = -1;
    this._animationRate = 30;
    this._scaleX = 0.0
    this._scaleY = 0.0
    this._pokemonStrId = null;
    this._pokemonLocations = [];
    this._showUnkownArea = false;
    this.setRegionMapId($gameMap.regionMapId());
    this.setPlayerPoiIndex($gameMap.regionMapPoiId());
};

PokemonMZ_Window_RegionMap.prototype.updateHelp = function() {
    this.refreshHelp();
};

PokemonMZ_Window_RegionMap.prototype.setRegionMapId = function(regionId) {
    this._regionData = $PokemonMZ_dataRegionMaps[regionId];
    this._regionBitmap = ImageManager.loadPicture(this._regionData.pictureName);
    this._regionBitmap.addLoadListener(
        PokemonMZ_Window_RegionMap.prototype.setupPicture.bind(this)
    );
};
PokemonMZ_Window_RegionMap.prototype.setPlayerPoiIndex = function(poiId) {
    this._playerPoiIndex = poiId;
    this.setCursorPoiIndex(poiId);
};
PokemonMZ_Window_RegionMap.prototype.setCursorPoiIndex = function(poiId) {
    this._cursorPoiIndex = poiId;
    this.refreshHelp();
    this.refresh();
};
PokemonMZ_Window_RegionMap.prototype.refreshHelp = function() {
    const poiData = this._regionData.poi[this._cursorPoiIndex];
    if (this._helpWindow) {
        this._helpWindow.setText(poiData.name);
    }
};

PokemonMZ_Window_RegionMap.prototype.setPokemon = function(pokemonStrId) {
    this._pokemonStrId = pokemonStrId;
    this._pokemonLocations = [];
    for (let i=0; i<this._regionData.poi.length; i++) {
        let poiData = this._regionData.poi[i];
        if (!poiData) { continue; }
        if (poiData.pokemons.includes(pokemonStrId)) {
            this._pokemonLocations.push(i);
        }
    }
    this.refresh();
};
PokemonMZ_Window_RegionMap.prototype.setupPicture = function() {
    const scaleX = this.innerWidth / this._regionBitmap.width;
    const scaleY = this.innerHeight / this._regionBitmap.height;

    if (scaleX < scaleY) {
        this._scale = scaleX;
        this._shiftX = 0;
        this._shiftY = (this.contents.height - scaleX*this._regionBitmap.height)/2;
    } else {
        this._scale = scaleY;
        this._shiftX = (this.contents.width - scaleY*this._regionBitmap.width)/2;
        this._shiftY = 0;
    }
    //this.refreshHelp();
};
PokemonMZ_Window_RegionMap.prototype.cursorPoiIndex = function() {
    return this._cursorPoiIndex;
};
PokemonMZ_Window_RegionMap.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    this.processAnimation();
};
PokemonMZ_Window_RegionMap.prototype.processAnimation = function() {
    this._animationRate --;
    if (this._animationRate == 0) {
        this._animationRate = 30;
        this._playerAnimationIndex *= -1;
        this.refresh();
    } else if (this._animationRate % 10 == 0) {
        this._cursorVisible = !this._cursorVisible;
        this.refresh();
    }
};
PokemonMZ_Window_RegionMap.prototype.refresh = function() {
    Window_Selectable.prototype.refresh.call(this);
    if (this._regionData) {
        this.refreshBakgroundImage();
        this.refreshPlayerLocation();
        if (this._mode == "playerMap") {
            this.refreshCursorLocation();
        } else if (this._mode == "pokedexArea") {
            this.refreshPokemonLocation();
        }
    }
};
PokemonMZ_Window_RegionMap.prototype.refreshBakgroundImage = function() {
    const sourceX = 0;
    const sourceY = 0;
    const sourceWidth = this._regionBitmap.width;
    const sourceHeight = this._regionBitmap.height;
    const destX = this._shiftX;
    const destY = this._shiftY;
    const destWidth = this._regionBitmap.width * this._scale;
    const destHeight = this._regionBitmap.height * this._scale;
    this.contents.blt(
        this._regionBitmap, 
        sourceX, sourceY, sourceWidth, sourceHeight, 
        destX, destY, destWidth, destHeight
    );
};
PokemonMZ_Window_RegionMap.prototype.refreshPlayerLocation = function() {
    const poiData = this._regionData.poi[this._playerPoiIndex];
    const cellSize = this._regionData.cellSize;

    const x = this._shiftX + (cellSize * poiData.x + cellSize/2) * this._scale;
    const y = this._shiftY + (cellSize * poiData.y + cellSize) * this._scale;
    
    this.drawCharacter(
        $gamePlayerTrainer.characterName(), 
        $gamePlayerTrainer.characterIndex(), 
        x, y, this._playerAnimationIndex);
};
PokemonMZ_Window_RegionMap.prototype.drawCharacter = function(characterName, characterIndex, x, y, index) {
    const bitmap = ImageManager.loadCharacter(characterName);
    const big = ImageManager.isBigCharacter(characterName);
    const pw = bitmap.width / (big ? 3 : 12);
    const ph = bitmap.height / (big ? 4 : 8);
    const n = big ? 0: characterIndex;
    const sx = ((n % 4) * 3 + 1 + index) * pw;
    const sy = Math.floor(n / 4) * 4 * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
};
PokemonMZ_Window_RegionMap.prototype.refreshCursorLocation = function() {
    const poiData = this._regionData.poi[this._cursorPoiIndex];
    const cellSize = this._regionData.cellSize;
    const cursorSize = cellSize * 2 * this._scale;

    const x = this._shiftX + (cellSize * poiData.x - cellSize/2) * this._scale;
    const y = this._shiftY + (cellSize * poiData.y - cellSize/2) * this._scale;
    
    const outlineColor = "#ffffffff"
    let cursorColor = "#ffffff80"
    if (!this._cursorVisible) {
        cursorColor = "#ffffff70"
    }
    this.contents.fillRect(x, y, cursorSize, cursorSize, cursorColor);
    this.contents.strokeRect(x, y, cursorSize, cursorSize, outlineColor);
};
PokemonMZ_Window_RegionMap.prototype.refreshPokemonLocation = function() {
    const cellSize = this._regionData.cellSize;
    const cursorSize = cellSize * this._scale;
    const outlineColor = "#000000ff"

    if (this._pokemonLocations.length == 0) {
        this._showUnkownArea = true;
    } else {
        this._showUnkownArea = false;
        for (const locationIndex of this._pokemonLocations) {
            let poiData = this._regionData.poi[locationIndex];
            let x = this._shiftX + (cellSize * poiData.x) * this._scale;
            let y = this._shiftY + (cellSize * poiData.y) * this._scale;
            let cursorColor = "#00000080"
            if (!this._cursorVisible) {
                cursorColor = "#50000070"
            }
            this.contents.fillRect(x, y, cursorSize, cursorSize, cursorColor);
        }
    }
};
PokemonMZ_Window_RegionMap.prototype.unknownAreaVisible = function() {
    return this._showUnkownArea;
};
PokemonMZ_Window_RegionMap.prototype.isCursorMovable = function() {
    return this.isOpenAndActive() && this._mode == "playerMap";
};
PokemonMZ_Window_RegionMap.prototype.isTouchOkEnabled = function() {
    return this.isOpenAndActive() && this._mode == "playerMap";
};
PokemonMZ_Window_RegionMap.prototype.cursorDown = function(wrap) {
    this.playCursorSound();
    if (this._cursorPoiIndex > 1) {
        this.setCursorPoiIndex(this._cursorPoiIndex - 1);
    } else {
        this.setCursorPoiIndex(this._regionData.poi.length - 1);
    }
};
PokemonMZ_Window_RegionMap.prototype.cursorUp = function(wrap) {
    this.playCursorSound();
    if (this._cursorPoiIndex < this._regionData.poi.length - 1) {
        this.setCursorPoiIndex(this._cursorPoiIndex + 1);
    } else {
        this.setCursorPoiIndex(1);
    }
};
PokemonMZ_Window_RegionMap.prototype.cursorRight = function(wrap) {
};
PokemonMZ_Window_RegionMap.prototype.cursorLeft = function(wrap) {
};
PokemonMZ_Window_RegionMap.prototype.onTouchSelect = function(trigger) {
};
PokemonMZ_Window_RegionMap.prototype.onTouchOk = function() {
    if (this.isTouchOkEnabled()) {
        const lastPoiIndex = this.cursorPoiIndex();
        const hitIndex = this.hitIndex();
        if (hitIndex >= 0 && hitIndex != lastPoiIndex) {
            this.playCursorSound();
            this.setCursorPoiIndex(hitIndex);
        }
    }
};
PokemonMZ_Window_RegionMap.prototype.hitTest = function(x, y) {
    if (this.innerRect.contains(x, y)) {
        const cx = this.origin.x + x - this.padding;
        const cy = this.origin.y + y - this.padding;
        const cellSize = this._regionData.cellSize;
        const cellX = Math.floor((cx/this._scale - this._shiftX) / cellSize);
        const cellY = Math.floor((cy/this._scale - this._shiftY) / cellSize);

        for (let i=1; i < this._regionData.poi.length; i++) {
            const poiData = this._regionData.poi[i];
            if (poiData.x == cellX && poiData.y == cellY) {
                return i;
            }
        }
    }
    return -1;
};

// PokemonMZ_Window_Message_PokemonNickname
function PokemonMZ_Window_Message_PokemonNickname() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Message_PokemonNickname.prototype = Object.create(Window_Message.prototype);
PokemonMZ_Window_Message_PokemonNickname.prototype.constructor = PokemonMZ_Window_Message_PokemonNickname;
PokemonMZ_Window_Message_PokemonNickname.prototype.initialize = function(rect) {
    Window_Message.prototype.initialize.call(this, rect);
    this._text = "";
    this._hasDisplayedMessage = false;
};
PokemonMZ_Window_Message_PokemonNickname.prototype.synchronizeNameBox = function() {};
PokemonMZ_Window_Message_PokemonNickname.prototype.updateSpeakerName = function() {};
PokemonMZ_Window_Message_PokemonNickname.prototype.isAnySubWindowActive = function() {
    return this._choiceListWindow.active;
};
PokemonMZ_Window_Message_PokemonNickname.prototype.setText = function(text) {
    this._text = text;
};
PokemonMZ_Window_Message_PokemonNickname.prototype.canStart = function() {
    return this._text != "";
};
PokemonMZ_Window_Message_PokemonNickname.prototype.startMessage = function() {
    const text = this._text;
    const textState = this.createTextState(text, 0, 0, 0);
    textState.x = this.newLineX(textState);
    textState.startX = textState.x;
    this._textState = textState;
    this.newPage(this._textState);
    this.updatePlacement();
    this.updateBackground();
    this.open();
};
PokemonMZ_Window_Message_PokemonNickname.prototype.onEndOfText = function() {
    if (!this._hasDisplayedMessage) {
        this._hasDisplayedMessage = true;
        this._choiceListWindow.start();
        this._textState = null;
    }
};
PokemonMZ_Window_Message_PokemonNickname.prototype.doesContinue = function() {
    return false;
};
PokemonMZ_Window_Message_PokemonNickname.prototype.terminateMessage = function() {
    this.close();
    this._text = "";
};

// PokemonMZ_Window_ChoiceList_PokemonNickname
function PokemonMZ_Window_ChoiceList_PokemonNickname() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype = Object.create(Window_ChoiceList.prototype);
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype.constructor = PokemonMZ_Window_ChoiceList_PokemonNickname;
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype.initialize = function() {
    Window_ChoiceList.prototype.initialize.call(this);
    this._parentScene = null;
};
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype.makeCommandList = function() {
    this.addCommand("Yes", "Yes");
    this.addCommand("No", "No");
};
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype.numVisibleRows = function() {
    return 2;
};
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype.callOkHandler = function() {
    switch(this.index()) {
    case 0:
        this.callHandler("yes_nickname");
        break;
    case 1:
        this.callHandler("no_nickname");
        break;
    }
};
PokemonMZ_Window_ChoiceList_PokemonNickname.prototype.callCancelHandler = function() {
    this.callHandler("no_nickname");
};

// PokemonMZ_Window_PokemonNameEdit
function PokemonMZ_Window_PokemonNameEdit() {
    this.initialize(...arguments);
}
PokemonMZ_Window_PokemonNameEdit.prototype = Object.create(Window_NameEdit.prototype);
PokemonMZ_Window_PokemonNameEdit.prototype.constructor = PokemonMZ_Window_PokemonNameEdit;
PokemonMZ_Window_PokemonNameEdit.prototype.initialize = function(rect) {
    Window_NameEdit.prototype.initialize.call(this, rect);
    this._pokemon = null;
};
PokemonMZ_Window_PokemonNameEdit.prototype.setup = function(pokemon, maxLength) {
    this._pokemon = pokemon;
    this._maxLength = maxLength;
    this._name = pokemon.name().slice(0, this._maxLength);
    this._index = this._name.length;
    this._defaultName = this._name;
    //ImageManager.loadFace(actor.faceName()); // TODO : Load pokemon face or sprite??
};
PokemonMZ_Window_PokemonNameEdit.prototype.callOkHandler = function() {
    this.callHandler("gave_nickname");
};
PokemonMZ_Window_PokemonNameEdit.prototype.refresh = function() {
    this.contents.clear();
    //this.drawActorFace(this._actor, 0, 0);
    for (let i = 0; i < this._maxLength; i++) {
        this.drawUnderline(i);
    }
    for (let j = 0; j < this._name.length; j++) {
        this.drawChar(j);
    }
    const rect = this.itemRect(this._index);
    this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
};

function PokemonMZ_Window_NameInput() {
    this.initialize(...arguments);
}
PokemonMZ_Window_NameInput.prototype = Object.create(Window_NameInput.prototype);
PokemonMZ_Window_NameInput.prototype.constructor = PokemonMZ_Window_NameInput;
PokemonMZ_Window_NameInput.prototype.initialize = function(rect) {
    Window_NameInput.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_NameInput.prototype.callOkHandler = function() {
    this.callHandler("gave_nickname");
};
PokemonMZ_Window_NameInput.prototype.isOkEnabled = function() {
    return this.isHandled("gave_nickname");
};


function PokemonMZ_Window_MenuPokemonList() {
    this.initialize(...arguments);
}
PokemonMZ_Window_MenuPokemonList.prototype = Object.create(Window_MenuStatus.prototype);
PokemonMZ_Window_MenuPokemonList.prototype.constructor = PokemonMZ_Window_MenuPokemonList;
PokemonMZ_Window_MenuPokemonList.prototype.initialize = function(rect) {
    Window_MenuStatus.prototype.initialize.call(this, rect);
    this.loadPokemonImages();
    this._pendingIndex = -1;
    this._forbidCancel = false;
    this.refresh();
    this.select(0);
};
PokemonMZ_Window_MenuPokemonList.prototype.forbidCancel = function() {
    this._forbidCancel = true;
};
PokemonMZ_Window_MenuPokemonList.prototype.authorizeCancel = function() {
    this._forbidCancel = false;
};
PokemonMZ_Window_MenuPokemonList.prototype.loadPokemonImages = function() {
    for (const pokemon of $gamePlayerTrainer.pokemons()) {
        ImageManager.PokemonMZ_loadPokemonFront(pokemon._data.id);
    }
};
PokemonMZ_Window_MenuPokemonList.prototype.maxItems = function() {
    return $gamePlayerTrainer.numPokemons();
};
PokemonMZ_Window_MenuPokemonList.prototype.numVisibleRows = function() {
    return 6;
};
PokemonMZ_Window_MenuPokemonList.prototype.drawPokemonSimpleStatus = function(pokemon, index, x, y) {
    const lineHeight = this.lineHeight();
    const x2 = x + 180;
    this.drawPokemonName(pokemon, x, y);
    this.drawPokemonLevel(pokemon, x, y + lineHeight * 1);
    this.placeBasicGauges(pokemon, index, x2, y + lineHeight);
};
PokemonMZ_Window_MenuPokemonList.prototype.pokemon = function(index) {
    return $gamePlayerTrainer.pokemons()[index];
};
PokemonMZ_Window_MenuPokemonList.prototype.drawItem = function(index) {
    this.drawPendingItemBackground(index);
    this.drawItemImage(index);
    this.drawItemStatus(index);
    this.drawPokemonStatus(index);
};
PokemonMZ_Window_MenuPokemonList.prototype.drawItemImage = function(index) {
    const pokemon = this.pokemon(index);
    const rect = this.itemRect(index);
    const height = rect.height - 2;
    const width = height;
    this.PokemonMZ_drawPokemonFront(pokemon, rect.x+1, rect.y+1, width, height);
};
PokemonMZ_Window_MenuPokemonList.prototype.drawItemStatus = function(index) {
    const pokemon = this.pokemon(index);
    const rect = this.itemRect(index);
    const x = rect.x + 100;
    const y = rect.y + 5;
    this.drawPokemonSimpleStatus(pokemon, index, x, y);
};
PokemonMZ_Window_MenuPokemonList.prototype.drawPokemonName = function(pokemon, x, y, width) {
    width = width || 168;
    this.changeTextColor(ColorManager.pokemonHpColor(pokemon));
    this.drawText(pokemon.name(), x, y, width);
};
PokemonMZ_Window_MenuPokemonList.prototype.drawPokemonLevel = function(pokemon, x, y) {
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(pokemon.level(), x + 84, y, 36, "right");
};
PokemonMZ_Window_MenuPokemonList.prototype.drawPokemonStatus = function(index) {
    const pokemon = this.pokemon(index);
    const status = pokemon.status();
    if (status != "OK") {
        const rect = this.itemRect(index);
        const x = rect.x + 500;
        const y = rect.y + this.lineHeight();
        this.drawText(status, x, y, 64, "right");
    }


   
};
PokemonMZ_Window_MenuPokemonList.prototype.placeBasicGauges = function(pokemon, index, x, y) {
    this.placeGauge(pokemon, "hp", index, x, y);
};
PokemonMZ_Window_MenuPokemonList.prototype.placeGauge = function(pokemon, type, index, x, y) {
    const key = "pokemon-%1-gauge-%2-%3".format(pokemon.id(), type, index);
    const sprite = this.createInnerSprite(key, PokemonMZ_Sprite_Gauge);
    sprite.setup(pokemon, type);
    sprite.move(x, y);
    sprite.show();
};
PokemonMZ_Window_MenuPokemonList.prototype.processOk = function() {
    Window_StatusBase.prototype.processOk.call(this);
};
PokemonMZ_Window_MenuPokemonList.prototype.isCancelEnabled = function() {
    return Window_MenuStatus.prototype.isCancelEnabled.call(this) && !this._forbidCancel;
};
PokemonMZ_Window_MenuPokemonList.prototype.isCurrentItemEnabled = function() {
    if (this._formationMode) {
        return this.index() != this.pendingIndex();
    } else {
        return true;
    }
};
PokemonMZ_Window_MenuPokemonList.prototype.refreshAll = function() {
    for (let index=0; index<this.maxItems(); index++) {
        this.drawItem(index);
    }
};


// PokemonMZ_Window_MenuPokemonCommand
// The window to display the Stats / Switch menu
function PokemonMZ_Window_MenuPokemonCommand() {
    this.initialize(...arguments);
}
PokemonMZ_Window_MenuPokemonCommand.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_MenuPokemonCommand.prototype.constructor = PokemonMZ_Window_MenuPokemonCommand;
PokemonMZ_Window_MenuPokemonCommand.prototype.initialize = function(rect, inBattle) {
    this._inBattle = inBattle;
    Window_Command.prototype.initialize.call(this, rect);

};
PokemonMZ_Window_MenuPokemonCommand.prototype.makeCommandList = function() {
    const switchEnabled = this._inBattle == true || $gamePlayerTrainer.numPokemons() > 1;
    this.addCommand("Stats", "stats", true);
    this.addCommand("Switch", "switch", switchEnabled);
};

// PokemonMZ_Window_MenuPokemonStatus
function PokemonMZ_Window_MenuPokemonStatus() {
    this.initialize(...arguments);
}
PokemonMZ_Window_MenuPokemonStatus.prototype = Object.create(Window_StatusBase.prototype);
PokemonMZ_Window_MenuPokemonStatus.prototype.constructor = PokemonMZ_Window_MenuPokemonStatus;
PokemonMZ_Window_MenuPokemonStatus.prototype.initialize = function(rect) {
    Window_StatusBase.prototype.initialize.call(this, rect);
    this._pokemon = null;
};
PokemonMZ_Window_MenuPokemonStatus.prototype.setPokemon = function(pokemon) {
    this._pokemon = pokemon;
    this.refresh();
};
PokemonMZ_Window_MenuPokemonStatus.prototype.refresh = function() {
    Window_StatusBase.prototype.refresh.call(this);

    const lineHeight = this.lineHeight()*1.5;
    const width = ImageManager.pokemonSpriteWidth;
    const height = ImageManager.pokemonSpriteHeight;
    const x2 = width + 32;

    this.PokemonMZ_drawPokemonFront(this._pokemon, 0, lineHeight, width, height);
    this.drawPokemonName(this._pokemon, 32, 0)
    this.drawPokemonLevel(this._pokemon, x2, lineHeight * 1);
    this.placeBasicGauges(this._pokemon, x2, lineHeight * 2)
    this.drawPokemonStatus(this._pokemon, width, lineHeight * 3);
    this.drawPokemonExperience(this._pokemon, 450, lineHeight * 1);
    this.PokemonMZ_drawHorzLine(0, lineHeight * 4.5, this.contents.width);
    this.drawPokemonStats(this._pokemon, 16, lineHeight * 5);
    this.drawPokemonType(this._pokemon, 220, lineHeight * 5);
    this.drawPokemonInfo(this._pokemon, 220, lineHeight * 7);
    this.drawPokemonMoves(this._pokemon, 450, lineHeight * 5);
    this.PokemonMZ_drawVertLine(425, 5, lineHeight*4);
    this.PokemonMZ_drawVertLine(425, lineHeight*5, lineHeight*4);
    this.PokemonMZ_drawVertLine(200, lineHeight*5, lineHeight*4);
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonName = function(pokemon, x, y, width) {
    width = width || 168;
    this.changeTextColor(ColorManager.crisisColor());
    this.drawText(pokemon.name(), x, y, width);
    this.resetTextColor();
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonLevel = function(pokemon, x, y) {
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(pokemon.level(), x + 84, y, 64, "right");
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonStats = function(pokemon, x, y) {
    const lineHeight = this.lineHeight()*1.5;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Attack", x, y, 80);
    this.drawText("Defense", x, y+lineHeight*1, 80);
    this.drawText("Speed", x, y+lineHeight*2, 80);
    this.drawText("Special", x, y+lineHeight*3, 80);
    this.resetTextColor();
    this.drawText(pokemon.patk(), x + 80, y, 64, "right");
    this.drawText(pokemon.pdef(), x + 80, y+lineHeight*1, 64, "right");
    this.drawText(pokemon.spd(), x + 80, y+lineHeight*2, 64, "right");
    this.drawText(pokemon.satk(), x + 80, y+lineHeight*3, 64, "right");
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonType = function(pokemon, x, y) {
    const lineHeight = this.lineHeight();

    const type1 = pokemon.typeName(pokemon.type1());
    const type2 = pokemon.typeName(pokemon.type2());

    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Type 1", x, y, 100);
    if (type2 != "") {
        this.drawText("Type 2", x, y+lineHeight, 100);
    }
    this.resetTextColor();
    this.drawText(type1, x + 100, y, 64, "right");
    if (type2 != "") {
        this.drawText(type2, x + 100, y+lineHeight*1, 64, "right");
    }
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonInfo = function(pokemon, x, y) {
    const lineHeight = this.lineHeight();
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("ID", x, y, 100);
    this.drawText("OT", x, y+lineHeight*1, 100);
    this.resetTextColor();
    this.drawText(pokemon.originalTrainerId().padZero(5), x + 100, y, 64, "right");
    this.drawText(pokemon.originalTrainerName(), x + 100, y+lineHeight*1, 64, "right");
};
PokemonMZ_Window_MenuPokemonStatus.prototype.placeBasicGauges = function(pokemon, x, y) {
    this.placeGauge(pokemon, "hp", x, y);
};
PokemonMZ_Window_MenuPokemonStatus.prototype.placeGauge = function(pokemon, type, x, y) {
    const key = "pokemon-%1-gauge-%2".format(pokemon.id(), type);
    const sprite = this.createInnerSprite(key, PokemonMZ_Sprite_Gauge);
    sprite.setup(pokemon, type);
    sprite.move(x, y);
    sprite.show();
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonStatus = function(pokemon, x, y) {
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Status", x, y, 64);
    this.resetTextColor();
    this.drawText(pokemon.status(), x + 84, y, 64, "right");
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonExperience = function(pokemon, x, y) {
    const lineHeight = this.lineHeight();
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Experience points", x, y, 256);
    this.drawText("Level up", x, y+lineHeight*2, 256);
    this.resetTextColor();
    this.drawText(pokemon.exp(), x + 32, y+lineHeight, 64, "left");
    const text = String(pokemon.expForNextLevel()) + " to Lv " + String(pokemon.nextExpLevel());
    this.drawText(text, x + 32, y+lineHeight*3, 256, "left");
};
PokemonMZ_Window_MenuPokemonStatus.prototype.drawPokemonMoves = function(pokemon, x, y) {
    const lineHeight = this.lineHeight();
    let counter = 0;
    for (move of pokemon.moves()) {
        const moveName = pokemon.moveName(move);
        const moveCurrentPP = move.pp;
        const moveMaxPP = pokemon.movePP(move.id, move.ppup)
        const ny = y + lineHeight*counter;
        this.drawText(moveName, x, ny, 128);
        this.changeTextColor(ColorManager.systemColor());
        this.drawText("PP", x+140, ny, 40);
        this.resetTextColor();
        this.drawText(String(moveCurrentPP) + " / " + String(moveMaxPP), x+175, ny, 128);
        counter ++;
    }
    if (counter < 4) {
        for (i=counter; i<4; i++) {
            const ny2 = y + lineHeight*i;
            this.drawText("-----", x, ny2, 128);
            this.drawText("-----", x+140, ny2, 128);
        }
    }
};

// PokemonMZ_Window_MenuPokemonMessage
function PokemonMZ_Window_MenuPokemonMessage() {
    this.initialize(...arguments);
}
PokemonMZ_Window_MenuPokemonMessage.prototype = Object.create(Window_Message.prototype);
PokemonMZ_Window_MenuPokemonMessage.prototype.constructor = PokemonMZ_Window_MenuPokemonMessage;
PokemonMZ_Window_MenuPokemonMessage.prototype.initialize = function(rect) {
    Window_Message.prototype.initialize.call(this, rect);
    this._text = "";
    this._hasDisplayedMessage = false;
    this._pokemonListWindow = null;
    this._handlers = {};
};
PokemonMZ_Window_MenuPokemonMessage.prototype.setHandler = function(symbol, method) {
    this._handlers[symbol] = method;
};
PokemonMZ_Window_MenuPokemonMessage.prototype.isHandled = function(symbol) {
    return !!this._handlers[symbol];
};
PokemonMZ_Window_MenuPokemonMessage.prototype.callHandler = function(symbol) {
    if (this.isHandled(symbol)) {
        this._handlers[symbol]();
    }
};
PokemonMZ_Window_MenuPokemonMessage.prototype.setPokemonListWindow = function(pokemonWindow) {
    this._pokemonListWindow = pokemonWindow;
};
PokemonMZ_Window_MenuPokemonMessage.prototype.synchronizeNameBox = function() {};
PokemonMZ_Window_MenuPokemonMessage.prototype.updateSpeakerName = function() {};
PokemonMZ_Window_MenuPokemonMessage.prototype.isAnySubWindowActive = function() {
    return false;
};
PokemonMZ_Window_MenuPokemonMessage.prototype.setText = function(text) {
    this._text = text;
};
PokemonMZ_Window_MenuPokemonMessage.prototype.canStart = function() {
    return this._text != "";
};
PokemonMZ_Window_MenuPokemonMessage.prototype.startMessage = function() {
    const text = this._text;
    const textState = this.createTextState(text, 0, 0, 0);
    textState.x = this.newLineX(textState);
    textState.startX = textState.x;
    this._textState = textState;
    this.newPage(this._textState);
    this.updatePlacement();
    this.updateBackground();
    this.open();
};
PokemonMZ_Window_MenuPokemonMessage.prototype.onEndOfText = function() {
    if (!this._hasDisplayedMessage) {
        this._hasDisplayedMessage = true;
        this.startPause();
    } else {
        this.terminateMessage();
        this.callHandler("messageTerminated");
    }
};
PokemonMZ_Window_MenuPokemonMessage.prototype.doesContinue = function() {
    return false;
};
PokemonMZ_Window_MenuPokemonMessage.prototype.terminateMessage = function() {
    this.close();
    this._text = "";
    this._hasDisplayedMessage = false;
    this._textState = null;
};

// PokemonMZ_Window_Pokedex_Gen1_PokemonList
// The window to list the pokemon of the pokedex for the first generation
function PokemonMZ_Window_Pokedex_Gen1_PokemonList() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype.constructor = PokemonMZ_Window_Pokedex_Gen1_PokemonList;
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._pokedexContent = [];
    this._pokedexNumberPadding = 1;
};
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype.setContent = function(pokedexContent, pokedexMaxNumber) {
    this._pokedexNumberPadding = String(pokedexMaxNumber).length;
    this._pokedexContent = pokedexContent;
    this._pokeBallBitmap = ImageManager.loadPicture("PokemonMZ_TeamStatus")
    this._pokeBallBitmap.addLoadListener(this.refresh.bind(this));
};
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype.maxItems = function() {
    return this._pokedexContent.length;
};
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype.drawItem = function(index) {
    const rect = this.itemRectWithPadding(index);
    const textX = rect.x + 120;
    const textY = rect.y + 3;

    const pokemonStrId = this._pokedexContent[index];
    const entryNumber = String(index+1).padStart(this._pokedexNumberPadding, "0")

    this.drawText(entryNumber, rect.x, textY, rect.width);

    if (pokemonStrId) {
        const name = $dataEnemies[$dataPokemonsIndex[pokemonStrId]].name;
        this.drawText(name, textX, textY, rect.width);

        if ($gamePlayerTrainer.isPokemonCaptured(pokemonStrId)) {
            this.drawPokeball(rect.x+80, rect.y + 5);
        }
    } else {
        this.drawText("----------", textX, textY, rect.width);
    }
};
PokemonMZ_Window_Pokedex_Gen1_PokemonList.prototype.drawPokeball = function(x, y) {
    const pokeballIndex = 1;
    const cellWidth = this._pokeBallBitmap.width / 4;
    const cellHeight = this._pokeBallBitmap.height;

    const sx = pokeballIndex*cellWidth;
    const sy = 0;
    const sw = cellWidth;
    const sh = cellHeight;
    const dx = x;
    const dy = y;
    const dw = sw;
    const dh = sh;
    this.contents.blt(this._pokeBallBitmap, sx, sy, sw, sh, dx, dy, dw, dh);
};

// PokemonMZ_Window_Pokedex_Gen1_PokedexStats
// The window to list the stats of the pokedex for the first generation
function PokemonMZ_Window_Pokedex_Gen1_PokedexStats() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Pokedex_Gen1_PokedexStats.prototype = Object.create(Window_Base.prototype);
PokemonMZ_Window_Pokedex_Gen1_PokedexStats.prototype.constructor = PokemonMZ_Window_Pokedex_Gen1_PokedexStats;
PokemonMZ_Window_Pokedex_Gen1_PokedexStats.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_Pokedex_Gen1_PokedexStats.prototype.refresh = function() {
    this.contents.clear();
    
    const lineHeight = this.lineHeight();
    const padding = 25;
    const width = this.contents.width - 2*padding
    const shiftY = -12;

    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Seen", padding, lineHeight*1+shiftY, width, "left");
    this.drawText("Owned", padding, lineHeight*3+shiftY, width, "left");
    this.resetTextColor();
    this.drawText($gamePlayerTrainer.numPokemonSeen(), padding, lineHeight*2+shiftY, width, "right");
    this.drawText($gamePlayerTrainer.numPokemonCaptured(), padding, lineHeight*4+shiftY, width, "right");
};

// PokemonMZ_Window_Pokedex_Gen1_PokedexCommand
// The command window of the pokedex for the first generation
function PokemonMZ_Window_Pokedex_Gen1_PokedexCommand() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Pokedex_Gen1_PokedexCommand.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_Pokedex_Gen1_PokedexCommand.prototype.constructor = PokemonMZ_Window_Pokedex_Gen1_PokedexCommand;
PokemonMZ_Window_Pokedex_Gen1_PokedexCommand.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_Pokedex_Gen1_PokedexCommand.prototype.makeCommandList = function() {
    Window_Command.prototype.makeCommandList.call(this);
    this.addCommand("Data", "data", true);
    this.addCommand("Cry", "cry", true);
    this.addCommand("Area", "area", true);
};


// PokemonMZ_Window_Pokedex_Gen1_PokedexData
function PokemonMZ_Window_Pokedex_Gen1_PokedexData() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.constructor = PokemonMZ_Window_Pokedex_Gen1_PokedexData;
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._pokemonStrId = null;
    this._pokedexNumberPadding = 1;
    this._pokedexRegion = "";
    this._pokemonNumber = 0;
};
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.setPokedexNumberPadding = function(pokedexMaxNumber) {
    this._pokedexNumberPadding = String(pokedexMaxNumber).length;
};
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.setPokedexRegion = function(region) {
    this._pokedexRegion = region;
};
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.setPokemon = function(pokemonStrId) {
    this._pokemonStrId = pokemonStrId;
    AudioManager.playPokemonCry(this._pokemonStrId);
    this.refresh();
};
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.getPokemonNumber = function() {
    const pokedexData =  $dataEnemies[$dataPokemonsIndex[this._pokemonStrId]].pkmz_data.pokedex;
    for (const pokedex of pokedexData) {
        if (pokedex.region == this._pokedexRegion) {
            return pokedex.number;
        }
    }
    return 0;
};
PokemonMZ_Window_Pokedex_Gen1_PokedexData.prototype.refresh = function() {
    Window_Selectable.prototype.refresh.call(this);
    this.contents.clear();

    const enemyIntId = $dataPokemonsIndex[this._pokemonStrId]
    const enemy = $dataEnemies[enemyIntId];
    const pokemonData = enemy.pkmz_data;

    const leftX = 0;
    const leftWidth = 200;
    const rightX = leftWidth;
    const rightWidth = this.contents.width - rightX;

    const topY = 0;
    const bottomY = 200;
    const lineHeight = this.lineHeight();

    this.PokemonMZ_drawPokemonFront(new PokemonMZ_Game_Pokemon(enemyIntId,1), leftX+20, topY+20)

    this.changeTextColor(ColorManager.crisisColor());
    this.drawText(enemy.name, rightX, topY, rightWidth, "left");

    this.changeTextColor(ColorManager.systemColor());
    this.drawText("Height", rightX, topY+lineHeight*3, rightWidth, "left");
    this.drawText("Weight", rightX, topY+lineHeight*4, rightWidth, "left");

    this.resetTextColor();
    this.drawText(pokemonData.category + " Pokémon", rightX, topY+lineHeight*1, rightWidth, "left");

    const pokemonNumberString = String(this.getPokemonNumber()).padStart(this._pokedexNumberPadding,"0");
    this.drawText("N°. " + pokemonNumberString, leftX+50, bottomY-lineHeight-10, leftWidth, "left");

    this.PokemonMZ_drawHorzLine(0, bottomY, this.contents.width);

    if ($gamePlayerTrainer.isPokemonCaptured(this._pokemonStrId)) {
        this.drawText(pokemonData.height + " m", rightX+100, topY+lineHeight*3, rightWidth, "left");
        this.drawText(pokemonData.weight + " kg", rightX+100, topY+lineHeight*4, rightWidth, "left");

        this.PokemonMZ_drawTextWrap(pokemonData.description, leftX+10, bottomY+lineHeight, this.contents.width - 20)
    } else {
        this.drawText("???", rightX+100, topY+lineHeight*3, rightWidth, "left");
        this.drawText("???", rightX+100, topY+lineHeight*4, rightWidth, "left");
    }
};

// PokemonMZ_Window_Pokedex_Gen1_UnknownArea
function PokemonMZ_Window_Pokedex_Gen1_UnknownArea() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Pokedex_Gen1_UnknownArea.prototype = Object.create(Window_Selectable.prototype);
PokemonMZ_Window_Pokedex_Gen1_UnknownArea.prototype.constructor = PokemonMZ_Window_Pokedex_Gen1_UnknownArea;
PokemonMZ_Window_Pokedex_Gen1_UnknownArea.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_Pokedex_Gen1_UnknownArea.prototype.refresh = function(rect) {
    this.contents.clear();
    this.drawText("Area unknown", 0, 5, this.contents.width, "center");
};


// PokemonMZ_Window_Money
function PokemonMZ_Window_Money() {
    this.initialize(...arguments);
}
PokemonMZ_Window_Money.prototype = Object.create(Window_Gold.prototype);
PokemonMZ_Window_Money.prototype.constructor = PokemonMZ_Window_Money;
PokemonMZ_Window_Money.prototype.initialize = function(rect) {
    Window_Gold.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_Money.prototype.value = function() {
    return $gamePlayerTrainer.money();
};

// PokemonMZ_Window_ShopBuy
function PokemonMZ_Window_ShopBuy() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ShopBuy.prototype = Object.create(Window_ShopBuy.prototype);
PokemonMZ_Window_ShopBuy.prototype.constructor = PokemonMZ_Window_ShopBuy;
PokemonMZ_Window_ShopBuy.prototype.initialize = function(rect) {
    Window_ShopBuy.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ShopBuy.prototype.makeItemList = function() {
    this._data = [];
    this._price = [];

    for (const goods of this._shopGoods) {
        const item = this.goodsToItem(goods);
        if (item) {
            this._data.push(item);
            this._price.push(item.pkmz_data.price);
        }
    }
};
PokemonMZ_Window_ShopBuy.prototype.isEnabled = function(item) {
    const maxQuantity = $gamePlayerTrainer.maxSingleBagItemQuantity();
    return (
        item && this.price(item) <= this._money &&  $gamePlayerTrainer.numBagItems(item.id) < maxQuantity
    );
};

// PokemonMZ_Window_ShopSell
function PokemonMZ_Window_ShopSell() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ShopSell.prototype = Object.create(PokemonMZ_Window_ItemList_Gen1.prototype);
PokemonMZ_Window_ShopSell.prototype.constructor = PokemonMZ_Window_ShopSell;
PokemonMZ_Window_ShopSell.prototype.initialize = function(rect) {
    PokemonMZ_Window_ItemList_Gen1.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ShopSell.prototype.isEnabled = function(item) {
    return item && item.pkmz_data && item.pkmz_data.category != "key";
};

// PokemonMZ_Window_ShopStatus
function PokemonMZ_Window_ShopStatus() {
    this.initialize(...arguments);
}
PokemonMZ_Window_ShopStatus.prototype = Object.create(Window_ShopStatus.prototype);
PokemonMZ_Window_ShopStatus.prototype.constructor = PokemonMZ_Window_ShopStatus;
PokemonMZ_Window_ShopStatus.prototype.initialize = function(rect) {
    Window_ShopStatus.prototype.initialize.call(this, rect);
};
PokemonMZ_Window_ShopStatus.prototype.isEquipItem = function() {
    return false;
};
PokemonMZ_Window_ShopStatus.prototype.drawPossession = function(x, y) {
    const width = this.innerWidth - this.itemPadding() - x;
    const possessionWidth = this.textWidth("0000");
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.possession, x, y, width - possessionWidth);
    this.resetTextColor();
    this.drawText($gamePlayerTrainer.numBagItems(this._item), x, y, width, "right");
};



// PokemonMZ_TrainerTeamStatusWindow
// The window to display the state of the pokemon team
function PokemonMZ_TrainerTeamStatusWindow() {
    this.initialize(...arguments);
}
PokemonMZ_TrainerTeamStatusWindow.prototype = Object.create(Window_Base.prototype);
PokemonMZ_TrainerTeamStatusWindow.prototype.constructor = PokemonMZ_TrainerTeamStatusWindow;
PokemonMZ_TrainerTeamStatusWindow.prototype.initialize = function(rect, kind) {
    Window_Base.prototype.initialize.call(this, rect);
    this._kind = kind;
    this._bitmap = ImageManager.loadPicture("PokemonMZ_TeamStatus")
    this._cellSize = 32;
    this._cellPadding = 10;
    this.hide();
};
PokemonMZ_TrainerTeamStatusWindow.prototype.refresh = function(rect, kind) {
    this.contents.clear();
    switch (this._kind) {
        case "player":
            for (let i=0; i< PokemonMZ.maxPokemonInTeam; i++) {
                const pokemon = $gamePlayerTrainer.pokemon(i);
                const x = i*(this._cellSize+this._cellPadding) + 3*this._cellPadding;
                this.drawPokeball(pokemon, x);
            }
            break;
        case "enemy":
            const enemy = $PokemonMZ_gameBattle.enemy1();
            for (let i=0; i< PokemonMZ.maxPokemonInTeam; i++) {
                const reverseIndex = PokemonMZ.maxPokemonInTeam - i - 1;
                const pokemon = enemy.pokemon(i);
                const x = reverseIndex*(this._cellSize+this._cellPadding) + 3*this._cellPadding;
                this.drawPokeball(pokemon, x);
            }
            break;
    }
};
PokemonMZ_TrainerTeamStatusWindow.prototype.drawPokeball = function(pokemon, x) {
    const pokeballIndex = this.getIconStateIndex(pokemon);
    const cellWidth = this._bitmap.width / 4;
    const cellHeight = this._bitmap.height;

    const sx = pokeballIndex*cellWidth;
    const sy = 0;
    const sw = cellWidth;
    const sh = cellHeight;
    const dx = x;
    const dy = 0;
    const dw = this._cellSize;
    const dh = this._cellSize;
    this.contents.blt(this._bitmap, sx, sy, sw, sh, dx, dy, dw, dh);
};
PokemonMZ_TrainerTeamStatusWindow.prototype.getIconStateIndex = function(pokemon) {
    if (pokemon) {
        if (pokemon.isFainted()) {
            return 3;
        } else if (pokemon.hasStatus()) {
            return 2;
        } else {
            return 1;
        }
    } else {
        return 0;
    }
};


// PokemonMZ_PokemonBattleStatusWindow
// The window to display the status of the pokemon in battle
function PokemonMZ_PokemonBattleStatusWindow() {
    this.initialize(...arguments);
}
PokemonMZ_PokemonBattleStatusWindow.prototype = Object.create(Window_MenuStatus.prototype);
PokemonMZ_PokemonBattleStatusWindow.prototype.constructor = PokemonMZ_PokemonBattleStatusWindow;
PokemonMZ_PokemonBattleStatusWindow.prototype.initialize = function(rect, side) {
    Window_MenuStatus.prototype.initialize.call(this, rect);
    this._pokemon = null;
    this._side = side;
    this._gaugeSprite = null;
    this.hide();
};
PokemonMZ_PokemonBattleStatusWindow.prototype.setPokemon = function(pokemon) {
    this._pokemon = pokemon;
    this.refresh();
};
PokemonMZ_PokemonBattleStatusWindow.prototype.refresh = function(forceRedraw) {
    Window_MenuStatus.prototype.refresh.call(this);
    if (this._pokemon) {
        this.drawPokemonSimpleStatus(this._pokemon, 5, 0, forceRedraw)
    }
};
PokemonMZ_PokemonBattleStatusWindow.prototype.drawPokemonSimpleStatus = function(pokemon, x, y, forceRedraw) {
    const lineHeight = this.lineHeight();
    const x2 = x + 180;
    this.drawPokemonName(pokemon, x, y);
    // Draw level if no status
    if (pokemon.hasStatus()) {
        this.drawPokemonStatus(pokemon, x+180, y);
    } else {
        this.drawPokemonLevel(pokemon, x+180, y);
    }
    this.placeBasicGauges(pokemon, x, y + lineHeight, forceRedraw);
};
PokemonMZ_PokemonBattleStatusWindow.prototype.drawPokemonName = function(pokemon, x, y, width) {
    width = width || 168;
    this.changeTextColor(ColorManager.crisisColor());
    this.drawText(pokemon.name(), x, y, width);
};
PokemonMZ_PokemonBattleStatusWindow.prototype.drawPokemonLevel = function(pokemon, x, y) {
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.levelA + ".", x, y, 48);
    this.resetTextColor();
    this.drawText(pokemon.level(), x + 48, y, 36, "left");
};
PokemonMZ_PokemonBattleStatusWindow.prototype.drawPokemonStatus = function(pokemon, x, y) {
    this.changeTextColor(ColorManager.crisisColor());
    this.drawText(pokemon.status(), x, y, 48, "right");
    this.resetTextColor();
};
PokemonMZ_PokemonBattleStatusWindow.prototype.placeBasicGauges = function(pokemon, x, y, forceRedraw) {
    this.placeGauge(pokemon, "hp", x, y, forceRedraw);
};
PokemonMZ_PokemonBattleStatusWindow.prototype.placeGauge = function(pokemon, type, x, y, forceRedraw) {
    const key = "pokemon-gauge-%2-%3".format(pokemon.id(), type, this._side);
    const sprite = this.createInnerSprite(key, PokemonMZ_Sprite_Gauge);
    sprite.setBitmapWidth(260);
    sprite.setup(pokemon, type);
    switch (this._side) {
        case "player":
            sprite.showHp();
            break;
        case "enemy":
            sprite.hideHp();
            break;
    }
    sprite.move(x, y);
    if (forceRedraw) {
        sprite.redraw();
    }
    
    sprite.show();
    this._gaugeSprite = sprite;
};
PokemonMZ_PokemonBattleStatusWindow.prototype.isGaugeAnimationPlaying = function() {
    return (this._gaugeSprite && this._gaugeSprite.isAnimationPlaying());
}


// PokemonMZ_BattleInputWindow
// The window for the player input command in battle
function PokemonMZ_BattleInputWindow() {
    this.initialize(...arguments);
}
PokemonMZ_BattleInputWindow.prototype = Object.create(Window_Command.prototype);
PokemonMZ_BattleInputWindow.prototype.constructor = PokemonMZ_BattleInputWindow;
PokemonMZ_BattleInputWindow.prototype.initialize = function(rect, side) {
    Window_Command.prototype.initialize.call(this, rect);
    this.openness = 0;
};
PokemonMZ_BattleInputWindow.prototype.makeCommandList = function() {
    this.addCommand("Fight", "fight", true);
    this.addCommand("Pokémon", "pokemon", true);
    this.addCommand("Item", "item", true);
    this.addCommand("Run", "run", $PokemonMZ_gameBattle.canRunAway());
};

// PokemonMZ_BattleYesNoWindow
// The window for the player input command in battle
function PokemonMZ_BattleYesNoWindow() {
    this.initialize(...arguments);
}
PokemonMZ_BattleYesNoWindow.prototype = Object.create(Window_Command.prototype);
PokemonMZ_BattleYesNoWindow.prototype.constructor = PokemonMZ_BattleYesNoWindow;
PokemonMZ_BattleYesNoWindow.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this.openness = 0;
    this._mode = "";
};
PokemonMZ_BattleYesNoWindow.prototype.setMode = function(mode) {
    this._mode = mode;
};
PokemonMZ_BattleYesNoWindow.prototype.mode = function() {
    return this._mode;
};
PokemonMZ_BattleYesNoWindow.prototype.makeCommandList = function() {
    this.addCommand("Yes", "yes", true);
    this.addCommand("No", "no", true);
};


// PokemonMZ_BattleStaticMessageWindow
// The window for displaying static messages in battle without user input
function PokemonMZ_BattleStaticMessageWindow() {
    this.initialize(...arguments);
}
PokemonMZ_BattleStaticMessageWindow.prototype = Object.create(Window_MenuStatus.prototype);
PokemonMZ_BattleStaticMessageWindow.prototype.constructor = PokemonMZ_BattleStaticMessageWindow;
PokemonMZ_BattleStaticMessageWindow.prototype.initialize = function(rect) {
    Window_MenuStatus.prototype.initialize.call(this, rect);
    this._text = null;
    this.hide();
};
PokemonMZ_BattleStaticMessageWindow.prototype.setText = function(text) {
    this._text = text;
    this.refresh();
};
PokemonMZ_BattleStaticMessageWindow.prototype.refresh = function(rect) {
    this.contents.clear();
    if (this._text) {
        const lines = this._text.split("\n")
        for (let i=0; i<lines.length; i++) {
            this.drawText(lines[i], 5, i*this.lineHeight());
        }
    }
};

// PokemonMZ_Window_PokemonBattleMoves
// The window for the move selection in battle
function PokemonMZ_Window_PokemonBattleMoves() {
    this.initialize(...arguments);
}
PokemonMZ_Window_PokemonBattleMoves.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_PokemonBattleMoves.prototype.constructor = PokemonMZ_Window_PokemonBattleMoves;
PokemonMZ_Window_PokemonBattleMoves.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this._pokemon = null;
};
PokemonMZ_Window_PokemonBattleMoves.prototype.setPokemon = function(pokemon) {
    this._pokemon = pokemon;
    this.refresh();
};
PokemonMZ_Window_PokemonBattleMoves.prototype.makeCommandList = function() {
    if (this._pokemon) {
        const moveLength = this._pokemon.moves().length;

        for (let i=0; i < moveLength; i++) {
            const move = this._pokemon.move(i);
            const moveName = this._pokemon.moveName(move);
            this.addCommand(moveName, i, true, move)
        }
    }
};
PokemonMZ_Window_PokemonBattleMoves.prototype.commandExt = function(index) {
    return this._list[index].ext;
};
PokemonMZ_Window_PokemonBattleMoves.prototype.drawItem = function(index) {
    const rect = this.itemLineRect(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));

    const move = this.commandExt(index);
    const moveData = this._pokemon.moveDataFromIndex(index);

    const currentPP = move.pp;
    const maxPP = this._pokemon.movePP(move.id, move.ppup)
    const typeName = this._pokemon.typeName(moveData.type)

    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, "left");
    this.drawText("Type: " + typeName, rect.x+380, rect.y, rect.width, "left");
    this.drawText("PP: " + String(currentPP) + " / " + String(maxPP), rect.x, rect.y, rect.width, "right");
};

function PokemonMZ_Window_PokemonForgetMoves() {
    this.initialize(...arguments);
}
PokemonMZ_Window_PokemonForgetMoves.prototype = Object.create(Window_Command.prototype);
PokemonMZ_Window_PokemonForgetMoves.prototype.constructor = PokemonMZ_Window_PokemonForgetMoves;
PokemonMZ_Window_PokemonForgetMoves.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this._pokemon = null;
};
PokemonMZ_Window_PokemonForgetMoves.prototype.setPokemon = function(pokemon) {
    this._pokemon = pokemon;
    this.refresh();
};
PokemonMZ_Window_PokemonForgetMoves.prototype.makeCommandList = function() {
    if (this._pokemon) {
        const moveLength = this._pokemon.moves().length;

        for (let i=0; i < moveLength; i++) {
            const move = this._pokemon.move(i);
            const moveName = this._pokemon.moveName(move);
            this.addCommand(moveName, i, true, move)    // Note change enabled for HMs
        }
    }
};
PokemonMZ_Window_PokemonForgetMoves.prototype.commandExt = function(index) {
    return this._list[index].ext;
};



function PokemonMZ_PokemonLevelUpWindow() {
    this.initialize(...arguments);
}
PokemonMZ_PokemonLevelUpWindow.prototype = Object.create(Window_MenuStatus.prototype);
PokemonMZ_PokemonLevelUpWindow.prototype.constructor = PokemonMZ_PokemonLevelUpWindow;
PokemonMZ_PokemonLevelUpWindow.prototype.initialize = function(rect) {
    Window_MenuStatus.prototype.initialize.call(this, rect);
    this._pokemon = null;
    this.hide();
};
PokemonMZ_PokemonLevelUpWindow.prototype.setPokemon = function(pokemon) {
    this._pokemon = pokemon;
    this.refresh();
};
PokemonMZ_PokemonLevelUpWindow.prototype.refresh = function(rect) {
    const lineHeight = this.lineHeight();
    this.contents.clear();
    if (this._pokemon) {
        const pokemon = this._pokemon;
        const x = 0;
        const y = 0;

        this.changeTextColor(ColorManager.systemColor());
        this.drawText("Attack", x, y, 80);
        this.drawText("Defense", x, y+lineHeight*1, 80);
        this.drawText("Speed", x, y+lineHeight*2, 80);
        this.drawText("Special", x, y+lineHeight*3, 80);
        this.resetTextColor();
        this.drawText(pokemon.patk(), x + 80, y, 64, "right");
        this.drawText(pokemon.pdef(), x + 80, y+lineHeight*1, 64, "right");
        this.drawText(pokemon.spd(), x + 80, y+lineHeight*2, 64, "right");
        this.drawText(pokemon.satk(), x + 80, y+lineHeight*3, 64, "right");
    }
};