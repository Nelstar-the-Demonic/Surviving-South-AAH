import type {
  Background, Location, PlayerStats, Qualification,
  Job, GameState, NPC, Property, Vehicle, CropPlot, LivestockGroup, Business,
  Industry, IndustryExperience, JobChain, FormalEmployment,
} from '@/types/game';

// ─── Background Definitions ───────────────────────────────────────────────────
export const BACKGROUNDS: Record<Background, {
  label: string;
  description: string;
  startingLocation: Location;
  startingCash: number;
  startingStats: Partial<PlayerStats>;
  startingQualifications: Qualification[];
  startingSkills: string[];
}> = {
  unemployed_youth: {
    label: 'Unemployed Youth',
    description: 'Growing up in the village with nothing but dreams and determination.',
    startingLocation: 'Village',
    startingCash: 150,
    startingStats: { health: 80, hunger: 70, energy: 85, fitness: 70, hygiene: 60, stress: 30, happiness: 55, intelligence: 45, education: 20, reputation: 30 },
    startingQualifications: [],
    startingSkills: ['Basic Labour'],
  },
  college_dropout: {
    label: 'Former College Dropout',
    description: 'Started a qualification but life got in the way. You know more than most.',
    startingLocation: 'Township',
    startingCash: 400,
    startingStats: { health: 72, hunger: 65, energy: 75, fitness: 55, hygiene: 65, stress: 45, happiness: 48, intelligence: 58, education: 40, reputation: 35 },
    startingQualifications: ['Matric'],
    startingSkills: ['Communication', 'Basic Computer'],
  },
  unemployed_graduate: {
    label: 'Unemployed Graduate',
    description: 'Degree in hand but no job. Overqualified for some, underexperienced for others.',
    startingLocation: 'Suburb',
    startingCash: 800,
    startingStats: { health: 68, hunger: 60, energy: 65, fitness: 45, hygiene: 75, stress: 60, happiness: 40, intelligence: 78, education: 70, reputation: 45 },
    startingQualifications: ['Matric', 'Accounting Degree'],
    startingSkills: ['Accounting', 'Analysis', 'Communication'],
  },
  struggling_farmer: {
    label: 'Struggling Farmer',
    description: 'Working the land for generations. The farm is struggling but you know the soil.',
    startingLocation: 'Farm',
    startingCash: 1200,
    startingStats: { health: 78, hunger: 72, energy: 80, fitness: 78, hygiene: 55, stress: 50, happiness: 52, intelligence: 50, education: 25, reputation: 40 },
    startingQualifications: ['Matric'],
    startingSkills: ['Farming', 'Animal Care', 'Manual Labour'],
  },
  hustler: {
    label: 'Hustler',
    description: 'Street smart and resourceful. You know how to make a rand from nothing.',
    startingLocation: 'Township',
    startingCash: 550,
    startingStats: { health: 75, hunger: 68, energy: 78, fitness: 65, hygiene: 58, stress: 35, happiness: 60, intelligence: 55, education: 30, reputation: 50 },
    startingQualifications: ['Matric'],
    startingSkills: ['Negotiation', 'Street Smarts', 'Sales'],
  },
};

// ─── Shop Items ───────────────────────────────────────────────────────────────
export const SHOP_ITEMS = {
  food: [
    { id: 'pilchards_can', name: 'Pilchards (400g tin)', unit: 'tin', price: 18, hungerRestore: 35 },
    { id: 'tuna_can', name: 'Tuna (170g tin)', unit: 'tin', price: 22, hungerRestore: 28 },
    { id: 'chakalaka_can', name: 'Chakalaka (410g tin)', unit: 'tin', price: 14, hungerRestore: 20 },
    { id: 'viennas_pack', name: 'Viennas (500g pack)', unit: 'pack', price: 38, hungerRestore: 45 },
    { id: 'sausage_pack', name: 'Pork Sausages (500g)', unit: 'pack', price: 42, hungerRestore: 45 },
    { id: 'beef_kg', name: 'Beef Mince (1kg)', unit: 'kg', price: 85, hungerRestore: 80 },
    { id: 'mutton_kg', name: 'Mutton Chops (1kg)', unit: 'kg', price: 95, hungerRestore: 80 },
    { id: 'chicken_pieces', name: 'Chicken Pieces (1kg)', unit: 'kg', price: 48, hungerRestore: 70 },
    { id: 'braai_pack', name: 'Braai Pack (2kg)', unit: 'pack', price: 120, hungerRestore: 140 },
    { id: 'eggs_dozen', name: 'Eggs (1 dozen)', unit: 'dozen', price: 32, hungerRestore: 60 },
    { id: 'bread_loaf', name: 'White Bread (700g)', unit: 'loaf', price: 20, hungerRestore: 50 },
    { id: 'rice_2kg', name: 'Rice (2kg)', unit: 'bag', price: 35, hungerRestore: 100, portionsTotal: 6 },
    { id: 'maize_meal_5kg', name: 'Maize Meal (5kg)', unit: 'bag', price: 55, hungerRestore: 150, portionsTotal: 8 },
    { id: 'flour_2kg', name: 'Cake Flour (2kg)', unit: 'bag', price: 30, hungerRestore: 80, portionsTotal: 5 },
    { id: 'cooking_oil_2l', name: 'Cooking Oil (2L)', unit: 'bottle', price: 38, hungerRestore: 0, portionsTotal: 10 },
    { id: 'samp_1kg', name: 'Samp (1kg)', unit: 'bag', price: 18, hungerRestore: 70 },
    { id: 'beans_500g', name: 'Cowpeas/Beans (500g)', unit: 'bag', price: 15, hungerRestore: 55 },
    { id: 'noodles_5pack', name: '2-Minute Noodles (5-pack)', unit: 'pack', price: 25, hungerRestore: 60 },
    { id: 'chicken_mala', name: 'Chicken Mala (500g)', unit: 'pack', price: 22, hungerRestore: 35 },
    { id: 'chicken_feet', name: 'Chicken Feet (1kg)', unit: 'kg', price: 18, hungerRestore: 30 },
    { id: 'chicken_liver', name: 'Chicken Liver (500g)', unit: 'pack', price: 24, hungerRestore: 40 },
    { id: 'tinned_tomatoes', name: 'Tinned Tomatoes (410g)', unit: 'tin', price: 12, hungerRestore: 15 },
    { id: 'sugar_1kg', name: 'Sugar (1kg)', unit: 'bag', price: 22, hungerRestore: 10 },
    { id: 'salt_500g', name: 'Salt (500g)', unit: 'bag', price: 8, hungerRestore: 5 },
    { id: 'potatoes_kg', name: 'Potatoes (1kg)', unit: 'kg', price: 18, hungerRestore: 55 },
    { id: 'onions_kg', name: 'Onions (1kg)', unit: 'kg', price: 14, hungerRestore: 15 },
    { id: 'spinach_bunch', name: 'Spinach (bunch)', unit: 'bunch', price: 10, hungerRestore: 20 },
  ],
  hygiene: [
    { id: 'soap_bar', name: 'Sunlight Soap Bar', unit: 'bar', price: 8, hygieneRestore: 20 },
    { id: 'toothpaste', name: 'Colgate Toothpaste (75ml)', unit: 'tube', price: 22, hygieneRestore: 10 },
    { id: 'toothbrush', name: 'Toothbrush', unit: 'each', price: 12, hygieneRestore: 5 },
    { id: 'shampoo_200ml', name: 'Shampoo (200ml)', unit: 'bottle', price: 28, hygieneRestore: 25 },
    { id: 'body_spray', name: 'Body Spray (150ml)', unit: 'can', price: 35, hygieneRestore: 15 },
    { id: 'roll_on', name: 'Roll-On Deodorant', unit: 'each', price: 25, hygieneRestore: 12 },
    { id: 'lotion_400ml', name: 'Body Lotion (400ml)', unit: 'bottle', price: 45, hygieneRestore: 18 },
  ],
  clothing: [
    { id: 'clothes_casual', name: 'Casual Outfit', unit: 'set', price: 180 },
    { id: 'clothes_formal', name: 'Formal Outfit', unit: 'set', price: 380 },
    { id: 'clothes_workwear', name: 'Labour Workwear', unit: 'set', price: 220 },
  ],
  farmEquipment: [
    { id: 'hoe', name: 'Garden Hoe', unit: 'each', price: 95 },
    { id: 'spade', name: 'Spade', unit: 'each', price: 110 },
    { id: 'rake', name: 'Garden Rake', unit: 'each', price: 80 },
    { id: 'wheelbarrow', name: 'Wheelbarrow', unit: 'each', price: 480 },
    { id: 'sprayer', name: 'Knapsack Sprayer (15L)', unit: 'each', price: 320 },
    { id: 'irrigation_pipe', name: 'Irrigation Pipe (10m)', unit: 'roll', price: 145 },
    { id: 'water_tank', name: 'Water Tank (500L)', unit: 'each', price: 1200 },
    { id: 'plough', name: 'Hand Plough', unit: 'each', price: 650 },
  ],
  farmInputs: [
    { id: 'fertilizer_bag', name: 'Fertilizer (25kg bag)', unit: 'bag', price: 220 },
    { id: 'pesticide_bottle', name: 'Pesticide (1L)', unit: 'bottle', price: 85 },
    { id: 'herbicide_bottle', name: 'Herbicide (1L)', unit: 'bottle', price: 95 },
    { id: 'animal_feed_bag', name: 'Animal Feed (25kg bag)', unit: 'bag', price: 180 },
  ],
  livestock_medical: [
    { id: 'medkit_chicken', name: 'Chicken Medical Kit', unit: 'kit', price: 280, treatsLivestockType: 'Chicken', description: 'Treats sick or injured chickens. One kit per animal.' },
    { id: 'medkit_goat', name: 'Goat Medical Kit', unit: 'kit', price: 650, treatsLivestockType: 'Goat', description: 'Full treatment kit for sick or injured goats. One kit per animal.' },
    { id: 'medkit_cattle', name: 'Cattle Medical Kit', unit: 'kit', price: 1400, treatsLivestockType: 'Cattle', description: 'Comprehensive treatment for cattle illness and injuries. One kit per animal.' },
    { id: 'medkit_pig', name: 'Pig Medical Kit', unit: 'kit', price: 480, treatsLivestockType: 'Pig', description: 'Treats sick or injured pigs. One kit per animal.' },
  ],
  weapons: [
    { id: 'panga', name: 'Panga', unit: 'each', price: 180, isFirearm: false, crimeSuccessBonus: 8, description: 'Blade weapon. Effective in close-range crime.' },
    { id: 'knuckle_duster', name: 'Knuckle Duster', unit: 'each', price: 120, isFirearm: false, crimeSuccessBonus: 5, description: 'Melee weapon for street combat.' },
    { id: 'baton', name: 'Baton', unit: 'each', price: 95, isFirearm: false, crimeSuccessBonus: 4, description: 'Rubber baton. Reduces injury risk.' },
    { id: 'pistol_illegal', name: 'Illegal Pistol (.38)', unit: 'each', price: 3500, isFirearm: true, crimeSuccessBonus: 22, description: 'Illegal firearm. High crime success bonus but severe sentence if caught.' },
    { id: 'shotgun_illegal', name: 'Illegal Shotgun', unit: 'each', price: 5800, isFirearm: true, crimeSuccessBonus: 30, description: 'Illegal shotgun. Extremely dangerous to carry.' },
    { id: 'knife', name: 'Kitchen Knife', unit: 'each', price: 65, isFirearm: false, crimeSuccessBonus: 6, description: 'Common blade. Moderate bonus.' },
  ],
  drugs: [
    { id: 'tik', name: 'Tik (Crystal Meth)', unit: 'wrap', price: 80, drugType: 'tik', sellPrice: 150, description: 'Street drug. High addiction risk.' },
    { id: 'nyaope', name: 'Nyaope', unit: 'packet', price: 30, drugType: 'nyaope', sellPrice: 60, description: 'Dangerous street drug, highly addictive.' },
    { id: 'cocaine', name: 'Cocaine', unit: 'gram', price: 350, drugType: 'cocaine', sellPrice: 600, description: 'High-value stimulant.' },
    { id: 'ecstasy', name: 'Ecstasy (MDMA)', unit: 'tablet', price: 200, drugType: 'ecstasy', sellPrice: 380, description: 'Synthetic recreational drug.' },
    { id: 'cannabis', name: 'Cannabis (Weed)', unit: 'gram', price: 40, drugType: 'cannabis', sellPrice: 80, description: 'Cannabis. Legal to possess for personal use.' },
  ],
};

