import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { InfoCard } from '@/components/game/InfoCard';
import { formatMoney } from '@/lib/game/gameEngine';

export default function Bank() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'current' | 'notice'>('current');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { cash, bank, day } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  function deposit() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showFeedback('⚠️ Enter a valid amount.');
      return;
    }
    if (amt > cash) {
      showFeedback(`⚠️ You only have ${formatMoney(cash)} cash.`);
      return;
    }
    dispatch({ type: 'BANK_DEPOSIT', payload: amt });
    setAmount('');
    showFeedback(`✅ Deposited ${formatMoney(amt)} into Current Account.`);
  }

  function withdraw() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showFeedback('⚠️ Enter a valid amount.');
      return;
    }
    if (amt > bank.currentBalance) {
      showFeedback(`⚠️ Account balance is only ${formatMoney(bank.currentBalance)}.`);
      return;
    }
    dispatch({ type: 'BANK_WITHDRAW', payload: amt });
    setAmount('');
    showFeedback(`✅ Withdrew ${formatMoney(amt)} cash.`);
  }

  function noticeDeposit() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showFeedback('⚠️ Enter a valid amount.');
      return;
    }
    if (amt > cash) {
      showFeedback(`⚠️ Insufficient cash.`);
      return;
    }
    dispatch({ type: 'NOTICE_DEPOSIT', payload: amt });
    setAmount('');
    showFeedback(`✅ Locked ${formatMoney(amt)} in 32-Day Notice Account.`);
  }

  function noticeWithdraw() {
    if (bank.noticeLockUntilDay && day < bank.noticeLockUntilDay) {
      showFeedback(`⚠️ Funds locked until Day ${bank.noticeLockUntilDay}. Current: Day ${day}.`);
      return;
    }
    dispatch({ type: 'NOTICE_WITHDRAW' });
    showFeedback(`✅ Withdrew ${formatMoney(bank.noticeBalance)} from notice account.`);
  }

  const noticeIsLocked = bank.noticeLockUntilDay !== null && day < bank.noticeLockUntilDay;
  const daysUntilUnlock = bank.noticeLockUntilDay ? Math.max(0, bank.noticeLockUntilDay - day) : 0;

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
      <GameHeader title="Banking" subtitle="Manage your accounts" />

      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-4 pb-10">

          {feedback && (
            <View className="mb-4 p-3" style={{
              backgroundColor: feedback.includes('✅') ? '#0D1A0D' : '#1A0A00',
              borderWidth: 1,
              borderColor: feedback.includes('✅') ? '#4CAF50' : '#FFB81C',
            }}>
              <Text className="text-sm" style={{ color: feedback.includes('✅') ? '#4CAF50' : '#FFB81C' }}>
                {feedback}
              </Text>
            </View>
          )}

          {/* Wallet overview */}
          <View
            className="mb-4 p-4 flex-row justify-between"
            style={{ backgroundColor: '#0D0A00', borderWidth: 2, borderColor: '#FFB81C' }}
          >
            <View>
              <Text className="text-muted-foreground text-xs">CASH ON HAND</Text>
              <Text style={{ color: '#4CAF50' }} className="text-2xl font-bold">{formatMoney(cash)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-muted-foreground text-xs">TOTAL BANK</Text>
              <Text style={{ color: '#FFB81C' }} className="text-2xl font-bold">
                {formatMoney(bank.currentBalance + bank.noticeBalance)}
              </Text>
            </View>
          </View>

          {/* Tab strip */}
          <View className="flex-row gap-3 mb-4">
            {(['current', 'notice'] as const).map(t => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className="flex-1 py-3 items-center"
                style={{
                  borderWidth: 1,
                  borderColor: tab === t ? '#FFB81C' : '#333',
                  backgroundColor: tab === t ? '#1A1400' : '#0D0D0D',
                }}
              >
                <Text style={{ color: tab === t ? '#FFB81C' : '#666' }} className="font-bold text-sm">
                  {t === 'current' ? 'CURRENT ACCOUNT' : '32-DAY NOTICE'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* CURRENT ACCOUNT */}
          {tab === 'current' && (
            <>
              <InfoCard title="Current Account" accent>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-muted-foreground text-xs">BALANCE</Text>
                    <Text style={{ color: '#FFB81C' }} className="text-3xl font-bold">
                      {formatMoney(bank.currentBalance)}
                    </Text>
                  </View>
                  <Text className="text-4xl">🏦</Text>
                </View>
                <Text className="text-muted-foreground text-xs mt-2">
                  Standard current account. Instant deposits and withdrawals.
                </Text>
              </InfoCard>

              <View className="mb-3 p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
                <Text className="text-muted-foreground text-xs mb-2">AMOUNT (R)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="Enter amount..."
                  placeholderTextColor="#555"
                  className="bg-secondary text-foreground p-3 mb-4 text-base"
                  style={{ borderWidth: 1, borderColor: '#333' }}
                />
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={deposit}
                    className="flex-1 py-3 items-center"
                    style={{ backgroundColor: '#FFB81C' }}
                  >
                    <Text className="font-bold" style={{ color: '#0D0D0D' }}>DEPOSIT</Text>
                  </Pressable>
                  <Pressable
                    onPress={withdraw}
                    className="flex-1 py-3 items-center"
                    style={{ borderWidth: 1, borderColor: '#FFB81C' }}
                  >
                    <Text style={{ color: '#FFB81C' }} className="font-bold">WITHDRAW</Text>
                  </Pressable>
                </View>
              </View>

              {/* Quick deposit buttons */}
              <View className="flex-row flex-wrap gap-2">
                {[100, 500, 1000, 5000].map(v => (
                  <Pressable
                    key={v}
                    onPress={() => setAmount(v.toString())}
                    className="px-3 py-2"
                    style={{ borderWidth: 1, borderColor: '#333' }}
                  >
                    <Text className="text-muted-foreground text-xs">R{v}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setAmount(Math.floor(cash).toString())}
                  className="px-3 py-2"
                  style={{ borderWidth: 1, borderColor: '#333' }}
                >
                  <Text className="text-muted-foreground text-xs">All Cash</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* NOTICE ACCOUNT */}
          {tab === 'notice' && (
            <>
              <InfoCard title="32-Day Notice Account" accent>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-muted-foreground text-xs">LOCKED BALANCE</Text>
                    <Text style={{ color: '#FFB81C' }} className="text-3xl font-bold">
                      {formatMoney(bank.noticeBalance)}
                    </Text>
                  </View>
                  {noticeIsLocked && (
                    <View className="items-end">
                      <Text className="text-muted-foreground text-xs">UNLOCK IN</Text>
                      <Text style={{ color: '#E32636' }} className="font-bold">{daysUntilUnlock} days</Text>
                    </View>
                  )}
                </View>
                <Text className="text-muted-foreground text-xs mt-2">
                  Funds locked for 32 days. Earns interest on savings.
                  Cannot withdraw before lock period ends.
                </Text>
              </InfoCard>

              {noticeIsLocked ? (
                <View className="mb-4 p-4" style={{ backgroundColor: '#1A0A00', borderWidth: 1, borderColor: '#E32636' }}>
                  <Text style={{ color: '#E32636' }} className="text-sm font-bold">
                    🔒 Funds Locked
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-1">
                    Your {formatMoney(bank.noticeBalance)} is locked until Day {bank.noticeLockUntilDay} (in {daysUntilUnlock} days).
                  </Text>
                </View>
              ) : bank.noticeBalance > 0 ? (
                <Pressable
                  onPress={noticeWithdraw}
                  className="mb-4 py-4 items-center"
                  style={{ backgroundColor: '#FFB81C' }}
                >
                  <Text className="font-bold" style={{ color: '#0D0D0D' }}>
                    WITHDRAW {formatMoney(bank.noticeBalance)}
                  </Text>
                </Pressable>
              ) : null}

              {!noticeIsLocked && (
                <View className="p-4" style={{ borderWidth: 1, borderColor: '#333', backgroundColor: '#0D0D0D' }}>
                  <Text className="text-muted-foreground text-xs mb-2">DEPOSIT AMOUNT (R)</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholder="Enter amount to lock for 32 days..."
                    placeholderTextColor="#555"
                    className="bg-secondary text-foreground p-3 mb-3 text-base"
                    style={{ borderWidth: 1, borderColor: '#333' }}
                  />
                  <Pressable
                    onPress={noticeDeposit}
                    className="py-3 items-center"
                    style={{ backgroundColor: '#FFB81C' }}
                  >
                    <Text className="font-bold" style={{ color: '#0D0D0D' }}>LOCK FUNDS FOR 32 DAYS</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
