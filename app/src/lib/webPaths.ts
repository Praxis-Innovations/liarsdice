function getOrigin(): string {
  return typeof window !== "undefined" && window.location ? window.location.origin : "";
}

/** Redirect target for the web Google/Apple OAuth fallback (browser redirect flow). */
export function getOAuthRedirectUrl(): string {
  return getOrigin() || "/";
}

export function getResetPasswordRedirectUrl(): string {
  return `${getOrigin()}/reset-password`;
}
