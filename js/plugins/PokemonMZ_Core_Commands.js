//=============================================================================
// RPG Maker MZ - PokemonMZ - Core Commands plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core commands plugin for PokemonMZ
 * @author Schlangan

 * //////////////////////////////////////////
 * @command ShowComputerPlayer
 * @text Show Player's computer
 * @desc Display the UI for the player's computer.

 * //////////////////////////////////////////
 * @command ShowComputerPokemon
 * @text Show Pokemon Storage computer
 * @desc Display the UI for the Pokémon Storage System.

 * //////////////////////////////////////////
 * @command ShowCurrentRegionMap
 * @text Show Current Region Map
 * @desc Display the map of the current region.


 * //////////////////////////////////////////
 * @command SetPlayerRespawn
 * @text Set Player Respawn
 * @desc Defines the map and coordinates for player respawn after defeat.
 * 
 * @arg mapId
 * @type map
 * @text Respawn Map
 * @desc Select the map for respawn.
 *
 * @arg x
 * @type number
 * @text X
 * @desc X coordinate (tile position).
 * @default 0
 * @min 0
 *
 * @arg y
 * @type number
 * @text Y
 * @desc Y coordinate (tile position).
 * @default 0
 * @min 0



 * //////////////////////////////////////////
 * @command PlayerTeamHeal
 * @text Heal Party
 * @desc Heal all the Pokémon in the player team.

 * //////////////////////////////////////////
 * @command GivePlayerMoney
 * @text Gives Money to Player
 * @desc Gives a given amount of money to the player.
 * 
 * @arg moneyAmount
 * @type number
 * @min 0
 * @text Amount
 * @desc The amount of money to give

 * //////////////////////////////////////////
 * @command TakePlayerMoney
 * @text Take Fixed Money from the Player
 * @desc Takes a fixed amount of money to the player.
 * 
 * @arg moneyAmount
 * @type number
 * @min 0
 * @text Amount
 * @desc The amount of money to take
 * 
