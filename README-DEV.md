# Surviving South AAH - Developer Guide

Welcome to the codebase for **Surviving South AAH**! This document is designed to help you understand the architecture, add new features, and troubleshoot the game engine.

## 🏗️ Architecture Overview

This project is built using:
- **React Native / Expo** (SDK 50+)
- **Expo Router** (File-based navigation in `src/app`)
- **NativeWind v4 / Tailwind CSS** (Styling in `src/global.css`)
- **React Context API** (Global state management)

The game is designed around a strictly unidirectional data flow. All game logic runs through a central reducer.

---

## 📂 Key Directories & Files

### 1. `src/store/gameContext.tsx` (The Brain)
This file holds the global `GameState` and the `gameReducer`.
- **State**: Every piece of data (cash, inventory, stats, property) lives here.
- **Actions**: If you want the player to buy an item, get hurt, or move cities, you **must** dispatch an action here (e.g., `dispatch({ type: 'BUY_ITEMS', payload: [...] })`).
- **Persistence**: The state is automatically saved to `AsyncStorage` and loaded on app launch.

### 2. `src/lib/game/gameEngine.ts` (The Rules)
This massive file contains pure functions that calculate the mechanics of the game.
- **`advanceDay(state)`**: This is the most critical function. When the user clicks "End Day", this function takes the current state and returns a completely new state for tomorrow. It calculates business income, farm yields, passive healing, prison sentences, and triggers random events.
- **Random Events**: Contains the logic to pull events from `GAME_EVENTS` based on the player's location and risk factors.

### 3. `src/lib/game/gameData.ts` (The Database)
This file contains all hardcoded content for the game.
- Want to add a new weapon? Add it to `WEAPON_DEFINITIONS`.
- Want to add a new job? Add it to `JOB_DEFINITIONS`.
- Want to create a new random event? Add it to `GAME_EVENTS`.
No logic lives here, only raw data arrays and objects.

### 4. `src/app/(game)/` (The UI Screens)
Each file here represents a screen in the game.
- `main.tsx`: The main dashboard (HUD, stats, daily actions).
- `shop.tsx`: Handles purchasing logic. Note how it calculates cart totals and then dispatches `BUY_ITEMS`.

---

## 🛠️ How to Add a New Feature

### Scenario: Adding a new Shop Item (e.g., "Energy Drink")
1. Open `src/lib/game/gameData.ts`.
2. Locate `SHOP_ITEMS.food`.
3. Add the item object:
   ```javascript
   {
     id: 'energy_drink',
     name: 'Energy Drink',
     price: 35,
     hungerRestore: 2,
     energyRestore: 15,
     description: 'A quick boost of energy.'
   }
   ```
4. *That's it!* Because `shop.tsx` dynamically renders everything in `SHOP_ITEMS`, it will automatically appear in the shop.

### Scenario: Adding a New Mechanic (e.g., "Gym Workout")
1. Open `src/store/gameContext.tsx` and add a new action type to `GameAction` (e.g., `{ type: 'WORKOUT' }`).
2. In the `gameReducer`, add a switch case for `WORKOUT` that deducts energy, deducts money, and increases health.
3. Create a UI button in one of the screens (e.g., `daily-actions.tsx`) that calls `dispatch({ type: 'WORKOUT' })`.

---

## ⚠️ Important Developer Rules

1. **NEVER mutate state directly.**
   Always return a new state object in `gameContext.tsx` using the spread operator (`...state`). Mutating state will break React's re-rendering.
   
2. **Watch your imports.**
   Do not import UI components (`Text`, `View`) into `gameEngine.ts` or `gameData.ts`. Keep UI and logic strictly separated.

3. **Running the App locally.**
   - Run `npm install`
   - Run `npx expo start -c` to clear the cache and start the Metro Bundler.
   - If UI elements aren't styling correctly, check that `nativewind/babel` and `withNativeWind` are properly configured in the metro/babel config files.
