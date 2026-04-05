import type { Route } from "next";
import Link from "next/link";

import { MoveToAiLogo } from "@/components/brand/move-to-ai-logo";
import { getMarketingSiteContent } from "@/lib/marketing-site";
import { getRequestLocale } from "@/lib/i18n/server";

export async function SiteFooter() {
  const locale = await getRequestLocale();
  const content = getMarketingSiteContent(locale);

  return (
    <footer className="border-t border-border/80 bg-white">
      <div className="page-shell grid gap-10 py-12 lg:grid-cols-[1.2fr_1.8fr]">
        <div className="space-y-4">
          <MoveToAiLogo className="inline-flex" />
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            {content.footer.description}
          </p>
          <p className="text-xs leading-6 text-slate-500">{content.shared.footerNote}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {content.footer.sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <p className="text-sm font-semibold text-slate-950">{section.title}</p>
              <div className="flex flex-col gap-3 text-sm text-slate-600">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href as Route}
                    className="transition hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
