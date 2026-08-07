// Landing screen for the link in the password-reset email. Supabase establishes a temporary
// session on arrival (PASSWORD_RECOVERY event, see AuthContext) which lets updateUser() set a
// new password without asking for the old one.
import { router } from "expo-router";
import Head from "expo-router/head";
import React, { useState } from "react";
import { Text } from "react-native";
import { AuthCard } from "../../src/components/auth/AuthCard";
import { TextField } from "../../src/components/ui/TextField";
import { Button } from "../../src/components/ui/Button";
import { supabase } from "../../src/lib/supabase";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function ResetPasswordScreen() {
  const { colors, typography } = useTheme();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting || !supabase) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { error: update_error } = await supabase.auth.updateUser({ password });
      if (update_error) setError(update_error.message);
      else setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const head = (
    <Head>
      <title>Set a new password — Liar&apos;s Dice</title>
      <meta name="description" content="Set a new password for your Liar's Dice account." />
    </Head>
  );

  if (done) {
    return (
      <>
        {head}
        <AuthCard title="Password updated">
          <Button label="Continue" fullWidth onPress={() => router.replace("/home")} />
        </AuthCard>
      </>
    );
  }

  return (
    <>
      {head}
      <AuthCard title="Set a new password">
        {error ? (
          <Text style={{ color: colors.danger, fontFamily: typography.bodyMedium.fontFamily, fontSize: 18 }}>{error}</Text>
        ) : null}

        <TextField placeholder="New password" secureTextEntry value={password} onChangeText={setPassword} />

        <Button label="Update password" fullWidth loading={submitting} onPress={() => void handleSubmit()} />
      </AuthCard>
    </>
  );
}
