# Requirements Document

## 1. Application Overview

**Application Name:** Surviving South Africa

**Application Description:** A realistic text-based mobile life simulation RPG where players navigate modern South African society, striving to survive, escape poverty, build wealth, maintain relationships, improve education, and create a successful life. The game features deeply interconnected systems where every player choice affects future opportunities and events are generated based on logical context.

**Core Design Principle:** Every system must connect to every other system. Player choices must affect future opportunities. Events must be generated only when they make logical sense (e.g., business contracts only appear if the player owns a business, farming opportunities only appear if the player owns farmland, formal jobs require qualifications).

**Visual Design:** Dark, cinematic South African township/survival theme with dark backgrounds, warm amber/gold accents, muted earth tones, and high contrast text.

## 2. Users and Usage Scenarios

**Target Users:** Mobile game players interested in realistic life simulation, strategy, and role-playing experiences, particularly those interested in South African culture and society.

**Core Usage Scenarios:**
- Players create a character with specific background and start their journey from different socioeconomic positions
- Players make daily decisions to manage stats, pursue education, find employment, start businesses, and build relationships
- Players navigate interconnected systems where actions in one area unlock or affect opportunities in others
- Players experience context-aware events that reflect their current situation, assets, and relationships

## 3. Page Structure and Functional Description

### Page Structure (Tree View)

```
Start Screen
├── New Game
│   └── Character Creation
├── Continue
├── Load Save
├── Settings
└── Exit

Main Game Interface
├── 1. Daily Actions
│   ├── Work/Hustles
│   ├── Exercise
│   ├── Study
│   ├── Socialize
│   ├── Rest
│   ├── Shower
│   └── Crime Options
├── 2. Education
│   ├── Universities
│   ├── TVET Colleges
│   └── Short Course Institutions
├── 3. Employment & Hustles
│   ├── Formal Employment
│   ├── Informal Work
│   └── Hustles
├── 4. Business
│   ├── Business List
│   ├── Start New Business
│   └── Business Management
├── 5. Farming
│   ├── Crop Management
│   ├── Livestock Management
│   ├── Farm Equipment
│   └── Sell Produce
├── 6. Property
│   ├── Current Properties
│   ├── Rent Property
│   └── Purchase Property
├── 7. Vehicles
│   ├── Owned Vehicles
│   └── Purchase Vehicle
├── 8. Shop
│   ├── Food Items
│   ├── Hygiene Products
│   ├── Clothing
│   ├── Farming Equipment & Inputs
│   └── Weaponry/Black Market
├── 9. Inventory
│   ├── Food
│   ├── Cooked Meals
│   ├── Harvest
│   ├── Livestock Products
│   ├── Hygiene
│   ├── Clothing
│   ├── Farm Equipment
│   ├── Weapons
│   └── Data/Documents
├── 10. Bank
│   ├── Current Account
│   └── 32-Day Notice Account
├── 11. Government Services
│   ├── SASSA
│   ├── SAPS
│   ├── Traffic Department
│   └── Business Registration
├── 12. Relationships
│   ├── Default NPCs (Mother, Brother, Neighbour)
│   ├── Partner/Spouse Slot
│   └── Four Dynamic NPC Slots
├── 13. Character Profile
│   ├── Stats Overview
│   └── Finance Tab
├── 14. Crime Menu
│   ├── Crime Options
│   └── Black Market Access
├── 15. Save Game
└── 16. Settings
```

### Functional Description by Page

#### Start Screen

**New Game**
- Initiates character creation process
- Leads to Character Creation page

**Continue**
- Resumes the most recent auto-saved or manually saved game

**Load Save**
- Displays list of saved games with timestamps
- Player selects a save to load

**Settings**
- Access game settings (audio, notifications, display options)

**Exit**
- Closes the application

#### Character Creation

**Player Name Input**
- Player enters character name

**Gender Selection**
- Options: Male, Female

**Background Selection**
- Unemployed Youth (Village): Low starting money, basic education, village location, limited starting skills, basic opportunities
- Former College Dropout (Township): Moderate starting money, partial higher education, township location, some skills, moderate opportunities
- Unemployed Graduate (Suburb): Low starting money, completed higher education, suburb location, good skills, better opportunities
- Struggling Farmer (Farm): Moderate starting money, basic education, farm location, farming skills, farming opportunities
- Hustler (Township/Town): Low starting money, basic education, township/town location, street skills, hustling opportunities

**Start Game**
- Confirms character creation and begins game

#### Main Game Interface

**Screen Header Display**
- Every screen header shows: cash balance, energy status, and stats most relevant to that screen's actions
- Examples: Farming screen shows farming-relevant stats; Crime screen shows stress/reputation; Hospital shows health; Education shows intelligence/education

