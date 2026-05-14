import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { ExtendedProfileForm } from "@/components/profile/ExtendedProfileForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { DangerZone } from "@/components/profile/DangerZone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";
import { userRepo } from "@/lib/repositories/user.repo";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, workspace, tenant, role } = await getCurrentWorkspaceContext({
    requireMembership: false,
  });

  if (!user) redirect("/login");

  const dbUser = await userRepo.findProfile(user.id);

  const prefs = dbUser?.preferences as Record<string, unknown> | null;
  const tenantSettings = (tenant as { settings?: Record<string, unknown> } | null)?.settings as Record<string, unknown> | null;
  const companySize = typeof tenantSettings?.companySize === "string" ? tenantSettings.companySize : null;

  const companySizeLabel: Record<string, string> = {
    pme: "PME (moins de 500 employés)",
    eti: "ETI (500 à 5 000 employés)",
    grand_groupe: "Grand groupe (5 000+ employés)",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[--text-muted]">
        <Link href="/app/settings" className="hover:text-[--text-secondary]">Paramètres</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-[--text-primary]">Mon profil</span>
      </nav>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Mon profil</h1>
        <p className="text-sm text-[--text-secondary]">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      {/* ─── 1. Informations personnelles ─── */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: dbUser?.name ?? "",
              email: dbUser?.email ?? "",
              jobTitle: dbUser?.jobTitle ?? "",
              phone: typeof prefs?.phone === "string" ? prefs.phone : "",
            }}
          />
        </CardContent>
      </Card>

      {/* ─── 2. Profil étendu ─── */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Profil étendu</CardTitle>
        </CardHeader>
        <CardContent>
          <ExtendedProfileForm
            defaultValues={{
              bio: typeof prefs?.bio === "string" ? prefs.bio : "",
              linkedinUrl: typeof prefs?.linkedinUrl === "string" ? prefs.linkedinUrl : "",
              websiteUrl: typeof prefs?.websiteUrl === "string" ? prefs.websiteUrl : "",
              preferredLocale: dbUser?.preferredLocale ?? "FR",
            }}
          />
        </CardContent>
      </Card>

      {/* ─── 3. Entreprise (lecture seule) ─── */}
      {workspace && (
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[--text-muted]">Entreprise</dt>
                <dd className="mt-1 text-sm text-[--text-primary]">{tenant?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[--text-muted]">Taille</dt>
                <dd className="mt-1 text-sm text-[--text-primary]">
                  {companySize ? companySizeLabel[companySize] ?? companySize : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[--text-muted]">Workspace</dt>
                <dd className="mt-1 font-mono text-sm text-[--text-primary]">{workspace.slug}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[--text-muted]">Rôle</dt>
                <dd className="mt-1 text-sm text-[--text-primary]">{role?.name ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* ─── 4. Sécurité ─── */}
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sécurité</CardTitle>
          <Link
            href="/app/settings/security"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Changer le mot de passe →
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[--text-secondary]">
            Modifiez votre mot de passe depuis la page de sécurité dédiée.
          </p>
        </CardContent>
      </Card>

      {/* ─── 5. Déconnexion ─── */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoutButton variant="page" />
        </CardContent>
      </Card>

      {/* ─── 6. Zone dangereuse ─── */}
      <DangerZone />
    </div>
  );
}
