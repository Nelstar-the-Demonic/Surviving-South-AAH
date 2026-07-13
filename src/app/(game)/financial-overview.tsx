import { View, Text, ScrollView } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { computeDailyFinancials, formatMoney } from '@/lib/game/gameEngine';

interface RowProps {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}

function IncomeRow({ label, value, icon }: RowProps) {
  if (value <= 0) return null;
  return (
    <View className="flex-row items-center justify-between py-2"
      style={{ borderBottomWidth: 1, borderBottomColor: '#111' }}>
      <View className="flex-row items-center gap-2">
        <Text>{icon}</Text>
        <Text className="text-foreground text-sm">{label}</Text>
      </View>
      <Text className="font-bold text-sm" style={{ color: '#4CAF50' }}>+{formatMoney(value)}</Text>
    </View>
  );
}

function ExpenseRow({ label, value, icon }: RowProps) {
  if (value <= 0) return null;
  return (
    <View className="flex-row items-center justify-between py-2"
      style={{ borderBottomWidth: 1, borderBottomColor: '#111' }}>
      <View className="flex-row items-center gap-2">
        <Text>{icon}</Text>
        <Text className="text-foreground text-sm">{label}</Text>
      </View>
      <Text className="font-bold text-sm" style={{ color: '#E32636' }}>-{formatMoney(value)}</Text>
    </View>
  );
}

function SectionHeader({ title, total, isIncome }: { title: string; total: number; isIncome: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-3 mb-1"
      style={{ borderBottomWidth: 1, borderBottomColor: '#333' }}>
      <Text className="text-xs font-bold tracking-wider text-muted-foreground">{title}</Text>
      <Text className="font-bold text-base" style={{ color: isIncome ? '#4CAF50' : '#E32636' }}>
        {isIncome ? '+' : '-'}{formatMoney(total)}
      </Text>
    </View>
  );
}