**Day Summary Popup**
- Modal/popup appears at the start of each new day
- Shows: income earned, expenses, events that occurred, stats changes, key happenings of the previous day

**Player Stats Display**
- Health, Hunger, Energy, Fitness, Hygiene, Stress, Happiness, Intelligence, Education, Reputation, Discipline, Endurance, Money
- Stats update based on player actions

**Current Location Display**
- Shows player's current location: Village, Township, Informal Settlement, Town, Suburb, City, Farm
- Location affects available jobs, businesses, shops, properties, events, and NPCs

**Main Menu Access**
- Numbered menu (1-16) for quick navigation

#### 1. Daily Actions

**Work/Hustles**
- Displays available work options based on player's qualifications, location, and assets
- Formal Employment (requires qualifications): Teacher, Doctor, Nurse, Accountant, Police Officer, Engineer, Clerk
- Informal Work: Gardening, Domestic Work, Piece Jobs, Car Wash, Street Vendor, Construction Labour, Farm Labour, Security
- Hustles: Reselling, Spaza Trading, Food Sales, Transport Services
- Player selects work option, earns income based on skills, reputation, location, and experience
- Work frequency limit: If player has formal employment, can only work/hustle 1 time per day. If player has NO formal employment, can work/hustle 2 times per day
- Affects Energy, Stress, Money, and Industry Experience stats

**Exercise**
- Options: Running, Calisthenics, Weightlifting, Sports
- Improves Fitness, Health, Energy, Confidence, Discipline, Endurance
- Affects Energy, Fitness, Discipline, and Endurance stats

**Study**
- Player studies current enrolled course or self-study
- Improves Intelligence and Education stats
- Affects Energy, Stress, and Education stats

**Socialize**
- Options: Community Events, Taverns, Hanging Out, Local Gatherings
- Community Events boost Reputation
- Tavern visits may reduce Reputation
- Can create new NPC relationships or improve existing ones
- New NPC relationships actually occur when socializing
- Affects Happiness, Stress, Reputation, and Relationship stats

**Rest**
- Player rests to recover Energy
- Restores Energy stat

**Shower**
- Player showers to improve Hygiene
- Requires hygiene items from inventory
- Improves Hygiene stat

**Crime Options**
- Quick access to crime activities from daily actions menu
- Links to dedicated Crime Menu for full crime options

#### 2. Education

**Universities**
- Displays available university programs
- Programs: MBChB (unlocks Doctor career), Accounting Degree (unlocks Accountant career), Teaching Degree (unlocks Teacher career), Engineering Degree (unlocks Engineer career), Nursing Degree (unlocks Nurse career)
- Requires: Enrollment fees, time commitment, study effort
- Player enrolls in program, tracks progress

**TVET Colleges**
- Displays available TVET programs
- Programs: Policing/Law Enforcement Diploma (unlocks Police Constable career), Technical programs (unlock technical careers)
- Requires: Enrollment fees, time commitment, study effort

**Short Course Institutions**
- Displays available short courses
- Courses: Clerk Certificate (unlocks Clerk career), other skill-based courses
- Requires: Course fees, time commitment

**Education Progress Tracking**
- Shows current enrollment, progress, and completion status

#### 3. Employment & Hustles

**Formal Employment**
- Lists available formal jobs based on player's qualifications and location
- Each job has a promotion chain with progressive ranks
- Jobs grouped by industry: Healthcare, Education, Law Enforcement, Finance, Engineering
- Healthcare Industry: Doctor (Junior Doctor → Medical Officer → Senior Medical Officer → Specialist → Chief Specialist → Medical Director), Nurse (Enrolled Nurse → Staff Nurse → Senior Nurse → Nursing Manager → Chief Nursing Officer)
- Education Industry: Teacher (Junior Teacher → Teacher → Senior Teacher → Head of Department → Deputy Principal → Principal → District Education Officer)
- Law Enforcement Industry: Police Officer (Police Constable → Police Sergeant → Warrant Officer → Lieutenant → Station Commander → Police Captain → Police Minister)
- Finance Industry: Accountant (Junior Accountant → Accountant → Senior Accountant → Financial Manager → Chief Financial Officer)
- Engineering Industry: Engineer (Junior Engineer → Engineer → Senior Engineer → Principal Engineer → Chief Engineer → Engineering Director)
- Administrative: Clerk (Junior Clerk → Clerk → Senior Clerk → Supervisor → Manager)
- Player applies for job, tracks employment status
- Earns regular income based on rank and pay cycle (weekly, biweekly, or monthly)
- Pay automatically added to cash balance at correct interval when day passes
- Player advances through promotion chain when meeting experience/time requirements

