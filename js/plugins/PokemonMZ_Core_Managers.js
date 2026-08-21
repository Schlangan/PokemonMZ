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
DataManager.enhanceAnimations = function() {
    $PokemonMZ_dataAnimations = {}
    for (animation of $PokemonMZ_dataAnimationsList) {
        if (animation) {
            $PokemonMZ_dataAnimations[animation.id] = animation;
        }
    }
}
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

DataManager.verifyDatabase = function() {
    // This function will check the contents of the database and give
    // warnings for anomalies found within the data

    // First, identify declared items in the database
    let index;
    DataManager.declared = {};
    DataManager.getDeclaredAnimations();
    DataManager.getDeclaredRMZAnimations();
    DataManager.getDeclaredTrainers();
    DataManager.getDeclaredTypes();
    DataManager.getDeclaredEncounters();
    DataManager.getDeclaredPokemons();
    DataManager.getDeclaredItems();
    DataManager.getDeclaredMoves();

    // Check all data structures
    DataManager.verifyAnimations();
    DataManager.verifyEncounters();
    DataManager.verifyItems();
    DataManager.verifyMoves();
    DataManager.verifyPokemons();
    DataManager.verifyRegionMaps();
    DataManager.verifyTypes();

}

DataManager.getDeclaredRMZAnimations = function() {
    DataManager.declared.rmzAnimations = [];
    for (const animationData of $dataAnimations) {
        if (animationData && animationData.id) {
            DataManager.declared.rmzAnimations.push(animationData.id);
        }
    }
};
DataManager.getDeclaredAnimations = function() {
    DataManager.declared.animations = Object.keys($PokemonMZ_dataAnimations)
};


DataManager.getDeclaredTrainers = function() {
    DataManager.declared.trainers = [];
    for (const actorData of $dataActors) {
        if (actorData && actorData.id) {
            DataManager.declared.trainers.push(actorData.id);
        }
    }
};
DataManager.getDeclaredTypes = function() {
    DataManager.declared.types = [];
    let index = 0;
    for (const typeData of $PokemonMZ_dataTypes) {
        if (typeData) {
            if (typeData.id) {
                if (DataManager.declared.types.includes(typeData.id)) {
                    console.error("PokemonMZ_Types.json - Index " + String(index) + " - Duplicate ID " + typeData.id);
                } else {
                    DataManager.declared.types.push(typeData.id);
                }
            } else {
                console.error("PokemonMZ_Types.json - Index " + String(index) + " - Missing ID")
            }
        }
        index++;
    }
};
DataManager.getDeclaredEncounters = function() {
    DataManager.declared.encounters = [];
    let index = 0;
    const troopIds = [];

    index = 0;
    for (const troopData of $dataTroops) {
        if (troopData) {
            if (troopIds.includes(troopData.name)) {
                console.error("Troops.json - Index " + String(index) + " - Found duplicate troop name - Name : " + troopData.name);
            } else {
                troopIds.push(troopData.name);
            }
        }
        index++;
    }
    index = 0;
    for (const encounterData of $PokemonMZ_dataEncounters) {
        if (encounterData && encounterData.id) {
            if (DataManager.declared.encounters.includes(encounterData.id)) {
                console.error("PokemonMZ_Encounters.json - Index " + String(index) + " - Found duplicate encounter name - ID : " + encounter.id);
            } else {
                DataManager.declared.encounters.push(encounterData.id);
            }

        }
        index++;
    }
    for (const troopId of troopIds) {
        if (!DataManager.declared.encounters.includes(troopId)) {
            console.error("PokemonMZ_Encounters.json - Missing encounter data - ID : " + troopId);
        }
    }
    for (const encounterId of DataManager.declared.encounters) {
        if (!troopIds.includes(encounterId)) {
            console.error("Troops.json - Missing troop name - ID : " + encounterId);
        }
    }
};
DataManager.getDeclaredPokemons = function() {
    DataManager.declared.pokemons = [];
    let index = 0;
    const enemyIds = [];

    index = 0;
    for (const enemyData of $dataEnemies) {
        if (enemyData && enemyData.pkmz_data && enemyData.pkmz_data.id) {
            if (enemyIds.includes(enemyData.pkmz_data.id)) {
                console.error("Enemies.json - Index " + String(index) + " - Found duplicate pokemon id - Id : " + enemyData.pkmz_data.id);
            } else {
                enemyIds.push(enemyData.pkmz_data.id);
            }
        } else if (enemyData && enemyData.note && enemyData.note != "") {
            const noteData = DataManager.parsePokemonMZ_Notes(enemyData.note)
            if (noteData && noteData.id) {
                enemyIds.push(noteData.id);
            }
        }
        index++;
    }
    index = 0;
    for (const pokemonData of $PokemonMZ_dataPokemon) {
        if (pokemonData && pokemonData.id) {
            if (DataManager.declared.pokemons.includes(pokemonData.id)) {
                console.error("PokemonMZ_Pokemon.json - Index " + String(index) + " - Found duplicate pokemon - ID : " + pokemonData.id);
            } else {
                DataManager.declared.pokemons.push(pokemonData.id);
            }

        }
        index++;
    }
    for (const enemyId of enemyIds) {
        if (!DataManager.declared.pokemons.includes(enemyId)) {
            console.error("PokemonMZ_Pokemon.json - Missing pokemon data - ID : " + enemyId);
        }
    }
    for (const enemyId of DataManager.declared.pokemons) {
        if (!enemyIds.includes(enemyId)) {
            console.error("Enemies.json - Missing pokemon - ID : " + enemyId);
        }
    }
};
DataManager.getDeclaredItems = function() {
    DataManager.declared.items = [];
    let index = 0;
    const itemsIds = [];

    index = 0;
    for (const itemData of $dataItems) {
        if (itemData && itemData.pkmz_data && itemData.pkmz_data.id) {
            if (itemsIds.includes(itemData.pkmz_data.id)) {
                console.error("Items.json - Index " + String(index) + " - Found duplicate item id - Id : " + itemData.pkmz_data.id);
            } else {
                itemsIds.push(itemData.pkmz_data.id);
            }
        } else if (itemData && itemData.note && itemData.note != "") {
            const noteData = DataManager.parsePokemonMZ_Notes(itemData.note)
            if (noteData && noteData.id) {
                itemsIds.push(noteData.id);
            }
        }
        index++;
    }
    index = 0;
    for (const itemData of $PokemonMZ_dataItems) {
        if (itemData && itemData.id) {
            if (DataManager.declared.items.includes(itemData.id)) {
                console.error("PokemonMZ_Items.json - Index " + String(index) + " - Found duplicate item - ID : " + itemData.id);
            } else {
                DataManager.declared.items.push(itemData.id);
            }

        }
        index++;
    }
    for (const itemId of itemsIds) {
        if (!DataManager.declared.items.includes(itemId)) {
            console.error("PokemonMZ_Items.json - Missing item data - ID : " + itemId);
        }
    }
    for (const itemId of DataManager.declared.items) {
        if (!itemsIds.includes(itemId)) {
            console.error("Items.json - Missing item - ID : " + itemId);
        }
    }
};
DataManager.getDeclaredMoves = function() {
    DataManager.declared.moves = [];
    let index = 0;
    const skillIds = [];

    index = 0;
    for (const skillData of $dataSkills) {
        if (skillData && skillData.pkmz_data && skillData.pkmz_data.id) {
            if (skillIds.includes(skillData.pkmz_data.id)) {
                console.error("Skills.json - Index " + String(index) + " - Found duplicate skill id - Id : " + skillData.pkmz_data.id);
            } else {
                skillIds.push(skillData.pkmz_data.id);
            }
        } else if (skillData && skillData.note && skillData.note != "") {
            const noteData = DataManager.parsePokemonMZ_Notes(skillData.note)
            if (noteData && noteData.id) {
                skillIds.push(noteData.id);
            }
        }
        index++;
    }
    index = 0;
    for (const skillData of $PokemonMZ_dataMoves) {
        if (skillData && skillData.id) {
            if (DataManager.declared.moves.includes(skillData.id)) {
                console.error("PokemonMZ_Moves.json - Index " + String(index) + " - Found duplicate move - ID : " + skillData.id);
            } else {
                DataManager.declared.moves.push(skillData.id);
            }

        }
        index++;
    }
    for (const itemId of skillIds) {
        if (!DataManager.declared.moves.includes(itemId)) {
            console.error("PokemonMZ_Moves.json - Missing move data - ID : " + itemId);
        }
    }
    for (const itemId of DataManager.declared.moves) {
        if (!skillIds.includes(itemId)) {
            console.error("Skills.json - Missing move - ID : " + itemId);
        }
    }
};


DataManager.verifyProperties = function(obj, errorMessagePrefix, mandatory, optional) {
    const found = [];

    for (const property of Object.keys(obj)) {
        found.push(property)
    };
    for (const property of mandatory) {
        if (!found.includes(property)) {
            console.error(errorMessagePrefix + "Missing mandatory property: " + property);
        }
    }
    for (const property of found) {
        if (!(mandatory.includes(property) || optional.includes(property))) {
            console.error(errorMessagePrefix + "Unknown property: " + property);
        }
    }
};

// Animations checks
DataManager.verifyAnimations = function() {
    // Check encounterData array
    index = 0;

    for (const animationId of DataManager.declared.animations) {
        const animationData = $PokemonMZ_dataAnimations[animationId];
        if (animationData) {
            DataManager.verifyAnimationData(animationId, animationData)
        }
        index++;
    }
};
DataManager.verifyAnimationData = function(id, animationData) {
    const errorMessagePrefix = "PokemonMZ_Animations.json - Id " + id + " - ";
    DataManager.verifyProperties(
        animationData,
        errorMessagePrefix,
        ["id","sequence"],
        [],
    );

    let index = 0;
    if (animationData.sequence) {
        for (const animationActionData of animationData.sequence) {
            DataManager.verifyAnimationActionData(errorMessagePrefix, index, animationActionData)
            index++;
        }
    }
};
DataManager.verifyAnimationActionData = function(prefix, index, animationActionData) {
    const errorMessagePrefix = prefix + "Index " + String(index) + " - ";
    const errorMessagePrefix2 = errorMessagePrefix + (animationActionData.type ?? "null") + " - ";
    // Check animation data type
    switch(animationActionData.type) {
    case "playAnimation":
        DataManager.verifyProperties(animationActionData, errorMessagePrefix2, ["type","target","animationId"], ["wait"]);
        break;
    case "playSE":
        DataManager.verifyProperties(animationActionData, errorMessagePrefix2, ["type","name","volume","pitch","pan"], []);
        break;
    case "moveSpriteForward":
    case "moveSpriteBackward":
    case "moveSpriteLeft":
    case "moveSpriteRight":
    case "moveSpriteUp":
    case "moveSpriteDown":   
        DataManager.verifyProperties(animationActionData, errorMessagePrefix2, ["type","target","distance","duration"], []);
        if (animationActionData.target) {
            if (!["user","opponent"].includes(animationActionData.target)) {
                console.error(errorMessagePrefix + "Unknown target: " + animationActionData.target)
            }
        }
        break;
    case "wait":   
        DataManager.verifyProperties(animationActionData, errorMessagePrefix2, ["type","frames"], []);
        break;
    case "hideSprite":   
        DataManager.verifyProperties(animationActionData, errorMessagePrefix2, ["type","target"], []);
        if (animationActionData.target) {
            if (!["user","opponent"].includes(animationActionData.target)) {
                console.error(errorMessagePrefix + "Unknown target: " + animationActionData.target)
            }
        }
        break;
    case "showSprite":   
        DataManager.verifyProperties(animationActionData, errorMessagePrefix2, ["type","target"], []);
        if (animationActionData.target) {
            if (!["user","opponent"].includes(animationActionData.target)) {
                console.error(errorMessagePrefix + "Unknown target: " + animationActionData.target)
            }
        }
        break;  
    default:
        console.error(errorMessagePrefix + "Unknown animation data type: " + animationActionData.type);
    }
};

