import type { Location } from "../types.js";

// ============================================================
//  THE CURSE OF THE SUNKEN GOD  –  8 × 8 World Map
//
//  STORY ARC
//  ─────────
//  You are a peasant who woke in a forest clearing to find your
//  village in ash. Rumour says Malachar, the God-Eaten King,
//  consumed the Relic of the Sunken God and has been twisting
//  the land ever since. You must cross the realm, gather weapons
//  and armour, unlock his citadel, and end his reign.
//
//  ACT 1  (rows 1–3)  "The Waking Lands"
//    Gentle terrain, weak enemies. First weapons available.
//    Gate: Iron Gate (2-5) requires "Copper Key" from Bandit
//          Captain at 2-3.
//
//  ACT 2  (rows 4–6)  "The Blighted Middle"
//    Ruins, swamp, haunted fortress, stronger foes.
//    Gate: Fortress Door (5-4) requires "Fortress Key" from
//          Cursed Knight at 5-2.
//    Hidden: Dragonscale Armour in the Dragon Cave (4-1).
//
//  ACT 3  (rows 7–8)  "The Corrupted Reaches"
//    Blighted wastes. Nearly every tile has monsters.
//    Gate: Citadel Gate (7-5) requires "Runed Key" from
//          the Shadow Warden at 6-6.
//    Final: Malachar the God-Eaten King at 8-5.
// ============================================================

