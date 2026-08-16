The PokemonMZ_Items.json file defines the items of the game.

---

main, **Array:itemData** : Array of **itemData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

itemData
- id, **string** : Identifier of the item. The same identifier must be set up inside the notetag id:xxxxx of the Item object in RPG Maker's Database.
- user, **string** : For now, only **trainer**. Not required for badge items.
- category, **string** : Either **regular**, **key** or **badge** items. Key items cannot be tossed, while regular can. Badge item must not be given, and have passive effects.
- battle, **bool** : Set the value to true if the item can be used during battle. Else, the item won't appear inside the battle screen. Not required for badge items.
- target,**string**, *optional*: Set the value to **pokemon** if the item requires the pokemon selection screen to be used.
- price, **int** : Price of the item, when bought. Not required for badge or key items.
- obedienceLevel, **int**, *optional* : For badges only, sets the level for which the trade pokemon stop obeying. The game will use the obtained badge will the highest obedience level.
- effect, **string** : Chosen specific effect for the item. 


Depending on the effet, additional parameters are required.

- effect = **ball** : Pokeball
    - gen1rate,**int** : Factor of efficiency of the pokeball for generation 1 (from 255 pokeball to 150 ultraball). Set it to -1 for master ball.
    - gen1hpFactor,**int** : Factor of hp reduction on ball efficiency for generation 1 (12 for pokeball or ultraball, 8 for greatball)
- effect = **cureStatus** : Cure a specific status ailment
    - status,**string** : The status cured. For now, only possible choice between **poison**, **paralysis**, **burn**, **sleep**, **all**
- effect = **lockedItem** : Item impossible to use
    - useMessage,**string** : Message shown on screen when attempting to use the item
- effect = **recover_hp_fixed** : Recover a specific amount of hp (ex: potion)
    - value,**int** : Amount of fixed hp recovered
- effect = **recoverHpPercentCureStatus** : Recover a % of hp and cure statuses (ex: full restore)
    - value,**int** : Percentage of hp recovered
    - status,**string** : The status cured. For now, only possible choice between **poison**, **paralysis**, **burn**, **sleep**, **all**
- effect = **restorePp** : Recover PP for one or several moves (ex: ether/elixir)
    - range,**string** : The range of effect of the recovery. Either **single**, affecting one move (ether), or **all** for all moves at once (elixir)
    - value,**int** : Amount of PP recovered, either -1 for all PP, or a specific value.
- effect = **increaseLevel** : Increase the level of the pokemon by 1 (ex: rare candy)
- effect = **increaseEv** : Increase the EV of a stats by a specific value, up to a limit
    - stat,**string** : Stat increased, **hp**, **patk**, **pdef**, **satk**, **sdef** or **spd**. For gen 1 Special stat, use **satk**.
    - value,**int** : Increase value of the stat
    - maxValue, **int** : Max value of increase with the item. Ex. gen1 hp up cannot go above 25600, even if the stat max EV is 65535.
- effect = **evolutionItem** : Use as an evolution item (ex: moon stone)
- effect = **townMap** : Opens the current region map.
- effect = **escapeRope** : Use an escape rope.
- effect = **passivePatkBoost**, **passivePdefBoost**, **passiveSpcBoost**, **passiveSpdBoost** : Passive attack, defense, special and speed bonus for badges. Applies only if badge owned.
    - boostPercent,**float**: Attack bonus percentage.
- effect = **repel** : Repel wild pokemon below the party's first pokemon (ko or not)
    - steps, **int** : Number of steps before the repel wears off
- effect = **tm** : Used to teach a move to a pokemon
    - move, **string** : Id of the move to learn
- effect = **battlePdefUpUser**, **battleSpcUpUser** : Boost by N stages the defense/special of the current pokemon in battle. Unusable outside battle.
    - stage, **int** : Amount of stages up.
    - mapMessage, **string** : Message shown when trying to use the item on the map instead of battle.
    - battleAnimation, **string**, *optional* : Animation string ID played on the player's pokemon if the item succeeds
- effect = **fishing** : Can only be used if a water tile region is in front of the player. Don't forget to set the water tiles regions in the map notetag.
    - biteChance, **int** : Chance out of 100 of a pokemon biting. Failing bite will display the "Not even a nibble" message.
    - badMessage, **string** : Message shown when trying to use the fishing rod in front of a tile that isn't water.
---
