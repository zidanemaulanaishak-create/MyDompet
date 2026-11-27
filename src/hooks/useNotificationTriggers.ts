import { useEffect, useRef } from 'react';
import { getCategoryById } from '@/constants/categories';
import { useAuth } from '@/context/auth-context';
import { useBudget } from '@/context/budget-context';
import { useGoals } from '@/context/goal-context';
import { useSettings } from '@/context/settings-context';
import { useTransactions } from '@/context/transaction-context';
import { useI18n } from '@/i18n';
import { sendPushNotification } from '@/services/notifications';
import { buildBudget, categoryPercentUsed } from '@/utils/budget';
import { isGoalDone } from '@/utils/goals';
import { monthKey } from '@/utils/dates';

export function useNotificationTriggers() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { getBudgetsForMonth } = useBudget();
  const { goals } = useGoals();
  const { notifications: prefs, isReady: settingsReady } = useSettings();
  const { t } = useI18n();
  const sent = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !settingsReady) return;

    const fire = (
      key: string,
      input: Parameters<typeof sendPushNotification>[1]
    ) => {
      if (sent.current.has(key)) return;
      sent.current.add(key);
      void sendPushNotification(user.id, input).catch(() => undefined);
    };

    if (prefs.budgetReminder) {
      const key = monthKey(new Date());
      const limits = getBudgetsForMonth(key).map((b) => ({
        categoryId: b.categoryId,
        limit: b.limit,
      }));
      const budget = buildBudget(key, limits, transactions);

      for (const category of budget.categories) {
        const percent = categoryPercentUsed(category);
        const threshold = percent >= 100 ? 100 : percent >= 80 ? 80 : 0;
        if (!threshold) continue;

        const label =
          getCategoryById(category.categoryId, 'expense')?.label ?? category.categoryId;
        const dedupeKey = `budget-${key}-${category.categoryId}-${threshold}`;
        fire(dedupeKey, {
          type: 'budget',
          title: t(
            threshold === 100
              ? 'home.notifBudget100Title'
              : 'home.notifBudget80Title'
          ),
          body: t(
            threshold === 100
              ? 'home.notifBudget100Body'
              : 'home.notifBudget80Body',
            { name: label, percent }
          ),
          data: { name: label, percent, categoryId: category.categoryId },
          url: '/budget',
          dedupeKey,
        });
      }
    }

    if (prefs.goalReminder) {
      for (const goal of goals) {
        if (isGoalDone(goal)) {
          const dedupeKey = `goal-${goal.id}-done`;
          fire(dedupeKey, {
            type: 'goal',
            title: t('home.notifGoalDoneTitle'),
            body: t('home.notifGoalDoneBody', { name: goal.name }),
            data: { name: goal.name, goalId: goal.id },
            url: '/goals',
            dedupeKey,
          });
          continue;
        }

        const days = Math.max(
          0,
          Math.ceil((goal.deadlineTs - Date.now()) / 86400000)
        );
        if (goal.deadlineTs > 0 && days <= 3) {
          const dedupeKey = `goal-${goal.id}-due`;
          fire(dedupeKey, {
            type: 'goal',
            title: t('home.notifGoalDueTitle'),
            body: t('home.notifGoalDueBody', { name: goal.name, days }),
            data: { name: goal.name, days, goalId: goal.id },
            url: '/goals',
            dedupeKey,
          });
        }
      }
    }
  }, [
    user,
    settingsReady,
    prefs.budgetReminder,
    prefs.goalReminder,
    getBudgetsForMonth,
    transactions,
    goals,
    t,
  ]);
}