export default function FinancialOverview() {
  const { state } = useGame();
  if (!state?.gameStarted) return null;

  const { dailyIncome, dailyExpenses, netDaily } = computeDailyFinancials(state);

  const netColor = netDaily >= 0 ? '#4CAF50' : '#E32636';

  // Recent 30-day actual cash flow
  const recent30 = state.financeHistory.filter(r => state.day - r.day <= 30);
  const actual30Income  = recent30.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const actual30Expense = recent30.filter(r => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);

  // Bank balances
  const { currentBalance, noticeBalance, interestRate } = state.bank;

  return (
    <View className="flex-1 bg-background">
      <GameHeader title="Financial Overview" subtitle="Income, expenses & cash flow" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="px-4 pt-4 pb-10">

          {/* Net Daily Banner */}
          <View className="mb-5 p-4 items-center"
            style={{ backgroundColor: netDaily >= 0 ? '#0D1A0D' : '#1A0A00', borderWidth: 2, borderColor: netColor }}>
            <Text className="text-xs text-muted-foreground tracking-wider mb-1">ESTIMATED NET DAILY INCOME</Text>
            <Text className="text-4xl font-bold" style={{ color: netColor }}>
              {netDaily >= 0 ? '+' : ''}{formatMoney(netDaily)}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              Based on last 30 days average
            </Text>
          </View>

          {/* Daily Income Breakdown */}
          <View className="mb-5 p-4" style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#1E1E1E' }}>
            <SectionHeader title="DAILY INCOME" total={dailyIncome.total} isIncome />
            <IncomeRow label="Salary / Wages"       value={dailyIncome.salary}       icon="💼" />
            <IncomeRow label="Business Profits"     value={dailyIncome.business}     icon="🏪" />
            <IncomeRow label="Farming & Produce"    value={dailyIncome.farming}      icon="🌾" />
            <IncomeRow label="Rental Income"        value={dailyIncome.rentals}      icon="🏠" />
            <IncomeRow label="Bank Interest"        value={dailyIncome.interest}     icon="🏦" />
            <IncomeRow label="Prison Labour"        value={dailyIncome.prisonLabour} icon="⛏️" />
            {dailyIncome.total === 0 && (
              <Text className="text-muted-foreground text-sm py-2 text-center">
                No active income sources yet.
              </Text>
            )}
          </View>

          {/* Daily Expenses Breakdown */}
          <View className="mb-5 p-4" style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#1E1E1E' }}>
            <SectionHeader title="DAILY EXPENSES" total={dailyExpenses.total} isIncome={false} />
            <ExpenseRow label="Food & Supplies"     value={dailyExpenses.food}       icon="🛒" />
            <ExpenseRow label="Utilities"           value={dailyExpenses.utilities}  icon="💡" />
            <ExpenseRow label="Education Fees"      value={dailyExpenses.education}  icon="📚" />
            <ExpenseRow label="Property Payments"   value={dailyExpenses.property}   icon="🏡" />
            <ExpenseRow label="Medical Costs"       value={dailyExpenses.medical}    icon="🏥" />
            <ExpenseRow label="Business Costs"      value={dailyExpenses.business}   icon="📦" />
            {dailyExpenses.total === 0 && (
              <Text className="text-muted-foreground text-sm py-2 text-center">
                No tracked expenses yet.
              </Text>
            )}
          </View>

          {/* 30-Day Actual Summary */}
          <View className="mb-5 p-4" style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#1E1E1E' }}>
            <Text className="text-xs font-bold tracking-wider text-muted-foreground mb-3">LAST 30 DAYS — ACTUAL</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 p-3 items-center" style={{ backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs text-muted-foreground mb-1">TOTAL IN</Text>
                <Text className="font-bold text-lg" style={{ color: '#4CAF50' }}>+{formatMoney(actual30Income)}</Text>
              </View>
              <View className="flex-1 p-3 items-center" style={{ backgroundColor: '#1A0A00', borderWidth: 1, borderColor: '#E32636' }}>
                <Text className="text-xs text-muted-foreground mb-1">TOTAL OUT</Text>
                <Text className="font-bold text-lg" style={{ color: '#E32636' }}>-{formatMoney(actual30Expense)}</Text>
              </View>
            </View>
            <View className="mt-3 p-3 items-center"
              style={{ backgroundColor: actual30Income >= actual30Expense ? '#0D1A0D' : '#1A0A00', borderWidth: 1, borderColor: actual30Income >= actual30Expense ? '#4CAF50' : '#E32636' }}>
              <Text className="text-xs text-muted-foreground mb-1">30-DAY NET</Text>
              <Text className="font-bold text-xl" style={{ color: actual30Income >= actual30Expense ? '#4CAF50' : '#E32636' }}>
                {actual30Income >= actual30Expense ? '+' : '-'}{formatMoney(Math.abs(actual30Income - actual30Expense))}
              </Text>
            </View>
          </View>

          {/* Bank Accounts */}
          <View className="mb-5 p-4" style={{ backgroundColor: '#0D0D0D', borderWidth: 1, borderColor: '#1E1E1E' }}>
            <Text className="text-xs font-bold tracking-wider text-muted-foreground mb-3">BANK ACCOUNTS</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 p-3" style={{ backgroundColor: '#001A2A', borderWidth: 1, borderColor: '#64B5F6' }}>
                <Text className="text-xs text-muted-foreground mb-1">SAVINGS</Text>
                <Text className="font-bold text-base" style={{ color: '#64B5F6' }}>{formatMoney(currentBalance)}</Text>
                <Text className="text-xs text-muted-foreground mt-1">2.5% / month interest</Text>
              </View>
              <View className="flex-1 p-3" style={{ backgroundColor: '#001A1A', borderWidth: 1, borderColor: '#4CAF50' }}>
                <Text className="text-xs text-muted-foreground mb-1">32-DAY NOTICE</Text>
                <Text className="font-bold text-base" style={{ color: '#4CAF50' }}>{formatMoney(noticeBalance)}</Text>
                <Text className="text-xs text-muted-foreground mt-1">{(interestRate * 100).toFixed(1)}% / month interest</Text>
              </View>
            </View>
          </View>

          {/* Prison Labour note if imprisoned */}
          {state.prison.imprisoned && (
            <View className="mb-5 p-4" style={{ backgroundColor: '#0D0500', borderWidth: 1, borderColor: '#FF6B35' }}>
              <Text className="text-xs font-bold tracking-wider mb-2" style={{ color: '#FF6B35' }}>⛏️ PRISON LABOUR</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-muted-foreground">Total Prison Earnings</Text>
                <Text className="font-bold text-sm" style={{ color: '#4CAF50' }}>{formatMoney(state.prison.prisonEarnings)}</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-muted-foreground">Days Served</Text>
                <Text className="font-bold text-sm text-foreground">{state.prison.daysServed} / {state.prison.sentenceDays}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted-foreground">Avg Daily Labour Pay</Text>
                <Text className="font-bold text-sm" style={{ color: '#4CAF50' }}>
                  {formatMoney(dailyIncome.prisonLabour)}/day
                </Text>
              </View>
              <Text className="text-xs text-muted-foreground mt-2">
                ⚠️ Businesses continue operating while imprisoned. Monthly expenses still apply.
              </Text>
            </View>
          )}

          {/* Tips */}
          <View className="p-3" style={{ backgroundColor: '#0A0800', borderWidth: 1, borderColor: '#333' }}>
            <Text className="text-xs text-muted-foreground leading-5">
              💡 Income averages are based on last 30 days of activity. Estimates improve as you play longer.
              {'\n'}📈 Invest in businesses and farm for passive income that grows over time.
              {'\n'}🏦 Keep money in the 32-Day Notice Account for maximum interest earnings.
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
