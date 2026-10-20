import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import BlueHeader from "@/components/auth/BlueHeader";
import AuthField from "@/components/auth/AuthField";
import SocialButtons from "@/components/auth/SocialButtons";
import OrDivider from "@/components/auth/OrDivider";
import PrimaryButton from "@/components/auth/PrimaryButton";
import { getThemeColors } from "@/constants/colors";
import { useTheme } from "@/context/theme-context";
import { isEmailValid, useAuth } from "@/context/auth-context";
import type { SocialProvider } from "@/services/socialAuth";
import { useI18n } from "@/i18n";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { signIn, signInWithProvider } = useAuth();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? "dark" : "light");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const update = (key: keyof LoginErrors, value: string) => {
    if (key === "email") setEmail(value);
    if (key === "password") setPassword(value);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSignIn = async () => {
    const next: LoginErrors = {
      email: !email.trim()
        ? t("auth.errEmailRequired")
        : !isEmailValid(email)
          ? t("auth.errEmailInvalid")
          : undefined,
      password: !password ? t("auth.errPasswordRequired") : undefined,
    };

    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const errorMsg = await signIn(email.trim().toLowerCase(), password);
    if (errorMsg) {
      setErrors({ password: errorMsg });
      return;
    }
    // Redirect di-handle oleh auth guard di _layout.tsx
  };

  const handleForgot = () => {
    Alert.alert(t("auth.forgotAlertTitle"), t("auth.forgotAlertMsg"));
  };

  const handleSocial = async (provider: SocialProvider) => {
    setLoadingProvider(provider);
    try {
      const errorMsg = await signInWithProvider(provider);
      if (errorMsg) {
        Alert.alert(t("auth.errLoginFailed"), errorMsg);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BlueHeader
        title={t("auth.loginHeaderTitle")}
        subtitle={t("auth.loginHeaderSub")}
        showLogo
      />

      <ScrollView
        className="flex-1 px-6 pt-8"
        style={{
          backgroundColor: palette.card,
          borderTopLeftRadius: 44,
          borderTopRightRadius: 44,
          marginTop: -36,
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthField
          label={t("auth.email")}
          value={email}
          onChangeText={(v) => update("email", v)}
          placeholder={t("auth.emailPlaceholder")}
          icon="ph:envelope-simple"
          keyboardType="email-address"
          error={errors.email}
        />

        <AuthField
          label={t("auth.password")}
          value={password}
          onChangeText={(v) => update("password", v)}
          placeholder="••••••••"
          icon="ph:lock"
          secure
          error={errors.password}
        />

        <View className="flex-row justify-end mt-1">
          <TouchableOpacity activeOpacity={0.7} onPress={handleForgot}>
            <Text className="text-orange text-lg font-semibold">
              {t("auth.forgotPassword")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-7">
          <PrimaryButton label={t("auth.loginTitle")} onPress={handleSignIn} />
        </View>

        <OrDivider text={t("auth.orSignInWith")} />

        <SocialButtons onPress={handleSocial} loadingProvider={loadingProvider} />

        <View className="flex-row justify-center items-center mt-7">
          <Text className="text-lg" style={{ color: palette.textMuted }}>
            {t("auth.haveAccount")}{" "}
          </Text>
          <Link href="/register">
            <Text className="text-orange text-lg font-bold">{t("auth.registerTitle")}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
