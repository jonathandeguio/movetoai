import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const createNextConfig = (phase: string): NextConfig => ({
  typedRoutes: true,
  // Keep dev artifacts separate from production builds to avoid Windows cache collisions.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  // bpmn-js ships as ESM — must be transpiled for Next.js
  transpilePackages: ["bpmn-js", "diagram-js", "bpmn-moddle", "moddle", "moddle-xml"],
});

export default createNextConfig;
