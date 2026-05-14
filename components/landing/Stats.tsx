"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    value: "<48",
    suffix: "h",
    label: "pour identifier votre première opportunité IA",
  },
  {
    value: "14000",
    suffix: "€",
    label: "économisés en moyenne sur le premier projet",
  },
  {
    value: "50",
    suffix: "×",
    label: "moins cher qu'un cabinet de conseil traditionnel",
  },
];

function AnimatedNumber({ value, suffix }: { value: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState("0");
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          // Only animate pure numbers
          const num = parseInt(value.replace(/\D/g, ""), 10);
          if (isNaN(num)) { setDisplayed(value); io.disconnect(); return; }
          const duration = 1200;
          const step = num / (duration / 16);
          let cur = 0;
          const t = setInterval(() => {
            cur = Math.min(cur + step, num);
            setDisplayed(value.replace(/\d+/, String(Math.round(cur))));
            if (cur >= num) clearInterval(t);
          }, 16);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {displayed}
      <span style={{ color: "#6ee7b7" }}>{suffix}</span>
    </span>
  );
}

export function Stats() {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-2 px-6 py-10 text-center transition-colors duration-200"
          style={{ background: "#060810" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(110,231,183,0.04)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#060810")
          }
        >
          <p
            className="font-syne font-extrabold"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </p>
          <p
            className="text-sm leading-6"
            style={{ color: "rgba(232,230,240,0.55)", maxWidth: "180px" }}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}
