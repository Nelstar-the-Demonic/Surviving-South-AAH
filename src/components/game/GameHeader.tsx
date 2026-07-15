import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useGame } from '@/store/gameContext';
import { formatMoney } from '@/lib/game/gameEngine';

const C = {
  bg:         '#0A0A0F',
  surface:    '#13131A',
  border:     '#2A2A3A',
  gold:       '#F5C842',
  green:      '#4ADE80',
  red:        '#F87171',
  orange:     '#FB923C',
  textPrimary:'#F1F0FF',
  textSub:    '#9B9BB8',
  textMuted:  '#5A5A72',
};

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

  const energyColor = energy >= 50 ? C.green : energy >= 25 ? C.gold : C.red;
  const hungerColor = hunger >= 50 ? C.green : hunger >= 25 ? C.gold : C.red;

  return (
    <View style={{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, zIndex: 10, elevation: 10 }}>
      {/* Row 1: Cash + stats */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: C.green, fontSize: 14, fontWeight: '800' }}>💵 {formatMoney(cash)}</Text>
          {hasPartner && <Text style={{ color: '#F472B6', fontSize: 12 }}>💕 Partner</Text>}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Hunger */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: hungerColor, fontSize: 12 }}>🍽️ {hunger}</Text>
            <View style={{ width: 44, height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: `${hunger}%`, height: 5, backgroundColor: hungerColor, borderRadius: 3 }} />
            </View>
          </View>
          {/* Energy */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ color: energyColor, fontSize: 12 }}>⚡ {energy}</Text>
            <View style={{ width: 44, height: 5, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ width: `${energy}%`, height: 5, backgroundColor: energyColor, borderRadius: 3 }} />
            </View>
          </View>
        </View>
      </View>

      {/* Row 2: Back + Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: 4 }}>
            <ChevronLeft size={22} color={C.gold} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.textPrimary, fontSize: 20, fontWeight: '800', letterSpacing: 0.3 }}>{title}</Text>
          {subtitle ? <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
      </View>

      {/* Row 3: Extra stats */}
      {extraStats && extraStats.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
          {extraStats.map((s) => (
            <Text key={s.label} style={{ color: C.textSub, fontSize: 12 }}>
              {s.label}:{' '}
              <Text style={{ color: s.color ?? C.textPrimary, fontWeight: '700' }}>{s.value}</Text>
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
