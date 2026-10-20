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
import { Link, useRouter } from "expo-router";
import { Iconify } from "react-native-iconify";
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

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithProvider } = useAuth();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? "dark" : "light");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [termsError, setTermsError] = useState<string | undefined>(undefined);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/welcome");
    }
  };

  const update = (key: keyof RegisterErrors, value: string) => {
    if (key === "name") setName(value);
    if (key === "email") setEmail(value);
    if (key === "password") setPassword(value);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setTermsError(undefined);
  };

  const handleSignUp = async () => {
    const next: RegisterErrors = {
      name: name.trim().length < 3 ? t("auth.errNameMin") : undefined,
      email: !email.trim()
        ? t("auth.errEmailRequired")
        : !isEmailValid(email)
          ? t("auth.errEmailInvalid")
          : undefined,
      password: !password
        ? t("auth.errPasswordRequired")
        : password.length < 8
          ? t("auth.errPasswordMin")
          : undefined,
    };

    const nextTermsError = !agreed ? t("auth.errTermsRequired") : undefined;

    setErrors(next);
    setTermsError(nextTermsError);
    if (Object.values(next).some(Boolean) || nextTermsError) return;

    const errorMsg = await signUp(
      name.trim(),
      email.trim().toLowerCase(),
      password,
    );
    if (errorMsg) {
      setErrors({ email: errorMsg });
      return;
    }
    // Redirect di-handle oleh auth guard di _layout.tsx
  };

  const handleSocial = async (provider: SocialProvider) => {
    if (!agreed) {
      setTermsError(t("auth.errTermsRequired"));
      Alert.alert(t("auth.termsAlertTitle"), t("auth.termsAlertMsg"));
      return;
    }
    setLoadingProvider(provider);
    try {
      const errorMsg = await signInWithProvider(provider);
      if (errorMsg) {
        Alert.alert(t("auth.errSignUpFailed"), errorMsg);
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
        title={t("auth.registerHeaderTitle")}
        subtitle={t("auth.registerHeaderSub")}
        onBack={goBack}
      />

      <ScrollView
        className="flex-1 px-6 pt-6"
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
          label={t("auth.name")}
          value={name}
          onChangeText={(v) => update("name", v)}
          placeholder={t("auth.namePlaceholder")}
          icon="ph:user"
          autoCapitalize="words"
          error={errors.name}
        />

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

        <TouchableOpacity
          className="flex-row items-center mt-2"
          activeOpacity={0.8}
          onPress={() => {
            setAgreed((v) => !v);
            setTermsError(undefined);
          }}
        >
          <View
            className={`w-5 h-5 rounded-lg items-center justify-center ${
              agreed ? "bg-primary border border-primary" : "border"
            }`}
            style={
              agreed
                ? undefined
                : { backgroundColor: palette.divider, borderColor: palette.border }
            }
          >
            {agreed ? (
              <Iconify icon="ph:check-bold" size={13} color="#FFFFFF" />
            ) : null}
          </View>
          <Text className="ml-2.5 text-lg" style={{ color: palette.textMuted }}>
            {t("auth.agreeWith")}{" "}
            <Text className="font-bold text-orange">Terms & Condition</Text>
          </Text>
        </TouchableOpacity>
        {termsError ? (
          <Text className="ml-1 mt-1.5 text-lg" style={{ color: palette.red }}>
            {termsError}
          </Text>
        ) : null}

        <View className="mt-8">
          <PrimaryButton label={t("auth.registerTitle")} onPress={handleSignUp} />
        </View>

        <OrDivider text={t("auth.orSignUpWith")} />

        <SocialButtons onPress={handleSocial} loadingProvider={loadingProvider} />

        <View className="flex-row justify-center items-center mt-7">
          <Text className="text-lg" style={{ color: palette.textMuted }}>
            {t("auth.alreadyHaveAccount")}{" "}
          </Text>
          <Link href="/login">
            <Text className="text-orange text-lg font-bold">{t("auth.loginTitle")}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
