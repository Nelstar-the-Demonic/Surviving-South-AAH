# Surviving South AAH!!! - Game Design Document

## 1. CORE VISION

**Genre**: Single-player survival life simulator RPG  
**Setting**: Modern South Africa (townships, rural villages, farms, taxi ranks, informal settlements, urban areas)  
**Tone**: Realistic, gritty, stressful, emotional, darkly humorous, grounded  
**Target Audience**: Mature players seeking meaningful, challenging experiences

**Core Message**: "Surviving another month is a victory."

---

## 2. GAME SYSTEMS

### 2.1 Player Stats (Updated Daily)

Each stat ranges from 0-100. Critical thresholds trigger events and penalties.

| Stat | Description | Critical Level | Effects When Low |
|------|-------------|-----------------|-------------------|
| **Hunger** | Food security | >80 | Can't work effectively, health decreases |
| **Health** | Physical condition | <30 | Illness events, reduced energy, cannot work |
| **Stress** | Mental burden | >80 | Decision quality drops, wrong choices likely |
| **Energy** | Fatigue level | <20 | Cannot pursue demanding activities |
| **Hygiene** | Cleanliness & health | <20 | Health decreases, social penalties |
| **Hope/Morale** | Will to continue | <10 | Burnout events, depression spiral |
| **Reputation** | Community standing | Variable | Affects opportunities and social interactions |

**Money**: Tracked in Rands (R), decimal values. Every cent matters.

**Relationships**: Tracked per NPC (-100 to +100 scale):
- Family members
- Employers/hustlers
- Neighbors
- Community figures
- Police/officials

### 2.2 Daily Cycle

**Structure**:
1. **Morning (6:00-9:00)**: Wake up, see morning events, plan day
2. **Midday (9:00-17:00)**: Execute activities (work, farm, hustle, etc.)
3. **Evening (17:00-21:00)**: Social time, purchases, encounters
4. **Night (21:00-6:00)**: Sleep, recovery, dreams/reflections

**Each activity takes game time and affects stats.**

### 2.3 Resource Management

#### Money System
- **Survival minimum**: R50-100/day for basic food
- **Rent pressure**: R800-3,000/month depending on housing
- **Transport**: R10-30 per taxi ride
- **Inflation**: Prices increase gradually throughout game
- **Unexpected costs**: Medical emergencies, theft, broken equipment

#### Food System
- **Hunger increases 5-10 points per day**
- **Cheap food costs R5-20**: Bread, maize meal, beans, instant noodles
- **Balanced food costs R50-100**: Chicken, rice, vegetables
- **Prices fluctuate** based on season and local events
- **Spoilage mechanics**: Food bought spoils in 3-5 days if not refrigerated

#### Housing System
- **Options**: Shack (R300-500), Room in shared house (R600-1,200), Informal settlement (R200-400)
- **Monthly rent** due at specific dates
- **Eviction risk** if 2 months behind
- **Weather effects**: Flooding, storms damage shacks

#### Energy & Rest
- **Sleep restores energy** (8 hours = full restore)
- **Activities cost energy**: 10-40 points per activity
- **Cumulative fatigue**: Sleeping 4 hours for 3 days causes penalties
- **Burnout threshold**: 5+ consecutive days without proper sleep triggers mental health crisis

### 2.4 Economy Events

Random monthly events that affect money and prices:

