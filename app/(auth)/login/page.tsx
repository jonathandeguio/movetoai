import Link from "next/link";

import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthMessages } from "@/lib/i18n/auth-messages";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function LoginPage() {
  const locale = await getRequestLocale();
  const messages = getAuthMessages(locale);

  return (
    <main className="min-h-screen">
      <AuthHeader locale={locale} messages={messages} />
      <section className="page-shell grid gap-10 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-5">
          <Badge>{messages.auth.login.badge}</Badge>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 text-balance">
            {messages.auth.login.title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            {messages.auth.login.subtitle}
          </p>
        </div>
        <Card className="border-primary/10 shadow-soft">
          <CardContent className="p-8">
            <LoginForm messages={messages} />
            <p className="mt-6 text-center text-sm text-slate-500">
              {messages.auth.login.footer}{" "}
              <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
                {messages.common.ctas.startFree}
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
