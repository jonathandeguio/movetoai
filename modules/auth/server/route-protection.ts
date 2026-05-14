export function getRouteProtectionRedirect(pathname: string, isAuthenticated: boolean) {
  const isAppRoute = pathname.startsWith("/app");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!isAppRoute && !isOnboardingRoute && !isAdminRoute && !isAuthPage) {
    return null;
  }

  if ((isAppRoute || isOnboardingRoute || isAdminRoute) && !isAuthenticated) {
    return `/login?from=${encodeURIComponent(pathname)}`;
  }

  return null;
}
