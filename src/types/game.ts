// ─── Industry Categories ──────────────────────────────────────────────────────
export type Industry =
  | 'Healthcare'
  | 'Education'
  | 'Law Enforcement'
  | 'Finance'
  | 'Engineering'
  | 'Retail'
  | 'Technology'
  | 'Services'
  | 'Transport'
  | 'Construction'
  | 'Agriculture'
  | 'Crime';


export type IndustryExperience = Record<Industry, number>;

// ─── Player Stats ─────────────────────────────────────────────────────────────
export interface PlayerStats {
  health: number;       // 0–100
  hunger: number;       // 0–100 (100 = full)
  energy: number;       // 0–100
  fitness: number;      // 0–100
  hygiene: number;      // 0–100
  stress: number;       // 0–100 (0 = no stress)
  happiness: number;    // 0–100
  intelligence: number; // 0–100
  education: number;    // 0–100 (overall education score)
  reputation: number;   // 0–100
  discipline: number;   // 0–100 (improves with exercise)
  endurance: number;    // 0–100 (improves with exercise)
  drugEffectDaysLeft: number; // days remaining for active drug effect
  sickness: 'Cold' | 'Flu' | 'Food Poisoning' | null;
  addictions: string[];
}

// ─── Background / Location ────────────────────────────────────────────────────
export type Background =
  | 'unemployed_youth'
  | 'college_dropout'
  | 'unemployed_graduate'
  | 'struggling_farmer'
  | 'hustler';

export type Location =
  | 'Village'
  | 'Township'
  | 'Informal Settlement'
  | 'Town'
  | 'Suburb'
  | 'City'
  | 'Farm';

export type Gender = 'Male' | 'Female';

// ─── Qualifications & Skills ──────────────────────────────────────────────────
export type Qualification =
  | 'Matric'
  | 'Bookkeeping Certificate'
  | 'Security Certificate'
  | 'First Aid Certificate'
  | 'Drivers Licence'
  | 'Code 10 (Light Delivery)'
  | 'Motorcycle Licence'
  | 'Code 14 (Heavy Vehicle)'
  | 'Liquor Licence'
  | 'TVET Electrical'
  | 'TVET Mechanical'
  | 'TVET Business'
  | 'TVET IT'
  | 'TVET Hospitality'
  | 'Accounting Degree'
  | 'Teaching Degree'
  | 'Engineering Degree'
  | 'MBChB'
  | 'Nursing Diploma'
  | 'Policing Diploma'
  | 'Police Basic Training'
  | 'Short Course Entrepreneurship'
  | 'Short Course Farming'
  | 'Clerk Certificate';

// Mapping from qualification to the formal job it unlocks (entry rank)
export const QUALIFICATION_JOB_LINKS: Partial<Record<Qualification, string>> = {
  'MBChB': 'doctor_junior',
  'Accounting Degree': 'accountant_junior',
  'Teaching Degree': 'teacher_junior',
  'Engineering Degree': 'engineer_junior',
  'Nursing Diploma': 'nurse_enrolled',
  'Police Basic Training': 'police_constable',
  'Clerk Certificate': 'clerk_junior',
};

// ─── Employment ───────────────────────────────────────────────────────────────
export type PayCycle = 'weekly' | 'biweekly' | 'monthly';

export interface JobRank {
  id: string;
  title: string;
  monthlySalary: number;
  daysRequiredAtPreviousRank: number; // 0 for entry rank
  industryExpRequired: number;
}

export interface JobChain {
  id: string;          // chain identifier (e.g. 'police')
  industry: Industry;
  payCycle: PayCycle;
  ranks: JobRank[];
  requiredQualification: Qualification;
  type: 'formal';
  energyCost: number;
  stressGain: number;
}

export type JobType =
  | 'Teacher' | 'Doctor' | 'Nurse' | 'Accountant'
  | 'Police Officer' | 'Engineer' | 'Clerk'
  | 'Gardener' | 'Domestic Worker' | 'Piece Job' | 'Car Wash Attendant'
  | 'Street Vendor' | 'Construction Labourer' | 'Farm Labourer' | 'Security Guard'
  | 'Reseller' | 'Spaza Trader' | 'Food Seller' | 'Transport Operator';

