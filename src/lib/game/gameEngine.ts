import type { GameState, GameEvent, InventoryItem, PlayerStats, CropPlot, Industry, FarmLaborer, CrimeType, OrchardPlot } from '@/types/game';
import { AVAILABLE_JOBS, CROP_DEFINITIONS, LIVESTOCK_DEFINITIONS, JOB_CHAINS, getCurrentSalary, getJobChain, VEHICLE_DEFINITIONS, CRIME_DEFINITIONS, NPC_NAME_POOL, NPC_ROLE_POOL, CRIME_FREQUENCY, DRUG_EFFECTS, ALCOHOL_EFFECTS, ORCHARD_DEFINITIONS } from './gameData';
import { selectEventFromLibrary } from './eventLibrary';

// ─── Stat Clamp ────────────────────────────────────────────────────────────────
export function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

type NumericStatKey = Exclude<keyof PlayerStats, 'sickness' | 'addictions'>;

export function updateStat(stats: PlayerStats, key: NumericStatKey, delta: number): PlayerStats {
  return { ...stats, [key]: clamp((stats[key] as number) + delta) };
}

// ─── Daily Tick ────────────────────────────────────────────────────────────────
export function applyDailyTick(state: GameState): GameState {
  let s = { ...state };
  let stats = { ...s.stats };

  // Natural daily decay
  stats.hunger = clamp(stats.hunger - 18);
  stats.energy = clamp(stats.energy - 8);
  stats.hygiene = clamp(stats.hygiene - 10);
  stats.stress = clamp(stats.stress + 3);

  // Lingering drug effects
  if ((stats.drugEffectDaysLeft ?? 0) > 0) {
    stats.fitness = clamp(stats.fitness - 1);
    stats.discipline = clamp(stats.discipline - 1);
    stats.health = clamp(stats.health - 1);
    stats.drugEffectDaysLeft = Math.max(0, (stats.drugEffectDaysLeft ?? 0) - 1);
  }

  // Consequences of low stats
  if (stats.hunger < 20) {
    stats.health = clamp(stats.health - 8);
    stats.energy = clamp(stats.energy - 10);
    stats.happiness = clamp(stats.happiness - 5);
  }
  if (stats.hygiene < 20) {
    stats.reputation = clamp(stats.reputation - 3);
    stats.happiness = clamp(stats.happiness - 3);
  }
  if (stats.stress > 80) {
    stats.health = clamp(stats.health - 5);
    stats.happiness = clamp(stats.happiness - 5);
  }
  if (stats.energy < 20) {
    stats.happiness = clamp(stats.happiness - 3);
    stats.stress = clamp(stats.stress + 5);
  }

  // Property comfort bonus
  const currentProp = s.properties.find(p => p.id === s.currentPropertyId);
  if (currentProp) {
    stats.happiness = clamp(stats.happiness + Math.floor(currentProp.comfortBonus / 20));
    stats.stress = clamp(stats.stress - Math.floor(currentProp.comfortBonus / 25));
  }

  // --- New Systems Overhaul ---
  if (stats.sickness === 'Cold') { stats.health -= 5; }
  else if (stats.sickness === 'Flu') { stats.health -= 15; stats.energy -= 10; }
  else if (stats.sickness === 'Food Poisoning') { stats.health -= 20; stats.hunger -= 20; stats.energy -= 20; }
  
  if (stats.addictions && stats.addictions.length > 0) { 
    stats.stress += 5 * stats.addictions.length; 
  }
  
  stats.health = clamp(stats.health);
  stats.energy = clamp(stats.energy);
  stats.hunger = clamp(stats.hunger);
  stats.stress = clamp(stats.stress);
  
  const weathers = ['Sunny', 'Sunny', 'Sunny', 'Rain', 'Heatwave', 'Storm'];
  const newWeather = weathers[Math.floor(Math.random() * weathers.length)] as any;

  const newPerks = [...(s.perks || [])];
  if (stats.intelligence >= 60 && !newPerks.includes('Smart')) newPerks.push('Smart');
  if (stats.fitness >= 70 && !newPerks.includes('Athletic')) newPerks.push('Athletic');
  if (stats.reputation >= 80 && !newPerks.includes('Connected')) newPerks.push('Connected');
  // --- End New Systems ---

  // Auto-consume
  if (s.autoConsume.enabled && stats.hunger < s.autoConsume.hungerThreshold) {
    const result = autoConsumeFood(s, stats);
    s = result.state;
    stats = result.stats;
  }

  const todayFinance = s.financeHistory.filter(f => f.day === s.day);
  const income = todayFinance.filter(f => f.amount > 0).reduce((sum, f) => sum + f.amount, 0);
  const expenses = todayFinance.filter(f => f.amount < 0).reduce((sum, f) => sum + Math.abs(f.amount), 0);
  const eventsStr = s.eventHistory.filter(e => e.includes(`Day ${s.day}:`));
  
  const lastDaySummary = {
    day: s.day,
    income,
    expenses,
    statsChanges: {},
    events: eventsStr,
    highlights: s.actionsUsedToday.map(a => a.replace(/_/g, ' ')),
  };

  // Advance day, reset actions
  s = {
    ...s,
    stats,
    day: s.day + 1,
    age: s.age + (s.day % 365 === 0 ? 1 : 0),
    actionsUsedToday: [],
    dayPhase: 'morning',
    weather: newWeather,
    perks: newPerks,
    crimeState: {
      ...s.crimeState,
      wantedLevel: Math.max(0, (s.crimeState.wantedLevel || 0) - 2),
    },
    daysUntilNextNpcEncounter: Math.max(0, (s.daysUntilNextNpcEncounter ?? 0) - 1),
    lastDaySummary,
    showDaySummary: true,
    ...(s.prison.imprisoned && {
      prison: {
        ...s.prison,
        daysServed: s.prison.daysServed + 1,
      }
    }),
  };

  // Monthly rent payment
  if (s.day % 30 === 0) {
    s = applyMonthlyExpenses(s);
  }

  // Loan processing
  if (s.bank.loans && s.bank.loans.length > 0) {
    let newLoans = [];
    let cash = s.cash;
    let newFinanceHistory = [...s.financeHistory];
    for (const loan of s.bank.loans) {
      const dailyInterestAmt = loan.remaining * loan.dailyInterest;
      let remaining = loan.remaining + dailyInterestAmt;
      const dailyPayment = Math.min(remaining, Math.ceil(loan.amount * 0.02)); // ~2% daily payment
      
      if (cash >= dailyPayment) {
        cash -= dailyPayment;
        remaining -= dailyPayment;
        newFinanceHistory.push({ day: s.day, description: 'Loan Repayment', amount: -dailyPayment, category: 'bank' });
      } else {
        loan.paymentsMissed = (loan.paymentsMissed || 0) + 1;
        s.bank.creditScore = Math.max(300, (s.bank.creditScore || 500) - 10);
        stats.stress = clamp(stats.stress + 5);
      }
      
      if (remaining > 0) {
        newLoans.push({ ...loan, remaining });
      } else {
        s.bank.creditScore = Math.min(850, (s.bank.creditScore || 500) + 20);
      }
    }
    s.cash = cash;
    s.bank.loans = newLoans;
    s.financeHistory = newFinanceHistory;
    s.stats = stats;
  }

  // Bank interest
  if (s.day - s.bank.lastInterestDay >= 30) {
    const noticeInterest = s.bank.noticeBalance > 0 ? s.bank.noticeBalance * s.bank.interestRate : 0;
    // Savings account (currentBalance) earns a lower 2.5% monthly rate
    const savingsInterest = s.bank.currentBalance > 0 ? s.bank.currentBalance * 0.025 : 0;
    const totalInterest = noticeInterest + savingsInterest;
    if (totalInterest > 0) {
      s = {
        ...s,
        bank: {
          ...s.bank,
          noticeBalance: s.bank.noticeBalance + noticeInterest,
          currentBalance: s.bank.currentBalance + savingsInterest,
          lastInterestDay: s.day,
        },
        financeHistory: [...s.financeHistory, {
          day: s.day,
          description: `Bank interest earned (savings + notice)`,
          amount: Math.round(totalInterest * 100) / 100,
          category: 'bank',
        }],
      };
    } else {
      s = { ...s, bank: { ...s.bank, lastInterestDay: s.day } };
    }
  }

  // Education progress
  if (s.currentCourse) {
    const course = { ...s.currentCourse };
    course.daysCompleted += 1;

    // Pay daily fee
    if (s.cash >= course.dailyFee) {
      s = {
        ...s,
        cash: s.cash - course.dailyFee,
        financeHistory: [...s.financeHistory, {
          day: s.day,
          description: `Education fee: ${course.courseName}`,
          amount: -course.dailyFee,
          category: 'education',
        }],
      };
    }

    if (course.daysCompleted >= course.totalDays &&
        course.studyPointsEarned >= course.studyPointsRequired) {
      // Completed
      s = {
        ...s,
        qualifications: [...s.qualifications, course.qualification],
        completedCourses: [...s.completedCourses, course.courseId],
        currentCourse: null,
        pendingEvents: [...s.pendingEvents, {
          id: `grad_${s.day}`,
          title: '🎓 Congratulations!',
          description: `You have successfully completed your ${course.courseName}. Your qualification has been awarded: ${course.qualification}.`,
          type: 'education',
          choices: [{ label: 'Celebrate!', outcome: 'You feel proud of your achievement.', effect: { statsChange: { happiness: 20, stress: -15 } } }],
          day: s.day,
        }],
      };
    } else {
      s = { ...s, currentCourse: course };
    }
  }

  // Formal employment: pay salary on cycle, increment industry exp & days-at-rank
  if (s.formalEmployment) {
    s = processFormalEmployment(s);
  }

  // Advance farm crops
  s = advanceFarmCrops(s);
  s = advanceOrchardPlots(s);
  // Emit pest/disease alerts for newly triggered crop events (info-only)
  for (const plot of s.cropPlots) {
    if (plot.hasFarmEvent && plot.farmEventType) {
      const alreadyAlerted = s.pendingEvents.some(e => e.id === `farm_alert_${plot.id}_${s.day}`);
      if (!alreadyAlerted) {
        s = generatePestAlert(s, plot.id, plot.farmEventType as 'pest_infestation' | 'disease');
      }
    }
  }
  // Process livestock: breeding + daily produce
  s = processLivestockBreeding(s);
  s = processLivestockDailyProduce(s);
  // Business income (increments industry exp)
  s = processBusinessIncome(s);

  // Partner auto-cooks: if player has a partner NPC, hunger doesn't drain
  const hasPartner = s.npcs.some(n => n.romanticStage === 'partner');
  if (hasPartner) {
    // Partner cooks a meal — hunger is kept at a comfortable level
    const partnerCookedHunger = Math.max(s.stats.hunger, 65);
    s = { ...s, stats: { ...s.stats, hunger: partnerCookedHunger } };
  }

  // Build day summary before generating events
  const prevStats = state.stats;
  const dayIncome = s.financeHistory
    .filter(f => f.day === s.day && f.amount > 0)
    .reduce((acc, f) => acc + f.amount, 0);
  const dayExpenses = s.financeHistory
    .filter(f => f.day === s.day && f.amount < 0)
    .reduce((acc, f) => acc + f.amount, 0);

  s = {
    ...s,
    lastDaySummary: {
      day: state.day,
      income: dayIncome,
      expenses: Math.abs(dayExpenses),
      statsChanges: {
        hunger: s.stats.hunger - prevStats.hunger,
        health: s.stats.health - prevStats.health,
        energy: s.stats.energy - prevStats.energy,
        happiness: s.stats.happiness - prevStats.happiness,
      },
      events: [],
      highlights: [
        ...(dayIncome > 0 ? [`Earned ${formatMoney(dayIncome)}`] : []),
        ...(Math.abs(dayExpenses) > 0 ? [`Spent ${formatMoney(Math.abs(dayExpenses))}`] : []),
        ...(hasPartner ? ['Your partner cooked for you 🍽️'] : []),
      ],
    },
    showDaySummary: true,
  };

  // Generate context-aware events
  s = generateDailyEvents(s);

  return s;
}

function autoConsumeFood(state: GameState, stats: PlayerStats): { state: GameState; stats: PlayerStats } {
  const meals = state.inventory.filter(i => i.category === 'cooked_meal' && i.quantity > 0);
  const foods = state.inventory.filter(i => i.category === 'food' && i.quantity > 0 && i.hungerRestore);

  const bestItem = [...meals, ...foods].sort((a, b) => (b.hungerRestore ?? 0) - (a.hungerRestore ?? 0))[0];
  if (!bestItem) return { state, stats };

  const newInventory = state.inventory.map(i => {
    if (i.id === bestItem.id) return { ...i, quantity: i.quantity - 1 };
    return i;
  }).filter(i => i.quantity > 0);

  return {
    state: { ...state, inventory: newInventory },
    stats: { ...stats, hunger: clamp(stats.hunger + (bestItem.hungerRestore ?? 0)) },
  };
}