**Informal Work**
- Lists available informal work based on location and player's physical condition
- Work: Gardening, Domestic Work, Piece Jobs, Car Wash, Street Vendor, Construction Labour, Farm Labour, Security
- Player selects work, earns income per session

**Hustles**
- Lists available hustles based on location and player's assets
- Hustles: Reselling, Spaza Trading, Food Sales, Transport Services
- Player engages in hustle, earns income based on effort and market conditions

#### 4. Business

**Business List**
- Displays all businesses owned by player
- Shows business name, type, location, earnings, status, industry category

**Start New Business**
- Requires: Capital, Licenses, Registration
- Business types grouped by industry: Retail (Spaza Shop, Tuck Shop), Technology (Internet Cafe), Services (Car Wash, Salon), Transport (Taxi Business), Construction (Construction Company), Agriculture (Farm Supply Store), Cannabis Business, Drug Business
- Cannabis Business and Drug Business are high-risk ventures
- Player selects business type, completes registration, invests capital
- Business income depends on location, demand, reputation, management, and industry experience

**Business Management**
- Player manages individual business operations
- Tracks income, expenses, inventory, staff
- Business events directly affect business earnings
- Operating business increases industry experience in corresponding industry

#### 5. Farming

**Availability Condition**
- Farming menu only accessible if player owns farm or farming property

**Crop Management**
- Crop types: Maize, Spinach, Cabbage, Potatoes, Tomatoes, Onions, Carrots, Beetroot, Peppers, Chillies, Cucumber, Butternut, Watermelon, Cannabis
- Cannabis can be grown as a crop
- Player plants crops using seeds from inventory
- Requires: Seeds, Fertilizer, Pesticide, Herbicide, Labour
- Player manages crop growth, applies inputs
- Harvest stored in inventory AND visible in farming menu
- Harvest can be sold in small or bulk units from farming menu

**Livestock Management**
- Livestock types: Chickens, Goats, Cattle, Pigs
- Livestock does NOT breed automatically
- No pregnancy, no calves/chicks/piglets without intervention
- Artificial Insemination option: R3000 per animal, triggers pregnancy (goat/cow)
- Daily Produce System:
  + Chickens produce 3-5 eggs per day each; 25% chance each egg hatches a chick (chick grows into chicken, increasing flock)
  + Animal feed boosts egg production
  + Goats produce 5-8L milk each per day (5 female goats = 25-40L/day); only when pregnant
  + Cattle produce milk only when pregnant
  + Pigs do NOT produce daily items
- All produce (eggs, milk) exists BOTH in inventory AND farming menu
- Eggs and milk usable as food recipe ingredients
- Player can: Sell, Slaughter livestock
- Slaughtered animals produce meat inventory items only when explicitly slaughtered by player

**Farm Equipment**
- Equipment: Hoe, Spade, Rake, Irrigation Pipe, Water Tank, Sprayer, Wheelbarrow, Plough
- Player purchases equipment from shop
- Equipment stored in inventory, used for farming operations

**Sell Produce**
- Harvest items (eggs, milk, crops, cannabis) sellable in small or bulk units
- Cannabis sales carry risk: being caught = fine (not imprisonment) unless caught multiple times

#### 6. Property

**Current Properties**
- Lists all properties owned or rented by player
- Shows property type, location, status (owned/rented), monthly cost

**Rent Property**
- Displays available rental properties based on location and player's budget
- Property types: Shack, RDP House, Village House, Townhouse, Suburban House, Farm, Apartment
- Player selects property, pays deposit and monthly rent

**Purchase Property**
- Displays available properties for purchase based on location and player's finances
- Requires: Down payment or full cash payment, or financing approval
- Player purchases property, property affects storage, comfort, opportunities, location

#### 7. Vehicles

**Owned Vehicles**
- Lists all vehicles owned by player
- Shows vehicle type, condition, license status

**Purchase Vehicle**
- Displays available vehicles for purchase
- Vehicle types: Bicycle, Motorcycle, Taxi, Car, Bakkie, Truck
- Requires: Purchase price, valid license (for motorized vehicles)
- Vehicles affect travel, business opportunities, employment opportunities

#### 8. Shop

**Food Items**
- Items: Pilchards, Tuna, Chakalaka, Viennas, Sausage, Beef, Mutton, Pork, Chicken Pieces, Braai Pack, Eggs, Bread, Rice, Maize Meal, Flour, Samp, Beans, 2-Minute Noodles, Chicken Mala, Chicken Feet, Chicken Liver, Cooking Oil
- Items displayed in realistic package sizes
- Some items consumed in portions: Maize Meal (5kg) = 8 portions, Cooking Oil (2L) = 10 portions, Rice (2kg) = 6 portions, Flour (1kg) = 5 portions
- Player selects items, adds to cart, purchases

