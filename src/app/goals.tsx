import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import GoalsHeader from '@/components/goals/GoalsHeader';
import GoalsOverview from '@/components/goals/GoalsOverview';
import GoalsFilterTabs from '@/components/goals/GoalsFilterTabs';
import GoalItemCard from '@/components/goals/GoalItemCard';
import GoalsEmptyState from '@/components/goals/GoalsEmptyState';
import AddGoalSheet from '@/components/goals/AddGoalSheet';
import DepositSheet from '@/components/goals/DepositSheet';
import { FINANCIAL_GOALS, FinancialGoal, GoalFilter } from '@/data/goalsData';
import { filterGoals, summarizeGoals } from '@/utils/goals';
import { COLORS } from '@/constants/colors';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<FinancialGoal[]>(FINANCIAL_GOALS);
  const [filter, setFilter] = useState<GoalFilter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [depositTarget, setDepositTarget] = useState<FinancialGoal | null>(null);

  const filtered = useMemo(() => filterGoals(goals, filter), [goals, filter]);
  const summary = useMemo(() => summarizeGoals(goals), [goals]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router]);

  const handleCardPress = useCallback((g: FinancialGoal) => {
    Alert.alert(g.name, `Terkumpul ${g.saved.toLocaleString('id-ID')} dari ${g.target.toLocaleString('id-ID')}\nDeadline: ${g.deadline}`);
  }, []);

  const handleAddGoal = useCallback((data: { name: string; target: number; deadline: string; imageUri?: string }) => {
    const deadlineTs = Date.now() + 180 * 86400000;
    const newGoal: FinancialGoal = {
      id: `g${Date.now()}`,
      name: data.name,
      icon: data.imageUri ? '' : 'ph:piggy-bank-bold',
      iconBg: data.imageUri ? '#EEF2FF' : '#FDF2E9',
      iconColor: data.imageUri ? COLORS.primary : '#C2410C',
      imageUri: data.imageUri,
      deadline: data.deadline,
      deadlineTs,
      saved: 0,
      target: data.target,
      createdAt: Date.now(),
    };
    setGoals((prev) => [newGoal, ...prev]);
    setShowAdd(false);
  }, []);

  const handleDeposit = useCallback((g: FinancialGoal, amount: number) => {
    setGoals((prev) =>
      prev.map((x) => (x.id === g.id ? { ...x, saved: Math.min(x.target, x.saved + amount) } : x))
    );
    setDepositTarget(null);
  }, []);

  const emptyAll = goals.length === 0;
  const emptyFilter = !emptyAll && filtered.length === 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GoalsHeader onBack={handleBack} />

        <GoalsOverview
          totalSaved={summary.totalSaved}
          totalTarget={summary.totalTarget}
          percent={summary.percent}
          active={summary.active}
          done={summary.done}
        />

        {!emptyAll ? <GoalsFilterTabs value={filter} onChange={setFilter} /> : null}

        <View style={styles.list}>
          {emptyAll ? (
            <GoalsEmptyState onCreate={() => setShowAdd(true)} />
          ) : emptyFilter ? (
            <View style={styles.emptyFilter}>
              <GoalsEmptyState onCreate={() => setShowAdd(true)} />
            </View>
          ) : (
            filtered.map((g) => (
              <GoalItemCard key={g.id} goal={g} onPress={handleCardPress} onDeposit={setDepositTarget} />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 50, right: 45 }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
        accessibilityLabel="Tambah target"
      >
        <Iconify icon="ph:plus-bold" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <AddGoalSheet visible={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAddGoal} />
      <DepositSheet goal={depositTarget} onClose={() => setDepositTarget(null)} onSubmit={handleDeposit} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  emptyFilter: { opacity: 0.6 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    elevation: 24,
    shadowColor: '#1A42BA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
});