function applyMonthlyExpenses(state: GameState): GameState {
  let s = { ...state };
  let totalRent = 0;

  for (const prop of s.properties) {
    if (!prop.owned) {
      totalRent += prop.monthlyPayment;
    }
  }

  if (totalRent > 0) {
    if (s.cash >= totalRent) {
      s = {
        ...s,
        cash: s.cash - totalRent,
        financeHistory: [...s.financeHistory, {
          day: s.day,
          description: 'Monthly rent payment',
          amount: -totalRent,
          category: 'rent',
        }],
      };
    } else {
      // Can't pay rent — stress + event
      s = {
        ...s,
        stats: { ...s.stats, stress: clamp(s.stats.stress + 20), happiness: clamp(s.stats.happiness - 15) },
        pendingEvents: [...s.pendingEvents, {
          id: `rent_overdue_${s.day}`,
          title: '⚠️ Rent Overdue',
          description: `You don\'t have enough cash to pay your rent of R${totalRent}. Your landlord is getting impatient.`,
          type: 'property',
          choices: [
            { label: 'Apologise and promise to pay', outcome: 'Landlord gives you 7 more days.', effect: { statsChange: { stress: 10 } } },
            { label: 'Move out', outcome: 'You lose your home but avoid more debt.', effect: { statsChange: { happiness: -20, stress: 15 } } },
          ],
          day: s.day,
        }],
      };
    }
  }

  return s;
}


// ─── Formal Employment: Salary Pay-Cycle + Promotion ─────────────────────────
function processFormalEmployment(state: GameState): GameState {
  if (!state.formalEmployment) return state;
  const chain = getJobChain(state.formalEmployment.chainId);
  if (!chain) return state;

  let s = { ...state };
  const emp = { ...s.formalEmployment! };

  // Increment days at rank and industry experience each day
  emp.daysAtRank += 1;
  const indExp = { ...s.industryExperience };
  indExp[chain.industry] = (indExp[chain.industry] ?? 0) + 1;
  s = { ...s, industryExperience: indExp };

  // Determine if salary should be paid today
  const payCycleDays = chain.payCycle === 'weekly' ? 7 : chain.payCycle === 'biweekly' ? 14 : 30;
  const daysSinceLastPay = s.day - emp.lastPaidDay;
  if (daysSinceLastPay >= payCycleDays) {
    const salary = getCurrentSalary(emp);
    emp.lastPaidDay = s.day;
    const rankTitle = chain.ranks[emp.rankIndex]?.title ?? 'Salary';
    s = {
      ...s,
      cash: s.cash + salary,
      financeHistory: [...s.financeHistory, {
        day: s.day,
        description: `${rankTitle} salary (${chain.payCycle})`,
        amount: salary,
        category: 'work',
      }],
    };
  }

  // Check for promotion
  const nextRankIdx = emp.rankIndex + 1;
  if (nextRankIdx < chain.ranks.length) {
    const nextRank = chain.ranks[nextRankIdx];
    const currentIndExp = s.industryExperience[chain.industry] ?? 0;
    if (emp.daysAtRank >= nextRank.daysRequiredAtPreviousRank &&
        currentIndExp >= nextRank.industryExpRequired) {
      emp.rankIndex = nextRankIdx;
      emp.daysAtRank = 0;
      s = {
        ...s,
        pendingEvents: [...s.pendingEvents, {
          id: `promotion_${s.day}`,
          title: '🏅 Promotion!',
          description: `Congratulations! You have been promoted to ${nextRank.title}. Your new salary is R${nextRank.monthlySalary.toLocaleString()} per month.`,
          type: 'employment',
          choices: [{ label: 'Accept with pride', outcome: 'You move up the ranks.', effect: { statsChange: { happiness: 25, stress: -10, reputation: 10 } } }],
          day: s.day,
        }],
      };
    }
  }

  s = { ...s, formalEmployment: emp };
  return s;
}

// ─── Livestock Daily Produce (Eggs & Milk) ────────────────────────────────────
function processLivestockDailyProduce(state: GameState): GameState {
  if (state.livestock.length === 0) return state;

  const newItems: InventoryItem[] = [];

  const updatedLivestock = state.livestock.map(group => {
    const def = LIVESTOCK_DEFINITIONS[group.type as keyof typeof LIVESTOCK_DEFINITIONS];
    if (!def) return group;

    const hasFeedBoost = group.dailyProduceBoostDays > 0;

    // Aging: all animals age 1 day
    const newAverageAge = (group.averageAge ?? 0) + 1;

    // Random sickness / injury events (low daily probability, compounds with age)
    const totalAnimals = group.males + group.females;
    const ageRiskFactor = newAverageAge > 1095 ? 0.003 : 0.001; // older animals get sick more
    const newSickCount = Math.min(
      group.sickCount + (Math.random() < ageRiskFactor * totalAnimals ? 1 : 0),
      totalAnimals
    );
    const newInjuredCount = Math.min(
      group.injuredCount + (Math.random() < 0.0005 * totalAnimals ? 1 : 0),
      totalAnimals - newSickCount
    );

    // Healthy animals = total minus sick/injured
    const healthyFemales = Math.max(0, group.females - Math.ceil((newSickCount + newInjuredCount) * group.females / Math.max(totalAnimals, 1)));

    if (group.type === 'Chicken') {
      if (healthyFemales <= 0) return { ...group, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0 };

      // Each female lays 3–7 eggs/day
      const eggDef = def.eggsPerDay as { min: number; max: number };
      let totalEggs = 0;
      for (let i = 0; i < healthyFemales; i++) {
        const base = eggDef.min + Math.floor(Math.random() * (eggDef.max - eggDef.min + 1));
        totalEggs += hasFeedBoost ? Math.ceil(base * 1.4) : base;
      }

      // Only 5% of total eggs hatch into chicks
      const chicksHatched = Math.floor(totalEggs * def.hatchChance);

      if (totalEggs > 0) {
        newItems.push({ id: 'farm_eggs', name: 'Eggs (Farm)', category: 'livestock_product', quantity: totalEggs, unit: 'egg', hungerRestore: 8 });
      }

      return {
        ...group,
        females: group.females + Math.floor(chicksHatched / 2),
        males: group.males + Math.ceil(chicksHatched / 2),
        dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0,
        averageAge: newAverageAge,
        sickCount: newSickCount,
        injuredCount: newInjuredCount,
      };

    } else if (group.type === 'Goat' || group.type === 'Cattle') {
      const pregnantCount = group.pregnantFemales ?? 0;
      if (pregnantCount > 0) {
        const milkDef = def.milkLPerDay as { min: number; max: number };
        let totalMilk = 0;
        for (let i = 0; i < pregnantCount; i++) {
          const l = milkDef.min + Math.random() * (milkDef.max - milkDef.min);
          totalMilk += hasFeedBoost ? l * 1.3 : l;
        }
        totalMilk = Math.round(totalMilk * 10) / 10;
        newItems.push({ id: group.type === 'Goat' ? 'farm_goat_milk' : 'farm_cow_milk', name: group.type === 'Goat' ? 'Goat Milk (Farm)' : 'Cow Milk (Farm)', category: 'livestock_product', quantity: totalMilk, unit: 'L', hungerRestore: 25 });

        const daysLeft = (group.pregnancyDaysLeft ?? 0) - 1;
        if (daysLeft <= 0) {
          // Birth: goats have 15% twin chance; cattle always single
          let newFemales = group.females;
          let newMales = group.males;
          for (let i = 0; i < pregnantCount; i++) {
            const twinBirth = def.twinChance > 0 && Math.random() < def.twinChance;
            const offspring = twinBirth ? 2 : 1;
            newFemales += Math.floor(offspring / 2);
            newMales += Math.ceil(offspring / 2);
          }
          return { ...group, pregnantFemales: 0, pregnancyDaysLeft: 0, females: newFemales, males: newMales, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };
        }
        return { ...group, pregnancyDaysLeft: daysLeft, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };
      }
      return { ...group, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };

    } else if (group.type === 'Pig') {
      const pregnantCount = group.pregnantFemales ?? 0;
      if (pregnantCount > 0) {
        const daysLeft = (group.pregnancyDaysLeft ?? 0) - 1;
        if (daysLeft <= 0) {
          // Pigs have 3–12 piglets per pregnant female
          let newFemales = group.females;
          let newMales = group.males;
          for (let i = 0; i < pregnantCount; i++) {
            const litter = def.litterMin + Math.floor(Math.random() * (def.litterMax - def.litterMin + 1));
            newFemales += Math.floor(litter / 2);
            newMales += Math.ceil(litter / 2);
          }
          return { ...group, pregnantFemales: 0, pregnancyDaysLeft: 0, females: newFemales, males: newMales, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };
        }
        return { ...group, pregnancyDaysLeft: daysLeft, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };
      }
      return { ...group, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };

    } else {
      return { ...group, dailyProduceBoostDays: hasFeedBoost ? group.dailyProduceBoostDays - 1 : 0, averageAge: newAverageAge, sickCount: newSickCount, injuredCount: newInjuredCount };
    }
  });

  if (newItems.length === 0) return { ...state, livestock: updatedLivestock };

  let inv = [...state.inventory];
  for (const newItem of newItems) {
    const existing = inv.find(i => i.id === newItem.id);
    if (existing) {
      inv = inv.map(i => i.id === newItem.id ? { ...i, quantity: Math.round((i.quantity + newItem.quantity) * 10) / 10 } : i);
    } else {
      inv.push(newItem);
    }
  }

  return { ...state, inventory: inv, livestock: updatedLivestock };
}

// ─── Season Helpers ────────────────────────────────────────────────────────────
// SA seasons: Spring Sep-Nov (days ~245-335), Summer Dec-Feb (1-60, 336-365),
// Autumn Mar-May (61-151), Winter Jun-Aug (152-243)
export function getSASeason(day: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' {
  const d = ((day - 1) % 365) + 1;
  if (d >= 335 || d <= 60) return 'Summer';
  if (d >= 245) return 'Spring';
  if (d >= 152) return 'Winter';
  return 'Autumn';
}

// Rain probability: Summer=high, Spring=medium, Autumn=low, Winter=scarce
export function getRainChance(season: string): number {
  switch (season) {
    case 'Summer': return 0.55;
    case 'Spring': return 0.35;
    case 'Autumn': return 0.20;
    case 'Winter': return 0.08;
    default: return 0.25;
  }
}

// Weeding interval in days by season
function getWeedingInterval(season: string): { min: number; max: number } {
  return season === 'Winter' ? { min: 18, max: 27 } : { min: 14, max: 21 };
}

