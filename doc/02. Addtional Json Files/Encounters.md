The PokemonMZ_Encounters.json file defines the parameters for the wild and trainer battles.

---

The main structure is an array of **encounterData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

encounterData
- id, **string** : Identifier of the encounter. It is eaxactly the name of the Troop inside RPG Maker MZ Database.
- type, **string** : Defines the type of encounter, either **trainer** or **wild**. All other parameters changes depending on the type.

encounterData (Wild pokemons)
- id, **string** : Identifier of the encounter. It is eaxactly the name of the Troop inside RPG Maker MZ Database.
- type, **string** : Equal to **wild**
- pokemons, **Array:wildPokemonData** : An array of **wildPokemonData**, defining possible wild pokemons encountered

encounterData (Trainer)
- id, **string** : Identifier of the encounter. It is eaxactly the name of the Troop inside RPG Maker MZ Database.
- type, **string** : Equal to **trainer**
- trainerActor, **int** : The numeric Id of the Actor in RPG Maker MZ Actor Database. It is used for the trainer appearance.
- ia, **string** : The specific battle AI. Only **basic** is implemented for now.
    - **basic** : The trainer will use random moves, but will avoid using status-only moves if the player's pokemon has already a status.
- iaModifiers: **iaModifierData**, *optional* : An iaModifierData object for specific Battle AI Behavior such as using items or switching out.
- pokemons, **Array:trainerPokemonData** : An array of **trainerPokemonData**, defining the party of the trainer
- victoryText, **string**, *optional* : If present, sets a text for the trainer if the player is defeated. Do not add the parameter to skip the trainer victory message scene.
- defeatText, **string** : The text of the trainer when defeated.
- money, **int**: The money given by the trainer when defeated.

---

wildPokemonData
- id, **string** : Pokemon identifier, as found inside the RPG Maker MZ Enemy Database, note id.
- levelMin, **int** : Minimum level of the pokemon
- levelMax, **int** : Maximum level of the pokemon
- rate, **int** : Rate of appearance. The chance to spawn is calculated from the sum of all rates of the encounter. There is no need for the sum to be exactly 100.

---

trainerPokemonData
- id, **string** : Pokemon identifier, as found inside the RPG Maker MZ Enemy Database, note id.
- level, **int** : Level of the pokemon
- moveset, **string** : Either **default** (default learned moves) or **add** (Add specific moves).
- addMoves, **Array:string**, *optional* : When moveset is set to add, add the moves in the array. If moves exceed four, previous moves are deleted.
- dv, **string** : DV values for generation 1-2. Only **default** is implemented for now (x,9,8,8,8)
- ev, **string** : EV values for the pokemon. Only **default** is implemented for now (0,0,0,0,0)

---

iaModifierData
- item, **iaModifierItemData**, *optional* : A iaModifierItemData object to define the conditions for the enemy trainer to use items.

---

iaModifierItemData
- id, **string** : String id of the item to use.
- condition, **string** : Condition for using the item. 
    - **hasStatus** : Require the trainer's pokemon to be inflicted by a status BRN, SLP, PSN, FRZ or PAR.
- chance, **int** : Chance out of 100 for the trainer to use the item if the conditions are fulfilled.
- maxPerPokemon, **int** : The maximum amount of times the trainer can use an item of the same Pokemon.