**Hygiene Products**
- Items: Soap, Toothpaste, Toothbrush, Shampoo, Body Spray, Roll-On, Lotion
- Player selects items, adds to cart, purchases

**Clothing**
- Categories: Casual, Formal, Labour Workwear
- Player selects items, adds to cart, purchases

**Farming Equipment & Inputs**
- Equipment: Hoes, Spades, Rakes, Irrigation Pipes, Water Tanks, Sprayers, Wheelbarrows, Ploughs
- Inputs: Fertilizer (bags), Pesticide (bottles), Herbicide (bottles), Animal Feed (bags)
- Player selects items, adds to cart, purchases

**Weaponry/Black Market**
- Sub-menu for weapons and black market items
- Weapons boost crime success chances
- Player can be arrested for possession of certain weapons (firearms)
- Player selects items, adds to cart, purchases

**Purchase Process**
- Player reviews cart, confirms purchase
- Items deducted from cash balance, added to inventory

#### 9. Inventory

**Inventory Tabs**
- Food: Raw food items purchased from shop
- Cooked Meals: Meals prepared through cooking system
- Harvest: Crops harvested from farm (including cannabis)
- Livestock Products: Eggs, milk, and meat from livestock
- Hygiene: Hygiene products
- Clothing: Clothing items
- Farm Equipment: Farming tools, equipment, and inputs (fertilizer, pesticide, herbicide, animal feed)
- Weapons: Weapons purchased from black market
- Data/Documents: Licenses, certificates, contracts

**Item Management**
- Player views items in each tab
- Player can use, consume, sell, or discard items

**Cooking System**
- Player selects recipe from available recipes
- Expanded recipe list: every shop food item appears in at least one recipe
- Recipes include: Rice and Pilchards, Pap and Pilchards, Rice and Eggs, Bread and Eggs, Pap and Liver, Pap and Sausage, Samp and Beans, and additional recipes using all shop food items
- Eggs and milk from farming produce usable as cooking ingredients
- System checks if required ingredients are in inventory
- Player cooks meal, cooked meal added to Cooked Meals tab
- Cooked meals satisfy hunger when consumed

**Auto-Consume Option**
- Player enables/disables auto-consume feature
- When enabled and hunger drops below threshold, best available meal is automatically consumed

#### 10. Bank

**Current Account**
- Displays current account balance
- Player can deposit cash or withdraw to cash
- Transactions update bank balance and cash balance

**32-Day Notice Account**
- Displays notice account balance
- Player deposits money, money locked for 32 days
- Generates monthly interest
- Player can withdraw after lock period

#### 11. Government Services

**SASSA**
- Player applies for social grants
- Tracks grant application status and payments

**SAPS**
- Player reports crimes or checks police case status
- If player commits crime and is arrested, they play out sentence in prison
- During prison sentence: Player can do labour (earns income), exercise, study, or socialize (potential of joining gang)
- After sentence completion, player returns to normal game

**Traffic Department**
- Player applies for vehicle licenses
- Player renews licenses
- Tracks license status

**Business Registration**
- Player registers new business
- Obtains business licenses and permits

#### 12. Relationships

**Default NPCs**
- Mother, Brother, Neighbour (always present)
- Displays relationship level, trust, friendship, conflict

**Partner/Spouse Slot**
- Permanent slot for romantic partner or spouse
- Player can have romantic interest in adult NPCs
- Romantic relationship progression: interest → dating → partner
- When partner relationship established: player hunger no longer decreases (NPC partner auto-cooks meals)
- Displays relationship level, trust, friendship, conflict

**Four Dynamic NPC Slots**
- Slots for additional NPCs met through socialization and events
- NPCs can help, hinder, offer opportunities, or create events
- NPC relationship benefits determined by NPC background: business boosts, farming boosts, job referrals, gift exchanges
- Crime-related NPCs exist; relationships can begin through crime events
- Displays relationship level, trust, friendship, conflict

**Relationship Management**
- Player interacts with NPCs to improve or damage relationships
- Relationship levels affect NPC behavior and opportunities

#### 13. Character Profile

**Profile Display**
- Name, Age, Location, Background, Education, Employment (current rank and promotion progress), Businesses, Properties, Vehicles, Relationships, Finances, Statistics
- Industry Experience: Displays experience level in each industry (Healthcare, Education, Law Enforcement, Finance, Engineering, Retail, Technology, Services, Transport, Construction, Agriculture)
- Comprehensive overview of player's current status

**Finance Tab**
- Clearly shows ALL income with sources AND all expenses with sources
- Categorised breakdown: work income, business income, farming income, crime income, rent paid, food costs, loan repayments, labor wages, etc.
- Generates financial reports

#### 14. Crime Menu