function processBusinessIncome(state: GameState): GameState {
  if (state.businesses.length === 0) return state;

  let s = { ...state };
  let totalIncome = 0;
  const indExp = { ...s.industryExperience };

  // Vehicle counts for transport businesses
  const taxiCount = s.vehicles.filter(v => v.type === 'Minibus Taxi' && v.condition > 20).length;
  const truckCount = s.vehicles.filter(v => (v.type === 'Truck' || v.type === 'Light Delivery Van') && v.condition > 20).length;

  // Inventory stock checks
  const hasDrugStock = s.inventory.some(i => i.category === 'drug' && i.quantity > 0);
  const hasCannabisStock = s.inventory.some(i => i.id === 'harvest_cannabis' || (i.category === 'drug' && i.id === 'cannabis') && i.quantity > 0);
  const hasAlcoholStock = s.inventory.some(i => i.category === 'alcohol' && i.quantity > 0);
  const hasMeatStock = s.inventory.some(i => i.category === 'meat' && i.quantity > 0);
  const hasMilkStock = s.inventory.some(i => i.id === 'farm_milk' || i.id === 'livestock_milk' && i.quantity > 0);

  const updatedBusinesses = s.businesses.map(biz => {
    const repFactor = 0.5 + (biz.reputation / 200);
    let income = Math.floor(biz.dailyIncome * repFactor);

    // Apply temporary boost if active
    if (biz.incomeBoostPct && biz.incomeBoostUntilDay && s.day <= biz.incomeBoostUntilDay) {
      income = Math.floor(income * (1 + biz.incomeBoostPct / 100));
    }

    // Stock-gated income — no stock = no income
    if (biz.type === 'Drug Business' && !hasDrugStock) { income = 0; }
    if (biz.type === 'Cannabis Business' && !hasCannabisStock) { income = 0; }
    if (biz.type === 'Shebeen' && !hasAlcoholStock) { income = 0; }
    if (biz.type === 'Butchery' && !hasMeatStock) { income = 0; }
    if (biz.type === 'Dairy' && !hasMilkStock) { income = 0; }
    if (biz.type === 'Taxi Business' && taxiCount === 0) { income = 0; }
    if (biz.type === 'Logistics Company' && truckCount === 0) { income = 0; }

    // Taxi scales with fleet
    if (biz.type === 'Taxi Business' && taxiCount > 0) {
      income = Math.floor(taxiCount * 450 * repFactor);
    }
    // Logistics scales with fleet
    if (biz.type === 'Logistics Company' && truckCount > 0) {
      const perTruck = s.vehicles.filter(v => v.type === 'Truck' && v.condition > 20).length * 600;
      const perVan = s.vehicles.filter(v => v.type === 'Light Delivery Van' && v.condition > 20).length * 200;
      income = Math.floor((perTruck + perVan) * repFactor);
    }

    totalIncome += income;
    indExp[biz.industry] = (indExp[biz.industry] ?? 0) + 2;
    return biz;
  });

  if (totalIncome === 0) return { ...s, businesses: updatedBusinesses, industryExperience: indExp };

  s = {
    ...s,
    cash: s.cash + totalIncome,
    businesses: updatedBusinesses,
    industryExperience: indExp,
    financeHistory: [...s.financeHistory, {
      day: s.day,
      description: 'Business income',
      amount: totalIncome,
      category: 'business',
    }],
  };

  return s;
}

function advanceFarmCrops(state: GameState): GameState {
  const season = getSASeason(state.day);
  const hasLabor = (state.farmLaborers ?? []).length > 0;
  const weedInterval = getWeedingInterval(season);
  const weedThreshold = weedInterval.min + Math.floor(Math.random() * (weedInterval.max - weedInterval.min + 1));

  // Rain chance reduces water need
  const raining = Math.random() < getRainChance(season);

  // Check if laborers have tools (garden hoe in inventory)
  const hasHoe = state.inventory.some(i => i.id === 'hoe' && i.quantity > 0);
  const laborCanWeed = hasLabor && hasHoe;

  // Pest/disease: occurs once every 3 crop cycles
  const cropCycles = state.cropCyclesCompleted ?? 0;

  // Pay farm laborers their daily wage (R100/laborer/day)
  const laborers = state.farmLaborers ?? [];
  const dailyLaborCost = laborers.reduce((sum, l) => sum + l.dailyWage, 0);
  let s = state;
  if (dailyLaborCost > 0) {
    s = {
      ...s,
      cash: Math.max(0, s.cash - dailyLaborCost),
      financeHistory: [...s.financeHistory, {
        day: s.day,
        description: `Farm labor wages (${laborers.length} worker${laborers.length !== 1 ? 's' : ''})`,
        amount: -dailyLaborCost,
        category: 'farm',
      }],
    };
  }

  let newCyclesCompleted = cropCycles;

  const updatedPlots = s.cropPlots.map(plot => {
    if (plot.stage === 'harvested' || plot.stage === 'ready') return plot;

    const newDays = plot.daysPlanted + 1;
    let stage: CropPlot['stage'] = plot.stage;
    if (newDays >= Math.floor(plot.daysToHarvest * 0.3) && stage === 'seedling') stage = 'growing';
    if (newDays >= plot.daysToHarvest) {
      stage = 'ready';
      newCyclesCompleted += 1;
    }

    // Weeding check — needed after interval days since last weed
    const daysSinceWeed = s.day - (plot.lastWeededDay ?? 0);
    let needsWeeding = plot.needsWeeding ?? false;
    if (daysSinceWeed >= weedThreshold && stage !== 'ready') {
      needsWeeding = true;
    }

    // Labor auto-weeds if they have tools
    let lastWeededDay = plot.lastWeededDay ?? 0;
    if (needsWeeding && laborCanWeed) {
      needsWeeding = false;
      lastWeededDay = s.day;
    }

    // Pest/disease event: generates an alert (info-only), not a choice event
    let hasFarmEvent = plot.hasFarmEvent ?? false;
    let farmEventType = plot.farmEventType ?? null;
    if (!hasFarmEvent && newCyclesCompleted > 0 && newCyclesCompleted % 3 === 0 && stage === 'growing') {
      if (Math.random() < 0.3) {
        hasFarmEvent = true;
        farmEventType = Math.random() < 0.5 ? 'pest_infestation' : 'disease';
        // Alert added to pendingEvents as info-only (no choices required)
      }
    }
    // Labor handles events automatically if they have sprayer + pesticide
    const hasSprayer = s.inventory.some(i => i.id === 'sprayer' && i.quantity > 0);
    const hasPesticide = s.inventory.some(i => (i.id === 'pesticide_bottle' || i.id === 'herbicide_bottle') && i.quantity > 0);
    if (hasFarmEvent && hasLabor && hasSprayer && hasPesticide) {
      hasFarmEvent = false;
      farmEventType = null;
    }

    // Labor handles irrigation if irrigation equipment present
    const hasIrrigation = s.inventory.some(i => i.id === 'irrigation_pipe' && i.quantity > 0);
    const needsWater = raining ? false : (!hasLabor || !hasIrrigation);

    // Yield penalty for neglect (no weeding, active event)
    let yieldBoostPct = plot.yieldBoostPct ?? 0;
    if (needsWeeding && !laborCanWeed) yieldBoostPct = Math.max(-50, yieldBoostPct - 2);
    if (hasFarmEvent) yieldBoostPct = Math.max(-70, yieldBoostPct - 5);
    if (plot.fertilizerApplied) yieldBoostPct = Math.min(50, yieldBoostPct + 1);

    return {
      ...plot,
      daysPlanted: newDays,
      stage,
      needsWeeding,
      lastWeededDay,
      hasFarmEvent,
      farmEventType,
      needsWater,
      yieldBoostPct,
    };
  });

  return {
    ...s,
    cropPlots: updatedPlots,
    cropCyclesCompleted: newCyclesCompleted,
  };
}

function processLivestockBreeding(state: GameState): GameState {
  // Breeding requires minimum 3 animals: 1 male + 2 females
  // Chickens breed via egg hatching in processLivestockDailyProduce
  return state;
}

// ─── Artificial Insemination (replaces auto-breeding for Goat/Cattle/Pig) ────
export function performArtificialInsemination(state: GameState, livestockType: string): GameState {
  const AI_COST = 3000;
  if (state.cash < AI_COST) return state;

  const group = state.livestock.find(g => g.type === livestockType);
  if (!group) return state;
  if (group.type !== 'Goat' && group.type !== 'Cattle' && group.type !== 'Pig') return state;

  // Require at least 1 male + 2 females for breeding
  if (group.males < 1 || group.females < 2) return state;
  if ((group.pregnantFemales ?? 0) > 0) return state;

  const def = LIVESTOCK_DEFINITIONS[livestockType as keyof typeof LIVESTOCK_DEFINITIONS];
  const birthDay = def?.breedDays ?? 150;

  const updatedLivestock = state.livestock.map(g =>
    g.type === livestockType
      ? { ...g, pregnantFemales: g.females, pregnancyDaysLeft: birthDay }
      : g
  );

  return {
    ...state,
    cash: state.cash - AI_COST,
    livestock: updatedLivestock,
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: `Artificial Insemination — ${livestockType}`,
      amount: -AI_COST,
      category: 'farm' as const,
    }],
  };
}

// ─── Context-Aware Event Generation ───────────────────────────────────────────
export function generateDailyEvents(state: GameState): GameState {
  // Cap concurrent pending events so the player is never buried under a stack
  if (state.pendingEvents.length >= 3) return state;

  // Daily chance that *something* happens today (replaces the old weekly/3% gate
  // so the world feels alive instead of nearly static). Tune this constant to
  // adjust overall event frequency.
  const EVENT_CHANCE_PER_DAY = 0.4;
  if (Math.random() > EVENT_CHANCE_PER_DAY) return state;

  const hasBusiness = state.businesses.length > 0;
  const hasFarm = state.cropPlots.length > 0 || state.livestock.length > 0;
  const hasVehicle = state.vehicles.length > 0;
  const hasJob = state.currentJob !== null || state.formalEmployment !== null;
  const inTownship = ['Township', 'Informal Settlement'].includes(state.location);

  const possible: GameEvent[] = [];

  // Enemy Check
  const enemies = state.npcs.filter(n => n.isEnemy || n.trust < 0 || n.conflict > 50);
  if (enemies.length > 0 && Math.random() < 0.15) { // 15% chance per week to get attacked by enemy
    const enemy = enemies[0];
    possible.push({
      id: `enemy_sabotage_${state.day}`,
      title: `⚠️ ${enemy.name} is seeking revenge!`,
      description: `${enemy.name} has tracked you down and wants to settle the score. They brought friends.`,
      type: 'social',
      day: state.day,
      choices: [
        { label: 'Fight them (Needs high fitness)', outcome: 'You fought them off but took damage.', effect: { statsChange: { health: -15, stress: 10, fitness: 2 } } },
        { label: 'Pay them off (R500)', outcome: 'You paid them off... for now.', effect: { cashChange: -500, statsChange: { stress: -5 } } },
        { label: 'Run away (High risk)', outcome: 'You managed to escape, but dropped some cash.', effect: { cashChange: -150, statsChange: { stress: 20 } } },
      ],
    });
  }

  // Business negative event (robbery, supplier issue)
  if (hasBusiness) {
    const roll = Math.random();
    if (roll < 0.4) {
      possible.push({
        id: `biz_robbery_${state.day}`,
        title: '🚨 Business Robbed',
        description: 'Your business was broken into overnight. Stock and cash were taken. You can choose to retaliate or let it go.',
        type: 'business',
        choices: [
          { label: 'Report to police', outcome: 'Police are investigating. Slow process.', effect: { cashChange: -500, statsChange: { stress: 15, reputation: 5 } } },
          { label: 'Retaliate with violence', outcome: 'You track down the thieves. This may trigger more conflict.', effect: { cashChange: -200, statsChange: { reputation: -10, stress: 20, health: -10 }, imprisoned: Math.random() < 0.2 } },
          { label: 'Write it off', outcome: 'You absorb the loss and move on.', effect: { cashChange: -800, statsChange: { stress: 10 } } },
        ],
        day: state.day,
      });
    } else {
      possible.push({
        id: `biz_supplier_${state.day}`,
        title: '📦 Supplier Problem',
        description: 'A key supplier has raised prices by 15%. Your margins are under pressure.',
        type: 'business',
        choices: [
          { label: 'Negotiate down', outcome: 'You secure a better deal.', effect: { statsChange: { stress: 5, reputation: 3 } } },
          { label: 'Find new supplier', outcome: 'Takes time but saves money.', effect: { cashChange: -300, statsChange: { stress: 8 } } },
        ],
        day: state.day,
      });
    }
  }

  // Farm negative event
  if (hasFarm) {
    possible.push({
      id: `farm_drought_${state.day}`,
      title: '☀️ Dry Spell',
      description: 'A week without rain is stressing your crops. Water levels are low. Check your plots.',
      type: 'farming',
      choices: [
        { label: 'Hand-water the crops', outcome: 'You spend a day watering manually.', effect: { statsChange: { energy: -20, stress: 10 } } },
        { label: 'Leave it — hope for rain', outcome: 'Yield may drop if drought continues.', effect: { statsChange: { stress: 5 } } },
      ],
      day: state.day,
    });
  }

  // Vehicle breakdown
  if (hasVehicle) {
    possible.push({
      id: `vehicle_breakdown_${state.day}`,
      title: '🔧 Vehicle Breakdown',
      description: 'Your vehicle broke down on the road. You need to get it repaired to keep using it.',
      type: 'vehicle',
      choices: [
        { label: 'Repair immediately (R600)', outcome: 'Back on the road.', effect: { cashChange: -600, statsChange: { stress: -5 } } },
        { label: 'Park it for now', outcome: 'No vehicle until you can afford repairs.', effect: { statsChange: { stress: 15 } } },
      ],
      day: state.day,
    });
  }

  // Health crisis
  if (state.stats.health < 40) {
    possible.push({
      id: `health_crisis_${state.day}`,
      title: '🏥 Health Emergency',
      description: 'You collapsed at home. A neighbour rushed you to the clinic. You need treatment urgently.',
      type: 'health',
      choices: [
        { label: 'Accept treatment (R200)', outcome: 'You recover slowly but surely.', effect: { cashChange: -200, statsChange: { health: 25, stress: -10 } } },
        { label: 'Refuse — can\'t afford it', outcome: 'Your health worsens.', effect: { statsChange: { health: -15, stress: 15 } } },
      ],
      day: state.day,
    });
  }

  // Job-related negative event
  if (hasJob) {
    possible.push({
      id: `job_conflict_${state.day}`,
      title: '⚠️ Workplace Conflict',
      description: 'A colleague filed a complaint against you. HR wants to meet with you.',
      type: 'employment',
      choices: [
        { label: 'Cooperate with HR', outcome: 'The issue is resolved professionally.', effect: { statsChange: { stress: 15, reputation: -3 } } },
        { label: 'Confront the colleague', outcome: 'The conflict escalates.', effect: { statsChange: { stress: 25, happiness: -10, reputation: -8 } } },
      ],
      day: state.day,
    });
  }

  // Community violence / crime
  if (inTownship && state.stats.happiness < 40) {
    possible.push({
      id: `crime_victim_${state.day}`,
      title: '⚠️ Mugging Attempt',
      description: 'Someone tried to rob you on your way home. You had to make a split-second decision.',
      type: 'crime',
      choices: [
        { label: 'Hand over cash', outcome: 'You lose money but stay safe.', effect: { cashChange: -Math.floor(state.cash * 0.1), statsChange: { stress: 20, happiness: -10 } } },
        { label: 'Fight back', outcome: 'You resist. Violence has consequences.', effect: { statsChange: { health: -15, stress: 25, reputation: -5 }, injured: true } },
      ],
      day: state.day,
    });
  }

  // Pull a conditionally-eligible, weighted event from the expanded event
  // library (hundreds of category-specific variations — crime, business,
  // family, romance, farming, livestock, weather, and many more).
  const libraryPick = selectEventFromLibrary(state);

  // Prefer the library most of the time (it's far richer and context-aware),
  // but keep the original hardcoded pool alive as a fallback/supplement so
  // nothing that existed before is lost.
  let chosen: GameEvent | null = null;
  let chosenTemplateId: string | null = null;

  if (libraryPick && (possible.length === 0 || Math.random() < 0.7)) {
    chosen = libraryPick.event;
    chosenTemplateId = libraryPick.templateId;
  } else if (possible.length > 0) {
    chosen = possible[Math.floor(Math.random() * possible.length)];
  } else if (libraryPick) {
    chosen = libraryPick.event;
    chosenTemplateId = libraryPick.templateId;
  }

  if (!chosen) return state;

  const nextState: GameState = {
    ...state,
    pendingEvents: [...state.pendingEvents, chosen],
    eventCooldowns: chosenTemplateId
      ? { ...(state.eventCooldowns ?? {}), [chosenTemplateId]: state.day }
      : (state.eventCooldowns ?? {}),
  };

  return nextState;
}

