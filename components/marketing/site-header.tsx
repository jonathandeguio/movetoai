import type { Route } from "next";
import Link from "next/link";

import { MoveToAiLogo } from "@/components/brand/move-to-ai-logo";
import { Button } from "@/components/ui/button";
import { getMarketingSiteContent } from "@/lib/marketing-site";
import { marketingNavigation } from "@/lib/navigation";
import { getRequestLocale } from "@/lib/i18n/server";

export async function SiteHeader() {
  const locale = await getRequestLocale();
  const content = getMarketingSiteContent(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between gap-6">
        <MoveToAiLogo className="shrink-0" />
        <nav className="hidden items-center gap-5 xl:flex">
          {marketingNavigation.map((item) => (
            <Link
              key={item.key}
              href={item.href as Route}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              {content.navigation[item.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href={"/login" as Route}>{content.shared.login}</Link>
          </Button>
          <Button asChild>
            <Link href={"/signup" as Route}>{content.shared.primaryCta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