// Encounters checks
DataManager.verifyEncounters = function() {
    // Check encounterData array
    index = 0;
    for (const encounterData of $PokemonMZ_dataEncounters) {
        if (encounterData) {
            DataManager.verifyEncounterData(index, encounterData)
        }
        index++;
    }
};
DataManager.verifyEncounterData = function(index, encounterData) {
    const encounterId = encounterData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Types.json - Index " + String(index) + " - ID " + encounterId + " - ";

    // Check encounter type
    switch(encounterData.type) {
    case "trainer":
        DataManager.verifyEncounterDataTrainer(index, encounterData);
        break;
    case "wild":
        DataManager.verifyEncounterDataWild(index, encounterData);
        break;
    default:
        console.error(errorMessagePrefix + "Unknown encounter type: " + encounterData.type);
    }
};
DataManager.verifyEncounterDataWild = function(index, encounterData) {
    const encounterId = encounterData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Types.json - Index " + String(index) + " - ID " + encounterId + " - Wild - ";

    DataManager.verifyProperties(
        encounterData,
        errorMessagePrefix,
        ["id","type","pokemons"],
        [],
    );

    let indexWildPokemonData = 0;
    if (encounterData.pokemons) {
        for (const wildPokemonData of encounterData.pokemons) {
            DataManager.verifyWildPokemonData(errorMessagePrefix, indexWildPokemonData, wildPokemonData);
            indexWildPokemonData++;
        }
    }
};
DataManager.verifyWildPokemonData = function(prefix, index, wildPokemonData) {
    const errorMessagePrefix = prefix + "Index " + String(index) + " - ";
    
    if (wildPokemonData.condition) {
        switch (wildPokemonData.condition) {
        case "fishing":
            DataManager.verifyProperties(
                wildPokemonData,
                errorMessagePrefix,
                ["id","levelMin","levelMax","rate","condition","itemId"],
                [],
            );
            if (wildPokemonData.itemId) {
                if (!DataManager.declared.items.includes(wildPokemonData.itemId)) {
                    console.error(errorMessagePrefix + "Unknown fishing item ID: " + wildPokemonData.itemId)
                }
            }
            break;
        default:
            DataManager.verifyProperties(
                wildPokemonData,
                errorMessagePrefix,
                ["id","levelMin","levelMax","rate","condition"],
                [],
            );
            console.error(errorMessagePrefix + "Unknown condition type: " + wildPokemonData.condition)
        }
    } else {
        DataManager.verifyProperties(
            wildPokemonData,
            errorMessagePrefix,
            ["id","levelMin","levelMax","rate"],
            [],
        );
    }

    if (wildPokemonData.id) {
        if (!DataManager.declared.pokemons.includes(wildPokemonData.id)) {
            console.error(errorMessagePrefix + "Unknown pokemon ID: " + wildPokemonData.id)
        }
    }
};
DataManager.verifyEncounterDataTrainer = function(index, encounterData) {
    const encounterId = encounterData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Types.json - Index " + String(index) + " - ID " + encounterId + " - Trainer - ";

    DataManager.verifyProperties(
        encounterData,
        errorMessagePrefix,
        ["id","type","trainerActor","ia","pokemons","defeatText","money"],
        ["iaModifiers","victoryText"],
    );

    if (encounterData.trainerActor) {
        if (!DataManager.declared.trainers.includes(encounterData.trainerActor)) {
            console.error(errorMessagePrefix + "Unknown trainer actor ID: " + encounterData.trainerActor)
        }
    }
    if (encounterData.ia) {
        if (!["random","basic","effective"].includes(encounterData.ia)) {
            console.error(errorMessagePrefix + "Unknown trainer AI type: " + encounterData.ia)
        }
    }

    let indexTrainerPokemonData = 0;
    if (encounterData.pokemons) {
        for (const trainerPokemonData of encounterData.pokemons) {
            DataManager.verifyTrainerPokemonData(errorMessagePrefix, indexTrainerPokemonData, trainerPokemonData);
            indexTrainerPokemonData++;
        }
    }
    if (encounterData.iaModifiers) {
        DataManager.verifyIaModifierData(errorMessagePrefix, index, encounterData.iaModifiers);
    }
};
DataManager.verifyTrainerPokemonData = function(prefix, index, trainerPokemonData) {
    const errorMessagePrefix = prefix + "Index " + String(index) + " - ";
    
    DataManager.verifyProperties(
        trainerPokemonData,
        errorMessagePrefix,
        ["id","level","moveset","dv","ev"],
        ["addMoves"],
    );
    if (trainerPokemonData.id) {
        if (!DataManager.declared.pokemons.includes(trainerPokemonData.id)) {
            console.error(errorMessagePrefix + "Unknown pokemon ID: " + trainerPokemonData.id)
        }
    }
    if (trainerPokemonData.moveset) {
        if (!["default","add"].includes(trainerPokemonData.moveset)) {
            console.error(errorMessagePrefix + "Unknown pokemon Moveset type: " + trainerPokemonData.moveset)
        }
        if (trainerPokemonData.moveset == "default") {
            if (trainerPokemonData.addMoves) { console.error(errorMessagePrefix + "AddMoves property ignored with 'default' moveset.") }
        } else if (trainerPokemonData.moveset == "addMoves") {
            if (!trainerPokemonData.addMoves) {  console.error(errorMessagePrefix + "AddMoves property missing with 'addMoves' moveset.") }
        }
    }
    if (trainerPokemonData.addMoves) {
        for (const moveId of trainerPokemonData.addMoves) {
            if (!DataManager.declared.moves.includes(moveId)) {
                console.error(errorMessagePrefix + "Unknown added move id : " + moveId) 
            }
        }
    }
    if (trainerPokemonData.dv) {
        if (!["default"].includes(trainerPokemonData.dv)) {
            console.error(errorMessagePrefix + "Unknown pokemon DV type: " + trainerPokemonData.dv)
        }
    }
    if (trainerPokemonData.ev) {
        if (!["default"].includes(trainerPokemonData.dv)) {
            console.error(errorMessagePrefix + "Unknown pokemon DV type: " + trainerPokemonData.ev)
        }
    }

};
DataManager.verifyIaModifierData = function(prefix, index, iaModifierData) {
    const errorMessagePrefix = prefix + "Ia Modifier - ";
    DataManager.verifyProperties(
        iaModifierData,
        errorMessagePrefix,
        [],
        ["item"],
    );

    if (iaModifierData.item) {
        DataManager.verifyIaModifierDataItem(prefix, index, iaModifierData.item)
    }
};
DataManager.verifyIaModifierDataItem = function(prefix, index, iaModifierDataItem) {
    const errorMessagePrefix = prefix + "Item - ";
    DataManager.verifyProperties(
        iaModifierDataItem,
        errorMessagePrefix,
        ["id","condition","chance","maxPerPokemon"],
        [""],
    );

    if (iaModifierDataItem.id) {
        if (!DataManager.declared.items.includes(iaModifierDataItem.id)) {
            console.error(errorMessagePrefix + "Unknown item ID: " + iaModifierDataItem.id)
        }
    }
    if (iaModifierDataItem.condition) {
        if (!["random","hasStatus"].includes(iaModifierDataItem.condition)) {
            console.error(errorMessagePrefix + "Unknown condition: " + iaModifierDataItem.condition)
        }
    }
};

// Items checks
DataManager.verifyItems = function() {
    // Check itemData array
    index = 0;
    for (const itemData of $PokemonMZ_dataItems) {
        if (itemData) {
            DataManager.verifyItemData(index, itemData)
        }
        index++;
    }
};
DataManager.verifyItemData = function(index, itemData) {
    const itemId = itemData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Items.json - Index " + String(index) + " - ID " + itemId + " - ";

    let mandatoryProperties = ["id","user","category","battle","price","effect"]
    let optionalProperties = ["target"]

    if (itemData.user) {
        if (!["trainer"].includes(itemData.user)) {
            console.error(errorMessagePrefix + "Unknown item user: " + itemData.user);
        }
    }
    if (itemData.category) {
        if (!["regular","key","badge"].includes(itemData.category)) {
            console.error(errorMessagePrefix + "Unknown item category: " + itemData.user);
        }        
    }

    if (itemData.category == "badge") {
        mandatoryProperties = ["id","category"]
        optionalProperties = ["target","obedienceLevel","effect"]
    } else if (itemData.category == "key") {
        mandatoryProperties = ["id","user","category","battle","effect"]
        optionalProperties = ["target","price"]
    }

    // Check item effect
    if (itemData.effect) {
        switch(itemData.effect) {
        case "ball":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["gen1rate","gen1hpFactor"]),
                optionalProperties);
            break;
        case "cureStatus":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["status"]),
                optionalProperties);
            if (itemData.status) {
                if (!["poison","paralysis","burn","freeze","sleep","all"].includes(itemData.status)) {
                    console.error(errorMessagePrefix + "Unknown cure status item status: " + itemData.status);
                }
            }
            break;
        case "lockedItem":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["useMessage"]),
                optionalProperties);
            break;
        case "fishing":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["badMessage","biteChance"]),
                optionalProperties);
            break;
        case "recoverHpFixed":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["value"]),
                optionalProperties);
            break;
        case "recoverHpPercentCureStatus":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["value","status"]),
                optionalProperties);
            if (itemData.status) {
                if (!["poison","paralysis","burn","sleep","all"].includes(itemData.status)) {
                    console.error(errorMessagePrefix + "Unknown recover+cure status item status: " + itemData.status);
                }
            }
            break;
        case "restorePp":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["range","value"]),
                optionalProperties);
            if (itemData.range) {
                if (!["single","all"].includes(itemData.range)) {
                    console.error(errorMessagePrefix + "Unknown restorePp item range: " + itemData.range);
                }
            }
            break;
        case "increaseEv":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["stat","value","maxValue"]),
                optionalProperties);
            if (itemData.stat) {
                if (!["hp","patk","pdef","satk","sdef","spd"].includes(itemData.stat)) {
                    console.error(errorMessagePrefix + "Unknown increaseEv item stat: " + itemData.stat);
                }
            }
            break;
        case "repel":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["steps"]),
                optionalProperties);
            break;
        case "tm":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["move"]),
                optionalProperties);
            if (itemData.move) {
                if (!DataManager.declared.moves.includes(itemData.move)) {
                    console.error(errorMessagePrefix + "Unknown tm item move: " + itemData.move);
                }
            }
            break;
        case "passivePatkBoost":
        case "passivePdefBoost":
        case "passiveSpcBoost":
        case "passiveSpdBoost":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["boostPercent"]),
                optionalProperties);
            break;
        case "battlePdefUpUser":
        case "battleSpcUpUser":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["stage","mapMessage"]),
                optionalProperties.concat(["battleAnimation"]));
            if (itemData.battleAnimation) {
                if (!DataManager.declared.animations.includes(itemData.battleAnimation)) {
                    console.error(errorMessagePrefix + "Unknown battle animation ID: " + itemData.battleAnimation);
                }
            }
            break;
        case "itemFinder":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties.concat(["range","sound"]),
                optionalProperties);
            break;
        case "increaseLevel":
        case "evolutionItem":
        case "townMap": 
        case "escapeRope":
        case "cycling":
            DataManager.verifyProperties(
                itemData, 
                errorMessagePrefix, 
                mandatoryProperties,
                optionalProperties);
            break;
        default:
            console.error(errorMessagePrefix + "Unknown item effect: " + itemData.effect);
        }
    }
    
};

