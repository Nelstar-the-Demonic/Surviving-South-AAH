import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useGame } from '@/store/gameContext';
import { GameHeader } from '@/components/game/GameHeader';
import { GameButton } from '@/components/game/GameButton';
import { InfoCard } from '@/components/game/InfoCard';
import { LICENCE_DEFINITIONS } from '@/lib/game/gameData';
import type { Qualification } from '@/types/game';
import React from 'react';

type SubMenu = 'home' | 'saps' | 'traffic' | 'business_reg' | 'sassa';

const GOLD = '#FFB81C';
const DARK = '#0D0D0D';
const PANEL = '#111111';
const BORDER = '#1E1E1E';

export default function Government() {
  const { state, dispatch } = useGame();
  const [menu, setMenu] = useState<SubMenu>('home');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!state?.gameStarted) return null;
  const { cash, qualifications, crimeState, prison, day, businesses } = state;

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  }

  function applyLicence(licenceId: string) {
    const def = LICENCE_DEFINITIONS.find(l => l.id === licenceId);
    if (!def) return;
    if (cash < def.cost) { showFeedback(`❌ Need R${def.cost}. You have R${Math.floor(cash)}.`); return; }
    if (qualifications.includes(def.qualification as Qualification)) { showFeedback('✅ You already have this licence.'); return; }
    dispatch({ type: 'APPLY_LICENCE', payload: licenceId });
    showFeedback(`✅ Applied for ${def.name}. Processing: ${def.processingDays} days.`);
  }

  function applySassa(grantType: string) {
    dispatch({ type: 'APPLY_SASSA', payload: grantType });
    showFeedback('✅ Application submitted. If approved, grant will be paid monthly.');
  }

  function registerBusiness() {
    const unreg = businesses.find(b => !b.isRegistered);
    if (!unreg) { showFeedback('❌ All businesses already registered.'); return; }
    if (cash < 1500) { showFeedback('❌ Need R1,500 for CIPC registration.'); return; }
    dispatch({ type: 'REGISTER_BUSINESS', payload: unreg.id });
    showFeedback(`✅ ${unreg.name} registered with CIPC.`);
  }

  const menuItems: { id: SubMenu; label: string; icon: string; desc: string }[] = [
    { id: 'saps',         label: 'SAPS',                    icon: '👮', desc: 'Criminal records, fines, prison info' },
    { id: 'traffic',      label: 'Traffic Department',      icon: '🚗', desc: 'Licences, renewals, PDP' },
    { id: 'business_reg', label: 'Business Registration',   icon: '🏢', desc: 'Register CIPC, view businesses' },
    { id: 'sassa',        label: 'SASSA',                   icon: '🏛️', desc: 'Social grants and applications' },
  ];

  const trafficItems = [
    { id: 'motorcycle_licence', label: 'Motorcycle Licence', icon: '🏍️', qual: 'Motorcycle Licence',       cost: 1400, days: 10 },
    { id: 'drivers_licence',    label: "Driver's Licence (Code 8)",  icon: '🚗', qual: 'Drivers Licence', cost: 1750, days: 14 },
    { id: 'code10_licence',     label: 'Code 10 Licence',   icon: '🚐', qual: 'Code 10 (Light Delivery)',   cost: 1750, days: 14 },
    { id: 'code14_licence',     label: 'Code 14 Licence',   icon: '🚛', qual: 'Code 14 (Heavy Vehicle)',    cost: 3250, days: 21 },
    { id: 'liquor_licence',     label: 'Liquor Licence',    icon: '🍺', qual: 'Liquor Licence',             cost: 4500, days: 30 },
    { id: 'drivers_licence',    label: 'Licence Renewal',   icon: '🔄', qual: 'Drivers Licence',            cost: 400,  days: 5  },
  ];

  const sassaGrants = [
    { id: 'srd',           label: 'SRD Grant',           desc: 'R350/month. Unemployed adults 18–59.',     icon: '📦' },
    { id: 'child_support', label: 'Child Support Grant', desc: 'R530/month per qualifying child.',          icon: '👶' },
    { id: 'old_age',       label: 'Old Age Grant',       desc: 'R2,090/month. Age 60+.',                   icon: '👴' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: DARK }}>
      <GameHeader
        title="Government Services"
        subtitle={menu === 'home' ? 'Select a department' : menuItems.find(m => m.id === menu)?.label ?? ''}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80, gap: 12 }}>

          {feedback && (
            <View style={{ padding: 12, backgroundColor: '#0D1A0D', borderWidth: 1, borderColor: GOLD }}>
              <Text style={{ color: GOLD, fontSize: 13 }}>{feedback}</Text>
            </View>
          )}

          {menu !== 'home' && (
            <Pressable onPress={() => setMenu('home')}>
              <Text style={{ color: GOLD, fontSize: 14 }}>← Back to Departments</Text>
            </Pressable>
          )}

          {/* ── HOME ── */}
          {menu === 'home' && menuItems.map(item => (
            <Pressable
              key={item.id}
              onPress={() => setMenu(item.id)}
              style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, padding: 16, borderRadius: 4 }}
            >
              <Text style={{ color: GOLD, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
                {item.icon}  {item.label}
              </Text>
              <Text style={{ color: '#666', fontSize: 12 }}>{item.desc}</Text>
            </Pressable>
          ))}

          {/* ── SAPS ── */}
          {menu === 'saps' && (
            <View style={{ gap: 12 }}>
              <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 8 }}>
                👮 SAPS — Police Services
              </Text>
              <InfoPanel title="Criminal Record">
                <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20 }}>
                  Total crimes: {crimeState.totalCrimes}{'\n'}
                  Cannabis sales caught: {crimeState.cannabisSalesCaught}{'\n'}
                  Status: {crimeState.totalCrimes > 0 ? '⚠️ On record' : '✅ Clean record'}
                </Text>
              </InfoPanel>
              <InfoPanel title="Outstanding Fines">
                <Text style={{ color: '#888', fontSize: 13 }}>
                  {crimeState.crimeRecords.filter(r => r.caught && r.finePaid === 0).length === 0
                    ? '✅ No outstanding fines.'
                    : `⚠️ ${crimeState.crimeRecords.filter(r => r.caught && r.finePaid === 0).length} unpaid fine(s) on record.`}
                </Text>
              </InfoPanel>
              <InfoPanel title="Prison Status">
                {prison.imprisoned ? (
                  <Text style={{ color: '#E32636', fontSize: 13, lineHeight: 20 }}>
                    🔒 Imprisoned at {prison.facility}{'\n'}
                    Sentence: {prison.sentenceDays} days · Served: {prison.daysServed} days{'\n'}
                    Remaining: {prison.sentenceDays - prison.daysServed} days
                  </Text>
                ) : (
                  <Text style={{ color: '#4CAF50', fontSize: 13 }}>✅ Not currently imprisoned.</Text>
                )}
              </InfoPanel>
            </View>
          )}

          {/* ── TRAFFIC ── */}
          {menu === 'traffic' && (
            <View style={{ gap: 12 }}>
              <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 8 }}>
                🚗 Traffic Department
              </Text>
              <InfoCard>
                <Text style={{ color: '#888', fontSize: 12 }}>
                  Held: {qualifications.filter(q => ['Motorcycle Licence','Drivers Licence','Code 10 (Light Delivery)','Code 14 (Heavy Vehicle)','Liquor Licence'].includes(q)).join(', ') || 'None'}
                </Text>
              </InfoCard>
              {trafficItems.map((item, i) => {
                const owned = qualifications.includes(item.qual as Qualification);
                return (
                  <View key={i} style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, padding: 14, borderRadius: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: GOLD, fontSize: 14, fontWeight: '700' }}>{item.icon} {item.label}</Text>
                        <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>R{item.cost.toLocaleString()} · {item.days} days processing</Text>
                      </View>
                      {owned && <Text style={{ color: '#4CAF50', fontSize: 11 }}>✅ HELD</Text>}
                    </View>
                    {!owned && (
                      <GameButton
                        label={cash >= item.cost ? `Apply — R${item.cost.toLocaleString()}` : `Insufficient funds (R${item.cost.toLocaleString()} needed)`}
                        onPress={() => applyLicence(item.id)}
                        disabled={cash < item.cost}
                        variant="secondary"
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* ── BUSINESS REG ── */}
          {menu === 'business_reg' && (
            <View style={{ gap: 12 }}>
              <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 8 }}>
                🏢 Business Registration (CIPC)
              </Text>
              {businesses.length === 0 ? (
                <InfoCard>
                  <Text style={{ color: '#666', fontSize: 13 }}>No businesses owned. Start a business first.</Text>
                </InfoCard>
              ) : (
                <>
                  {businesses.map(biz => (
                    <View key={biz.id} style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, padding: 14, borderRadius: 4 }}>
                      <Text style={{ color: GOLD, fontSize: 14, fontWeight: '700' }}>{biz.name}</Text>
                      <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{biz.type} · {biz.location}</Text>
                      <Text style={{ color: biz.isRegistered ? '#4CAF50' : '#E32636', fontSize: 12, marginTop: 6 }}>
                        {biz.isRegistered ? '✅ Registered with CIPC' : '⚠️ Unregistered — limited operations'}
                      </Text>
                    </View>
                  ))}
                  <GameButton
                    label="Register Business with CIPC — R1,500"
                    onPress={registerBusiness}
                    disabled={cash < 1500 || businesses.every(b => b.isRegistered)}
                    variant="primary"
                  />
                </>
              )}
            </View>
          )}

          {/* ── SASSA ── */}
          {menu === 'sassa' && (
            <View style={{ gap: 12 }}>
              <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 8 }}>
                🏛️ SASSA — Social Grants
              </Text>
              <InfoCard>
                <Text style={{ color: '#666', fontSize: 12, lineHeight: 18 }}>
                  Grants are paid monthly. Eligibility verified automatically. Working income may disqualify you from certain grants.
                </Text>
              </InfoCard>
              {sassaGrants.map(grant => (
                <View key={grant.id} style={{ backgroundColor: PANEL, borderWidth: 1, borderColor: BORDER, padding: 14, borderRadius: 4 }}>
                  <Text style={{ color: GOLD, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>{grant.icon} {grant.label}</Text>
                  <Text style={{ color: '#888', fontSize: 12, marginBottom: 10, lineHeight: 18 }}>{grant.desc}</Text>
                  <GameButton
                    label={`Apply — ${grant.label}`}
                    onPress={() => applySassa(grant.id)}
                    variant="secondary"
                  />
                </View>
              ))}
              <InfoPanel title="Current Grant Status">
                <Text style={{ color: '#888', fontSize: 13 }}>Day {day} — Check monthly for payment deposits.</Text>
              </InfoPanel>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: '#0D0A00', borderWidth: 1, borderColor: '#1E1E1E', padding: 14, borderRadius: 4 }}>
      <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 1 }}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}
