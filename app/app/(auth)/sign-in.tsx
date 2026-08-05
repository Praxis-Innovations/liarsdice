import { Link } from "expo-router";
import Head from "expo-router/head";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { AuthCard } from "../../src/components/auth/AuthCard";
import { TextField } from "../../src/components/auth/TextField";
import SocialSignInButtons from "../../src/components/SocialSignInButtons";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function SignInScreen() {
  const { colors, spacing, typography } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: sign_in_error } = await signIn(email.trim(), password);
      if (sign_in_error) setError(sign_in_error);
      // On success, session state updates and the (auth) layout redirects to /home.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in — Liar&apos;s Dice</title>
        <meta name="description" content="Sign in to your Liar's Dice account and get back to the table." />
      </Head>
      <AuthCard title="Sign in" subtitle="Welcome back — pick up your last game.">
        {error ? (
          <Text style={{ color: colors.danger, fontFamily: typography.bodyMedium.fontFamily, fontSize: 14 }}>{error}</Text>
        ) : null}

        <TextField
          placeholder="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          placeholder="Password"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        <Button label="Sign in" fullWidth loading={submitting} onPress={() => void handleSubmit()} />

        <Link href="/forgot-password" style={{ color: colors.primary, fontFamily: typography.bodyMedium.fontFamily, fontSize: 14 }}>
          Forgot password?
        </Link>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <SocialSignInButtons onError={setError} />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>
            Don&apos;t have an account?
          </Text>
          <Link href="/sign-up" style={{ color: colors.primary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 14 }}>
            Create one
          </Link>
        </View>
      </AuthCard>
    </>
  );
}