// ─── Recipes ──────────────────────────────────────────────────────────────────
export const RECIPES = [
  // ── Rice-based ────────────────────────────────────────────────────────────
  {
    id: 'rice_pilchards',
    name: 'Rice & Pilchards',
    description: 'A filling and affordable meal.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'pilchards_can', quantity: 1 }],
    hungerRestore: 65, happinessBonus: 5, cookingTime: 1,
  },
  {
    id: 'rice_eggs',
    name: 'Rice & Fried Eggs',
    description: 'Simple, nutritious, and quick.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'eggs_dozen', quantity: 0.25 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 55, happinessBonus: 3, cookingTime: 1,
  },
  {
    id: 'rice_farm_eggs',
    name: 'Rice & Farm Eggs',
    description: 'Fresh eggs from your own chickens.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'farm_eggs', quantity: 3 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 58, happinessBonus: 6, cookingTime: 1,
  },
  {
    id: 'rice_tuna',
    name: 'Rice & Tuna',
    description: 'Quick protein-packed meal.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'tuna_can', quantity: 1 }],
    hungerRestore: 60, happinessBonus: 4, cookingTime: 1,
  },
  {
    id: 'rice_chakalaka',
    name: 'Rice & Chakalaka',
    description: 'Spicy, satisfying and cheap.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'chakalaka_can', quantity: 1 }],
    hungerRestore: 55, happinessBonus: 6, cookingTime: 1,
  },
  {
    id: 'rice_beef',
    name: 'Beef Stew & Rice',
    description: 'Hearty beef stew served on rice.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'beef_kg', quantity: 0.3 }, { itemId: 'tinned_tomatoes', quantity: 1 }, { itemId: 'onions_kg', quantity: 0.2 }],
    hungerRestore: 90, happinessBonus: 15, cookingTime: 1,
  },
  {
    id: 'rice_mutton',
    name: 'Mutton Curry & Rice',
    description: 'Slow-cooked mutton with curry spices.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'mutton_kg', quantity: 0.3 }, { itemId: 'onions_kg', quantity: 0.2 }],
    hungerRestore: 95, happinessBonus: 18, cookingTime: 1,
  },
  {
    id: 'rice_chicken',
    name: 'Chicken & Rice',
    description: 'Classic staple. Chicken pieces on rice.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'chicken_pieces', quantity: 0.3 }],
    hungerRestore: 80, happinessBonus: 10, cookingTime: 1,
  },
  // ── Pap (Maize Meal) ──────────────────────────────────────────────────────
  {
    id: 'pap_pilchards',
    name: 'Pap & Pilchards',
    description: 'Classic township comfort food.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'pilchards_can', quantity: 1 }],
    hungerRestore: 70, happinessBonus: 8, cookingTime: 1,
  },
  {
    id: 'pap_liver',
    name: 'Pap & Chicken Liver',
    description: 'Rich and filling. Full of iron.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'chicken_liver', quantity: 1 }],
    hungerRestore: 75, happinessBonus: 10, cookingTime: 1,
  },
  {
    id: 'pap_sausage',
    name: 'Pap & Pork Sausage',
    description: 'Weekend treat — pap with boerewors.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'sausage_pack', quantity: 0.5 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 80, happinessBonus: 12, cookingTime: 1,
  },
  {
    id: 'pap_chakalaka',
    name: 'Pap & Chakalaka',
    description: 'Spicy beans with soft pap.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'chakalaka_can', quantity: 1 }],
    hungerRestore: 65, happinessBonus: 7, cookingTime: 1,
  },
  {
    id: 'pap_viennas',
    name: 'Pap & Viennas',
    description: 'Quick and filling. Township staple.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'viennas_pack', quantity: 0.5 }],
    hungerRestore: 72, happinessBonus: 10, cookingTime: 1,
  },
  {
    id: 'pap_mala',
    name: 'Pap & Walkie-Talkies',
    description: 'Chicken mala (heads & feet) with pap.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'chicken_mala', quantity: 1 }],
    hungerRestore: 68, happinessBonus: 8, cookingTime: 1,
  },
  {
    id: 'pap_feet',
    name: 'Pap & Chicken Feet',
    description: 'Walkie-talkies — a township delicacy.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'chicken_feet', quantity: 0.5 }],
    hungerRestore: 60, happinessBonus: 7, cookingTime: 1,
  },
  {
    id: 'pap_beef',
    name: 'Pap & Beef Stew',
    description: 'Soft pap with rich beef stew.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'beef_kg', quantity: 0.3 }, { itemId: 'tinned_tomatoes', quantity: 1 }],
    hungerRestore: 90, happinessBonus: 15, cookingTime: 1,
  },
  {
    id: 'pap_spinach',
    name: 'Pap & Spinach',
    description: 'Umngqusho-style greens and pap.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'spinach_bunch', quantity: 1 }],
    hungerRestore: 58, happinessBonus: 5, cookingTime: 1,
  },
  // ── Samp & Beans ─────────────────────────────────────────────────────────
  {
    id: 'samp_beans',
    name: 'Samp & Beans',
    description: 'Traditional isigwaqane — takes time but worth it.',
    ingredients: [{ itemId: 'samp_1kg', quantity: 0.3 }, { itemId: 'beans_500g', quantity: 1 }],
    hungerRestore: 90, happinessBonus: 15, cookingTime: 1,
  },
  {
    id: 'samp_oxtail',
    name: 'Samp & Beef',
    description: 'Samp simmered with tender beef.',
    ingredients: [{ itemId: 'samp_1kg', quantity: 0.3 }, { itemId: 'beef_kg', quantity: 0.3 }, { itemId: 'onions_kg', quantity: 0.2 }],
    hungerRestore: 95, happinessBonus: 18, cookingTime: 1,
  },
  // ── Bread ─────────────────────────────────────────────────────────────────
  {
    id: 'bread_eggs',
    name: 'Bread & Fried Eggs',
    description: 'A quick breakfast staple.',
    ingredients: [{ itemId: 'bread_loaf', quantity: 0.3 }, { itemId: 'eggs_dozen', quantity: 0.25 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 45, happinessBonus: 3, cookingTime: 1,
  },
  {
    id: 'bread_farm_eggs',
    name: 'Bread & Farm Eggs',
    description: 'Fresh farm eggs on fresh bread.',
    ingredients: [{ itemId: 'bread_loaf', quantity: 0.3 }, { itemId: 'farm_eggs', quantity: 2 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 48, happinessBonus: 5, cookingTime: 1,
  },
  {
    id: 'bread_pilchards',
    name: 'Pilchard Sandwich',
    description: 'Tin fish on bread. Quick and nutritious.',
    ingredients: [{ itemId: 'bread_loaf', quantity: 0.4 }, { itemId: 'pilchards_can', quantity: 1 }],
    hungerRestore: 50, happinessBonus: 4, cookingTime: 1,
  },
  {
    id: 'bread_viennas',
    name: 'Viennas on Bread',
    description: 'Pan-fried viennas on fresh bread.',
    ingredients: [{ itemId: 'bread_loaf', quantity: 0.4 }, { itemId: 'viennas_pack', quantity: 0.4 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 55, happinessBonus: 6, cookingTime: 1,
  },
  // ── Noodles ───────────────────────────────────────────────────────────────
  {
    id: 'noodles_egg',
    name: 'Noodles & Egg',
    description: 'Quick single-serve noodles with an egg cracked in.',
    ingredients: [{ itemId: 'noodles_5pack', quantity: 0.2 }, { itemId: 'eggs_dozen', quantity: 0.1 }],
    hungerRestore: 40, happinessBonus: 2, cookingTime: 1,
  },
  {
    id: 'noodles_viennas',
    name: 'Noodles & Viennas',
    description: 'The classic student meal.',
    ingredients: [{ itemId: 'noodles_5pack', quantity: 0.2 }, { itemId: 'viennas_pack', quantity: 0.3 }],
    hungerRestore: 50, happinessBonus: 4, cookingTime: 1,
  },
  {
    id: 'noodles_pilchards',
    name: 'Noodles & Pilchards',
    description: 'Affordable and filling.',
    ingredients: [{ itemId: 'noodles_5pack', quantity: 0.2 }, { itemId: 'pilchards_can', quantity: 1 }],
    hungerRestore: 52, happinessBonus: 3, cookingTime: 1,
  },
  // ── Flour-based ───────────────────────────────────────────────────────────
  {
    id: 'vetkoek_pilchards',
    name: 'Vetkoek & Pilchards',
    description: 'Fried dough stuffed with spicy pilchards.',
    ingredients: [{ itemId: 'flour_2kg', quantity: 1 }, { itemId: 'pilchards_can', quantity: 1 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 72, happinessBonus: 12, cookingTime: 1,
  },
  {
    id: 'vetkoek_mince',
    name: 'Vetkoek & Mince',
    description: 'Fried dough filled with seasoned beef mince.',
    ingredients: [{ itemId: 'flour_2kg', quantity: 1 }, { itemId: 'beef_kg', quantity: 0.2 }, { itemId: 'cooking_oil_2l', quantity: 1 }, { itemId: 'onions_kg', quantity: 0.2 }],
    hungerRestore: 85, happinessBonus: 16, cookingTime: 1,
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    description: 'Simple pancakes for a sweet treat.',
    ingredients: [{ itemId: 'flour_2kg', quantity: 1 }, { itemId: 'eggs_dozen', quantity: 0.2 }, { itemId: 'sugar_1kg', quantity: 0.1 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 45, happinessBonus: 10, cookingTime: 1,
  },
  // ── Milk-based ────────────────────────────────────────────────────────────
  {
    id: 'milk_porridge',
    name: 'Maize Porridge with Milk',
    description: 'Warm porridge with fresh farm milk.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'farm_milk', quantity: 0.5 }, { itemId: 'sugar_1kg', quantity: 0.1 }],
    hungerRestore: 60, happinessBonus: 10, cookingTime: 1,
  },
  {
    id: 'milk_tea',
    name: 'Milk Tea & Bread',
    description: 'A cup of tea with fresh milk and bread.',
    ingredients: [{ itemId: 'bread_loaf', quantity: 0.2 }, { itemId: 'farm_milk', quantity: 0.3 }, { itemId: 'sugar_1kg', quantity: 0.05 }],
    hungerRestore: 30, happinessBonus: 8, cookingTime: 1,
  },
  // ── Grills & Braai ────────────────────────────────────────────────────────
  {
    id: 'braai',
    name: 'Braai',
    description: 'South African BBQ. Meat on the fire.',
    ingredients: [{ itemId: 'braai_pack', quantity: 1 }],
    hungerRestore: 100, happinessBonus: 25, cookingTime: 1,
  },
  {
    id: 'potjie',
    name: 'Mutton Potjie',
    description: 'Slow-cooked potjie with mutton and potatoes.',
    ingredients: [{ itemId: 'mutton_kg', quantity: 0.5 }, { itemId: 'potatoes_kg', quantity: 0.5 }, { itemId: 'onions_kg', quantity: 0.3 }, { itemId: 'tinned_tomatoes', quantity: 1 }],
    hungerRestore: 110, happinessBonus: 22, cookingTime: 1,
  },
  // ── Vegetables ────────────────────────────────────────────────────────────
  {
    id: 'potato_stew',
    name: 'Potato & Bean Stew',
    description: 'Hearty vegetarian stew.',
    ingredients: [{ itemId: 'potatoes_kg', quantity: 0.5 }, { itemId: 'beans_500g', quantity: 0.5 }, { itemId: 'tinned_tomatoes', quantity: 1 }, { itemId: 'onions_kg', quantity: 0.2 }],
    hungerRestore: 70, happinessBonus: 8, cookingTime: 1,
  },
  {
    id: 'fried_potatoes',
    name: 'Fried Potatoes (Slap Chips)',
    description: 'Classic street food — chips fried in oil.',
    ingredients: [{ itemId: 'potatoes_kg', quantity: 0.5 }, { itemId: 'cooking_oil_2l', quantity: 1 }, { itemId: 'salt_500g', quantity: 0.05 }],
    hungerRestore: 55, happinessBonus: 8, cookingTime: 1,
  },
  {
    id: 'spinach_eggs',
    name: 'Spinach & Eggs',
    description: 'Sautéed spinach with scrambled eggs.',
    ingredients: [{ itemId: 'spinach_bunch', quantity: 1 }, { itemId: 'eggs_dozen', quantity: 0.25 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 45, happinessBonus: 6, cookingTime: 1,
  },
  {
    id: 'spinach_farm_eggs',
    name: 'Spinach & Farm Eggs',
    description: 'Sautéed spinach with fresh farm eggs.',
    ingredients: [{ itemId: 'spinach_bunch', quantity: 1 }, { itemId: 'farm_eggs', quantity: 3 }, { itemId: 'cooking_oil_2l', quantity: 1 }],
    hungerRestore: 48, happinessBonus: 8, cookingTime: 1,
  },
  // ── Tuna specials ────────────────────────────────────────────────────────
  {
    id: 'tuna_rice',
    name: 'Tuna Mayo Rice',
    description: 'Tuna mixed through rice — simple and filling.',
    ingredients: [{ itemId: 'rice_2kg', quantity: 1 }, { itemId: 'tuna_can', quantity: 1 }],
    hungerRestore: 62, happinessBonus: 5, cookingTime: 1,
  },
  {
    id: 'tuna_pap',
    name: 'Pap & Tuna',
    description: 'Tuna with soft pap. Quick protein meal.',
    ingredients: [{ itemId: 'maize_meal_5kg', quantity: 1 }, { itemId: 'tuna_can', quantity: 1 }],
    hungerRestore: 65, happinessBonus: 6, cookingTime: 1,
  },
];

// ─── Portioned Items (shop items consumed per portion) ────────────────────────
export const PORTIONED_ITEMS: Record<string, { portions: number }> = {
  rice_2kg:      { portions: 6 },
  maize_meal_5kg:{ portions: 8 },
  flour_2kg:     { portions: 5 },
  cooking_oil_2l:{ portions: 10 },
  samp_1kg:      { portions: 4 },
  beans_500g:    { portions: 4 },
  sugar_1kg:     { portions: 20 },
  salt_500g:     { portions: 30 },
  potatoes_kg:   { portions: 4 },
  onions_kg:     { portions: 6 },
};

// Recipes that use farm-produced items (eggs/milk). itemIds are virtual
// and matched against livestock_product inventory items by name.
export const FARM_INGREDIENT_MAP: Record<string, string[]> = {
  farm_eggs: ['Eggs (Farm)'],
  farm_milk: ['Goat Milk (Farm)', 'Cow Milk (Farm)'],
};

// ─── Education Courses ────────────────────────────────────────────────────────
export const EDUCATION_COURSES = [
  // Short Courses
  {
    id: 'sc_entrepreneurship',
    name: 'Entrepreneurship Short Course',
    institution: 'Short Course' as const,
    totalDays: 30,
    totalFee: 1500,
    dailyFee: 50,
    qualification: 'Short Course Entrepreneurship' as Qualification,
    studyPointsRequired: 200,
    description: 'Learn the basics of starting and running a business.',
    requiredQualifications: [] as Qualification[],
    unlocksJob: null,
  },
  {
    id: 'sc_farming',
    name: 'Agricultural Short Course',
    institution: 'Short Course' as const,
    totalDays: 30,
    totalFee: 1200,
    dailyFee: 40,
    qualification: 'Short Course Farming' as Qualification,
    studyPointsRequired: 180,
    description: 'Modern farming techniques and crop management.',
    requiredQualifications: [] as Qualification[],
    unlocksJob: null,
  },
  {
    id: 'sc_security',
    name: 'Security Officer Certificate',
    institution: 'Short Course' as const,
    totalDays: 21,
    totalFee: 900,
    dailyFee: 43,
    qualification: 'Security Certificate' as Qualification,
    studyPointsRequired: 120,
    description: 'PSIRA-registered security training.',
    requiredQualifications: [] as Qualification[],
    unlocksJob: 'Security Guard',
  },
  {
    id: 'sc_firstaid',
    name: 'First Aid Level 1',
    institution: 'Short Course' as const,
    totalDays: 5,
    totalFee: 350,
    dailyFee: 70,
    qualification: 'First Aid Certificate' as Qualification,
    studyPointsRequired: 30,
    description: 'Basic life-saving skills.',
    requiredQualifications: [] as Qualification[],
    unlocksJob: null,
  },
  {
    id: 'sc_bookkeeping',
    name: 'Bookkeeping Certificate',
    institution: 'Short Course' as const,
    totalDays: 45,
    totalFee: 2500,
    dailyFee: 56,
    qualification: 'Bookkeeping Certificate' as Qualification,
    studyPointsRequired: 300,
    description: 'Basic accounting for small businesses.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: null,
  },
  // TVET Courses
  {
    id: 'tvet_electrical',
    name: 'Electrical Engineering (TVET N3)',
    institution: 'TVET' as const,
    totalDays: 365,
    totalFee: 8000,
    dailyFee: 22,
    qualification: 'TVET Electrical' as Qualification,
    studyPointsRequired: 2000,
    description: 'Practical electrical installation and repair.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Electrician',
  },
  {
    id: 'tvet_policing',
    name: 'Policing Diploma (TVET)',
    institution: 'TVET' as const,
    totalDays: 365,
    totalFee: 9500,
    dailyFee: 26,
    qualification: 'Policing Diploma' as Qualification,
    studyPointsRequired: 2200,
    description: 'SAPS-accredited law enforcement training. Unlocks Police Constable career.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Police Constable',
  },
  {
    id: 'sc_police_basic',
    name: 'Police Basic Training (SAPS)',
    institution: 'Short Course' as const,
    totalDays: 120,
    totalFee: 0,
    dailyFee: 0,
    qualification: 'Police Basic Training' as Qualification,
    studyPointsRequired: 800,
    description: 'Government-funded SAPS basic training. Free for eligible recruits. Required to become Police Constable.',
    requiredQualifications: ['Policing Diploma'] as Qualification[],
    unlocksJob: 'Police Constable',
  },
  {
    id: 'sc_clerk',
    name: 'Office Administration Certificate',
    institution: 'Short Course' as const,
    totalDays: 60,
    totalFee: 3000,
    dailyFee: 50,
    qualification: 'Clerk Certificate' as Qualification,
    studyPointsRequired: 400,
    description: 'Administrative and clerical skills. Unlocks Clerk career.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Junior Clerk',
  },
  {
    id: 'tvet_business',
    name: 'Business Management (TVET)',
    institution: 'TVET' as const,
    totalDays: 365,
    totalFee: 7500,
    dailyFee: 21,
    qualification: 'TVET Business' as Qualification,
    studyPointsRequired: 2000,
    description: 'Foundational business and management skills.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: null,
  },
  {
    id: 'tvet_it',
    name: 'Information Technology (TVET)',
    institution: 'TVET' as const,
    totalDays: 365,
    totalFee: 8500,
    dailyFee: 23,
    qualification: 'TVET IT' as Qualification,
    studyPointsRequired: 2000,
    description: 'Computer hardware, networking, and software.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: null,
  },
  // University
  {
    id: 'uni_accounting',
    name: 'BCom Accounting (3 years)',
    institution: 'University' as const,
    totalDays: 1095,
    totalFee: 45000,
    dailyFee: 41,
    qualification: 'Accounting Degree' as Qualification,
    studyPointsRequired: 6000,
    description: 'Become a qualified accountant.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Junior Accountant',
  },
  {
    id: 'uni_teaching',
    name: 'BEd Teaching (4 years)',
    institution: 'University' as const,
    totalDays: 1460,
    totalFee: 60000,
    dailyFee: 41,
    qualification: 'Teaching Degree' as Qualification,
    studyPointsRequired: 8000,
    description: 'Qualify to teach at school level.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Junior Teacher',
  },
  {
    id: 'uni_engineering',
    name: 'BEng Engineering (4 years)',
    institution: 'University' as const,
    totalDays: 1460,
    totalFee: 75000,
    dailyFee: 51,
    qualification: 'Engineering Degree' as Qualification,
    studyPointsRequired: 9000,
    description: 'Become a professional engineer.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Junior Engineer',
  },
  {
    id: 'uni_mbchb',
    name: 'MBChB Medicine (6 years)',
    institution: 'University' as const,
    totalDays: 2190,
    totalFee: 150000,
    dailyFee: 68,
    qualification: 'MBChB' as Qualification,
    studyPointsRequired: 14000,
    description: 'Become a qualified medical doctor.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Junior Doctor',
  },
  {
    id: 'uni_nursing',
    name: 'Nursing Diploma (3 years)',
    institution: 'TVET' as const,
    totalDays: 1095,
    totalFee: 35000,
    dailyFee: 32,
    qualification: 'Nursing Diploma' as Qualification,
    studyPointsRequired: 5500,
    description: 'Become a qualified nurse.',
    requiredQualifications: ['Matric'] as Qualification[],
    unlocksJob: 'Enrolled Nurse',
  },
];

// ─── Job Promotion Chains ─────────────────────────────────────────────────────
export const JOB_CHAINS: JobChain[] = [
  {
    id: 'police',
    industry: 'Law Enforcement',
    payCycle: 'monthly',
    requiredQualification: 'Policing Diploma',
    type: 'formal',
    energyCost: 35,
    stressGain: 35,
    ranks: [
      { id: 'police_constable',       title: 'Police Constable',   monthlySalary: 8500,  daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'police_sergeant',        title: 'Police Sergeant',    monthlySalary: 12000, daysRequiredAtPreviousRank: 180, industryExpRequired: 50 },
      { id: 'warrant_officer',        title: 'Warrant Officer',    monthlySalary: 16500, daysRequiredAtPreviousRank: 365, industryExpRequired: 150 },
      { id: 'lieutenant',             title: 'Lieutenant',         monthlySalary: 22000, daysRequiredAtPreviousRank: 545, industryExpRequired: 300 },
      { id: 'station_commander',      title: 'Station Commander',  monthlySalary: 30000, daysRequiredAtPreviousRank: 730, industryExpRequired: 500 },
      { id: 'police_captain',         title: 'Police Captain',     monthlySalary: 42000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 800 },
      { id: 'police_minister',        title: 'Police Minister',    monthlySalary: 85000, daysRequiredAtPreviousRank: 1825, industryExpRequired: 1500 },
    ],
  },
  {
    id: 'doctor',
    industry: 'Healthcare',
    payCycle: 'monthly',
    requiredQualification: 'MBChB',
    type: 'formal',
    energyCost: 40,
    stressGain: 30,
    ranks: [
      { id: 'junior_doctor',          title: 'Junior Doctor',        monthlySalary: 28000, daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'medical_officer',        title: 'Medical Officer',      monthlySalary: 42000, daysRequiredAtPreviousRank: 365, industryExpRequired: 100 },
      { id: 'senior_medical_officer', title: 'Senior Medical Officer', monthlySalary: 58000, daysRequiredAtPreviousRank: 730, industryExpRequired: 250 },
      { id: 'specialist',             title: 'Specialist',           monthlySalary: 80000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 500 },
      { id: 'chief_specialist',       title: 'Chief Specialist',     monthlySalary: 105000, daysRequiredAtPreviousRank: 1460, industryExpRequired: 800 },
      { id: 'medical_director',       title: 'Medical Director',     monthlySalary: 145000, daysRequiredAtPreviousRank: 1825, industryExpRequired: 1200 },
    ],
  },
  {
    id: 'nurse',
    industry: 'Healthcare',
    payCycle: 'monthly',
    requiredQualification: 'Nursing Diploma',
    type: 'formal',
    energyCost: 35,
    stressGain: 28,
    ranks: [
      { id: 'enrolled_nurse',         title: 'Enrolled Nurse',       monthlySalary: 9500,  daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'staff_nurse',            title: 'Staff Nurse',          monthlySalary: 14000, daysRequiredAtPreviousRank: 365, industryExpRequired: 80 },
      { id: 'senior_nurse',           title: 'Senior Nurse',         monthlySalary: 19000, daysRequiredAtPreviousRank: 730, industryExpRequired: 200 },
      { id: 'nursing_manager',        title: 'Nursing Manager',      monthlySalary: 28000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 400 },
      { id: 'chief_nursing_officer',  title: 'Chief Nursing Officer', monthlySalary: 42000, daysRequiredAtPreviousRank: 1460, industryExpRequired: 700 },
    ],
  },
  {
    id: 'teacher',
    industry: 'Education',
    payCycle: 'monthly',
    requiredQualification: 'Teaching Degree',
    type: 'formal',
    energyCost: 30,
    stressGain: 20,
    ranks: [
      { id: 'junior_teacher',         title: 'Junior Teacher',            monthlySalary: 11000, daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'teacher',                title: 'Teacher',                   monthlySalary: 15000, daysRequiredAtPreviousRank: 365, industryExpRequired: 80 },
      { id: 'senior_teacher',         title: 'Senior Teacher',            monthlySalary: 20000, daysRequiredAtPreviousRank: 730, industryExpRequired: 200 },
      { id: 'head_of_department',     title: 'Head of Department',        monthlySalary: 27000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 400 },
      { id: 'deputy_principal',       title: 'Deputy Principal',          monthlySalary: 36000, daysRequiredAtPreviousRank: 1460, industryExpRequired: 700 },
      { id: 'principal',              title: 'Principal',                 monthlySalary: 48000, daysRequiredAtPreviousRank: 1825, industryExpRequired: 1000 },
      { id: 'district_education_officer', title: 'District Education Officer', monthlySalary: 72000, daysRequiredAtPreviousRank: 2555, industryExpRequired: 1500 },
    ],
  },
  {
    id: 'accountant',
    industry: 'Finance',
    payCycle: 'monthly',
    requiredQualification: 'Accounting Degree',
    type: 'formal',
    energyCost: 25,
    stressGain: 20,
    ranks: [
      { id: 'junior_accountant',      title: 'Junior Accountant',    monthlySalary: 14000, daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'accountant',             title: 'Accountant',           monthlySalary: 22000, daysRequiredAtPreviousRank: 365, industryExpRequired: 80 },
      { id: 'senior_accountant',      title: 'Senior Accountant',    monthlySalary: 32000, daysRequiredAtPreviousRank: 730, industryExpRequired: 200 },
      { id: 'financial_manager',      title: 'Financial Manager',    monthlySalary: 52000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 400 },
      { id: 'cfo',                    title: 'Chief Financial Officer', monthlySalary: 95000, daysRequiredAtPreviousRank: 1460, industryExpRequired: 800 },
    ],
  },
  {
    id: 'engineer',
    industry: 'Engineering',
    payCycle: 'monthly',
    requiredQualification: 'Engineering Degree',
    type: 'formal',
    energyCost: 30,
    stressGain: 22,
    ranks: [
      { id: 'junior_engineer',        title: 'Junior Engineer',      monthlySalary: 18000, daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'engineer',               title: 'Engineer',             monthlySalary: 28000, daysRequiredAtPreviousRank: 365, industryExpRequired: 80 },
      { id: 'senior_engineer',        title: 'Senior Engineer',      monthlySalary: 42000, daysRequiredAtPreviousRank: 730, industryExpRequired: 200 },
      { id: 'principal_engineer',     title: 'Principal Engineer',   monthlySalary: 60000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 400 },
      { id: 'chief_engineer',         title: 'Chief Engineer',       monthlySalary: 82000, daysRequiredAtPreviousRank: 1460, industryExpRequired: 700 },
      { id: 'engineering_director',   title: 'Engineering Director', monthlySalary: 120000, daysRequiredAtPreviousRank: 1825, industryExpRequired: 1200 },
    ],
  },
  {
    id: 'clerk',
    industry: 'Finance',
    payCycle: 'biweekly',
    requiredQualification: 'Clerk Certificate',
    type: 'formal',
    energyCost: 20,
    stressGain: 15,
    ranks: [
      { id: 'junior_clerk',           title: 'Junior Clerk',         monthlySalary: 5500,  daysRequiredAtPreviousRank: 0,   industryExpRequired: 0 },
      { id: 'clerk',                  title: 'Clerk',                monthlySalary: 8000,  daysRequiredAtPreviousRank: 180, industryExpRequired: 40 },
      { id: 'senior_clerk',           title: 'Senior Clerk',         monthlySalary: 12000, daysRequiredAtPreviousRank: 365, industryExpRequired: 120 },
      { id: 'supervisor',             title: 'Supervisor',           monthlySalary: 18000, daysRequiredAtPreviousRank: 730, industryExpRequired: 250 },
      { id: 'manager',                title: 'Manager',              monthlySalary: 28000, daysRequiredAtPreviousRank: 1095, industryExpRequired: 450 },
    ],
  },
];

// Helper: get chain by id
export function getJobChain(chainId: string): JobChain | undefined {
  return JOB_CHAINS.find(c => c.id === chainId);
}

// Helper: get current rank title from FormalEmployment
export function getCurrentRankTitle(emp: FormalEmployment): string {
  const chain = getJobChain(emp.chainId);
  if (!chain) return 'Unknown';
  return chain.ranks[emp.rankIndex]?.title ?? 'Unknown';
}

// Helper: get current monthly salary
export function getCurrentSalary(emp: FormalEmployment): number {
  const chain = getJobChain(emp.chainId);
  if (!chain) return 0;
  return chain.ranks[emp.rankIndex]?.monthlySalary ?? 0;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const AVAILABLE_JOBS: Job[] = [
  // Informal
  { id: 'gardener',      title: 'Gardener',              type: 'informal', industry: 'Agriculture', dailyIncome: 180, requiredQualifications: [],                             requiredLocation: ['Suburb', 'Town', 'City'],                              energyCost: 40, stressGain: 10 },
  { id: 'domestic',      title: 'Domestic Worker',       type: 'informal', industry: 'Services',    dailyIncome: 160, requiredQualifications: [],                             requiredLocation: ['Suburb', 'Town', 'City'],                              energyCost: 40, stressGain: 15 },
  { id: 'piece_job',     title: 'Piece Job',             type: 'informal', industry: 'Construction', dailyIncome: 120, requiredQualifications: [],                            requiredLocation: [],                                                      energyCost: 50, stressGain: 15 },
  { id: 'car_wash',      title: 'Car Wash Attendant',    type: 'informal', industry: 'Services',    dailyIncome: 150, requiredQualifications: [],                             requiredLocation: ['Township', 'Town', 'Suburb', 'City'],                  energyCost: 45, stressGain: 10 },
  { id: 'street_vendor', title: 'Street Vendor',         type: 'informal', industry: 'Retail',      dailyIncome: 130, requiredQualifications: [],                             requiredLocation: ['Township', 'Town', 'City', 'Informal Settlement'],     energyCost: 40, stressGain: 20 },
  { id: 'construction',  title: 'Construction Labourer', type: 'informal', industry: 'Construction', dailyIncome: 220, requiredQualifications: [],                            requiredLocation: ['Township', 'Town', 'City', 'Suburb'],                  energyCost: 60, stressGain: 20 },
  { id: 'farm_labour',   title: 'Farm Labourer',         type: 'informal', industry: 'Agriculture', dailyIncome: 140, requiredQualifications: [],                             requiredLocation: ['Village', 'Farm', 'Town'],                             energyCost: 55, stressGain: 15 },
  { id: 'security',      title: 'Security Guard',        type: 'informal', industry: 'Services',    dailyIncome: 200, requiredQualifications: ['Security Certificate'],        requiredLocation: ['Township', 'Town', 'Suburb', 'City'],                  energyCost: 30, stressGain: 25 },
  // Hustles
  { id: 'reselling',     title: 'Reseller',              type: 'hustle',   industry: 'Retail',      dailyIncome: 160, requiredQualifications: [],                             requiredLocation: [],                                                      energyCost: 35, stressGain: 12 },
  { id: 'spaza_trade',   title: 'Spaza Trader',          type: 'hustle',   industry: 'Retail',      dailyIncome: 200, requiredQualifications: [],                             requiredLocation: ['Village', 'Township', 'Informal Settlement', 'Town'],   energyCost: 35, stressGain: 12 },
  { id: 'food_sales',    title: 'Food Seller',           type: 'hustle',   industry: 'Services',    dailyIncome: 180, requiredQualifications: [],                             requiredLocation: ['Township', 'Town', 'Informal Settlement'],             energyCost: 40, stressGain: 10 },
  { id: 'transport',     title: 'Transport Operator',    type: 'hustle',   industry: 'Transport',   dailyIncome: 350, requiredQualifications: ['Drivers Licence'],             requiredLocation: ['Township', 'Town', 'City'],                            energyCost: 45, stressGain: 20 },
];

// ─── Business Definitions ─────────────────────────────────────────────────────
export const BUSINESS_DEFINITIONS = [
  {
    type: 'Spaza Shop' as const,
    industry: 'Retail' as Industry,
    capitalRequired: 5000,
    licenceCost: 800,
    registrationCost: 500,
    baseDailyIncome: 300,
    description: 'Small neighbourhood convenience shop.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Village', 'Township', 'Informal Settlement', 'Town'] as Location[],
  },
  {
    type: 'Tuck Shop' as const,
    industry: 'Retail' as Industry,
    capitalRequired: 2500,
    licenceCost: 400,
    registrationCost: 300,
    baseDailyIncome: 150,
    description: 'Small home-based tuck shop selling snacks and essentials.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Village', 'Township', 'Informal Settlement'] as Location[],
  },
  {
    type: 'Internet Cafe' as const,
    industry: 'Technology' as Industry,
    capitalRequired: 12000,
    licenceCost: 1200,
    registrationCost: 800,
    baseDailyIncome: 450,
    description: 'Computer and internet access for the community.',
    requiredQualifications: ['TVET IT'] as Qualification[],
    availableLocations: ['Township', 'Town', 'Suburb', 'City'] as Location[],
  },
  {
    type: 'Car Wash' as const,
    industry: 'Services' as Industry,
    capitalRequired: 3500,
    licenceCost: 600,
    registrationCost: 400,
    baseDailyIncome: 280,
    description: 'Roadside car wash service.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Township', 'Town', 'Suburb', 'City'] as Location[],
  },
  {
    type: 'Salon' as const,
    industry: 'Services' as Industry,
    capitalRequired: 8000,
    licenceCost: 800,
    registrationCost: 500,
    baseDailyIncome: 380,
    description: 'Hair salon servicing men and women.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Township', 'Town', 'Suburb', 'City'] as Location[],
  },
  {
    type: 'Taxi Business' as const,
    industry: 'Transport' as Industry,
    capitalRequired: 180000,
    licenceCost: 5000,
    registrationCost: 3000,
    baseDailyIncome: 1200,
    description: 'Minibus taxi route operation.',
    requiredQualifications: ['Code 14 (Heavy Vehicle)'] as Qualification[],
    availableLocations: ['Township', 'Town', 'City'] as Location[],
  },
  {
    type: 'Construction Company' as const,
    industry: 'Construction' as Industry,
    capitalRequired: 25000,
    licenceCost: 2500,
    registrationCost: 2000,
    baseDailyIncome: 800,
    description: 'Small construction and renovation contractor.',
    requiredQualifications: ['TVET Electrical', 'Matric'] as Qualification[],
    availableLocations: ['Township', 'Town', 'Suburb', 'City'] as Location[],
  },
  {
    type: 'Farm Supply Store' as const,
    industry: 'Agriculture' as Industry,
    capitalRequired: 18000,
    licenceCost: 1500,
    registrationCost: 1000,
    baseDailyIncome: 550,
    description: 'Supply seeds, fertilizer, and equipment to farmers.',
    requiredQualifications: ['Short Course Farming'] as Qualification[],
    availableLocations: ['Village', 'Farm', 'Town'] as Location[],
  },
  {
    type: 'Tavern' as const,
    industry: 'Services' as Industry,
    capitalRequired: 35000,
    licenceCost: 3000,
    registrationCost: 2000,
    baseDailyIncome: 900,
    description: 'Township tavern serving alcohol and food. Requires Liquor Licence.',
    requiredQualifications: ['Liquor Licence'] as Qualification[],
    availableLocations: ['Township', 'Village', 'Town'] as Location[],
  },
  {
    type: 'Nightclub' as const,
    industry: 'Services' as Industry,
    capitalRequired: 85000,
    licenceCost: 5000,
    registrationCost: 3000,
    baseDailyIncome: 2200,
    description: 'Entertainment nightclub serving alcohol. Requires Liquor Licence.',
    requiredQualifications: ['Liquor Licence'] as Qualification[],
    availableLocations: ['City', 'Suburb', 'Town'] as Location[],
  },
  {
    type: 'Liquor Store' as const,
    industry: 'Retail' as Industry,
    capitalRequired: 55000,
    licenceCost: 4500,
    registrationCost: 2500,
    baseDailyIncome: 1400,
    description: 'Off-licence liquor retail. Requires Liquor Licence + retail experience.',
    requiredQualifications: ['Liquor Licence', 'Short Course Entrepreneurship'] as Qualification[],
    availableLocations: ['Township', 'Town', 'Suburb', 'City'] as Location[],
  },
  {
    type: 'Cannabis Business' as const,
    industry: 'Crime' as Industry,
    capitalRequired: 20000,
    licenceCost: 0,
    registrationCost: 0,
    baseDailyIncome: 1800,
    description: '🌿 Illegal cannabis grow operation. High income, high risk. Requires cannabis inventory.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Farm', 'Village', 'Township', 'Informal Settlement'] as Location[],
  },
  {
    type: 'Drug Business' as const,
    industry: 'Crime' as Industry,
    capitalRequired: 35000,
    licenceCost: 0,
    registrationCost: 0,
    baseDailyIncome: 3500,
    description: '💊 Underground drug distribution. Very high income. Requires drug inventory.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Township', 'City', 'Informal Settlement'] as Location[],
  },
  {
    type: 'Shebeen' as const,
    industry: 'Crime' as Industry,
    capitalRequired: 12000,
    licenceCost: 0,
    registrationCost: 0,
    baseDailyIncome: 1100,
    description: '🍺 Unlicensed home tavern selling homebrew & moonshine. Lower risk than drugs. Requires alcohol inventory.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Informal Settlement', 'Village', 'Farm', 'Township'] as Location[],
  },
  {
    type: 'Butchery' as const,
    industry: 'Retail' as Industry,
    capitalRequired: 28000,
    licenceCost: 2000,
    registrationCost: 1500,
    baseDailyIncome: 1200,
    description: '🥩 Fresh meat retail. Requires meat inventory from your livestock.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Township', 'Town', 'Suburb', 'City'] as Location[],
  },
  {
    type: 'Dairy' as const,
    industry: 'Agriculture' as Industry,
    capitalRequired: 22000,
    licenceCost: 1500,
    registrationCost: 1000,
    baseDailyIncome: 900,
    description: '🥛 Dairy product sales. Requires milk inventory from your cattle or goats.',
    requiredQualifications: [] as Qualification[],
    availableLocations: ['Farm', 'Village', 'Town'] as Location[],
  },
  {
    type: 'Logistics Company' as const,
    industry: 'Transport' as Industry,
    capitalRequired: 120000,
    licenceCost: 5000,
    registrationCost: 3000,
    baseDailyIncome: 2800,
    description: '🚛 Freight and logistics. Requires trucks or delivery vans. Income scales with fleet size.',
    requiredQualifications: ['Code 14 (Heavy Vehicle)'] as Qualification[],
    availableLocations: ['Town', 'Suburb', 'City'] as Location[],
  },
];

// ─── Crops ────────────────────────────────────────────────────────────────────
export const CROP_DEFINITIONS: Record<string, {
  name: string;
  icon: string;
  seedCost: number;
  daysToHarvest: number;
  yieldKg: number;
  sellPricePerKg: number;
  harvestItemId: string; // inventory item id for the harvested crop
}> = {
  Maize:      { name: 'Maize',      icon: '🌽', seedCost: 45,  daysToHarvest: 90,  yieldKg: 80,  sellPricePerKg: 3.5,  harvestItemId: 'harvest_maize' },
  Spinach:    { name: 'Spinach',    icon: '🥬', seedCost: 25,  daysToHarvest: 40,  yieldKg: 20,  sellPricePerKg: 8,    harvestItemId: 'harvest_spinach' },
  Cabbage:    { name: 'Cabbage',    icon: '🥦', seedCost: 30,  daysToHarvest: 60,  yieldKg: 40,  sellPricePerKg: 6,    harvestItemId: 'harvest_cabbage' },
  Potatoes:   { name: 'Potatoes',   icon: '🥔', seedCost: 55,  daysToHarvest: 80,  yieldKg: 60,  sellPricePerKg: 5,    harvestItemId: 'harvest_potatoes' },
  Tomatoes:   { name: 'Tomatoes',   icon: '🍅', seedCost: 40,  daysToHarvest: 75,  yieldKg: 35,  sellPricePerKg: 12,   harvestItemId: 'harvest_tomatoes' },
  Onions:     { name: 'Onions',     icon: '🧅', seedCost: 35,  daysToHarvest: 120, yieldKg: 50,  sellPricePerKg: 7,    harvestItemId: 'harvest_onions' },
  Carrots:    { name: 'Carrots',    icon: '🥕', seedCost: 28,  daysToHarvest: 70,  yieldKg: 30,  sellPricePerKg: 8,    harvestItemId: 'harvest_carrots' },
  Beetroot:   { name: 'Beetroot',   icon: '🫚', seedCost: 22,  daysToHarvest: 60,  yieldKg: 25,  sellPricePerKg: 7,    harvestItemId: 'harvest_beetroot' },
  Peppers:    { name: 'Peppers',    icon: '🫑', seedCost: 45,  daysToHarvest: 80,  yieldKg: 20,  sellPricePerKg: 18,   harvestItemId: 'harvest_peppers' },
  Chillies:   { name: 'Chillies',   icon: '🌶️', seedCost: 35,  daysToHarvest: 90,  yieldKg: 12,  sellPricePerKg: 25,   harvestItemId: 'harvest_chillies' },
  Cucumber:   { name: 'Cucumber',   icon: '🥒', seedCost: 30,  daysToHarvest: 55,  yieldKg: 30,  sellPricePerKg: 10,   harvestItemId: 'harvest_cucumber' },
  Butternut:  { name: 'Butternut',  icon: '🎃', seedCost: 38,  daysToHarvest: 90,  yieldKg: 40,  sellPricePerKg: 9,    harvestItemId: 'harvest_butternut' },
  Watermelon: { name: 'Watermelon', icon: '🍉', seedCost: 40,  daysToHarvest: 80,  yieldKg: 60,  sellPricePerKg: 4,    harvestItemId: 'harvest_watermelon' },
  Cannabis:   { name: 'Cannabis',   icon: '🌿', seedCost: 800, daysToHarvest: 70,  yieldKg: 1.5, sellPricePerKg: 600,  harvestItemId: 'harvest_cannabis' },
};

// ─── Livestock ────────────────────────────────────────────────────────────────
export const LIVESTOCK_DEFINITIONS = {
  Chicken: {
    buyCost: 80, sellPrice: 120, meatKg: 1.5, meatValue: 35, breedDays: 21,
    meatSellPricePerKg: 48, milkSellPricePerL: 0,
    eggsPerDay: { min: 3, max: 7 }, hatchChance: 0.05,
    needsPregnancy: false, milkLPerDay: 0,
    litterMin: 0, litterMax: 0,
    twinChance: 0,
  },
  Goat: {
    buyCost: 800, sellPrice: 1200, meatKg: 15, meatValue: 28, breedDays: 150,
    meatSellPricePerKg: 65, milkSellPricePerL: 22,
    eggsPerDay: { min: 0, max: 0 }, hatchChance: 0,
    needsPregnancy: true, milkLPerDay: { min: 5, max: 8 },
    litterMin: 1, litterMax: 2, twinChance: 0.15,
  },
  Cattle: {
    buyCost: 6000, sellPrice: 9000, meatKg: 200, meatValue: 45, breedDays: 270,
    meatSellPricePerKg: 85, milkSellPricePerL: 18,
    eggsPerDay: { min: 0, max: 0 }, hatchChance: 0,
    needsPregnancy: true, milkLPerDay: { min: 15, max: 25 },
    litterMin: 1, litterMax: 1, twinChance: 0,
  },
  Pig: {
    buyCost: 1200, sellPrice: 1800, meatKg: 60, meatValue: 35, breedDays: 114,
    meatSellPricePerKg: 55, milkSellPricePerL: 0,
    eggsPerDay: { min: 0, max: 0 }, hatchChance: 0,
    needsPregnancy: true, milkLPerDay: 0,
    litterMin: 3, litterMax: 12, twinChance: 0,
  },
};

// ─── Properties ───────────────────────────────────────────────────────────────
export const PROPERTY_DEFINITIONS = [
  {
    type: 'Shack' as const,
    rentMonthly: 350,
    purchasePrice: 3200,   // one-off build cost
    canBuy: true,
    storageSlots: 5,
    comfortBonus: 5,
    availableLocations: ['Informal Settlement', 'Township'] as Location[],
    description: 'Basic corrugated iron shelter. R3 200 to build (once-off).',
  },
  {
    type: 'RDP House' as const,
    rentMonthly: 640,
    purchasePrice: 1200,
    canBuy: true,
    storageSlots: 15,
    comfortBonus: 25,
    availableLocations: ['Township', 'Village'] as Location[],
    description: 'Government-subsidised housing. R1 200 to own.',
  },
  {
    type: 'Village House' as const,
    rentMonthly: 600,
    purchasePrice: 85000,
    canBuy: true,
    storageSlots: 20,
    comfortBonus: 30,
    availableLocations: ['Village'] as Location[],
    description: 'Traditional brick house in the village.',
  },
  {
    type: 'Townhouse' as const,
    rentMonthly: 4500,
    purchasePrice: 480000,
    canBuy: true,
    storageSlots: 30,
    comfortBonus: 55,
    availableLocations: ['Town', 'Suburb'] as Location[],
    description: 'Modern sectional title townhouse.',
  },
  {
    type: 'Suburban House' as const,
    rentMonthly: 8000,
    purchasePrice: 950000,
    canBuy: true,
    storageSlots: 50,
    comfortBonus: 75,
    availableLocations: ['Suburb', 'City'] as Location[],
    description: 'Freestanding house in the suburbs.',
  },
  {
    type: 'Farm' as const,
    rentMonthly: 3500,
    purchasePrice: 850000,
    canBuy: true,
    storageSlots: 100,
    comfortBonus: 45,
    availableLocations: ['Farm', 'Village'] as Location[],
    description: 'Working farm with arable land.',
  },
  {
    type: 'Apartment' as const,
    rentMonthly: 5500,
    purchasePrice: 620000,
    canBuy: true,
    storageSlots: 20,
    comfortBonus: 60,
    availableLocations: ['City', 'Town'] as Location[],
    description: 'Secure apartment in a complex.',
  },
];

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const VEHICLE_DEFINITIONS = [
  { type: 'Bicycle' as const,          icon: '🚲', price: 1800,   requiredLicence: null,                                            description: 'Non-motorised transport. Delivery speed bonus.',                       speedBonus: 10, incomeBonus: 0,  farmBonus: 0,  taxiIncome: 0,   logisticsBonus: 0 },
  { type: 'Motorcycle' as const,        icon: '🏍️', price: 22000,  requiredLicence: 'Motorcycle Licence' as Qualification,           description: 'Fast commuter. +R80/day delivery income bonus.',                       speedBonus: 40, incomeBonus: 80, farmBonus: 0,  taxiIncome: 0,   logisticsBonus: 0 },
  { type: 'Car' as const,              icon: '🚗', price: 95000,  requiredLicence: 'Drivers Licence' as Qualification,              description: 'Standard sedan. Opens employment opportunities.',                      speedBonus: 60, incomeBonus: 0,  farmBonus: 0,  taxiIncome: 0,   logisticsBonus: 0 },
  { type: 'Bakkie' as const,           icon: '🛻', price: 185000, requiredLicence: 'Drivers Licence' as Qualification,              description: 'Bakkie gives +25% farm harvest bonus.',                               speedBonus: 55, incomeBonus: 0,  farmBonus: 25, taxiIncome: 0,   logisticsBonus: 0 },
  { type: 'Light Delivery Van' as const, icon: '🚐', price: 140000, requiredLicence: 'Code 10 (Light Delivery)' as Qualification,   description: 'Light van. +R200/day logistics income.',                              speedBonus: 50, incomeBonus: 0,  farmBonus: 0,  taxiIncome: 0,   logisticsBonus: 200 },
  { type: 'Minibus Taxi' as const,     icon: '🚌', price: 280000, requiredLicence: 'Code 14 (Heavy Vehicle)' as Qualification,      description: '15-seater minibus. Required for Taxi Business (+R450/day per taxi).', speedBonus: 50, incomeBonus: 0,  farmBonus: 0,  taxiIncome: 450, logisticsBonus: 0 },
  { type: 'Truck' as const,            icon: '🚚', price: 450000, requiredLicence: 'Code 14 (Heavy Vehicle)' as Qualification,      description: 'Heavy goods truck. +R600/day logistics income.',                       speedBonus: 45, incomeBonus: 0,  farmBonus: 0,  taxiIncome: 0,   logisticsBonus: 600 },
];

// ─── Orchard / Fruit Tree Definitions ────────────────────────────────────────
export const ORCHARD_DEFINITIONS: Record<string, { name: string; icon: string; matureAfterDays: number; harvestIntervalDays: number; yieldKg: number; pricePerPlot: number; sellPricePerKg: number }> = {
  'Apple Tree':  { name: 'Apple Tree',  icon: '🍎', matureAfterDays: 90,  harvestIntervalDays: 60, yieldKg: 25, pricePerPlot: 2200, sellPricePerKg: 18 },
  'Orange Tree': { name: 'Orange Tree', icon: '🍊', matureAfterDays: 90,  harvestIntervalDays: 60, yieldKg: 30, pricePerPlot: 2000, sellPricePerKg: 14 },
  'Peach Tree':  { name: 'Peach Tree',  icon: '🍑', matureAfterDays: 75,  harvestIntervalDays: 45, yieldKg: 20, pricePerPlot: 1800, sellPricePerKg: 22 },
  'Pear Tree':   { name: 'Pear Tree',   icon: '🍐', matureAfterDays: 100, harvestIntervalDays: 70, yieldKg: 22, pricePerPlot: 2400, sellPricePerKg: 20 },
};

// ─── Licence Definitions ──────────────────────────────────────────────────────
export const LICENCE_DEFINITIONS = [
  {
    id: 'drivers_licence',
    name: "Driver's Licence (Code 8)",
    qualification: 'Drivers Licence' as Qualification,
    cost: 1750,  // was 3500 → 50% off
    processingDays: 14,
    description: 'Standard motor vehicle licence.',
    requiredAge: 18,
  },
  {
    id: 'code10_licence',
    name: 'Code 10 Licence (Light Delivery)',
    qualification: 'Code 10 (Light Delivery)' as Qualification,
    cost: 1750,  // 50% off
    processingDays: 14,
    description: 'Light delivery vehicles, minibuses up to 3.5t.',
    requiredAge: 18,
  },
  {
    id: 'motorcycle_licence',
    name: 'Motorcycle Licence (Code A)',
    qualification: 'Motorcycle Licence' as Qualification,
    cost: 1400,  // was 2800 → 50% off
    processingDays: 10,
    description: 'Motorcycle and scooter licence.',
    requiredAge: 16,
  },
  {
    id: 'code14_licence',
    name: 'Heavy Vehicle Licence (Code 14)',
    qualification: 'Code 14 (Heavy Vehicle)' as Qualification,
    cost: 3250,  // was 6500 → 50% off
    processingDays: 21,
    description: 'Trucks, taxis, and heavy vehicles.',
    requiredAge: 21,
  },
  {
    id: 'liquor_licence',
    name: 'Liquor Licence',
    qualification: 'Liquor Licence' as Qualification,
    cost: 4500,
    processingDays: 30,
    description: 'Required for taverns, nightclubs, and liquor stores.',
    requiredAge: 18,
  },
];

// ─── Scholarships ─────────────────────────────────────────────────────────────
export const SCHOLARSHIPS = [
  {
    id: 'nsfas',
    name: 'NSFAS Grant',
    description: 'National Student Financial Aid Scheme. Covers 80% of tuition for qualifying students.',
    discountPct: 80,
    eligibleInstitutions: ['University', 'TVET'] as ('University' | 'TVET' | 'Short Course')[],
    requiresMatric: true,
    maxCashBalance: 5000,
  },
  {
    id: 'seta_grant',
    name: 'SETA Skills Grant',
    description: 'Sector Education and Training Authority grant. 50% off TVET and short courses.',
    discountPct: 50,
    eligibleInstitutions: ['TVET', 'Short Course'] as ('University' | 'TVET' | 'Short Course')[],
    requiresMatric: false,
    maxCashBalance: 10000,
  },
  {
    id: 'merit_bursary',
    name: 'Merit Bursary',
    description: 'Academic merit bursary. 30% discount on any institution for high-intelligence players.',
    discountPct: 30,
    eligibleInstitutions: ['University', 'TVET', 'Short Course'] as ('University' | 'TVET' | 'Short Course')[],
    requiresMatric: true,
    minIntelligence: 75,
    maxCashBalance: 50000,
  },
];

// ─── Default NPCs ─────────────────────────────────────────────────────────────
export function getDefaultNPCs(gender: 'Male' | 'Female'): NPC[] {
  return [
    {
      id: 'mother',
      name: 'Mama',
      role: 'Mother',
      age: 50,
      npcBackground: 'family',
      relationshipLevel: 75,
      trust: 80,
      friendship: 70,
      conflict: 5,
      isPartner: false,
      romanticStage: 'none',
      canOffer: ['advice', 'food', 'emotional_support'],
      isPermanent: true,
    },
    {
      id: 'brother',
      name: gender === 'Male' ? 'Bra Sipho' : 'Brother Sipho',
      role: 'Brother',
      age: 28,
      npcBackground: 'hustler',
      relationshipLevel: 60,
      trust: 65,
      friendship: 65,
      conflict: 15,
      isPartner: false,
      romanticStage: 'none',
      canOffer: ['job_lead', 'street_info'],
      isPermanent: true,
    },
    {
      id: 'neighbour',
      name: 'Mam\' Dlamini',
      role: 'Neighbour',
      age: 45,
      npcBackground: 'neighbour',
      relationshipLevel: 50,
      trust: 45,
      friendship: 50,
      conflict: 10,
      isPartner: false,
      romanticStage: 'none',
      canOffer: ['gossip', 'community_events'],
      isPermanent: true,
    },
  ];
}

// ─── Initial Game State Factory ───────────────────────────────────────────────
export function createInitialGameState(
  playerName: string,
  gender: 'Male' | 'Female',
  background: Background,
): GameState {
  const bgData = BACKGROUNDS[background];
  const defaultStats: PlayerStats = {
    health: 75, hunger: 70, energy: 80, fitness: 60,
    hygiene: 65, stress: 30, happiness: 50, intelligence: 50,
    education: 30, reputation: 35,
    discipline: 40, endurance: 40,
    drugEffectDaysLeft: 0,
    sickness: null,
    addictions: [],
  };
  const stats = { ...defaultStats, ...bgData.startingStats };

  const blankIndustryExp: IndustryExperience = {
    Healthcare: 0, Education: 0, 'Law Enforcement': 0,
    Finance: 0, Engineering: 0, Retail: 0,
    Technology: 0, Services: 0, Transport: 0,
    Construction: 0, Agriculture: 0, Crime: 0,
  };

  const starterInventory = [
    { id: 'bread_loaf', name: 'White Bread (700g)', category: 'food' as const, quantity: 1, unit: 'loaf', hungerRestore: 50 },
    { id: 'pilchards_can', name: 'Pilchards (400g tin)', category: 'food' as const, quantity: 2, unit: 'tin', hungerRestore: 35 },
    { id: 'soap_bar', name: 'Sunlight Soap Bar', category: 'hygiene' as const, quantity: 1, unit: 'bar', hygieneRestore: 20 },
  ];

  const farmerExtras = background === 'struggling_farmer' ? [
    { id: 'maize_meal_5kg', name: 'Maize Meal (5kg)', category: 'food' as const, quantity: 1, unit: 'bag', hungerRestore: 150 },
  ] : [];

  return {
    version: 1,
    gameStarted: true,
    day: 1,
    dayPhase: 'morning',
    actionsUsedToday: [],
    maxActionsPerDay: 4,

    weather: 'Sunny',
    perks: [],

    playerName,
    gender,
    background,
    age: 18,
    location: bgData.startingLocation,
    qualifications: [...bgData.startingQualifications],
    currentJob: null,
    formalEmployment: null,
    experience: 0,
    industryExperience: {
      ...blankIndustryExp,
      Agriculture: background === 'struggling_farmer' ? 20 : 0,
    },

    stats,
    cash: bgData.startingCash,
    bank: {
      currentBalance: 0,
      noticeBalance: 0,
      noticeLockUntilDay: null,
      interestRate: 0.075,
      lastInterestDay: 1,
      creditScore: 500,
      loans: [],
    },
    financeHistory: [{
      day: 1,
      description: 'Starting funds',
      amount: bgData.startingCash,
      category: 'other',
    }],

    currentCourse: null,
    completedCourses: [],

    businesses: [],
    cropPlots: background === 'struggling_farmer' ? [
      {
        id: 'plot_1', cropType: 'Maize' as const, stage: 'growing' as const,
        daysPlanted: 30, daysToHarvest: 90, yield: 80,
        needsFertilizer: true, needsPesticide: false, needsWater: true,
        needsWeeding: false, lastWeededDay: 1,
        hasFarmEvent: false, farmEventType: null,
        fertilizerApplied: false, yieldBoostPct: 0,
      },
      {
        id: 'plot_2', cropType: 'Spinach' as const, stage: 'growing' as const,
        daysPlanted: 15, daysToHarvest: 45, yield: 20,
        needsFertilizer: false, needsPesticide: false, needsWater: true,
        needsWeeding: false, lastWeededDay: 1,
        hasFarmEvent: false, farmEventType: null,
        fertilizerApplied: false, yieldBoostPct: 0,
      },
    ] : [],
    livestock: background === 'struggling_farmer' ? [
      { type: 'Chicken' as const, males: 1, females: 3, animalFeedStockKg: 0, dailyProduceBoostDays: 0, pregnantFemales: 0, pregnancyDaysLeft: 0, sickCount: 0, injuredCount: 0, averageAge: 120 },
    ] : [],
    farmLaborers: [],
    cropCyclesCompleted: 0,

    properties: [],
    currentPropertyId: null,

    vehicles: [],

    inventory: [...starterInventory, ...farmerExtras],
    autoConsume: { enabled: true, hungerThreshold: 30, threshold: 30 },

    npcs: getDefaultNPCs(gender),
    daysUntilNextNpcEncounter: 0,

    pendingEvents: [],
    eventHistory: [],
    eventCooldowns: {},

    crimeState: {
      cannabisSalesCaught: 0,
      totalCrimes: 0,
      crimeRecords: [],
      wantedLevel: 0,
    },

    lastDaySummary: null,
    showDaySummary: false,

    prison: {
      imprisoned: false,
      sentenceDays: 0,
      daysServed: 0,
      crime: '',
      gangMember: false,
      prisonEarnings: 0,
      facility: 'Pollsmoor Correctional Centre',
      prisonSkills: { study: 0, fitness: 0 },
    },
    injury: {
      injured: false,
      severity: null,
      daysInHospital: 0,
      daysHealing: 0,
      crippled: false,
      description: '',
    },

    settings: {
      textSize: 'medium',
      soundEnabled: false,
    },

    orchardPlots: background === 'struggling_farmer' ? [
      {
        id: 'orch_1',
        treeType: 'Apple Tree' as const,
        ageDays: 45,
        lastHarvestDay: 0,
        harvestReadyDay: 100,
        yield: 30,
      },
      {
        id: 'orch_2',
        treeType: 'Peach Tree' as const,
        ageDays: 20,
        lastHarvestDay: 0,
        harvestReadyDay: 130,
        yield: 25,
      },
    ] : [],

    cropPlotsOwned: background === 'struggling_farmer' ? 4 : 0,
    orchardPlotsOwned: background === 'struggling_farmer' ? 4 : 0,

    adRewards: {
      lastClaimedDay: {},
      bonusActionsToday: 0,
    },

    registeredBusinessNames: [],

    analyticsData: {
      jobsChosen: {},
      hustlesChosen: {},
      propertiesBought: {},
      vehiclesBought: {},
      businessesStarted: {},
      locationsVisited: {},
      adsWatched: {},
    },

    bugReports: [],
  };
}

// ─── Weapons (Shop — Black Market) ───────────────────────────────────────────
export const WEAPON_DEFINITIONS = [
  {
    id: 'knuckledusters',
    name: 'Knuckledusters',
    price: 350, category: 'weapon' as const, isFirearm: false,
    crimeSuccessBonus: 8, riskPercent: 5, demand: 'Low' as const, supply: 'Plentiful' as const,
    description: 'Brass knuckles. Illegal to use; possession low risk.',
  },
  {
    id: 'switchblade',
    name: 'Switchblade Knife',
    price: 500, category: 'weapon' as const, isFirearm: false,
    crimeSuccessBonus: 12, riskPercent: 12, demand: 'Medium' as const, supply: 'Plentiful' as const,
    description: 'Spring-loaded blade. Concealed carry. Moderate arrest risk.',
  },
  {
    id: 'panga',
    name: 'Panga (Machete)',
    price: 280, category: 'weapon' as const, isFirearm: false,
    crimeSuccessBonus: 15, riskPercent: 15, demand: 'Medium' as const, supply: 'Plentiful' as const,
    description: 'Heavy blade. High intimidation factor. Cannot be concealed.',
  },
  {
    id: 'crowbar',
    name: 'Crowbar',
    price: 200, category: 'weapon' as const, isFirearm: false,
    crimeSuccessBonus: 10, riskPercent: 10, demand: 'Low' as const, supply: 'Plentiful' as const,
    description: 'Useful for burglary & intimidation. Not a firearm.',
  },
  {
    id: 'handgun_illegal',
    name: 'Illegal Handgun (9mm)',
    price: 4500, category: 'weapon' as const, isFirearm: true,
    crimeSuccessBonus: 30, riskPercent: 40, demand: 'Medium' as const, supply: 'Scarce' as const,
    description: '⚠️ FIREARM — possession without licence = immediate arrest. High crime bonus.',
  },
  {
    id: 'shotgun_sawn',
    name: 'Sawn-off Shotgun',
    price: 6000, category: 'weapon' as const, isFirearm: true,
    crimeSuccessBonus: 40, riskPercent: 50, demand: 'Low' as const, supply: 'Scarce' as const,
    description: '⚠️ ILLEGAL FIREARM — very high arrest risk. Maximum intimidation.',
  },
  {
    id: 'taser',
    name: 'Taser / Stun Gun',
    price: 1200, category: 'weapon' as const, isFirearm: false,
    crimeSuccessBonus: 18, riskPercent: 18, demand: 'Low' as const, supply: 'Limited' as const,
    description: 'Non-lethal but illegal in most contexts. Moderate arrest risk.',
  },
];

// ─── Drugs (Black Market — High Risk Locations Only) ──────────────────────────
export const DRUG_DEFINITIONS = [
  {
    id: 'cannabis_bag',
    name: 'Cannabis — small bag',
    price: 60, category: 'drug' as const, drugType: 'cannabis',
    sellPrice: 120, riskPercent: 8, demand: 'High' as const, supply: 'Plentiful' as const,
    description: 'Low risk, widely available. Mild relaxant effects.',
  },
  {
    id: 'tik_bag',
    name: 'Tik (Crystal Meth) — small bag',
    price: 150, category: 'drug' as const, drugType: 'tik',
    sellPrice: 300, riskPercent: 25, demand: 'High' as const, supply: 'Plentiful' as const,
    description: 'High-risk. Heavy addiction. Found in township/city.',
  },
  {
    id: 'nyaope_wrap',
    name: 'Nyaope — wrap',
    price: 25, category: 'drug' as const, drugType: 'nyaope',
    sellPrice: 60, riskPercent: 18, demand: 'High' as const, supply: 'Plentiful' as const,
    description: 'Extremely addictive street drug. Township only.',
  },
  {
    id: 'mandrax_tablet',
    name: 'Mandrax Tablet',
    price: 120, category: 'drug' as const, drugType: 'mandrax',
    sellPrice: 250, riskPercent: 28, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Sedative street drug, often smoked. High arrest risk.',
  },
  {
    id: 'cocaine_gram',
    name: 'Cocaine — 1g',
    price: 800, category: 'drug' as const, drugType: 'cocaine',
    sellPrice: 1500, riskPercent: 30, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Premium drug. City & club circuit.',
  },
  {
    id: 'heroin_gram',
    name: 'Heroin — 1g',
    price: 1000, category: 'drug' as const, drugType: 'heroin',
    sellPrice: 2000, riskPercent: 45, demand: 'Low' as const, supply: 'Scarce' as const,
    description: '⚠️ EXTREMELY DANGEROUS. Severe health risk, heavy addiction, harshest police attention.',
  },
  {
    id: 'pills_ecstasy',
    name: 'Ecstasy Tablet',
    price: 200, category: 'drug' as const, drugType: 'ecstasy',
    sellPrice: 450, riskPercent: 20, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Club drug. City nightlife scene.',
  },
  {
    id: 'prescription_pills',
    name: 'Prescription Pills (unlicensed)',
    price: 100, category: 'drug' as const, drugType: 'prescription',
    sellPrice: 220, riskPercent: 10, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Diverted prescription medication. Lower risk, still illegal without a script.',
  },
];

// ─── Drug Effects (taking drugs as player) ────────────────────────────────────
export const DRUG_EFFECTS: Record<string, {
  energyBoost: number; fitnessHit: number; disciplineHit: number;
  enduranceHit: number; healthHit: number; happinessBoost: number;
  durationDays: number; description: string;
}> = {
  tik:     { energyBoost: 40, fitnessHit: -10, disciplineHit: -15, enduranceHit: -8,  healthHit: -12, happinessBoost: 15, durationDays: 3, description: 'High energy rush. Heavy physical damage over time.' },
  nyaope:  { energyBoost: 20, fitnessHit: -12, disciplineHit: -20, enduranceHit: -10, healthHit: -15, happinessBoost: 10, durationDays: 2, description: 'Temporary euphoria. Destroys health and discipline fast.' },
  cocaine: { energyBoost: 35, fitnessHit: -5,  disciplineHit: -8,  enduranceHit: -5,  healthHit: -8,  happinessBoost: 20, durationDays: 1, description: 'Short intense high. Crashes hard afterward.' },
  ecstasy: { energyBoost: 30, fitnessHit: -3,  disciplineHit: -6,  enduranceHit: -4,  healthHit: -6,  happinessBoost: 25, durationDays: 1, description: 'Euphoric and social. Moderate physical cost.' },
  cannabis:{ energyBoost: 5,  fitnessHit: -2,  disciplineHit: -5,  enduranceHit: -2,  healthHit: -3,  happinessBoost: 12, durationDays: 1, description: 'Mild relaxant. Low physical impact.' },
  mandrax: { energyBoost: -10, fitnessHit: -8, disciplineHit: -18, enduranceHit: -10, healthHit: -15, happinessBoost: 18, durationDays: 2, description: 'Heavy sedative. Impairs judgement badly, high dependency risk.' },
  heroin:  { energyBoost: -25, fitnessHit: -20, disciplineHit: -30, enduranceHit: -20, healthHit: -30, happinessBoost: 30, durationDays: 4, description: 'Severe, fast-forming addiction. Devastating long-term health cost.' },
  prescription: { energyBoost: 10, fitnessHit: -2, disciplineHit: -3, enduranceHit: -2, healthHit: -3, happinessBoost: 8, durationDays: 1, description: 'Misused prescription medication. Mild relief, real dependency risk.' },
};

// ─── Alcohol (Black Market — unlicensed/home-brewed) ──────────────────────────
export const ALCOHOL_DEFINITIONS = [
  {
    id: 'home_brew_beer',
    name: 'Home-brewed Beer',
    price: 25, category: 'alcohol' as const, drugType: 'homebrew',
    sellPrice: 55, riskPercent: 4, demand: 'High' as const, supply: 'Plentiful' as const,
    description: 'Unlicensed home brew. Low risk, mild buzz.',
  },
  {
    id: 'moonshine_bottle',
    name: 'Moonshine (unlicensed spirits)',
    price: 60, category: 'alcohol' as const, drugType: 'moonshine',
    sellPrice: 130, riskPercent: 8, demand: 'High' as const, supply: 'Plentiful' as const,
    description: 'Strong homemade spirit sold without a licence. Rough on the body.',
  },
];

export const ALCOHOL_EFFECTS: Record<string, {
  energyBoost: number; fitnessHit: number; disciplineHit: number;
  enduranceHit: number; healthHit: number; happinessBoost: number;
  durationDays: number; description: string;
}> = {
  homebrew:  { energyBoost: -2, fitnessHit: -1, disciplineHit: -3, enduranceHit: -1, healthHit: -2, happinessBoost: 8,  durationDays: 1, description: 'Home-brewed beer. Mild buzz, mild cost.' },
  moonshine: { energyBoost: -5, fitnessHit: -3, disciplineHit: -8, enduranceHit: -3, healthHit: -6, happinessBoost: 14, durationDays: 1, description: 'Strong homemade spirit. Rough on the body the next day.' },
};

// ─── Fake IDs (Black Market documents) ────────────────────────────────────────
export const FAKE_ID_DEFINITIONS = [
  {
    id: 'basic_fake_id',
    name: 'Basic Fake ID',
    price: 400, category: 'document' as const,
    riskPercent: 15, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Passable for casual age checks. Won\'t survive real scrutiny.',
  },
  {
    id: 'premium_fake_id',
    name: 'Premium Forged ID',
    price: 1200, category: 'document' as const,
    riskPercent: 25, demand: 'Low' as const, supply: 'Scarce' as const,
    description: 'High-quality forgery. Convincing, but expensive and risky to source.',
  },
];

// ─── Stolen Goods (Black Market — buy cheap, resell at a markup) ──────────────
export const STOLEN_GOODS_DEFINITIONS = [
  {
    id: 'stolen_phone',
    name: 'Stolen Smartphone',
    price: 300, category: 'stolen_goods' as const,
    sellPrice: 700, riskPercent: 20, demand: 'High' as const, supply: 'Plentiful' as const,
    description: 'Hot but functional. Best resold quickly.',
  },
  {
    id: 'stolen_laptop',
    name: 'Stolen Laptop',
    price: 900, category: 'stolen_goods' as const,
    sellPrice: 2200, riskPercent: 25, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Higher value, higher risk to move.',
  },
  {
    id: 'stolen_car_radio',
    name: 'Stolen Car Radio/Infotainment Unit',
    price: 150, category: 'stolen_goods' as const,
    sellPrice: 350, riskPercent: 15, demand: 'Medium' as const, supply: 'Plentiful' as const,
    description: 'Common, easy to offload.',
  },
  {
    id: 'stolen_jewelry',
    name: 'Stolen Jewellery',
    price: 600, category: 'stolen_goods' as const,
    sellPrice: 1500, riskPercent: 22, demand: 'Low' as const, supply: 'Scarce' as const,
    description: 'Needs a discreet buyer. Big payout if you find one.',
  },
];

// ─── Illegal Seeds (Black Market — plant for an off-books harvest) ────────────
export const ILLEGAL_SEED_DEFINITIONS = [
  {
    id: 'cannabis_seeds',
    name: 'Cannabis Seeds',
    price: 80, category: 'illegal_seed' as const,
    riskPercent: 10, demand: 'Medium' as const, supply: 'Limited' as const,
    description: 'Plant illegally for a cannabis harvest. High yield if grown discreetly.',
  },
  {
    id: 'unregulated_maize_seeds',
    name: 'Unregulated GM Maize Seeds',
    price: 150, category: 'illegal_seed' as const,
    riskPercent: 5, demand: 'Low' as const, supply: 'Limited' as const,
    description: 'Unlicensed high-yield seed stock. Illegal to plant without a permit.',
  },
];

// ─── Drug Business Stock items ────────────────────────────────────────────────
export const DRUG_BUSINESS_STOCK = [
  { id: 'tik_bag', name: 'Tik (small bag)', category: 'drug' as const, unitSellPrice: 300, restockCost: 150 },
  { id: 'nyaope_wrap', name: 'Nyaope (wrap)', category: 'drug' as const, unitSellPrice: 60, restockCost: 25 },
  { id: 'cocaine_gram', name: 'Cocaine (1g)', category: 'drug' as const, unitSellPrice: 1500, restockCost: 800 },
  { id: 'pills_ecstasy', name: 'Ecstasy Tablet', category: 'drug' as const, unitSellPrice: 450, restockCost: 200 },
  { id: 'drug_pipe', name: 'Drug Pipe', category: 'drug' as const, unitSellPrice: 80, restockCost: 30 },
  { id: 'drug_syringe', name: 'Syringe (pack of 5)', category: 'drug' as const, unitSellPrice: 60, restockCost: 20 },
];

export const CANNABIS_BUSINESS_STOCK = [
  { id: 'cannabis_gram', name: 'Cannabis (1g)', category: 'drug' as const, unitSellPrice: 80, restockCost: 35 },
  { id: 'cannabis_50g', name: 'Cannabis (50g bag)', category: 'drug' as const, unitSellPrice: 2500, restockCost: 1200 },
  { id: 'cannabis_blunt', name: 'Pre-rolled Blunt', category: 'drug' as const, unitSellPrice: 30, restockCost: 10 },
  { id: 'rolling_papers', name: 'Rolling Papers (pack)', category: 'drug' as const, unitSellPrice: 25, restockCost: 8 },
  { id: 'cannabis_pipe', name: 'Cannabis Pipe', category: 'drug' as const, unitSellPrice: 120, restockCost: 45 },
  { id: 'bong', name: 'Bong', category: 'drug' as const, unitSellPrice: 350, restockCost: 130 },
];

// Locations where drugs/black market is accessible
export const HIGH_RISK_LOCATIONS: string[] = ['Township', 'City', 'Informal Settlement'];

// ─── Crime Definitions ────────────────────────────────────────────────────────
export type CrimeDef = {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseSuccessRate: number;    // 0–100 %
  baseCashReward: { min: number; max: number };
  caughtFine: { min: number; max: number };
  sentenceDays: number;       // days in prison if caught
  energyCost: number;
  requiresWeapon: boolean;
  recommendedLocations: string[];
  happinessCost: number;      // on attempt
  stressAdd: number;
};

export const CRIME_DEFINITIONS: CrimeDef[] = [
  {
    id: 'pickpocketing', name: 'Pickpocketing', icon: '🤏',
    description: 'Steal a wallet from a distracted person.',
    baseSuccessRate: 55, baseCashReward: { min: 50, max: 300 },
    caughtFine: { min: 500, max: 1500 }, sentenceDays: 3,
    energyCost: 10, requiresWeapon: false,
    recommendedLocations: ['City', 'Town', 'Township'],
    happinessCost: 3, stressAdd: 5,
  },
  {
    id: 'shoplifting', name: 'Shoplifting', icon: '🏪',
    description: 'Pocket items from a shop without paying.',
    baseSuccessRate: 60, baseCashReward: { min: 80, max: 400 },
    caughtFine: { min: 800, max: 2000 }, sentenceDays: 5,
    energyCost: 10, requiresWeapon: false,
    recommendedLocations: ['City', 'Town', 'Suburb'],
    happinessCost: 3, stressAdd: 5,
  },
  {
    id: 'bootlegging', name: 'Bootlegging', icon: '🥃',
    description: 'Sell unlicensed alcohol from home.',
    baseSuccessRate: 65, baseCashReward: { min: 200, max: 800 },
    caughtFine: { min: 2000, max: 5000 }, sentenceDays: 14,
    energyCost: 15, requiresWeapon: false,
    recommendedLocations: ['Township', 'Village', 'Informal Settlement'],
    happinessCost: 2, stressAdd: 4,
  },
  {
    id: 'drug_running', name: 'Drug Running', icon: '💨',
    description: 'Deliver packages for a drug network.',
    baseSuccessRate: 50, baseCashReward: { min: 500, max: 1500 },
    caughtFine: { min: 3000, max: 8000 }, sentenceDays: 30,
    energyCost: 20, requiresWeapon: false,
    recommendedLocations: ['Township', 'City', 'Informal Settlement'],
    happinessCost: 5, stressAdd: 10,
  },
  {
    id: 'selling_cannabis', name: 'Selling Cannabis', icon: '🌿',
    description: 'Sell cannabis on the street. Fine if caught (prison if repeat offender).',
    baseSuccessRate: 65, baseCashReward: { min: 200, max: 900 },
    caughtFine: { min: 1000, max: 4000 }, sentenceDays: 21,
    energyCost: 15, requiresWeapon: false,
    recommendedLocations: ['Township', 'City', 'Village', 'Informal Settlement'],
    happinessCost: 3, stressAdd: 6,
  },
  {
    id: 'selling_drugs', name: 'Selling Drugs', icon: '💊',
    description: 'Deal hard drugs on the street. High reward, high risk.',
    baseSuccessRate: 45, baseCashReward: { min: 800, max: 3000 },
    caughtFine: { min: 5000, max: 15000 }, sentenceDays: 60,
    energyCost: 20, requiresWeapon: false,
    recommendedLocations: ['Township', 'City', 'Informal Settlement'],
    happinessCost: 8, stressAdd: 15,
  },
  {
    id: 'mugging', name: 'Mugging', icon: '😤',
    description: 'Rob someone on the street by force or threat.',
    baseSuccessRate: 50, baseCashReward: { min: 150, max: 600 },
    caughtFine: { min: 2000, max: 6000 }, sentenceDays: 20,
    energyCost: 25, requiresWeapon: false,
    recommendedLocations: ['Township', 'City', 'Informal Settlement'],
    happinessCost: 8, stressAdd: 12,
  },
  {
    id: 'burglary', name: 'Burglary', icon: '🏠',
    description: 'Break into a home and steal valuables.',
    baseSuccessRate: 40, baseCashReward: { min: 500, max: 3000 },
    caughtFine: { min: 5000, max: 12000 }, sentenceDays: 45,
    energyCost: 30, requiresWeapon: false,
    recommendedLocations: ['Suburb', 'Town', 'City'],
    happinessCost: 10, stressAdd: 15,
  },
  {
    id: 'fraud', name: 'Fraud', icon: '📋',
    description: 'Forge documents or run a financial scam.',
    baseSuccessRate: 45, baseCashReward: { min: 1000, max: 5000 },
    caughtFine: { min: 8000, max: 20000 }, sentenceDays: 60,
    energyCost: 20, requiresWeapon: false,
    recommendedLocations: ['City', 'Suburb', 'Town'],
    happinessCost: 6, stressAdd: 12,
  },
  {
    id: 'extortion', name: 'Extortion', icon: '😈',
    description: 'Demand "protection money" from local businesses.',
    baseSuccessRate: 40, baseCashReward: { min: 800, max: 4000 },
    caughtFine: { min: 6000, max: 18000 }, sentenceDays: 60,
    energyCost: 25, requiresWeapon: false,
    recommendedLocations: ['Township', 'City', 'Informal Settlement'],
    happinessCost: 10, stressAdd: 15,
  },
  {
    id: 'illegal_gambling', name: 'Illegal Gambling', icon: '🎲',
    description: 'Run an informal gambling operation.',
    baseSuccessRate: 55, baseCashReward: { min: 300, max: 2000 },
    caughtFine: { min: 2000, max: 6000 }, sentenceDays: 14,
    energyCost: 15, requiresWeapon: false,
    recommendedLocations: ['Township', 'Village', 'Informal Settlement'],
    happinessCost: 4, stressAdd: 8,
  },
  {
    id: 'carjacking', name: 'Carjacking', icon: '🚗',
    description: 'Force a driver out of their car and steal it.',
    baseSuccessRate: 35, baseCashReward: { min: 3000, max: 8000 },
    caughtFine: { min: 10000, max: 30000 }, sentenceDays: 90,
    energyCost: 35, requiresWeapon: true,
    recommendedLocations: ['City', 'Town', 'Suburb'],
    happinessCost: 15, stressAdd: 20,
  },
  {
    id: 'gta', name: 'Grand Theft Auto', icon: '🏎️',
    description: 'Steal an unattended vehicle to sell for parts or cash.',
    baseSuccessRate: 40, baseCashReward: { min: 2000, max: 6000 },
    caughtFine: { min: 8000, max: 25000 }, sentenceDays: 60,
    energyCost: 30, requiresWeapon: false,
    recommendedLocations: ['City', 'Suburb', 'Town'],
    happinessCost: 12, stressAdd: 18,
  },
  {
    id: 'armed_robbery', name: 'Armed Robbery', icon: '🔫',
    description: 'Rob a shop or person at gunpoint. Maximum reward, maximum risk.',
    baseSuccessRate: 30, baseCashReward: { min: 5000, max: 20000 },
    caughtFine: { min: 15000, max: 50000 }, sentenceDays: 180,
    energyCost: 40, requiresWeapon: true,
    recommendedLocations: ['City', 'Town', 'Suburb'],
    happinessCost: 20, stressAdd: 30,
  },
];

// ─── NPC Name Pool (for dynamic relationship creation) ───────────────────────
export const NPC_NAME_POOL = {
  male: [
    'Sipho', 'Thabo', 'Lungelo', 'Blessing', 'Andile', 'Mpho', 'Lerato',
    'Jabu', 'Siyanda', 'Ntando', 'Bongani', 'Lethiwe', 'Vusi', 'Mandla',
    'Nhlanhla', 'Thabiso', 'Sifiso', 'Mthokozisi', 'Romeo', 'Kagiso',
    'Luca', 'Marco', 'Ahmed', 'Carlos', 'Deon', 'Kobus', 'Pieter',
    'Terrence', 'Shaun', 'Devon', 'Angel', 'Riaan', 'Heinrich', 'Johan',
  ],
  female: [
    'Nomsa', 'Zanele', 'Nandi', 'Thandeka', 'Lindiwe', 'Precious', 'Busisiwe',
    'Bongiwe', 'Ayanda', 'Sindi', 'Nokwanda', 'Lungile', 'Thandi', 'Sbahle',
    'Palesa', 'Boitumelo', 'Lesego', 'Refilwe', 'Dineo', 'Naledi',
    'Fatima', 'Priya', 'Chantelle', 'Shané', 'Liesel', 'Ntombi',
    'Faith', 'Hope', 'Angel', 'Zodwa', 'Noxolo', 'Sindisiwe',
  ],
};

export const NPC_ROLE_POOL: Array<{ role: string; background: string; canOffer: string[] }> = [
  { role: 'Farmer',         background: 'farmer',       canOffer: ['farming_boost', 'equipment_tip', 'crop_advice'] },
  { role: 'Market Trader',  background: 'business',     canOffer: ['business_boost', 'market_info', 'bulk_sell'] },
  { role: 'Mechanic',       background: 'professional', canOffer: ['vehicle_discount', 'job_referral'] },
  { role: 'Teacher',        background: 'professional', canOffer: ['course_discount', 'job_referral', 'tutoring'] },
  { role: 'Nurse',          background: 'professional', canOffer: ['medical_discount', 'health_advice'] },
  { role: 'Businessman',    background: 'business',     canOffer: ['business_boost', 'investment_tip', 'job_referral'] },
  { role: 'Township Hustler', background: 'hustler',    canOffer: ['side_income', 'cheap_goods'] },
  { role: 'Gang Member',    background: 'gangster',     canOffer: ['crime_opportunities', 'weapon_access', 'protection'] },
  { role: 'Drug Dealer',    background: 'dealer',       canOffer: ['drug_supply', 'crime_opportunities', 'cash'] },
  { role: 'Neighbour',      background: 'neighbour',    canOffer: ['casual', 'gossip', 'small_gift'] },
  { role: 'Small Farmer',   background: 'farmer',       canOffer: ['farming_boost', 'livestock_tip'] },
  { role: 'Chef',           background: 'professional', canOffer: ['cooking_tip', 'job_referral', 'free_meal'] },
  { role: 'Shop Owner',     background: 'business',     canOffer: ['shop_discount', 'business_boost'] },
  { role: 'Criminal',       background: 'criminal',     canOffer: ['crime_opportunities', 'fencing', 'weapon_access'] },
  { role: 'Security Guard', background: 'professional', canOffer: ['job_referral', 'inside_info'] },
];

// Locations where crime events are more frequent
export const CRIME_FREQUENCY: Record<string, number> = {
  Township: 0.35,
  'Informal Settlement': 0.4,
  Village: 0.25,
  City: 0.20,
  Town: 0.15,
  Farm: 0.10,
  Suburb: 0.12,
};
