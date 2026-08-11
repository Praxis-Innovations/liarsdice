import { Link, type LinkProps } from "expo-router";
import React from "react";

type NavLinkProps = LinkProps & {
  /** Keep the large game chunk off the initial page load. */
  prefetchOnMount?: boolean;
};

/**
 * Warm a route's async chunk before the user selects it, avoiding the empty
 * production Suspense fallback during the first navigation.
 */
export function NavLink({ prefetchOnMount = true, ...props }: NavLinkProps) {
  return <Link {...props} prefetch={prefetchOnMount} />;
}