// ─── Add pest/disease alert to cropPlots (info-only, no event window choice) ──
export function generatePestAlert(state: GameState, plotId: string, eventType: 'pest_infestation' | 'disease'): GameState {
  const hasLabor = (state.farmLaborers ?? []).length > 0;
  const msg = eventType === 'pest_infestation'
    ? `⚠️ Pest Infestation detected on a crop plot. ${hasLabor ? 'Your laborer will treat it if they have a sprayer.' : 'Use Sprayer + Pesticide to treat it manually before yield is damaged.'}`
    : `🦠 Crop Disease detected on a plot. ${hasLabor ? 'Your laborer will handle it if equipped.' : 'Use Sprayer + Herbicide to stop the spread.'}`;

  // Info-only: no choice required, just a notice
  const alert: GameEvent = {
    id: `farm_alert_${plotId}_${state.day}`,
    title: eventType === 'pest_infestation' ? '🐛 Pest Alert' : '🦠 Crop Disease Alert',
    description: msg,
    type: 'farming',
    choices: [{ label: 'OK, I\'ll handle it', outcome: '', effect: {} }],
    day: state.day,
  };

  return { ...state, pendingEvents: [...state.pendingEvents, alert] };
}

// ─── Action: Work ─────────────────────────────────────────────────────────────
// Formally employed: max 1 work action/day. Hustlers/informal: max 2.
export function getMaxWorkActionsPerDay(state: GameState): number {
  return state.formalEmployment ? 1 : 2;
}

export function getWorkActionsUsedToday(state: GameState): number {
  return state.actionsUsedToday.filter(a => a === 'work').length;
}

export function canWork(state: GameState): boolean {
  return getWorkActionsUsedToday(state) < getMaxWorkActionsPerDay(state);
}

export function performWork(state: GameState, jobId: string): GameState {
  const job = AVAILABLE_JOBS.find(j => j.id === jobId);
  if (!job) return state;

  // Verify qualifications
  const hasQuals = job.requiredQualifications.every(q => state.qualifications.includes(q));
  if (!hasQuals) return state;

  // Check energy
  if (state.stats.energy < 20) return state;

  // Enforce work frequency limit
  if (!canWork(state)) return state;

  const incomeMultiplier = 0.7 + (state.stats.reputation / 300) + (state.experience / 10000);
  const income = Math.floor(job.dailyIncome * Math.min(incomeMultiplier, 1.5));

  // Accumulate industry experience
  const industry = job.industry as Industry | undefined;
  const indExp = { ...state.industryExperience };
  if (industry) {
    indExp[industry] = (indExp[industry] ?? 0) + 3;
  }

  // Weather modifier for informal jobs
  let finalEnergyCost = job.energyCost;
  if (job.type === 'informal' || job.type === 'hustle') {
    if (state.weather === 'Heatwave') finalEnergyCost += 15;
    if (state.weather === 'Storm') finalEnergyCost += 20;
    if (state.weather === 'Rain') finalEnergyCost += 5;
  }

  return {
    ...state,
    cash: state.cash + income,
    experience: state.experience + 10,
    industryExperience: indExp,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy - finalEnergyCost),
      stress: clamp(state.stats.stress + job.stressGain),
      happiness: clamp(state.stats.happiness + 5),
      hunger: clamp(state.stats.hunger - 10),
    },
    actionsUsedToday: [...state.actionsUsedToday, 'work'],
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: `Work income: ${job.title}`,
      amount: income,
      category: 'work',
    }],
  };
}

// ─── Action: Exercise ─────────────────────────────────────────────────────────
export function performExercise(state: GameState, type: string): GameState {
  const fitnessGain      = type === 'Weightlifting' ? 8 : type === 'Running' ? 6 : 5;
  const disciplineGain   = type === 'Weightlifting' ? 4 : type === 'Running' ? 3 : 2;
  const enduranceGain    = type === 'Running' ? 6 : type === 'Cycling' ? 5 : 2;
  const energyCost       = type === 'Weightlifting' ? 35 : type === 'Running' ? 30 : 25;

  return {
    ...state,
    stats: {
      ...state.stats,
      fitness: clamp(state.stats.fitness + fitnessGain),
      discipline: clamp(state.stats.discipline + disciplineGain),
      endurance: clamp(state.stats.endurance + enduranceGain),
      health: clamp(state.stats.health + 3),
      energy: clamp(state.stats.energy - energyCost),
      stress: clamp(state.stats.stress - 8),
      happiness: clamp(state.stats.happiness + 6),
      hunger: clamp(state.stats.hunger - 15),
    },
    actionsUsedToday: [...state.actionsUsedToday, 'exercise'],
  };
}

// ─── Action: Study ────────────────────────────────────────────────────────────
export function performStudy(state: GameState): GameState {
  if (!state.currentCourse) return state;

  // Discipline boosts study effectiveness
  const disciplineBonus = Math.floor(state.stats.discipline / 20);
  const studyPoints = 20 + Math.floor(state.stats.intelligence / 10) + disciplineBonus;

  // Education stat grows meaningfully with each study session
  const educationGain = 1 + Math.floor(studyPoints / 25);

  return {
    ...state,
    currentCourse: {
      ...state.currentCourse,
      studyPointsEarned: state.currentCourse.studyPointsEarned + studyPoints,
    },
    stats: {
      ...state.stats,
      intelligence: clamp(state.stats.intelligence + 2),
      education: clamp(state.stats.education + educationGain),
      discipline: clamp(state.stats.discipline + 1),
      energy: clamp(state.stats.energy - 20),
      stress: clamp(state.stats.stress + 8),
    },
    actionsUsedToday: [...state.actionsUsedToday, 'study'],
  };
}

// ─── Action: Socialize ────────────────────────────────────────────────────────
export function performSocialize(state: GameState, type: string = 'casual'): GameState {
  const reputationGain =
    type === 'community_service' ? 12 :
    type === 'networking'        ? 8  :
    type === 'neighbourhood'     ? 5  :
    type === 'party'             ? 1  : 2;

  const stressRelief =
    type === 'community_service' ? 5  :
    type === 'networking'        ? 8  :
    type === 'party'             ? 18 : 12;

  let s = {
    ...state,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + 15),
      stress: clamp(state.stats.stress - stressRelief),
      energy: clamp(state.stats.energy - 15),
      hunger: clamp(state.stats.hunger - 8),
      reputation: clamp(state.stats.reputation + reputationGain),
    },
    actionsUsedToday: [...state.actionsUsedToday, 'socialize'],
  };

  // Socializing, work/hustle, study and businesses can trigger a potential NPC encounter
  // — but only if cooldown expired and under 7-NPC cap
  const nonPermanentNpcs = s.npcs.filter(n => !n.isPermanent);
  const cooldownExpired = (s.daysUntilNextNpcEncounter ?? 0) <= 0;
  const underCap = nonPermanentNpcs.length < 3; // max 3 non-permanent slots

  if (cooldownExpired && underCap && Math.random() < 0.25) {
    s = proposeMeetNPC(s, type === 'crime_event' ? 'criminal' : undefined);
  }

  return s;
}

// ─── Propose NPC Meeting (creates a pending event — player opts in) ───────────
export function proposeMeetNPC(state: GameState, forceBackground?: string): GameState {
  const nonPermanentNpcs = state.npcs.filter(n => !n.isPermanent);
  if (nonPermanentNpcs.length >= 3) return state; // non-permanent slots full
  if ((state.daysUntilNextNpcEncounter ?? 0) > 0) return state; // cooldown active

  const rolePool = forceBackground
    ? NPC_ROLE_POOL.filter(r => r.background === forceBackground)
    : NPC_ROLE_POOL;
  if (rolePool.length === 0) return state;

  const roleDef = rolePool[Math.floor(Math.random() * rolePool.length)];
  const isMalePool = Math.random() < 0.5;
  const namePool = isMalePool ? NPC_NAME_POOL.male : NPC_NAME_POOL.female;
  const name = namePool[Math.floor(Math.random() * namePool.length)];
  const age = 18 + Math.floor(Math.random() * 35);
  const newNpcId = `npc_${state.day}_${Math.random().toString(36).slice(2, 7)}`;

  const meetEvent: GameEvent = {
    id: `meet_${newNpcId}`,
    title: '🤝 Someone New',
    description: `You crossed paths with ${name}, a ${roleDef.role}. ${roleDef.canOffer.includes('crime_opportunities') ? '⚠️ They seem connected to the streets.' : 'They seem friendly and open.'} Do you want to exchange contacts?`,
    type: 'social',
    choices: [
      {
        label: 'Exchange contacts',
        outcome: `You saved ${name}'s number. They join your network.`,
        effect: { statsChange: { happiness: 5 } },
        // Encoded NPC data in outcome string — parsed in context reducer
        npcData: { id: newNpcId, name, role: roleDef.role, age, background: roleDef.background, canOffer: roleDef.canOffer },
      },
      {
        label: 'Keep it brief',
        outcome: `You stayed polite but didn't take it further. You may run into them again in ${80 + Math.floor(Math.random() * 40)} days.`,
        effect: { statsChange: { happiness: 1 } },
        rejectedNpc: { id: newNpcId, cooldownDays: 80 + Math.floor(Math.random() * 40) },
      },
    ],
    day: state.day,
  };

  return {
    ...state,
    daysUntilNextNpcEncounter: 21, // reset encounter cooldown
    pendingEvents: [...state.pendingEvents, meetEvent],
  };
}

