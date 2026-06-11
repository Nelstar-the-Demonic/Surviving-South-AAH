import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useGame } from '@/store/gameContext';
import { formatMoney } from '@/lib/game/gameEngine';

interface ExtraStat {
  label: string;
  value: string;
  color?: string;
}

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  extraStats?: ExtraStat[];
}

export function GameHeader({ title, subtitle, showBack = true, extraStats }: GameHeaderProps) {
  const router = useRouter();
  const { state } = useGame();
  const cash = state?.cash ?? 0;
  const energy = state?.stats?.energy ?? 0;
  const hunger = state?.stats?.hunger ?? 0;
  const hasPartner = state?.npcs?.some(n => n.romanticStage === 'partner') ?? false;

  const energyColor = energy >= 50 ? '#4CAF50' : energy >= 25 ? '#FFB81C' : '#E32636';
  const hungerColor = hunger >= 50 ? '#4CAF50' : hunger >= 25 ? '#FFB81C' : '#E32636';

  return (
    <View className="bg-card border-b border-border px-4 pt-12 pb-3">
      {/* Row 1: Cash + Energy + Hunger */}
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-3">
          <Text className="text-xs font-bold" style={{ color: '#D4AF37' }}>
            💵 {formatMoney(cash)}
          </Text>
          {hasPartner && (
            <Text className="text-xs" style={{ color: '#FF69B4' }}>💕 Partner</Text>
          )}
        </View>
        <View className="flex-row items-center gap-3">
          {/* Hunger bar */}
          <View className="flex-row items-center gap-1">
            <Text className="text-xs" style={{ color: hungerColor }}>🍽️ {hunger}</Text>
            <View className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
              <View className="h-1.5 rounded-full" style={{ width: `${hunger}%`, backgroundColor: hungerColor }} />
            </View>
          </View>
          {/* Energy bar */}
          <View className="flex-row items-center gap-1">
            <Text className="text-xs" style={{ color: energyColor }}>⚡ {energy}</Text>
            <View className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
              <View className="h-1.5 rounded-full" style={{ width: `${energy}%`, backgroundColor: energyColor }} />
            </View>
          </View>
        </View>
      </View>

      {/* Row 2: Back button + Title */}
      <View className="flex-row items-center gap-3">
        {showBack && (
          <Pressable onPress={() => router.back()} className="p-1">
            <ChevronLeft size={22} color="#D4AF37" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-foreground text-xl font-bold tracking-wide">{title}</Text>
          {subtitle ? <Text className="text-muted-foreground text-xs mt-0.5">{subtitle}</Text> : null}
        </View>
      </View>

      {/* Row 3: Context-aware extra stats (screen-specific) */}
      {extraStats && extraStats.length > 0 && (
        <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2 pt-2"
          style={{ borderTopWidth: 1, borderTopColor: '#1E1E1E' }}>
          {extraStats.map((s) => (
            <Text key={s.label} className="text-xs" style={{ color: s.color ?? '#888' }}>
              {s.label}: <Text className="font-bold" style={{ color: s.color ?? '#EAEAEA' }}>{s.value}</Text>
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

