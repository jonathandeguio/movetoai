"use client";

import { useEffect, useRef, useId } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type TurnstileFieldProps = {
  siteKey: string;
  onToken: (token: string) => void;
  onError?: () => void;
  /** "managed" shows a challenge widget when needed. "invisible" is fully transparent. */
  appearance?: "managed" | "invisible";
};

const SCRIPT_ID = "cf-turnstile-script";

export function TurnstileField({
  siteKey,
  onToken,
  onError,
  appearance = "managed"
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep latest callbacks in refs to avoid stale closures without re-mounting
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  const id = useId();

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        "error-callback": () => onErrorRef.current?.(),
        "expired-callback": () => onTokenRef.current(""),
        appearance,
        theme: "light",
        size: appearance === "invisible" ? "invisible" : "normal"
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      // Queue render for when the script loads
      const prevLoad = window.onTurnstileLoad;
      window.onTurnstileLoad = () => {
        prevLoad?.();
        renderWidget();
      };

      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, appearance]);

  return (
    <div
      ref={containerRef}
      id={`turnstile-${id}`}
      className="flex justify-center"
    />
  );
}
