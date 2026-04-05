"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLocaleContext } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RequestDemoForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { messages } = useLocaleContext();

  const schema = z.object({
    name: z.string().min(2, messages.common.validation.minName),
    company: z.string().min(2, messages.common.validation.minCompany),
    email: z
      .string()
      .min(1, messages.common.validation.required)
      .email(messages.common.validation.email),
    role: z.string().min(2, messages.common.validation.required),
    message: z.string().min(8, messages.common.validation.minMessage)
  });

  type DemoValues = z.infer<typeof schema>;

  const form = useForm<DemoValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      role: "",
      message: ""
    }
  });

  const onSubmit = () => {
    startTransition(() => {
      setSuccessMessage(messages.requestDemo.success);
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{messages.forms.name}</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-sm text-rose-600">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{messages.forms.company}</Label>
          <Input id="company" {...form.register("company")} />
          {form.formState.errors.company ? (
            <p className="text-sm text-rose-600">
              {form.formState.errors.company.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
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
          <Label htmlFor="role">{messages.forms.role}</Label>
          <Input id="role" {...form.register("role")} />
          {form.formState.errors.role ? (
            <p className="text-sm text-rose-600">{form.formState.errors.role.message}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{messages.forms.message}</Label>
        <Textarea id="message" {...form.register("message")} />
        {form.formState.errors.message ? (
          <p className="text-sm text-rose-600">{form.formState.errors.message.message}</p>
        ) : null}
      </div>
      <Button size="lg" type="submit" disabled={isPending}>
        {messages.common.ctas.requestDemo}
      </Button>
      {successMessage ? (
        <p className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary-deep">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
