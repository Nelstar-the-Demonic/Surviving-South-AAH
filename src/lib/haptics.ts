import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Trigger a light haptic feedback.
 * Use for minor UI interactions (e.g. switching tabs).
 */
export function hapticLight() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/**
 * Trigger a medium haptic feedback.
 * Use for standard actions (e.g. buying an item, regular buttons).
 */
export function hapticMedium() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/**
 * Trigger a heavy haptic feedback.
 * Use for major actions (e.g. getting a job, finishing a day, massive purchases).
 */
export function hapticHeavy() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

/**
 * Trigger a success notification feedback.
 * Use for very positive outcomes (e.g. surviving a crime, promotion, relationship level up).
 */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/**
 * Trigger a warning notification feedback.
 * Use for dangerous or risky actions.
 */
export function hapticWarning() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/**
 * Trigger an error notification feedback.
 * Use for failures (e.g. getting caught by police, losing all health, bank debt).
 */
export function hapticError() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