// ─── Meet New NPC (called after player accepts in event) ─────────────────────
export function meetNewNPC(state: GameState, npcData: {
  id: string; name: string; role: string; age: number; background: string; canOffer: string[];
}): GameState {
  const nonPermanentNpcs = state.npcs.filter(n => !n.isPermanent);
  if (nonPermanentNpcs.length >= 3) return state;

  const newNPC = {
    id: npcData.id,
    name: npcData.name,
    role: npcData.role,
    age: npcData.age,
    npcBackground: npcData.background as import('@/types/game').NpcBackground,
    relationshipLevel: 10 + Math.floor(Math.random() * 15),
    trust: 15,
    friendship: 20,
    conflict: 0,
    isPartner: false,
    romanticStage: 'none' as import('@/types/game').RomanticStage,
    canOffer: npcData.canOffer,
    isPermanent: false,
    hasFlirted: false,
  };

  return { ...state, npcs: [...state.npcs, newNPC] };
}

// ─── Remove NPC from relationships ───────────────────────────────────────────
export function removeNPC(state: GameState, npcId: string): GameState {
  const npc = state.npcs.find(n => n.id === npcId);
  if (!npc || npc.isPermanent) return state; // cannot remove permanent NPCs
  return { ...state, npcs: state.npcs.filter(n => n.id !== npcId) };
}

// ─── Flirt with NPC (unlocks romance path) ───────────────────────────────────
export function flirtNPC(state: GameState, npcId: string): GameState {
  const npc = state.npcs.find(n => n.id === npcId);
  if (!npc || npc.age < 18) return state;
  if (npc.isPermanent && (npc.role === 'Mother' || npc.role === 'Brother')) return state;
  const alreadyPartnered = state.npcs.some(n => n.romanticStage === 'partner');
  if (alreadyPartnered) return state;

  const reciprocated = Math.random() < 0.6;
  const updatedNpcs = state.npcs.map(n =>
    n.id === npcId
      ? { ...n, hasFlirted: true, romanticStage: reciprocated ? 'interest' as import('@/types/game').RomanticStage : n.romanticStage, friendship: clamp(n.friendship + (reciprocated ? 10 : -5)) }
      : n
  );

  return {
    ...state,
    npcs: updatedNpcs,
    pendingEvents: [...state.pendingEvents, {
      id: `flirt_${npcId}_${state.day}`,
      title: reciprocated ? '💘 Mutual Interest' : '😅 Not Feeling It',
      description: reciprocated
        ? `${npc.name} reciprocated your flirting. There's definitely a spark there.`
        : `${npc.name} was flattered but not interested romantically. Your friendship continues.`,
      type: 'social',
      choices: [{ label: reciprocated ? '💕 Exciting!' : '😊 Fair enough', outcome: '', effect: { statsChange: { happiness: reciprocated ? 10 : 3 } } }],
      day: state.day,
    }],
  };
}

// ─── Advance Romantic Relationship ────────────────────────────────────────────
export function advanceRomance(state: GameState, npcId: string): GameState {
  const npc = state.npcs.find(n => n.id === npcId);
  if (!npc || npc.age < 18) return state;

  const alreadyPartnered = state.npcs.some(n => n.romanticStage === 'partner' && n.id !== npcId);
  if (alreadyPartnered) return state;

  const stageProg: Record<string, import('@/types/game').RomanticStage> = {
    none: 'interest',
    interest: 'dating',
    dating: 'partner',
  };
  const nextStage = stageProg[npc.romanticStage] ?? npc.romanticStage;

  const updatedNpcs = state.npcs.map(n =>
    n.id === npcId
      ? {
          ...n,
          romanticStage: nextStage,
          isPartner: nextStage === 'partner',
          friendship: clamp(n.friendship + 15),
          trust: clamp(n.trust + 10),
          relationshipLevel: clamp(n.relationshipLevel + 20),
        }
      : n
  );

  const stageMsg: Record<string, string> = {
    interest: `${npc.name} has noticed your interest. The feelings seem mutual.`,
    dating: `You and ${npc.name} are now dating. 💕`,
    partner: `${npc.name} is now your life partner! 💍 They will cook for you and keep the home.`,
  };

  return {
    ...state,
    npcs: updatedNpcs,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + (nextStage === 'partner' ? 25 : 10)),
      stress: clamp(state.stats.stress - 10),
    },
    pendingEvents: [...state.pendingEvents, {
      id: `romance_${npcId}_${state.day}`,
      title: '❤️ Relationship Update',
      description: stageMsg[nextStage] ?? '',
      type: 'social',
      choices: [{ label: '❤️ Wonderful!', outcome: '', effect: { statsChange: { happiness: 5 } } }],
      day: state.day,
    }],
  };
}

// ─── Action: Take Drug ────────────────────────────────────────────────────────
export function performTakeDrug(state: GameState, itemId: string): GameState {
  const item = state.inventory.find(i => i.id === itemId && i.category === 'drug' && i.quantity > 0);
  if (!item) return state;

  const effect = DRUG_EFFECTS[itemId as keyof typeof DRUG_EFFECTS];
  if (!effect) return consumeItem(state, itemId);

  const newInventory = state.inventory
    .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
    .filter(i => i.quantity > 0);

  let updatedStats = { ...state.stats };
  // Apply drug effects directly from DRUG_EFFECTS fields
  updatedStats.energy = clamp((updatedStats.energy ?? 50) + effect.energyBoost);
  updatedStats.happiness = clamp((updatedStats.happiness ?? 50) + effect.happinessBoost);
  updatedStats.fitness = clamp((updatedStats.fitness ?? 50) + effect.fitnessHit);
  updatedStats.discipline = clamp((updatedStats.discipline ?? 50) + effect.disciplineHit);
  updatedStats.endurance = clamp((updatedStats.endurance ?? 50) + effect.enduranceHit);
  updatedStats.health = clamp((updatedStats.health ?? 50) + effect.healthHit);
  if (effect.durationDays) {
    updatedStats = { ...updatedStats, drugEffectDaysLeft: Math.max(updatedStats.drugEffectDaysLeft ?? 0, effect.durationDays) };
  }

  return {
    ...state,
    inventory: newInventory,
    stats: updatedStats,
    pendingEvents: [...state.pendingEvents, {
      id: `drug_${itemId}_${state.day}`,
      title: `💊 ${item.name} Taken`,
      description: effect.description,
      type: 'health',
      choices: [{ label: 'OK', outcome: '', effect: {} }],
      day: state.day,
    }],
  };
}

// ─── Black Market: Police Risk ──────────────────────────────────────────────
// Rolled once per black-market purchase. If caught: the item is confiscated,
// the player is fined, and their wanted level rises — a real, immediately
// visible consequence rather than a silent probability.
export function applyBlackMarketRisk(state: GameState, riskPercent: number, itemId: string, itemName: string): GameState {
  const caught = Math.random() * 100 < riskPercent;
  if (!caught) return state;

  const fine = Math.round(riskPercent * (10 + Math.random() * 15)); // roughly R100-R1125 scaled by risk
  const wantedGain = Math.max(5, Math.round(riskPercent / 3));

  const newInventory = state.inventory
    .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
    .filter(i => i.quantity > 0.001);

  return {
    ...state,
    cash: Math.max(0, state.cash - fine),
    inventory: newInventory,
    crimeState: {
      ...state.crimeState,
      wantedLevel: Math.max(0, Math.min(100, (state.crimeState.wantedLevel || 0) + wantedGain)),
    },
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: `Police fine — caught with ${itemName}`,
      amount: -fine,
      category: 'other' as const,
    }],
    pendingEvents: [...state.pendingEvents, {
      id: `bm_caught_${itemId}_${state.day}_${Math.random().toString(36).slice(2, 6)}`,
      title: '🚨 Spotted by Police',
      description: `You were caught with ${itemName} on you. It's been confiscated, you've been fined R${fine}, and police attention on you has increased.`,
      type: 'police',
      category: 'police',
      choices: [{ label: 'Damn it', outcome: '', effect: {} }],
      day: state.day,
    }],
  };
}

// ─── Action: Drink Alcohol ──────────────────────────────────────────────────
export function performDrinkAlcohol(state: GameState, itemId: string): GameState {
  const item = state.inventory.find(i => i.id === itemId && i.category === 'alcohol' && i.quantity > 0);
  if (!item) return state;

  const effect = ALCOHOL_EFFECTS[itemId as keyof typeof ALCOHOL_EFFECTS] ?? (item.drugType ? ALCOHOL_EFFECTS[item.drugType as keyof typeof ALCOHOL_EFFECTS] : undefined);
  if (!effect) return consumeItem(state, itemId);

  const newInventory = state.inventory
    .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
    .filter(i => i.quantity > 0);

  let updatedStats = { ...state.stats };
  updatedStats.energy = clamp((updatedStats.energy ?? 50) + effect.energyBoost);
  updatedStats.happiness = clamp((updatedStats.happiness ?? 50) + effect.happinessBoost);
  updatedStats.fitness = clamp((updatedStats.fitness ?? 50) + effect.fitnessHit);
  updatedStats.discipline = clamp((updatedStats.discipline ?? 50) + effect.disciplineHit);
  updatedStats.endurance = clamp((updatedStats.endurance ?? 50) + effect.enduranceHit);
  updatedStats.health = clamp((updatedStats.health ?? 50) + effect.healthHit);

  return {
    ...state,
    inventory: newInventory,
    stats: updatedStats,
    pendingEvents: [...state.pendingEvents, {
      id: `alcohol_${itemId}_${state.day}`,
      title: `🍺 ${item.name}`,
      description: effect.description,
      type: 'alcohol',
      category: 'alcohol',
      choices: [{ label: 'OK', outcome: '', effect: {} }],
      day: state.day,
    }],
  };
}


export function treatLivestock(state: GameState, livestockType: string, count: number): GameState {
  const medkitId = `medkit_${livestockType.toLowerCase()}`;
  const medkit = state.inventory.find(i => i.id === medkitId && i.quantity > 0);
  if (!medkit) return state;

  const group = state.livestock.find(g => g.type === livestockType);
  if (!group) return state;

  const treatable = Math.min(count, group.sickCount + group.injuredCount, medkit.quantity);
  if (treatable <= 0) return state;

  const newInventory = state.inventory
    .map(i => i.id === medkitId ? { ...i, quantity: i.quantity - treatable } : i)
    .filter(i => i.quantity > 0);

  const healedSick = Math.min(treatable, group.sickCount);
  const healedInjured = Math.min(treatable - healedSick, group.injuredCount);

  const updatedLivestock = state.livestock.map(g =>
    g.type === livestockType
      ? { ...g, sickCount: Math.max(0, g.sickCount - healedSick), injuredCount: Math.max(0, g.injuredCount - healedInjured) }
      : g
  );

  return {
    ...state,
    inventory: newInventory,
    livestock: updatedLivestock,
    stats: { ...state.stats, energy: clamp(state.stats.energy - 10) },
  };
}

// ─── NPC Benefit Application ──────────────────────────────────────────────────
export function applyNPCBenefit(state: GameState, npcId: string, benefitType: string): GameState {
  const npc = state.npcs.find(n => n.id === npcId);
  if (!npc) return state;

  let s = { ...state };
  let feedback = '';

  switch (benefitType) {
    case 'business_boost':
      // 10% income boost from one business for 7 days
      if (s.businesses.length > 0) {
        const biz = s.businesses[0];
        s = {
          ...s,
          businesses: s.businesses.map((b, i) =>
            i === 0 ? { ...b, dailyIncome: Math.floor(b.dailyIncome * 1.1) } : b
          ),
        };
        feedback = `${npc.name} connected you with a client. ${biz.type} income boosted!`;
      }
      break;
    case 'farming_boost':
      s = {
        ...s,
        stats: { ...s.stats, happiness: clamp(s.stats.happiness + 5) },
        financeHistory: [...s.financeHistory, {
          day: s.day, description: `${npc.name} farming advice`, amount: 200, category: 'farm',
        }],
        cash: s.cash + 200,
      };
      feedback = `${npc.name} shared farming techniques worth R200 in saved costs.`;
      break;
    case 'job_referral':
      s = {
        ...s,
        stats: { ...s.stats, reputation: clamp(s.stats.reputation + 8) },
        pendingEvents: [...s.pendingEvents, {
          id: `referral_${npcId}_${s.day}`,
          title: '💼 Job Referral',
          description: `${npc.name} referred you for a position. Check Employment for new opportunities.`,
          type: 'employment',
          choices: [{ label: 'Thanks!', outcome: '', effect: { statsChange: { happiness: 8 } } }],
          day: s.day,
        }],
      };
      break;
    case 'small_gift':
    case 'casual': {
      const giftCash = 50 + Math.floor(Math.random() * 150);
      s = {
        ...s,
        cash: s.cash + giftCash,
        stats: { ...s.stats, happiness: clamp(s.stats.happiness + 8) },
        financeHistory: [...s.financeHistory, {
          day: s.day, description: `Gift from ${npc.name}`, amount: giftCash, category: 'other',
        }],
      };
      feedback = `${npc.name} gave you a gift of R${giftCash}.`;
      break;
    }
    default:
      break;
  }

  // Increase relationship on benefit use
  const updatedNpcs = s.npcs.map(n =>
    n.id === npcId ? { ...n, trust: clamp(n.trust + 5), friendship: clamp(n.friendship + 5), lastInteraction: s.day } : n
  );
  return { ...s, npcs: updatedNpcs };
}

