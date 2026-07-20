// ─── Location-based visual theme ───────────────────────────────────────────
// Gives every location its own distinct colour identity (no images needed) —
// e.g. the Farm leans into deep vegetable/veld greens, Township into warm
// gold-and-earth tones, City into cool steel-blue, and so on. Each screen can
// pull `useLocationTheme()` and use `theme.bg` / `theme.surface` / etc. in
// place of the old flat dark background (which came from THEME.dark in
// `src/lib/theme.ts` — that file is React Navigation's own theming and is
// left untouched here).

import { useGame } from '@/store/gameContext';
import type { Location } from '@/types/game';

export interface LocationPalette {
  bg: string;        // main screen background
  surface: string;   // card / panel background (slightly lighter than bg)
  border: string;    // borders, dividers, muted accents
  accent: string;    // highlight colour — buttons, active tabs, key numbers
  headerBg: string;  // header bar background (blends with time-of-day tint)
}

export const LOCATION_THEMES: Record<Location, LocationPalette> = {
  // Deep vegetable/veld greens — maize fields, cabbage rows, open farmland
  Farm: {
    bg:       '#0A150C',
    surface:  '#132B18',
    border:   '#2F6B3C',
    accent:   '#8BC34A',
    headerBg: '#0E2012',
  },
  // Warm terracotta/clay earth tones — rural homesteads
  Village: {
    bg:       '#170F08',
    surface:  '#2A1D10',
    border:   '#6B4226',
    accent:   '#D4A055',
    headerBg: '#1D140B',
  },
  // Vibrant gold-and-red township energy — murals, spaza shops, shebeens
  Township: {
    bg:       '#1A0C08',
    surface:  '#2E150D',
    border:   '#8B3A1F',
    accent:   '#F5C842',
    headerBg: '#22100A',
  },
  // Rust and corrugated-iron tones
  'Informal Settlement': {
    bg:       '#150F09',
    surface:  '#271C10',
    border:   '#7A5A30',
    accent:   '#D68C3C',
    headerBg: '#1C140C',
  },
  // Neutral warm gray-brown — small-town Main Street
  Town: {
    bg:       '#110F0B',
    surface:  '#211D16',
    border:   '#5A4F3A',
    accent:   '#C9A876',
    headerBg: '#171310',
  },
  // Soft leafy blue-green — quiet residential
  Suburb: {
    bg:       '#0A1211',
    surface:  '#132522',
    border:   '#2D5F55',
    accent:   '#4FD8B8',
    headerBg: '#0E1C19',
  },
  // Cool steel blue — urban skyline
  City: {
    bg:       '#070A10',
    surface:  '#101828',
    border:   '#2A3A5F',
    accent:   '#4FC3F7',
    headerBg: '#0B0F1A',
  },
};

const FALLBACK_THEME = LOCATION_THEMES.Township;

/** Returns the current location's colour palette. Falls back safely if state isn't ready yet. */
export function useLocationTheme(): LocationPalette {
  const { state } = useGame();
  const location = state?.location;
  if (!location) return FALLBACK_THEME;
  return LOCATION_THEMES[location] ?? FALLBACK_THEME;
}

/** Non-hook variant for places that already have `location` in scope. */
export function getLocationTheme(location: Location | undefined | null): LocationPalette {
  if (!location) return FALLBACK_THEME;
  return LOCATION_THEMES[location] ?? FALLBACK_THEME;
}
