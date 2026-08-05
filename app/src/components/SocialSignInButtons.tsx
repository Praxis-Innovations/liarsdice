import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeProvider";

/** Google's official multi-color "G" logomark, required by Google's sign-in button branding guidelines. */
function GoogleGlyph() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.92 7.52 2.56 10.78z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, radii } = useTheme();
  return (
    <TouchableOpacity
      style={{
        width: 52,
        height: 52,
        borderRadius: radii.md,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
    </TouchableOpacity>
  );
}

export interface SocialSignInButtonsProps {
  onError: (message: string) => void;
}

/**
 * Google is shown on every platform. Apple is offered on iOS (native SDK) and web (Supabase
 * OAuth redirect); there is no native Apple sign-in experience on Android, so it's hidden there.
 */
export default function SocialSignInButtons({ onError }: SocialSignInButtonsProps) {
  const { colors } = useTheme();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const busy = googleLoading || appleLoading;
  const appleAvailable = Platform.OS === "ios" || Platform.OS === "web";

  const handleGoogle = async () => {
    if (busy) return;
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) onError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleApple = async () => {
    if (busy) return;
    setAppleLoading(true);
    try {
      const { error } = await signInWithApple();
      if (error) onError(error);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {appleAvailable ? (
        <SocialButton
          icon={<Ionicons name="logo-apple" size={22} color={colors.textPrimary} />}
          label="Sign in with Apple"
          onPress={() => void handleApple()}
          disabled={busy}
        />
      ) : null}
      <SocialButton icon={<GoogleGlyph />} label="Sign in with Google" onPress={() => void handleGoogle()} disabled={busy} />
    </View>
  );
}
