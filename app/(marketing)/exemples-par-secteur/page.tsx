import type { Route } from "next";
import { redirect } from "next/navigation";

export default function ExemplesParSecteurPage() {
  redirect("/exemples" as Route);
}