* //////////////////////////////////////////
 * @command TakePlayerVariableMoney
 * @text Take Variable Money from the Player
 * @desc Takes money from the player, with a value set in variable
 * 
 * @arg moneyVariable
 * @type variable
 * @text Money variable
 * @desc TThe variable containing the value of the money.

 * //////////////////////////////////////////
 * @command GetPlayerMoney
 * @text Get Player Money Value
 * @desc Puts the value of the player money to a variable
 * 
 * @arg chosenVariable
 * @type variable
 * @text Chosen Variable
 * @desc The variable to save the value into.


 * //////////////////////////////////////////
 * @command AddItemToStorage
 * @text Add Item to Storage
 * @desc Adds a specific item with a given quantity to the item storage box
 * 
 * @arg item
 * @type item
 * @text Item
 * @desc The item to give
 * 
 * @arg amount
 * @type number
 * @default 1
 * @min 1
 * @text Quantity
 * @desc The quantity of the item to give.

 * //////////////////////////////////////////
 * @command AddItemToBag
 * @text Add Item To Bag
 * @desc Gives an item to the player and displays the message.
 * 
 * @arg item
 * @type item
 * @text Item
 * @desc The item to give
 * 
 * @arg amount
 * @type number
 * @default 1
 * @min 1
 * @text Quantity
 * @desc The quantity of the item to give.
 
 * //////////////////////////////////////////
 * @command HasItemInBag
 * @text Has Item In Bag ?
 * @desc Checks if the player owns a specific item
 * 
 * @arg item
 * @type item
 * @text Item
 * @desc The item to check
 * 
 * @arg returnSwitchId
 * @type switch
 * @text Return switch
 * @desc A switch that will take the value ON if the player has the item or else OFF.

 * //////////////////////////////////////////
 * @command GiveBadge
 * @text Give Badge
 * @desc Gives a badge to the player
 * 
 * @arg item
 * @type item
 * @text Badge
 * @desc The badge to give. Do not select an item which is not a badge, as it won't do anything.

 * //////////////////////////////////////////
 * @command LoseItem
 * @text Lose Item
 * @desc Removes an item from the player.
 * 
 * @arg item
 * @type item
 * @text Item
 * @desc The item to lose
 * 

 * //////////////////////////////////////////
 * @command GivePokedex
 * @text Give the Pokedex
 * @desc Give the Pokedex to the player.
 * 
 * @arg region
 * @type text
 * @text Region ID
 * @desc The region Id for the pokemon data. Ex: kanto
 * 
 * //////////////////////////////////////////
 * @command AddPokedexPokemonSeen
 * @text Add Pokemon Seen To Pokedex
 * @desc Set as seen a Pokemon inside the pokedex
 * 
 * @arg pokemon
 * @type enemy
 * @text Pokemon
 * @desc The pokemon to mark as seen.

 * //////////////////////////////////////////
 * @command NumberPokemonSeen
 * @text Number of Pokemon Seen
 * @desc Sets the number of pokemon seen inside a variable
 * 
 * @arg returnVariable
 * @type variable
 * @text Return Variable
 * @desc Variable that gets the number of pokemon seen.

 * //////////////////////////////////////////
 * @command NumberPokemonOwned
 * @text Number of Pokemon Owned
 * @desc Sets the number of pokemon owned inside a variable
 * 
 * @arg returnVariable
 * @type variable
 * @text Return Variable
 * @desc Variable that gets the number of pokemon owned.




 * //////////////////////////////////////////
 * @command CanGetPokemon
 * @text Can Player Get a Pokemon
 * @desc Checks if the player can get a Pokemon or if their party and current box are full.
 * 
 * @arg returnSwitchId
 * @type switch
 * @text Return switch
 * @desc A switch that will take the value ON if the player can get a pokemon or OFF if they cannot.

 * //////////////////////////////////////////
 * @command CanGetPokemonInParty
 * @text Can Player Get a Pokemon In Party
 * @desc Checks if the player has less than 6 Pokémon in the party.
 * 
 * @arg returnSwitchId
 * @type switch
 * @text Return switch
 * @desc A switch that will take the value ON if the player can get a pokemon or OFF if they cannot.



 * //////////////////////////////////////////
 * @command GivePokemon
 * @text Give a Pokemon
 * @desc Give a specific pokemon to the player
 * 
 * @arg pokemon
 * @type enemy
 * @text Pokemon
 * @desc The pokemon to give
 * 
 * @arg level
 * @type number
 * @text Level
 * @min 1
 * @max 100
 * @default 5
 * @desc The level of the pokemon to give
 * 
 * @arg returnSwitchId
 * @type switch
 * @text Return switch
 * @desc A switch that will take the value OFF is the pokemon cannot be given because of box+party full

 * //////////////////////////////////////////
 * @command SelectPokemonTrade
 * @text Select Pokemon For Trade
 * @desc Select a Pokemon in Party for a trade and check match
 * 
 * @arg searchedPokemon
 * @type enemy
 * @text Searched Pokemon
 * @desc The Pokemon wanted by the NPC
 * 
 * @arg returnVariable
 * @type variable
 * @text Return Variable
 * @desc Variable that gets the pokemon index in the party if correct pokemon, -1 if wrong one, or -2 if canceled.
 * 
 * //////////////////////////////////////////
 * @command TradePartyPokemon
 * @text Trade Pokemon From Party
 * @desc Trade a Pokemon from the party with a new one
 * 
 * @arg partyIndexVariable
 * @type variable
 * @text Party Index Variable
 * @desc The variable containing the index of the player's pokemon. Use the one from the Select Pokemon Trade command.
 * 
 * @arg tradedPokemon
 * @type enemy
 * @text Traded Pokemon
 * @desc The species of the pokemon offered by the trade
 * 
 * @arg tradedPokemonNickname
 * @type text
 * @text Traded Pokemon Nickname
 * @desc The nickname of the Pokemon offered by the trade
 * 
 * //////////////////////////////////////////
 * @command PlayPokemonCry
 * @text Play Pokemon Cry
 * @desc Play a specific Pokemon's cry
 * 
 * @arg pokemon
 * @type enemy
 * @text Pokemon
 * @desc The pokemon whose cry to play
 * 
 * //////////////////////////////////////////
 * @command IsPokemonAtDayCare
 * @text Is Pokemon At Day Care
 * @desc Sets a switch to ON if a pokemon is currently inside the day care. Otherwise, sets it to OFF.
 * 
 * @arg returnSwitchId
 * @type switch
 * @text Return Switch
 * @desc The switch set to ON/OFF if a pokemon is/isn't in the daycare.
 * 
 * //////////////////////////////////////////
 * @command SelectPokemonDayCare
 * @text Select Pokemon For Day Care
 * @desc Select a Pokemon in Party for the day care and check if possible (HM forbidden)
 * 
 * @arg returnVariable
 * @type variable
 * @text Return Variable
 * @desc Variable that gets the pokemon index in the party if correct pokemon, -1 if pokemon has HM, or -2 if canceled.
 * 
 * //////////////////////////////////////////
 * @command AddPokemonAtDayCare
 * @text Add a Pokemon To Day Care
 * @desc Add a Pokemon to the Day Care, from an index stored inside the Select Pokemon Day Care variable.
 * 
 * @arg indexVariable
 * @type variable
 * @text Index Variable
 * @desc Variable that contains the party index. Usually set up by using Select Pokemon For Day Care before this command.
 * 
 * //////////////////////////////////////////
 * @command GetDayCareResult
 * @text Get Day Care Results
 * @desc Sets the number of level gained at day care and the cost of the pokemon retrieval
 * 
 * @arg baseCost
 * @type number
 * @text Base Daycare Cost
 * @desc The cost of the day care when the pokemon didn't get any level
 * 
 * @arg costPerLevel
 * @type number
 * @text Daycare Cost Per Level
 * @desc The additional cost of the day care per level gained.
 * 
 * @arg levelVariable
 * @type variable
 * @text Level Variable
 * @desc Variable that receives the number of levels gained by the Pokemon.
 * 
 * @arg costVariable
 * @type variable
 * @text Cost Variable
 * @desc Variable that receives the price to pay to get back by the Pokemon, based on the base cost and cost per level.
 * 
 * //////////////////////////////////////////
 * @command PlayDayCarePokemonCry
 * @text Play Day Care Pokemon Cry
 * @desc Play the cry of the Pokemon at Day Care
 * 
 * //////////////////////////////////////////
 * @command RetrievePokemonFromDayCare
 * @text Retrieve Pokemon From Day Care
 * @desc Removes the pokemon from day care and add it to the party. Does nothing if the party is full.
 * 