export interface Job {
  id: string;
  title: JobType;
  type: 'formal' | 'informal' | 'hustle';
  industry?: Industry;
  dailyIncome: number;
  monthlySalary?: number;
  payCycle?: PayCycle;
  chainId?: string;   // links to a JobChain
  rankIndex?: number; // current rank index in chain
  daysAtRank?: number; // days worked at this rank
  requiredQualifications: Qualification[];
  requiredLocation: Location[];
  energyCost: number;
  stressGain: number;
}

// Tracks formal employment payment schedule
export interface FormalEmployment {
  chainId: string;
  rankIndex: number;
  daysAtRank: number;
  lastPaidDay: number; // day salary was last credited
}

// ─── Education ────────────────────────────────────────────────────────────────
export interface CourseEnrollment {
  courseId: string;
  courseName: string;
  institution: 'University' | 'TVET' | 'Short Course';
  totalDays: number;
  daysCompleted: number;
  dailyFee: number;
  qualification: Qualification;
  studyPointsRequired: number;
  studyPointsEarned: number;
  scholarshipPct: number; // 0–100, percentage discount on fees
}

// ─── Business ─────────────────────────────────────────────────────────────────
export type BusinessType =
  | 'Spaza Shop' | 'Tuck Shop' | 'Internet Cafe'
  | 'Car Wash' | 'Salon' | 'Taxi Business'
  | 'Construction Company' | 'Farm Supply Store'
  | 'Tavern' | 'Nightclub' | 'Liquor Store'
  | 'Cannabis Business' | 'Drug Business'
  | 'Butchery' | 'Dairy' | 'Logistics Company'
  | 'Shebeen';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  industry: Industry;
  location: Location;
  capital: number;
  dailyIncome: number;
  reputation: number; // 0–100
  isLicensed: boolean;
  isRegistered: boolean;
  daysBad: number; // consecutive bad events
  // Stock for stock-dependent businesses (drug, cannabis, butchery, dairy)
  stock?: Array<{ id: string; name: string; quantity: number; unitSellPrice: number; restockCost: number }>;
  // Temporary income boosts (from ad rewards)
  incomeBoostPct?: number;  // % boost added on top of dailyIncome
  incomeBoostUntilDay?: number;
}

// ─── Farming ──────────────────────────────────────────────────────────────────
export type CropType =
  | 'Maize' | 'Spinach' | 'Cabbage' | 'Potatoes'
  | 'Tomatoes' | 'Onions' | 'Carrots' | 'Beetroot'
  | 'Peppers' | 'Chillies' | 'Cucumber' | 'Butternut' | 'Watermelon'
  | 'Cannabis';

export type FruitTreeType = 'Apple Tree' | 'Orange Tree' | 'Peach Tree' | 'Pear Tree';

export type LivestockType = 'Chicken' | 'Goat' | 'Cattle' | 'Pig';

export type FarmEventType = 'pest_infestation' | 'disease' | null;

export interface CropPlot {
  id: string;
  cropType: CropType;
  stage: 'seedling' | 'growing' | 'ready' | 'harvested';
  daysPlanted: number;
  daysToHarvest: number;
  yield: number; // kg when harvested
  needsFertilizer: boolean;
  needsPesticide: boolean;
  needsWater: boolean;
  needsWeeding: boolean;
  lastWeededDay: number;
  hasFarmEvent: boolean;
  farmEventType: FarmEventType;
  fertilizerApplied: boolean;
  yieldBoostPct: number; // cumulative % boost from fertilizer/care
}

export interface FarmLaborer {
  id: string;
  name: string;
  dailyWage: number; // R100/day
  hiredDay: number;
}

// Orchard plot — fruit trees persist after harvest, produce each season
export interface OrchardPlot {
  id: string;
  treeType: FruitTreeType;
  ageDays: number;          // trees mature after ~90 days
  lastHarvestDay: number;
  harvestReadyDay: number;  // next harvest available
  yield: number;            // kg per harvest cycle
}

