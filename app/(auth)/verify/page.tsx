"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPInput } from "@/components/auth/OTPInput";

const RESEND_COOLDOWN = 60; // seconds

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [sending, setSending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = useCallback(async (submittedCode: string) => {
    if (submittedCode.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: submittedCode }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Code invalide.");
        setCode("");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/app"), 1500);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !loading && !success) {
      void handleVerify(code);
    }
  }, [code, loading, success, handleVerify]);

  async function handleResend() {
    if (cooldown > 0 || sending) return;
    setSending(true);
    setError(null);
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(RESEND_COOLDOWN);
      setCode("");
    } catch {
      setError("Impossible de renvoyer le code.");
    } finally {
      setSending(false);
    }
  }

  if (!email) {
    return (
      <p className="text-center text-sm text-[--text-muted]">
        Email manquant. <a href="/signup" className="text-[--blue] underline">Créer un compte</a>
      </p>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            move<span style={{ color: "var(--green)" }}>.</span>ai
          </span>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "2rem",
          }}
        >
          <div className="mb-6 text-center">
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Vérifiez votre email
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nous avons envoyé un code à{" "}
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                {email}
              </span>
            </p>
          </div>

          <div className="space-y-6">
            <OTPInput value={code} onChange={setCode} disabled={loading || success} />

            {error && (
              <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-center text-sm text-[--red]">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-[--green-border] bg-[--green-dim] px-4 py-3 text-center text-sm text-[--green]">
                ✓ Email vérifié ! Redirection…
              </p>
            )}

            {loading && !success && (
              <p className="text-center text-sm text-[--text-muted]">Vérification…</p>
            )}

            <div className="text-center">
              {cooldown > 0 ? (
                <p className="text-sm text-[--text-muted]">
                  Renvoyer le code dans{" "}
                  <span style={{ color: "var(--text-secondary)" }}>{cooldown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={sending}
                  className="text-sm text-[--blue] hover:underline disabled:opacity-50"
                >
                  {sending ? "Envoi…" : "Renvoyer le code"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
