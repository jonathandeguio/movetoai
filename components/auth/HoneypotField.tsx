"use client";

/**
 * Invisible honeypot field — positioned off-screen via CSS (not display:none,
 * which modern bots detect). If this field is filled, the submission is a bot.
 */
export function HoneypotField({ name = "website" }: { name?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: 0,
        height: 0,
        overflow: "hidden",
        opacity: 0,
      }}
    >
      {/* Intentionally looks like a real field to bots */}
      <label htmlFor={`hp_${name}`}>Leave this field empty</label>
      <input
        id={`hp_${name}`}
        name={name}
        type="text"
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
}