**Crime Options**
- Available in both daily actions and dedicated crime menu
- Crime options: Bootlegging, Pickpocketing, Burglary, Mugging, Selling Drugs, GTA (Grand Theft Auto), Carjacking, Drug Running, Extortion, Fraud/Scam, Shoplifting, Illegal Gambling, Armed Robbery
- Prison sentence severity proportional to crime seriousness
- Crime event frequency by location: scarce in Town/Farm/Suburb; moderate in Village; frequent in Township/Informal Settlement
- Weapons boost crime success chances
- Player can be arrested and serve prison sentence

**Black Market Access**
- Access to black market items and weapons
- Links to Shop Weaponry/Black Market sub-menu

**Drug Purchasing**
- Drugs can be bought in Township, City and Informal Settlement (high risk areas)
- Used for Drug Running or Selling Drugs crimes

#### 15. Save Game

**Manual Save**
- Player manually saves game progress
- Creates save file with timestamp

**Auto Save**
- Game automatically saves at regular intervals
- Saves: Player data, Businesses, Properties, Relationships, Education, Inventory, Finances, Farms, Vehicles, Events, Industry Experience

#### 16. Settings

**Game Settings**
- Audio settings (music, sound effects volume)
- Notification settings
- Display settings (text size, theme)
- Language settings

## 4. Business Rules and Logic

### System Interconnection Rules

**Context-Aware Event Generation**
- Business contracts only appear if player owns a business
- Farming opportunities only appear if player owns farmland
- Formal jobs require qualifications
- Vehicles require licenses
- Properties require money or financing
- NPC reactions depend on relationship levels
- Education unlocks careers
- Careers unlock income
- Income unlocks property and business ownership
- Crime events are random but scarce
- Crime event frequency varies by location

**Player Progression Logic**
- Background determines starting conditions (money, education, location, skills, opportunities)
- Education level unlocks specific career paths
- Every qualification has a corresponding formal job it unlocks
- Career income enables property purchase and business investment
- Property ownership affects available opportunities and events
- Vehicle ownership enables transport-related work and business
- Relationship levels affect NPC assistance and event outcomes
- Industry experience increases with time worked in that industry
- Higher industry experience unlocks higher-paying jobs and business opportunities in that industry

### Stat Management Rules

**Stat Interactions**
- Low Hunger reduces Energy and Health
- Low Energy reduces work performance and income
- Low Hygiene reduces Happiness and Reputation
- High Stress reduces Health and Happiness
- High Fitness improves Health and work performance
- High Intelligence improves education progress and career opportunities
- High Reputation improves business income and relationship building
- High Discipline improves work performance and education progress
- High Endurance improves physical work performance

**Stat Recovery and Decline**
- Hunger increases over time, satisfied by consuming food
- When partner relationship established: player hunger no longer decreases (NPC partner auto-cooks meals)
- Energy decreases with activities, restored by rest
- Hygiene decreases over time, improved by showering
- Stress increases with work and challenges, reduced by rest and socialization
- Fitness improves with exercise, declines without activity
- Education stat increases with study actions
- Discipline and Endurance stats increase with exercise
- Reputation increases with community events, may decrease with tavern visits

### Income and Expense Rules

**Income Sources**
- Formal employment: Regular salary based on qualification, rank, and experience, paid according to job's pay cycle (weekly, biweekly, or monthly)
- Pay automatically added to cash balance at correct interval when day passes
- Informal work: Per-session payment based on work type and location
- Hustles: Variable income based on effort and market conditions
- Business: Profit based on location, demand, reputation, management, and industry experience
- Farming: Income from selling harvest and livestock products
- Crime: Income from successful crime activities

**Expense Categories**
- Food and hygiene purchases
- Property rent or mortgage payments
- Education fees
- Business operating costs
- Vehicle maintenance and fuel
- Healthcare costs (if injured)
- Farming inputs (fertilizer, pesticide, herbicide, animal feed)
- Fines from crime activities
- Labor wages
- Loan repayments

### Formal Employment Rules

**Qualification-Job Linkage**
- Every qualification unlocks a specific formal job starting rank
- MBChB unlocks Junior Doctor
- Accounting Degree unlocks Junior Accountant
- Teaching Degree unlocks Junior Teacher
- Engineering Degree unlocks Junior Engineer
- Nursing Degree unlocks Enrolled Nurse
- Policing/Law Enforcement Diploma unlocks Police Constable
- Clerk Certificate unlocks Junior Clerk

**Pay Cycle System**
- Each formal job has a fixed pay cycle: weekly, biweekly, or monthly
- Pay is automatically added to player's cash balance at the correct interval each time a day passes
- Example: If pay cycle is weekly, salary is added every 7 days

