import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Entrez votre nom complet.").max(120),
  email: z.string().trim().email("Email invalide.").max(200),
  jobTitle: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum.")
      .regex(/[A-Z]/, "Au moins une majuscule.")
      .regex(/[0-9]/, "Au moins un chiffre.")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type PasswordValues = z.infer<typeof passwordSchema>;
