# Surviving South Africa — Life Simulation RPG

A realistic text-based mobile life simulation RPG built with **React Native + Expo SDK 55**.

---

## Project Overview

**Surviving South Africa** is a single-player text-based life simulator set in modern South Africa.
Players navigate poverty, employment, crime, farming, business, relationships, and the justice system —
every choice has real consequences and every system is interconnected.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Language | TypeScript |
| Navigation | expo-router (file-system routing) |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| State Management | React Context + useReducer |
| Backend | Supabase (optional cloud save) |
| Build | Metro Bundler |
| Linting | oxlint + Biome + tsc |

---

## Project Structure

```
src/
  app/
    (game)/           ← All in-game screens (40+ screens)
    (auth)/           ← Login / registration
    _layout.tsx       ← Root layout
    index.tsx         ← Entry redirect
  components/
    game/             ← Reusable game UI components
    ui/               ← react-native-reusables primitives
  lib/
    game/
      game.ts         ← All TypeScript types & interfaces
      gameEngine.ts   ← Core game logic (pure functions)
      gameData.ts     ← Static data (jobs, properties, items, etc.)
      gameContext.tsx ← Global state (React Context + useReducer)
  store/
    gameContext.tsx   ← Game state provider & reducer
  types/
    game.ts           ← Shared types
assets/               ← App icon, adaptive icon, splash, fonts
docs/
  prd.md              ← Full Product Requirements Document
supabase/
  functions/          ← Edge Functions
```

---

## Game Systems

### Core Gameplay
- **Daily Action System** — 4 actions/day (3 in prison). REST & SHOWER are always free.
- **Time Progression** — Day/night cycle, seasons (SA seasons), ageing
- **Stats System** — Health, hunger, energy, fitness, stress, happiness, intelligence, education, hygiene, reputation, discipline, endurance
- **Background Selection** — 8 starting backgrounds (Township Kid, Struggling Farmer, University Graduate, etc.)

### Employment & Economy
- **Formal Jobs** — Police, healthcare, education, finance, engineering + career progression
- **Hustle/Informal** — 15+ hustles with industry tags (Technology, Agriculture, Retail, etc.)
- **Business System** — Buy, run and manage businesses; daily profit/loss; restocking
- **Industry Experience** — XP tracks per industry; affects promotions and opportunities

### Farming
- **Crop Plots** — Purchase plots (R2,500), plant/harvest/fertilize crops; Harvest All button
- **Orchard** — Long-term fruit trees; purchase plots (R5,000); harvest cycles
- **Livestock** — Cattle, goats, pigs, chickens; breeding, milk, eggs, meat; Sell All Excess; Heal All
- **Farm Events** — Pest infestation, disease, drought

### Crime & Justice
- **Crime Actions** — Theft, fraud, drug dealing, armed robbery (risk/reward)
- **Criminal Record** — Affects employment, promotions, government access, NPC relationships
- **Prison System** — 3 actions/day; Advance Day button; locked navigation; labour earnings; release detection
- **Financial Consequences** — Fines, imprisonment, formal job loss

### Property & Finance
- **Property** — Rent, buy, rent out to tenants (realistic price caps per property type)
- **Bank** — Savings account (2.5%/month) + 32-Day Notice account (7.5%/month)
- **Financial Overview** — Full daily income/expense breakdown (salary, farming, rentals, interest, prison labour)
- **Rental Caps** — Shack R800 → Mansion R50,000 (realistic SA market rates)

### Social & Relationships
- **NPC System** — Family, friends, romantic partner, community NPCs
- **Relationship Events** — Greeting, helping, flirting, dating (all consume actions)
- **Reputation** — Affects job opportunities and NPC interactions

### Health & Medical
- **Injury System** — Minor, serious, permanent disability
- **Illness** — Sickness affects stats daily; livestock sickness (chickens can die)
- **Hospital** — Medical treatment, recovery

### Education
- **Courses** — Matric, vocational, university, professional certifications
- **Scholarships** — Available based on stats

### Analytics & Bug Reporting
- **Analytics** — Opt-in tracking of player choices for future balancing
- **Bug Reports** — In-game report form (category + description) stored locally

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Expo CLI

### Install

```bash
pnpm install
```

### Development

```bash
pnpm exec expo start
```

### Lint & Type-check

```bash
pnpm run lint
npx tsc --noEmit
```

### Build (EAS)

```bash
# Install EAS CLI
pnpm add -g eas-cli

# Configure
eas build:configure

# Android APK (preview)
eas build --platform android --profile preview

# Android AAB (production / Google Play)
eas build --platform android --profile production
```

---

## Build Configuration

`app.json` contains:
- App name: **Surviving South Africa**
- Slug: `surviving-south-africa`
- Version: `1.0.0`
- Android package: `com.survivingsa.game`
- Permissions: (none required — pure JS game)

---

## Environment Variables

Create `.env.local` for optional Supabase cloud save:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The game runs fully offline without these variables.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/lib/game/gameEngine.ts` | All pure game logic functions |
| `src/lib/game/gameData.ts` | Static data: jobs, properties, items, crops, livestock |
| `src/types/game.ts` | All TypeScript interfaces and types |
| `src/store/gameContext.tsx` | Global state reducer (2000+ lines) |
| `src/app/(game)/main.tsx` | Main game hub / menu |
| `src/app/(game)/farming.tsx` | Full farming system UI |
| `src/app/(game)/prison.tsx` | Prison screen with Advance Day |
| `src/app/(game)/financial-overview.tsx` | Income/expense breakdown |
| `docs/prd.md` | Full product requirements document |

---

## Version History

| Version | Description |
|---|---|
| v1–v8 | Core systems, all screens built |
| v9 | Stabilisation — zero TS/lint errors |
| v10 | Pre-launch: bulk actions, financial overview, criminal record, prison economy, analytics, bug reporting |
| v11 | Prison Advance Day button, navigation lockdown during imprisonment, ZIP export |

---

## License

Private project. All rights reserved.