**Promotion Chain System**
- Every formal job category has a progressive promotion chain
- Player advances through ranks when meeting experience/time requirements
- Each rank has higher salary and requirements
- Promotion chains:
  + Healthcare - Doctor: Junior Doctor → Medical Officer → Senior Medical Officer → Specialist → Chief Specialist → Medical Director
  + Healthcare - Nurse: Enrolled Nurse → Staff Nurse → Senior Nurse → Nursing Manager → Chief Nursing Officer
  + Education - Teacher: Junior Teacher → Teacher → Senior Teacher → Head of Department → Deputy Principal → Principal → District Education Officer
  + Law Enforcement - Police: Police Constable → Police Sergeant → Warrant Officer → Lieutenant → Station Commander → Police Captain → Police Minister
  + Finance - Accountant: Junior Accountant → Accountant → Senior Accountant → Financial Manager → Chief Financial Officer
  + Engineering - Engineer: Junior Engineer → Engineer → Senior Engineer → Principal Engineer → Chief Engineer → Engineering Director
  + Administrative - Clerk: Junior Clerk → Clerk → Senior Clerk → Supervisor → Manager

### Industry Experience System

**Industry Categories**
- All businesses and formal jobs are grouped by industry: Healthcare, Education, Law Enforcement, Finance, Engineering, Retail, Technology, Services, Transport, Construction, Agriculture

**Experience Tracking**
- Player has industry experience stats tracked per industry
- Industry experience increases with time worked in that industry (formal employment or business operations)
- Higher industry experience unlocks higher-paying jobs and business opportunities in that industry
- Industry experience is displayed in the Character Profile screen

### Work Frequency Rules

**Daily Work Limits**
- If player has formal employment: can only work/hustle 1 time per day
- If player has NO formal employment: can work/hustle 2 times per day

### Farming Rules

**Crop Cycle**
- Player plants crops using seeds
- Crops require inputs (fertilizer, pesticide, herbicide) and labour
- Crops grow over time
- Player harvests crops, stored in inventory AND visible in farming menu
- Harvest can be sold in small or bulk units from farming menu
- Cannabis can be grown as a crop

**Livestock Breeding**
- Livestock does NOT breed automatically
- No pregnancy, no calves/chicks/piglets without intervention
- Artificial Insemination option: R3000 per animal, triggers pregnancy (goat/cow)

**Livestock Daily Produce System**
- Chickens produce 3-5 eggs per day each
- 25% chance each egg hatches a chick (chick grows into chicken, increasing flock)
- Animal feed boosts egg production
- Goats produce 5-8L milk each per day (5 female goats = 25-40L/day); only when pregnant
- Cattle produce milk only when pregnant
- Pigs do NOT produce daily items
- All produce (eggs, milk) exists BOTH in inventory AND farming menu
- Eggs and milk usable as food recipe ingredients

**Livestock Slaughter System**
- Livestock only produce meat items when explicitly slaughtered by player
- No automatic meat generation
- Slaughtered livestock produces meat inventory items

**Animal Feed Mechanic**
- Animal Feed purchased from shop can be applied to livestock
- Increases daily egg production for chickens
- Works similarly to fertilizer for crops

**Artificial Insemination**
- Costs R3000 per animal
- Triggers pregnancy for goats and cattle
- Enables milk production for pregnant animals

### Business Rules

**Business Establishment**
- Requires capital investment, licenses, and registration
- Business type determines required capital and potential income
- Location affects demand and income potential
- Business grouped by industry category
- Cannabis Business and Drug Business are high-risk ventures

**Business Operations**
- Business generates income based on location, demand, reputation, management, and industry experience
- Business events (e.g., supply issues, customer complaints, opportunities) directly affect earnings
- Player can manage multiple businesses simultaneously
- Operating business increases industry experience in corresponding industry

### Relationship Rules

**NPC Relationship Dynamics**
- Relationship level (trust, friendship, conflict) affects NPC behavior
- High relationship levels: NPCs offer help, opportunities, support
- Low relationship levels: NPCs may hinder, create obstacles, or ignore player
- Relationship levels change based on player interactions and choices
- New NPC relationships actually occur when socializing

**Romantic Relationships**
- Player can have romantic interest in adult NPCs
- Romantic relationship progression: interest → dating → partner
- When partner relationship established: player hunger no longer decreases (NPC partner auto-cooks meals)

**Relationship Opportunities**
- NPCs can provide job leads, business opportunities, financial assistance
- NPC relationship benefits determined by NPC background: business boosts, farming boosts, job referrals, gift exchanges
- Partner/Spouse can provide emotional support, shared income, or conflict
- Crime-related NPCs exist; relationships can begin through crime events

### Crime System Rules

