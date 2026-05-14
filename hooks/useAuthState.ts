"use client";

import { useState, useCallback } from "react";

export type AuthStatus =
  | "idle"
  | "loading"
  | "verifying"
  | "success"
  | "redirecting"
  | "error";

export interface AuthState {
  status: AuthStatus;
  errorMessage: string;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    status: "idle",
    errorMessage: "",
  });

  const setStatus = useCallback((status: AuthStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const setError = useCallback((errorMessage: string) => {
    setState({ status: "error", errorMessage });
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", errorMessage: "" });
  }, []);

  return { state, setStatus, setError, reset };
}
