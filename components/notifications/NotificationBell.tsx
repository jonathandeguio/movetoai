"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Bell, X, CheckCheck, ExternalLink } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  return `il y a ${Math.floor(seconds / 86400)} j`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // silent
    }
  }, []);

  // Initial fetch + polling every 60s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
  }

  function handleNotificationClick(notification: Notification) {
    markRead(notification.id);
    if (notification.link) {
      setOpen(false);
      router.push(notification.link as Route);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[--text-muted] transition-colors hover:bg-[--bg-hover] hover:text-[--text-primary]"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[--red] text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-[--border] bg-[--bg-card] shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[--border] px-4 py-3">
            <span className="text-sm font-semibold text-[--text-primary]">
              Notifications
              {unread > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[--red-dim] text-[10px] font-bold text-[--red]">
                  {unread}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={14} />
                  <span>Tout lire</span>
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[--text-muted] hover:text-[--text-primary]">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-[--text-muted]">
                <Bell size={24} className="opacity-30" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <ul className="divide-y divide-[--border-subtle]">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-[--bg-hover] ${
                        n.read ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[--blue]" />
                        )}
                        <div className={`min-w-0 flex-1 ${n.read ? "pl-4" : ""}`}>
                          <p className="text-xs font-semibold text-[--text-primary] leading-snug">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 text-xs text-[--text-secondary] line-clamp-2">
                              {n.body}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-[--text-muted]">{timeAgo(n.createdAt)}</p>
                        </div>
                        {n.link && (
                          <ExternalLink size={12} className="mt-1 shrink-0 text-[--text-muted]" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[--border] px-4 py-2 text-center">
              <p className="text-[10px] text-[--text-muted]">{items.length} notification{items.length > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