**Crime Options**
- Available in both daily actions and dedicated crime menu
- Crime options: Bootlegging, Pickpocketing, Burglary, Mugging, Selling Drugs, GTA (Grand Theft Auto), Carjacking, Drug Running, Extortion, Fraud/Scam, Shoplifting, Illegal Gambling, Armed Robbery

**Crime Success and Consequences**
- Weapons boost crime success chances
- Prison sentence severity proportional to crime seriousness
- Being caught selling cannabis = fine (not imprisonment) unless caught multiple times
- Player can be arrested for possession of certain weapons (firearms)

**Crime Event Frequency by Location**
- Scarce in Town/Farm/Suburb
- Moderate in Village
- Frequent in Township/Informal Settlement

**Drug System**
- Drugs can be bought in Township, City and Informal Settlement (high risk areas)
- Used for Drug Running or Selling Drugs crimes
- Player can start Drug Business (high risk)

### Recipe and Food Portion Rules

**Recipe System**
- Expanded recipe list: every shop food item appears in at least one recipe
- Eggs and milk from farming produce usable as cooking ingredients
- Player selects recipe, system checks ingredients, player cooks meal

**Portioned Food Items**
- Some food items consumed in portions:
  + Maize Meal (5kg) = 8 portions
  + Cooking Oil (2L) = 10 portions
  + Rice (2kg) = 6 portions
  + Flour (1kg) = 5 portions
- Each portion consumed separately

### Special Mechanics

**No Death System**
- Player never dies in the game
- If injured, player goes to hospital
- Severe injuries may result in permanent disability (unable to do hard labour jobs)

**Crime and Imprisonment**
- If player commits crime and is arrested, they serve sentence in prison
- During prison: Player can do labour (earns income), exercise, study, or socialize (potential of joining gang)
- After sentence, player returns to normal game with potential reputation impact

**Auto-Consume Meals**
- When enabled, system automatically consumes best available meal when hunger drops below threshold
- Prioritizes cooked meals over raw food items
- Disabled when partner relationship established (partner auto-cooks meals)

**Day Summary System**
- Modal/popup appears at the start of each new day
- Shows: income earned, expenses, events that occurred, stats changes, key happenings of the previous day

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| Player attempts to access farming menu without owning farm | Display message: Farming requires owning a farm or farming property |
| Player attempts to start business without sufficient capital | Display message: Insufficient funds to start this business |
| Player attempts to apply for formal job without required qualification | Display message: This job requires [specific qualification] |
| Player attempts to purchase vehicle without license | Display message: Valid license required to purchase this vehicle |
| Player attempts to rent/purchase property without sufficient funds | Display message: Insufficient funds for deposit/down payment |
| Player hunger reaches critical level without food in inventory | Health and Energy decrease rapidly, player must purchase food |
| Player hunger reaches critical level with partner relationship | Hunger does not decrease, partner auto-cooks meals |
| Player energy reaches zero | Player cannot perform work or activities until rest |
| Player is arrested for crime | Player enters prison mode, serves sentence, then returns to normal game |
| Player is severely injured | Player goes to hospital, may become permanently disabled (cannot do hard labour) |
| Player attempts to breed livestock without artificial insemination | No breeding occurs, no pregnancy, no offspring |
| Player attempts to collect milk from non-pregnant goats/cattle | No milk produced, only pregnant animals produce milk |
| Player attempts to cook recipe without required ingredients | Display message: Missing ingredients for this recipe |
| Player attempts to withdraw from 32-Day Notice Account before lock period | Display message: Funds locked until [date] |
| Business event occurs for non-existent business | Event is not generated (context-aware system prevents this) |
| Farming event occurs without farm ownership | Event is not generated (context-aware system prevents this) |
| NPC offers opportunity player cannot access due to lack of qualifications/assets | Opportunity is not generated or NPC mentions player needs to meet requirements first |
| Player with formal employment attempts to work/hustle more than 1 time per day | Display message: You can only work/hustle once per day while formally employed |
| Player without formal employment attempts to work/hustle more than 2 times per day | Display message: You have reached your daily work limit |
| Player attempts to apply Animal Feed to pigs expecting daily produce | No daily produce generated, Animal Feed has no effect on pigs |
| Player attempts to collect meat from livestock without slaughtering | No meat available, player must explicitly slaughter livestock to obtain meat |
| Player meets promotion requirements | Player is automatically promoted to next rank with increased salary |
| Player attempts to apply for job rank higher than entry level without prior experience | Display message: You must start at entry level and work your way up |
| Player caught selling cannabis first time | Fine issued, no imprisonment |
| Player caught selling cannabis multiple times | Imprisonment sentence |
| Player arrested for firearm possession | Imprisonment sentence based on weapon type |
| Player socializes but no new NPC relationship created | Existing relationships improve or new relationship created based on event |
| Player attempts to use eggs/milk from inventory as recipe ingredients | Eggs and milk from Livestock Products tab usable in recipes |
| Player attempts to sell cannabis in bulk from farming menu | Cannabis sold, risk of being caught and fined |
| Player attempts to purchase drugs outside high-risk areas | Drugs not available, only available in Township, City, Informal Settlement |
| Player attempts to start Cannabis/Drug Business without capital | Display message: Insufficient funds to start this business |
| Player with partner relationship enabled auto-consume | Auto-consume disabled, partner auto-cooks meals instead |

