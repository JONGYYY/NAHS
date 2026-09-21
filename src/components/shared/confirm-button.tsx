"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

export function ConfirmButton({
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  successMessage,
  children,
  triggerVariant = "ghost",
  triggerSize = "sm",
  confirmVariant = "destructive",
  triggerClassName,
  triggerAriaLabel,
  redirectTo,
}: {
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  successMessage?: string;
  children: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  confirmVariant?: ButtonProps["variant"];
  triggerClassName?: string;
  triggerAriaLabel?: string;
  redirectTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function confirm() {
    startTransition(async () => {
      const res = await onConfirm();
      if (res.ok) {
        if (successMessage) toast.success(successMessage);
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
          aria-label={triggerAriaLabel}
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={confirm} disabled={pending}>
            {pending ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
