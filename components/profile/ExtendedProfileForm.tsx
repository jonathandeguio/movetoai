"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExtendedProfileFormProps {
  defaultValues: {
    bio: string;
    linkedinUrl: string;
    websiteUrl: string;
    preferredLocale: string;
  };
}

export function ExtendedProfileForm({ defaultValues }: ExtendedProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [bio, setBio] = useState(defaultValues.bio);
  const [linkedinUrl, setLinkedinUrl] = useState(defaultValues.linkedinUrl);
  const [websiteUrl, setWebsiteUrl] = useState(defaultValues.websiteUrl);
  const [locale, setLocale] = useState(defaultValues.preferredLocale);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void (async () => {
        setStatus("idle");
        const res = await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio: bio.trim() || null,
            linkedinUrl: linkedinUrl.trim() || null,
            websiteUrl: websiteUrl.trim() || null,
            preferredLocale: locale,
          }),
        });
        setStatus(res.ok ? "success" : "error");
        if (res.ok) setTimeout(() => setStatus("idle"), 3000);
      })();
    });
  }

  const selectClass =
    "flex h-11 w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 text-sm text-[--text-primary] shadow-sm outline-none focus:ring-2 focus:ring-[--green]";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          placeholder="Quelques mots sur vous..."
          rows={3}
          className="flex w-full rounded-lg border border-[--border] bg-[--bg-card] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] shadow-sm outline-none focus:ring-2 focus:ring-[--green] resize-none"
        />
        <p className="text-xs text-[--text-muted]">{bio.length}/500 caractères</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/votre-profil"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://votresite.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locale">Langue préférée</Label>
        <select id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} className={selectClass}>
          <option value="FR">Français</option>
          <option value="EN">English</option>
          <option value="ES">Español</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {status === "success" && (
          <p className="text-sm font-medium text-[--green]" role="status">
            ✓ Préférences mises à jour.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-[--red]" role="alert">
            Une erreur est survenue. Réessayez.
          </p>
        )}
      </div>
    </form>
  );
}
