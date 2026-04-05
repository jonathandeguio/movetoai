"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { locales } from "@/lib/i18n/config";
import { useLocaleContext } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OnboardingFormProps = {
  defaultLocale: (typeof locales)[number];
};

export function OnboardingForm({ defaultLocale }: OnboardingFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { messages } = useLocaleContext();

  const schema = z.object({
    preferredLocale: z.enum(locales),
    companyName: z.string().min(2, messages.common.validation.minCompany),
    workspaceName: z.string().min(2, messages.common.validation.minWorkspace)
  });

  type OnboardingValues = z.infer<typeof schema>;

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredLocale: defaultLocale,
      companyName: "",
      workspaceName: ""
    }
  });

  const getErrorMessage = (code?: string) => {
    if (code === "ALREADY_ONBOARDED") {
      return messages.onboarding.errors.alreadyOnboarded;
    }

    return messages.onboarding.errors.unexpected;
  };

  const onSubmit = (values: OnboardingValues) => {
    startTransition(() => {
      void (async () => {
        setErrorMessage("");

        const response = await fetch("/api/onboarding", {
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

        router.push("/app");
        router.refresh();
      })();
    });
  };

  return (
    <Card className="border-primary/10 shadow-soft">
      <CardContent className="space-y-6 p-8">
        <p className="text-sm leading-6 text-slate-600">{messages.onboarding.formIntro}</p>

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
          <div className="space-y-2">
            <Label htmlFor="companyName">{messages.forms.company}</Label>
            <Input id="companyName" {...form.register("companyName")} />
            {form.formState.errors.companyName ? (
              <p className="text-sm text-rose-600">
                {form.formState.errors.companyName.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspaceName">{messages.forms.workspaceName}</Label>
            <Input id="workspaceName" {...form.register("workspaceName")} />
            <p className="text-sm text-slate-500">{messages.onboarding.createHint}</p>
            {form.formState.errors.workspaceName ? (
              <p className="text-sm text-rose-600">
                {form.formState.errors.workspaceName.message}
              </p>
            ) : null}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={isPending}>
            {messages.onboarding.submitCreate}
          </Button>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
