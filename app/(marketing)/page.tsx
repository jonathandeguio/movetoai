import { MarketingHomepage } from "@/components/marketing/marketing-homepage";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMarketingSiteContent } from "@/lib/marketing-site";

export default async function LandingPage() {
  const locale = await getRequestLocale();
  const content = getMarketingSiteContent(locale);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <MarketingHomepage content={content} />
      {/*
      <section className="page-shell grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge>{messages.marketing.hero.eyebrow}</Badge>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 text-balance md:text-6xl">
              {messages.marketing.hero.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              {messages.marketing.hero.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                {messages.common.ctas.startFree}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/request-demo">{messages.common.ctas.requestDemo}</Link>
            </Button>
          </div>

          <div className="grid gap-3">
            {messages.marketing.hero.bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="rounded-full bg-primary/10 p-1 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-primary/10 bg-white shadow-soft">
          <CardContent className="grid gap-4 p-7">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-300">{messages.marketing.value.title}</p>
              <p className="mt-2 text-4xl font-semibold">Free → Pro → Enterprise</p>
              <p className="mt-2 text-sm text-slate-300">
                {messages.marketing.plans.subtitle}
              </p>
            </div>
            {messages.marketing.proof.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/80 p-5">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{stat.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {messages.marketing.value.items.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{messages.marketing.highlights.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {messages.marketing.highlights.items.map((item) => (
                <div key={item} className="rounded-2xl border border-border/80 p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{messages.marketing.plans.title}</CardTitle>
              <CardDescription>{messages.marketing.plans.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {messages.pricing.plans.map((plan) => (
                <div
                  key={plan.key}
                  className="flex items-center justify-between rounded-2xl border border-border/80 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{plan.name}</p>
                    <p className="text-sm text-slate-600">{plan.description}</p>
                  </div>
                  {plan.key === "pro" ? (
                    <Badge>{messages.common.labels.recommended}</Badge>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="page-shell py-6">
        <Card className="overflow-hidden border-primary/10 bg-slate-950 text-white">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {messages.marketing.repeatCta.title}
              </div>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                {messages.marketing.repeatCta.subtitle}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button size="lg" asChild>
                <Link href="/signup">{messages.common.ctas.startFree}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">{messages.common.ctas.comparePlans}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="page-shell py-20">
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge>{messages.marketing.faq.title}</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {messages.marketing.faq.items.map((item) => (
              <Card key={item.question}>
                <CardHeader>
                  <CardTitle className="text-base">{item.question}</CardTitle>
                  <CardDescription>{item.answer}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
      */}
      <SiteFooter />
    </main>
  );
}
