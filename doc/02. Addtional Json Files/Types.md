The PokemonMZ_Types.json file defines the pokemon types, with their weaknesses and strengths.

---

The main structure is an array of **typeData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

The second element should always be type none, as it used for typeless damage such as self-inflicted damage with confusion.

---

typeData
- id, **string** : Identifier of the type. The type will be referenced by moves and pokemons.
- name, **string** : The name of the type, as displayed in-game.
- weak, **Array:string** : An array containing all types the type is weak against. Example, type normal has fighting as weakness.
- strong: **Array:string** : An array containing all types the type is strong against. Example, type electric has electric and flying as resistance.
- immune: **Array:string** : An array containing all types the type is immune against. Example, type normal has ghost as immunity.
- damage: **string** : Up to gen III, the split physical/special is done through the type. Only set **physical** or **special**.

---