// Moves checks
DataManager.verifyMoves = function() {
    // Check moveData array
    index = 0;
    for (const moveData of $PokemonMZ_dataMoves) {
        if (moveData) {
            DataManager.verifyMoveData(index, moveData)
        }
        index++;
    }
};
DataManager.verifyMoveData = function(index, moveData) {
    const moveId = moveData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Moves.json - Index " + String(index) + " - ID " + moveId + " - ";

    let mandatoryProperties = [
        "id","type","target","pp","accuracy","effects"
    ]
    if (moveData.noAccuracy) {
        mandatoryProperties.splice(mandatoryProperties.indexOf("accuracy"),1);
    }

    DataManager.verifyProperties(
        moveData,
        errorMessagePrefix,
        mandatoryProperties,
        [
            "power","targetDefenseDivider","noCritical","noAccuracy","noVariance",
            "cpuHigherEffectFailure","fixedDamage","forbidMirrorMove","alwaysEffects",
            "mapEffect","animationAlways","animationHit","priority","category","hitDig"
        ],
    );
    if (moveData.target) {
        if (!["user","opponent"].includes(moveData.target)) {
            console.error(errorMessagePrefix + "Unknown move target: " + moveData.target);
        }
    }

    if (moveData.category) {
        if (!["status"].includes(moveData.category)) {
            console.error(errorMessagePrefix + "Unknown move category: " + moveData.category);
        }
    }
    if (moveData.animationAlways) {
        if (!DataManager.declared.animations.includes(moveData.animationAlways)) {
            console.error(errorMessagePrefix + "Unknown AnimationAlways id: " + moveData.animationAlways);
        }
    }
    if (moveData.animationHit) {
        if (!DataManager.declared.animations.includes(moveData.animationHit)) {
            console.error(errorMessagePrefix + "Unknown AnimationHit id: " + moveData.animationHit);
        }
    }
    if (moveData.mapEffect) {
        if (!["teleport","dig"].includes(moveData.mapEffect)) {
            console.error(errorMessagePrefix + "Unknown Map Effect: " + moveData.mapEffect);
        }
    }

    let index2 = 0;
    if (moveData.effects) {
        for (const moveEffect of moveData.effects) {
            DataManager.verifyMoveEffect(errorMessagePrefix, index2, moveEffect)
            index2++;
        }
    }
};
DataManager.verifyMoveEffect = function(prefix, index, moveEffect) {
    const errorMessagePrefix = prefix + "Effect index " + String(index) + " - ";

    const mandatoryProperties = ["type"]
    const optionalProperties = ["except"]

    switch(moveEffect.type) {
    case "bide":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat("unleashAnimationId"),
            optionalProperties
        );
        if (moveEffect.unleashAnimationId) {
            if (!DataManager.declared.animations.includes(moveEffect.unleashAnimationId)) {
                console.error(errorMessagePrefix + "Unknown AnimationHit id: " + moveEffect.unleashAnimationId);
            }
        }
        break;
    case "bindTarget":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["min","max","percentChances"]),
            optionalProperties
        );
        break;
    case "burnTarget":
    case "paralyzeTarget":
    case "sleepTarget":
    case "confuseTarget":
    case "flinchTarget":
    case "seedTarget":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["percentChance"]),
            optionalProperties
        );
        break;
    case "poisonTarget":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["percentChance"]),
            optionalProperties.concat(["multiHitEffect"])
        );
        if (moveEffect.multiHitEffect) {
            if (!["all","last"].includes(moveEffect.multiHitEffect)) {
                console.error(errorMessagePrefix + "Unknown Multi Hit Effect: " + moveEffect.multiHitEffect);
            }
        }
        break;
    case "disableTargetMove":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["minTurn","maxTurn","select"]),
            optionalProperties
        );
        if (moveEffect.select) {
            if (!["random"].includes(moveEffect.select)) {
                console.error(errorMessagePrefix + "Unknown Disable Target Move Select: " + moveEffect.select);
            }
        }
        break;
    case "multiHit":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["min","max","percentChances"]),
            optionalProperties
        );
        break;
    case "drainTargetHp":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["percentDamageDrain","text"]),
            optionalProperties
        );
        break;
    case "recoilPercent":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["value"]),
            optionalProperties
        );
        break;
    case "berserk":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["min","max"]),
            optionalProperties
        );
        break;
    case "dig":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties,
            optionalProperties.concat(["animationTurn1"])
        );
        break;
    case "patkUpUser":
    case "pdefUpUser":
    case "spcUpUser":
    case "evaUpUser":
    case "patkDownTarget":
    case "pdefDownTarget":
    case "spdDownTarget":
    case "accDownTarget":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["stage","percentChance"]),
            optionalProperties
        );
        break;
    case "forceSwitchOut":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties.concat(["message"]),
            optionalProperties
        );
        break;
    case "highCritical":
    case "focusEnergy":
    case "minimizeUser":
    case "rage":
    case "splash":
    case "teleport":
    case "faintUser":
    case "mirrorMove":
    case "moneyDrop":
    case "rest":
        DataManager.verifyProperties(
            moveEffect,
            errorMessagePrefix,
            mandatoryProperties,
            optionalProperties
        );
        break;
    default:
        console.error(errorMessagePrefix + "Unknown Move Effect type: " + moveEffect.type);
    }

    if (moveEffect.except) {
        let index2 = 0;
        for (const exceptionData of moveEffect.except) {
            DataManager.verifyMoveExceptionData(errorMessagePrefix, index2, exceptionData)
            index2++;
        }
    }
};
DataManager.verifyMoveExceptionData = function(prefix, index, exceptionData) {
    const errorMessagePrefix = prefix + "Exception index " + String(index) + " - ";
    DataManager.verifyProperties(
        exceptionData,
        errorMessagePrefix,
        [],
        ["type"],
    );

    if (exceptionData.type) {
        if (!DataManager.declared.types.includes(exceptionData.type)) {
            console.error(errorMessagePrefix + "Unknown type: " + exceptionData.type);
        }
    }
};

// Pokemon checks
DataManager.verifyPokemons = function() {
    // Check moveData array
    index = 0;
    for (const pokemonData of $PokemonMZ_dataPokemon) {
        if (pokemonData) {
            DataManager.verifyPokemonData(index, pokemonData)
        }
        index++;
    }
};
DataManager.verifyPokemonData = function(index, pokemonData) {
    const pokemonId = pokemonData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Pokemon.json - Index " + String(index) + " - ID " + pokemonId + " - ";
    let index2;

    DataManager.verifyProperties(
        pokemonData,
        errorMessagePrefix,
        [
            "id","pokedex","category","description","height","weight","types",
            "baseStats","expCurve","catchRate","xpYield","evolutions",
            "learnedMoves","hmMoves","tmMoves"
        ],
        ["ev"],
    );

    if (pokemonData.pokedexData) {
        index2 = 0;
        for (const pokedexData of pokemonData.pokedexData) {
            DataManager.verifyPokemonPokedexData(errorMessagePrefix, index2, pokedexData)
            index2++;
        }
    }


    if (pokemonData.types) {
        for (const type of pokemonData.types) {
            if (!DataManager.declared.types.includes(type)) {
                console.error(errorMessagePrefix + "Unknown pokemon type: " + type);
            }
        }
    }
    if (pokemonData.baseStats) {
        DataManager.verifyProperties(
            pokemonData.baseStats,
            errorMessagePrefix + " Base Stats - ",
            ["hp","patk","pdef","satk","sdef","spc","spd"],
            [],
        );
    }
    if (pokemonData.expCurve) {
        if (!["erratic","fast","mediumFast","mediumSlow","slow","fluctuating"].includes(pokemonData.expCurve)) {
            console.error(errorMessagePrefix + "Unknown pokemon exp curve: " + pokemonData.expCurve);
        }
    }
    if (pokemonData.ev) {
        index2 = 0;
        for (const evData of pokemonData.ev) {
            DataManager.verifyPokemonEvData(errorMessagePrefix, index2, evData)
            index2++;
        }
    }
    if (pokemonData.evolutions) {
        index2 = 0;
        for (const evolutionData of pokemonData.evolutions) {
            DataManager.verifyPokemonEvolutionData(errorMessagePrefix, index2, evolutionData)
            index2++;
        }
    }
    if (pokemonData.learnedMoves) {
        index2 = 0;
        for (const moveLearnedData of pokemonData.learnedMoves) {
            DataManager.verifyPokemonMoveLearnedData(errorMessagePrefix, index2, moveLearnedData)
            index2++;
        }
    }

    if (pokemonData.hmMoves) {
        for (const move of pokemonData.hmMoves) {
            if (!DataManager.declared.moves.includes(move)) {
                console.error(errorMessagePrefix + "Unknown HM move id: " + move);
            }
        }
    }
    if (pokemonData.tmMoves) {
        for (const move of pokemonData.tmMoves) {
            if (!DataManager.declared.moves.includes(move)) {
                console.error(errorMessagePrefix + "Unknown TM move id: " + move);
            }
        }
    }

};

DataManager.verifyPokemonPokedexData = function(prefix, index, pokedexData) {
    const errorMessagePrefix = prefix + "Pokedex Data index " + String(index) + " - ";
    DataManager.verifyProperties(
        evData,
        errorMessagePrefix,
        ["region","number"],
        [],
    );
};
DataManager.verifyPokemonEvData = function(prefix, index, evData) {
    const errorMessagePrefix = prefix + "EV Index " + String(index) + " - ";
    DataManager.verifyProperties(
        evData,
        errorMessagePrefix,
        [],
        ["hp","patk","pdef","satk","sdef","spd"],
    );
};
DataManager.verifyPokemonEvolutionData = function(prefix, index, evolutionData) {
    let errorMessagePrefix = prefix + "Evolution Data Index " + String(index) + " - ";
    const mandatoryProperties = ["to","mode"]

    if (evolutionData.to) {
        if (!DataManager.declared.pokemons.includes(evolutionData.to)) {
            console.error(errorMessagePrefix + "Unknown evolution pokemon : " + evolutionData.to);
        }
        errorMessagePrefix += evolutionData.to + " - ";
    }

    switch(evolutionData.mode) {
    case "level":
        DataManager.verifyProperties(
            evolutionData,
            errorMessagePrefix,
            mandatoryProperties.concat(["level"]),
            [],
        );
        break;
    case "useItem":
        DataManager.verifyProperties(
            evolutionData,
            errorMessagePrefix,
            mandatoryProperties.concat(["item"]),
            [],
        );
        if (evolutionData.item) {
            if (!DataManager.declared.items.includes(evolutionData.item)) {
                console.error(errorMessagePrefix + "Unknown evolution item : " + evolutionData.item);
            }
        }
        break;
    case "trade":
        break;
    default:
        console.error(errorMessagePrefix + "Unknown evolution mode : " + evolutionData.mode);
    }
};
DataManager.verifyPokemonMoveLearnedData = function(prefix, index, moveLearnedData) {
    const errorMessagePrefix = prefix + "Learnedd Move index " + String(index) + " - ";

    DataManager.verifyProperties(
        moveLearnedData,
        errorMessagePrefix,
        ["lvl","move"],
        [],
    );
    if (moveLearnedData.move) {
        if (!DataManager.declared.moves.includes(moveLearnedData.move)) {
            console.error(errorMessagePrefix + "Unknown move id: " + moveLearnedData.move);
        }
    }
};