export interface LivestockGroup {
  type: LivestockType;
  males: number;
  females: number;
  animalFeedStockKg: number;
  dailyProduceBoostDays: number;
  // Pregnancy (goats, cattle & pigs — triggered by Artificial Insemination)
  pregnantFemales: number;
  pregnancyDaysLeft: number;
  // Egg incubation (chickens only) — eggs must be actively set to incubate;
  // only incubated eggs hatch, after 7 days. Chick sex is rolled at hatch time.
  incubatingEggs: number;
  incubationStartDay: number | null;
  // Health / aging
  sickCount: number;      // number of sick animals
  injuredCount: number;   // number of injured animals
  averageAge: number;     // average age in days (animals age daily)
}

// ─── Property ─────────────────────────────────────────────────────────────────
export type PropertyType =
  | 'Shack' | 'RDP House' | 'Village House'
  | 'Townhouse' | 'Suburban House' | 'Farm' | 'Apartment';

export interface Property {
  id: string;
  type: PropertyType;
  location: Location;
  owned: boolean; // false = renting
  monthlyPayment: number;
  purchasePrice: number;
  storageSlots: number;
  comfortBonus: number;
  isRentedOut: boolean;     // player is renting it out to a tenant
  tenantRent: number;       // monthly income from tenant
  furniture: string[];      // list of purchased furniture items
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export type VehicleType = 'Bicycle' | 'Motorcycle' | 'Car' | 'Bakkie' | 'Minibus Taxi' | 'Truck' | 'Light Delivery Van';

export interface Vehicle {
  id: string;
  type: VehicleType;
  condition: number; // 0–100
  requiredLicence: Qualification | null;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export type InventoryCategory =
  | 'food' | 'cooked_meal' | 'harvest' | 'meat' | 'livestock_product'
  | 'hygiene' | 'clothing' | 'farm_equipment' | 'farm_input'
  | 'document' | 'weapon' | 'drug' | 'livestock_medical'
  | 'stolen_goods' | 'illegal_seed' | 'alcohol';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  hungerRestore?: number;
  hygieneRestore?: number;
  sellPrice?: number;       // R per unit when sold from inventory
  // Weapon fields
  isFirearm?: boolean;
  crimeSuccessBonus?: number; // % bonus to crime success
  // Drug fields
  drugType?: string;
  portionsTotal?: number;   // total portions in one purchased unit
  portionsLeft?: number;    // remaining portions
  // Special seed fields (black market seeds — faster growth, bigger yield)
  linkedCropType?: string;
  daysToHarvestMultiplier?: number;
  yieldMultiplier?: number;
  // Medical kit fields
  treatsLivestockType?: string;
}

// ─── Banking ──────────────────────────────────────────────────────────────────
export interface BankAccount {
  currentBalance: number;
  noticeBalance: number;
  noticeLockUntilDay: number | null;
  interestRate: number; // monthly
  lastInterestDay: number;
  creditScore: number;
  loans: { id: string; amount: number; remaining: number; dailyInterest: number; paymentsMissed: number }[];
}

// ─── Relationships ────────────────────────────────────────────────────────────
export type RomanticStage = 'none' | 'interest' | 'dating' | 'partner';
export type NpcBackground = 'farmer' | 'business' | 'criminal' | 'professional' | 'family' | 'neighbour' | 'gangster' | 'dealer' | 'hustler';

export interface NPC {
  id: string;
  name: string;
  role: string;
  age: number; // adult = 18+
  npcBackground: NpcBackground;
  relationshipLevel: number; // 0–100
  trust: number;
  friendship: number;
  conflict: number;
  isPartner: boolean;
  romanticStage: RomanticStage;
  canOffer: string[];
  lastInteraction?: number;
  isPermanent: boolean;         // true = mother, brother, neighbour, child — cannot be removed
  daysUntilReencounter?: number; // cooldown days before a rejected NPC can reappear
  hasFlirted?: boolean;         // player has flirted with this NPC — enables romance progression
  isEnemy?: boolean;            // true if trust < 0 or conflict > 50
}

// ─── Events ───────────────────────────────────────────────────────────────────
export type EventType =
  | 'family' | 'business' | 'crime' | 'opportunity' | 'health'
  | 'farming' | 'neighbour' | 'random' | 'education' | 'vehicle'
  | 'relationship' | 'employment' | 'government' | 'property' | 'daily' | 'social'
  // New categories added for the event expansion — additive only, old values untouched
  | 'romance' | 'friendship' | 'npc' | 'police' | 'livestock' | 'weather'
  | 'illness' | 'festival' | 'taxi' | 'school' | 'university' | 'community'
  | 'politics' | 'corruption' | 'gambling' | 'alcohol' | 'drugs' | 'fire'
  | 'theft' | 'market' | 'loadshedding' | 'water' | 'funeral' | 'wedding'
  | 'ceremony' | 'sports' | 'religion' | 'strike' | 'protest' | 'meeting';

export type EventCategory =
  | 'daily' | 'business' | 'farming' | 'property'
  | 'vehicle' | 'relationship' | 'crime' | 'health'
  | 'education' | 'employment' | 'government'
  // New categories — additive only
  | 'romance' | 'friendship' | 'npc' | 'police' | 'livestock' | 'weather'
  | 'illness' | 'festival' | 'taxi' | 'school' | 'university' | 'community'
  | 'politics' | 'corruption' | 'gambling' | 'alcohol' | 'drugs' | 'fire'
  | 'theft' | 'market' | 'loadshedding' | 'water' | 'funeral' | 'wedding'
  | 'ceremony' | 'sports' | 'religion' | 'strike' | 'protest' | 'meeting';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category?: EventCategory;
  choices: EventChoice[];
  day: number;
}

