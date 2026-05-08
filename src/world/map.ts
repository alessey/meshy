export default {
  woods: {
    desc: "You're in the middle of dark woods.",
    actions: { n: "tower", e: "path", s: "river" },
    potionChance: 0.25,
    potionHeal: 10,
  },
  tower: {
    desc: "You are at a stone tower, woods are to the south",
    actions: { s: "woods" },
    itemChance: 1,
    itemPool: [
      { name: "Sword", attack: 10 },
      { name: "Axe", attack: 8 },
    ],
  },
  path: {
    desc: "You are on a foggy path.",
    actions: { w: "woods", e: "cave" },
    monsterChance: 1,
    monsterPool: [
      { name: "Goblin", hp: 6, attack: 4 },
      { name: "Wolf", hp: 8, attack: 5 },
    ],
  },
  cave: {
    desc: "A dark cave with echoes. You see a glimmer in the shadows.",
    actions: { w: "path", n: "dungeon" },
    itemChance: 0.7,
    itemPool: [
      { name: "Mace", attack: 12 },
      { name: "Shield", attack: 6 },
    ],
    monsterChance: 0.5,
    monsterPool: [{ name: "Bear", hp: 20, attack: 6 }],
  },
  river: {
    desc: "A rushing river with a small bridge. The water looks refreshing.",
    actions: { n: "woods", e: "village" },
    potionChance: 0.5,
    potionHeal: 15,
  },
  village: {
    desc: "A quiet village with a few houses. People are going about their day.",
    actions: { w: "river", n: "forest", e: "shop" },
    itemChance: 0.3,
    itemPool: [{ name: "Mace", attack: 9 }],
  },
  forest: {
    desc: "A dense forest with tall trees. Sunlight filters through the leaves.",
    actions: { s: "village", e: "dungeon" },
    monsterChance: 0.4,
    monsterPool: [
      { name: "Spider", hp: 4, attack: 3 },
      { name: "Boar", hp: 12, attack: 5 },
    ],
    potionChance: 0.2,
    potionHeal: 12,
  },
  dungeon: {
    desc: "A foreboding dungeon entrance. Danger lurks within.",
    actions: { w: "forest", s: "cave" },
    monsterChance: 0.8,
    monsterPool: [
      { name: "Orc", hp: 10, attack: 7 },
      { name: "Troll", hp: 15, attack: 8 },
    ],
    itemChance: 0.4,
    itemPool: [
      { name: "Greatsword", attack: 15 },
      { name: "Armor", hp: 5 },
    ],
  },
  shop: {
    desc: "A small shop in the village. The shopkeeper offers wares.",
    actions: { w: "village" },
    itemChance: 0.9,
    itemPool: [
      { name: "Dagger", attack: 7 },
      { name: "Helmet", hp: 4 },
    ],
  },
};
