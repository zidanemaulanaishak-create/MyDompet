// @@iconify-code-gen
import React, { useEffect } from 'react';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Platform, View, StatusBar } from 'react-native';
import {
  Redirect,
  Stack,
  usePathname,
  useRootNavigationState,
  useRouter,
} from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '@/components/ui/BottomNav';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { CategoriesProvider } from '@/context/categories-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { SettingsProvider } from '@/context/settings-context';
import { TransactionProvider } from '@/context/transaction-context';
import { BudgetProvider } from '@/context/budget-context';
import { GoalProvider } from '@/context/goal-context';
import {
  NotificationsProvider,
  useNotifications,
} from '@/context/notifications-context';
import { toAppNotification } from '@/notifications/setup';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { useDailySpendingReminder } from '@/hooks/useDailySpendingReminder';
import { getThemeColors } from '@/constants/colors';
import '../global.css';

const PUBLIC_ROUTES: string[] = ['/welcome', '/login', '/register', '/verify', '/auth-callback'];

const HIDE_NAV_ROUTES: string[] = ['/add-transaction', '/upload', '/scan', '/reports', '/welcome', '/login', '/register', '/verify', '/ai-assistant', '/weekly', '/goals', '/categories', '/onboarding/step-1', '/onboarding/step-2', '/auth-callback'];

const BLUE_HEADER_ROUTES: string[] = ['/welcome', '/login', '/register', '/ai-assistant', '/upload', '/scan', '/weekly', '/goals'];

function BootSplash() {
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);
  return (
    <View style={{ flex: 1, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 132, height: 132 }}
        contentFit="contain"
      />
    </View>
  );
}

function NotificationObserver() {
  const router = useRouter();
  const { addLocal, markRead } = useNotifications();
  useNotificationTriggers();
  useDailySpendingReminder();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const item = toAppNotification(response.notification);
      addLocal(item);
      void markRead(item.id);
      void Notifications.clearLastNotificationResponseAsync();
      const url = item.data.url;
      if (typeof url === 'string' && url.startsWith('/')) {
        router.push(url as any);
      }
    };

    const received = Notifications.addNotificationReceivedListener((notification) => {
      addLocal(toAppNotification(notification));
    });
    const responded = Notifications.addNotificationResponseReceivedListener(handleResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleResponse(response);
    });

    return () => {
      received.remove();
      responded.remove();
    };
  }, [addLocal, markRead, router]);

  return null;
}

function RootNavigator() {
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { user, isReady, onboarding, onboardingReady } = useAuth();
  const { isDark, accent } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light', accent);

  if (!isReady || !onboardingReady) {
    return <BootSplash />;
  }

  // Tunggu NavigationContainer + expo-linking selesai resolve initial URL
  // sebelum me-render <Redirect />. Redirect memanggil router.replace lewat
  // useFocusEffect; jika dipanggil saat linking masih resolve promise
  // (Linking.getInitialURL), RN melempar "state update on not-yet-mounted".
  // Pola ini sesuai panduan Authentication Expo Router v57.
  if (!rootNavigationState?.key) {
    return <BootSplash />;
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isOnboarding = pathname.startsWith('/onboarding');
  const hasBlueHeader = BLUE_HEADER_ROUTES.includes(pathname);
  const hideNav = HIDE_NAV_ROUTES.includes(pathname);
  const plainChrome = isPublic || isOnboarding;

  // Belum login -> tahan di area publik
  if (!user) {
    if (!isPublic) return <Redirect href="/welcome" />;
  }

  // Login tapi belum onboarding -> paksa ke alur onboarding
  if (user && !onboarding.completed) {
    if (!isOnboarding) return <Redirect href="/onboarding/step-1" />;
  }

  // Login + onboarding selesai -> keluar dari onboarding/public
  if (user && onboarding.completed) {
    if (isPublic || isOnboarding || pathname === '/') {
      return <Redirect href="/home" />;
    }
  }

  const chromeBg = plainChrome ? (isDark ? palette.bg : '#FFFFFF') : palette.primary;
  const statusBg = plainChrome ? chromeBg : palette.primary;
  const barStyle = hasBlueHeader || !plainChrome ? 'light-content' : isDark ? 'light-content' : 'dark-content';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: chromeBg }}
      edges={plainChrome ? [] : ['top']}
    >
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBg}
        translucent={hasBlueHeader}
      />
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        >
          <Stack.Screen
            name="add-transaction"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="upload"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="scan"
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen name="ai-assistant" options={{ animation: 'slide_from_left' }} />
          <Stack.Screen name="weekly" options={{ animation: 'slide_from_left' }} />
          <Stack.Screen name="reports" options={{ animation: 'slide_from_left' }} />
          <Stack.Screen name="goals" options={{ animation: 'slide_from_left' }} />
        </Stack>
        {!hideNav && <BottomNav />}
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemeProvider>
          <AuthProvider>
            <CategoriesProvider>
              <TransactionProvider>
                <BudgetProvider>
                  <GoalProvider>
                    <NotificationsProvider>
                      <NotificationObserver />
                      <RootNavigator />
                    </NotificationsProvider>
                  </GoalProvider>
                </BudgetProvider>
              </TransactionProvider>
            </CategoriesProvider>
          </AuthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