*/
const pluginName = 'PokemonMZ_Core_Commands';

// Player

PluginManager.registerCommand(pluginName, "SetPlayerRespawn", function(args) {
    // const money = Number(args.moneyAmount);
    // $gamePlayerTrainer.addMoney(money);
    const mapId = Number(args.mapId);
    const x = Number(args.x);
    const y = Number(args.y);
    $gamePlayerTrainer.setRespawnLocation(mapId,x,y);
});

PluginManager.registerCommand(pluginName, "GivePlayerMoney", function(args) {
    const money = Number(args.moneyAmount);
    $gamePlayerTrainer.addMoney(money);
});
PluginManager.registerCommand(pluginName, "TakePlayerMoney", function(args) {
    const money = Number(args.moneyAmount);
    $gamePlayerTrainer.addMoney(-money);
});
PluginManager.registerCommand(pluginName, "GetPlayerMoney", function(args) {
    const variable = Number(args.chosenVariable);
    $gameVariables.setValue(variable, $gamePlayerTrainer.money());
});


PluginManager.registerCommand(pluginName, "AddItemToStorage", function(args) {
    const itemId = Number(args.item);
    const amount = Number(args.amount);
    $gamePlayerTrainer.gainStoredItem(itemId, amount);
});
PluginManager.registerCommand(pluginName, "AddItemToBag", function(args) {
    const itemId = Number(args.item);
    const amount = Number(args.amount);
    $gamePlayerTrainer.gainBagItem(itemId, amount);
});
PluginManager.registerCommand(pluginName, "LoseItem", function(args) {
    const itemId = Number(args.item);
    $gamePlayerTrainer.loseBagItem(itemId);
});
PluginManager.registerCommand(pluginName, "GiveBadge", function(args) {
    const itemId = Number(args.item);
    if (PokemonMZ.badgeItemIds.includes(itemId)) {
        $gamePlayerTrainer.giveBadge(itemId);
    }
});
PluginManager.registerCommand(pluginName, "HasItemInBag", function(args) {
    const itemId = Number(args.item);
    const switchId = Number(args.returnSwitchId)
    if ($gamePlayerTrainer.hasItem(itemId)) {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, true); }
    } else {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, false); }
    }
});





