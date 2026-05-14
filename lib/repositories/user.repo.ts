import "server-only";
import { prisma } from "@/lib/prisma";

export const userRepo = {
  /** Profil utilisateur pour la page settings */
  async findProfile(id: string) {
    return prisma.user.findUnique({
      where:  { id },
      select: { name: true, email: true, jobTitle: true, preferences: true, preferredLocale: true },
    });
  },
};
