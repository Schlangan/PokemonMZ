## [0.0.5] - 2026-08-13

All mechanics encountered until the completion of Cerulean City have been added, including route 4, route 24 and route 25. Pokemon max level has been increased 25, adding consequently all their learned moves and evolutions.

- Bug fixes
    - Abandon move confirmation window not displaying properly in battle
    - Bug of below zero hp for pokemon koed due to confusion
    - Bag window crashing with items at the bottom
- Plugin helper
    - Configuration option for full database checker. The tool will provide error messages when finding anomalies (wrong strings id, unknown or missing properties, etc.)
- New battle mechanics
    - 'Effective' type AI for trainers. They will use non-status super effective moves if possible.
    - 'Random' use of items for trainers. These are for random use during the battle of one specific item. No other special condition required.
- New map mechanics
    - Enhanced ledge jumping mechanics by adding ledge corners. Fixed an issue with left/right/up ledge not working as intended.
    - NPC asking for trade for a specific pokemon. Displays selection menu and return values according to choices. Trade itself **Not implemented** yet.
    - Using Teleport move outside of battle
    - Using Dig move outside of battle
    - Playing a pokemon cry inside an event (bill's pc)
    - Adding a pokemon as seen to the pokedex (bill's pc)
- New skill effects
    - Animation and effects playing even if missed or ineffective (self-destruct)
    - Teleport, escaping battle (only wild battles in generation I)
    - Fixed damage moves (dragon rage)
    - Moves fainting the user (self-destruct)
    - Moves dividing the user defense during damage calculation (self-destruct)
    - Berserk moves hitting several turns straight, ending with confusion (thrash)
    - Rage effect, non-stop attacking in gen 1, increasing physical attack stage when hit
    - Minimize special sprite size reduction effect
    - Mirror move effect
    - Dig move effect
- New item effects
    - Repel, prevents wild battles with pokemon below the party's first pokemon level for a given amount of steps.
    - Stat boost in battle, with items such as X Defend.
- New predefined Pokemon data
    - Abra (rival battle + wild in route 24)
    - Arbok (if player evolves captured ekans)
    - Drowzee (rocket battle in cerulean)
    - Gloom (if player evolves captured oddish)
    - Golbat (if player evolves captured zubat)
    - Goldeen (lass battle in cerulean gym)
    - Graveler (if player evolves captured geodude)
    - Kadabra (if player evolves captured abra)
    - Machop (hiker battle in route 25)
    - Parasect (if player evolves captured paras)
    - Sandslash (if player evolves captured sandshrew)
    - Seaking (swimmer battle in cerulean gym)
    - Shellder (swimmer battle in cerulean gym)
    - Slowpoke (youngster battle in route 25)
    - Starmie (misty battle in cerulean gym)
    - Staryu (misty battle in cerulean gym)
    - Venonat (wild in route 24)
    - Weepinbell (if player evolves captured bellsprout)
- New predefined moves data
    - Acid (learned by player's Oddish lvl.24)
    - Bind (used by Hiker's Onix on route 25)
    - Body Slam (learned by player's Nidoqueen lvl.23)
    - Bubble Beam (TM11 given by Misty)
    - Confuse Ray (learned by player's Zubat lvl.21)
    - Dig (TM28 given by Rocket in Cerulean)
    - Dragon Rage (learned by player's Gyarados lvl.25)
    - Fury Swipes (learned by player's Mankey lvl.21)
    - Glare (learned by player's Ekans lvl.24)
    - Hypnosis (used by Rocket's Drowzee in Cerulean)
    - Kinesis (not encountered yet, but learned by Kadabra lvl.1, so found on enemy trainers or wild kadabras later on)
    - Minimize (learned by player's Clefairy lvl.24)
    - Mirror Move (learned by player's Spearow lvl.22, Fearow lvl.25)
    - Rage (learned by player's Charmander lvl.22, Charmeleon lvl.24, Beedrill lvl.25)
    - Self-destruct (learned by player's Geodude lvl.21)
    - Seismic Toss (TM19 found on route 25)
    - Teleport (learned by player/rival's Abra)
    - Thrash (learned by player's Nidoking lvl.23)
    - Withdraw (used by Swimmer's Shellder in Cerulean Gym)
- New predefined item data
    - Cascade Badge (Cerulean gym)
    - Elixir (Hidden item route 25)
    - Great Ball (Hidden item route 4)
    - Nugget (reward on route 24 after clearing bridge)
    - Repel (Bought at Cerulean Mart)
    - S.S. Ticket (given by Bill at Sea Cottage, route 25)
    - X Defend (used by Misty in battle)
    - TM04 (Whirlwind, item route 4)
    - TM11 (Bubble Beam, given by Misty)
    - TM19 (Seismic Toss, item route 25)
    - TM28 (Dig, given by Rocket in Cerulean)
    - TM45 (Thunderwave, item route 24)

## [0.0.4] - 2026-07-30

All mechanics encountered until the end of Mt.Moon have been added.

- New item effects
    - Gaining one level (rare candies)
    - Evolution item use (moon stone)
    - Permanent stat boost (hp up)
    - PP recovery (ether)
- New skill effects
    - Absorb life from opponent (absorb, leech life)
- New predefined Pokemon data
    - Bellsprout
    - Clefable
    - Clefairy
    - Grimer
    - Koffing
    - Magnemite
    - Meowth
    - Nidoking
    - Nidoqueen
    - Oddish
    - Paras
    - Voltorb
    - Wigglytuff
    - Zubat
- New predefined moves data
    - Absorb
    - Double Slap
    - Leech Life
    - Mega Punch
    - Rock Throw
    - Smog
- New predefined item data
    - Hp up
    - Rare candy
    - TM01 (Mega punch)
    - TM12 (Water gun)
    - Moon stone
    - Ether
    - X Defend


## [0.0.3] - 2026-07-19

Pokemon can now reach level 20, and all mechanics up to Route 3 have been added.

- Standard mechanics
    - Command Can Get a Pokemon, to check if the player has room inside the party or the current box.
    - Message preventing to receive a Pokemon if the current box and party are full. A switch can be selected to get the failure state and use it in other event commands.
    - Send automatically a received Pokemon to a box, with a message, if the party is full and the current box has room.
- New skill effects
    - Whirlwind, blowing enemy away (only wild battles in generation I)
    - Focus energy (critical chances x4 - but of original gen I games fixed)
    - Poison on last hit of multi-hit move (twineedle)
    - Binding move, preventing opponent attack for N turns and inflicting damage (wrap)
    - Splash, no effect at all.
- New battle mechanics
    - Enhanced animation system: allowing to make pokemon move during animations
- New predefined Pokemon data
    - Ivysaur
    - Charmeleon
    - Wartortle
    - Pidgeotto
    - Raticate
    - Fearow
    - Ekans
    - Nidorina
    - Nidorino
    - Jigglypuff
    - Magikarp
    - Gyarados
- New predefined moves data
    - Bite
    - Disable
    - Focus Energy
    - Pound
    - Sing
    - Slash
    - Splash
    - Supersonic
    - Twineedle
    - Whirlwind
    - Wrap

## [0.0.2] - 2026-07-16

An update to all mechanics that can be found after Viridian Forest, up to Pewter City.

- Standard mechanics
    - Take player money, for Pewter Museum
    - Give badge to player, from Brock
- New items effects
    - Awakening, sold in Pewter Mart
    - Escape rope, sold in Pewter Mart
    - Full heal, used by Brock
    - TMs, learning/forgetting moves
    - Badges, and passive stats increase for player during battle
- New skill effects
    - Screech, dropping defense by two stages
    - Bide, complete mechanics (wait, and unleash twice damage)
- New battle mechanics
    - Message for ineffective moves (using thundershock on diglett)
    - Basic trainer AI, not using status moves on player if already got one
    - Specific trainer AI using items, notably brocks 5 full heals per pokemon

## [0.0.1] - Initial release

Initial release of the plugin. Pokemon RBY mechanics up to the end of Viridian Forest.