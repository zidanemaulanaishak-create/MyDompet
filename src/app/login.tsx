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
import { isEmailValid, useAuth } from "@/context/auth-context";
import type { SocialProvider } from "@/services/socialAuth";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { signIn, signInWithProvider } = useAuth();

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
        ? "Email wajib diisi."
        : !isEmailValid(email)
          ? "Format email tidak valid."
          : undefined,
      password: !password ? "Password wajib diisi." : undefined,
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
    Alert.alert("Reset Password", "Fitur lupa password akan segera hadir.");
  };

  const handleSocial = async (provider: SocialProvider) => {
    setLoadingProvider(provider);
    try {
      const errorMsg = await signInWithProvider(provider);
      if (errorMsg) {
        Alert.alert("Gagal masuk", errorMsg);
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
        title="Let's get you Login!"
        subtitle="Hi! Welcome back, you've been missed"
        showLogo
      />

      <ScrollView
        className="flex-1 bg-white px-6 pt-8"
        style={{
          borderTopLeftRadius: 44,
          borderTopRightRadius: 44,
          marginTop: -36,
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthField
          label="Email"
          value={email}
          onChangeText={(v) => update("email", v)}
          placeholder="example@gmail.com"
          icon="ph:envelope-simple"
          keyboardType="email-address"
          error={errors.email}
        />

        <AuthField
          label="Password"
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
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-7">
          <PrimaryButton label="Sign In" onPress={handleSignIn} />
        </View>

        <OrDivider text="Or sign in with" />

        <SocialButtons onPress={handleSocial} loadingProvider={loadingProvider} />

        <View className="flex-row justify-center items-center mt-7">
          <Text className="text-[#8A8D9F] text-lg">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/register">
            <Text className="text-orange text-lg font-bold">Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
