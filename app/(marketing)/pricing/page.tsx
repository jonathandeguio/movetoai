import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function PricingPage() {
  redirect("/plateforme" as Route);
}