// Pokedex
PluginManager.registerCommand(pluginName, "GivePokedex", function(args) {
    const regionId = args.region;
    $gamePlayerTrainer.givePokedex(regionId);
});
PluginManager.registerCommand(pluginName, "AddPokedexPokemonSeen", function(args) {
    const pokemonId = Number(args.pokemon);
    const dataEnemy = $dataEnemies[pokemonId];

    if (dataEnemy) {
        const id = dataEnemy.pkmz_data.id;
        $gamePlayerTrainer.addSeenPokemon(id);
    }
});
PluginManager.registerCommand(pluginName, "NumberPokemonSeen", function(args) {
    const returnVariable = Number(args.returnVariable);
    $gameVariables.setValue(returnVariable, $gamePlayerTrainer.numPokemonSeen());
});
PluginManager.registerCommand(pluginName, "NumberPokemonOwned", function(args) {
    const returnVariable = Number(args.returnVariable);
    $gameVariables.setValue(returnVariable, $gamePlayerTrainer.numPokemonCaptured());
});



// Pokemon
PluginManager.registerCommand(pluginName, "CanGetPokemon", function(args) {
    const switchId = Number(args.returnSwitchId)
    if ($gamePlayerTrainer.canGetPokemon()) {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, true); }
    } else {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, false); }
    }
});
PluginManager.registerCommand(pluginName, "CanGetPokemonInParty", function(args) {
    const switchId = Number(args.returnSwitchId)
    if ($gamePlayerTrainer.canGetPokemonInParty()) {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, true); }
    } else {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, false); }
    }
});

PluginManager.registerCommand(pluginName, "GivePokemon", function(args) {
    const pokemonId = Number(args.pokemon);
    const level = Number(args.level)
    const switchId = Number(args.returnSwitchId)
    if ($gamePlayerTrainer.canGetPokemon()) {
        const pokemon = new PokemonMZ_Game_Pokemon(pokemonId, level);
        pokemon.setTrainerInfo(
            $gamePlayerTrainer.trainerId(),
            $gamePlayerTrainer.name()
        );
        $gamePlayerTrainer.givePokemonBeforeNickname(pokemon);
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, true); }
    } else {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, false); }
        const message = "There's no more room for Pokémon!\nThe Pokémon Box is full and can't accept any more! Change\nthe Box at a Pokémon Center!"
        $gameMessage.add(message);
    }
});
PluginManager.registerCommand(pluginName, "PlayPokemonCry", function(args) {
    const pokemonId = Number(args.pokemon);
    const tempPokemon = new PokemonMZ_Game_Pokemon(pokemonId, 1);
    tempPokemon.playCry();
});

// DayCare
PluginManager.registerCommand(pluginName, "IsPokemonAtDayCare", function(args) {
    const switchId = Number(args.returnSwitchId)
    if ($gamePlayerTrainer.isPokemonAtDayCare()) {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, true); }
    } else {
        if (args.returnSwitchId) { $gameSwitches.setValue(switchId, false); }
    }
});