// ─── Action: Rest ─────────────────────────────────────────────────────────────
// Rest is FREE — does NOT consume a daily action
export function performRest(state: GameState): GameState {
  return {
    ...state,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy + 40),
      stress: clamp(state.stats.stress - 15),
      health: clamp(state.stats.health + 3),
    },
    // intentionally NOT adding to actionsUsedToday
  };
}

// ─── Action: Shower ───────────────────────────────────────────────────────────
export function performShower(state: GameState): GameState {
  // Check if has soap
  const hasSoap = state.inventory.some(i => i.category === 'hygiene' && i.quantity > 0);
  const hygieneGain = hasSoap ? 35 : 15;

  let newInventory = state.inventory;
  if (hasSoap) {
    newInventory = state.inventory.map(i => {
      if (i.category === 'hygiene' && i.quantity > 0) return { ...i, quantity: i.quantity - 0.2 };
      return i;
    });
  }

  return {
    ...state,
    inventory: newInventory,
    stats: {
      ...state.stats,
      hygiene: clamp(state.stats.hygiene + hygieneGain),
      happiness: clamp(state.stats.happiness + 5),
      stress: clamp(state.stats.stress - 5),
    },
    actionsUsedToday: [...state.actionsUsedToday, 'shower'],
  };
}

// ─── Consume Food ─────────────────────────────────────────────────────────────
export function consumeItem(state: GameState, itemId: string): GameState {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item || item.quantity <= 0) return state;

  const newInventory = state.inventory
    .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
    .filter(i => i.quantity > 0);

  return {
    ...state,
    inventory: newInventory,
    stats: {
      ...state.stats,
      hunger: item.hungerRestore ? clamp(state.stats.hunger + item.hungerRestore) : state.stats.hunger,
      hygiene: item.hygieneRestore ? clamp(state.stats.hygiene + item.hygieneRestore) : state.stats.hygiene,
      happiness: clamp(state.stats.happiness + 3),
    },
  };
}

// ─── Prison Actions ───────────────────────────────────────────────────────────
export function performPrisonLabour(state: GameState): GameState {
  const income = 35; // prison wage
  return {
    ...state,
    actionsUsedToday: [...state.actionsUsedToday, 'prison_labour'],
    cash: state.cash + income,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy - 40),
      fitness: clamp(state.stats.fitness + 2),
      happiness: clamp(state.stats.happiness - 5),
    },
    prison: {
      ...state.prison,
      prisonEarnings: state.prison.prisonEarnings + income,
    },
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: 'Prison labour wages',
      amount: income,
      category: 'work',
    }],
  };
}

export function performPrisonStudy(state: GameState): GameState {
  return {
    ...state,
    actionsUsedToday: [...state.actionsUsedToday, 'prison_study'],
    stats: {
      ...state.stats,
      intelligence: clamp(state.stats.intelligence + 3),
      energy: clamp(state.stats.energy - 15),
    },
    prison: {
      ...state.prison,
      prisonSkills: {
        ...state.prison.prisonSkills,
        study: state.prison.prisonSkills.study + 5,
      },
    },
  };
}

export function performPrisonExercise(state: GameState): GameState {
  return {
    ...state,
    actionsUsedToday: [...state.actionsUsedToday, 'prison_exercise'],
    stats: {
      ...state.stats,
      fitness: clamp(state.stats.fitness + 5),
      health: clamp(state.stats.health + 2),
      energy: clamp(state.stats.energy - 30),
    },
    prison: {
      ...state.prison,
      prisonSkills: {
        ...state.prison.prisonSkills,
        fitness: state.prison.prisonSkills.fitness + 3,
      },
    },
  };
}

export function checkPrisonRelease(state: GameState): GameState {
  if (!state.prison.imprisoned) return state;
  if (state.prison.daysServed < state.prison.sentenceDays) return state;

  return {
    ...state,
    prison: {
      ...state.prison,
      imprisoned: false,
    },
    stats: {
      ...state.stats,
      reputation: clamp(state.stats.reputation - 20),
      happiness: clamp(state.stats.happiness + 15),
    },
    pendingEvents: [...state.pendingEvents, {
      id: `released_${state.day}`,
      title: '🔓 Released from Prison',
      description: `You have completed your sentence for ${state.prison.crime}. You are free. Your reputation has taken a hit but a second chance awaits.`,
      type: 'crime',
      choices: [
        { label: 'Start fresh', outcome: 'You walk out determined to do better.', effect: { statsChange: { happiness: 20, stress: -10 } } },
      ],
      day: state.day,
    }],
  };
}

// ─── Harvest Crop ─────────────────────────────────────────────────────────────
export function harvestCrop(state: GameState, plotId: string): GameState {
  const plot = state.cropPlots.find(p => p.id === plotId);
  if (!plot || plot.stage !== 'ready') return state;

  const boostMultiplier = 1 + Math.max(-0.7, (plot.yieldBoostPct ?? 0) / 100);
  const finalYield = Math.max(1, Math.round(plot.yield * boostMultiplier));

  // Add to existing harvest stack or create new item
  const harvestId = `harvest_${plot.cropType.toLowerCase()}`;
  let inv = [...state.inventory];
  const existing = inv.find(i => i.id === harvestId);
  if (existing) {
    inv = inv.map(i => i.id === harvestId ? { ...i, quantity: Math.round((i.quantity + finalYield) * 10) / 10 } : i);
  } else {
    inv.push({
      id: harvestId,
      name: `${plot.cropType} (Farm)`,
      category: 'harvest',
      quantity: finalYield,
      unit: 'kg',
      sellPrice: CROP_DEFINITIONS[plot.cropType]?.sellPricePerKg ?? 5,
      hungerRestore: plot.cropType === 'Cannabis' ? 0 : 20,
    });
  }

  // Plot is REMOVED after harvest — player must replant
  return {
    ...state,
    cropPlots: state.cropPlots.filter(p => p.id !== plotId),
    cropPlotsOwned: (state.cropPlotsOwned ?? 0) + 1, // plot returns to available pool
    inventory: inv,
    cropCyclesCompleted: state.cropCyclesCompleted + 1,
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + 10),
    },
  };
}

// ─── Harvest All Ready Crops ───────────────────────────────────────────────────
export function harvestAllCrops(state: GameState): GameState {
  const readyPlots = state.cropPlots.filter(p => p.stage === 'ready');
  if (readyPlots.length === 0) return state;
  let s = state;
  for (const plot of readyPlots) {
    s = harvestCrop(s, plot.id);
  }
  return s;
}

// ─── Heal All Sick/Injured Livestock ─────────────────────────────────────────
export function healAllLivestock(state: GameState, livestockType: string): GameState {
  const group = state.livestock.find(g => g.type === livestockType);
  if (!group) return state;
  const sickCount = (group.sickCount ?? 0) + (group.injuredCount ?? 0);
  if (sickCount === 0) return state;

  // Chickens have no injury treatment — only sickness
  const isChicken = livestockType === 'Chicken';
  const toTreat = isChicken ? (group.sickCount ?? 0) : sickCount;
  if (toTreat === 0) return state;

  const kitId = `medkit_${livestockType.toLowerCase()}`;
  const kit = state.inventory.find(i => i.id === kitId);
  if (!kit || kit.quantity < toTreat) return state;

  const newInventory = state.inventory
    .map(i => i.id === kitId ? { ...i, quantity: i.quantity - toTreat } : i)
    .filter(i => i.quantity > 0);

  const newLivestock = state.livestock.map(g => {
    if (g.type !== livestockType) return g;
    return isChicken
      ? { ...g, sickCount: 0 }
      : { ...g, sickCount: 0, injuredCount: 0 };
  });

  return { ...state, inventory: newInventory, livestock: newLivestock };
}

// ─── Sell Livestock — Multiple / All Excess ───────────────────────────────────
// MIN_BREEDING: 1 male + 2 females must always remain
export const LIVESTOCK_MIN_BREEDING = { males: 1, females: 2 };

export function sellLivestockBulk(
  state: GameState,
  type: string,
  count: number,
  isMale: boolean,
  sellExcessOnly: boolean,
): GameState {
  const def = LIVESTOCK_DEFINITIONS[type as keyof typeof LIVESTOCK_DEFINITIONS];
  if (!def) return state;
  const group = state.livestock.find(g => g.type === type);
  if (!group) return state;

  const available = isMale ? group.males : group.females;
  const minKeep = isMale ? LIVESTOCK_MIN_BREEDING.males : LIVESTOCK_MIN_BREEDING.females;
  const maxSellable = Math.max(0, available - minKeep);

  const toSell = sellExcessOnly ? maxSellable : Math.min(count, maxSellable);
  if (toSell <= 0) return state;

  const income = def.sellPrice * toSell;

  const newLivestock = state.livestock
    .map(g => {
      if (g.type !== type) return g;
      return isMale ? { ...g, males: g.males - toSell } : { ...g, females: g.females - toSell };
    })
    .filter(g => g.males + g.females > 0);

  return {
    ...state,
    cash: state.cash + income,
    livestock: newLivestock,
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: `Sold ${toSell}x ${isMale ? 'male' : 'female'} ${type}`,
      amount: income,
      category: 'farm',
    }],
  };
}

// ─── Sell Harvest ─────────────────────────────────────────────────────────────
export function sellHarvest(state: GameState, itemId: string, quantity: number): GameState {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item || item.category !== 'harvest') return state;

  const cropName = item.name.split(' ')[0];
  const cropDef = CROP_DEFINITIONS[cropName];
  if (!cropDef) return state;

  const income = Math.floor(quantity * cropDef.sellPricePerKg);

  const newInventory = state.inventory
    .map(i => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i)
    .filter(i => i.quantity > 0);

  return {
    ...state,
    cash: state.cash + income,
    inventory: newInventory,
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: `Sold harvest: ${item.name}`,
      amount: income,
      category: 'farm',
    }],
  };
}

// ─── Slaughter Livestock ──────────────────────────────────────────────────────
export function slaughterLivestock(state: GameState, type: string, isMale: boolean): GameState {
  const def = LIVESTOCK_DEFINITIONS[type as keyof typeof LIVESTOCK_DEFINITIONS];
  if (!def) return state;

  const group = state.livestock.find(l => l.type === type);
  if (!group) return state;

  const updatedLivestock = state.livestock.map(l => {
    if (l.type !== type) return l;
    if (isMale) return { ...l, males: l.males - 1 };
    return { ...l, females: l.females - 1 };
  }).filter(l => l.males + l.females > 0);

  const meatItem: InventoryItem = {
    id: `meat_${type.toLowerCase()}_${state.day}`,
    name: `${type} Meat (${def.meatKg}kg)`,
    category: 'livestock_product',
    quantity: def.meatKg,
    unit: 'kg',
    hungerRestore: Math.floor(def.meatKg * 15),
  };

  return {
    ...state,
    livestock: updatedLivestock,
    inventory: [...state.inventory, meatItem],
  };
}


// ─── Apply Animal Feed to Livestock ──────────────────────────────────────────
export function applyAnimalFeed(state: GameState, livestockType: string, feedKg: number): GameState {
  // Consume feed bags from inventory
  const feedItem = state.inventory.find(i => i.id === 'animal_feed_bag' && i.quantity > 0);
  if (!feedItem) return state;

  const bagsToUse = Math.min(Math.ceil(feedKg / 25), feedItem.quantity);
  const actualKg = bagsToUse * 25;
  // Each 25kg bag gives 30 days of boost
  const boostDays = bagsToUse * 30;

  const newInventory = state.inventory
    .map(i => i.id === 'animal_feed_bag' ? { ...i, quantity: i.quantity - bagsToUse } : i)
    .filter(i => i.quantity > 0);

  const newLivestock = state.livestock.map(g =>
    g.type === livestockType
      ? { ...g, animalFeedStockKg: g.animalFeedStockKg + actualKg, dailyProduceBoostDays: g.dailyProduceBoostDays + boostDays }
      : g
  );

  return { ...state, inventory: newInventory, livestock: newLivestock };
}