export interface EventChoice {
  label: string;
  outcome: string;
  effect: Partial<{
    statsChange: Partial<PlayerStats>;
    cashChange: number;
    reputationChange: number;
    imprisoned: boolean;
    injured: boolean;
    inventoryAdd: InventoryItem[];
    inventoryRemove: { id: string; quantity: number }[];
    enrollJob: string;
    changeLocation: Location;
    // New effect hooks added for the event expansion — additive only
    wantedLevelChange: number;        // crime heat delta
    businessReputationChange: number; // applies to a random owned business
    vehicleConditionChange: number;   // applies to a random owned vehicle
    joinPrisonGang: PrisonGang; // sets prison gang affiliation (accept recruitment)
  }>;
  // NPC meet event extras (set by engine, consumed by context reducer)
  npcData?: { id: string; name: string; role: string; age: number; background: string; canOffer: string[] };
  rejectedNpc?: { id: string; cooldownDays: number };
}

// ─── Prison ───────────────────────────────────────────────────────────────────
export type PrisonGang = 'none' | '26' | '27' | '28' | 'amajita' | 'reformers';

export interface PrisonState {
  imprisoned: boolean;
  sentenceDays: number;
  daysServed: number;
  crime: string;
  gangMember: boolean; // kept for back-compat with existing UI checks — derived from gang !== 'none'
  gang: PrisonGang;
  prisonEarnings: number;
  facility: string;
  prisonSkills: { study: number; fitness: number };
  goodBehaviorStreak: number;              // consecutive days served with no incident
  incidentCooldowns: Record<string, number>; // prison event template id -> last day fired
}

// ─── Injury ───────────────────────────────────────────────────────────────────
export interface InjuryState {
  injured: boolean;
  severity: 'minor' | 'serious' | 'crippling' | null;
  daysInHospital: number;
  daysHealing: number;
  crippled: boolean; // permanent — cannot do hard labour
  description: string;
}

// ─── Finance Tracking ─────────────────────────────────────────────────────────
export interface FinanceRecord {
  day: number;
  description: string;
  amount: number; // positive = income, negative = expense
  category: 'work' | 'business' | 'farm' | 'shop' | 'rent' | 'education' | 'bank' | 'government' | 'crime' | 'fine' | 'property' | 'vehicle' | 'other';
}

// ─── Crime ────────────────────────────────────────────────────────────────────
export type CrimeType =
  | 'Pickpocketing' | 'Shoplifting' | 'Bootlegging' | 'Drug Running'
  | 'Mugging' | 'Burglary' | 'GTA' | 'Carjacking'
  | 'Selling Drugs' | 'Selling Cannabis' | 'Fraud' | 'Extortion'
  | 'Illegal Gambling' | 'Armed Robbery';

export interface CrimeRecord {
  day: number;
  crime: CrimeType;
  caught: boolean;
  income: number;
  finePaid: number;
  sentenceDays: number;
}

