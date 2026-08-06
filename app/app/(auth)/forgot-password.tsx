import { Link } from "expo-router";
import Head from "expo-router/head";
import React, { useState } from "react";
import { Text } from "react-native";
import { AuthCard } from "../../src/components/auth/AuthCard";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function ForgotPasswordScreen() {
  const { colors, typography } = useTheme();
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: reset_error } = await resetPasswordForEmail(email.trim());
      if (reset_error) setError(reset_error);
      else setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const head = (
    <Head>
      <title>Reset password — Liar&apos;s Dice</title>
      <meta name="description" content="Reset the password for your Liar's Dice account." />
    </Head>
  );

  if (sent) {
    return (
      <>
        {head}
        <AuthCard title="Check your email">
          <Text style={{ color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 15, lineHeight: 22 }}>
            We sent a password reset link to {email.trim()}.
          </Text>
          <Link href="/sign-in" style={{ color: colors.primary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 14 }}>
            Back to sign in
          </Link>
        </AuthCard>
      </>
    );
  }

  return (
    <>
      {head}
      <AuthCard title="Reset password" subtitle="Enter your email and we'll send you a reset link.">
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

        <Button label="Send reset link" fullWidth loading={submitting} onPress={() => void handleSubmit()} />

        <Link href="/sign-in" style={{ color: colors.primary, fontFamily: typography.bodySemibold.fontFamily, fontSize: 14 }}>
          Back to sign in
        </Link>
      </AuthCard>
    </>
  );
}
