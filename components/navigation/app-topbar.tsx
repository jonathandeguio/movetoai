"use client";

import { Search, HelpCircle } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { UserMenu }         from "@/components/layout/UserMenu";
import { useLocaleContext } from "@/components/providers/locale-provider";
import { HelpPanel }        from "@/components/guide/HelpPanel";
import { useHelpPanel }     from "@/hooks/useHelpPanel";

type AppTopbarProps = {
  title:         string;
  subtitle:      string;
  workspaceName: string;
  planName:      string;
  userLabel:     string;
  roleLabel:     string;
};

export function AppTopbar({
  title,
  subtitle,
  workspaceName,
  planName,
  userLabel,
  roleLabel,
}: AppTopbarProps) {
  const { messages } = useLocaleContext();
  const { isOpen, activeTab, setActiveTab, open, close } = useHelpPanel();

  return (
    <>
    <HelpPanel
      isOpen={isOpen}
      onClose={close}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
    <header
      style={{
        background:    "rgba(6,8,16,0.85)",
        backdropFilter:"blur(12px)",
        borderBottom:  "1px solid var(--border-subtle)",
        padding:       "0.875rem 1.5rem",
        position:      "sticky",
        top:           0,
        zIndex:        40,
      }}
    >
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            "1rem",
          flexWrap:       "wrap",
        }}
      >
        {/* Left: title + badges */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize:     "10px",
                fontWeight:   600,
                letterSpacing:"0.1em",
                textTransform:"uppercase",
                padding:      "2px 8px",
                borderRadius: "var(--r-pill)",
                border:       "1px solid var(--green-border)",
                background:   "var(--green-dim)",
                color:        "var(--green)",
              }}
            >
              {planName}
            </span>
            <span
              style={{
                fontSize:     "10px",
                fontWeight:   500,
                padding:      "2px 8px",
                borderRadius: "var(--r-pill)",
                border:       "1px solid var(--border)",
                color:        "var(--text-secondary)",
              }}
            >
              {workspaceName}
            </span>
          </div>
          <h1
            style={{
              fontSize:    "18px",
              fontWeight:  700,
              letterSpacing: "-0.02em",
              color:       "var(--text-primary)",
              lineHeight:  1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: search + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position:  "absolute",
                left:      "0.75rem",
                top:       "50%",
                transform: "translateY(-50%)",
                color:     "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              placeholder={messages.app.shell.searchPlaceholder}
              style={{
                height:       "36px",
                width:        "240px",
                paddingLeft:  "2.25rem",
                paddingRight: "0.75rem",
                fontSize:     "13px",
                borderRadius: "var(--r-lg)",
                border:       "1px solid var(--border)",
                background:   "var(--bg-input)",
                color:        "var(--text-primary)",
                outline:      "none",
                transition:   "border-color var(--t-fast)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <LanguageSwitcher />
          {/* Help button */}
          <button
            data-tour="help-button"
            onClick={() => open()}
            title="Centre d'aide"
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              width:          "36px",
              height:         "36px",
              borderRadius:   "var(--r-lg)",
              border:         "1px solid var(--border)",
              background:     "var(--bg-input)",
              color:          "var(--text-secondary)",
              cursor:         "pointer",
              transition:     "border-color var(--t-fast), color var(--t-fast)",
              flexShrink:     0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
            }}
          >
            <HelpCircle size={16} />
          </button>
          <UserMenu userLabel={userLabel} roleLabel={roleLabel} />
        </div>
      </div>
    </header>
    </>
  );
}
