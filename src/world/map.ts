import type { Location } from "../types.js";

// ============================================================
//  MESHYMOOR  –  8 × 8 World Map
//
//  The map offers three early branches, each feeding into a
//  tangled mid-zone before converging on the Spire Approach.
//
//  WEST PATH   (col 1–2)  Fast but brutal. Skips safe zones.
//              Best armour rewards; hardest early encounters.
//
//  CENTRE PATH (col 3–5)  The "main road." Balanced danger,
//              most potions, key story beats.
//
//  EAST PATH   (col 6–8)  Slower, weaker enemies early on,
//              but best weapon rewards and longest route.
//
//  All three paths converge at rows 5–6 before the two gates.
//
//  GATES
//  ─────
//  Shattered Gate (5-4): requires "Iron Shard Key" dropped by
//    the Iron Warden mini-boss at 4-2.
//
//  Spire Gate (7-5): requires "Runed Shard Key" dropped by
//    the Runed Sentinel at 6-7.
//
//  FINAL BOSS
//  ──────────
//  Varek the Ugly at 8-5.
// ============================================================

const worldMap: Record<string, Location> = {
  // ══════════════════════════════════════════════════════════
  //  ROW 1  –  The Outskirts  (entry zone, tutorial-light)
  // ══════════════════════════════════════════════════════════

  "1-1": {
    desc: "Flooded Millpath. A dead-end track swallowed by floodwater. Half a merchant's wagon pokes above the surface — cargo still aboard.",
    actions: { e: "1-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Swamp Crawler",
          hp: 8,
          attack: 3,
          xp: 7,
          lootChance: 0.7,
          lootPool: [{ name: "Waterlogged Buckler", type: "armor", hp: 10 }],
        },
      },
    ],
    cellType: "swamp",
  },

  "1-2": {
    desc: "Millbridge Road. Wheel-ruts head east toward the town. A dead horse blocks one lane; flies circle lazily.",
    actions: { w: "1-1", e: "1-3", s: "2-2" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Rabid Hound",
          hp: 7,
          attack: 3,
          xp: 6,
          lootChance: 1.0,
          lootPool: [{ name: "Potion", type: "potion", heal: 10 }],
        },
      },
    ],
    cellType: "road",
  },

  "1-3": {
    desc: "Meshymoor Crossroads. The realm's main east-west road meets the king's highway heading south. A signpost still stands — barely.",
    actions: { w: "1-2", e: "1-4", s: "2-3" },
    isStart: true,
    cellType: "road",
  },

  "1-4": {
    desc: "Cobbler's Square. A market square gone to ruin. A child's spinning top rests beside a toppled stall; the child is long gone.",
    actions: { w: "1-3", e: "1-5", s: "2-4" },
    encounterChance: 0.8,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 10 } }],
    cellType: "forest-camp",
  },

  "1-5": {
    desc: "East Trade Road. Caravans used to line this stretch. Now it is empty save for scattered coin and some trash.",
    actions: { w: "1-4", e: "1-6", s: "2-5" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Iron Short Sword", type: "weapon", attack: 7 } },
      { type: "item", item: { name: "Rusty Dagger", type: "weapon", attack: 5 } },
      { type: "item", item: { name: "Crooked Spear", type: "weapon", attack: 8 } },
    ],
    cellType: "road",
  },

  "1-6": {
    desc: "Greenhollow Forest Edge. The tree-line begins here. Cool shade, suspicious rustling.",
    actions: { w: "1-5", e: "1-7" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Poacher",
          hp: 10,
          attack: 4,
          xp: 8,
          lootChance: 0.8,
          lootPool: [{ name: "Hunting Knife", type: "weapon", attack: 6 }],
        },
      },
      {
        type: "monster",
        monster: {
          name: "Forest Bandit",
          hp: 8,
          attack: 5,
          xp: 8,
          lootChance: 0.8,
          lootPool: [
            { name: "Leather Jerkin", type: "armor", hp: 10 },
            { name: "Health Potion", type: "potion", heal: 10 },
          ],
        },
      },
    ],
    cellType: "forest",
  },

  "1-7": {
    desc: "Shrine of the Old Road. A mossy wayshrine. Pilgrims left offerings.",
    actions: { w: "1-6", e: "1-8", s: "2-7" },
    encounterChance: 0.8,
    encounterPool: [
      { type: "item", item: { name: "Health Potion", type: "potion", heal: 15 } },
      { type: "item", item: { name: "Pilgrim Hat", type: "armor", hp: 10 } },
    ],
    cellType: "temple",
  },

  "1-8": {
    desc: "Eastwatch Overlook. A dead-end clifftop. The view is stunning and meaningless, bringing a tear to your eye.",
    actions: { w: "1-7" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Ranger's Longbow", type: "weapon", attack: 9 } },
      { type: "item", item: { name: "Ranger's Cloak", type: "armor", hp: 12 } },
    ],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 2  –  The Borderlands  (paths diverge)
  // ══════════════════════════════════════════════════════════

  "2-1": {
    desc: "Ironmoor Quarry. A dead-end pit mine. The workers fled mid-shift; leaving equipment scattered everywhere. Something nests in the shafts.",
    actions: { e: "2-2", s: "3-1" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Quarry Beast",
          hp: 16,
          attack: 6,
          xp: 18,
          lootChance: 0.8,
          lootPool: [
            { name: "Iron Gauntlets", type: "armor", hp: 14 },
            { name: "Iron Chestplate", type: "armor", hp: 18 },
            { name: "Health Potion", type: "potion", heal: 30 },
          ],
        },
      },
    ],
    cellType: "mine",
  },

  "2-2": {
    desc: "Ruined Gatehouse. The portcullis is jammed halfway. You duck under, clumsily hitting your head.",
    actions: { n: "1-2", w: "2-1", e: "2-3", s: "3-2" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Leather Cap", type: "armor", hp: 8 } }],
    cellType: "forest-camp",
  },

  "2-3": {
    desc: "King's Highway South. Broad and cracked. A regiment of Varek's conscripts passed through recently — bootprints everywhere.",
    actions: { n: "1-3", w: "2-2", e: "2-4", s: "3-3" },
    encounterChance: 0.5,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Deserter",
          hp: 14,
          attack: 5,
          xp: 12,
          lootChance: 1.0,
          lootPool: [{ name: "Health Potion", type: "potion", heal: 20 }],
        },
      },
    ],
    cellType: "road",
  },

  "2-4": {
    desc: "Broken Fountain Square. The town's heart. The fountain runs with something dark, a severed head looks at you.",
    actions: { n: "1-4", w: "2-3", e: "2-5" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Wooden Shield", type: "armor", hp: 12 } }],
    cellType: "forest-camp",
  },

  "2-5": {
    desc: "Old Temple Lane. The temple of Aethon the Sunbringer. Its doors are barred from inside.",
    actions: { n: "1-5", w: "2-4", e: "2-6", s: "3-5" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Temple Defiler", hp: 15, attack: 6, xp: 14 },
      },
    ],
    cellType: "temple",
  },

  "2-6": {
    desc: "Greenhollow Glade. A quiet clearing. Birds chirp, oblivious to your presence.",
    actions: { w: "2-5", e: "2-7", s: "3-6" },
    encounterChance: 0.8,
    encounterPool: [
      { type: "item", item: { name: "Health Potion", type: "potion", heal: 20 } },
      { type: "item", item: { name: "Hunter's Cloak", type: "armor", hp: 12 } },
      { type: "item", item: { name: "Hunter's Bow", type: "weapon", attack: 10 } },
    ],
    cellType: "forest",
  },

  "2-7": {
    desc: "Thornwood Trail. The undergrowth claws at your legs. Someone scrambled through here in a hurry.",
    actions: { n: "1-7", w: "2-6", e: "2-8", s: "3-7" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Thornwood Stalker",
          hp: 18,
          attack: 5,
          xp: 20,
          lootChance: 1.0,
          lootPool: [
            { name: "Health Potion", type: "potion", heal: 25 },
            { name: "Thornwood Dagger", type: "weapon", attack: 10 },
            { name: "Thornwood Cloak", type: "armor", hp: 14 },
          ],
        },
      },
    ],
    cellType: "forest",
  },

  "2-8": {
    desc: "Cliffside Warren. A dead end: a smuggler's burrow carved into the rock. Inside is a note reading 'DO NOT GO SOUTH.'",
    actions: { w: "2-7", s: "3-8" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Chainmail Coif", type: "armor", hp: 20 } }],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 3  –  The Disputed Middle  (moderate danger)
  // ══════════════════════════════════════════════════════════

  "3-1": {
    desc: "Ironmoor Descent. A steep track down the quarry ridge. The WEST path runs here. Hard going.",
    actions: { n: "2-1", e: "3-2", s: "4-1" },
    encounterChance: 0.75,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Ridge Marauder",
          hp: 22,
          attack: 8,
          xp: 26,
          lootChance: 0.8,
          lootPool: [{ name: "Steel Vambrace", type: "armor", hp: 18 }],
        },
      },
    ],
    cellType: "mountain-road",
  },

  "3-2": {
    desc: "Tanner's Row. Hides still soak in vats. The stench is extraordinary. A tanner's apron hangs on a frame.",
    actions: { n: "2-2", w: "3-1", e: "3-3", s: "4-2" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Scavenger Gang",
          hp: 20,
          attack: 7,
          xp: 22,
          lootChance: 0.8,
          lootPool: [{ name: "Tanner's Apron", type: "armor", hp: 15 }],
        },
      },
    ],
    cellType: "forest-camp",
  },

  "3-3": {
    desc: "Crossroads Tavern. Still smoking from a recent fire. The innkeeper's savings were hidden under a loose flagstone, worthless now.",
    actions: { n: "2-3", w: "3-2", e: "3-4" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 25 } }],
    cellType: "forest-camp",
  },

  "3-4": {
    desc: "King's Highway Checkpoint. A barricade of wagons. Varek's conscripts still man it — badly.",
    actions: { w: "3-3", e: "3-5", s: "4-4" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Conscript Captain",
          hp: 24,
          attack: 9,
          xp: 30,
          lootChance: 0.9,
          lootPool: [{ name: "Chainmail Vest", type: "armor", hp: 20 }],
        },
      },
    ],
    cellType: "road",
  },

  "3-5": {
    desc: "Rivermoor Bridge. The bridge holds, barely. A sword is jammed in the railing like a trophy with blood dried on the blade.",
    actions: { n: "2-5", w: "3-4", e: "3-6" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Rivermoor Blade", type: "weapon", attack: 12 } },
    ],
    cellType: "stone-bridge",
  },

  "3-6": {
    desc: "Healer's Refuge. A cottage still intact. The healer barricaded herself in; she left potions on the windowsill before fleeing.",
    actions: { n: "2-6", w: "3-5", e: "3-7" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 25 } }],
    cellType: "grass",
  },

  "3-7": {
    desc: "Thornwood Depth. The forest thickens. Squirrels scurry from the roots of a black oak.",
    actions: { n: "2-7", w: "3-6", e: "3-8", s: "4-7" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Forest Wraith",
          hp: 22,
          attack: 8,
          xp: 25,
          lootChance: 0.9,
          lootPool: [{ name: "Ranger's Blade", type: "weapon", attack: 11 }],
        },
      },
    ],
    cellType: "forest",
  },

  "3-8": {
    desc: "Smuggler's Gorge. A dead end — the gorge is impassable. A smuggler's note is pinned to a tree: 'The WEST path is safer. The EAST path is faster.'",
    actions: { n: "2-8", w: "3-7" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Smuggler Lord",
          hp: 28,
          attack: 10,
          xp: 35,
          lootChance: 1,
          lootPool: [{ name: "Studded Leather Hauberk", type: "armor", hp: 22 }],
        },
      },
    ],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 4  –  The Blighted Belt  (hard, paths converge)
  // ══════════════════════════════════════════════════════════

  "4-1": {
    desc: "Ironmoor Pit Bottom. A dead end. The mine shafts are pitch-black. Something enormous has been digging from inside.",
    actions: { n: "3-1", e: "4-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Deep Crawler",
          hp: 32,
          attack: 12,
          xp: 45,
          lootChance: 1,
          lootPool: [{ name: "Miner's Plate Helm", type: "armor", hp: 24 }],
        },
      },
    ],
    cellType: "mine",
  },

  "4-2": {
    desc: "Iron Warden's Post. The Iron Warden — Varek's western lieutenant — holds a shard of the shattered Crown on his belt. He will not yield it.",
    actions: { n: "3-2", w: "4-1", e: "4-3", s: "5-2" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Iron Warden",
          hp: 55,
          attack: 15,
          xp: 90,
          lootChance: 1,
          lootPool: [{ name: "Iron Shard Key", type: "item" }],
        },
      },
    ],
    cellType: "mine",
  },

  "4-3": {
    desc: "Ashen Crossroads. The soil here is grey. Nothing grows. Three roads meet; you smell burnt iron.",
    actions: { w: "4-2", e: "4-4" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Ash Revenant", hp: 28, attack: 11, xp: 38 },
      },
    ],
    cellType: "desert",
  },

  "4-4": {
    desc: "Shattered Aqueduct. The old water supply, smashed. Rubble everywhere. A healing vial is wedged in the stonework.",
    actions: { n: "3-4", w: "4-3", e: "4-5", s: "5-4" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 30 } }],
    cellType: "river",
  },

  "4-5": {
    desc: "Dead Merchant's Road. A dead merchant still grips a fine longsword. He died defending his wares. At least the blade survived.",
    actions: { w: "4-4", e: "4-6", s: "5-5" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Steel Longsword", type: "weapon", attack: 15 } },
    ],
    cellType: "road",
  },

  "4-6": {
    desc: "Blighted Fen. Black water. Twisted reeds. Eyes just below the surface. The EAST path runs through here.",
    actions: { w: "4-5", e: "4-7", s: "5-6" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Fen Horror", hp: 30, attack: 12, xp: 42 },
      },
    ],
    cellType: "swamp",
  },

  "4-7": {
    desc: "Witchwood Hollow. A coven worked here until recently. Their grimoire lies open, but you can't read the language it contains.",
    actions: { n: "3-7", w: "4-6", e: "4-8" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Hollow Witch",
          hp: 28,
          attack: 13,
          xp: 40,
          lootChance: 1,
          lootPool: [
            { name: "Witchwood Staff", type: "weapon", attack: 14 },
            { name: "Coven Robes", type: "armor", hp: 20 },
          ],
        },
      },
    ],
    cellType: "forest",
  },

  "4-8": {
    desc: "Cliffside Cache. A dead end at the cliff's edge. A dead adventurers body lies bloated and stinky.",
    actions: { w: "4-7", s: "5-8" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Cliff Harpy",
          hp: 26,
          attack: 11,
          xp: 36,
          lootChance: 1,
          lootPool: [{ name: "Half-Plate Cuirass", type: "armor", hp: 30 }],
        },
      },
    ],
    cellType: "mountain-road",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 5  –  The Gate Approach  (gate at 5-4)
  // ══════════════════════════════════════════════════════════

  "5-1": {
    desc: "Ruined Watchtower. A dead end. The upper floors have collapsed.",
    actions: { e: "5-2", s: "6-1" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Tower Specter",
          hp: 34,
          attack: 13,
          xp: 50,
          lootChance: 1,
          lootPool: [{ name: "Knight's Kite Shield", type: "armor", hp: 28 }],
        },
      },
    ],
    cellType: "mountains",
  },

  "5-2": {
    desc: "Garrison Road. A supply road between the old fortress and the new citadel. Heavily patrolled.",
    actions: { n: "4-2", w: "5-1", e: "5-3" },
    encounterChance: 0.75,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Garrison Enforcer", hp: 36, attack: 13, xp: 52 },
      },
    ],
    cellType: "road",
  },

  "5-3": {
    desc: "Scorched Village. Every building is a skeleton of charred beams. A fine sword is still sheathed in the remains of a blacksmith's forge.",
    actions: { w: "5-2", e: "5-4", s: "6-3" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Blacksmith's Broadsword", type: "weapon", attack: 17 } },
    ],
    cellType: "forest-camp",
  },

  "5-4": {
    desc: "Shattered Gate. Two massive stone pillars and a rune-locked portcullis. Looks like you need a key to open it.",
    actions: { n: "4-4", w: "5-3", e: "5-5", s: "6-4" },
    requiredItem: "Iron Shard Key",
    cellType: "doors",
  },

  "5-5": {
    desc: "The King's Way. Through the gate, the road widens. The air is colder. The Spire is visible on the horizon.",
    actions: { n: "4-5", w: "5-4", e: "5-6", s: "6-5" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Way Daemon", hp: 38, attack: 14, xp: 58 },
      },
    ],
    cellType: "road",
  },

  "5-6": {
    desc: "The Bone Mere. A lake of still grey water. Fish float belly-up. Something stirs the deep.",
    actions: { n: "4-6", w: "5-5", e: "5-7" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Mere Lurker", hp: 40, attack: 14, xp: 62 },
      },
    ],
    cellType: "lake",
  },

  "5-7": {
    desc: "Eastern Palisade. An old logging camp turned fortification. A cache of quality arms was never distributed.",
    actions: { w: "5-6", e: "5-8", s: "6-7" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Serpent-Hilted Sword", type: "weapon", attack: 18 } },
    ],
    cellType: "forest",
  },

  "5-8": {
    desc: "Mountain Hermit's Cave. A dead end. The hermit is long gone but left some hair embedded in a prayer-stone.",
    actions: { n: "4-8", w: "5-7" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Cave Troll",
          hp: 42,
          attack: 15,
          xp: 68,
          lootChance: 1,
          lootPool: [{ name: "Stone-Forged Plate", type: "armor", hp: 35 }],
        },
      },
    ],
    cellType: "mine",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 6  –  The Corrupted Reaches  (brutal, Runed Key here)
  // ══════════════════════════════════════════════════════════

  "6-1": {
    desc: "Blight Gate. A dead end where the land is most corrupted. Something very powerful guards the approach to the next path west.",
    actions: { n: "5-1", e: "6-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Blight Colossus", hp: 50, attack: 18, xp: 85 },
      },
    ],
    cellType: "forest",
  },

  "6-2": {
    desc: "Putrid Flats. The ground squelches with black ichor. Blight-touched soldiers roam in confused circles.",
    actions: { w: "6-1", e: "6-3", s: "7-2" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Blight Soldier", hp: 44, attack: 16, xp: 70 },
      },
    ],
    cellType: "desert",
  },

  "6-3": {
    desc: "Ruined Cathedral of Aethon. The sunbringer's cathedral is a shell. Sunlight still falls through a hole in the vault — onto a healing vial.",
    actions: { n: "5-3", w: "6-2", e: "6-4" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 35 } }],
    cellType: "temple",
  },

  "6-4": {
    desc: "Outer Spire Ward. The outer ring of the Ashen Spire's defences. Walls of dark glass. Guards on every merlon.",
    actions: { n: "5-4", w: "6-3", e: "6-5" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Spire Ward Daemon", hp: 48, attack: 17, xp: 78 },
      },
    ],
    cellType: "mine",
  },

  "6-5": {
    desc: "Execution Plaza. The plaza where Varek publicly executed the old king's council. Their armour was stacked here as a monument. Take it.",
    actions: { n: "5-5", w: "6-4", e: "6-6" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Councillor's Plate", type: "armor", hp: 38 } }],
    cellType: "desert",
  },

  "6-6": {
    desc: "The Sorrow Pools. Still water reflects nothing. A potion floats half-submerged, sealed with wax. Around it: bones.",
    actions: { w: "6-5", e: "6-7", s: "7-6" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 40 } }],
    cellType: "lake",
  },

  "6-7": {
    desc: "Runed Sentinel's Crossing. The Runed Sentinel — Varek's eastern lieutenant — wears the second Crown shard as a medallion. He has been waiting for you.",
    actions: { n: "5-7", w: "6-6", e: "6-8" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Runed Sentinel",
          hp: 70,
          attack: 20,
          xp: 120,
          lootChance: 1,
          lootPool: [{ name: "Runed Shard Key", type: "item" }],
        },
      },
    ],
    cellType: "forest-camp",
  },

  "6-8": {
    desc: "Dusk Altar. A dead end. A sacrificial altar to whatever Varek now worships. An axe of terrible beauty is embedded in the stone.",
    actions: { w: "6-7" },
    encounterChance: 0.75,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Altar Daemon",
          hp: 52,
          attack: 19,
          xp: 88,
          lootChance: 1,
          lootPool: [{ name: "God-Cleft Axe", type: "weapon", attack: 22 }],
        },
      },
    ],
    cellType: "pyramid",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 7  –  The Spire Approach  (brutal, gate at 7-5)
  // ══════════════════════════════════════════════════════════

  "7-1": {
    desc: "The Dead March. A dead-end processional road paved with skulls. A Death Knight was stationed here — and the armour of his last victim remains.",
    actions: { e: "7-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Death Knight",
          hp: 55,
          attack: 22,
          xp: 95,
          lootChance: 1,
          lootPool: [{ name: "Dullahan Plate", type: "armor", hp: 45 }],
        },
      },
    ],
    cellType: "mountain-road",
  },

  "7-2": {
    desc: "Glass Grove. Trees transmuted to black glass by Varek's first great working. Beautiful and horrifying.",
    actions: { n: "6-2", w: "7-1", e: "7-3", s: "8-2" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Glass Revenant", hp: 50, attack: 20, xp: 85 },
      },
    ],
    cellType: "forest",
  },

  "7-3": {
    desc: "Last Healer's Cart. Overturned but the potions survived. Someone was trying to get supplies to the survivors.",
    actions: { w: "7-2", e: "7-4", s: "8-3" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Health Potion", type: "potion", heal: 45 } }],
    cellType: "road",
  },

  "7-4": {
    desc: "Outer Spire Wall. Stones the colour of a bruise. The masonry is alive — it shifts and settles as you watch.",
    actions: { w: "7-3", e: "7-5", s: "8-4" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Wall Revenant", hp: 56, attack: 22, xp: 98 },
      },
    ],
    cellType: "mountains",
  },

  "7-5": {
    desc: "Spire Gate. The final lock. As the Runed Shard Key clicks into place, the rune-chains shatter. The gate swings inward.",
    actions: { w: "7-4", s: "8-5" },
    requiredItem: "Runed Shard Key",
    cellType: "doors",
  },

  "7-6": {
    desc: "Hanging Gallery. Cages of iron dangle from enormous hooks. The wind sets them swaying and groaning.",
    actions: { n: "6-6", e: "7-7", s: "8-6" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Cage Specter", hp: 52, attack: 21, xp: 90 },
      },
    ],
    cellType: "forest",
  },

  "7-7": {
    desc: "Fallen Bell Tower. The great bell has crushed the floor below. Silence — then a deep resonance that makes your bones ache.",
    actions: { w: "7-6", e: "7-8", s: "8-7" },
    encounterChance: 0.75,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Bell Revenant", hp: 48, attack: 21, xp: 82 },
      },
    ],
    cellType: "mountains",
  },

  "7-8": {
    desc: "Dragon's Perch. A dead end — and a dragon. One of Varek's bound wyrms guards the east tower. Its hoard contains a legendary blade.",
    actions: { w: "7-7" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Varek's Wyrm",
          hp: 80,
          attack: 25,
          xp: 150,
          lootChance: 1,
          lootPool: [{ name: "Wyrm-Fang Greatsword", type: "weapon", attack: 46 }],
        },
      },
    ],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 8  –  The Ashen Spire  (endgame)
  // ══════════════════════════════════════════════════════════

  "8-1": {
    desc: "Undercroft. A dead end — the foundations of the Spire. Ancient bones and older magic. A relic of Aethon is buried here: armour that shines in the dark.",
    actions: { e: "8-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Undercroft Revenant",
          hp: 58,
          attack: 24,
          xp: 100,
          lootChance: 1,
          lootPool: [{ name: "Aethon's Blessed Plate", type: "armor", hp: 50 }],
        },
      },
    ],
    cellType: "mine",
  },

  "8-2": {
    desc: "Hall of Broken Oaths. Varek had the realm's sworn knights brought here and unmade them. Their weapons line the walls.",
    actions: { n: "7-2", w: "8-1", e: "8-3" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Oathbroken Knight",
          hp: 56,
          attack: 24,
          xp: 96,
          lootChance: 1.0,
          lootPool: [
            { name: "Oathbroken Plate", type: "armor", hp: 48 },
            { name: "Health Potion", type: "potion", heal: 40 },
            { name: "Oathbroken Longsword", type: "weapon", attack: 24 },
          ],
        },
      },
    ],
    cellType: "mine",
  },

  "8-3": {
    desc: "The Antechamber. Runes pulse red across every surface. The air pressure increases with each step forward.",
    actions: { n: "7-3", w: "8-2", e: "8-4" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Rune Sentinel", hp: 60, attack: 25, xp: 105 },
      },
      { type: "item", item: { name: "Health Potion", type: "potion", heal: 55 } },
    ],
    cellType: "temple",
  },

  "8-4": {
    desc: "The Inner Sanctum. The throne is ahead. Varek's voice fills the chamber: 'Another broken thing come to shatter itself against me.'",
    actions: { n: "7-4", w: "8-3", e: "8-5" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Sanctum Warden", hp: 65, attack: 26, xp: 110 },
      },
    ],
    cellType: "temple",
  },

  "8-5": {
    desc: "The Throne of the Ugly. Varek rises, a tower of robes, crackling runes and stolen power. The Crown fragments burn in his chest like a second heart. End him. Restore the Crown. Save Meshymoor!",
    actions: { n: "7-5", w: "8-4", e: "8-6" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Varek the Ugly",
          hp: 120,
          attack: 28,
          xp: 500,
          hasWon: true,
        },
      },
    ],
    cellType: "pyramid",
  },

  "8-6": {
    desc: "Torture Vault. A grim room best left unexamined. But there is a healing vial on the floor, dropped in haste.",
    actions: { n: "7-6", w: "8-5", e: "8-7" },
    encounterChance: 0.8,
    encounterPool: [
      { type: "item", item: { name: "Health Potion", type: "potion", heal: 45 } },
      {
        type: "monster",
        monster: { name: "Torturer", hp: 52, attack: 23, xp: 90 },
      },
    ],
    cellType: "mine",
  },

  "8-7": {
    desc: "The Reliquary. Smashed display cases — but one sealed vault holds Varek's personal battle-plate from before his corruption. Heavy. Magnificent.",
    actions: { n: "7-7", w: "8-6", e: "8-8" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Reliquary Shade",
          hp: 55,
          attack: 24,
          xp: 95,
          lootChance: 1,
          lootPool: [{ name: "Varek's Old Battle-Plate", type: "armor", hp: 52 }],
        },
      },
    ],
    cellType: "mine",
  },

  "8-8": {
    desc: "East Spire Summit. A dead end — the highest point of the Spire. A powerful restorative rests on the parapet. Below you, the whole blighted kingdom waits.",
    actions: { w: "8-7" },
    encounterChance: 1.0,
    encounterPool: [
      { type: "item", item: { name: "Greater Health Potion", type: "potion", heal: 60 } },
    ],
    cellType: "mountain-peaks",
  },
};

export default worldMap;
