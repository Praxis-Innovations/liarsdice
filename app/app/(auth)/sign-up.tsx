import { Link } from "expo-router";
import Head from "expo-router/head";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { AuthCard } from "../../src/components/auth/AuthCard";
import { TextField } from "../../src/components/ui/TextField";
import SocialSignInButtons from "../../src/components/SocialSignInButtons";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function SignUpScreen() {
  const { colors, spacing, typography } = useTheme();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: sign_up_error } = await signUp(email.trim(), password, displayName);
      if (sign_up_error) setError(sign_up_error);
      // On success, session state updates and the (auth) layout redirects to /home.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create account — Liar&apos;s Dice</title>
        <meta name="description" content="Create a free Liar's Dice account and start bluffing your way to victory." />
      </Head>
      <AuthCard title="Create account" subtitle="Free forever — no download, no card required.">
        {error ? (
          <Text style={{ color: colors.danger, fontFamily: typography.bodyMedium.fontFamily, fontSize: 14 }}>{error}</Text>
        ) : null}

        <TextField placeholder="Display name" autoCapitalize="words" value={displayName} onChangeText={setDisplayName} />
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
          autoComplete="password-new"
          value={password}
          onChangeText={setPassword}
        />

        <Button label="Create account" fullWidth loading={submitting} onPress={() => void handleSubmit()} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textSecondary, fontFamily: typography.caption.fontFamily, fontSize: 13 }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <SocialSignInButtons onError={setError} />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 14 }}>
            Already have an account?
          </Text>
          <Link href="/sign-in" style={{ color: colors.primary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 14 }}>
            Sign in
          </Link>
        </View>
      </AuthCard>
    </>
  );
}
