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
import { isEmailValid, useAuth } from "@/context/auth-context";
import type { SocialProvider } from "@/services/socialAuth";

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithProvider } = useAuth();

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
      name: name.trim().length < 3 ? "Nama minimal 3 karakter." : undefined,
      email: !email.trim()
        ? "Email wajib diisi."
        : !isEmailValid(email)
          ? "Format email tidak valid."
          : undefined,
      password: !password
        ? "Password wajib diisi."
        : password.length < 8
          ? "Password minimal 8 karakter."
          : undefined,
    };

    const nextTermsError = !agreed
      ? "Anda harus menyetujui Terms & Condition."
      : undefined;

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
      setTermsError("Anda harus menyetujui Terms & Condition.");
      Alert.alert(
        "Syarat belum disetujui",
        "Setujui Terms & Condition terlebih dahulu untuk mendaftar."
      );
      return;
    }
    setLoadingProvider(provider);
    try {
      const errorMsg = await signInWithProvider(provider);
      if (errorMsg) {
        Alert.alert("Gagal mendaftar", errorMsg);
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
        title="Create Account"
        subtitle="Fill your information below or register with your social account."
        onBack={goBack}
      />

      <ScrollView
        className="flex-1 bg-white px-6 pt-6"
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
          label="Name"
          value={name}
          onChangeText={(v) => update("name", v)}
          placeholder="John Doe"
          icon="ph:user"
          autoCapitalize="words"
          error={errors.name}
        />

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
              agreed
                ? "bg-primary border border-primary"
                : "bg-[#EAECEF] border border-[#D8DBE0]"
            }`}
          >
            {agreed ? (
              <Iconify icon="ph:check-bold" size={13} color="#FFFFFF" />
            ) : null}
          </View>
          <Text className="ml-2.5 text-lg text-[#4B4F59]">
            Agree with{" "}
            <Text className="font-bold text-orange">Terms & Condition</Text>
          </Text>
        </TouchableOpacity>
        {termsError ? (
          <Text className="ml-1 mt-1.5 text-lg text-[#EF4444]">
            {termsError}
          </Text>
        ) : null}

        <View className="mt-8">
          <PrimaryButton label="Sign Up" onPress={handleSignUp} />
        </View>

        <OrDivider text="Or sign up with" />

        <SocialButtons onPress={handleSocial} loadingProvider={loadingProvider} />

        <View className="flex-row justify-center items-center mt-7">
          <Text className="text-[#8A8D9F] text-lg">
            Already have an account?{" "}
          </Text>
          <Link href="/login">
            <Text className="text-orange text-lg font-bold">Sign In</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