## 6. Acceptance Criteria

1. Player creates a character with selected background, gender, and name, and game starts with appropriate starting conditions (money, location, skills, opportunities)
2. Player performs daily actions (work, exercise, study, socialize, rest, shower, crime) and observes corresponding stat changes (Energy, Hunger, Fitness, Hygiene, Stress, Happiness, Education, Discipline, Endurance, Reputation)
3. Player enrolls in education program (e.g., Policing Diploma), studies over time, completes qualification, and unlocks corresponding career opportunity (e.g., Police Constable)
4. Player applies for and obtains formal employment matching their qualification, works regularly, and salary is automatically added to cash balance at correct pay cycle interval (weekly, biweekly, or monthly) when day passes
5. Player meets promotion requirements, advances to next rank in promotion chain, and receives increased salary
6. Player purchases food (including portioned items like Maize Meal, Cooking Oil, Rice, Flour), hygiene items, and farming equipment/inputs from shop, items appear in inventory, player consumes food to satisfy hunger
7. Player accumulates sufficient capital, registers a business in specific industry (including Cannabis/Drug Business), manages business operations, earns business income, and increases industry experience
8. Player owns farm or farming property, plants crops (including cannabis), manages livestock, applies Artificial Insemination (R3000) to goats/cattle to trigger pregnancy, collects daily eggs (3-5 per chicken) and milk (5-8L per goat, only when pregnant) in Livestock Products inventory, applies Animal Feed to boost egg production, slaughters livestock to obtain meat, sells produce in small or bulk units from farming menu, and earns income
9. Player socializes and creates new NPC relationships, builds romantic relationships (interest → dating → partner), establishes partner relationship and hunger no longer decreases (partner auto-cooks meals), receives NPC benefits based on background (business boosts, farming boosts, job referrals, gift exchanges)
10. Player accesses Crime Menu, commits crimes (Bootlegging, Pickpocketing, Burglary, Mugging, Selling Drugs, GTA, Carjacking, Drug Running, Extortion, Fraud/Scam, Shoplifting, Illegal Gambling, Armed Robbery), uses weapons to boost success chances, gets arrested and serves prison sentence proportional to crime seriousness, caught selling cannabis results in fine (imprisonment only if caught multiple times)
11. Player views screen headers showing cash balance, energy status, and relevant stats for each screen (Farming screen shows farming stats, Crime screen shows stress/reputation, Hospital shows health, Education shows intelligence/education)
12. Player starts new day and Day Summary popup appears showing income earned, expenses, events that occurred, stats changes, and key happenings of previous day
13. Player views Finance Tab in Character Profile and sees categorised breakdown of ALL income sources (work, business, farming, crime) and ALL expense sources (rent, food, loan repayments, labor wages, etc.)
14. Player cooks meals using expanded recipe list where every shop food item appears in at least one recipe, uses eggs and milk from Livestock Products as ingredients, cooked meals stored in Cooked Meals tab
15. Player purchases weapons from Weaponry/Black Market sub-menu in shop, weapons stored in inventory, player arrested for firearm possession

## 7. Out of Scope for This Release

- Multiplayer or online features
- Real-time market price fluctuations based on external data
- Advanced graphics or animations beyond text-based interface
- Voice acting or audio narration
- Integration with real-world South African government databases
- Detailed weather system affecting farming beyond basic seasonal cycles
- Complex political or election simulation systems
- Detailed crime syndicate or gang warfare mechanics beyond basic prison socialization
- Advanced AI-driven NPC personalities with natural language processing
- Cross-platform cloud save synchronization
- In-app purchases or monetization features
- Detailed vehicle maintenance and repair simulation
- Complex legal system simulation beyond basic arrest and sentencing
- Detailed healthcare system simulation beyond injury and hospital visits
- Advanced financial instruments (stocks, bonds, investments) beyond basic banking
- Detailed property renovation or construction mechanics
- Complex supply chain management for businesses
- Detailed livestock disease and veterinary care system
- Automatic livestock breeding without player intervention
- Meat production without explicit slaughter action
- Cannabis legalization or regulation system changes
- Detailed drug cartel or organized crime network mechanics
- Advanced weapon customization or upgrade systems
- Detailed court trial or legal defense mechanics
- Complex tax system or government audit mechanics