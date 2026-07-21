import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useGame } from '@/store/gameContext';
import { useLocationTheme } from '@/lib/locationTheme';
import { hapticMedium } from '@/lib/haptics';

const C = {
  textPrimary: '#F1F0FF',
  textSub:     '#9B9BB8',
  textMuted:   '#6E6E8A',
};

interface ResolvedResult {
  eventTitle: string;
  choiceLabel: string;
  outcome: string;
}

/**
 * Mounted once at the root (game) layout so it renders on top of whatever
 * screen the player is currently on — not just the main menu. Pops up the
 * instant `state.pendingEvents` has anything in it, no tap required.
 *
 * Choice buttons show ONLY the label. The outcome is revealed on a separate
 * screen after the player commits, via `RESOLVE_EVENT` having already been
 * dispatched, so effects are applied immediately and the reveal just reflects
 * what happened.
 */
export function GlobalEventOverlay() {
  const { state, dispatch } = useGame();
  const locTheme = useLocationTheme();
  const [resolved, setResolved] = useState<ResolvedResult | null>(null);

  if (!state?.gameStarted) return null;
  const pendingEvents = state.pendingEvents;
  if (pendingEvents.length === 0) return null;

  const event = pendingEvents[0];

  function choose(choiceIndex: number) {
    const choice = event.choices[choiceIndex];
    dispatch({ type: 'RESOLVE_EVENT', payload: { eventId: event.id, choiceIndex } });
    hapticMedium();
    if (choice.outcome) {
      setResolved({ eventTitle: event.title, choiceLabel: choice.label, outcome: choice.outcome });
    }
  }

  function acknowledge() {
    dispatch({ type: 'DISMISS_EVENT', payload: event.id });
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.88)', padding: 20 }}>
        <View style={{ width: '100%', maxWidth: 420, padding: 20, backgroundColor: locTheme.surface, borderWidth: 2, borderColor: locTheme.accent, borderRadius: 14 }}>
          {resolved ? (
            <>
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 }}>RESULT</Text>
              <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 10 }}>{resolved.eventTitle}</Text>
              <Text style={{ color: locTheme.accent, fontSize: 13, fontStyle: 'italic', marginBottom: 12 }}>"{resolved.choiceLabel}"</Text>
              <Text style={{ color: C.textPrimary, fontSize: 14, lineHeight: 21, marginBottom: 18 }}>{resolved.outcome}</Text>
              <Pressable
                onPress={() => setResolved(null)}
                style={{ padding: 13, alignItems: 'center', backgroundColor: locTheme.accent, borderRadius: 8 }}
              >
                <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>CONTINUE</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ color: locTheme.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 }}>
                📢 {event.type.toUpperCase()}
              </Text>
              <Text style={{ color: C.textPrimary, fontWeight: '800', fontSize: 17, marginBottom: 8 }}>{event.title}</Text>
              <Text style={{ color: C.textSub, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>{event.description}</Text>

              {event.choices.length > 0 ? (
                event.choices.map((choice, i) => (
                  <Pressable
                    key={i}
                    onPress={() => choose(i)}
                    style={{ marginBottom: 8, padding: 12, borderWidth: 1, borderColor: locTheme.border, backgroundColor: locTheme.bg, borderRadius: 8 }}
                  >
                    <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>{choice.label}</Text>
                  </Pressable>
                ))
              ) : (
                <Pressable
                  onPress={acknowledge}
                  style={{ padding: 12, alignItems: 'center', backgroundColor: locTheme.accent, borderRadius: 8 }}
                >
                  <Text style={{ color: '#000', fontWeight: '800', fontSize: 14 }}>ACKNOWLEDGE</Text>
                </Pressable>
              )}

              {pendingEvents.length > 1 && (
                <Text style={{ color: C.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12 }}>
                  {pendingEvents.length - 1} more event{pendingEvents.length - 1 > 1 ? 's' : ''} pending
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
