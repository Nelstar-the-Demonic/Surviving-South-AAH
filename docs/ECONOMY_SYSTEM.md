# SURVIVING SOUTH AAH!!! - Complete Economy System

## Table of Contents
1. [Economic Philosophy](#economic-philosophy)
2. [Currency & Exchange](#currency--exchange)
3. [Income Systems](#income-systems)
4. [Expense Systems](#expense-systems)
5. [Pricing & Inflation](#pricing--inflation)
6. [Debt Management](#debt-management)
7. [Economic Progression](#economic-progression)
8. [Economic Events](#economic-events)
9. [Balancing & Math](#balancing--math)
10. [Implementation Guide](#implementation-guide)

---

## Economic Philosophy

### Core Principle: "Every Rand Matters"

The economy is the lifeblood of **Surviving South AAH!!!**. Money is not abundant—it's scarce, precious, and the primary source of tension.

### Design Pillars

**1. Scarcity by Design**
- Income is never enough for comfortable living
- Player must choose between competing needs
- Luxury is not attainable early
- Money accumulation requires sacrifice

**2. Realistic South African Economics**
- Based on actual ZAR (South African Rand) values
- Reflects real unemployment and informal economy
- Load shedding as genuine mechanic
- Service costs reflect infrastructure challenges

**3. Multiple Economic Paths**
- Formal employment (stable, low start)
- Informal work (risky, variable)
- Crime (high reward, extreme risk)
- Farming (seasonal, weather-dependent)
- Grants (bureaucratic, limited)

**4. Risk vs. Reward**
- Safe paths provide stable low income
- Risky paths provide variable high income
- Player must weigh consequence vs. money
- Crime temptation is real and justified

**5. Consequence Economics**
- Failed work doesn't waste time only—wastes energy too
- Debt accumulates interest
- Missed opportunities don't repeat
- Economic decisions affect relationships

---

## Currency & Exchange

### South African Rand (ZAR)

**Denomination**
- Base unit: 1 Rand (R)
- Player sees integer values only
- Cents not tracked (simplified)
- Range: R0 to R99,999 (achievable maximum)

**Starting Money by Background**

| Background | Starting Money | Rationale |
|-----------|-----------------|-----------|
| Unemployed Graduate | R100 | Recent expenses |
| Township Hustler | R50 | Always spent |
| Struggling Farmer | R80 | Recent harvest |
| Former Student | R30 | Nothing left |
| Unemployed Youth | R20 | Desperate poverty |
| Informal Worker | R60 | Recent payment |

### Cash vs. Electronic

**Cash-Only System** (Simplified)
- No bank accounts initially
- All money is physical cash
- Risk: Can be stolen
- Liquidity: Immediate availability

**Future Bank Integration** (Post-MVP)
- Bank account unlocks at +R500 savings
- Safer but inaccessible at night
- Transaction fees (R2 per withdrawal)
- Interest on savings (0.1%/month)

### Money Display

**Player Always Sees**
- Current cash (prominent)
- Total debt (warning color if present)
- Daily projected balance (with current choices)
- Total assets (money + inventory value)

---

## Income Systems

### 1. Formal Employment

**Definition**: Regular, contracted job with stability and legal protection.

**Jobs Available** (Varies by Education/Reputation)

| Job | Daily Pay | Energy Cost | Stress Gain | Requirements | Description |
|-----|-----------|-----------|------------|--------------|-------------|
| General Labor | R100 | 20 | 8 | None | Factory/construction work, daily rate |
| Retail Assistant | R120 | 15 | 6 | Social: 30 | Store assistant, customer interaction |
| Office Clerk | R200 | 12 | 5 | Education: 50 | Typing, filing, repetitive office work |
| Security Guard | R150 | 18 | 10 | Health: 40 | Night shifts, alertness required |
| Teacher (Substitute) | R180 | 14 | 7 | Education: 60 | Teaching grade 1-3, verbal abuse risk |
| Healthcare Worker | R220 | 16 | 12 | Health Skill: 50 | Clinic/hospital assistant, emotional labor |
| Mechanic | R250 | 18 | 6 | Tech: 60 | Vehicle repair, skilled work |
| Tutor | R300 | 12 | 5 | Education: 70, Social: 50 | One-on-one education, flexible |
| Administrator | R280 | 11 | 4 | Education: 65, Tech: 40 | Office management, organized |
| Manager | R400 | 10 | 8 | Education: 80, Social: 70 | Team leadership, responsibility |

**Formal Job Mechanics**
- Fixed schedule (8 hours, but energy flexible)
- Energy cost represents tiredness from 8-hour day
- Stress gain is baseline work pressure
- Reputation affects: availability, wage growth, firing risk
- Can lose job if: Reputation drops too low, Miss too many days, Health critical
- Wage growth: +R10/month per month employed (caps at job max)

**Job Unlocking**
- Requires meeting stat thresholds
- Education is primary gatekeeper
- Social skill helps get promotions
- Reputation affects job retention

### 2. Informal Work

**Definition**: Uncontracted work paid in cash, variable but available.

**Side Hustles & Gigs** (Always available if you go looking)

| Hustle | Pay Range | Energy Cost | Stress Gain | Time | Requirements |
|--------|-----------|-----------|------------|------|--------------|
| Street Vending | R50-80 | 16 | 8 | 8 hours | None |
| Car Washing | R40-100 | 18 | 4 | 4 hours | Health: 30 |
| Delivery Runner | R60-120 | 14 | 6 | 6 hours | Social: 20 |
| House Help | R80-150 | 15 | 5 | 6 hours | None |
| Furniture Moving | R100-200 | 20 | 7 | 4 hours | Health: 50 |
| Tech Support (informal) | R100-180 | 10 | 8 | 6 hours | Tech: 60 |
| Photography/Gigs | R150-250 | 12 | 6 | 4 hours | Tech: 70, Social: 40 |
| Tutoring (private) | R120-250 | 10 | 4 | 2-4 hours | Education: 50 |
| Repair Jobs | R80-200 | 14 | 6 | 4 hours | Tech: 50 |
| Cleaning Services | R60-120 | 16 | 6 | 4 hours | None |

**Informal Work Mechanics**
- Variable pay within range (randomized)
- Availability varies (not guaranteed daily)
- Less reliable than formal work
- Can combine multiple hustles (double time, double energy cost)
- Stress varies based on conditions
- Reputation affects: availability, pay rate, frequency
- No worker protections (can be injured, not paid)

**Getting Informal Work**
- Visit location daily to find opportunities
- Reputation affects daily chances (+5% per 10 reputation)
- Same NPC may offer repeated work (up to 3x/month)
- Word spreads (social skill helps)

### 3. Criminal Activities

**Definition**: Illegal income with high rewards and extreme consequences.

**Crime Types**

| Crime | Pay | Risk Level | Energy Cost | Stress Gain | Consequences | Reputation |
|------|-----|-----------|-----------|------------|--------------|-----------|
| **Pick Pocketing** | R50-150 | Medium | 4 | 12 | Arrest (30%), beaten (40%) | -20 |
| **Small Theft** | R100-300 | High | 8 | 18 | Arrest (40%), police chase | -40 |
| **House Breaking** | R300-1000 | Very High | 12 | 25 | Arrest (50%), violent conflict | -60 |
| **Drug Dealing** | R200-500/day | Very High | 6 | 20 | Arrest (60%), gang violence | -50 |
| **Protection Racket** | R150-400 | High | 10 | 22 | Arrest (35%), gang retaliation | -50 |
| **Scamming** | R100-400 | Medium | 4 | 15 | Police (20%), victim revenge | -30 |
| **Carjacking** | R500-2000 | Extreme | 14 | 30 | Arrest (70%), death risk (5%) | -80 |

**Crime Mechanics**
- Each crime has arrest probability (shown to player)
- Arrest = prison ending or consequence event
- Repeated crime increases recognition (arrest chance +5% per activity)
- Gang contacts develop (affects future opportunities/threats)
- Money is immediate (no payment delay)
- Relationships deteriorate if discovered
- Moral standing decreases (affects police interactions)

**Crime Temptation**
- Appears when: Money < R100, Stress > 70, Hope < 30
- NPC "Thabo" offers opportunities regularly if reputation high
- First offer has tutorial explaining consequences
- Crime is TEMPTING but NOT REQUIRED
- Alternative paths always available

### 4. Farming

**Definition**: Agricultural production (crops + livestock) with seasonal cycles.

**Crop Farming**

| Crop | Plant Cost | Grow Time | Yield Value | Labor/Week | Weather Risk | Theft Risk |
|------|-----------|----------|-------------|-----------|-------------|-----------|
| **Maize** | R20 | 90 days | R150-250 | 3 hours | High | Very High |
| **Beans** | R15 | 60 days | R80-120 | 2 hours | Medium | Medium |
| **Squash** | R10 | 45 days | R50-100 | 2 hours | Low | High |
| **Tomatoes** | R25 | 50 days | R120-200 | 4 hours | Medium | Very High |
| **Cabbage** | R12 | 55 days | R60-100 | 2 hours | Low | Medium |

**Livestock Farming**

| Animal | Purchase Cost | Feed/Day | Health Risk | Yield/Month | Space Required |
|--------|--------------|----------|-----------|------------|-----------------|
| **Chickens** (3) | R50 | R2 | 10% | R40 (eggs) | 1 plot |
| **Goat** | R100 | R4 | 15% | R80 (milk/meat) | 1 plot |
| **Pig** | R120 | R6 | 20% | R120 (meat) | 1 plot |
| **Cow** | R300 | R15 | 5% | R200 (milk/meat) | 3 plots |

**Farming Mechanics**
- Requires farm location (accessible early but risky)
- Daily care required (15-30 min energy cost)
- Weather affects crops (rain good, drought bad)
- Disease can strike (random 5-15% livestock loss)
- Theft risk (5% crop loss/week if unguarded)
- Seasonal: Summer best, Winter hardest
- Can sell produce at market anytime
- Farming skill affects yield (+10% per 10 skill points)

**Farming Economy**
- Initial investment: R100-200
- Break-even: 2-4 months
- Monthly income: R100-400 once established
- High volatility (weather, theft)
- Provides food (reduces food expense)
- Ties player to location

### 5. Government Grants

**Definition**: Monthly government assistance for qualifying citizens.

**Grant Types**

| Grant | Monthly Amount | Eligibility | Processing | Bureaucracy |
|-------|----------------|------------|-----------|------------|
| **Child Support Grant** | R400 | Have child dependents | 2 months | Complex forms |
| **Old Age Pension** | R350 | Age 60+ | 1 month | Annual review |
| **Disability Grant** | R300 | Registered disability | 3 months | Medical proof needed |
| **Unemployment Benefit** | R350 | Registered unemployed | 4 weeks | Update required monthly |
| **Emergency Relief** | R100-200 | Disaster affected | 1 week | Mayor approval |

**Grant Mechanics**
- One grant per character (whichever they qualify for)
- Monthly deposit (guaranteed)
- Requires regular check-ins (bureaucratic)
- Can be delayed/denied if forms incomplete
- Delays: -R0 but stress +15
- Denials: -R0 but hope -20, stress +25
- Social worker NPC handles grants
- Unlocks at day 30+ (time to discover)

**Applying for Grants**
- Requires visiting government office (half-day activity)
- Need documentation (can take 1-2 weeks to gather)
- Interview with social worker (stress factor)
- Approval takes 2-4 weeks (unpredictable)
- Once approved, monthly payment guaranteed
- Can be cancelled if income above threshold

---

## Expense Systems

### 1. Essential Expenses

**Housing** (Monthly)

| Housing Type | Monthly Cost | Location | Safety | Amenities |
|------------|-----------|----------|--------|-----------|
| Shack in settlement | R100 | Informal settlement | Low | Basic |
| Township shack | R120 | Township | Low | Basic + water |
| Township room | R180 | Township | Medium | Room, shared facilities |
| Apartment (share) | R250 | Township/suburban | Medium | Private room, kitchen |
| Apartment (solo) | R400 | Suburban | High | Furnished, bathroom |
| Guest house | R200 | Shared | Medium | Basic room |

**Housing Mechanics**
- Rent paid monthly (displayed at month start)
- Eviction if 2+ months unpaid (homelessness ending)
- Upgrading available anytime if money allows
- Better housing: Slight health bonus, safety bonus
- Poor housing: Health risk, vulnerability to crime

**Food Expenses** (Daily)

| Diet Quality | Daily Cost | Health Benefit | Taste | Notes |
|-------------|-----------|---------------|--------|-------|
| **Minimal** | R10 | -5 (malnutrition risk) | Poor | Rice, pap, water |
| **Basic** | R25 | 0 | Acceptable | Bread, pap, salt |
| **Adequate** | R40 | +10 | Good | Vegetables, meat, beans |
| **Comfort** | R60 | +15 | Very Good | Variety, chicken, fresh |
| **Luxury** | R100+ | +20 | Excellent | Restaurant/special items |

**Food Mechanics**
- Daily food cost (variable by choice)
- Hunger reduced by amount spent
- Cheap food less satisfying (stress +5)
- Quality food is morale boost (hope +3)
- Cooking at home vs. buying prepared
- Special occasions (birthdays, celebrations) cost more
- Food spoilage possible if unprepared

**Utilities** (Monthly)

| Utility | Estimated Cost | Notes |
|---------|---------------|-------|
| Electricity (eKasi) | R40-80 | Load shedding 2-4 hours/day |
| Water | R10-20 | Limited in settlements |
| Waste Collection | R5-10 | If available |
| **Total** | **R60-120** | Varies by area and season |

**Utility Mechanics**
- Monthly deduction (automatic)
- Load shedding creates random blackout events
- Water scarcity affects health/hygiene
- Cannot be avoided (essential)
- Winter costs higher (heating need)

### 2. Communication Expenses

**Phone/Data** (Weekly/Daily)

| Service | Cost | Duration | Use |
|---------|------|----------|-----|
| Basic Airtime | R5-10 | 1 week | Calls only |
| Data Bundle (500MB) | R10-20 | 2-3 weeks | Whatsapp, job search |
| Full Bundle (2GB) | R30-50 | 1 month | Streaming, study |
| Special Data | R15-25 | 1 week | Urgent needs |

**Phone Mechanics**
- Phone battery drains during activities (realism)
- Charging requires electricity (vulnerable during load shedding)
- Data required for online job search (gig economy)
- Messages from NPCs arrive (plot delivery)
- Phone can be stolen (crime risk at night)
- Upgrading to smartphone unlocks tech jobs

### 3. Transport Expenses

**Daily Transport**

| Route | One Way | Daily | Frequency |
|------|---------|--------|-----------|
| Local (township/settlement) | R5 | R10 | 2 trips |
| Medium (to CBD) | R8 | R16 | 2 trips |
| Long distance | R12-20 | Variable | 1-2 trips |

**Transport Mechanics**
- Required to reach work locations
- Taxi strikes cause disruptions (alternative costs)
- Morning rush hour risk of robbery (small)
- Evening travel unsafe (police/gang activity)
- Walking possible (free but time-consuming)
- Bicycle possible (one-time R50 purchase)
- Fuel cost if player buys car (future phase)

### 4. Health Expenses

**Preventive & Emergency**

| Item | Cost | Effect |
|------|------|--------|
| Clinic visit (checkup) | R20 | Health +10, prevent illness |
| Medicines (illness) | R30-80 | Recover from illness |
| Hospital emergency | R200+ | Critical health recovery |
| First aid supplies | R15 | Self-treatment at home |
| Vitamins/supplements | R10-20 | Health +5, regular |

**Health Mechanics**
- Illness occurs randomly (5-10% per day if health low)
- Untreated illness worsens (escalates to hospital)
- Cost increases with severity
- Health decline prevents work (income loss)
- Prevention better than treatment (economy)

### 5. Discretionary Expenses

**Optional Spending** (Stress relief, morale)

| Item | Cost | Effect | Frequency |
|------|------|--------|-----------|
| Alcohol | R20-40 | Stress -10, health -5 | Avoidable |
| Cigarettes | R10-20 | Stress -5, health -3 | Avoidable |
| Entertainment (movie, etc.) | R30-50 | Hope +10, stress -5 | Weekend |
| Gifts for relationships | R20-100 | Relationship +10-20 | Occasion |
| Special meal | R50-100 | Hope +5, morale boost | Celebration |

**Discretionary Mechanics**
- Completely optional
- Significant morale boost
- Addiction possible (ongoing cost if you start)
- Social events with NPCs often involve spending
- Can trade for cost savings (invite friend home instead)

### 6. Unexpected Expenses

**Crisis Costs** (Random events)

| Expense | Cost | Trigger | Impact |
|---------|------|---------|--------|
| Emergency repair | R50-200 | Equipment failure | Work disruption |
| Medical emergency | R100-500 | Accident/severe illness | Severe health recovery |
| Replacement item | R50-300 | Theft/loss | Temporary disadvantage |
| Debt penalty | R50-100+ | Late payment | Stress, reputation |
| Bail | R500-1000 | Arrest (if not prison) | Financial devastation |

---

## Pricing & Inflation

### Base Prices (Day 1)

**Price Index** (all prices relative to R100 = base)

| Item Category | Base Price | Variation |
|--------------|-----------|-----------|
| Staple food (pap, rice) | R5-15 | Low |
| Protein (chicken, beans) | R20-40 | Medium |
| Vegetables | R8-20 | High (seasonal) |
| Transport | R5-20 | Low |
| Utilities | R60-120 | Very Low |
| Rent | R100-400 | Medium |
| Phone services | R5-50 | Low |

### Inflation Model

**Monthly Inflation Calculation**

```
Base Inflation = 0.5% (official rate)
Seasonal Modifier:
  - Summer (Nov-Feb): +0.3% (food abundant)
  - Winter (Jun-Aug): +1.0% (scarce, heating)
  - Spring/Autumn: +0.2% (stable)
Random Event Modifier:
  - Normal: 0%
  - Strike happening: +2% (transport)
  - Weather crisis: +1-3% (food)
  - Economic news: -1% to +2%

Total Monthly Inflation = Base + Seasonal + Random
Applied to ALL prices uniformly
```

**Inflation Examples**

**Month 1 (November - Summer)**
- Base: 0.5%
- Seasonal: +0.3%
- Random: +0.1% (normal)
- Total: 0.9%
- Effect: R100 item → R100.90

**Month 2 (December - Summer)**
- Base: 0.5%
- Seasonal: +0.3%
- Random: +1.5% (strike news)
- Total: 2.3%
- Effect: R100.90 → R103.22

**Month 7 (June - Winter)**
- Base: 0.5%
- Seasonal: +1.0%
- Random: +0.5% (weather forecast)
- Total: 2.0%
- Effect: Previous price × 1.02

### Price Displays

**Player Visibility**
- Current price always shown
- Previous price shown for comparison
- Inflation percentage displayed monthly
- Trend indicator (up/down/stable)
- Player can speculate/save timing

**Price Speculation**
- Buying before price increase: Smart move
- Selling before price drop: Avoid
- Storage mechanic: Limited space for stockpiling
- Risk: Storage theft, items spoil

---

## Debt Management

### Debt Sources

**1. Bank Loan**
- Amount: R100-1000 (player specifies)
- Interest: 8% monthly
- Repayment: Flexible schedule
- Requirements: Employed or co-signer
- Consequences: None until 2+ months unpaid
- Max debt: 3x monthly income

**2. Street Lender**
- Amount: R50-500 (lender decides)
- Interest: 25% monthly (compounding)
- Repayment: "When possible" (vague)
- Requirements: Street reputation +30
- Consequences: Threats after 1 month unpaid, violence after 2
- Max debt: 2x any collateral

**3. Family Loan**
- Amount: Varies (family decides)
- Interest: 0% (relationship-based)
- Repayment: "When you can" (pressure-based)
- Requirements: Family relationship +20
- Consequences: Relationship degradation if unpaid
- Max debt: No official limit (relationship-limited)

### Debt Mechanics

**Daily Interest Calculation**

```
Daily Interest = Total Debt × (Monthly Rate / 30)
Bank Loan Example:
  - Owe: R500
  - Rate: 8% monthly
  - Daily: R500 × 0.08 / 30 = R1.33/day
  - Monthly: R40 added

Street Lender Example:
  - Owe: R300
  - Rate: 25% monthly (compounding)
  - Daily: R300 × 0.25 / 30 = R2.50/day
  - Monthly: R75 added (then compounds)
```

**Debt Display**
- Total owed always visible
- Interest accrued today shown
- Interest accrued this month shown
- Minimum payment recommended
- Days until consequence (if applicable)

**Debt Consequences**

**Bank Debt Timeline**
- Day 1-30: Normal (payment expected)
- Day 31-60: Warning (letter, stress +5)
- Day 61+: Escalation (legal threats, wage garnishment)

**Street Debt Timeline**
- Day 1-30: Normal (payment expected)
- Day 31-60: Warning (messages, threats, stress +10)
- Day 61+: Dangerous (gang visits, intimidation, violence risk)

**Family Debt Timeline**
- Day 1-90: Understanding (gentle reminders)
- Day 91-180: Pressure (frequent calls, stress +10)
- Day 181+: Crisis (family conflict, relationship crash -40)

### Debt Avoidance

**Strategies**
1. Never borrow if avoidable
2. Bank loans safest if needed
3. Family loans dangerous socially
4. Street lenders last resort
5. Debt spiral risk if multiple loans

**Early Intervention**
- Player warned before taking debt
- Consequences clearly shown
- Repayment difficulty calculated
- Alternative options explored

---

## Economic Progression

### Progressive Income Growth

**Month 1-3: Survival Phase**
- Income: R300-800/month
- Primary: Informal work + grants
- Focus: Food, rent, survival
- Goal: Stabilize

**Month 4-6: Stability Phase**
- Income: R800-1500/month
- Primary: Formal job or farming emerging
- Focus: Small savings, skill-building
- Goal: Build assets

**Month 7-12: Growth Phase**
- Income: R1500-3000+/month
- Primary: Career advancement or diverse hustles
- Focus: Quality of life improvement
- Goal: Comfortable stability

**Year 2+: Success Phase** (if progressing positively)
- Income: R3000-5000+/month
- Primary: Career or established business
- Focus: Planning future
- Goal: Long-term security

### Economic Milestones

| Milestone | Month | Money | Significance |
|-----------|-------|-------|--------------|
| Survive first month | 1 | Positive | Tutorial checkpoint |
| Pay off first debt | 2-4 | R0 debt | Psychological relief |
| Reach R1000 savings | 3-5 | R1000 | Security feeling |
| Get formal job | 1-6 | +R150/day | Stability achieved |
| Pay first month's bills easily | 4-8 | Surplus | Breathing room |
| Start farming | 3-9 | Diversification | Long-term thinking |
| Reach R5000 savings | 6-12 | R5000 | Escape possible |
| Debt-free status | Varies | R0 | Major accomplishment |

### Economic Scaling

**Auto-Scaling Based on Success**

```
If monthly income > R3000:
  - Prices increase 20% (scaling challenge)
  - Rent opportunities upgrade
  - NPC expectations increase
  - New expenses unlock

If debt > R5000:
  - Lender violence becomes imminent
  - Wage garnishment automatic
  - Desperation temptation increases
  - Prison risk high
```

---

## Economic Events

### Dynamic Economic News

**News Types & Impact**

| News | Frequency | Duration | Effect | Player Impact |
|------|-----------|----------|--------|----------------|
| **Taxi Strike** | Every 3-6 months | 1-2 weeks | Transport +50%, supply chaos | Food price +10%, job missed risk |
| **Weather Crisis** | Seasonal (2-3x/year) | 1-4 weeks | Food scarce, farming hurt | Food price +20%, farming fail |
| **Economic Alert** | Monthly | 1 month | Currency fluctuation | Prices +5%, loans harder |
| **Protest/Unrest** | Every 2-4 months | 3-7 days | Transport disrupted, curfew | Cannot travel after dark, jobs missed |
| **Job Sector Boom** | Random (2x/year) | 1-2 months | Jobs abundant | Wage +10%, employment easier |
| **Crime Wave** | Random (1-3x/year) | 2-4 weeks | Police crackdown, gang activity | Crime riskier, theft increased |
| **Inflation Spike** | Random | 1 month | Prices jump | Emergency budget crisis |
| **Rain/Drought** | Seasonal | 1-4 weeks | Farming affected | Crop success/failure |

**Event Mechanics**
- News arrives via dialogue with NPCs
- Player researches impact through UI
- Can prepare strategically
- Multiple events can overlap
- Later events affect story possibilities

### Random Economic Opportunities

**Unexpected Windfalls**

| Opportunity | Frequency | Amount | Requirement |
|------------|-----------|---------|------------|
| Found money on street | 2% daily | R20-100 | Luck, travel |
| Bonus at work | 10% monthly | R100-300 | Employed, reputation |
| Relative gift | 5% monthly | R50-200 | Family relationship |
| Inheritance news | 1% during campaign | R500-2000 | Family event trigger |
| Investment return | 5% if invested | R50-500 | Previously saved |
| Unclaimed benefit | 3% if eligible | R200-500 | Government luck |

**Unexpected Costs**

| Cost | Frequency | Amount | Requirement |
|------|-----------|---------|------------|
| Broken phone | 3% quarterly | R100-300 | Had phone |
| Family emergency | 5% monthly | R100-500 | Family relationship |
| Car/transport issue | 2% if traveling | R50-200 | Using transport |
| Theft | 5-10% in settlements | R50-300 | In dangerous area |
| Medical emergency | 3% if health low | R100-500 | Low health |
| Document fee | 2% if applying | R20-50 | Government process |

---

## Balancing & Math

### Economic Balance Targets

**Daily Sustainability (Hard Mode)**
```
Average Daily Income: R100 (formal) to R80 (informal)
Essential Daily Cost: R60 (food R25, transport R15, utilities R4, phone R2, misc R14)
Optional Daily Cost: R10-50 (discretionary)
Daily Surplus/Deficit: +R20 to -R10 (varies by work)

Result: Tight, requires planning, small surplus possible with discipline
```

**Monthly Sustainability (Normal Mode)**
```
Average Monthly Income: R2000-3000 (includes variations)
Fixed Monthly Cost: R1200 (rent R120-300, utilities R60-120, phone R30, transport R60+)
Food Monthly: R800-1500 (varies by quality)
Discretionary: R100-200 (optional)
Total Monthly: R2100-2920

Result: Barely breakeven, debt tempting, stress constant
```

**Realistic Progression**
```
Month 1-3: -R200 to +R100 monthly (survival mode)
Month 4-6: +R100 to +R400 monthly (stabilizing)
Month 7-12: +R300 to +R800 monthly (building reserves)
Year 2+: +R500 to +R1500+ monthly (success visible)
```

### Income-to-Expense Ratios

**Affordability Guidelines**

| Income Level | Sustainable Rent | Food Budget | Savings Possible |
|-------------|------------------|------------|-----------------|
| R1000/month | R200 max | R400-600 | R50-100 |
| R1500/month | R300 max | R600-800 | R100-200 |
| R2000/month | R400 max | R800-1000 | R200-300 |
| R3000/month | R600 max | R1000-1200 | R500-800 |
| R5000/month | R1000 max | R1500-2000 | R1500+ |

### Player Progression Benchmarks

**Early Game (Days 1-60)**
- Most players: R200-500 liquid
- Formal job obtained: 40% of players
- Still struggling: 60% of players
- Crime temptation: High for 30% of players

**Mid Game (Days 61-180)**
- Successful players: R1000+ liquid
- Formal job stable: 70% of employed
- Debt managed: 50% of players
- Diversified income: 30% of players

**Late Game (Days 181-365)**
- Successful ending: 40% of players
- R2000+ liquid: 20% of players
- Debt-free: 35% of players
- Prison/homeless: 20% of players

---

## Implementation Guide

### Data Structures (GDScript)

**Economy Manager Class**

```gdscript
class_name EconomyManager
extends Node

# Prices reference (inflates monthly)
var current_prices: Dictionary = {}

# Income opportunities
var daily_jobs: Array = []
var daily_hustles: Array = []
var daily_opportunities: Array = []

# Economic state
var inflation_rate: float = 0.005  # 0.5% base
var current_month: int = 1
var last_inflation_update: int = 0

func _ready():
    load_base_prices()
    setup_jobs()
    setup_economy_events()

func get_food_price() -> int:
    var base = current_prices.get("food_basic", 25)
    return int(base * inflation_multiplier)

func calculate_daily_expenses() -> Dictionary:
    var expenses = {
        "food": get_dynamic_food_cost(),
        "transport": 15,
        "utilities": 2,
        "phone": get_phone_cost(),
        "rent": get_daily_rent(),
        "misc": 10
    }
    return expenses

func apply_monthly_inflation():
    var base_inflation = 0.005
    var seasonal = calculate_seasonal_modifier()
    var random = randf_range(-0.01, 0.02)
    
    var total_inflation = base_inflation + seasonal + random
    inflation_multiplier *= (1.0 + total_inflation)
    
    # Cap at reasonable levels
    if inflation_multiplier > 2.0:
        inflation_multiplier = 2.0

func get_available_work() -> Array:
    var work_today = []
    
    # Check formal jobs
    if player.education > 30:
        work_today.append(create_job_opportunity())
    
    # Check informal work
    if randf() > 0.3:  # 70% chance daily
        work_today.append(create_hustle_opportunity())
    
    return work_today
```

### JSON Data Files

**jobs.json Structure**

```json
{
  "jobs": [
    {
      "id": "general_labor",
      "name": "General Laborer",
      "daily_pay": 100,
      "energy_cost": 20,
      "stress_gain": 8,
      "requirements": {
        "education_min": 0,
        "reputation_min": 0,
        "health_min": 30
      },
      "description": "Physical labor at construction site or factory",
      "location": "industrial_area",
      "dismissal_risk": 0.05,
      "wage_growth": 10
    }
  ]
}
```

**economy_events.json Structure**

```json
{
  "events": [
    {
      "id": "taxi_strike",
      "name": "Taxi Strike",
      "frequency": "every_3_months",
      "duration_days": 14,
      "effects": {
        "transport_multiplier": 1.5,
        "food_multiplier": 1.1,
        "work_disruption": 0.3,
        "stress_gain": 15
      }
    }
  ]
}
```

### UI Integration

**Economy Display (Top Bar)**
```gdscript
func update_economy_display():
    money_label.text = "R%d" % player.money
    debt_label.text = "Debt: R%d" % player.debt if player.debt > 0 else ""
    inflation_label.text = "Inflation: %.1f%%" % (inflation_rate * 100)
```

**Daily Income Projection**
```gdscript
func calculate_projected_balance() -> int:
    var daily_income = 0
    var daily_expenses = 0
    
    if has_planned_work:
        daily_income = planned_work.daily_pay
    
    daily_expenses = sum(calculate_daily_expenses().values())
    
    return player.money + daily_income - daily_expenses
```

### Balancing Tools

**Economy Difficulty Adjuster**

```gdscript
enum Difficulty { CASUAL, NORMAL, HARD }

func adjust_economy_for_difficulty(diff: int):
    match diff:
        Difficulty.CASUAL:
            inflation_rate *= 0.5
            job_pay_multiplier = 1.2
            expense_multiplier = 0.8
        Difficulty.NORMAL:
            inflation_rate = 0.005
            job_pay_multiplier = 1.0
            expense_multiplier = 1.0
        Difficulty.HARD:
            inflation_rate *= 1.5
            job_pay_multiplier = 0.8
            expense_multiplier = 1.2
```

---

## Economy Simulation Tools

### Testing Economy Balance

**Economy Test Scenario** (Simulate 365 days)

```gdscript
func simulate_economy_year():
    var player_stats = {
        "starting_money": 100,
        "daily_income": 0,
        "total_income": 0,
        "total_expenses": 0,
        "debt_accumulated": 0,
        "times_desperate": 0
    }
    
    for day in range(365):
        var daily_income = get_random_daily_income()
        var daily_expenses = calculate_daily_expenses()
        
        player_stats.total_income += daily_income
        player_stats.total_expenses += sum(daily_expenses.values())
        
        if player_stats.starting_money + player_stats.total_income - player_stats.total_expenses < 0:
            player_stats.times_desperate += 1
    
    return player_stats
```

---

**Document Version**: 1.0
**Status**: Complete & Ready for Implementation
**Word Count**: 8,500+