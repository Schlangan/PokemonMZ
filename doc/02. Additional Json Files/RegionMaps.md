The PokemonMZ_RegionMaps.json file defines the parameters for the region map.

---

The main structure is an array of **regionMapData**. The first element is null, mimicking the first null elements of RPG Maker MZ json files.

---

regionMapData
- id, **int** : Identifier of the region. This id is used inside the maps properties notes, with the regionId:xxxx notetag. 
- pictureName, **string** : The name of the file (without extension) located in img/pictures folder of rpg maker. The name is case sensitive. 
- cellSize, **int** : The dimension in pixels of one cell the grid of the map. In game, the map is resized and take the cellSize into account
- poi: **Array:poiData** : : An array of each point of interest for the map. The first element is also null.

---

poiData
- id, **int** : Index of the point of interest.
- name, **string** : Name of the point of interest, that will be displayed on the map screen.
- x, **int** : X coordinate of the grid cell corresponding to the point of interest on the map
- y, **int** : Y coordinate of the grid cell corresponding to the point of interest on the map
- pokemons, **Array:string** : Array of pokemon string identifier (as set in Enemy Database window). They are used for pokemon locations inside the Pokedex.