// ─── Enroll in Formal Job Chain ───────────────────────────────────────────────
export function enrollFormalJob(state: GameState, chainId: string): GameState {
  const chain = getJobChain(chainId);
  if (!chain) return state;

  // Check qualification
  if (!state.qualifications.includes(chain.requiredQualification)) return state;

  const firstRank = chain.ranks[0];
  const jobTitle = firstRank.title as import('@/types/game').JobType;

  return {
    ...state,
    formalEmployment: {
      chainId,
      rankIndex: 0,
      daysAtRank: 0,
      lastPaidDay: state.day,
    },
    currentJob: {
      id: `${chainId}_0`,
      title: jobTitle,
      type: 'formal',
      industry: chain.industry,
      dailyIncome: 0, // formal jobs use monthlySalary via payCycle
      monthlySalary: firstRank.monthlySalary,
      payCycle: chain.payCycle,
      chainId,
      rankIndex: 0,
      daysAtRank: 0,
      requiredQualifications: [chain.requiredQualification],
      requiredLocation: [],
      energyCost: chain.energyCost,
      stressGain: chain.stressGain,
    },
    stats: {
      ...state.stats,
      happiness: clamp(state.stats.happiness + 20),
      stress: clamp(state.stats.stress + 5),
    },
    pendingEvents: [...state.pendingEvents, {
      id: `hired_${state.day}`,
      title: '💼 Formally Employed!',
      description: `You have been hired as a ${firstRank.title}. Your salary of R${firstRank.monthlySalary.toLocaleString()} will be paid ${chain.payCycle}.`,
      type: 'employment',
      choices: [{ label: 'Start your career', outcome: 'A new chapter begins.', effect: { statsChange: { happiness: 10 } } }],
      day: state.day,
    }],
  };
}

// ─── Resign from Formal Job ───────────────────────────────────────────────────
export function resignFormalJob(state: GameState): GameState {
  if (!state.formalEmployment) return state;
  return {
    ...state,
    formalEmployment: null,
    currentJob: null,
    stats: {
      ...state.stats,
      stress: clamp(state.stats.stress - 10),
      happiness: clamp(state.stats.happiness - 15),
    },
  };
}

// ─── Orchard: Advance Plots Each Day ─────────────────────────────────────────
function advanceOrchardPlots(state: GameState): GameState {
  if (!state.orchardPlots || state.orchardPlots.length === 0) return state;
  return {
    ...state,
    orchardPlots: state.orchardPlots.map((p: OrchardPlot) => ({ ...p, ageDays: p.ageDays + 1 })),
  };
}

// ─── Orchard: Harvest Fruit ───────────────────────────────────────────────────
export function performHarvestOrchard(state: GameState, plotId: string): GameState {
  const plot = state.orchardPlots?.find((p: OrchardPlot) => p.id === plotId);
  if (!plot) return state;

  const def = ORCHARD_DEFINITIONS[plot.treeType];
  if (!def) return state;

  // Trees must be mature and ready
  if (plot.ageDays < def.matureAfterDays) return state;
  if (state.day < plot.harvestReadyDay) return state;

  const harvestItemId = `harvest_${plot.treeType.toLowerCase().replace(' tree', '').replace(' ', '_')}`;
  const harvestName = `${plot.treeType.replace(' Tree', '')} (Farm)`;

  // Add fruit to inventory
  let inv = [...state.inventory];
  const existing = inv.find(i => i.id === harvestItemId);
  if (existing) {
    inv = inv.map(i => i.id === harvestItemId ? { ...i, quantity: i.quantity + plot.yield } : i);
  } else {
    inv.push({
      id: harvestItemId, name: harvestName, category: 'harvest', quantity: plot.yield,
      unit: 'kg', hungerRestore: 20, sellPrice: def.sellPricePerKg,
    });
  }

  const updatedOrchard = state.orchardPlots.map((p: OrchardPlot) =>
    p.id === plotId ? { ...p, lastHarvestDay: state.day, harvestReadyDay: state.day + def.harvestIntervalDays } : p
  );

  return { ...state, inventory: inv, orchardPlots: updatedOrchard };
}

// ─── Slaughter Livestock for Meat ─────────────────────────────────────────────
export function performSlaughterForMeat(state: GameState, livestockType: string, count: number): GameState {
  const group = state.livestock.find(g => g.type === livestockType);
  if (!group) return state;

  const def = LIVESTOCK_DEFINITIONS[livestockType as keyof typeof LIVESTOCK_DEFINITIONS];
  if (!def) return state;

  const total = group.males + group.females;
  if (total < count) return state;

  // Slaughter males first, protect breeding females
  let malesSlaughtered = Math.min(count, group.males);
  let femalesSlaughtered = Math.max(0, count - malesSlaughtered);

  // Never reduce females below 2 if there are still males (protect breeding stock)
  if (group.males > 0 && group.females - femalesSlaughtered < 2) {
    femalesSlaughtered = Math.max(0, group.females - 2);
    malesSlaughtered = Math.min(count - femalesSlaughtered, group.males);
  }

  const actualCount = malesSlaughtered + femalesSlaughtered;
  if (actualCount === 0) return state;

  const meatKg = actualCount * def.meatKg;
  const meatId = `meat_${livestockType.toLowerCase()}`;
  const meatName = `${livestockType} Meat`;

  let inv = [...state.inventory];
  const existing = inv.find(i => i.id === meatId);
  if (existing) {
    inv = inv.map(i => i.id === meatId ? { ...i, quantity: Math.round((i.quantity + meatKg) * 10) / 10 } : i);
  } else {
    inv.push({
      id: meatId, name: meatName, category: 'meat', quantity: meatKg,
      unit: 'kg', sellPrice: def.meatSellPricePerKg, hungerRestore: 60,
    });
  }

  const updatedLivestock = state.livestock.map(g =>
    g.type === livestockType
      ? { ...g, males: g.males - malesSlaughtered, females: g.females - femalesSlaughtered }
      : g
  ).filter(g => g.males + g.females > 0);

  return { ...state, inventory: inv, livestock: updatedLivestock };
}

