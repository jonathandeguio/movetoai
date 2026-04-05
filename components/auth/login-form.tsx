"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthMessages } from "@/lib/i18n/auth-messages";

type LoginFormProps = {
  messages: AuthMessages;
};

export function LoginForm({ messages }: LoginFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
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
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (values: LoginValues) => {
    startTransition(() => {
      void (async () => {
        setErrorMessage("");
        const requestedPath = searchParams.get("from");
        const callbackUrl =
          requestedPath && requestedPath.startsWith("/") ? requestedPath : "/app";

        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl
        });

        if (result?.error) {
          setErrorMessage(messages.auth.login.invalidCredentials);
          return;
        }

        router.push(callbackUrl as Route);
        router.refresh();
      })();
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {messages.auth.login.submit}
      </Button>
      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
