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
 * @text Takes Money from the Player
 * @desc Takes a given amount of money to the player.
 * 
 * @arg moneyAmount
 * @type number
 * @min 0
 * @text Amount
 * @desc The amount of money to take

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




// Pokedex
PluginManager.registerCommand(pluginName, "GivePokedex", function(args) {
    const regionId = args.region;
    $gamePlayerTrainer.givePokedex(regionId);
});

// Pokemon
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


