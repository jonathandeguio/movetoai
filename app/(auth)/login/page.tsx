import { Suspense } from "react";
import Link from "next/link";

import { LoginForm }   from "@/components/auth/login-form";
import { LogoutToast } from "@/components/auth/LogoutToast";
import { getAuthMessages }    from "@/lib/i18n/auth-messages";
import { getRequestLocale }   from "@/lib/i18n/server";

export default async function LoginPage() {
  const locale   = await getRequestLocale();
  const messages = getAuthMessages(locale);

  return (
    <main
      style={{
        minHeight:       "100vh",
        background:      "var(--bg-primary)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "2rem 1rem",
      }}
    >
      <Suspense>
        <LogoutToast />
      </Suspense>

      <div
        style={{
          width:        "100%",
          maxWidth:     "420px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "24px",
              fontWeight:    800,
              color:         "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            move<span style={{ color: "var(--green)" }}>.</span>ai
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background:   "var(--bg-secondary)",
            border:       "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding:      "2rem",
          }}
        >
          <h1
            style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "22px",
              fontWeight:    700,
              letterSpacing: "-0.02em",
              color:         "var(--text-primary)",
              marginBottom:  "0.25rem",
            }}
          >
            {messages.auth.login.title}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
            {messages.auth.login.subtitle}
          </p>

          <LoginForm messages={messages} />

          <p
            style={{
              marginTop:  "1.25rem",
              textAlign:  "center",
              fontSize:   "12px",
              color:      "var(--text-muted)",
            }}
          >
            {messages.auth.login.footer}{" "}
            <Link
              href="/signup"
              style={{ color: "var(--green)", fontWeight: 500 }}
            >
              {messages.common.ctas.startFree}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
