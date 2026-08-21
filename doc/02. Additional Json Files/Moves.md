The PokemonMZ_Moves.json file defines the parameters for the moves

---

The main structure is an array of **moveData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

moveData
- id, **string** : Identifier of the move. Used inside the notetag of Skills inside RPG Maker MZ Database.
- category, **string**, *optional* : If specified, specific move category. Only **status** available. 
- type, **string** : The type of the move, from the PokemonMZ_Types.json file
- target, **string** : The target of the move, either **user** or **opponent**
- pp, **int** : The base max PP of the move.
- power, **int**, *optional* : The damage power of the move. Parameter isn't needed for status moves.
- accuracy, **int**: The accuracy out of 100 for the move
- priority, **int**, *optional* : The priority of the move (ex: 1 for quickAttack)
- targetDefenseDivider, **float**, *optional* : The division of the target defense during attack. (ex 2.0 for self-destruct)

- noCritical, **bool**, *optional* : If set to **true**, the move will never do critical damage.
- noAccuracy, **bool**, *optional* : If set to **true**, the move won't do any accuracy calculation and always hit, even if the opponent is digging.
- noVariance, **bool**, *optional* : If set to **true**, the move won't have any variance calculation and always do fixed damage.
- cpuHigherEffectFailure, **bool**, *optional* : If set to **true**, the computer pokemon has an additional 25% chance of failing the effects of the move.
- fixedDamage, **int**, *optional* : If the value is set and positive, the move will strictly do that amount of damage, without variance, critical or type effectiveness. If the value is equal to **-1**, the damage becomes equal to the user's level (ex: seismic toss)

- forbidMirrorMove, **bool**, *optional* : If the value is set to true, the move cannot be reproduced by mirror move.
- hitDig, **bool**, *optional* : If the value is set to true, the move will be able to hit an opponent using dig.

- effects, **Array:moveEffect** : An array of the **moveEffect**, definining all secondary effects of the move.
- alwaysEffects, **bool**, *optional* : If the value is set to true, the effects of the move will always happen, even if the move missed or did no damage due to immunity.
- mapEffect: **string**, *optional* : Move usable on the map, with a given effect.
    - **teleport** : Allow teleporting to the last respawn from maps where the teleport:true note is set.
    - **dig** : Allow teleporting to the last respawn from maps where the escapeRope:true note is set.
- animationAlways, **string**, *optional* : The animation string Id from the additional JSon file PokemonMZ_Animations.json when the move is launched, whether it hits or not.
- animationHit, **string**, *optional* : The animation string Id from the additional JSon file PokemonMZ_Animations.json when the move hits.

---

moveEffect
- type, **string** : Type of effect. All other parameters depend on the type.
- except,  **Array:exceptedData**, *optional* : Array of **exceptionData**, exceptions preventing the effect to apply

List of implemented effects and their additional parameters:

- type = **bide** : Special move bide
    - unleashAnimationId, **int** : TAnimation string Id from the additional JSon file PokemonMZ_Animations.json -  Bide unleash phase.

- type = **bindTarget** : Move blocking the opponent attacks for N turns while inflicting damage (Wrap)
    - min, **int** : Minimum number of turns of the effect
    - max, **int** : Maximum number of turns of the effect
    - percentChances, **Array:int** : From min to max, chances for each number of turns (ex; [38,37,13,12] for wrap)

- type = **burnTarget** : Burn the target 
    - percentChance, **int** : Chance out of 100 of the burn to happen
- type = **paralyzeTarget** : Paralyze the target 
    - percentChance, **int** : Chance out of 100 of the paralysis to happen
- type = **poisonTarget** : Poison the target 
    - percentChance, **int** : Chance out of 100 of the poison to happen
    - multiHitEffect, **string**, *optional* : For multihit skills (Twineedle), indicates if **all** hits try to poison, or if only the **last** hit calculates poison.
- type = **sleepTarget** : Put the target to sleep
    - percentChance, **int** : Chance out of 100 of the sleep to happen
- type = **confuseTarget** : Put confusion to the target 
    - percentChance, **int** : Chance out of 100 of the confusion to happen