// Region Maps checks
DataManager.verifyRegionMaps = function() {
    // Check anomalies per regionMapData
    let index = 0;
    for (const regionMapData of $PokemonMZ_dataRegionMaps) {
        if (regionMapData) {
            DataManager.verifyRegionMapData(index, regionMapData)
        }
        index++;
    }
};
DataManager.verifyRegionMapData = function(index, regionMapData) {
    // Check the type Data structure
    const regionId = regionMapData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_RegionMaps.json - Index " + String(index) + " - ID " + regionId + " - ";

    DataManager.verifyProperties(
        regionMapData,
        errorMessagePrefix,
        ["id","pictureName","cellSize","poi"],
        [],
    );

    let index2 = 0;
    if (regionMapData.poi) {
        for (const poiData of regionMapData.poi) {
            if (poiData) {
                DataManager.verifyRegionMapPoiData(errorMessagePrefix, index2, poiData)
            }
            index2++;
        }
    }
};
DataManager.verifyRegionMapPoiData = function(prefix, index, poiData) {
    const errorMessagePrefix = prefix + "Index " + String(index) + " - ";

    DataManager.verifyProperties(
        poiData,
        errorMessagePrefix,
        ["id","name","x","y","pokemons"],
        [],
    );
    if (poiData.pokemons) {
        for (const id of poiData.pokemons) {
            if (!DataManager.declared.pokemons.includes(id)) {
                console.error(errorMessagePrefix + "Unknown pokemon id: " + id);
            }
        }
    }
};

