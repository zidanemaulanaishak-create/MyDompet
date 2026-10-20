// @@iconify-code-gen
import React from 'react';
import { Image } from 'expo-image';
import { View, StatusBar } from 'react-native';
import { Redirect, Slot, usePathname, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '@/components/ui/BottomNav';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { SettingsProvider } from '@/context/settings-context';
import { TransactionProvider } from '@/context/transaction-context';
import { BudgetProvider } from '@/context/budget-context';
import { GoalProvider } from '@/context/goal-context';
import { getThemeColors } from '@/constants/colors';
import '../global.css';

const PUBLIC_ROUTES: string[] = ['/welcome', '/login', '/register', '/verify', '/auth-callback'];

const HIDE_NAV_ROUTES: string[] = ['/add-transaction', '/upload', '/scan', '/reports', '/welcome', '/login', '/register', '/verify', '/ai-assistant', '/weekly', '/goals', '/onboarding/step-1', '/onboarding/step-2', '/auth-callback'];

const BLUE_HEADER_ROUTES: string[] = ['/welcome', '/login', '/register', '/ai-assistant', '/upload', '/scan', '/weekly', '/goals'];

function BootSplash() {
  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 132, height: 132 }}
        contentFit="contain"
      />
    </View>
  );
}

function RootNavigator() {
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const { user, isReady, onboarding, onboardingReady } = useAuth();
  const { isDark } = useTheme();
  const palette = getThemeColors(isDark ? 'dark' : 'light');

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
  const statusBg = plainChrome ? chromeBg : '#1A42BA';
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
        <Slot />
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
            <TransactionProvider>
              <BudgetProvider>
                <GoalProvider>
                  <RootNavigator />
                </GoalProvider>
              </BudgetProvider>
            </TransactionProvider>
          </AuthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

