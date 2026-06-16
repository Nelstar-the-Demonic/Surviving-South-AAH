import { View, Text } from 'react-native';
import { getStatColor } from '@/lib/game/gameEngine';

interface StatBarProps {
  label: string;
  value: number;
  icon?: string;
  compact?: boolean;
}

export function StatBar({ label, icon, value, compact = false }: StatBarProps) {
  const color = getStatColor(value);
  const barWidth: `${number}%` = `${Math.max(2, value) as number}%`;

  if (compact) {
    return (
      <View className="mb-1">
        <View className="flex-row justify-between mb-0.5">
          <Text className="text-muted-foreground text-xs">{icon} {label}</Text>
          <Text className="text-xs font-bold" style={{ color }}>{value}</Text>
        </View>
        <View className="h-1.5 bg-secondary w-full">
          <View className="h-1.5" style={{ width: barWidth, backgroundColor: color }} />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-2">
      <View className="flex-row justify-between mb-1">
        <Text className="text-muted-foreground text-sm">{icon} {label}</Text>
        <Text className="text-sm font-bold" style={{ color }}>{value}/100</Text>
      </View>
      <View className="h-2 bg-secondary w-full">
        <View className="h-2" style={{ width: barWidth, backgroundColor: color }} />
      </View>
    </View>
  );
}
