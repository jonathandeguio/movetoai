"use client";

import { type AuthStatus } from "@/hooks/useAuthState";

interface AuthButtonProps {
  status: AuthStatus;
  disabled?: boolean;
  labelIdle: string;
  labelLoading?: string;
  labelSuccess?: string;
}

export function AuthButton({
  status,
  disabled,
  labelIdle,
  labelLoading = "Connexion…",
  labelSuccess = "Connecté !",
}: AuthButtonProps) {
  const isLoading = status === "loading" || status === "verifying" || status === "redirecting";
  const isSuccess = status === "success" || status === "redirecting";
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[--blue]/40"
      style={{
        background: isSuccess
          ? "var(--green)"
          : "var(--blue)",
        opacity: isDisabled && !isLoading ? 0.6 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {/* Shimmer overlay when loading */}
      {isLoading && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
          }}
        />
      )}

      <span className="relative flex items-center justify-center gap-2">
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-2a8 8 0 01-8-8z"
            />
          </svg>
        )}

        {isSuccess && !isLoading && (
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {isLoading
          ? labelLoading
          : isSuccess
          ? labelSuccess
          : labelIdle}
      </span>
    </button>
  );
}
