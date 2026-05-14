import type { Route } from "next";
import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Plateforme",
    links: [
      { label: "Produit",     href: "/product" },
      { label: "Tarifs",      href: "/pricing" },
      { label: "Partenaires", href: "/partners" },
      { label: "Blog",        href: "/blog" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Cas d'usage",         href: "/exemples" },
      { label: "Exemples par taille", href: "/exemples#taille" },
      { label: "Méthode",             href: "/methode" },
      { label: "Documentation",       href: "/docs" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos",         href: "/about" },
      { label: "Mentions légales", href: "/legal" },
      { label: "Politique RGPD",   href: "/privacy" },
      { label: "Contact",          href: "/contact" },
    ],
  },
];

export async function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 xl:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1.8fr]">
          {/* Brand */}
          <div className="space-y-4">
            <span
              className="font-syne text-2xl font-extrabold"
              style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "-0.02em" }}
            >
              move<span style={{ color: "rgba(110,231,183,0.25)" }}>.</span>ai
            </span>
            <p className="max-w-xs text-sm leading-7" style={{ color: "rgba(232,230,240,0.40)" }}>
              Plateforme SaaS B2B pour identifier, structurer et déployer vos projets
              d&apos;automatisation par l&apos;IA.
            </p>
            <p className="text-xs" style={{ color: "rgba(232,230,240,0.22)" }}>
              © 2025 Move to AI · Tous droits réservés
            </p>
          </div>

          {/* Links */}
          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-4">
                <p
                  className="text-xs font-semibold uppercase"
                  style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
                >
                  {section.title}
                </p>
                <div className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href as Route}
                      className="text-sm transition-colors duration-150 hover:text-white"
                      style={{ color: "rgba(232,230,240,0.45)" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
