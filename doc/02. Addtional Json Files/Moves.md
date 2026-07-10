The PokemonMZ_Moves.json file defines the parameters for the moves

---

The main structure is an array of **moveData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

moveData
- id, **string** : Identifier of the move. Used inside the notetag of Skills inside RPG Maker MZ Database.
- type, **string** : The type of the move, from the PokemonMZ_Types.json file
- target, **string** : The target of the move, either **user** or **opponent**
- pp, **int** : The base max PP of the move.
- power, **int**, *optional* : The damage power of the move. Parameter isn't needed for status moves.
- accuracy, **int** : The accuracy out of 100 for the move
- priority, **int** : The priority of the move (ex: 1 for quickAttack)

- noCritical, **bool**, *optional* : If set to **true**, the move will never do critical damage.
- noAccuracy, **bool**, *optional* : If set to **true**, the move won't do any accuracy calculation and always hit.
- noVariance, **bool**, *optional* : If set to **true**, the move won't have any variance calculation and always do fixed damage.
- effects, **Array:moveEffect** : An array of the **moveEffect**, definining all secondary effects of the move.

---

moveEffect
- type, **string** : Type of effect. All other parameters depend on the type.
- except,  **Array:exceptedData** : Array of **exceptionData**, exceptions preventing the effect to apply

List of implemented effects and their additional parameters:

- effect = **burnTarget** : Burn the target 
    - percentChance, **int** : Chance out of 100 of the burn to happen
- effect = **paralyzeTarget** : Paralyze the target 
    - percentChance, **int** : Chance out of 100 of the paralysis to happen
- effect = **poisonTarget** : Poison the target 
    - percentChance, **int** : Chance out of 100 of the poison to happen
- effect = **sleepTarget** : Put the target to sleep
    - percentChance, **int** : Chance out of 100 of the sleep to happen
- effect = **confuseTarget** : Put confusion to the target 
    - percentChance, **int** : Chance out of 100 of the confusion to happen
- effect = **flinchTarget** : Flinches the target 
    - percentChance, **int** : Chance out of 100 of the flinch to happen
- effect = **seedTarget** : Plants a leech seed in the target
    - percentChance, **int** : Chance out of 100 of the seed to hit

- effect = **highCritical** : Move with high critical chance. No additional parameters.

- effect = **mulitHit** : Chance of hitting several times
    - min, **int** : Minimum number of hits
    - max, **int** : Maximum number of hits
    - percentChances, **Array:int** : From min to max, chances for each number of hits to happen (ex; [35,35,15,15] for fury attack, 4-5 hits less likely)

- effect = **recoilPercent** : Inflicts recoil damage after hitting
    - value : Percentage of the damage inflicted turning to recoil

- effect = **pdefUpUser** : Increases the physical defense of the user
    - stage, **int** : Number of rised stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- effect = **evaUpUser** : Increases the speed of the user
    - stage, **int** : Number of rised stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen

- effect = **patkDownTarget** : Decreases the physical attack of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- effect = **pdefDownTarget** : Decreases the physical attack of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- effect = **spdDownTarget** : Decreases the speed of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- effect = **accDownTarget** : Decreases the accuracy of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen

---

exceptionData
- type, **string**, *optional* : Pokemon type that isn't affected by the effect (ex: thundershock cannot paralyse electric types in gen1)

---
