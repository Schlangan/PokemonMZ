The PokemonMZ_Pokemon.json file defines the parameters for the pokemons

---

The main structure is an array of **pokemonData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

pokemonData
- id, **string** : Identifier of the pokemon. Used inside the notetag of Enemies inside RPG Maker MZ Database.
- pokedex, **Array:pokedexData** : An array of data for the various pokedex. Each entry indicates the pokedex id and the number of the pokemon inside that pokedex.
- category, **string** : The pokemon category inside the pokedex. Ex: Bulbasaur is a *seed* Pokémon.
- description, **string** : The description of the pokemon for any pokedex.
- height, **float** : The height in meters of the pokemon, for the pokedex.
- weight, **float** : The weight in kilograms of the pokemon, for the pokedex.
- types, **Array:string** : An array of the types id of the pokemon, as defined in the PokemonMZ_Types.json file.
- baseStats : The base stats of the pokemon
    - hp, **int** : Base HP value
    - patk, **int** : Base Attack value
    - pdef, **int** : Base Defense value
    - satk, **int** : Base Special Attack value. Note, in generation 1, this value is unused, and spc is used instead.
    - sdef, **int** : Base Special Defense value. Note, in generation 1, this value is unused, and spc is used instead.
    - spd, **int** : Base Speed value
    - spc, **int** : Base Special value. In generation 1, this value sets the special attack and special defense.
- expCurve, **string** : The experience curve of the pokemon. Possible values are **erratic**, **fast**, **mediumFast**, **mediumSlow**, **slow**, **fluctuating**
- catchRate, **int** : The catch rate of the pokemon. Max value is **255** for the easiest, while lower values made them harder to catch.
- xpYield, **int** : The base amount of experience given when defeated
- ev : The ev provided when being defeated. This value isn't used yet, as it only applies starting from generation III.
    - hp, *optional*, **int** : Provided EV for HP
    - patk, *optional*,**int** : Provided EV for Attack
    - pdef, *optional*,**int** : Provided EV for Defense
    - satk, *optional*,**int** : Provided EV for Special Attack
    - sdef, *optional*,**int** : Provided EV for Special Defense
    - spd, *optional*,**int** : Provided EV for Speed
- evolution, **Array:evolutionData** : An array of all possible evolutions of the pokemon.
- learnedMoves, **Array:moveLearnedData** : An array of moved learned while leveling up. Moves at level 1 are learned again after evolution.
- hmMoves, **Array:string** : An array of the HMs the pokemon can learn (move identifier from RPG Maker Skill note id). Not implemented yet.
- tmMoves, **Array:string** : An array of the TMs the pokemon can learn (move identifier from RPG Maker Skill note id). Not implemented yet.

---

pokedexData
- region, **string** : The pokedex region, same id as used inside the Give Pokedex plugin command.
- number, **int** : The number of the pokemon inside that pokedex

---

evolutionData
- to, **string** : Identifier of the pokemon it evolves to.
- mode, **string** : Evolution mode. Additional parameters are set according to the mode.

Depending on the mode, additional parameters are required.

- mode = **level** : Evolution by reaching a specific level
    - level,**int** : Level minimum to reach to evolve.
- mode = **useItem** : Evolution by using an item of the pokemon
    - item,**string** : Item identifier (from the RPG Maker Item Database note id)

---

moveLearnedData
- lvl, **string** : Level for which the move is learned. When a pokemon evolves, it tries to learn all skills set at level 1.
- move, **string** : The identifier of the move to learn. It corresponds to the id of the note of the RPG Maker Skill

---