PluginManager.registerCommand(pluginName, "SelectPokemonDayCare", function(args) {
    const pokemonIntId = Number(args.searchedPokemon);
    const returnVariable = Number(args.returnVariable);
    SceneManager.push(PokemonMZ_Scene_PokemonMenu);
    SceneManager.prepareNextScene("selectDayCare",{"returnVariable":returnVariable});
});
PluginManager.registerCommand(pluginName, "AddPokemonAtDayCare", function(args) {
    const indexVariable = Number(args.indexVariable);
    $gamePlayerTrainer.addPokemonAtDayCareFromParty($gameVariables.value(indexVariable));
});

PluginManager.registerCommand(pluginName, "GetDayCareResult", function(args) {
    const baseCost = Number(args.baseCost);
    const costPerLevel = Number(args.costPerLevel);
    const levelVariable = Number(args.levelVariable);
    const costVariable = Number(args.costVariable);

    const levelGained = $gamePlayerTrainer.pokemonAtDayCareLevelGained();
    const cost = baseCost + levelGained*costPerLevel;

    $gameVariables.setValue(levelVariable, levelGained);
    $gameVariables.setValue(costVariable, cost);
});
PluginManager.registerCommand(pluginName, "PlayDayCarePokemonCry", function(args) {
    const pokemon = $gamePlayerTrainer.pokemonAtDayCare();
    if (pokemon) {
        pokemon.playCry();
    }
});
PluginManager.registerCommand(pluginName, "RetrievePokemonFromDayCare", function(args) {
    $gamePlayerTrainer.retrievePokemonFromDayCare();
});



// User interface
PluginManager.registerCommand(pluginName, "ShowComputerPlayer", function(args) {
    SceneManager.push(PokemonMZ_Scene_ComputerItems);
});
PluginManager.registerCommand(pluginName, "ShowComputerPokemon", function(args) {
    SceneManager.push(PokemonMZ_Scene_ComputerPokemons);
});
PluginManager.registerCommand(pluginName, "ShowCurrentRegionMap", function(args) {
    SceneManager.push(PokemonMZ_Scene_RegionMap);
});
PluginManager.registerCommand(pluginName, "PlayerTeamHeal", function(args) {
    $gamePlayerTrainer.healTeam();
});

PluginManager.registerCommand(pluginName, "SelectPokemonTrade", function(args) {
    const pokemonIntId = Number(args.searchedPokemon);
    const returnVariable = Number(args.returnVariable);
    SceneManager.push(PokemonMZ_Scene_PokemonMenu);
    SceneManager.prepareNextScene("selectTrade",{"pokemonIntId":pokemonIntId, "returnVariable":returnVariable});
});

PluginManager.registerCommand(pluginName, "TradePartyPokemon", function(args) {
    const partyIndexVariable = Number(args.partyIndexVariable);
    const tradedPokemonId = Number(args.tradedPokemon)
    const tradedPokemonNickname = args.tradedPokemonNickname

    const partyIndex = $gameVariables.value(partyIndexVariable);
    if (partyIndex && partyIndex >= 0 && partyIndex <= 5) {
        const playerPokemon = $gamePlayerTrainer._pokemons[partyIndex]
        const tradedPokemon = $gamePlayerTrainer.generateTradedPokemon(
            tradedPokemonId,
            playerPokemon.level(),
            tradedPokemonNickname,
            "Trainer" // In generation 1, always 'Trainer'
        );
        $gamePlayerTrainer.tradePartyPokemon(
            partyIndex,
            tradedPokemon
        );
        $gamePlayerTrainer.addSeenPokemon(tradedPokemon.id());
        $gamePlayerTrainer.addCapturedPokemon(tradedPokemon.id());
        tradedPokemon.playCry();

        // Require checking trade evolution
        $gameMap.askForEvolutionCheck();
    } else {
        console.error("Traded index is incorrect. Please check the variable used.")
    }

});