- type = **flinchTarget** : Flinches the target 
    - percentChance, **int** : Chance out of 100 of the flinch to happen
- type = **seedTarget** : Plants a leech seed in the target
    - percentChance, **int** : Chance out of 100 of the seed to hit

- type = **disableTargetMove** : Disable a move from the target, if possible
    - minTurn, **int** : Minimum amount of turns for disabled. 0 means only stopping enemy attack if it is slower than player, for ex.
    - maxTurn, **int** : Maximum amount of turns for disabled.
    - select, **string** : Only **random** possible for now, disable a random move. Later generations will get another option for last move used.

- type = **highCritical** : Move with high critical chance. No additional parameters.
- type = **focusEnergy** : Focus Energy move. Increase by 4 critical chances (Original RBY games had a bug in which the value was divided by 4 instead. Here, the bug is fixed.)

- type = **mulitHit** : Chance of hitting several times
    - min, **int** : Minimum number of hits
    - max, **int** : Maximum number of hits
    - percentChances, **Array:int** : From min to max, chances for each number of hits to happen (ex; [35,35,15,15] for fury attack, 4-5 hits less likely)

- type = **drainTargetHp** : Absorb a part of the damage done to the opponent
    - percentDamageDrain, **int** : Percentage of the damage absorbed
    - text, **string** : Key string for the message
        - *suckedHealth*: "Sucked health from xxxxx!"

- type = **recoilPercent** : Inflicts recoil damage after hitting
    - value : Percentage of the damage inflicted turning to recoil

- type = **forceSwitchOut** : In wild battles only for generation I, force the target to leave the fight, ending the battle.
    - message, **string** : Message displayed after the pokemon name. For example : "was blown away!", or "ran away scared!"

- type = **pdefUpUser** : Increases the physical defense of the user
    - stage, **int** : Number of raised stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- type = **spcUpUser** : Increases the special of the user
    - stage, **int** : Number of raised stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- type = **evaUpUser** : Increases the speed of the user
    - stage, **int** : Number of raised stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen

- type = **patkDownTarget** : Decreases the physical attack of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- type = **pdefDownTarget** : Decreases the physical attack of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- type = **spdDownTarget** : Decreases the speed of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen
- type = **accDownTarget** : Decreases the accuracy of the target
    - stage, **int** : Number of dropped down stages
    - percentChance, **int** : Chance out of 100 of the drop down to happen

- type = **berserk** : The pokemon will automatically attack a few turns and get confused at the end. No confusion message in first generation.
    - min, **int** : Minimum amount of turns for auto-attacks
    - max, **int** : Maximum amount of turns for auto-attacks

- type = **minimizeUser** : Add minimize effect to the user, dividing the pokemon sprite scale by 2 the first time it is used. That state will be used in later generations for increased damage due to stomp

- type = **faintUser** : Puts the user K.O. after using the move. For example, self-destruct.

- type = **splash** : Useless move that makes no damage and simply displays 'No effect!' when used.
- type = **teleport** : Teleport the pokemon - ends wild battle with a given success chance. Always fail in trainer battles.
- type = **rage** : Triggers the rage effect - The pokemon will automatically attack every turn and gain physical attack stages when hit
- type = **mirrorMove** : Reproduce the last move the opponent launched. The move will fail in the following cases :
    - The user hasn't seen the opponent send a move yet
    - The opponent used Mirror Move
    - The opponent is frozen or asleep
    - The opponent switched out
    - The opponent's trainer used an item
- type = **dig** : Two turns attack. First turn the user goes underground and is impossible to hit except by move with hitDig:true. Second turn, attack the target
    - animationTurn1, **string**, *optional* : Animation played during the first turn.

- type = **moneyDrop** : Drops money when using the attack. The effect depends on the pokemon generation. In generation I, it drops two times the level of the user.

- type = **rest** : Specific to the move rest. The user will recover 100% Hp and go to sleep for one more turn, erasing PAR,FRZ,BRN,PSN statuses.

---

exceptionData
- type, **string**, *optional* : Pokemon type that isn't affected by the effect (ex: thundershock cannot paralyse electric types in gen1)

---
