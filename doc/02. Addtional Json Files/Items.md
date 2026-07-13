The PokemonMZ_Items.json file defines the items of the game.

---

main, **Array:itemData** : Array of **itemData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

itemData
- id, **string** : Identifier of the item. The same identifier must be set up inside the notetag id:xxxxx of the Item object in RPG Maker's Database.
- user, **string** : For now, only **trainer**.
- category, **string** : Either **regular** or **key** items. Key items cannot be tossed, while regular can.
- battle, **bool** : Set the value to true if the item can be used during battle. Else, the item won't appear inside the battle screen.
- target, *optional*,**string**: Set the value to **pokemon** if the item requires the pokemon selection screen to be used.
- price, **int** : Price of the item, when bought.
- effect, **string** : Chosen specific effect for the item. 


Depending on the effet, additional parameters are required.

- effect = **ball** : Pokeball
    - gen1rate,**int** : Factor of efficiency of the pokeball for generation 1 (from 255 pokeball to 150 ultraball). Set it to -1 for master ball.
    - gen1hpFactor,**int** : Factor of hp reduction on ball efficiency for generation 1 (12 for pokeball or ultraball, 8 for greatball)
- effect = **cureStatus** : Cure a specific status ailment
    - status,**string** : The status cured. For now, only possible choice between **poison**, **paralysis**, **burn**, **sleep**
- effect = **locked_item** : Item impossible to use
    - useMessage,**string** : Message shown on screen when attempting to use the item
- effect = **recover_hp_fixed** : Recover a specific amount of hp (ex: potion)
    - value,**int** : Amount of fixed hp recovered
- effect = **townMap** : Opens the current region map.

---
