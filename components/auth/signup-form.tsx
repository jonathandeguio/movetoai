"use client";

import type { Route } from "next";
import { useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileField } from "@/components/anti-bot/TurnstileField";
import { HoneypotField } from "@/components/auth/HoneypotField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { WorkspaceSlugInput } from "@/components/auth/WorkspaceSlugInput";
import { useFormTiming } from "@/hooks/useFormTiming";
import { locales } from "@/lib/i18n/config";
import type { AuthMessages } from "@/lib/i18n/auth-messages";

type SignupFormProps = {
  defaultLocale: (typeof locales)[number];
  messages: AuthMessages;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const MIN_SUBMIT_MS = 2000;

export function SignupForm({ defaultLocale, messages }: SignupFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const { getElapsed } = useFormTiming();
  const router = useRouter();

  const USER_FUNCTIONS = ["transformation_manager", "enterprise_architect"] as const;

  const schema = z.object({
    name: z.string().min(2, messages.common.validation.minName),
    email: z
      .string()
      .min(1, messages.common.validation.required)
      .email(messages.common.validation.email),
    password: z.string().min(8, messages.common.validation.minPassword),
    preferredLocale: z.enum(locales),
    userFunction: z.enum(USER_FUNCTIONS).optional()
  });

  type SignupValues = z.infer<typeof schema>;

  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      preferredLocale: defaultLocale,
      userFunction: undefined
    }
  });

  const handleToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const getErrorMessage = (code?: string) => {
    if (code === "EMAIL_TAKEN") return messages.auth.signup.emailTaken;
    if (code === "RATE_LIMITED") return messages.auth.signup.unexpectedError;
    return messages.auth.signup.unexpectedError;
  };

  const onSubmit = async (values: SignupValues) => {
    if (honeypot) return;
    if (getElapsed() < MIN_SUBMIT_MS) return;
    if (SITE_KEY && !turnstileToken) return;

    setErrorMessage("");
    setIsPending(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken, workspaceSlug: workspaceSlug || undefined })
      });
      const payload = (await response.json().catch(() => null)) as
        | { code?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(getErrorMessage(payload?.code));
        setTurnstileToken("");
        return;
      }

      // Send OTP for email verification
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      // Sign in then redirect to OTP verification
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        turnstileToken,
        redirect: false,
        callbackUrl: "/app"
      });

      if (result?.error) {
        setErrorMessage(messages.auth.signup.unexpectedError);
        return;
      }

      // Redirect to OTP verification page
      router.push(`/verify?email=${encodeURIComponent(values.email)}` as Route);
    } catch {
      setErrorMessage(messages.auth.signup.unexpectedError);
    } finally {
      setIsPending(false);
    }
  };

  const isSubmitDisabled = isPending || (SITE_KEY !== "" && !turnstileToken);

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {/* Honeypot */}
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
        <Label htmlFor="name">{messages.forms.name}</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-[--red]">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
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
        <Input
          id="password"
          type="password"
          {...form.register("password", {
            onChange: (e) => setPasswordValue(e.target.value),
          })}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-[--red]">
            {form.formState.errors.password.message}
          </p>
        ) : null}
        <PasswordStrength password={passwordValue} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userFunction">{messages.forms.userFunctionLabel}</Label>
        <select
          id="userFunction"
          {...form.register("userFunction")}
          className="flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--border-focus]"
        >
          <option value="">{messages.forms.userFunctionPlaceholder}</option>
          {USER_FUNCTIONS.map((value) => (
            <option key={value} value={value}>
              {messages.forms.userFunctionOptions[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredLocale">{messages.forms.preferredLanguage}</Label>
        <select
          id="preferredLocale"
          {...form.register("preferredLocale")}
          className="flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-input] px-3 text-sm text-[--text-primary] shadow-sm outline-none transition focus:border-[--border-focus]"
        >
          {locales.map((value) => (
            <option key={value} value={value}>
              {messages.common.languages[value]}
            </option>
          ))}
        </select>
      </div>
      <WorkspaceSlugInput value={workspaceSlug} onChange={setWorkspaceSlug} />

      {SITE_KEY ? (
        <TurnstileField
          siteKey={SITE_KEY}
          onToken={handleToken}
          appearance="managed"
        />
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={isSubmitDisabled}>
        {isPending ? `${messages.auth.signup.submit}…` : messages.auth.signup.submit}
      </Button>
      <p className="rounded-xl border border-[--green-border] bg-[--green-dim] px-4 py-3 text-sm text-[--green]">
        {messages.auth.signup.workspaceNote}
      </p>
      {errorMessage ? (
        <p className="rounded-xl border border-[--red-dim] bg-[--red-dim] px-4 py-3 text-sm text-[--red]">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
