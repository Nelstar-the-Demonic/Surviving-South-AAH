/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EVENT SYSTEM INTEGRATION LAYER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file bridges the expanded eventSystem.ts with the existing game engine.
 * It provides:
 * 1. Integration hooks for gameEngine.ts
 * 2. Event cooldown tracking in GameState
 * 3. Conversion between ExpandedGameEvent and GameEvent formats
 * 4. Helper functions for event selection and resolution
 *
 * **NO CHANGES REQUIRED** to existing event resolution code in gameContext.tsx
 */

import type { GameState, GameEvent, PlayerStats } from '@/types/game';
import {
  selectRandomEvent,
  recordEventCooldown,
  decrementEventCooldowns,
  ExpandedGameEvent,
  getEventPoolStats,
} from './eventSystem';

/**
 * Extended GameState type with event cooldown tracking.
 * This is tracked per-session and persists across days.
 */
export interface GameStateWithEventCooldowns extends GameState {
  eventCooldowns?: Record<string, number>; // eventId -> cooldownUntilDay
}

/**
 * ─── Called once per day from gameEngine.ts applyDailyTick() ────────────────
 * Generates 0–1 event based on game state and event pool.
 * Seamlessly converts ExpandedGameEvent to GameEvent format.
 */
export function generateExpandedDailyEvents(state: GameStateWithEventCooldowns): GameStateWithEventCooldowns {
  // Decrement cooldowns every day
  let eventCooldowns = state.eventCooldowns || {};
  eventCooldowns = decrementEventCooldowns(eventCooldowns, state.day);

  // Select a random event from the expanded pool
  const selectedEvent = selectRandomEvent(state, eventCooldowns);
  if (!selectedEvent) {
    // No valid event this day
    return { ...state, eventCooldowns };
  }

  // Convert ExpandedGameEvent → GameEvent (backwards compatible)
  const gameEvent = expandedEventToGameEvent(selectedEvent, state.day);

  // Record cooldown
  eventCooldowns = recordEventCooldown(selectedEvent.id, eventCooldowns, state.day);

  return {
    ...state,
    eventCooldowns,
    pendingEvents: [...state.pendingEvents, gameEvent],
  };
}

/**
 * Converts an ExpandedGameEvent to a GameEvent (standard format).
 * Ensures backward compatibility with existing event resolution in gameContext.tsx.
 */
export function expandedEventToGameEvent(
  expanded: ExpandedGameEvent,
  day: number
): GameEvent {
  return {
    id: expanded.id,
    title: expanded.title,
    description: expanded.description,
    type: expanded.type,
    day,
    choices: expanded.choices,
  };
}

/**
 * ─── Lifecycle: Initialize GameState with Event Tracking ───────────────────
 * Call this when creating a new game.
 */
export function initializeEventCooldowns(state: GameState): GameStateWithEventCooldowns {
  return {
    ...state,
    eventCooldowns: {},
  };
}

/**
 * ─── DEBUG: Log Event Pool Statistics ─────────────────────────────────────
 * Use in development/testing to verify event pool is loaded correctly.
 */
export function logEventPoolStats(): void {
  const stats = getEventPoolStats();
  console.log('📊 EVENT POOL STATISTICS');
  console.log(`Total Events: ${stats.totalEvents}`);
  console.log('Events by Category:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
}

/**
 * ─── INTEGRATION CHECKLIST ───────────────────────────────────────────────
 *
 * ✅ 1. Import this file in gameEngine.ts
 *      import { generateExpandedDailyEvents, initializeEventCooldowns } from './eventSystemIntegration';
 *
 * ✅ 2. In createInitialGameState() (gameData.ts), initialize cooldowns:
 *      return {
 *        ...existingState,
 *        eventCooldowns: {},
 *      };
 *
 * ✅ 3. In applyDailyTick() (gameEngine.ts), replace generateDailyEvents() call:
 *      // OLD: s = generateDailyEvents(s);
 *      // NEW:
 *      s = generateExpandedDailyEvents(s as GameStateWithEventCooldowns);
 *
 * ✅ 4. Existing event resolution in gameContext.tsx requires NO changes!
 *      The ExpandedGameEvent format is fully backwards compatible.
 *
 * ✅ 5. When saving/loading game, ensure eventCooldowns are persisted:
 *      - AsyncStorage automatically handles new fields
 *      - No schema migration needed (field is optional)
 *
 * ✅ 6. Test with: logEventPoolStats() in console to verify events loaded
 *
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Example: How to manually trigger an event for testing
 */
export function testEventTrigger(
  state: GameStateWithEventCooldowns,
  eventId: string
): GameStateWithEventCooldowns {
  const allEvents = require('./eventSystem').ALL_EVENTS as ExpandedGameEvent[];
  const event = allEvents.find(e => e.id === eventId);
  if (!event) {
    console.warn(`Event ${eventId} not found`);
    return state;
  }

  const gameEvent = expandedEventToGameEvent(event, state.day);
  return {
    ...state,
    pendingEvents: [...state.pendingEvents, gameEvent],
  };
}

/**
 * Merge new GameState type with GameState everywhere it's used.
 * Since eventCooldowns is optional, existing code continues to work.
 */
export type CompatGameState = GameStateWithEventCooldowns;