// ─── Grant Bonus Action (from rewarded ad) ────────────────────────────────────
export function performGrantBonusAction(state: GameState): GameState {
  const adRewards = state.adRewards ?? { lastClaimedDay: {}, bonusActionsToday: 0 };
  const bonusToday = adRewards.bonusActionsToday ?? 0;
  if (bonusToday >= 2) return state; // max 2 bonus actions per day

  return {
    ...state,
    maxActionsPerDay: state.maxActionsPerDay + 1,
    adRewards: {
      ...adRewards,
      bonusActionsToday: bonusToday + 1,
      lastClaimedDay: { ...adRewards.lastClaimedDay, extra_action: state.day },
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function formatMoney(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getStatColor(value: number): string {
  if (value >= 70) return '#4CAF50';
  if (value >= 40) return '#FFB81C';
  return '#E32636';
}

export function getLocationIcon(location: string): string {
  const icons: Record<string, string> = {
    Village: '🏡',
    Township: '🏘️',
    'Informal Settlement': '⛺',
    Town: '🏙️',
    Suburb: '🏠',
    City: '🌆',
    Farm: '🌾',
  };
  return icons[location] ?? '📍';
}

export function getDayName(day: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[(day - 1) % 7];
}

export function getWeekNumber(day: number): number {
  return Math.ceil(day / 7);
}

// ─── Apply Fertilizer to a Crop Plot ─────────────────────────────────────────
export function applyFertilizer(state: GameState, plotId: string): GameState {
  const fertItem = state.inventory.find(i => i.id === 'fertilizer_bag' && i.quantity > 0);
  if (!fertItem) return state;

  const plot = state.cropPlots.find(p => p.id === plotId);
  if (!plot || plot.stage === 'harvested' || plot.stage === 'ready') return state;

  const newInventory = state.inventory
    .map(i => i.id === 'fertilizer_bag' ? { ...i, quantity: i.quantity - 1 } : i)
    .filter(i => i.quantity > 0);

  // Fertilizer: +30% yield boost AND reduces remaining growth time by 15%
  const daysRemaining = plot.daysToHarvest - plot.daysPlanted;
  const reducedDays = Math.max(1, Math.floor(daysRemaining * 0.85));
  const newDaysToHarvest = plot.daysPlanted + reducedDays;

  const newPlots = state.cropPlots.map(p =>
    p.id === plotId
      ? { ...p, fertilizerApplied: true, yieldBoostPct: Math.min(60, (p.yieldBoostPct ?? 0) + 30), needsFertilizer: false, daysToHarvest: newDaysToHarvest }
      : p
  );

  return { ...state, inventory: newInventory, cropPlots: newPlots };
}

// ─── Weed a Crop Plot Manually ────────────────────────────────────────────────
export function weedCropPlot(state: GameState, plotId: string): GameState {
  const hasHoe = state.inventory.some(i => i.id === 'hoe' && i.quantity > 0);
  if (!hasHoe) return state;

  const newPlots = state.cropPlots.map(p =>
    p.id === plotId
      ? { ...p, needsWeeding: false, lastWeededDay: state.day }
      : p
  );

  return {
    ...state,
    cropPlots: newPlots,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy - 15),
      fitness: clamp(state.stats.fitness + 1),
    },
  };
}

// ─── Clear Farm Event (use pesticide/herbicide) ───────────────────────────────
export function clearFarmEvent(state: GameState, plotId: string): GameState {
  const hasSprayer = state.inventory.some(i => i.id === 'sprayer' && i.quantity > 0);
  const hasPesticide = state.inventory.some(i => (i.id === 'pesticide_bottle' || i.id === 'herbicide_bottle') && i.quantity > 0);
  if (!hasSprayer || !hasPesticide) return state;

  const pesticideItem = state.inventory.find(i => (i.id === 'pesticide_bottle' || i.id === 'herbicide_bottle') && i.quantity > 0);
  const newInventory = state.inventory
    .map(i => i.id === pesticideItem?.id ? { ...i, quantity: i.quantity - 1 } : i)
    .filter(i => i.quantity > 0);

  const newPlots = state.cropPlots.map(p =>
    p.id === plotId
      ? { ...p, hasFarmEvent: false, farmEventType: null as import('@/types/game').FarmEventType }
      : p
  );

  return {
    ...state,
    inventory: newInventory,
    cropPlots: newPlots,
    stats: { ...state.stats, energy: clamp(state.stats.energy - 10) },
  };
}

// ─── Hire / Fire Farm Labor ────────────────────────────────────────────────────
export function hireFarmLaborer(state: GameState): GameState {
  const laborCost = 0; // No upfront hiring fee, just daily wages
  const newLaborer: FarmLaborer = {
    id: `labor_${Date.now()}`,
    name: `Farm Worker ${(state.farmLaborers ?? []).length + 1}`,
    dailyWage: 100,
    hiredDay: state.day,
  };
  return {
    ...state,
    farmLaborers: [...(state.farmLaborers ?? []), newLaborer],
  };
}

export function fireFarmLaborer(state: GameState, laborerId: string): GameState {
  return {
    ...state,
    farmLaborers: (state.farmLaborers ?? []).filter(l => l.id !== laborerId),
  };
}

// ─── Crime Engine ─────────────────────────────────────────────────────────────
export function performCrime(state: GameState, crimeId: string): GameState {
  const crimeDef = CRIME_DEFINITIONS.find(c => c.id === crimeId);
  if (!crimeDef) return state;

  if (state.prison.imprisoned) return state;

  const actionsLeft = state.maxActionsPerDay - state.actionsUsedToday.length;
  if (actionsLeft <= 0) return state;
  if (state.stats.energy < crimeDef.energyCost) return state;

  // Check weapon requirement
  const hasWeapon = state.inventory.some(i => i.category === 'weapon' && i.quantity > 0);
  if (crimeDef.requiresWeapon && !hasWeapon) return state;

  // Calculate success chance: base + weapon bonus + location bonus
  let successRate = crimeDef.baseSuccessRate;

  // Weapon bonus
  const weaponBonus = state.inventory
    .filter(i => i.category === 'weapon' && i.quantity > 0)
    .reduce((max, w) => Math.max(max, w.crimeSuccessBonus ?? 0), 0);
  successRate += weaponBonus;

  // Location modifier
  const locFreq = CRIME_FREQUENCY[state.location] ?? 0.15;
  successRate += Math.floor(locFreq * 20); // up to +8% in hotspots

  // Reputation modifier (higher rep = slightly more known = riskier)
  if (state.stats.reputation > 60) successRate -= 5;

  // Heat / Wanted Level modifier (reduces success rate based on heat)
  const currentHeat = state.crimeState?.wantedLevel || 0;
  successRate -= Math.floor(currentHeat / 2); // 100 heat = -50% success rate

  successRate = Math.min(95, Math.max(5, successRate));

  const succeeded = Math.random() * 100 < successRate;
  const caught = !succeeded;

  let s = {
    ...state,
    stats: {
      ...state.stats,
      energy: clamp(state.stats.energy - crimeDef.energyCost),
      happiness: clamp(state.stats.happiness - crimeDef.happinessCost),
      stress: clamp(state.stats.stress + crimeDef.stressAdd),
    },
    actionsUsedToday: [...state.actionsUsedToday, `crime_${crimeId}`],
  };

  const crimeState = s.crimeState ?? { cannabisSalesCaught: 0, totalCrimes: 0, crimeRecords: [], wantedLevel: 0 };
  const heatAdded = Math.max(5, Math.floor(crimeDef.sentenceDays / 5)); // e.g., Shoplifting adds 5, Murder adds 36

  if (succeeded) {
    const reward = crimeDef.baseCashReward.min +
      Math.floor(Math.random() * (crimeDef.baseCashReward.max - crimeDef.baseCashReward.min + 1));

    s = {
      ...s,
      cash: s.cash + reward,
      stats: { ...s.stats, reputation: clamp(s.stats.reputation - 3) },
      financeHistory: [...s.financeHistory, {
        day: s.day,
        description: `Crime: ${crimeDef.name}`,
        amount: reward,
        category: 'crime',
      }],
      crimeState: {
        ...crimeState,
        totalCrimes: crimeState.totalCrimes + 1,
        wantedLevel: Math.min(100, (crimeState.wantedLevel || 0) + heatAdded),
        crimeRecords: [...crimeState.crimeRecords, {
          day: s.day,
          crime: crimeDef.name as CrimeType,
          caught: false,
          income: reward,
          finePaid: 0,
          sentenceDays: 0,
        }],
      },
    };
  } else {
    // Caught — determine consequence
    const fine = crimeDef.caughtFine.min +
      Math.floor(Math.random() * (crimeDef.caughtFine.max - crimeDef.caughtFine.min + 1));

    // Special rule: selling cannabis → fine only (unless repeat offender 3+)
    const isCannabisSale = crimeId === 'selling_cannabis';
    const cannabisCaught = (crimeState.cannabisSalesCaught ?? 0) + (isCannabisSale ? 1 : 0);
    const jailInstead = isCannabisSale && cannabisCaught <= 2;

    // Firearm possession check during arrest
    const hasFirearm = state.inventory.some(i => i.category === 'weapon' && i.isFirearm);
    const extraSentence = hasFirearm ? 30 : 0;

    const sentenceDays = jailInstead ? 0 : crimeDef.sentenceDays + extraSentence;
    const actualFine = Math.min(fine, s.cash); // can't pay more than you have

    s = {
      ...s,
      cash: s.cash - actualFine,
      stats: {
        ...s.stats,
        stress: clamp(s.stats.stress + 20),
        reputation: clamp(s.stats.reputation - 10),
        happiness: clamp(s.stats.happiness - 15),
      },
      financeHistory: [...s.financeHistory, {
        day: s.day,
        description: `Fine: ${crimeDef.name}`,
        amount: -actualFine,
        category: 'fine',
      }],
      crimeState: {
        ...crimeState,
        totalCrimes: crimeState.totalCrimes + 1,
        wantedLevel: Math.min(100, (crimeState.wantedLevel || 0) + heatAdded + 15), // +15 extra heat if caught
        cannabisSalesCaught: isCannabisSale ? cannabisCaught : crimeState.cannabisSalesCaught,
        crimeRecords: [...crimeState.crimeRecords, {
          day: s.day,
          crime: crimeDef.name as CrimeType,
          caught: true,
          income: 0,
          finePaid: actualFine,
          sentenceDays,
        }],
      },
    };

    if (sentenceDays > 0 && !jailInstead) {
      s = {
        ...s,
        // Lose formal employment on imprisonment
        currentJob: null,
        formalEmployment: null,
        prison: {
          ...s.prison,
          imprisoned: true,
          sentenceDays,
          daysServed: 0,
          crime: crimeDef.name,
          gangMember: false,
          prisonEarnings: 0,
          facility: 'Pollsmoor Correctional Centre',
          prisonSkills: { study: 0, fitness: 0 },
        },
      };
    } else {
      // Fine only
      s = {
        ...s,
        pendingEvents: [...s.pendingEvents, {
          id: `caught_${crimeId}_${s.day}`,
          title: '⚖️ Caught!',
          description: `You were caught ${crimeDef.name.toLowerCase()}. You paid a fine of R${actualFine.toLocaleString()}.${isCannabisSale && cannabisCaught < 3 ? ` Warning: if caught ${3 - cannabisCaught} more time${3 - cannabisCaught !== 1 ? 's' : ''} you will be imprisoned.` : ''}`,
          type: 'crime',
          choices: [{ label: 'Accept', outcome: '', effect: { statsChange: {} } }],
          day: s.day,
        }],
      };
    }
  }

  // 15% chance to meet a crime-related NPC during any crime attempt (in high-risk areas)
  const highRiskLocs = ['Township', 'City', 'Informal Settlement'];
  if (highRiskLocs.includes(s.location) && Math.random() < 0.15) {
    s = proposeMeetNPC(s, Math.random() < 0.5 ? 'criminal' : 'gangster');
  }

  return s;
}

// ─── Sell Produce (Eggs / Milk / Cannabis) from Farming Menu ──────────────────
export function sellLivestockProduce(state: GameState, itemId: string, qty: number): GameState {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item || item.quantity < qty) return state;

  // Pricing
  const priceMap: Record<string, number> = {
    farm_eggs: 4,        // R4/egg
    farm_goat_milk: 15,  // R15/L
    farm_cow_milk: 12,   // R12/L
  };
  const pricePerUnit = priceMap[itemId] ?? 5;
  const total = Math.round(pricePerUnit * qty * 10) / 10;

  const newInventory = state.inventory
    .map(i => i.id === itemId ? { ...i, quantity: Math.round((i.quantity - qty) * 10) / 10 } : i)
    .filter(i => i.quantity > 0);

  return {
    ...state,
    cash: state.cash + total,
    inventory: newInventory,
    financeHistory: [...state.financeHistory, {
      day: state.day,
      description: `Sold ${item.name} ×${qty}`,
      amount: total,
      category: 'farm',
    }],
  };
}

// ─── Sell Cannabis Harvest ────────────────────────────────────────────────────
export function sellCannabisHarvest(state: GameState, qty: number): GameState {
  const item = state.inventory.find(i => i.name === 'Cannabis');
  if (!item || item.quantity < qty) return state;

  const CANNABIS_PRICE_KG = 600;
  const total = qty * CANNABIS_PRICE_KG;

  // Risk of getting caught: 35% base
  const caught = Math.random() < 0.35;
  const crimeState = state.crimeState ?? { cannabisSalesCaught: 0, totalCrimes: 0, crimeRecords: [], wantedLevel: 0 };
  const newCaughtCount = caught ? crimeState.cannabisSalesCaught + 1 : crimeState.cannabisSalesCaught;

  const fine = caught ? 1000 + Math.floor(Math.random() * 3000) : 0;
  const actualFine = Math.min(fine, state.cash);
  const sentenceDays = caught && newCaughtCount >= 3 ? 21 : 0;

  const newInventory = state.inventory
    .map(i => i.name === 'Cannabis' ? { ...i, quantity: Math.round((i.quantity - qty) * 10) / 10 } : i)
    .filter(i => i.quantity > 0);

  let s: GameState = {
    ...state,
    cash: state.cash + (caught ? -actualFine : total),
    inventory: newInventory,
    crimeState: {
      ...crimeState,
      cannabisSalesCaught: newCaughtCount,
      totalCrimes: crimeState.totalCrimes + 1,
      crimeRecords: [...crimeState.crimeRecords, {
        day: state.day,
        crime: 'Selling Cannabis' as CrimeType,
        caught,
        income: caught ? 0 : total,
        finePaid: actualFine,
        sentenceDays,
      }],
    },
    financeHistory: [
      ...state.financeHistory,
      ...(!caught ? [{ day: state.day, description: `Cannabis sale (${qty}kg)`, amount: total, category: 'crime' as const }] : []),
      ...(caught ? [{ day: state.day, description: `Cannabis fine`, amount: -actualFine, category: 'fine' as const }] : []),
    ],
  };

  if (caught && sentenceDays > 0) {
    s = {
      ...s,
      // Lose formal employment on imprisonment
      currentJob: null,
      formalEmployment: null,
      prison: {
        ...s.prison,
        imprisoned: true,
        sentenceDays,
        daysServed: 0,
        crime: 'Selling Cannabis',
        gangMember: false,
        prisonEarnings: 0,
        facility: 'Pollsmoor Correctional Centre',
        prisonSkills: { study: 0, fitness: 0 },
      },
    };
  } else if (caught) {
    s = {
      ...s,
      pendingEvents: [...s.pendingEvents, {
        id: `cannabis_caught_${s.day}`,
        title: '🚔 Caught Selling Cannabis',
        description: `Police stopped you. You paid a R${actualFine.toLocaleString()} fine. This is offence #${newCaughtCount}. ${newCaughtCount < 3 ? `Caught ${3 - newCaughtCount} more time${3 - newCaughtCount !== 1 ? 's' : ''} = prison.` : 'Next time you face prison.'}`,
        type: 'crime',
        choices: [{ label: 'Understood', outcome: '', effect: { statsChange: {} } }],
        day: s.day,
      }],
    };
  }

  return s;
}

// ─── Compute Daily Financial Summary ─────────────────────────────────────────
export function computeDailyFinancials(state: GameState): {
  dailyIncome: { salary: number; business: number; farming: number; rentals: number; interest: number; prisonLabour: number; total: number };
  dailyExpenses: { food: number; utilities: number; education: number; property: number; medical: number; business: number; total: number };
  netDaily: number;
} {
  const day = state.day;
  const recent = state.financeHistory.filter(r => day - r.day <= 30);

  // Income streams
  const salary = recent.filter(r => r.category === 'work' && r.amount > 0).reduce((s, r) => s + r.amount, 0) / 30;
  const businessIncome = recent.filter(r => r.category === 'business' && r.amount > 0).reduce((s, r) => s + r.amount, 0) / 30;
  const farmIncome = recent.filter(r => r.category === 'farm' && r.amount > 0).reduce((s, r) => s + r.amount, 0) / 30;
  const rentalIncome = state.properties.filter(p => p.isRentedOut).reduce((s, p) => s + p.tenantRent / 30, 0);
  const interestIncome = recent.filter(r => r.category === 'bank' && r.amount > 0).reduce((s, r) => s + r.amount, 0) / 30;
  const prisonLabour = state.prison.imprisoned ? state.prison.prisonEarnings / Math.max(1, state.prison.daysServed) : 0;

  // Expense streams
  const foodExp = recent.filter(r => r.category === 'shop' && r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0) / 30;
  const educationExp = state.currentCourse ? state.currentCourse.dailyFee : 0;
  const propertyExp = state.properties.filter(p => !p.isRentedOut).reduce((s, p) => s + p.monthlyPayment / 30, 0);
  const medicalExp = recent.filter(r => r.category === 'other' && r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0) / 30;
  const bizExp = recent.filter(r => r.category === 'business' && r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0) / 30;
  const utilities = state.properties.length > 0 ? 30 : 0; // flat R30/day utilities

  const totalIncome = salary + businessIncome + farmIncome + rentalIncome + interestIncome + prisonLabour;
  const totalExpenses = foodExp + utilities + educationExp + propertyExp + medicalExp + bizExp;

  return {
    dailyIncome: {
      salary: Math.round(salary),
      business: Math.round(businessIncome),
      farming: Math.round(farmIncome),
      rentals: Math.round(rentalIncome),
      interest: Math.round(interestIncome),
      prisonLabour: Math.round(prisonLabour),
      total: Math.round(totalIncome),
    },
    dailyExpenses: {
      food: Math.round(foodExp),
      utilities: Math.round(utilities),
      education: Math.round(educationExp),
      property: Math.round(propertyExp),
      medical: Math.round(medicalExp),
      business: Math.round(bizExp),
      total: Math.round(totalExpenses),
    },
    netDaily: Math.round(totalIncome - totalExpenses),
  };
}
