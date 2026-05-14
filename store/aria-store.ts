// store/aria-store.ts
// État global Aria — Zustand store (client uniquement).

import { create } from "zustand";

export interface AriaMessage {
  id:        string;
  role:      "user" | "aria";
  content:   string;
  timestamp: Date;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface AriaState {
  isOpen:      boolean;
  isThinking:  boolean;
  unreadCount: number;
  messages:    AriaMessage[];
  sessionId:   string;

  // Actions
  toggle:          () => void;
  open:            () => void;
  close:           () => void;
  addMessage:      (msg: Pick<AriaMessage, "role" | "content">) => void;
  setThinking:     (v: boolean) => void;
  markAllRead:     () => void;
  incrementUnread: () => void;
  reset:           () => void;
}

export const useAriaStore = create<AriaState>((set) => ({
  isOpen:      false,
  isThinking:  false,
  unreadCount: 0,
  messages:    [],
  sessionId:   uid(),

  toggle: () =>
    set((s) => ({
      isOpen:      !s.isOpen,
      unreadCount: s.isOpen ? s.unreadCount : 0, // reset badge en ouvrant
    })),

  open:  () => set({ isOpen: true,  unreadCount: 0 }),
  close: () => set({ isOpen: false }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: uid(), timestamp: new Date() },
      ],
    })),

  setThinking:     (v)  => set({ isThinking: v }),
  markAllRead:     ()   => set({ unreadCount: 0 }),
  incrementUnread: ()   => set((s) => ({ unreadCount: s.isOpen ? 0 : s.unreadCount + 1 })),
  reset:           ()   => set({ messages: [], sessionId: uid() }),
}));
