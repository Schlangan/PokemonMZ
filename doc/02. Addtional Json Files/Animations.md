The PokemonMZ_Animations.json file defines the parameters for the battle animations of Pokemon moves.

---

The main structure is an array of **animationData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

animationData
- id, **string** : Identifier of the encounter. It is eaxactly the name of the Troop inside RPG Maker MZ Database.
- sequence, **Array:animationActionData** : An array of animationActionData, defining step by step the animation.

---

animationActionData
- type, **string** : Type of action. Depending on the action type, other parameters have to be defined.


- type = **playAnimation** : Play a RPG Maker MZ Animation
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - animationId, **int** : The animation Id number in RPG Maker MZ.
    - wait, **boolean**, *optional* : If **true**, wait for the animation to finish before starting next action.
- type = **playSE** : Play a sound effect
    - name ,**string** : Name of the sound effect (without extension)
    - volume, **int** : Volume of the sound effect
    - pitch, **int** : Pitch of the sound effect
    - pan, **int** : Pan of the sound effect
- type = **moveSpriteForward** : Move the sprite diagonally forward at a given distance.
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - distance, **int** : The number of pixels the sprite will move (x and y will be set to equal)
    - duration, **int** : The number of frames for the move.
- type = **moveSpriteBackward** : Move the sprite diagonally backward at a given distance.
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - distance, **int** : The number of pixels the sprite will move (x and y will be set to equal)
    - duration, **int** : The number of frames for the move.
- type = **moveSpriteLeft** : Move the sprite horizontally to its left at a given distance. (enemy will move to the right)
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - distance, **int** : The number of pixels the sprite will move (x and y will be set to equal)
    - duration, **int** : The number of frames for the move.
- type = **moveSpriteRight** : Move the sprite horizontally to its right at a given distance. (enemy will move to the left)
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - distance, **int** : The number of pixels the sprite will move (x and y will be set to equal)
    - duration, **int** : The number of frames for the move.
- type = **moveSpriteUp** : Move the sprite vertically up at a given distance.
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - distance, **int** : The number of pixels the sprite will move (x and y will be set to equal)
    - duration, **int** : The number of frames for the move.
- type = **moveSpriteDown** : Move the sprite vertically down at a given distance.
    - target, **string** : The target sprite of the animation. Either **user** or **opponent**.
    - distance, **int** : The number of pixels the sprite will move (x and y will be set to equal)
    - duration, **int** : The number of frames for the move.