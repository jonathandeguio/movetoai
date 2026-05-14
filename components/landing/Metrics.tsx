"use client";

import { useEffect, useRef, useState } from "react";

const METRICS = [
  {
    value: 75,
    unit: "%",
    label: "de réduction du temps de traitement",
    barWidth: 75,
  },
  {
    value: 10,
    unit: "×",
    label: "plus rapide qu'une approche consulting traditionnelle",
    barWidth: 82,
  },
  {
    value: 22,
    unit: "k€",
    prefix: "-",
    label: "économisés en moyenne sur le 1er use case",
    barWidth: 60,
  },
  {
    value: 4,
    unit: " mois",
    label: "retour sur investissement moyen",
    barWidth: 40,
  },
];

function MetricCard({
  metric,
}: {
  metric: (typeof METRICS)[0];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [barW, setBarW] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const step = metric.value / (duration / 16);
          let cur = 0;
          const t = setInterval(() => {
            cur = Math.min(cur + step, metric.value);
            setCount(Math.round(cur));
            setBarW((cur / metric.value) * metric.barWidth);
            if (cur >= metric.value) clearInterval(t);
          }, 16);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [metric]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-5 rounded-[14px] p-6 transition-all duration-200"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(110,231,183,0.30)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.transform = "translateY(0)";
      }}
    >
      <p
        className="font-syne font-extrabold"
        style={{
          fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#fff",
        }}
      >
        {metric.prefix ?? ""}
        {count}
        <span style={{ color: "#6ee7b7" }}>{metric.unit}</span>
      </p>
      <p className="text-sm leading-6" style={{ color: "rgba(232,230,240,0.55)" }}>
        {metric.label}
      </p>
      {/* Progress bar */}
      <div
        className="h-px w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-[1200ms] ease-out"
          style={{
            width: `${barW}%`,
            background:
              "linear-gradient(90deg, #6ee7b7, #38bdf8)",
          }}
        />
      </div>
    </div>
  );
}

export function Metrics() {
  return (
    <section
      className="py-24"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4 text-center">
          <p
            className="text-xs font-medium uppercase"
            style={{ color: "#6ee7b7", letterSpacing: "0.16em" }}
          >
            Impact mesuré
          </p>
          <h2
            className="font-syne font-bold"
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            Des résultats concrets, pas des promesses.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {METRICS.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
