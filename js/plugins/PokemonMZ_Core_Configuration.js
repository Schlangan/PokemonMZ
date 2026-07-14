//=============================================================================
// RPG Maker MZ - PokemonMZ - Core Configuration plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Core plugin for PokemonMZ - Set plugin variable here
 * @author Schlangan

 * @param pokemonMaxLevel
 * @text Max Pokemon Level
 * @desc Pokemon Max Level
 * @default 1
 * @type number
 * @default 100

 * @param pokemonGenBag
 * @text Bag mechanics
 * @desc Pokemon Generation mechanisms for Bags
 * @default 1
 * @type select
 * @option Generation 1 (Single limited bag)
 * @value 1

 * @param pokemonGenPkmn
 * @text Pokemon mechanics
 * @desc Pokemon Generation mechanisms for Pokemon
 * @default 1
 * @type select
 * @option Generation 1
 * @value 1

 * @param playerActorID
 * @text Player actor ID
 * @desc Database actor chosen for the player
 * @default 1
 * @type actor

 * @param badgesId
 * @text Badges Item IDs
 * @desc List of Items corresponding to available badges.
 * @default ["1","2","3","4","5","6","7","8"]
 * @type item[]

 * @param badgesId
 * @text Badges Item IDs
 * @desc List of Items corresponding to available badges.
 * @default ["1","2","3","4","5","6","7","8"]
 * @type item[]

 * @param frozenAnimation
 * @text Frozen Animation
 * @type animation
 
 * @param paralyzedAnimation
 * @text Paralyzed Animation
 * @type animation

 * @param asleepAnimation
 * @text Asleep Animation
 * @type animation
 * 
 * @param confusedAnimation
 * @text Confused Animation
 * @type animation
 * 
 * @param burnedAnimation
 * @text Burned Animation
 * @type animation
 * 
 * @param poisonedAnimation
 * @text Poisoned Animation
 * @type animation
 * 
 * @param seededAnimation
 * @text Seeded Animation
 * @type animation
 * 
 * @param seedHealedAnimation
 * @text Seed Healed Animation
 * @type animation
 *
 * @param recoverySE
 * @text Item recovery Sound
 * @type file
 * @dir audio/se/
 * 
 * @param poisonStepSE
 * @text Poisoned Sound on map
 * @type file
 * @dir audio/se/
 * 
 * @param playerJumpSE
 * @text Player Jumping Sound
 * @type file
 * @dir audio/se/
 * 
 * @param playerBumpSE
 * @text Player Bumping Sound
 * @type file
 * @dir audio/se/
 * 
 * @param teleportSE
 * @text Teleport Sound
 * @type file
 * @dir audio/se/
 * 
 * @param normalDamageSE
 * @text Normal Damage Sound
 * @type file
 * @dir audio/se/
 
 * @param weakDamageSE
 * @text Not Effective Damage Sound
 * @type file
 * @dir audio/se/

 * @param strongDamageSE
 * @text Super Effective Damage Sound
 * @type file
 * @dir audio/se/

 * @param levelUpSE
 * @text Pokemon Level Up Sound
 * @type file
 * @dir audio/se/
 
 * @param forgetMoveSE
 * @text Pokemon Move Forget Sound
 * @type file
 * @dir audio/se/
 
 * @param learnMoveSE
 * @text Pokemon Move Learn Sound
 * @type file
 * @dir audio/se/
 
 * @param pickupSE
 * @text Item pickup Sound
 * @type file
 * @dir audio/se/

 * @param ballThrowSE
 * @text Pokeball throw Sound
 * @type file
 * @dir audio/se/

 * @param ballRejectSE
 * @text Pokeball Trainer Stopped Sound
 * @type file
 * @dir audio/se/

 * @param ballWobbleSE
 * @text Pokeball wobble Sound
 * @type file
 * @dir audio/se/
 * 
 * @param ballEscapeSE
 * @text Pokeball escape Sound
 * @type file
 * @dir audio/se/
 * 
 * @param caughtPokemonME
 * @text Pokemon caught ME
 * @type file
 * @dir audio/me/
 * 
 * @param evolvedPokemonME
 * @text Pokemon evolved ME
 * @type file
 * @dir audio/me/
 * 
 * @param evolutionBGM
 * @text Pokemon evolution BGM
 * @type file
 * @dir audio/bgm/
*/

const PokemonMZ = {}
const parameters = PluginManager.parameters("PokemonMZ_Core_Configuration")

PokemonMZ.debugLog = false;

PokemonMZ.playerActorID = Number(parameters.playerActorID);
PokemonMZ.badgeItemIds = JSON.parse(parameters.badgesId).map(Number);
PokemonMZ.pokemonMaxLevel = Number(parameters.pokemonMaxLevel);
PokemonMZ.bagMechanicsGeneration = Number(parameters.pokemonGenBag).clamp(1,1);
PokemonMZ.pokemonMechanicsGeneration = Number(parameters.pokemonGenPkmn).clamp(1,1);
PokemonMZ.maxPokemonInTeam = 6;

PokemonMZ.frozenAnimation = parameters.frozenAnimation;
PokemonMZ.paralyzedAnimation = parameters.paralyzedAnimation;
PokemonMZ.asleepAnimation = parameters.asleepAnimation;
PokemonMZ.confusedAnimation = parameters.confusedAnimation;

PokemonMZ.burnedAnimation = parameters.burnedAnimation;
PokemonMZ.poisonedAnimation = parameters.poisonedAnimation;
PokemonMZ.seededAnimation = parameters.seededAnimation;
PokemonMZ.seedHealedAnimation = parameters.seedHealedAnimation;

PokemonMZ.recoverySE = parameters.recoverySE;
PokemonMZ.poisonStepSE = parameters.poisonStepSE;
PokemonMZ.playerJumpSE = parameters.playerJumpSE;
PokemonMZ.playerBumpSE = parameters.playerBumpSE;
PokemonMZ.teleportSE = parameters.teleportSE;

PokemonMZ.normalDamageSE = parameters.normalDamageSE;
PokemonMZ.weakDamageSE = parameters.weakDamageSE;
PokemonMZ.strongDamageSE = parameters.strongDamageSE;
PokemonMZ.learnMoveSE = parameters.learnMoveSE;
PokemonMZ.forgetMoveSE = parameters.forgetMoveSE;
PokemonMZ.levelUpSE = parameters.levelUpSE;
PokemonMZ.faintSE = parameters.faintSE;
PokemonMZ.pickupSE = parameters.pickupSE;

PokemonMZ.ballThrowSE = parameters.ballThrowSE;
PokemonMZ.ballRejectSE = parameters.ballRejectSE;
PokemonMZ.ballWobbleSE = parameters.ballWobbleSE;
PokemonMZ.ballEscapeSE = parameters.ballEscapeSE;

PokemonMZ.caughtPokemonME = parameters.caughtPokemonME;
PokemonMZ.evolvedPokemonME = parameters.evolvedPokemonME;

PokemonMZ.evolutionBGM = parameters.evolutionBGM;