// Types checks
DataManager.verifyTypes = function() {
    // Check anomalies per typeData
    let index = 0;
    for (const typeData of $PokemonMZ_dataTypes) {
        if (typeData) {
            DataManager.verifyTypeData(index, typeData)
        }
        index++;
    }
};
DataManager.verifyTypeData = function(index, typeData) {
    // Check the type Data structure
    const typeId = typeData.id ?? "null";
    const errorMessagePrefix = "PokemonMZ_Types.json - Index " + String(index) + " - ID " + typeId + " - ";

    DataManager.verifyProperties(
        typeData,
        errorMessagePrefix,
        ["id","name","weak","strong","immune","damage"],
        [],
    );

    if (typeData.weak) {
        for (const id of typeData.weak) {
            if (!DataManager.declared.types.includes(id)) { console.error(errorMessagePrefix + "Weak property, unknown type ID : " + id);}
        }
    }
    if (typeData.strong) {
        for (const id of typeData.strong) {
            if (!DataManager.declared.types.includes(id)) { console.error(errorMessagePrefix + "Strong property, unknown type ID : " + id);}
        }
    }
    if (typeData.immune) {
        for (const id of typeData.immune) {
            if (!DataManager.declared.types.includes(id)) { console.error(errorMessagePrefix + "Immune property, unknown type ID : " + id);}
        }
    }
    if (typeData.damage) {
        if (!["physical","special"].includes(typeData.damage)) { 
            console.error(errorMessagePrefix + "Damage property, unknown damage type : " + typeData.damage);
        }
    }
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

PokemonMZ_BattleManager.enemyTrainerSpriteY = 50;
PokemonMZ_BattleManager.enemyPokemonSpriteY = 310;
PokemonMZ_BattleManager.playerTrainerSpriteShiftY = 180;
PokemonMZ_BattleManager.playerPokemonSpriteY = 445;

PokemonMZ_BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    
    // Setup encounter
    $PokemonMZ_gameBattle.setup(troopId);

    // If wild battle and no valid encounter found (due to repel for ex., stop here)
    if (this.abortingWildEncounter()) {
        $gameMap.PokemonMZ_endFishing(); // Abort fishing if needed
        return;
    }

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
PokemonMZ_BattleManager.abortingWildEncounter = function() {
    return $PokemonMZ_gameBattle.isWildBattle() && !$PokemonMZ_gameBattle.foundPossibleWildPokemon()
}
PokemonMZ_BattleManager.initMembers = function() {
    this._debugPhase = "";
    this._debugSubPhase = "";
    this._debugStep = "";

    this._abortWildEncounter = false;
    this._phaseWaitForText = false;

    this._phase = "";
    this._subPhase = "";
    this._animationPhase = "";
    this._animationData = null;

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
    this._enemyUseItem = null;
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
PokemonMZ_BattleManager.enemyPokemon = function() {
    return this._enemyChosenPokemon;
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
};
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
        case "pickupMoneyThenWinBattle":
            this.pickupMoneyThenWinBattle();
            break;
        case "winBattle":
            this.winBattle();
            break;
        case "loseBattle":
            this.loseBattle();
            break; 
        case "pickupMoneyThenEndPlayerEscape":
            this.pickupMoneyThenEndPlayerEscape();
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
        case "targetAnimation":
            this.targetAnimation();
            break;
        case "animating":
            this.updateAnimation();
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
        case "startHealUser":
            this.startHealUser();
            break;
        case "proceedHealUser":
            this.proceedHealUser();
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
        case "removePokemonStatus":
            this.removePokemonStatus();
            break;
        case "animateUserEffect":
            this.animateUserEffect();
            break;
        case "showSprite":
            this.showSprite();
            break;
        case "blowTargetAway":
            if (this._subPhaseParams[0] == "player") {
                this.updatePlayerPokemonBlownAway();
            } else {
                this.updateEnemyPokemonBlownAway();
            }
            break;
    }
};
PokemonMZ_BattleManager.initializeEnterTrainerVsWild = function() { 
    const playerSprite = this._spriteset.playerTrainerSprite();
    playerSprite.x = Graphics.boxWidth;
    playerSprite.y = Graphics.boxHeight - PokemonMZ_BattleManager.playerTrainerSpriteShiftY - playerSprite.height*playerSprite.scale.y;
    playerSprite.visible = true;
    const pokemon = $PokemonMZ_gameBattle.wildPokemon();
    $gamePlayerTrainer.addSeenPokemon(pokemon._data.id);

    const enemySprite = this._spriteset.enemyPokemonSprite();
    enemySprite.setPokemon(pokemon);
    enemySprite.placeBottomCenter(-100,PokemonMZ_BattleManager.enemyPokemonSpriteY);
    enemySprite.visible = true;
    pokemon.setBattleSprite(enemySprite);
    this._enemyChosenPokemon = pokemon;
    this._currentEnemyIndex = 0;
};
PokemonMZ_BattleManager.initializeEnterTrainers = function() {
    const playerSprite = this._spriteset.playerTrainerSprite();
    playerSprite.x = Graphics.boxWidth;
    playerSprite.y = Graphics.boxHeight - PokemonMZ_BattleManager.playerTrainerSpriteShiftY - playerSprite.height*playerSprite.scale.y;
    playerSprite.visible = true;

    for (const sprite of this._spriteset.enemyTrainerSprites()) {
        sprite.x = -100;
        sprite.y = PokemonMZ_BattleManager.enemyTrainerSpriteY;
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
        enemySprite.placeBottomCenter(enemySprite._bottomCenterX + 10,PokemonMZ_BattleManager.enemyPokemonSpriteY);
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
    
    const pokemon = this._enemyChosenPokemon;

    let message;
    if ($gameMap.PokemonMZ_isFishing()) {
        // Ends fishing on map to recover menu access
        $gameMap.PokemonMZ_endFishing();
        message = "The hooked " + pokemon.name() + " attacked!"
    } else {
        message = "Wild " + pokemon.name() + " appeared!"
    }
    
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
        if (sprite.x < Graphics.boxWidth + 10) {
            phaseCompleted = false;
            sprite.x += 10;
        }      
    }
    if (phaseCompleted) {
        this.changePhase("enemySendFirstPokemon");
    }
};
PokemonMZ_BattleManager.updatePlayerPokemonBlownAway = function() {
    let phaseCompleted = true;
    const playerSprite = this._spriteset.playerPokemonSprite();

    if (ConfigManager.battleAnimation) {
        if (playerSprite.x > -200) {
            playerSprite.placeBottomCenter(playerSprite._bottomCenterX  - 20, playerSprite._bottomCenterY);
            phaseCompleted = false;
        }
    };
    if (phaseCompleted) {
        this.clearSubPhase();
    }
};
PokemonMZ_BattleManager.updateEnemyPokemonBlownAway = function() {
    let phaseCompleted = true;
    const enemySprite = this._spriteset.enemyPokemonSprite();

    if (ConfigManager.battleAnimation) {
        if (enemySprite.x < Graphics.boxWidth + 5) {
            enemySprite.placeBottomCenter(enemySprite._bottomCenterX + 20,enemySprite._bottomCenterY);
            phaseCompleted = false;
        }
    };
    if (phaseCompleted) {
        this.clearSubPhase();
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
    // When enemy sends a pokemon, reset last seen move from player
    // Mirror move fails if launched after switch
    if (this._playerChosenPokemon) {
        this._playerChosenPokemon.clearLastSeenEnemyMove();
    }

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
    pokemonSprite.placeBottomCenter(570,PokemonMZ_BattleManager.enemyPokemonSpriteY);
    pokemonSprite.setScale(0.1);
    pokemonSprite.visible = true;
    pokemon.setBattleSprite(pokemonSprite);
    this.changePhase("enemyPokemonAppear");
    const message = enemy.name() + " sent out " + pokemon.name() + "!\\|\\^"
    $gameMessage.add(message);
};
PokemonMZ_BattleManager.enemyPokemonAppear = function() {
    const pokemonSprite = this._spriteset.enemyPokemonSprite();
    const maxScale = this._enemyChosenPokemon.battleSpriteMaxScale();

    if (pokemonSprite.scale.x < maxScale) {
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
    // When player sends a pokemon, reset last seen move from enemy
    // Mirror move fails if launched after switch
    if (this._enemyChosenPokemon) {
        this._enemyChosenPokemon.clearLastSeenEnemyMove();
    }


    this.markBattledPokemons();

    const pokemonSprite = this._spriteset.playerPokemonSprite();
    const pokemon = this._playerChosenPokemon;
    pokemon.resetStageModifiers();
    this._playerPokemonStatusWindow.setPokemon(pokemon);
    pokemonSprite.setPokemon(pokemon);
    pokemonSprite.placeBottomCenter(130,PokemonMZ_BattleManager.playerPokemonSpriteY);
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
    const maxScale = pokemon.battleSpriteMaxScale();
    pokemon.removeTemporaryStatuses();

    // Remove bind on enemy pokemon if recalling
    if (this._enemyChosenPokemon.isBound()) {
        this._enemyChosenPokemon.unBind();
    };

    const pokemonSprite = this._spriteset.playerPokemonSprite();

    if (pokemonSprite.scale.x == maxScale) {
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
    const maxScale = this._playerChosenPokemon.battleSpriteMaxScale();
    const pokemonSprite = this._spriteset.playerPokemonSprite();
    if (pokemonSprite.scale.x < maxScale) {
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

    if (pokemon.isBerserk()) {
        // In case of berserk, the player cannot select any action - the phase immediatly switch to 
        // berserk action chosen if berserk turns remain
        this.setPlayerMoveIndex(pokemon.berserkMoveIndex());
        this.calculateComputerMove();
        return;
    }

    if (pokemon.isRaging()) {
        // In case of rage, the player cannot select any action - 
        // the phase immediatly switch to rage action 
        this.setPlayerMoveIndex(pokemon.rageMoveIndex());
        this.calculateComputerMove();
        return;
    }

    if (pokemon.isDigging()) {
        // In case of dig, the player cannot select any action - 
        // the phase immediatly switch to dig turn 2
        this.setPlayerMoveIndex(pokemon.digMoveIndex());
        this.calculateComputerMove();
        return;
    }

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

    // If enemy pokemon was bounded, get it free
    if (this._enemyChosenPokemon.isBound()) {
        this._enemyChosenPokemon.unBind();
    };

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

    // If player pokemon was bounded, get it free
    if (this._playerChosenPokemon.isBound()) {
        this._playerChosenPokemon.unBind();
    };

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
            const outsiderFactor = $gamePlayerTrainer.pokemon(i).isOutsider() ? 1.5 : 1.0;
            this._playerXpGains[i] = Math.floor(splittedExp * outsiderFactor);
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
            let message = this._levelingUpPokemon.name() + " gained "
            if (this._levelingUpPokemon.isOutsider()) {
                message += "a boosted "
            }
            message += String(this._levelingUpPokemonExp) + " experience points!"
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
        // Wild Battle, it is over - go to money pickup phase and then win.
        this.pickupMoneyThenWinBattle();
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
    this.changePhase("pickupMoneyThenWinBattle");
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
PokemonMZ_BattleManager.addPickupMoneyMessage = function() {
    // Message to pickup money if the value is not zero
    const money = $PokemonMZ_gameBattle.moneyDropped();
    if (money > 0) {
        $gamePlayerTrainer.addMoney(money);
        const message = $gamePlayerTrainer.name() + " picked up " + String(money) + TextManager.currencyUnit + "!"
        $gameMessage.add(message);
    } 
};
PokemonMZ_BattleManager.pickupMoneyThenWinBattle = function() {
    if ($gameMessage.isBusy()) { return; }
    this.addPickupMoneyMessage();
    this.changePhase("winBattle");
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
PokemonMZ_BattleManager.pickupMoneyThenEndPlayerEscape = function() {
    this.addPickupMoneyMessage();
    this.changePhase("endPlayerEscape");
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
    this.changePhase("pickupMoneyThenWinBattle");
};
PokemonMZ_BattleManager.addWildToBox = function() { 
    $gamePlayerTrainer.addPokemonToCurrentBox(this._capturedPokemon);
    const message = this._capturedPokemon.name() + " was transferred to " + $gamePlayerTrainer.currentBoxName() + "!";
    $gameMessage.add(message);
    this.changePhase("pickupMoneyThenWinBattle");
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
    const enemyPokemon = this._enemyChosenPokemon;
    const playerPokemon = this._playerChosenPokemon;

    // Start with IA modifiers
    this._enemyUseItem = null;

    // If enemy pokemon is berserk, it only selects that move
    if (enemyPokemon.isBerserk()) {
        this._enemyMoveIndex = enemyPokemon.berserkMoveIndex();
        this.calculateBattleActions();
        return;
    }

    // If enemy pokemon is using rage, it only selects that move
    if (enemyPokemon.isRaging()) {
        this._enemyMoveIndex = enemyPokemon.rageMoveIndex();
        this.calculateBattleActions();
        return;
    }

    // If enemy pokemon is using dig, it only selects that move
    if (enemyPokemon.isDigging()) {
        this._enemyMoveIndex = enemyPokemon.digMoveIndex();
        this.calculateBattleActions();
        return;
    }

    if (trainer) {
        const modifiers = trainer.iaModifiers();
        if (modifiers) {
            this.calculateComputerItemUse(modifiers);
        }
    }
    
    // If enemy use item, skip other calculations
    if (this._enemyUseItem) {
        this._enemyMoveIndex = null;
        this.calculateBattleActions();
        return;
    }

    // If using binding move, same move is still used if opponent is bound
    if (playerPokemon.isBound()) {
        this._enemyMoveIndex = enemyPokemon.lastMoveIndex();
        this.calculateBattleActions();
        return;
    }

    // If biding, next move is bide
    if (enemyPokemon.isBiding()) {
        this._enemyMoveIndex = enemyPokemon.lastMoveIndex();
        this.calculateBattleActions();
        return;
    }

    // Define a list of possible move indexes and default scoring
    let scoringTable = [];

    const moves = enemyPokemon.moves();
    for (let i=0; i<moves.length; i++) {
        if (this.enemyMoveUseability(i) == "") {
            scoringTable.push({"index":i, "score":0})
        }
    }

    if (scoringTable.length == 0) {
        // No available moves, use struggle
        this._enemyMoveIndex = -1;
    } else {
        // Bring IA Scoring modifications
        const ia = $PokemonMZ_gameBattle.isTrainerBattle() ? trainer.ia() : "random"
        switch (ia) {
        case "random": // No changes
            break;
        case "basic": // Avoid status
            scoringTable = this.adjustScoringForBasic(scoringTable);
            break;
        case "buffer": // Start with buffs - TODO
            break;
        case "effective": // Avoid status, use super effective attacks, avoid ineffective
            scoringTable = this.adjustScoringForBasic(scoringTable);
            scoringTable = this.adjustScoringForEffective(scoringTable);
            break;
        }

        // Set up the list of wanted moves
        let maxScore = null;
        for (const move of scoringTable) {
            if (!maxScore || move.score > maxScore) {
                maxScore = move.score;
            }
        }
        const choosableMoves = scoringTable.filter(move => move.score === maxScore);
        const randomIndex = Math.randomInt(choosableMoves.length);
        this._enemyMoveIndex = choosableMoves[randomIndex].index;
        enemyPokemon.setLastMoveIndex(this._enemyMoveIndex);
        enemyPokemon.setLastMoveUsed(enemyPokemon.move(this._enemyMoveIndex));
    }

    // Determine skill order
    this.calculateBattleActions();
};
PokemonMZ_BattleManager.adjustScoringForBasic = function(scoringTable) {
    const playerPokemon = this._playerChosenPokemon;
    const enemyPokemon = this._enemyChosenPokemon;

    for (let i=0; i<scoringTable.length; i++) {
        let index = scoringTable[i].index;
        if (enemyPokemon.isMoveStatusOnly(index) && playerPokemon.hasStatus()) {
            scoringTable[i].score--;
        }
        if (enemyPokemon.isMoveSeedOnly(index) && playerPokemon.isSeeded()) {
            scoringTable[i].score--;
        }
        if (enemyPokemon.isMoveConfuseOnly(index) && playerPokemon.isConfused()) {
            scoringTable[i].score--;
        }
    }
    return scoringTable;
};
PokemonMZ_BattleManager.adjustScoringForEffective = function(scoringTable) {
    const playerPokemon = this._playerChosenPokemon;
    const enemyPokemon = this._enemyChosenPokemon;

    for (let i=0; i<scoringTable.length; i++) {
        let index = scoringTable[i].index;

        // Check move type for offensive ones. Ignore status only moves
        if (!(enemyPokemon.isMoveStatusOnly(index) || enemyPokemon.isMoveSeedOnly(index) || enemyPokemon.isMoveConfuseOnly(index))) {
            let moveData = enemyPokemon.moveDataFromIndex(index);

            let efficiency = 1.0;
            let opponentType1 = playerPokemon.type1();
            let opponentType2 = playerPokemon.type2();
            if (opponentType1) { efficiency *= this.typeEffectiveness(moveData.type, opponentType1) }
            if (opponentType2) { efficiency *= this.typeEffectiveness(moveData.type, opponentType2) }

            if (efficiency > 1.0) {
                scoringTable[i].score++;
            } else if (efficiency == 0) {
                scoringTable[i].score -= 2;
            } else if (efficiency < 1.0) {
                scoringTable[i].score --;
            }
        }
    }

    return scoringTable;
};
PokemonMZ_BattleManager.typeEffectiveness = function(offensiveType, defensiveType) {
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
PokemonMZ_BattleManager.typeInfo = function(typeId) {
    if (Object.keys($PokemonMZ_dataTypesIndex).includes(typeId)) {
        return $PokemonMZ_dataTypes[$PokemonMZ_dataTypesIndex[typeId]];
    } else {
        return {};
    }
};


PokemonMZ_BattleManager.calculateComputerItemUse = function(modifiers) {
    if (!modifiers.item) { return; }    // Nothing if not item modifier

    const item = modifiers.item;
    const enemyPokemon = this._enemyChosenPokemon;
    
    // Check item usage limit
    if (enemyPokemon.receivedItemCount(item.id) == item.maxPerPokemon) {
        // Impossible to use the item more than the max count per pokemon
        return;
    }

    // Check item usage condition
    switch(item.condition) {
        case "hasStatus":
            // Only checks item if the pokemon has a status
            if (!enemyPokemon.hasStatus()) { return; }
            break;
        case "random":
            // Must be set if no other condition
            break;
        default:
            // Else, no item use
            return;
    }

    // Check item usage probability
    if (Math.randomInt(100) < item.chance) {
        this._enemyUseItem = item.id;
    }
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
        case "battlePdefUpUser":
        case "battleSpcUpUser":
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

    // If computer uses item - move before else
    if (this._enemyUseItem) {
        this._battleActions.push("enemyStartUsingItem");
        this._battleActions.push("playerMove");
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
    const playerBadgeBoosts = $gamePlayerTrainer.badgeBoosts("player", "attack");
    const playerSpeed = this._playerChosenPokemon.spdModified() * playerBadgeBoosts.spd;
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
            case "enemyStartUsingItem":
                this.startEnemyItem();
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
        // Remove statuses finishing here (flinch, bound if over)
        this._playerChosenPokemon.removeFinishedStatuses();
        this._enemyChosenPokemon.removeFinishedStatuses();

        this.startPlayerInput();
    }
};

PokemonMZ_BattleManager.isPokemonObedient = function(side) {
    // Check if pokemon will obey
    if (side == "player") {
        pokemon = this._playerChosenPokemon;
        oppositePokemon = this._enemyChosenPokemon;
    } else if (side == "enemy") {
        pokemon = this._enemyChosenPokemon;
        oppositePokemon = this._playerChosenPokemon;
    }

    const playerObedience = $gamePlayerTrainer.badgeObedience();
    let checkObedience = true;
    let isObedient = true;

    if (side == "enemy") {
        // Enemy do not get obedience checks
        return true;
    }
    if (!this._playerChosenPokemon.isOutsider()) {
        // Gen I - Not outsider pokemon always obey
        return true;
    }
    if (playerObedience == -1 || this._playerChosenPokemon.level() <= playerObedience) {
        // If obedience -1 (all) or pokemon level below or equal to level, pokemon obeys.
        return true;
    }
    if (pokemon.isDigging() || pokemon.isBiding() || oppositePokemon.isBound() || pokemon.isBerserk() || pokemon.isRaging()) {
        // Several turn moves are not interrupted by obedience once started
        return true;
    }

    const badgeLimit = $gamePlayerTrainer.badgeObedience()
    const factor1 = pokemon.level() + badgeLimit - 1;
    const random1 = Math.random()*(factor1+1);

    if (random1 > badgeLimit) {
        isObedient = false;
    }

    return isObedient;
}


PokemonMZ_BattleManager.startMove = function(side) {
    let nextPhase;
    let pokemon;
    let oppositePokemon;
    let move;
    let moveIndex;
    let usedAnotherMove = false;

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

    // Check if struggle has been launched
    if (moveIndex == -1) {
        move = pokemon.moveStruggle();
    } else {
        move = pokemon.move(moveIndex);
    }

    let moveName = pokemon.moveName(move)
    this._currentAction = new PokemonMZ_Game_Action(pokemon, side);
    this._currentAction.setOpponent(oppositePokemon);

    // If bound, only burn and poison are calculated, the pokemon does nothing
    if (pokemon.isBound()) {
        this._currentAction.setMove(move.id, oppositePokemon);
        this._currentAction.calculate();
        this.changePhase(nextPhase);
        return;
    }

    // Calculate sleep
    // Gen 1 : doesn't move when wakes up
    if (pokemon.isAsleep()) {

        // Sleeping sets to -1 the last move so nothing can be copied
        oppositePokemon.clearLastSeenEnemyMove();

        pokemon.nextSleepTurn();
        let message = ""
        if (pokemon.isAsleep()) {
            this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "asleep"])
            this._currentAction.addResultSteps(["autotext","isAsleep",this._currentAction.side()])
        } else {
            this._currentAction.addResultSteps(["refreshStatusWindow",this._currentAction.side()])
            this._currentAction.addResultSteps(["autotext","wokeUp",this._currentAction.side()])
        }
        this.changePhase(nextPhase);
        return;
    }

    // Do not move if flinched
    if (pokemon.isFlinched()) {
        this._currentAction.addResultSteps(["autotext","isFlinched",this._currentAction.side()])
        this._currentAction.calculateResidualEffectsOnly();
        this.changePhase(nextPhase);
        return;
    };

    // Calculate confusion
    if (pokemon.isConfused()) {
        pokemon.nextConfusionTurn();
        if (pokemon.isConfused()) {
            this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "confused"])
            this._currentAction.addResultSteps(["autotext","isConfused",this._currentAction.side()])
            if (Math.random() < 0.5) {
                if (pokemon.isBiding()) { pokemon.endBide() };  // Confusion interrupts bide
                if (pokemon.isBerserk()) { pokemon.unBerserk() } // Confusion hurt interrupts berserk moves
                if (pokemon.isDigging()) { // Confusion hurt interrupts digging
                    pokemon.endDigging() 
                    this._currentAction.addResultSteps(["showSprite", this._currentAction.userBattleSprite()])
                } 

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

    // Calculate paralysis
    if (pokemon.isParalyzed() && Math.random() < 0.25) {
        if (pokemon.isBiding()) { pokemon.endBide() };  // Paralysis interrupts bide
        if (pokemon.isBerserk()) { pokemon.unBerserk() } // Paralysis interrupts berserk moves
        if (pokemon.isDigging()) { // Paralysis interrupts digging
            pokemon.endDigging() 
            this._currentAction.addResultSteps(["showSprite", this._currentAction.userBattleSprite()])
        } 
        this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "paralyzed"])
        this._currentAction.addResultSteps(["autotext","isParalyzed",this._currentAction.side()])
        this.changePhase(nextPhase);
        return;
    }

    // Calculate freeze
    if (pokemon.isFrozen()) {
        // Sleeping sets to -1 the last move so nothing can be copied
        oppositePokemon.clearLastSeenEnemyMove();

        this._currentAction.addResultSteps(["animateUserEffect", this._currentAction.userBattleSprite(), "frozen"])
        this._currentAction.addResultSteps(["autotext","isFrozen",this._currentAction.side()])
        this.changePhase(nextPhase);
        return;
    }


    // Checking if pokemon obeys, and adapt
    const isObedient = this.isPokemonObedient(side);
    if (!isObedient) {
        let foundAction = false;
        const badgeLimit = $gamePlayerTrainer.badgeObedience()
        const factor1 = pokemon.level() + badgeLimit - 1;

        // Disobey
        const random2 = Math.random()*(factor1+1);
        if (random2 < badgeLimit) {
            // Select another move if possible
            const possibleOtherMoves = [];
            for (let j=0; j<pokemon._moves.length; j++) {
                if (j == moveIndex) { continue; }
                if (!pokemon.isMoveDisabled(j) && pokemon.move(j).pp > 0) {
                    possibleOtherMoves.push(j)
                }
            }
            if (possibleOtherMoves.length > 0) {
                const newIndex = possibleOtherMoves[Math.randomInt(possibleOtherMoves.length)];
                foundAction = true;
                usedAnotherMove = true;
                move = pokemon.move(newIndex);
                moveName = pokemon.moveName(move)
            }
        } else {
            const random3 = Math.random()*256;
            const factor2 = pokemon.level() - badgeLimit;
            if (random3 < factor2) {
                // Takes a nap - if not under major status
                if (!pokemon.hasStatus()) {
                    foundAction = true;
                    this._currentAction.addResultSteps(["sleepPokemon",pokemon]);
                    this._currentAction.addResultSteps(["autotext","takeNap",this._currentAction.side()])
                    this.changePhase(nextPhase);
                    return;
                }
            } else if (random3 < 2*factor2) {
                // Hits itself in confusion
                foundAction = true;
                this._currentAction.addResultSteps(["waittext","wontObey",this._currentAction.side()])
                this._currentAction.addResultSteps(["autotext","confusedHurt",this._currentAction.side()])
                move = pokemon.moveSelfHurtConfusion();
                this._currentAction.setMove(move.id, pokemon);
                this._currentAction.calculate();
                this.changePhase(nextPhase);
                return;
            }
        }


        // Do not attack if no action found
        if (!foundAction) {
            const random4 = Math.random()*100;
            if (random4 < 25) {
                this._currentAction.addResultSteps(["waittext","loafingAround",this._currentAction.side()])
            } else if (random4 < 50) {
                this._currentAction.addResultSteps(["waittext","wontObey",this._currentAction.side()])
            } else if (random4 < 75) {
                this._currentAction.addResultSteps(["waittext","turnedAway",this._currentAction.side()])
            } else {
                this._currentAction.addResultSteps(["waittext","ignoredOrders",this._currentAction.side()])
            }
            oppositePokemon.clearLastSeenEnemyMove();
            this._currentAction.calculateResidualEffectsOnly();
            this.changePhase(nextPhase);
            return;
        }
    }

    // If move is selected despite disabled, display disabled message and end turn
    if (pokemon.isMoveDisabled(moveIndex)) {
        this._currentAction.addResultSteps(["waittext","moveDisabled",this._currentAction.side(), moveName])
        if (pokemon.isDigging()) { // Disabling dig interrupts digging
            pokemon.endDigging() 
            this._currentAction.addResultSteps(["showSprite", this._currentAction.userBattleSprite()])
        } 
        this._currentAction.calculateResidualEffectsOnly();
        this.changePhase(nextPhase);
        return;
    }

    // If user has a disabled move, calculation is done here to reduce the counter
    if (pokemon.hasAnyDisabledMove()) {
        const isFreed = pokemon.reduceDisableTurn();
        if (isFreed) {
            this._currentAction.addResultSteps(["waittext","freedDisabled",this._currentAction.side()])
        }
    }


    // Special skips initialization
    let skipPP = false;
    let skipMessage = false;

    // Check if Mirror Move is used
    if (pokemon.isMoveMirrorMove(moveIndex)) {
        let keepPreviousMirror = false;

        if (pokemon.isBiding() || oppositePokemon.isBound() || pokemon.isBerserk() || pokemon.isRaging() || pokemon.isDigging()) {
            keepPreviousMirror = true;
        }

        if (keepPreviousMirror) {
            move = pokemon.lastMoveUsed();
            moveName = pokemon.moveName(move);
            skipPP = true;
        } else {
            // Add text for use of mirror move 
            this._currentAction.addResultSteps(["autotext","useMove",this._currentAction.side(),moveName])
            if (pokemon.isLastSeenEnemyMoveMirrorable()) {
                pokemon.consumePP(moveIndex);
                move = pokemon.moveMirrored();
                pokemon.setLastMoveUsed(move);
                moveName = pokemon.moveName(move);
                skipPP = true;
            } else {
                this._currentAction.addResultSteps(["waittext","mirrorMoveFailed",this._currentAction.side()])
                this.changePhase(nextPhase);
                return;
            }
        }
    }

    // Get battle result index to insert text
    let battleIndex = this._currentAction.resultStepsLength();

    if (pokemon.isBiding()) {
        // No PP consumption for bide once it has been launched
        if (pokemon.isMoveBide(moveIndex)) {
            skipPP = true;
            skipMessage = true;
        } else if (pokemon.isMoveMirrorMove(moveIndex)) {
            move = pokemon.lastMoveUsed();
            skipPP = true;
            skipMessage = true;
        }
    }    
    if (oppositePokemon.isBound()) {
        if (pokemon.isMoveBinding(moveIndex)) {
            skipPP = true;
        } else if (pokemon.isMoveMirrorMove(moveIndex)) {
            move = pokemon.lastMoveUsed();
            skipPP = true;
        }

    }

    if (pokemon.isBerserk()) {
        // No PP consumption for Berserk move once they have been launched, no message
        if (pokemon.isMoveMirrorMove(moveIndex)) {
            move = pokemon.lastMoveUsed();
        }
        skipMessage = true;
        skipPP = true;
    }
    if (pokemon.isRaging()) {
        // No PP consumption for Rage once launched. However standard message is left
        if (pokemon.isMoveMirrorMove(moveIndex)) {
            move = pokemon.lastMoveUsed();
        }
        skipPP = true;
    }

    // If pokemon launches dig, no pp consumption, another message
    if (pokemon.isMoveDig(moveIndex) && !pokemon.isDigging()) {
        skipPP = true;
    }
    if (pokemon.isDigging() && pokemon.isMoveMirrorMove(moveIndex)) {
        // If using dig already through mirror move, follow-up
        move = pokemon.lastMoveUsed();
    }

    // Consume PP if needed
    if (!skipPP) {
        pokemon.consumePP(moveIndex);
    }

    this._currentAction.setMove(move.id, oppositePokemon);
    this._currentAction.calculate();

    if (moveIndex == -1) {
        this._currentAction.insertResultStepsAt(["autotext","noMovesLeft",this._currentAction.side()], battleIndex)
        battleIndex++;
    };

    if (!skipMessage) {
        let isMirrorDigTurn1 = false;
        if (pokemon.isMoveMirrorMove(moveIndex) && !pokemon.isDigging()) {
            const mirroredMove = pokemon.moveMirrored()
            const mirroredMoveData = pokemon.moveDataFromStringId(mirroredMove.id)
            for (const effect of mirroredMoveData.effects) {
                if (effect.type == "dig") { isMirrorDigTurn1 = true; }
            }
        }

        if (oppositePokemon.isBound() && pokemon.isMoveBinding(moveIndex)) {
            this._currentAction.insertResultStepsAt(["autotext","attackContinues",this._currentAction.side()], battleIndex)
        } else if (oppositePokemon.isBound() && (pokemon.isMoveMirrorMove(moveIndex))) {
            this._currentAction.insertResultStepsAt(["autotext","attackContinues",this._currentAction.side()], battleIndex)
        } else if (pokemon.isMoveDig(moveIndex) && !pokemon.isDigging()) {
            this._currentAction.insertResultStepsAt(["autotext","dugHole",this._currentAction.side()], battleIndex)
        } else if (isMirrorDigTurn1) {
            this._currentAction.insertResultStepsAt(["autotext","dugHole",this._currentAction.side()], battleIndex)
        } else if (usedAnotherMove) {
            this._currentAction.insertResultStepsAt(["autotext","useMoveInstead",this._currentAction.side(),moveName], battleIndex)
        } else {
            this._currentAction.insertResultStepsAt(["autotext","useMove",this._currentAction.side(),moveName], battleIndex)
        }
    }

    // Sets used move here for mirror move, mimic
    let skipSeeMove = false;

    // If pokemon launches dig, no pp consumption
    if (pokemon.isMoveDig(moveIndex) && !pokemon.isDigging()) {
        skipSeeMove = true;
    }

    if (!skipSeeMove) {
        oppositePokemon.setLastSeenEnemyMove(move.id);
    }

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
        case "battlePdefUpUser":
        case "battleSpcUpUser":
            this._currentAction = new PokemonMZ_Game_Action(this._playerChosenPokemon, "player");
            this._currentAction.setItem(this._playerUseItem.pkmz_data.id)
            this._currentAction.calculate();
            this.changePhase("playerResolveActionSteps"); 
            break;
    }
};
PokemonMZ_BattleManager.endPlayerItem = function() {
    // Called to deal with after effects such as burn, and so on
    this._playerPokemonStatusWindow.refresh(true);
    const pokemon = this._playerChosenPokemon;

    // Clear enemy pokemon last move seen, so mirror move will fail
    const enemyPokemon = this._enemyChosenPokemon;
    enemyPokemon.clearLastSeenEnemyMove();

    this._currentAction = new PokemonMZ_Game_Action(pokemon, "player");
    this._currentAction.calculateStatusEffects(pokemon.hp());
    this.changePhase("playerResolveActionSteps");
};
PokemonMZ_BattleManager.startEnemyItem = function() {
    // Clear player pokemon last move seen, so mirror move will fail
    this._playerChosenPokemon.clearLastSeenEnemyMove();

    this._enemyChosenPokemon.addReceivedItem(this._enemyUseItem);
    this._currentAction = new PokemonMZ_Game_Action(this._enemyChosenPokemon, "enemy");
    this._currentAction.setItem(this._enemyUseItem)
    this._currentAction.calculate();
    AudioManager.playStandardSe(PokemonMZ.recoverySE);
    this.changePhase("enemyResolveActionSteps"); 
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
            case "refreshStatusWindow":
                this.askRefreshStatusWindow(step[1]);
                break;
            case "hitAnimation":
                this.changeSubPhase("targetAnimation");
                this._subPhaseParams = [step[1], step[2], step[3], step[4]];
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
            case "healUser":
                this.changeSubPhase("startHealUser");
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
            case "showSprite":
                this.changeSubPhase("showSprite");
                this._subPhaseParams = [step[1]];
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
            case "sleepPokemonTurns":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["sleepTurns", step[1], step[2]];
                break;  
            case "poisonPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["poison", step[1]];
                break;
            case "paralyzePokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["paralysis", step[1]];
                break;
            case "disableMove":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["disabled", step[1], step[2], step[3]];
                break;
            case "bindPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["bind", step[1], step[2], step[3], step[4]];
                break;
            case "keepBindingPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["keepBind", step[1]];
                break;
            case "berserkPokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["berserk", step[1], step[2], step[3]];
                break;
            case "ragePokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["rage", step[1]];
                break;
            case "minimizePokemon":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["minimize", step[1]];
                break;
            case "startDigging":
                this.changeSubPhase("inflictPokemonStatus");
                this._subPhaseParams = ["dig", step[1]];
                break;
            case "advanceBerserkPokemonTurn":
                this.changeSubPhase("advanceBerserkPokemonTurn");
                this._subPhaseParams = [step[1]];
                break;
            case "burnHeal":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["burn", step[1]];
                break;
            case "freezeHeal":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["freeze", step[1]];
                break;
            case "paralyzeHeal":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["paralyze", step[1]];
                break;
            case "sleepHeal":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["sleep", step[1]];
                break; 
            case "poisonHeal":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["poison", step[1]];
                break;
            case "endDigging":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["dig", step[1]];
                break;
            case "allStatusHeal":
                this.changeSubPhase("removePokemonStatus");
                this._subPhaseParams = ["all", step[1]];
                break;
            case "blowTargetAway":
                this.changeSubPhase("blowTargetAway");
                this._subPhaseParams = [step[1], step[2]];
                break;
            case "endBattle":
                this.changePhase("endPlayerEscape");
                break;
            case "pickupMoneyThenEndBattle":
                this.changePhase("pickupMoneyThenEndPlayerEscape");
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
PokemonMZ_BattleManager.askRefreshStatusWindow = function(side) {
    if (side == "player") {
        this._playerPokemonStatusWindow.refresh(true);
    } else if (side == "enemey") {
        this._enemyPokemonStatusWindow.refresh(true);
    }
    this.clearSubPhase();
};

PokemonMZ_BattleManager.targetAnimation = function() {
    // Skip animation if disabled in configmanager
    if (!ConfigManager.battleAnimation) { 
        this.clearSubPhase();
        return;
    };

    // Initialize animation list
    const stringId = this._subPhaseParams[0];
    const dataAnimation = $PokemonMZ_dataAnimations[stringId]

    if (dataAnimation) {
        const sequence = []
        for (action of dataAnimation.sequence) {
            sequence.push(action);
        }
        this._animationData = {
            "stringId":stringId,
            "sequence":sequence,
            "userSprite":this._subPhaseParams[1],
            "enemySprite":this._subPhaseParams[2],
            "side":this._subPhaseParams[3],
            "waitCount":0,
            "currentSprite":null,
        }
        this._animationPhase = "nextAction"
        this.changeSubPhase("animating");
    } else {
        // If animation not declared, skip
        this.clearSubPhase();
    }
};
PokemonMZ_BattleManager.updateAnimation = function() {
    // Debug logger
    if (PokemonMZ.debugLog) {
        if (this._debugAnimationPhase != this._animationPhase) {
            this._debugAnimationPhase = this._animationPhase;
            if (this._debugAnimationPhase != "") {
                console.log("PokemonMZ_BattleManager.updateAnimation > " + this._debugAnimationPhase);
            }
        }
    }
    switch (this._animationPhase) {
    case "nextAction":
        if (this._animationData.sequence.length > 0) {
            const actionData = this._animationData.sequence.splice(0,1)[0];
            if (PokemonMZ.debugLog) {  console.log("PokemonMZ_BattleManager.updateAnimation > nextAction > " + actionData.type); }
            switch (actionData.type) {
            case "playAnimation":
                this.animationStartPlaying(actionData);
                break;
            case "playSE":
                AudioManager.playSe({"name":actionData.name,"volume":actionData.volume, "pitch":actionData.pitch, "pan":actionData.pan})
                this._animationPhase = "nextAction";
                break;
            case "moveSpriteForward":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, actionData.distance, -actionData.distance, actionData.duration)
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, -actionData.distance, actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, -actionData.distance, actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, actionData.distance, -actionData.distance, actionData.duration)
                } else {
                    this._animationPhase = "nextAction";
                }
                break;
            case "moveSpriteBackward":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, -actionData.distance, actionData.distance, actionData.duration)
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, actionData.distance, -actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, actionData.distance, -actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, -actionData.distance, actionData.distance, actionData.duration)
                } else {
                    this._animationPhase = "nextAction";
                }
                break;
            case "moveSpriteLeft":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, -actionData.distance, 0, actionData.duration)
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, actionData.distance, 0, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, actionData.distance, 0, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, -actionData.distance, 0, actionData.duration)
                } else {
                    this._animationPhase = "nextAction";
                }
                break;
            case "moveSpriteRight":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, actionData.distance, 0, actionData.duration)
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, -actionData.distance, 0, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, -actionData.distance, 0, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, actionData.distance, 0, actionData.duration)
                } else {
                    this._animationPhase = "nextAction";
                }
                break;
            case "moveSpriteUp":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite,0, -actionData.distance, actionData.duration);
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, 0, -actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, 0, -actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, 0, actionData.distance, actionData.duration)
                } else {
                    this._animationPhase = "nextAction";
                }
                break;
            case "moveSpriteDown":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite,0, actionData.distance, actionData.duration);
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, 0, actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this.startAnimationMoveSprite(this._animationData.userSprite, 0, actionData.distance, actionData.duration)
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this.startAnimationMoveSprite(this._animationData.enemySprite, 0, actionData.distance, actionData.duration)
                } else {
                    this._animationPhase = "nextAction";
                }
                break;
            case "wait":
                this._animationWaitFrames = actionData.frames;
                this._animationPhase = "waitingFrames";
                break;
            case "hideSprite":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this._animationData.userSprite.visible = false;
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this._animationData.enemySprite.visible = false;
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this._animationData.userSprite.visible = false;
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this._animationData.enemySprite.visible = false;
                }
                break;
            case "showSprite":
                if (this._animationData.side == "player" && actionData.target == "user") {
                    this._animationData.userSprite.visible = true;
                } else if (this._animationData.side == "player" && actionData.target == "opponent") {
                    this._animationData.enemySprite.visible = true;
                } else if (this._animationData.side == "enemy" && actionData.target == "user") {
                    this._animationData.userSprite.visible = true;
                } else if (this._animationData.side == "enemy" && actionData.target == "opponent") {
                    this._animationData.enemySprite.visible = true;
                }
                break;
            }
        } else {
            this.clearSubPhase();
        }
        break;
    case "waitForAnimation":
        if (!this._spriteset.isAnimationPlaying()) {
            this._animationPhase = "nextAction";
        }
        break;
    case "waitingFrames":
        this._animationWaitFrames--;
        if (this._animationWaitFrames == 0) {
            this._animationPhase = "nextAction";
        }
        break;
    case "moving":
        this.animationMoveSprite()
        break;
    }
}
PokemonMZ_BattleManager.animationStartPlaying = function(actionData) {
    let sprite = null;
    if (actionData.target == "user") {
        sprite = this._animationData.userSprite;
    } else if (actionData.target == "target") {
        sprite = this._animationData.enemySprite;
    }
    const animationId = actionData.animationId;
    if (sprite && animationId) {
        const request = {
            targets: [sprite],
            animationId: animationId,
            mirror: false
        };
        this._spriteset.createAnimation(request);
        sprite.updateTransform();

        // See if animation wait or not
        const wait = actionData.wait;
        if (wait) {
            this._animationPhase = "waitForAnimation";
        } else {
            this._animationPhase = "nextAction";
        }

    } else {
        this._animationPhase = "nextAction";
    }    
};
PokemonMZ_BattleManager.startAnimationMoveSprite = function(sprite, dx, dy, duration) {
    sprite.setDestination(dx,dy,duration);
    this._animationData.waitCount = duration;
    this._animationData.currentSprite = sprite;
    this._animationPhase = "moving";
};
PokemonMZ_BattleManager.animationMoveSprite = function() {
    const sprite = this._animationData.currentSprite;

    sprite.advanceToDestination();
    this._animationData.waitCount --;
    if (this._animationData.waitCount <= 0) {
        sprite.clearDestination();
        this._animationData.waitCount = 0
        this._animationData.currentSprite = null;
        this._animationPhase = "nextAction";
    }
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
    const opponentHp = opponent.hp();
    const damage = this._subPhaseParams[0];

    this._damageTransition.start = opponentHp;
    this._damageTransition.end = opponentHp - damage;

    // Sets bide damage if needed
    if (opponent.isBiding()) {
        if (damage > opponentHp) {
            opponent.addToBideDamage(opponentHp);
        } else {
            opponent.addToBideDamage(damage);
        }
    }

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
    const opponentMhp = opponent.mhp();
    const damage = this._subPhaseParams[0];
    const opponentHp = opponent.hp();

    if (opponentHp > this._damageTransition.end && opponentHp > 0) {
        let newHp = opponentHp - this._subPhaseParams[0];
        if (newHp < this._damageTransition.end) { newHp = this._damageTransition.end; }
        if (newHp > opponentMhp) { newHp = opponentMhp; }
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
    const opponentMHp = opponent.mhp()
    const heal = this._subPhaseParams[0];

    this._damageTransition.start = opponent.hp();
    this._damageTransition.end = (opponent.hp() + heal)
    if (this._damageTransition.end < 0) { this._damageTransition.end = 0; }
    if (this._damageTransition.end > opponentMHp) { this._damageTransition.end = opponentMHp; }

    // Calculate how fast the hp bar will go up
    // If attack drops between 0-100% hp, the curve is linear, 
    // up to 200 frames for 100% hp
    // If attack drops above 100% hp, the curvez is linear decrease
    // up to 30 frames for 1000% hp
    // If attack drops above 1000% hp, the curve is contant, 30 frames
    const percentDamage = heal / opponentMHp * 100;
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
        let newHp = (opponentHp + heal);
        if (newHp < 0) { newHp = 0; }
        if (newHp > this._damageTransition.end) { newHp = this._damageTransition.end; }

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
PokemonMZ_BattleManager.startHealUser = function() {
    const user = this._currentAction.user();
    const userHp = user.hp();
    const userMhp = user.mhp();
    const heal = this._subPhaseParams[0];

    this._damageTransition.start = userHp;
    this._damageTransition.end = userHp + heal;
    if (this._damageTransition.end < 0) { this._damageTransition.end = 0; }
    if (this._damageTransition.end > userMhp) { this._damageTransition.end = userMhp; }


    // Calculate how fast the hp bar will go up
    // If attack drops between 0-100% hp, the curve is linear, 
    // up to 200 frames for 100% hp
    // If attack drops above 100% hp, the curvez is linear decrease
    // up to 30 frames for 1000% hp
    // If attack drops above 1000% hp, the curve is contant, 30 frames
    const percentDamage = heal / userMhp * 100;
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

    this.changeSubPhase("proceedHealUser");
};
PokemonMZ_BattleManager.proceedHealUser = function() {
    const user = this._currentAction.user();
    const heal = this._subPhaseParams[0];
    const userHp = user.hp();
    const userMhp = user.mhp();

    if (userHp < this._damageTransition.end && userHp > 0 && userHp < userMhp) {
        let newHp = userHp + heal;
        if (newHp < 0) { newHp = 0; }
        if (newHp > this._damageTransition.end) { newHp = this._damageTransition.end; }

        user.setHp(newHp)

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
    const userHp = user.hp();

    this._damageTransition.start = userHp;
    this._damageTransition.end = userHp - damage;

    // Sets bide damage if needed
    if (user.isBiding()) {
        if (damage > userHp) {
            user.addToBideDamage(userHp);
        } else {
            user.addToBideDamage(damage);
        }
    }

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
    const userMhp = user.mhp();

    if (userHp > this._damageTransition.end && userHp > 0) {
        let newHp = userHp - this._subPhaseParams[0]
        if (newHp < this._damageTransition.end) { newHp = this._damageTransition.end; }
        if (newHp > userMhp) { newHp = userMhp; }

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
    const ext1 = this._subPhaseParams[2];
    const moveIndex = target.lastMoveIndex();

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
        case "sleepTurns":
            target.sleepTurns(ext1);
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
        case "bind":
            const bindMinTurns = this._subPhaseParams[2];
            const bindMaxTurns = this._subPhaseParams[3];
            const bindChances = this._subPhaseParams[4];
            target.bind(bindMinTurns,bindMaxTurns,bindChances);
            break;
        case "keepBind":
            target.keepBinding();
            break;
        case "disabled":
            target.disableMove(this._subPhaseParams[2], this._subPhaseParams[3]);
            break;
        case "berserk":
            const berserkMinTurns = this._subPhaseParams[2] - 1;
            const berserkMaxTurns = this._subPhaseParams[3] - 1;
            target.berserk(berserkMinTurns, berserkMaxTurns, moveIndex, true);
            break;
        case "rage":
            target.rage(moveIndex, true);
            break;
        case "dig":
            target.startDigging(moveIndex);
            break;
        case "minimize":
            target.minimize();
            this._spriteset.playerPokemonSprite().setScale(this._playerChosenPokemon.battleSpriteMaxScale());
            this._spriteset.enemyPokemonSprite().setScale(this._enemyChosenPokemon.battleSpriteMaxScale());
            break;
    }
    this.clearSubPhase();
};
PokemonMZ_BattleManager.removePokemonStatus = function() {
    const status = this._subPhaseParams[0];
    const target = this._subPhaseParams[1];

    switch (status) {
        case "burn":
            target.unburn();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "poison":
            target.unpoison();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "paralysis":
            target.unparalyze();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "freeze":
            target.unfreeze();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "sleep":
            target.unsleep();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
            break;
        case "dig":
            target.endDigging();
            break;
        case "all":
            // Note Gen2+ will remove confusion too
            target.unburn();
            target.unpoison();
            target.unparalyze();
            target.unfreeze();
            target.unsleep();
            this._enemyPokemonStatusWindow.refresh(true);
            this._playerPokemonStatusWindow.refresh(true);
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
PokemonMZ_BattleManager.showSprite = function() {
    if (ConfigManager.battleAnimation) {
        const sprite = this._subPhaseParams[0];
        sprite.visible = true;
    }
    this.clearSubPhase();
};
PokemonMZ_BattleManager.textFromKey = function(key, side, ext1) {
    const prefix = (side == "enemy") ? "Enemy " : "";
    const pokemon = (side == "enemy") ? this._enemyChosenPokemon : this._playerChosenPokemon;

    
    let trainer = ""
    if (side == "enemy") { 
        const trainerData = $PokemonMZ_gameBattle.enemy1();
        if (trainerData) { trainer = trainerData.name() }
    } else {
        trainer = $gamePlayerTrainer.name();
    }

    switch(key) {
    case "noMovesLeft":
        return prefix + pokemon.name() + " has no moves left!";
    case "useMove":
        return prefix + pokemon.name() + " used " + ext1 + "!";
    case "useMoveInstead":
        return prefix + pokemon.name() + " used instead, " + ext1 + "!";
    case "attackContinues":
        return prefix + pokemon.name() + "'s attack continues!";
    case "missed":
        return prefix + pokemon.name() + "'s attack missed!";
    case "attackRose":
        return prefix + pokemon.name() + "'s attack rose!";
    case "attackRosePlus":
        return prefix + pokemon.name() + "'s attack greatly rose!";
    case "defenseRose":
        return prefix + pokemon.name() + "'s defense rose!";
    case "specialRose":
        return prefix + pokemon.name() + "'s special rose!";
    case "evasionRose":
        return prefix + pokemon.name() + "'s evade rose!";
    case "accuracyFell":
        return prefix + pokemon.name() + "'s accuracy fell!";
    case "attackFell":
        return prefix + pokemon.name() + "'s attack fell!";
    case "defenseFell":
        return prefix + pokemon.name() + "'s defense fell!";
    case "defenseFellPlus":
        return prefix + pokemon.name() + "'s defense greatly fell!";
    case "speedFell":
        return prefix + pokemon.name() + "'s speed fell!";
    case "statusFailed":
        return "But, it failed!";
    case "statusNothing":
        return "Nothing happened!";
    case "noeffect":
        return "It doesn't affect " + prefix + pokemon.name() + "!";
    case "noAffect":
        return "It didn't affect " + prefix + pokemon.name() + "!";
    case "unaffected":
        return prefix + pokemon.name() + " is unaffected!";
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
    case "usedItem":
        return trainer + " used " + String(ext1) + " on " +  prefix + pokemon.name() + "!"
    case "bideUnleashed":
        return prefix + pokemon.name() + " unleashed energy!";
    case "bideMissed":
        return prefix + pokemon.name() + "'s attack missed!";
    case "blownAway":
        return prefix + pokemon.name() + " " + ext1;
    case "gettingPumped":
        return prefix + pokemon.name() + "'s getting pumped!";
    case "disabled":
        return prefix + pokemon.name() + "'s " + String(ext1) + " was disabled!";
    case "moveDisabled":
        return prefix + pokemon.name() + "'s " + String(ext1) + " is disabled!";
    case "freedDisabled":
        return prefix + pokemon.name() + "'s disabled no more!";
    case "splashNoEffect":
        return "No effect!";
    case "suckedHealth":
        return "Sucked health from " + prefix + pokemon.name() + "!"
    case "ranAway":
        return prefix + pokemon.name() + " ran from battle!";
    case "thrashing":
        return prefix + pokemon.name() + "'s thrashing about!"
    case "rageBuilding":
        return prefix + pokemon.name() + "'s rage is building!"
    case "mirrorMoveFailed":
        return "The Mirror Move failed!"
    case "dugHole":
        return prefix + pokemon.name() + " dug a hole!"
    case "coinsScatter":
        return "Coins scattered everywhere!";
    case "loafingAround":
        return prefix + pokemon.name() + " is loafing around!"
    case "wontObey":
        return prefix + pokemon.name() + " won't obey!"
    case "turnedAway":
        return prefix + pokemon.name() + " turned away!"
    case "ignoredOrders":
        return prefix + pokemon.name() + " ignored orders!"
    case "takeNap":
        return prefix + pokemon.name() + " began to nap!"
    case "startedSleeping":
        return prefix + pokemon.name() + " started sleeping!"
    case "regainedHealth":
        return prefix + pokemon.name() + " regained health!"  
    }
    return ""
};
PokemonMZ_BattleManager.displayWaitText = function() {
    const key = this._subPhaseParams[0];
    const side = this._subPhaseParams[1];
    const ext1 = this._subPhaseParams[2];
    const message = this.textFromKey(key, side, ext1);
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
