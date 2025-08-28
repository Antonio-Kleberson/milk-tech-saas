// src/components/ui/toaster.jsx
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, dismiss, onOpenChange, ...rest }) => (
        <Toast
          key={id}
          // ⬇️ encadeia o onOpenChange e garante que 'dismiss' seja chamado ao fechar
          onOpenChange={(open) => {
            if (!open) dismiss?.();
            onOpenChange?.(open);
          }}
          {...rest} // seguro: 'dismiss' não vai pro DOM
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
