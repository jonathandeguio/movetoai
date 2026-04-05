export function getRouteProtectionRedirect(pathname: string, isAuthenticated: boolean) {
  const isAppRoute = pathname.startsWith("/app");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!isAppRoute && !isOnboardingRoute && !isAuthPage) {
    return null;
  }

  if ((isAppRoute || isOnboardingRoute) && !isAuthenticated) {
    return `/login?from=${encodeURIComponent(pathname)}`;
  }

  return null;
}
