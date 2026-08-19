// Password reset via magic link is not yet supported with Nakama. This route redirects to sign-in.
import { Redirect } from "expo-router";

export default function ResetPasswordScreen() {
  return <Redirect href="/sign-in" />;
}
