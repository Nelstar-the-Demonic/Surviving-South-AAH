import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useGame } from '@/store/gameContext';
import { formatMoney } from '@/lib/game/gameEngine';

const CAT_ICONS: Record<string, string> = {
  work:       '💼',
  business:   '🏪',
  farm:       '🌾',
  shop:       '🛒',
  rent:       '🏠',
  education:  '🎓',
  bank:       '🏦',
  government: '🏛️',
  crime:      '🔪',
  fine:       '🚔',
  other:      '📦',
};

export function DaySummaryModal() {
  const { state, dispatch } = useGame();

  if (!state?.showDaySummary || !state.lastDaySummary) return null;

  const summary = state.lastDaySummary;
  const { day, income, expenses, statsChanges, events, highlights } = summary;

  const net = income - expenses;

  function dismiss() {
    dispatch({ type: 'DISMISS_DAY_SUMMARY' });
  }

  // Build breakdown from financeHistory for this day
  const dayRecords = state.financeHistory.filter(r => r.day === day - 1);
  const incomeRecords = dayRecords.filter(r => r.amount > 0);
  const expenseRecords = dayRecords.filter(r => r.amount < 0);

  // Group by category
  const incomeByCategory: Record<string, number> = {};
  incomeRecords.forEach(r => {
    incomeByCategory[r.category] = (incomeByCategory[r.category] ?? 0) + r.amount;
  });
  const expenseByCategory: Record<string, number> = {};
  expenseRecords.forEach(r => {
    expenseByCategory[r.category] = (expenseByCategory[r.category] ?? 0) + Math.abs(r.amount);
  });

  const statEntries = Object.entries(statsChanges ?? {}).filter(([, v]) => v !== 0);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <View className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>

        <View className="w-full max-w-sm"
          style={{ backgroundColor: '#0D0A00', borderWidth: 2, borderColor: '#D4AF37', maxHeight: '85%' }}>

          {/* Header */}
          <View className="px-5 pt-5 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: '#2A2000' }}>
            <Text className="text-xs tracking-widest mb-1" style={{ color: '#888' }}>END OF DAY</Text>
            <Text className="text-2xl font-bold" style={{ color: '#D4AF37' }}>Day {day - 1} Summary</Text>
            <Text className="text-xs mt-0.5" style={{ color: '#888' }}>New day has begun</Text>
          </View>

          <ScrollView className="px-5 py-4" contentContainerStyle={{ paddingBottom: 16 }}>

            {/* Net P&L */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 p-3 items-center"
                style={{ backgroundColor: '#0A1200', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs" style={{ color: '#4CAF50' }}>INCOME</Text>
                <Text className="font-bold text-base mt-0.5" style={{ color: '#4CAF50' }}>{formatMoney(income)}</Text>
              </View>
              <View className="flex-1 p-3 items-center"
                style={{ backgroundColor: '#1A0000', borderWidth: 1, borderColor: '#E32636' }}>
                <Text className="text-xs" style={{ color: '#E32636' }}>EXPENSES</Text>
                <Text className="font-bold text-base mt-0.5" style={{ color: '#E32636' }}>{formatMoney(expenses)}</Text>
              </View>
              <View className="flex-1 p-3 items-center"
                style={{ backgroundColor: net >= 0 ? '#0A1200' : '#1A0000', borderWidth: 1, borderColor: net >= 0 ? '#D4AF37' : '#E32636' }}>
                <Text className="text-xs" style={{ color: net >= 0 ? '#D4AF37' : '#E32636' }}>NET</Text>
                <Text className="font-bold text-base mt-0.5" style={{ color: net >= 0 ? '#D4AF37' : '#E32636' }}>
                  {net >= 0 ? '+' : ''}{formatMoney(net)}
                </Text>
              </View>
            </View>

            {/* Income breakdown */}
            {Object.keys(incomeByCategory).length > 0 && (
              <View className="mb-4">
                <Text className="text-xs tracking-wider mb-2" style={{ color: '#4CAF50' }}>INCOME SOURCES</Text>
                {Object.entries(incomeByCategory).map(([cat, amt]) => (
                  <View key={cat} className="flex-row justify-between items-center py-1"
                    style={{ borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
                    <Text className="text-xs" style={{ color: '#AAAAAA' }}>
                      {CAT_ICONS[cat] ?? '💰'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                    <Text className="text-xs font-bold" style={{ color: '#4CAF50' }}>+{formatMoney(amt)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Expense breakdown */}
            {Object.keys(expenseByCategory).length > 0 && (
              <View className="mb-4">
                <Text className="text-xs tracking-wider mb-2" style={{ color: '#E32636' }}>EXPENSES</Text>
                {Object.entries(expenseByCategory).map(([cat, amt]) => (
                  <View key={cat} className="flex-row justify-between items-center py-1"
                    style={{ borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
                    <Text className="text-xs" style={{ color: '#AAAAAA' }}>
                      {CAT_ICONS[cat] ?? '📦'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                    <Text className="text-xs font-bold" style={{ color: '#E32636' }}>-{formatMoney(amt)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Stat changes */}
            {statEntries.length > 0 && (
              <View className="mb-4">
                <Text className="text-xs tracking-wider mb-2" style={{ color: '#888' }}>STAT CHANGES</Text>
                <View className="flex-row flex-wrap gap-2">
                  {statEntries.map(([stat, delta]) => (
                    <View key={stat} className="px-2 py-1"
                      style={{ backgroundColor: (delta as number) >= 0 ? '#0A1200' : '#1A0000', borderWidth: 1, borderColor: (delta as number) >= 0 ? '#4CAF50' : '#E32636' }}>
                      <Text className="text-xs font-bold"
                        style={{ color: (delta as number) >= 0 ? '#4CAF50' : '#E32636' }}>
                        {stat} {(delta as number) >= 0 ? '+' : ''}{delta as number}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Highlights / events */}
            {highlights.length > 0 && (
              <View className="mb-2">
                <Text className="text-xs tracking-wider mb-2" style={{ color: '#D4AF37' }}>HIGHLIGHTS</Text>
                {highlights.map((h, i) => (
                  <Text key={i} className="text-xs mb-1" style={{ color: '#CCCCCC' }}>• {h}</Text>
                ))}
              </View>
            )}

            {events.length > 0 && (
              <View className="mb-2">
                <Text className="text-xs tracking-wider mb-2" style={{ color: '#FF9800' }}>EVENTS</Text>
                {events.map((e, i) => (
                  <Text key={i} className="text-xs mb-1" style={{ color: '#CCCCCC' }}>• {e}</Text>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Close button */}
          <Pressable
            onPress={dismiss}
            className="mx-5 mb-5 py-3 items-center"
            style={{ backgroundColor: '#D4AF37' }}
          >
            <Text className="font-bold text-sm" style={{ color: '#0D0D0D' }}>START DAY {day} →</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
