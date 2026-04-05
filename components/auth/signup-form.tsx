"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { locales } from "@/lib/i18n/config";
import type { AuthMessages } from "@/lib/i18n/auth-messages";

type SignupFormProps = {
  defaultLocale: (typeof locales)[number];
  messages: AuthMessages;
};

export function SignupForm({ defaultLocale, messages }: SignupFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const schema = z.object({
    name: z.string().min(2, messages.common.validation.minName),
    email: z
      .string()
      .min(1, messages.common.validation.required)
      .email(messages.common.validation.email),
    password: z.string().min(8, messages.common.validation.minPassword),
    preferredLocale: z.enum(locales)
  });

  type SignupValues = z.infer<typeof schema>;

  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      preferredLocale: defaultLocale
    }
  });

  const getErrorMessage = (code?: string) => {
    if (code === "EMAIL_TAKEN") {
      return messages.auth.signup.emailTaken;
    }

    return messages.auth.signup.unexpectedError;
  };

  const onSubmit = (values: SignupValues) => {
    startTransition(() => {
      void (async () => {
        setErrorMessage("");

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        });
        const payload = (await response.json().catch(() => null)) as
          | { code?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(getErrorMessage(payload?.code));
          return;
        }

        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/app"
        });

        if (result?.error) {
          setErrorMessage(messages.auth.signup.unexpectedError);
          return;
        }

        router.push("/app" as Route);
        router.refresh();
      })();
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">{messages.forms.name}</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-rose-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{messages.forms.email}</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-rose-600">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{messages.forms.password}</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-rose-600">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredLocale">{messages.forms.preferredLanguage}</Label>
        <select
          id="preferredLocale"
          {...form.register("preferredLocale")}
          className="flex h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary/30"
        >
          {locales.map((value) => (
            <option key={value} value={value}>
              {messages.common.languages[value]}
            </option>
          ))}
        </select>
      </div>
      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {messages.auth.signup.submit}
      </Button>
      <p className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary-deep">
        {messages.auth.signup.workspaceNote}
      </p>
      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