export interface CrimeState {
  cannabisSalesCaught: number; // times caught selling cannabis
  totalCrimes: number;
  crimeRecords: CrimeRecord[];
  wantedLevel: number; // 0-100, decays over time, increases encounter chance
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface AnalyticsData {
  jobsChosen:        Record<string, number>;
  hustlesChosen:     Record<string, number>;
  propertiesBought:  Record<string, number>;
  vehiclesBought:    Record<string, number>;
  businessesStarted: Record<string, number>;
  locationsVisited:  Record<string, number>;
  adsWatched:        Record<string, number>;
}

// ─── Bug Report ───────────────────────────────────────────────────────────────
export interface BugReport {
  id: string;
  day: number;
  description: string;
  category: 'crash' | 'balance' | 'gameplay' | 'ui' | 'other';
  gameVersion: string;
  timestamp: number;
}

// ─── Ad Rewards ───────────────────────────────────────────────────────────────
export type AdRewardType =
  | 'extra_action' | 'cash_early' | 'cash_mid' | 'cash_late'
  | 'edu_boost' | 'farm_boost' | 'biz_boost';

export interface AdRewardState {
  // tracks last day each ad type was claimed (or number of times today)
  lastClaimedDay: Partial<Record<AdRewardType, number>>;
  // bonus actions granted today via ad
  bonusActionsToday: number;
}
export interface DaySummary {
  day: number;
  income: number;
  expenses: number;
  statsChanges: Partial<PlayerStats>;
  events: string[];
  highlights: string[];
}

// ─── Auto-Consume Settings ────────────────────────────────────────────────────
export interface AutoConsumeSettings {
  enabled: boolean;
  hungerThreshold: number; // auto-eat when hunger drops below this
  threshold: number; // alias used in UI display
}

// ─── Save Slot Meta ───────────────────────────────────────────────────────────
export interface SaveSlotMeta {
  playerName: string;
  day: number;
  timestamp: number;
  location: string;
}

// ─── Full Game State ──────────────────────────────────────────────────────────
export interface GameState {
  // Meta
  version: number;
  gameStarted: boolean;
  day: number;
  dayPhase: 'morning' | 'afternoon' | 'evening' | 'night';
  actionsUsedToday: string[];
  maxActionsPerDay: number;

  // Player
  playerName: string;
  gender: Gender;
  background: Background;
  age: number;
  location: Location;
  qualifications: Qualification[];
  currentJob: Job | null;
  formalEmployment: FormalEmployment | null;
  experience: number;
  industryExperience: IndustryExperience;
  perks: string[]; // Unlocked passive skills

  // Stats
  stats: PlayerStats;

  // Finances
  cash: number;
  bank: BankAccount;
  financeHistory: FinanceRecord[];

  // Education
  currentCourse: CourseEnrollment | null;
  completedCourses: string[];

  // Business
  businesses: Business[];

  // Farming
  cropPlots: CropPlot[];
  orchardPlots: OrchardPlot[];
  livestock: LivestockGroup[];
  farmLaborers: FarmLaborer[];
  cropCyclesCompleted: number;

  // Property
  properties: Property[];
  currentPropertyId: string | null;

  // Vehicles
  vehicles: Vehicle[];

  // Inventory
  inventory: InventoryItem[];
  autoConsume: AutoConsumeSettings;

  // Relationships
  npcs: NPC[];
  daysUntilNextNpcEncounter: number; // days until player can meet a new NPC via events

  // Weather & Environment
  weather: 'Sunny' | 'Rain' | 'Heatwave' | 'Storm';

  // Events
  pendingEvents: GameEvent[];
  eventHistory: string[];
  eventCooldowns: Record<string, number>; // templateId -> day last fired, prevents repeats too soon

  // Crime
  crimeState: CrimeState;

  // Day Summary
  lastDaySummary: DaySummary | null;
  showDaySummary: boolean;

  // Special states
  prison: PrisonState;
  injury: InjuryState;

  // Settings
  settings: {
    textSize: 'small' | 'medium' | 'large';
    soundEnabled: boolean;
  };

  // Ad rewards
  adRewards: AdRewardState;
  registeredBusinessNames: string[];

  // Plot ownership — purchased empty plots ready for planting
  cropPlotsOwned: number;   // count of purchased crop land plots
  orchardPlotsOwned: number; // count of purchased orchard plots

  // Analytics
  analyticsData: AnalyticsData;

  // Bug reports (stored locally)
  bugReports: BugReport[];
}
