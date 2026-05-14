"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { LogoutModal } from "@/components/auth/LogoutModal";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  variant?: "menu" | "page";
  copy?: {
    label?: string;
    modalTitle?: string;
    modalMessage?: string;
    modalConfirm?: string;
    modalCancel?: string;
  };
};

export function LogoutButton({ variant = "menu", copy }: LogoutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const label = copy?.label ?? "Se déconnecter";

  if (variant === "page") {
    return (
      <>
        <Button
          variant="outline"
          className="text-[--red] hover:border-[--red-dim] hover:bg-[--red-dim]"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {label}
        </Button>
        <LogoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          copy={{
            title: copy?.modalTitle,
            message: copy?.modalMessage,
            confirm: copy?.modalConfirm,
            cancel: copy?.modalCancel,
          }}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[--red] transition hover:bg-[--red-dim]"
      >
        <LogOut className="h-4 w-4" />
        {label}
      </button>
      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        copy={{
          title: copy?.modalTitle,
          message: copy?.modalMessage,
          confirm: copy?.modalConfirm,
          cancel: copy?.modalCancel,
        }}
      />
    </>
  );
}
