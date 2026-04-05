import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function RequestDemoPage() {
  redirect("/diagnostic-ia" as Route);
}
