"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminNavLinks } from "./admin-sidebar";
import { Wordmark } from "@/components/brand/logo";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open menu" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 h-dvh max-w-72 translate-x-0 translate-y-0 rounded-none rounded-r-[8px]">
        <DialogTitle className="sr-only">Admin navigation</DialogTitle>
        <div className="mb-2">
          <Wordmark subtitle="Admin console" />
        </div>
        <AdminNavLinks onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