const worldMap: Record<string, Location> = {
  // ══════════════════════════════════════════════════════════
  //  ROW 1  –  The Waking Lands (origin, very easy)
  // ══════════════════════════════════════════════════════════

  "1-1": {
    desc: "Millbrook Ashes. A dead end where the village once stood. You find a sturdy blade in the wreckage.",
    actions: { e: "1-2" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "item",
        item: { name: "Squire's Longsword", attack: 8 },
      },
    ],
    cellType: "forest-camp",
  },
  "1-2": {
    desc: "Millbrook Road. Cart tracks lead east toward the market town.",
    actions: { w: "1-1", e: "1-3", s: "2-2" },
    encounterChance: 0.5,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Wild Dog",
          hp: 6,
          attack: 3,
          xp: 5,
          lootChance: 0.5,
          lootPool: [
            { name: "Fang dagger", attack: 3 },
            { name: "Bone Shiv", attack: 4 },
          ],
        },
      },
    ],
    cellType: "road",
  },
  "1-3": {
    desc: "Greywood Fringe. The forest thins here. You hear birds — a good sign.",
    actions: { w: "1-2", e: "1-4" },
    isStart: true,
    cellType: "grass",
  },
  "1-4": {
    desc: "Settler's Farm. An abandoned farmstead. A dead chicken. A cellar that smells of old cheese.",
    actions: { w: "1-3", e: "1-5", s: "2-4" },
    encounterChance: 0.5,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 10 },
      },
    ],
    cellType: "grass",
  },
  "1-5": {
    desc: "River Crossing. Stepping stones span a shallow brook. Something glints in the water.",
    actions: { w: "1-4", e: "1-6", s: "2-5" },
    encounterChance: 0.5,
    encounterPool: [
      {
        type: "item",
        item: { name: "Leather Cap", hp: 8 },
      },
    ],
    cellType: "river",
  },
  "1-6": {
    desc: "Hillside Shrine. A crumbling statue of the goddess Vara. Offerings of dried herbs remain.",
    actions: { w: "1-5", e: "1-7" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 20 },
      },
    ],
    cellType: "temple",
  },
  "1-7": {
    desc: "Shepherd's Ridge. A high meadow. From here you can see smoke rising to the south.",
    actions: { w: "1-6", e: "1-8", s: "2-7" },
    encounterChance: 0.25,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Rabid Wolf", hp: 10, attack: 3, xp: 8 },
      },
    ],
    cellType: "mountain-road",
  },
  "1-8": {
    desc: "Eastwatch Tower. A dead end overlooking the wastes. An exceptional bow is stored here.",
    actions: { w: "1-7" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "item",
        item: { name: "Longbow of the Dawn", attack: 8 },
      },
    ],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 2  –  The Borderlands (light danger)
  // ══════════════════════════════════════════════════════════

  "2-1": {
    desc: "Boggy Dead-End. The mud is too deep to continue. A small pack lies half-buried.",
    actions: { e: "2-2" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Bog Toad", hp: 8, attack: 3, xp: 6 },
      },
    ],
    cellType: "swamp",
  },
  "2-2": {
    desc: "Greywood Market. Stalls lie overturned. One merchant hid; he left behind a small shield.",
    actions: { n: "1-2", w: "2-1", e: "2-3", s: "3-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "item",
        item: { name: "Wooden Shield", hp: 12 },
      },
    ],
    cellType: "forest-camp",
  },
  "2-3": {
    desc: "Bandit Ambush! The Bandit Captain steps from the shadows — and something copper glints at his belt.",
    actions: { w: "2-2", e: "2-4" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Bandit Captain",
          hp: 22,
          attack: 6,
          xp: 30,
          lootChance: 1,
          lootPool: [{ name: "Copper Key", type: "key" }],
        },
      },
    ],
    cellType: "forest",
  },
  "2-4": {
    desc: "Logging Camp. Half-cut logs everywhere. The saws are silent.",
    actions: { n: "1-4", w: "2-3", s: "3-4" },
    encounterChance: 0.65,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Deserter", hp: 14, attack: 5, xp: 12 },
      },
    ],
    cellType: "forest",
  },
  "2-5": {
    desc: "Iron Gate. A portcullis blocks the road east. A keyhole bears a copper emblem.",
    actions: { n: "1-5", e: "2-6", s: "3-5" },
    requiredItem: "Copper Key",
    cellType: "doors",
  },
  "2-6": {
    desc: "Healer's Cottage. The healer fled, but her remedies remain on the shelf.",
    actions: { w: "2-5", e: "2-7", s: "3-6" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 25 },
      },
    ],
    cellType: "grass",
  },
  "2-7": {
    desc: "Old Cemetery. Headstones tilt at odd angles. Something moves between the graves.",
    actions: { n: "1-7", w: "2-6", e: "2-8", s: "3-7" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Risen Corpse", hp: 16, attack: 6, xp: 18 },
      },
    ],
    cellType: "forest",
  },
  "2-8": {
    desc: "Stone Watchtower. A dead end. A high-quality leather jerkin hangs on a peg inside.",
    actions: { w: "2-7" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "item",
        item: { name: "Leather Jerkin", hp: 15 },
      },
    ],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 3  –  The Disputed Road (moderate danger)
  // ══════════════════════════════════════════════════════════

  "3-1": {
    desc: "Mudflat Bog. A path that leads to a dead end. Something shiny is stuck in the silt.",
    actions: { e: "3-2" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "River Serpent",
          hp: 20,
          attack: 7,
          xp: 22,
          lootChance: 1,
          lootPool: [
            { name: "Serpent Fang Dagger", attack: 6 },
            { name: "Heavy Boots", hp: 10 },
          ],
        },
      },
    ],
    cellType: "stone-bridge",
  },
  "3-2": {
    desc: "Ruined Chapel. A dead end where the light of Vara still touches the stone.",
    actions: { n: "2-2", w: "3-1" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 30 },
      },
    ],
    cellType: "temple",
  },
  "3-3": {
    desc: "Crossroads Inn. Burnt out. A skeleton slumped over the bar still wears chainmail.",
    actions: { n: "2-3", w: "3-2", e: "3-4", s: "4-3" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Looter",
          hp: 18,
          attack: 7,
          xp: 20,
          lootChance: 0.9,
          lootPool: [{ name: "Chainmail Vest", hp: 15 }],
        },
      },
    ],
    cellType: "forest-camp",
  },
  "3-4": {
    desc: "Disputed Road. Soldiers from two dead armies rot in ditches on either side.",
    actions: { n: "2-4", e: "3-5", s: "4-4" },
    encounterChance: 0.5,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Restless Soldier", hp: 22, attack: 8, xp: 25 },
      },
    ],
    cellType: "road",
  },
  "3-5": {
    desc: "East Gate Pass (unlocked). The portcullis is jammed open — someone came through here recently.",
    actions: { n: "2-5", w: "3-4", s: "4-5" },
    cellType: "doors",
  },
  "3-6": {
    desc: "Plague Village. Every door is marked with a black X. Do not linger.",
    actions: { n: "2-6", e: "3-7" },
    encounterChance: 0.65,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Plague Shambler", hp: 25, attack: 8, xp: 28 },
      },
    ],
    cellType: "forest-camp",
  },
  "3-7": {
    desc: "Blighted Orchard. A dead end of blackened trees. You get the feeling something is watching you.",
    actions: { n: "2-7", w: "3-6", s: "3-8" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Plague Shambler",
          hp: 25,
          attack: 8,
          xp: 28,
          lootChance: 0.8,
          lootPool: [
            { name: "Plague Mask", hp: 20 },
            { name: "Soldier's Pike", attack: 8 },
          ],
        },
      },
    ],
    cellType: "forest",
  },
  "3-8": {
    desc: "Highwall Cliffs. The path dead-ends at a sheer drop. Far below, something enormous moves.",
    actions: { n: "3-7" },
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 4  –  The Blighted Middle (hard, Act 2 begins)
  // ══════════════════════════════════════════════════════════

  "4-1": {
    desc: "Dragon Cave. A dangerous dead end. A legend says a hero once cached legendary armour inside.",
    actions: { e: "4-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Cave Drake",
          hp: 35,
          attack: 12,
          xp: 50,
          lootChance: 1,
          lootPool: [{ name: "Dragonscale Armour", hp: 35 }],
        },
      },
    ],
    cellType: "mine",
  },
  "4-2": {
    desc: "Sunken Courtyard. Once a noble's estate. Now a flooded ruin full of broken statues.",
    actions: { w: "4-1", e: "4-3" },
    encounterChance: 0.55,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Gargoyle", hp: 30, attack: 11, xp: 40 },
      },
    ],
    cellType: "lake",
  },
  "4-3": {
    desc: "The Ashen Steppe. Nothing grows. The soil is warm underfoot.",
    actions: { w: "4-2", e: "4-4" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Ash Wraith", hp: 28, attack: 10, xp: 35 },
      },
    ],
    cellType: "desert",
  },
  "4-4": {
    desc: "Broken Aqueduct. Water trickles through ancient stonework — enough to drink.",
    actions: { n: "3-4", w: "4-3", s: "5-4" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 30 },
      },
    ],
    cellType: "river",
  },
  "4-5": {
    desc: "Merchant's Grave. A dead merchant clutches a long-sword. He won't be needing it.",
    actions: { n: "3-5", e: "4-6", s: "5-5" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "item",
        item: { name: "Steel Longsword", attack: 14 },
      },
    ],
    cellType: "road",
  },
  "4-6": {
    desc: "Cursed Swamp. The water is black. Eyes surface and sink all around you.",
    actions: { w: "4-5", e: "4-7" },
    encounterChance: 0.75,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Black Toad Demon", hp: 32, attack: 12, xp: 45 },
      },
    ],
    cellType: "swamp",
  },
  "4-7": {
    desc: "Witchwood. Trees writhe without wind. A lost grimoire lies open on a stone.",
    actions: { w: "4-6", e: "4-8" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Wood Witch",
          hp: 30,
          attack: 13,
          xp: 42,
          lootChance: 1,
          lootPool: [
            { name: "Grimoire Ward", hp: 25 },
            { name: "Witch's Staff", attack: 15 },
          ],
        },
      },
    ],
    cellType: "forest",
  },
  "4-8": {
    desc: "Cliffside Dead-End. A narrow trail above the abyss. A fine bow was dropped here.",
    actions: { w: "4-7" },
    encounterChance: 0.5,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Harpy",
          hp: 26,
          attack: 10,
          xp: 35,
          lootChance: 1,
          lootPool: [{ name: "Wind-Piercer", attack: 16 }],
        },
      },
    ],
    cellType: "mountain-road",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 5  –  The Haunted Fortress Belt (hard)
  // ══════════════════════════════════════════════════════════

  "5-1": {
    desc: "Fortress Watch. A dead end overlooking the approach. Guards patrol the high ground.",
    actions: { e: "5-2" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Skeleton Guard",
          hp: 30,
          attack: 11,
          xp: 38,
        },
      },
    ],
    cellType: "mountains",
  },
  "5-2": {
    desc: "Fortress Barracks. The Cursed Knight — once the king's champion — guards these halls.",
    actions: { w: "5-1", e: "5-3" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Cursed Knight",
          hp: 55,
          attack: 16,
          xp: 90,
          lootChance: 1,
          lootPool: [
            {
              name: "Fortress Key",
              type: "key",
            },
          ],
        },
      },
      {
        type: "item",
        item: { name: "Fortress Key", type: "key" },
      },
    ],
    cellType: "mountains",
  },
  "5-3": {
    desc: "Fortress Armoury. Ransacked. One good piece remains — a kite shield.",
    actions: { w: "5-2", e: "5-4" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Kite Shield", hp: 30 } }],
    cellType: "mine",
  },
  "5-4": {
    desc: "Fortress Great Door. Sealed with an iron lock. The Fortress Key fits the lock perfectly.",
    actions: { n: "4-4", w: "5-3", s: "6-4" },
    requiredItem: "Fortress Key",
    cellType: "doors",
  },
  "5-5": {
    desc: "Siege Trenches. Old war trenches snake through the mud. Useful cover — from what, you don't know yet.",
    actions: { n: "4-5", w: "5-6", s: "6-5" },
    encounterChance: 0.6,
    encounterPool: [
      { type: "monster", monster: { name: "Trench Ghoul", hp: 34, attack: 13, xp: 48 } },
    ],
    cellType: "road",
  },
  "5-6": {
    desc: "The Black Mere. A lake that reflects no sky. Something ancient sleeps beneath.",
    actions: { w: "5-5", e: "5-7" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Lake Horror", hp: 40, attack: 14, xp: 60 },
      },
    ],
    cellType: "lake",
  },
  "5-7": {
    desc: "Smuggler's Cache. A hollow tree hides a chest. A fine blade rests inside.",
    actions: { w: "5-6", e: "5-8" },
    encounterChance: 1.0,
    encounterPool: [{ type: "item", item: { name: "Serpent Blade", attack: 18 } }],
    cellType: "forest",
  },
  "5-8": {
    desc: "Eastern Pinnacles. A dead end in the peaks, but a beautiful view",
    actions: { w: "5-7" },
    encounterChance: 1,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Rock Troll",
          hp: 38,
          attack: 13,
          xp: 52,
          lootChance: 1,
          lootPool: [{ name: "Mountaineer Greaves", hp: 28 }],
        },
      },
      {
        type: "monster",
        monster: {
          name: "Mountain Warg",
          hp: 36,
          attack: 12,
          xp: 50,
          lootChance: 1,
          lootPool: [{ name: "Warg Fang Dagger", attack: 14 }],
        },
      },
    ],
    cellType: "mountain-peaks",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 6  –  The Corrupted Reaches (very hard, Act 3 begins)
  // ══════════════════════════════════════════════════════════

  "6-1": {
    desc: "Blight Gate. A dead end where the corruption is thickest.",
    actions: { e: "6-2" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Blight Stalker", hp: 42, attack: 15, xp: 65 },
      },
    ],
    cellType: "forest",
  },
  "6-2": {
    desc: "Putrid Fields. Crops that grew in corrupted soil. The stalks are the colour of rot.",
    actions: { w: "6-1", e: "6-3" },
    encounterChance: 0.75,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Harvest Fiend", hp: 38, attack: 14, xp: 58 },
      },
    ],
    cellType: "desert",
  },
  "6-3": {
    desc: "Collapsed Cathedral. The vaulted ceiling has caved in. A holy relic gleams in the rubble.",
    actions: { w: "6-2", e: "6-4" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "item",
        item: { name: "Vara's Blessing", hp: 35 },
      },
    ],
    cellType: "temple",
  },
  "6-4": {
    desc: "Fortress Interior (south). Through the Great Door at last. Tattered banners hang in silence.",
    actions: { n: "5-4", w: "6-3", s: "7-4" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Fortress Revenant", hp: 44, attack: 15, xp: 70 },
      },
    ],
    cellType: "mine",
  },
  "6-5": {
    desc: "Blasted Plateau. Craters from some ancient battle. The sky has turned a deep amber.",
    actions: { n: "5-5", e: "6-6", s: "7-5" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Blight Golem", hp: 48, attack: 16, xp: 75 },
      },
    ],
    cellType: "desert",
  },
  "6-6": {
    desc: "Shadow Warden's Post. The Shadow Warden — Malachar's herald — bars your path to the citadel.",
    actions: { w: "6-5", e: "6-7" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Shadow Warden",
          hp: 70,
          attack: 18,
          xp: 120,
          lootChance: 1,
          lootPool: [{ name: "Runed Key", type: "key" }],
        },
      },
    ],
    cellType: "forest-camp",
  },
  "6-7": {
    desc: "The Sorrow Pools. Reflections show faces of the fallen. You see your village. You push on.",
    actions: { w: "6-6", e: "6-8" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 40 },
      },
    ],
    cellType: "lake",
  },
  "6-8": {
    desc: "Dusk Altar. A dead end with a sacrificial altar. A brutal axe is embedded in the stone.",
    actions: { w: "6-7" },
    encounterChance: 0.6,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Altar Demon",
          hp: 50,
          attack: 17,
          xp: 80,
          lootChance: 1,
          lootPool: [{ name: "God-Cleaver Axe", attack: 24 }],
        },
      },
    ],
    cellType: "pyramid",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 7  –  The Citadel Approach (brutal)
  // ══════════════════════════════════════════════════════════

  "7-1": {
    desc: "The Dead March. A dead end road of skulls. A set of heavy plate mail is partially buried.",
    actions: { e: "7-2" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Death Knight",
          hp: 52,
          attack: 22,
          xp: 88,
          lootChance: 1,
          lootPool: [{ name: "Dullahan Plate", hp: 45 }],
        },
      },
    ],
    cellType: "mountain-road",
  },
  "7-2": {
    desc: "Corrupted Grove. Trees of black glass. Their branches cut like blades.",
    actions: { w: "7-1", e: "7-3" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Glass Wraith", hp: 48, attack: 20, xp: 82 },
      },
    ],
    cellType: "forest",
  },
  "7-3": {
    desc: "Last Healer's Cart. Overturned on the road. Somehow the potions didn't break.",
    actions: { w: "7-2", e: "7-4" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 50 },
      },
    ],
    cellType: "road",
  },
  "7-4": {
    desc: "Outer Citadel Wall. Massive stones stained purple-black. Arrow slits leak dark fire.",
    actions: { n: "6-4", w: "7-3", e: "7-5" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Wall Daemon", hp: 55, attack: 22, xp: 95 },
      },
    ],
    cellType: "mountains",
  },
  "7-5": {
    desc: "Citadel Gate. The last barrier. The Runed Key trembles in your hand — and clicks into place.",
    actions: { n: "6-5", w: "7-4", s: "8-5" },
    requiredItem: "Runed Key",
    cellType: "doors",
  },
  "7-6": {
    desc: "Execution Grounds. Iron cages dangle from hooks. The wind makes them swing and creak.",
    actions: { e: "7-7" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Cage Specter", hp: 50, attack: 20, xp: 88 },
      },
    ],
    cellType: "forest",
  },
  "7-7": {
    desc: "Fallen Bell Tower. The great bell has crashed to earth. Ringing it would summon something terrible.",
    actions: { w: "7-6", e: "7-8" },
    encounterChance: 0.7,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Bell Revenant",
          hp: 46,
          attack: 21,
          xp: 78,
        },
      },
    ],
    cellType: "mountains",
  },
  "7-8": {
    desc: "Dragon's Perch. A dead end roosting spot. One of Malachar's dragons guards a legendary blade here.",
    actions: { w: "7-7" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Malachar's Dragon",
          hp: 80,
          attack: 24,
          xp: 150,
          lootChance: 1,
          lootPool: [{ name: "Dragon Fang Blade", attack: 28 }],
        },
      },
    ],
    cellType: "mountains",
  },

  // ══════════════════════════════════════════════════════════
  //  ROW 8  –  The Throne of Ruin (endgame)
  // ══════════════════════════════════════════════════════════

  "8-1": {
    desc: "Citadel Undercroft. A dead end thick with dark energy and the bones of the fallen.",
    actions: { e: "8-2" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Undercroft Horror", hp: 58, attack: 25, xp: 100 },
      },
    ],
    cellType: "mine",
  },
  "8-2": {
    desc: "Hall of Broken Kings. Portraits of deposed monarchs line this path.",
    actions: { w: "8-1", e: "8-3" },
    encounterChance: 0.85,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Portrait Shade", hp: 54, attack: 24, xp: 95 },
      },
    ],
    cellType: "mine",
  },
  "8-3": {
    desc: "The God's Antechamber. The air pulses. Runes on the floor flare red as you step across them.",
    actions: { w: "8-2", e: "8-4" },
    encounterChance: 0.9,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Rune Sentinel", hp: 60, attack: 25, xp: 105 },
      },
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 60 },
      },
    ],
    cellType: "temple",
  },
  "8-4": {
    desc: "Inner Sanctum. The throne is visible ahead. Malachar's voice booms through the walls: 'You are already dead.'",
    actions: { n: "7-4", w: "8-3", e: "8-5" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: { name: "Sanctum Guardian", hp: 65, attack: 26, xp: 110 },
      },
    ],
    cellType: "temple",
  },
  "8-5": {
    desc: "The Throne of Ruin. Malachar the God-Eaten King rises from a throne of fused bone and iron. His eyes blaze with the light of the Sunken God. This is it. End him — or be consumed.",
    actions: { n: "7-5", w: "8-4", e: "8-6" },
    encounterChance: 1.0,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Malachar the God-Eaten King",
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
    desc: "Torture Chamber. Not a place to linger. But there is a healing vial dropped by a fleeing torturer.",
    actions: { w: "8-5", e: "8-7" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Health Potion", heal: 45 },
      },
      {
        type: "monster",
        monster: { name: "Torturer", hp: 50, attack: 23, xp: 88 },
      },
    ],
    cellType: "mine",
  },
  "8-7": {
    desc: "The Reliquary. Smashed display cases. But one sealed vault holds Malachar's old battle-plate.",
    actions: { w: "8-6", e: "8-8" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "monster",
        monster: {
          name: "Reliquary Shade",
          hp: 55,
          attack: 24,
          xp: 95,
          lootChance: 1,
          lootPool: [
            { name: "Reliquary Ward", hp: 30 },
            { name: "King's Battle Plate", hp: 50 },
          ],
        },
      },
    ],
    cellType: "mine",
  },
  "8-8": {
    desc: "East Spire. A dead end with a view of the whole blighted land. A powerful restorative is hidden here.",
    actions: { w: "8-7" },
    encounterChance: 0.8,
    encounterPool: [
      {
        type: "potion",
        potion: { name: "Greater Health Potion", heal: 55 },
      },
    ],
    cellType: "mountain-peaks",
  },
};

export default worldMap;
