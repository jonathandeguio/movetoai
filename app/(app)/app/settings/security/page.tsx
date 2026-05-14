import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PasswordForm } from "@/components/profile/PasswordForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceContext } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { user } = await getCurrentWorkspaceContext({ requireMembership: false });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[--text-muted]">
        <Link href="/app/settings" className="hover:text-[--text-secondary]">Paramètres</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/app/settings/profile" className="hover:text-[--text-secondary]">Mon profil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-[--text-primary]">Sécurité</span>
      </nav>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[--text-primary]">Sécurité</h1>
        <p className="text-sm text-[--text-secondary]">
          Changez votre mot de passe. Après modification, vous serez redirigé vers la page de connexion.
        </p>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
