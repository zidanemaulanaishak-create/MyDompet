import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import GoalsHeader from '@/components/goals/GoalsHeader';
import GoalsOverview from '@/components/goals/GoalsOverview';
import GoalsFilterTabs from '@/components/goals/GoalsFilterTabs';
import GoalItemCard from '@/components/goals/GoalItemCard';
import GoalsEmptyState from '@/components/goals/GoalsEmptyState';
import AddGoalSheet, { GoalFormData } from '@/components/goals/AddGoalSheet';
import DepositSheet, { CashflowMode } from '@/components/goals/DepositSheet';
import GoalDetailSheet from '@/components/goals/GoalDetailSheet';
import { FinancialGoal, GoalFilter } from '@/data/goalsData';
import { filterGoals, summarizeGoals } from '@/utils/goals';
import { COLORS, getThemeColors } from '@/constants/colors';
import { useTheme } from '@/context/theme-context';
import { useGoals } from '@/context/goal-context';
import { useI18n } from '@/i18n';

export default function GoalsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');
  const insets = useSafeAreaInsets();
  const { goals, isLoading, refresh, addGoal, updateGoal, deleteGoal, deposit, withdraw } = useGoals();

  const [filter, setFilter] = useState<GoalFilter>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<FinancialGoal | null>(null);
  const [cashflowTarget, setCashflowTarget] = useState<FinancialGoal | null>(null);
  const [cashflowMode, setCashflowMode] = useState<CashflowMode>('deposit');
  const [detailTarget, setDetailTarget] = useState<FinancialGoal | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => filterGoals(goals, filter), [goals, filter]);
  const summary = useMemo(() => summarizeGoals(goals), [goals]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router]);

  const openCashflow = useCallback((g: FinancialGoal, mode: CashflowMode) => {
    setDetailTarget(null);
    setCashflowMode(mode);
    setCashflowTarget(g);
  }, []);

  const handleSubmitGoal = useCallback(
    async (data: GoalFormData) => {
      setSaving(true);
      try {
        const err = editing
          ? await updateGoal(editing.id, {
              name: data.name,
              target: data.target,
              deadlineTs: data.deadlineTs,
              imageUri: data.imageUri,
            })
          : await addGoal({
              name: data.name,
              target: data.target,
              deadlineTs: data.deadlineTs,
              imageUri: data.imageUri,
            });
        if (err) {
          Alert.alert(t('goals.saveFailed'), err);
          return;
        }
        setShowAdd(false);
        setEditing(null);
      } finally {
        setSaving(false);
      }
    },
    [editing, addGoal, updateGoal, t]
  );

  const handleCashflow = useCallback(
    async (g: FinancialGoal, amount: number, mode: CashflowMode) => {
      setSaving(true);
      try {
        const err = mode === 'withdraw' ? await withdraw(g.id, amount) : await deposit(g.id, amount);
        if (err) {
          Alert.alert(t('goals.saveFailed'), err);
          return;
        }
        setCashflowTarget(null);
      } finally {
        setSaving(false);
      }
    },
    [deposit, withdraw, t]
  );

  const handleDelete = useCallback(
    (g: FinancialGoal) => {
      Alert.alert(t('goals.deleteTitle'), t('goals.deleteMsg', { name: g.name }), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const err = await deleteGoal(g.id);
            if (err) {
              Alert.alert(t('goals.deleteFailed'), err);
              return;
            }
            setDetailTarget(null);
          },
        },
      ]);
    },
    [deleteGoal, t]
  );

  const emptyAll = goals.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
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
          {isLoading && emptyAll ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={palette.primary} />
            </View>
          ) : emptyAll ? (
            <GoalsEmptyState onCreate={() => { setEditing(null); setShowAdd(true); }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyFilter}>
              <GoalsEmptyState onCreate={() => { setEditing(null); setShowAdd(true); }} />
            </View>
          ) : (
            filtered.map((g) => (
              <GoalItemCard
                key={g.id}
                goal={g}
                onPress={setDetailTarget}
                onDeposit={(goal) => openCashflow(goal, 'deposit')}
              />
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 50, right: 45 }]}
        onPress={() => { setEditing(null); setShowAdd(true); }}
        activeOpacity={0.85}
        accessibilityLabel={t('goals.addAccessibility')}
      >
        <Iconify icon="ph:plus-bold" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <AddGoalSheet
        visible={showAdd}
        initial={editing}
        saving={saving}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        onSubmit={handleSubmitGoal}
      />
      <DepositSheet
        goal={cashflowTarget}
        mode={cashflowMode}
        saving={saving}
        onClose={() => setCashflowTarget(null)}
        onSubmit={handleCashflow}
      />
      <GoalDetailSheet
        goal={detailTarget}
        onClose={() => setDetailTarget(null)}
        onDeposit={(g) => openCashflow(g, 'deposit')}
        onWithdraw={(g) => openCashflow(g, 'withdraw')}
        onEdit={(g) => { setEditing(g); setShowAdd(true); }}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  emptyFilter: { opacity: 0.6 },
  loading: { alignItems: 'center', paddingTop: 40 },
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
