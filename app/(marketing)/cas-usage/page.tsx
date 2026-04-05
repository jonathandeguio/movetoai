import type { Route } from "next";
import { redirect } from "next/navigation";

export default function CasUsagePage() {
  redirect("/exemples" as Route);
}
