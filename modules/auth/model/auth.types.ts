export type AuthSessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  locale: "en" | "fr" | "es";
};

export type AuthSessionContext = {
  user: AuthSessionUser | null;
  isAuthenticated: boolean;
};
