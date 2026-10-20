import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Iconify } from "react-native-iconify";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useTransactions } from "@/context/transaction-context";
import { getThemeColors } from "@/constants/colors";
import { useI18n, numberForLocale } from "@/i18n";
import { useSettings } from "@/context/settings-context";
import FinanceProfileSheet from "@/components/profile/FinanceProfileSheet";
import LanguageSheet from "@/components/profile/LanguageSheet";
import EditProfileSheet from "@/components/profile/EditProfileSheet";

const SECTION_ACCENT = "#64748B";
const HEADER_SUBTEXT = "#E2E8F0";
const DIVIDER = "#F1F5F9";
const DIVIDER_DARK = "#1E2A42";
const BORDER = "#E2E8F0";
const BORDER_DARK = "#23314D";
const CHEVRON_BG = "#EDF1F7";
const CHEVRON_BG_DARK = "#172B4D";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatMoney(value: number, locale: string) {
  return numberForLocale(locale as 'id' | 'en', value);
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  tone: "income" | "expense";
  palette: ReturnType<typeof getThemeColors>;
  isDark: boolean;
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
  palette,
  isDark,
}: SummaryCardProps) {
  const isIncome = tone === "income";
  const toneColor = isIncome ? palette.green : palette.red;
  const chipBg = isIncome
    ? isDark
      ? "rgba(16,185,129,0.18)"
      : "#E6FEEF"
    : isDark
      ? "rgba(239,68,68,0.18)"
      : "#FEE2E2";

  return (
    <View className="flex-1 flex-row items-center px-4 py-4 gap-3">
      <View style={[styles.summaryIcon, { backgroundColor: chipBg }]}>
        <Iconify icon={icon} size={24} color={toneColor} />
      </View>
      <View className="flex-1">
        <Text
          className="text-lg font-semibold leading-snug"
          style={{ color: palette.textMuted }}
        >
          {label}
        </Text>
        <Text
          className="text-lg font-extrabold mt-1"
          style={{ color: toneColor }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

interface MenuRowProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  palette: ReturnType<typeof getThemeColors>;
  isDark: boolean;
  last?: boolean;
}

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  danger,
  loading,
  palette,
  isDark,
  last,
}: MenuRowProps) {
  const iconBg = danger
    ? isDark
      ? "rgba(248,113,113,0.16)"
      : "#FEE2E2"
    : isDark
      ? CHEVRON_BG_DARK
      : "#E8F0FE";
  const iconColor = danger ? palette.red : palette.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={onPress}
      disabled={!onPress || loading}
      className={`flex-row items-center px-4 py-4 ${last ? "" : "border-b"}`}
      style={{ borderBottomColor: isDark ? DIVIDER_DARK : DIVIDER }}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Iconify icon={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1 ml-3.5">
        <Text
          className="text-lg font-bold"
          style={{ color: danger ? palette.red : palette.textDark }}
        >
          {title}
        </Text>
        <Text className="text-lg mt-0.5" style={{ color: palette.textMuted }}>
          {subtitle}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={palette.red} />
      ) : (
        (trailing ?? (
          <View
            style={[
              styles.chevronBadge,
              { backgroundColor: isDark ? CHEVRON_BG_DARK : CHEVRON_BG },
            ]}
          >
            <Iconify
              icon="ph:caret-right-bold"
              size={14}
              color={palette.textMuted}
            />
          </View>
        ))
      )}
    </TouchableOpacity>
  );
}

function SectionTitle({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text
      className="text-lg font-bold tracking-wider uppercase mb-2.5 ml-2"
      style={{ color: isDark ? "#94A3B8" : SECTION_ACCENT }}
    >
      {title}
    </Text>
  );
}

const OCCUPATION_LABEL: Record<string, string> = {
  pekerja: "profile.occupationWorker",
  pelajar: "profile.occupationStudent",
  mahasiswa: "profile.occupationCollege",
};