- Taxi strike (transport costs x2, income loss if can't reach work)
- Salary delays (employer late paying workers)
- Load shedding (electricity outages affect heating/cooking)
- Price spikes (food costs increase 20-40%)
- Protest closures (shops/markets closed, no selling opportunity)
- Rainfall drought (farming affected, water costs increase)
- Police raids (informal workers lose goods, safety concern)

---

## 3. GAMEPLAY LOOPS

### 3.1 Work & Income Loop

**Job Hunt Phase**:
- Search for jobs in newspaper, contacts, word-of-mouth
- Apply for positions
- Attend interviews (stress cost, time cost)
- Jobs vary: Formal work (stable, R200-500/day), Side hustles (unstable, R50-300/day)

**Work Execution**:
- Manual labor (farm work, construction): Pays R80-200, high energy cost
- Service work (cleaning, gardening): Pays R50-150, medium energy
- Skilled work (repairs, tutoring): Pays R200-400, low energy cost
- Hustling (selling goods, trading): Pays R20-150, high risk of theft/police

**Unemployment Phase**:
- Job applications take time
- Stress increases each day without income
- Family pressure increases
- Social grant system (if eligible) provides R350-500/month (bureaucratic nightmare to access)

### 3.2 Farming Loop (If Rural)

**Seasonal Cycle**:
- **Planting (Spring)**: Plant maize, beans, vegetables. Costs money for seeds.
- **Maintenance (Summer)**: Water crops daily, watch for pests, maintain soil
- **Harvest (Autumn)**: Collect crops, sell or store
- **Rest (Winter)**: Plan next season, repair tools, prepare land

**Challenges**:
- Drought (water unavailable, crops fail)
- Theft (neighbors/criminals steal produce)
- Equipment breaks (plow, tools need repair R100-300)
- Weather damage (flooding, hail)
- Time investment (1-3 hours daily)
- Unpredictable yield

**Benefits**:
- Food security (grow own food)
- Extra income (sell excess)
- Reduced stress (connection to land)
- But NEVER feels easy or relaxing

### 3.3 Social Interaction Loop

**Relationship Building**:
- Each NPC has needs and opinions
- Regular interaction increases relationship (+5 to +10 per interaction)
- Neglect decreases relationship (-3 per week no contact)
- Helping gives +15 to +30 boost
- Betraying gives -50 to -100 hit

**Family Obligations**:
- Mother/Father pressure for money (R100-500 requests)
- Siblings in trouble need help (time, money, stress)
- Extended family events (funerals, celebrations)
- Support requests conflict with personal survival

**Community Standing**:
- Reputation affects opportunities
- "Good person" reputation: Better job offers, community help
- "Hustler" reputation: More illegal opportunities, police attention
- "Corrupt" reputation: Access to shady deals, social alienation
- "Desperate" reputation: Scammers target you, people avoid you

---

## 4. MAJOR SYSTEMS

### 4.1 Mental Health & Stress

**Stress Accumulation**:
- Money shortage: +5 stress/day
- No job found: +10 stress/day
- Health crisis: +20 stress
- Family conflict: +15 stress
- Police interaction: +25 stress
- Hunger: +3 per 10 points
- Debt: +2 per R100 owed

**Stress Effects**:
- **Mild (20-40)**: Minor penalties to decision-making
- **Moderate (41-70)**: Wrong choices more likely, energy drops faster
- **Severe (71-90)**: Decision quality significantly drops, health decreases
- **Critical (91+)**: Burnout event, potential game-over state

**Stress Relief Activities**:
- Socializing (free, with friends): -10 stress, costs 1 hour
- Drinking/substance use: -15 stress temporarily, +30 stress next day
- Religious activity (church): -15 stress, +5 hope, costs 2 hours
- Exercise: -5 stress, +10 energy (if you have food), costs 1 hour
- Sleep: -10 stress per extra hour slept

**Hope/Morale System**:
- Acts of kindness: +10 hope
- Progress (getting job, saving money): +15 hope
- Community support: +5 hope
- Tragedy: -20 hope
- Setback (fired, evicted): -25 hope
- **Critical**: If hope drops below 5, game offers "give up" ending

### 4.2 Health System

**Health Decreases By**:
- Poor hygiene: -2 per day
- Hunger: -3 per 10 points starved
- Extreme stress: -1 per stress point above 80
- Overwork: -5 per 10-hour+ days
- Weather exposure (rain): -5 per day without shelter

**Illness Events** (random, triggered by low health):
- Common cold (3 days, -30 energy, -R100 for medicine)
- Flu (5 days, -50 energy, -R200 for treatment)
- Gastroenteritis (4 days, cannot work, -30 energy)
- Malaria (serious, 7+ days, -R300-500 treatment, hospitalization risk)
- Injury (accident at work, -40 health, -R150-400 treatment)

**Health Recovery**:
- Rest: +5 health per 8 hours sleep
- Food: +3 health per day (if eating well)
- Medicine: Immediate +20 health, costs R50-200
- Clinic visit: +30 health, costs R100-300, waiting time

**Critical Health**:
- Below 20: Hospitalization risk (automatic, high cost)
- Cannot work while severely ill
- Increased mortality risk if untreated

### 4.3 Police & Authority System

**Police Interactions** (especially if doing illegal activities):

**Scenarios**:
- Stop and search (informal area)
- Shakedown (demand bribes)
- Arrest (for illegal work)
- Community policing (positive interaction)

**Choices**:
- Pay bribe (R50-300, lose money, stress +10)
- Run (stress +30, health risk, relationship penalty if caught)
- Comply (stress +20, document taken, complications later)
- Talk back (arrest, legal troubles)

**Consequences**:
- Criminal record (jobs harder to find, formal work closed)
- Court cases (time + money, stress)
- Jail time (game pauses, family suffers, relationship penalties)
- Police harassment (increased police encounters)

### 4.4 Crime Temptation System

**Illegal Activities** (if desperation is high):
- Theft (steal food, goods to sell) - High reward, extreme risk
- Drug dealing (distribute products) - Good money, arrest risk, moral penalty
- Fraud (scams, identity theft) - Variable reward, legal consequences
- Protection racket (extort neighbors) - Money, but community alienation

**Crime Mechanics**:
- Each activity has success probability (60-95%)
- Failure means arrest or injury
- Moral penalty affects reputation and hope
- Addiction risk (substances become expensive crutch)

**Temptation Triggers**:
- Desperation level (below R50, can't pay rent)
- Stress above 85
- Health crisis requiring money
- Family member in danger needing money
- Criminal contacts offering opportunities

**Decision Points**: Player chooses when temptation appears, but cannot ignore forever

---

## 5. STARTING SCENARIOS

Player chooses background at game start (affects starting stats and opening):

### 5.1 Unemployed Graduate
- **Starting stats**: Hope +20, Education +15, Energy +10
- **Starting money**: R200
- **Advantage**: Can access better jobs with degree
- **Pressure**: Family expects success, student debt (-R50/month)
- **Opening event**: Job rejection email, need to hustle

### 5.2 Township Hustler
- **Starting stats**: Reputation +15, Street Knowledge +10
- **Starting money**: R100 (precarious)
- **Advantage**: Know people, quick money opportunities
- **Pressure**: Street obligations, police attention
- **Opening event**: Old contact asks for favor/money

### 5.3 Struggling Farmer
- **Starting stats**: Land ownership, Food security +10, Health +10
- **Starting money**: R150
- **Advantage**: Grow food, land asset
- **Pressure**: Crop failure risk, land disputes
- **Opening event**: Drought warning, crops failing

### 5.4 Unemployed Youth
- **Starting stats**: Energy +25, Stress +10, Hope -10
- **Starting money**: R50
- **Advantage**: Physical capability
- **Pressure**: No experience, family disappointment
- **Opening event**: Pressured to join gang or illegal activity

### 5.5 Informal Worker
- **Starting stats**: Practical skills +10, Street knowledge +10, Stress +5
- **Starting money**: R120 (daily earnings)
- **Advantage**: Regular income opportunities
- **Pressure**: Unstable work, police harassment
- **Opening event**: Usual work place closed, need alternative

---

## 6. MAJOR EVENTS & BRANCHING

### 6.1 Random Events (Occur Multiple Times Per Game)

**Positive Events** (20% chance):
- Find money (R50-200)
- Job opportunity appears
- Friend helps with money
- Food donation
- Medical assistance
- Community aid

**Negative Events** (40% chance):
- Theft (lose R20-100)
- Illness
- Accident
- Family crisis
- Police incident
- Housing problem
- Equipment breaks

**Neutral Events** (40% chance):
- News story (affects economy)
- NPC interaction
- Environmental change
- Relationship development
- Community event

### 6.2 Major Story Branches

**Early Game Decision** (Day 3-5):
- Accept family financial obligation vs. refuse (affects reputation, money, stress)
- Do you help struggling neighbor? (affects community standing, moral reputation)
- Job offer that's suspicious? (affects income stability, legal risk)

**Mid Game Crisis** (Day 15-30):
- Get evicted or find new housing?
- Family member in hospital needs money for operation
- Offered illegal work opportunity
- Relationship betrayal (partner leaves, friend borrows and doesn't return)
- Land/property dispute

**Late Game Culmination** (Day 45+):
- Job opportunity abroad (migration ending setup)
- Chance to start formal business
- Community leadership role offer
- Criminal organization recruitment
- Mental health crisis (burnout)

---

## 7. MULTIPLE ENDINGS

### 7.1 Survival Ending
- **Condition**: Make it to Day 60+ with Hope >30, Health >40
- **Outcome**: You survive. Tomorrow will be similar struggle.
- **Tone**: Bittersweet, realistic

### 7.2 Success Ending
- **Condition**: Stable job (>R500/month), Hope >60, Savings >R5,000, Health >70
- **Outcome**: Your life improves. Security increases. Some stability achieved.
- **Tone**: Hopeful but cautious

### 7.3 Migration Ending
- **Condition**: Save >R3,000, accept job offer abroad or in Johannesburg/Cape Town
- **Outcome**: Leave South Africa or relocate. Family separated or together.
- **Branches**: Success abroad, struggle abroad, return home, never return

### 7.4 Farming Stability Ending
- **Condition**: Maintain farm for 60+ days, consistent harvest, sales income >R300/month
- **Outcome**: Farm provides stability. Community respected. Modest but secure life.
- **Tone**: Grounded, connected to land

### 7.5 Community Leader Ending
- **Condition**: Reputation >80, Hope >70, Help many people, no major crimes
- **Outcome**: Recognized as community leader/organizer. Make difference locally.
- **Tone**: Empowering, purposeful

### 7.6 Burnout Ending
- **Condition**: Hope <5, Stress >95 for 3+ days, Health <15
- **Outcome**: Character gives up. Cannot continue. (Option to restart)
- **Tone**: Tragic, sobering

### 7.7 Corruption Ending
- **Condition**: Commit multiple crimes, work with criminals, Hope <20, Reputation -80
- **Outcome**: Join criminal network. Money increases. Moral compass lost. Paranoia increases.
- **Tone**: Dark, dangerous

### 7.8 Prison Ending
- **Condition**: Get arrested multiple times, criminal record, caught committing crime
- **Outcome**: Prison sentence. Game pauses. Family suffers. Long-term consequences.
- **Tone**: Cautionary

### 7.9 Homelessness Ending
- **Condition**: Evicted multiple times, can't find housing, money <R10
- **Outcome**: Living on streets. Survival becomes extreme. Hope nearly gone.
- **Tone**: Desperate, hard

### 7.10 Death Ending
- **Condition**: Health <0 (untreated illness), or extreme accident
- **Outcome**: Character dies. Game over.
- **Tone**: Stark, preventable tragedy

---

## 8. NPC SYSTEM

### 8.1 Character Types

**Family**:
- Mother (supportive but demanding)
- Father (distant, occasional help or criticism)
- Siblings (various needs)
- Extended family (funerals, obligations)

**Work Connections**:
- Boss/Employer (controls income, temperamental)
- Coworkers (allies or rivals)
- Labor broker (finds work, takes cut)

**Community**:
- Neighbors (relationships affect safety)
- Shopkeeper (prices, credit, gossip)
- Pastor/Spiritual leader (counsel, community)
- Social worker (aid, bureaucracy)

**Underground**:
- Gang leader (criminal access)
- Dealer (substances, goods)
- Fixer (illegal connections)

**Romantic**:
- Potential partner (relationship affects morale and money)
- Ex (complication, support, or danger)

### 8.2 Relationship Mechanics

**Trust Building**:
- Regular conversation: +2 per interaction
- Help with need: +15 to +50
- Loan money: +20
- Share food: +10
- Attend event: +5

**Trust Breaking**:
- Don't show up: -20
- Betray: -50 to -100
- Steal from: -75
- Refuse help: -15

**Relationship Thresholds**:
- -100 to -50: Enemy, actively harms you
- -49 to 0: Hostile, won't help
- 1 to 30: Neutral, basic interaction
- 31 to 70: Friendly, helpful
- 71 to 100: Close friend/ally, very helpful

---

## 9. UI/UX DESIGN

### 9.1 Main Screens

**Home Screen / Hub**:
- Character portrait
- Current stats (bars)
- Date/time
- Quick actions (Work, Rest, Eat, Interact)
- Notification alerts
- Navigation menu

**Character Stats Screen**:
- All stats with percentages
- Trending (arrows showing increase/decrease)
- Explanation of what affects each stat
- Warning indicators for critical levels

**Inventory Screen**:
- Food items (with expiration dates)
- Money display
- Important documents (ID, court letters)
- Phone (contacts, messages, news)

**Map/Location Screen**:
- Neighborhood map
- Points of interest
- Transport costs to each location
- Time to travel
- Safety rating per area

**Relationship Screen**:
- List of NPCs
- Relationship status bars
- Last interaction date
- Upcoming obligations
- Dialogue options

**Event Screen**:
- Text-based event description
- Choice options (usually 2-3)
- Consequences preview
- Stat impact indicators

### 9.2 Visual Style

**Color Palette**:
- Desaturated earth tones
- Browns, grays, muted greens
- Occasional accent colors (warnings in orange/red)
- No bright neons, no vibrant colors

**Typography**:
- Sans-serif fonts (readable on mobile)
- Realistic sizing
- High contrast for accessibility

**Iconography**:
- Simple, weather-beaten icons
- South African symbols (shacks, taxis, sun)
- Status indicators (health cross, money bag, warning signs)

**Backgrounds**:
- Textured, weathered appearances
- Realistic township backgrounds
- Rural landscapes
- Urban street settings
- Day/night transitions

---

## 10. AUDIO DESIGN

### 10.1 Ambient Soundscape

**Morning**:
- Distant roosters
- Taxi horns
- Dogs barking
- People waking up
- Radio chatter

**Daytime**:
- Busy township sounds
- Vehicle traffic
- Market sounds
- Neighbors talking
- Work sounds (hammering, etc.)

**Evening**:
- Sunset calm
- Evening conversations
- Cooking sounds
- Radio news broadcasts
- Street vendors calling

**Night**:
- Crickets and nature
- Dogs barking
- Distant sirens
- Wind and elements
- Music from nearby shebeens

### 10.2 Music Direction

- **Emotional, subtle themes**: Never overwhelming
- **Local South African instruments**: Incorporated when appropriate
- **Jazz/kwaito influences**: Subtle, not obvious
- **Dynamic scoring**: Changes with stress level
- **Silence**: Often more powerful than music

---

## 11. DIFFICULTY & ACCESSIBILITY

### 11.1 Difficulty Modes

**Story Mode** (Easy):
- More resources
- Better job opportunities
- Less random disasters
- Easier relationship building

**Survival Mode** (Normal):
- Designed experience (as described)
- Balanced challenges
- Realistic resource scarcity
- Consequences matter

**Hardcore Mode** (Hard):
- Permadeath
- Higher prices
- Lower wages
- More random events
- No second chances

### 11.2 Accessibility Features

- Colorblind mode (adjusted palette)
- Text size options
- High contrast mode
- Adjustable reading speed
- Controller support
- Subtitles/text for all audio
- No time limits on decisions

---

## 12. MONETIZATION & PLATFORM

### 12.1 Platforms

**Primary**: Android (optimized for low-end devices)  
**Secondary**: iOS  
**Potential**: Web browser version

### 12.2 Monetization Model

**NOT P2W or ad-heavy.**

Options:
1. **Premium purchase** ($4.99-9.99): One-time purchase, no ads, all features
2. **Ad-supported free**: Optional ads for hints or cosmetics
3. **Cosmetics only**: Alternative character portraits, home appearances

---

## 13. CONTENT SENSITIVITY

### 13.1 Mature Themes Handled Responsibly

- Poverty and systemic inequality
- Mental health crises and depression
- Corruption and institutional failure
- Gender-based violence (optional)
- Substance abuse
- Suicide ideation (with resources)
- Class struggle and exploitation

**Approach**: Respectful, empathetic, grounded in real experience.

### 13.2 Content Warnings

Game should display at startup:
- Deals with poverty and hardship
- Mental health themes
- Police violence
- Potential substance abuse
- Systemic inequality
- Violence (low-level but realistic)

---

## 14. REPLAYABILITY

### 14.1 Procedural Elements

- Random event placement
- NPC personality variations
- Job offer randomization
- Economy fluctuations
- Weather patterns
- Crime/danger variations

### 14.2 New Game Plus

After completion:
- Difficulty modifiers
- New story paths available
- Different character backgrounds
- Carryover knowledge

---

## 15. DEVELOPMENT ROADMAP

### Phase 1: Core Systems (Months 1-3)
- Game engine setup (likely Godot or Unity)
- Save/load system
- Basic stats and progression
- Day cycle
- Money system

### Phase 2: Gameplay Loop (Months 3-6)
- Job system
- Random events
- NPC interactions
- Relationship system
- Work/income systems

### Phase 3: Content & Polish (Months 6-9)
- Story events and branches
- All ending implementations
- UI/UX refinement
- Audio implementation
- Game balancing

### Phase 4: Testing & Release (Months 9-12)
- Playtesting
- Bug fixes
- Performance optimization
- Platform deployment
- Launch marketing

---

## 16. SUCCESS METRICS

**Not measured by**:
- Daily active users
- Revenue per user
- Session length

**Measured by**:
- Player emotional engagement
- Social media discussion of themes
- Reviews mentioning emotional impact
- Playtime to completion
- Replay rate
- Critical reception
- Cultural relevance

**Goal**: Create empathy for South African survival struggles through interactive experience.

---

**End of Design Document**
