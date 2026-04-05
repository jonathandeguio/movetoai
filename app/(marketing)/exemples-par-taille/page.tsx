import type { Route } from "next";
import { redirect } from "next/navigation";

export default function ExemplesParTaillePage() {
  redirect("/exemples" as Route);
}
