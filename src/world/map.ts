import { Location } from "../types.js";

const worldMap: Record<string, Location> = {
  // row 1 - northern peaks
  "1-1": {
    desc: "The Frozen Peak. The air is thin and freezing.",
    actions: { s: "2-1", e: "1-2" },
    monsterChance: 0.8,
    monsterPool: [{ name: "Ice Giant", hp: 40, attack: 12 }],
  },
  "1-2": {
    desc: "Ancient Observatory. Rusty telescopes point to the stars.",
    actions: { w: "1-1", e: "1-3" },
    itemChance: 1,
    itemPool: [{ name: "Lens of Truth", hp: 5 }],
  },
  "1-3": {
    desc: "Northern Pass. A snowy trail leading east.",
    actions: { w: "1-2", e: "1-4" },
  },
  "1-4": {
    desc: "Dragon's Nest. Charred bones litter the ground.",
    actions: { w: "1-3", s: "2-4" },
    monsterChance: 1,
    monsterPool: [
      {
        name: "Dragon",
        hp: 50,
        attack: 20,
        xp: 100,
        itemPool: [{ name: "Small Key", type: "key" }],
      },
    ],
  },
  "1-5": {
    desc: "Desert Lookout. You can see the heat haze to the south.",
    actions: { e: "1-6" },
  },
  "1-6": {
    desc: "Hidden Oasis. A rare spot of water in the high desert.",
    actions: { w: "1-5", s: "2-6" },
    potionChance: 0.9,
    potionHeal: 30,
  },

  // row 2 - highlands
  "2-1": {
    desc: "Mountain Trail. Steep and dangerous.",
    actions: { n: "1-1", s: "3-1" },
    monsterChance: 0.3,
    monsterPool: [{ name: "Goat", hp: 5, attack: 2 }],
  },
  "2-2": {
    desc: "Old Stone Bridge. It spans a deep gorge.",
    actions: { e: "2-3", s: "3-2" },
  },
  "2-3": {
    desc: "The Great Gate. Massive oak doors, barred from the other side.",
    actions: { w: "2-2" },
    requiredItem: "Small Key",
  },
  "2-4": {
    desc: "Upper Forest. The pines are thick here.",
    actions: { n: "1-4", s: "3-4", e: "2-5" },
  },
  "2-5": {
    desc: "Desert Entrance. Sand begins to swallow the grass.",
    actions: { w: "2-4", e: "2-6" },
  },
  "2-6": {
    desc: "The Scorchlands. The sun is unforgiving.",
    actions: { n: "1-6", w: "2-5", s: "3-6" },
    monsterChance: 0.5,
    monsterPool: [{ name: "Scorpion", hp: 12, attack: 8 }],
  },

  // row 3 - central lands
  "3-1": {
    desc: "Shadow Woods Entrance. The light fades quickly.",
    actions: { n: "2-1", e: "3-2", s: "4-1" },
  },
  "3-2": {
    desc: "Shadow Woods Deep. You feel watched.",
    actions: { n: "2-2", w: "3-1", e: "3-3" },
    monsterChance: 0.7,
    monsterPool: [{ name: "Wraith", hp: 20, attack: 10 }],
  },
  "3-3": {
    desc: "Overgrown Clearing. The center of the world.",
    actions: { n: "2-3", w: "3-2", s: "4-3", e: "3-4" },
    potionChance: 0.5,
    potionHeal: 10,
    isStart: true,
  },
  "3-4": {
    desc: "Lakeside Path. A beautiful view of the Great Lake to the south.",
    actions: { n: "2-4", w: "3-3", e: "3-5" },
  },
  "3-5": {
    desc: "The Dusty Road. Merchants used to travel here.",
    actions: { w: "3-4", e: "3-6", s: "4-5" },
  },
  "3-6": {
    desc: "Outlaw Camp. Rough men sit around a campfire.",
    actions: { n: "2-6", w: "3-5" },
    monsterChance: 1.0,
    monsterPool: [{ name: "Bandit", hp: 15, attack: 7 }],
  },

  // row 4 - the barriers
  "4-1": {
    desc: "Abandoned Mine Entrance. A dark hole in the earth.",
    actions: { n: "3-1", s: "5-1" },
    itemChance: 0.4,
    itemPool: [{ name: "Machete", attack: 9 }],
  },
  "4-2": {
    desc: "The Great Lake (West). The water is crystal clear.",
    actions: { s: "5-2" },
  },
  "4-3": {
    desc: "The Great Lake (East). You see fish jumping.",
    actions: { n: "3-3", s: "5-3" },
  },
  "4-4": { desc: "EMPTY", actions: {} },
  "4-5": {
    desc: "Red Canyon. High walls of crimson stone.",
    actions: { n: "3-5", s: "5-5", e: "4-6" },
  },
  "4-6": {
    desc: "Canyon Dead End. A skeleton holds a shiny object.",
    actions: { w: "4-5" },
    itemChance: 1.0,
    itemPool: [{ name: "Golden Compass", hp: 20 }],
  },

  // row 5 - lower valleys
  "5-1": {
    desc: "Deep Mine Shaft. It smells of sulfur.",
    actions: { n: "4-1", e: "5-2" },
    monsterChance: 0.8,
    monsterPool: [{ name: "Spider", hp: 10, attack: 5 }],
  },
  "5-2": {
    desc: "Wet Cavern. Water drips from the ceiling.",
    actions: { w: "5-1", n: "4-2", e: "5-3" },
  },
  "5-3": {
    desc: "Southern River Bank. A peaceful place to rest.",
    actions: { w: "5-2", n: "4-3", s: "6-3" },
    potionChance: 0.4,
    potionHeal: 15,
  },
  "5-4": {
    desc: "Jungle Fringe. Tropical birds chirp loudly.",
    actions: { e: "5-5", s: "6-4" },
  },
  "5-5": {
    desc: "The Muddy Trail. Watch your step.",
    actions: { n: "4-5", w: "5-4", e: "5-6" },
  },
  "5-6": {
    desc: "Trading Post. An old man sells wares.",
    actions: { w: "5-5", s: "6-6" },
    itemChance: 1.0,
    itemPool: [{ name: "Iron Shield", hp: 15 }],
  },

  // row 6 - the deep south
  "6-1": {
    desc: "Sunken Temple Entrance. Vines cover the stone.",
    actions: { e: "6-2" },
    monsterChance: 0.5,
    monsterPool: [{ name: "Snake", hp: 8, attack: 4 }],
  },
  "6-2": {
    desc: "Sacrificial Altar. An eerie silence hangs here.",
    actions: { w: "6-1", e: "6-3" },
    itemChance: 0.7,
    itemPool: [{ name: "Ritual Dagger", attack: 16 }],
  },
  "6-3": {
    desc: "Southern Marsh. Thick mud and tall grass.",
    actions: { w: "6-2", n: "5-3", e: "6-4" },
  },
  "6-4": {
    desc: "Deep Jungle. You need a machete to go further south.",
    actions: { w: "6-3", n: "5-4", e: "6-5", s: "7-4" },
    monsterChance: 0.8,
    monsterPool: [{ name: "Tiger", hp: 30, attack: 12 }],
  },
  "7-4": {
    desc: "The Hidden Temple. You hacked your way through the vines!",
    actions: { n: "6-4" },
    requiredItem: "Machete",
  },
  "6-5": {
    desc: "Hidden Waterfall. The mist is refreshing.",
    actions: { w: "6-4", e: "6-6" },
    potionChance: 0.6,
    potionHeal: 20,
  },
  "6-6": {
    desc: "South East Cape. The end of the world. You see the ocean.",
    actions: { w: "6-5", n: "5-6" },
  },
};

export default worldMap;
