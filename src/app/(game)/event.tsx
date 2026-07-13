import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameButton } from '@/components/game/GameButton';

export default function EventModal() {
  const router = useRouter();
  const { state, dispatch } = useGame();

  if (!state?.gameStarted) return null;
  const { pendingEvents } = state;

  if (pendingEvents.length === 0) {
    router.replace('/(game)/main');
    return null;
  }

  const event = pendingEvents[0];

  function choose(choiceIndex: number) {
    dispatch({ type: 'RESOLVE_EVENT', payload: { eventId: event.id, choiceIndex } });
    if (pendingEvents.length <= 1) {
      router.back();
    }
  }

  function dismiss() {
    dispatch({ type: 'DISMISS_EVENT', payload: event.id });
    if (pendingEvents.length <= 1) {
      router.back();
    }
  }

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
  };
  const icon = iconMap[event.type] ?? '📢';

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
  };
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

          {/* Choices */}
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
                  <Text className="text-foreground font-bold text-sm mb-1">{choice.label}</Text>
                  {choice.outcome && (
                    <Text className="text-muted-foreground text-xs">{choice.outcome}</Text>
                  )}
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
