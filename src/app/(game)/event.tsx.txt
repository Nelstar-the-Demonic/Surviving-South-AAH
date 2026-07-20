import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameButton } from '@/components/game/GameButton';

interface ResolvedResult {
  icon: string;
  borderColor: string;
  eventTitle: string;
  choiceLabel: string;
  outcome: string;
  wasLast: boolean;
}

export default function EventModal() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [resolved, setResolved] = useState<ResolvedResult | null>(null);

  if (!state?.gameStarted) return null;
  const { pendingEvents } = state;

  if (!resolved && pendingEvents.length === 0) {
    router.replace('/(game)/main');
    return null;
  }

  const event = pendingEvents[0];

  const iconMap: Record<string, string> = {
    family: '👨‍👩‍👧',
    business: '🏪',
    crime: '🚔',
    opportunity: '💡',
    health: '🏥',
    farming: '🌾',
    neighbour: '🏘️',
    random: '🎲',
    education: '🎓',
    vehicle: '🚗',
    // New categories from the event library — additive only
    romance: '💕',
    friendship: '🤝',
    npc: '🙋',
    police: '👮',
    livestock: '🐄',
    weather: '🌦️',
    illness: '🤒',
    festival: '🎪',
    taxi: '🚕',
    school: '📝',
    university: '🎓',
    community: '🏘️',
    politics: '📢',
    corruption: '✋',
    gambling: '🎲',
    alcohol: '🍺',
    drugs: '💊',
    fire: '🔥',
    theft: '👛',
    market: '🏷️',
    loadshedding: '💡',
    water: '🚰',
    funeral: '🕊️',
    wedding: '💒',
    ceremony: '🔥',
    sports: '⚽',
    religion: '⛪',
    strike: '🚕',
    protest: '🔥',
    meeting: '🗳️',
  };

  const typeColors: Record<string, string> = {
    opportunity: '#4CAF50',
    crime: '#E32636',
    health: '#FF6B35',
    business: '#FFB81C',
    family: '#9C88FF',
    random: '#888',
    farming: '#8BC34A',
    vehicle: '#2196F3',
    education: '#00BCD4',
    neighbour: '#FF9800',
    // New categories from the event library — additive only
    romance: '#E91E8C',
    friendship: '#4CAF50',
    npc: '#9E9E9E',
    police: '#3B5BA5',
    livestock: '#8BC34A',
    weather: '#00A6D6',
    illness: '#FF6B35',
    festival: '#FFB81C',
    taxi: '#2196F3',
    school: '#00BCD4',
    university: '#00BCD4',
    community: '#FF9800',
    politics: '#795548',
    corruption: '#607D8B',
    gambling: '#9C27B0',
    alcohol: '#8D6E63',
    drugs: '#E32636',
    fire: '#E32636',
    theft: '#E32636',
    market: '#FFB81C',
    loadshedding: '#FFC107',
    water: '#00A6D6',
    funeral: '#607D8B',
    wedding: '#E91E8C',
    ceremony: '#9C27B0',
    sports: '#4CAF50',
    religion: '#9C88FF',
    strike: '#2196F3',
    protest: '#E32636',
    meeting: '#795548',
  };

  function choose(choiceIndex: number) {
    const choice = event.choices[choiceIndex];
    const wasLast = pendingEvents.length <= 1;
    const icon = iconMap[event.type] ?? '📢';
    const borderColor = typeColors[event.type] ?? '#FFB81C';

    dispatch({ type: 'RESOLVE_EVENT', payload: { eventId: event.id, choiceIndex } });

    if (!choice.outcome) {
      // Nothing to reveal (e.g. simple "OK" acknowledgements) — skip straight through
      if (wasLast) router.back();
      return;
    }

    setResolved({
      icon, borderColor,
      eventTitle: event.title,
      choiceLabel: choice.label,
      outcome: choice.outcome,
      wasLast,
    });
  }

  function continueAfterResult() {
    const wasLast = resolved?.wasLast;
    setResolved(null);
    if (wasLast) router.back();
  }

  function dismiss() {
    dispatch({ type: 'DISMISS_EVENT', payload: event.id });
    if (pendingEvents.length <= 1) {
      router.back();
    }
  }

  // ─── Result reveal screen (shown AFTER a choice is made) ──────────────────
  if (resolved) {
    return (
      <View className="flex-1 bg-background">
        <View
          className="pt-14 pb-4 px-4"
          style={{ borderBottomWidth: 2, borderBottomColor: resolved.borderColor }}
        >
          <Text className="text-muted-foreground text-xs tracking-wider mb-1">RESULT</Text>
        </View>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View className="px-4 pt-6 pb-10">
            <View
              className="p-6 mb-6"
              style={{ backgroundColor: '#0D0D0D', borderWidth: 2, borderColor: resolved.borderColor }}
            >
              <Text className="text-5xl text-center mb-4">{resolved.icon}</Text>
              <Text className="text-muted-foreground text-xs text-center mb-2">{resolved.eventTitle}</Text>
              <Text className="text-foreground text-sm text-center mb-4 italic" style={{ color: resolved.borderColor }}>
                "{resolved.choiceLabel}"
              </Text>
              <Text className="text-foreground text-base text-center leading-6">
                {resolved.outcome}
              </Text>
            </View>
            <GameButton
              label="CONTINUE"
              onPress={continueAfterResult}
              variant="primary"
              size="lg"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const icon = iconMap[event.type] ?? '📢';
  const borderColor = typeColors[event.type] ?? '#FFB81C';

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="pt-14 pb-4 px-4"
        style={{ borderBottomWidth: 2, borderBottomColor: borderColor }}
      >
        <Text className="text-muted-foreground text-xs tracking-wider mb-1">
          📢 EVENT — {event.type.toUpperCase()}
        </Text>
        {pendingEvents.length > 1 && (
          <Text className="text-muted-foreground text-xs">
            {pendingEvents.length} events pending
          </Text>
        )}
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-6 pb-10">

          {/* Event card */}
          <View
            className="p-6 mb-6"
            style={{ backgroundColor: '#0D0D0D', borderWidth: 2, borderColor }}
          >
            <Text className="text-5xl text-center mb-4">{icon}</Text>
            <Text
              className="text-xl font-bold text-center mb-3"
              style={{ color: borderColor }}
            >
              {event.title}
            </Text>
            <Text className="text-foreground text-base text-center leading-6">
              {event.description}
            </Text>
          </View>

          {/* Choices — label only. Outcomes are revealed after choosing, not before. */}
          {event.choices.length > 0 ? (
            <>
              <Text className="text-muted-foreground text-xs mb-3 tracking-wider">YOUR RESPONSE</Text>
              {event.choices.map((choice, i) => (
                <Pressable
                  key={i}
                  onPress={() => choose(i)}
                  className="mb-3 p-4"
                  style={{
                    borderWidth: 1,
                    borderColor: '#FFB81C',
                    backgroundColor: '#0D0A00',
                  }}
                >
                  <Text className="text-foreground font-bold text-sm">{choice.label}</Text>
                </Pressable>
              ))}
            </>
          ) : (
            <GameButton
              label="ACKNOWLEDGE"
              onPress={dismiss}
              variant="primary"
              size="lg"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
