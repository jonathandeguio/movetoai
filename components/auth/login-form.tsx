"use client";

import type { Route } from "next";
import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileField } from "@/components/anti-bot/TurnstileField";
import { AuthButton } from "@/components/auth/AuthButton";
import { LoginTransition } from "@/components/auth/LoginTransition";
import { HoneypotField } from "@/components/auth/HoneypotField";
import { useAuthState } from "@/hooks/useAuthState";
import { useFormTiming } from "@/hooks/useFormTiming";
import type { AuthMessages } from "@/lib/i18n/auth-messages";

type LoginFormProps = {
  messages: AuthMessages;
};

const SITE_KEY = ""; // Disabled for self-hosted
const MIN_SUBMIT_MS = 1500; // minimum time before submission (bot detection)

export function LoginForm({ messages }: LoginFormProps) {
  const { state, setStatus, setError, reset } = useAuthState();
  const { getElapsed } = useFormTiming();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const schema = z.object({
    email: z
      .string()
      .min(1, messages.common.validation.required)
      .email(messages.common.validation.email),
    password: z
      .string()
      .min(8, messages.common.validation.minPassword)
  });

  type LoginValues = z.infer<typeof schema>;

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const handleToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const onSubmit = async (values: LoginValues) => {
    // Honeypot check — if filled, silently reject
    if (honeypot) return;

    // Timing check — reject submissions that arrive impossibly fast
    if (getElapsed() < MIN_SUBMIT_MS) return;

    if (SITE_KEY && !turnstileToken) return;

    reset();
    setStatus("loading");

    try {
      const requestedPath = searchParams.get("from");
      const callbackUrl =
        requestedPath && requestedPath.startsWith("/") ? requestedPath : "/app";

      setStatus("verifying");
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        turnstileToken,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError(messages.auth.login.invalidCredentials);
        setTurnstileToken("");
        return;
      }

      setStatus("success");
      setTimeout(() => {
        setStatus("redirecting");
        router.push(callbackUrl as Route);
        router.refresh();
      }, 800);
    } catch {
      setError(messages.auth.login.invalidCredentials);
    }
  };

  const isLoading = state.status === "loading" || state.status === "verifying" || state.status === "redirecting";
  const isSubmitDisabled = isLoading || (SITE_KEY !== "" && !turnstileToken);

  return (
    <>
      <LoginTransition show={state.status === "redirecting"} />

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Honeypot — invisible to real users */}
        <HoneypotField name="website" />
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          aria-hidden="true"
          tabIndex={-1}
          style={{ display: "none" }}
        />

        <div className="space-y-2">
          <Label htmlFor="email">{messages.forms.email}</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-[--red]">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{messages.forms.password}</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-[--red]">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        {SITE_KEY ? (
          <TurnstileField
            siteKey={SITE_KEY}
            onToken={handleToken}
            appearance="managed"
          />
        ) : null}

        <AuthButton
          status={state.status}
          disabled={isSubmitDisabled}
          labelIdle={messages.auth.login.submit}
          labelLoading={`${messages.auth.login.submit}…`}
          labelSuccess="Connecté !"
        />

        {state.errorMessage ? (
          <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
            {state.errorMessage}
          </p>
        ) : null}
      </form>
    </>
  );
}