export default function ProfileScreen() {
  const { user, onboarding, setOnboarding, signOut, updateName } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { transactions } = useTransactions();
  const { t, locale } = useI18n();
  const { language, setLanguage } = useSettings();
  const [loading, setLoading] = React.useState(false);
  const [showFinanceSheet, setShowFinanceSheet] = React.useState(false);
  const [showLanguageSheet, setShowLanguageSheet] = React.useState(false);
  const [showEditSheet, setShowEditSheet] = React.useState(false);

  const palette = getThemeColors(isDark ? "dark" : "light");

  const name = user?.name ?? "Danncow";
  const email = user?.email ?? "";

  const incomeSubtitle =
    (onboarding?.occupation
      ? t(OCCUPATION_LABEL[onboarding.occupation] ?? "—")
      : t("profile.notSet")) +
    (onboarding?.mainIncome
      ? ` · Rp ${formatMoney(onboarding.mainIncome, locale)}${t("profile.perMonth")}`
      : "");

  const summary = useMemo(() => {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (!tx.timestamp || tx.timestamp < start || tx.timestamp >= end)
        continue;
      const amt = tx.amountValue ?? 0;
      if (tx.type === "income") income += amt;
      else expense += amt;
    }
    return { income, expense };
  }, [transactions]);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  const comeSoon = (feature: string) => {
    Alert.alert(feature, t("profile.comingSoon"));
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 112,
        backgroundColor: palette.bg,
      }}
    >
      {/* Header gradient */}
      <LinearGradient
        colors={["#122E85", "#1A42BA", "#1A42BA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View className="absolute -top-14 -right-16 w-48 h-48 rounded-full bg-sky/20" />
        <View className="absolute top-32 -left-20 w-40 h-40 rounded-full bg-white/10" />
        <View className="absolute -bottom-10 right-10 w-28 h-28 rounded-full bg-white/5" />

        <View className="flex-row items-start justify-between">
          <View className="flex-1 pt-1">
            <Text className="text-white text-lg font-extrabold tracking-tight">
              {t("profile.title")}
            </Text>
            <Text className="text-[#C7CFFF] text-lg mt-1 font-medium">
              {t("profile.subtitle")}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowEditSheet(true)}
            style={styles.editButton}
          >
            <Iconify icon="ph:pencil-bold" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="items-center mt-7">
          <View
            className="w-[124px] h-[124px] rounded-full items-center justify-center border-2 border-white/25"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <View style={[styles.avatar, { backgroundColor: palette.card }]}>
              <Text style={[styles.avatarInitials, { color: palette.primary }]}>
                {initialsOf(name)}
              </Text>
            </View>
            <View
              style={[styles.statusDot, { backgroundColor: palette.green }]}
            />
          </View>
          <Text className="text-white text-2xl font-extrabold mt-4">
            {name}
          </Text>
          <Text
            className="text-lg mt-1.5 font-medium"
            style={{ color: HEADER_SUBTEXT }}
          >
            {email ? `${email} | ${name}` : name}
          </Text>
          <View className="mt-3.5 flex-row items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5">
            <Iconify icon="ph:shield-check-bold" size={14} color="#38BDF8" />
            <Text className="text-white/90 text-lg font-semibold">
              {t("profile.verified")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Kartu ringkasan melayang */}
      <View className="-mt-9 px-4">
        <View
          className="flex-row rounded-2xl"
          style={[
            styles.summaryCard,
            {
              backgroundColor: palette.card,
              borderColor: isDark ? BORDER_DARK : BORDER,
            },
          ]}
        >
          <SummaryCard
            label={t("profile.incomeToday")}
            value={`+Rp ${formatMoney(summary.income, locale)}`}
            icon="ph:arrow-down-left-bold"
            tone="income"
            palette={palette}
            isDark={isDark}
          />
          <View
            style={{
              width: StyleSheet.hairlineWidth * 2,
              backgroundColor: isDark ? BORDER_DARK : BORDER,
            }}
          />
          <SummaryCard
            label={t("profile.expenseToday")}
            value={`-Rp ${formatMoney(summary.expense, locale)}`}
            icon="ph:arrow-up-right-bold"
            tone="expense"
            palette={palette}
            isDark={isDark}
          />
        </View>
      </View>

      {/* Kelompok Keuangan */}
      <View className="px-4 mt-7">
        <SectionTitle title={t("profile.finance")} isDark={isDark} />
        <View
          style={[
            styles.group,
            {
              backgroundColor: palette.card,
              borderColor: isDark ? BORDER_DARK : BORDER,
            },
          ]}
        >
          <MenuRow
            icon="ph:wallet-bold"
            title={t("profile.financeProfile")}
            subtitle={incomeSubtitle}
            onPress={() => setShowFinanceSheet(true)}
            palette={palette}
            isDark={isDark}
            last
          />
        </View>
      </View>

      {/* Kelompok 1: Kelola Akun */}
      <View className="px-4 mt-7">
        <SectionTitle title={t("profile.manageAccount")} isDark={isDark} />
        <View
          style={[
            styles.group,
            {
              backgroundColor: palette.card,
              borderColor: isDark ? BORDER_DARK : BORDER,
            },
          ]}
        >
          <MenuRow
            icon="ph:gear-bold"
            title={t("profile.accountSettings")}
            subtitle={t("profile.accountSettingsSubtitle")}
            onPress={() => comeSoon(t("profile.accountSettings"))}
            palette={palette}
            isDark={isDark}
          />
          <MenuRow
            icon="ph:question-bold"
            title={t("profile.help")}
            subtitle={t("profile.helpSubtitle")}
            onPress={() => comeSoon(t("profile.help"))}
            palette={palette}
            isDark={isDark}
          />
          <MenuRow
            icon="ph:bell-bold"
            title={t("profile.notifications")}
            subtitle={t("profile.notificationsSubtitle")}
            onPress={() => comeSoon(t("profile.notifications"))}
            palette={palette}
            isDark={isDark}
            last
          />
        </View>
      </View>

      {/* Kelompok 2: Aksesibilitas */}
      <View className="px-4 mt-6">
        <SectionTitle title={t("profile.accessibility")} isDark={isDark} />
        <View
          style={[
            styles.group,
            {
              backgroundColor: palette.card,
              borderColor: isDark ? BORDER_DARK : BORDER,
            },
          ]}
        >
          <MenuRow
            icon="ph:moon-bold"
            title={t("profile.darkMode")}
            subtitle={t("profile.darkModeSubtitle")}
            palette={palette}
            isDark={isDark}
            trailing={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: isDark ? BORDER_DARK : BORDER,
                  true: "#1A42BA",
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? BORDER_DARK : BORDER}
              />
            }
          />
          <MenuRow
            icon="ph:globe-bold"
            title={t("profile.language")}
            subtitle={
              language === "id"
                ? t("profile.langIndonesian")
                : t("profile.langEnglish")
            }
            onPress={() => setShowLanguageSheet(true)}
            palette={palette}
            isDark={isDark}
            last
          />
        </View>
      </View>

      {/* Kelompok 3: Keluar */}
      <View className="px-4 mt-6">
        <View
          style={[
            styles.group,
            {
              backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "#FFF7F7",
              borderColor: isDark ? "rgba(248,113,113,0.3)" : "#FECACA",
            },
          ]}
        >
          <MenuRow
            icon="ph:sign-out-bold"
            title={t("profile.signOut")}
            subtitle={t("profile.signOutSubtitle")}
            onPress={handleSignOut}
            danger
            loading={loading}
            palette={palette}
            isDark={isDark}
            last
          />
        </View>
        <View className="flex-row items-center justify-center mt-6">
          <View
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: palette.primary }}
          />
          <Text className="text-lg ml-2" style={{ color: palette.textMuted }}>
            {t("profile.version")}
          </Text>
        </View>
      </View>

      <FinanceProfileSheet
        visible={showFinanceSheet}
        occupation={onboarding?.occupation ?? null}
        mainIncome={onboarding?.mainIncome ?? 0}
        onClose={() => setShowFinanceSheet(false)}
        onSubmit={async (data) => {
          await setOnboarding(data);
          setShowFinanceSheet(false);
        }}
      />

      <LanguageSheet
        visible={showLanguageSheet}
        current={language}
        onClose={() => setShowLanguageSheet(false)}
        onSelect={(lang) => {
          void setLanguage(lang);
          setShowLanguageSheet(false);
        }}
      />

      <EditProfileSheet
        visible={showEditSheet}
        name={name}
        email={email}
        onClose={() => setShowEditSheet(false)}
        onSubmit={(nextName) => updateName(nextName)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 66,
    overflow: "hidden",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  avatarInitials: {
    fontSize: 34,
    fontWeight: "800",
  },
  statusDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  summaryCard: {
    borderWidth: 1,
    shadowColor: "#1A2E5A",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  group: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#1A2E5A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
