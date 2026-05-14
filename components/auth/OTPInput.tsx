"use client";

import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const LENGTH = 6;

export function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const digits = value.padEnd(LENGTH, "").slice(0, LENGTH).split("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function updateDigit(index: number, char: string) {
    const next = [...digits];
    next[index] = char.replace(/\D/g, "").slice(-1);
    onChange(next.join(""));
    if (char && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    updateDigit(index, e.target.value);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        updateDigit(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        updateDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    onChange(pasted.padEnd(digits.join("").length > 0 ? digits.join("").length : 0, "").slice(0, LENGTH) + pasted.slice(0, LENGTH));
    // Simpler: just overwrite from the beginning
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="Code de vérification">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] ?? ""}
          disabled={disabled}
          aria-label={`Chiffre ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          className="w-11 h-14 rounded-xl border border-[--border] bg-[--bg-card] text-center text-2xl font-bold text-[--text-primary] shadow-sm outline-none transition focus:border-[--blue] focus:ring-2 focus:ring-[--blue]/20 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
