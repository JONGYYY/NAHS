"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createAnnouncement } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AnnouncementForm() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAnnouncement(fd);
      if (res.ok) {
        toast.success("Announcement posted");
        formRef.current?.reset();
        router.refresh();
      } else toast.error(res.error ?? "Could not post");
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Gallery night is next Friday!" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Share details, reminders, or a shout-out…"
          className="min-h-28"
        />
      </div>
      <Button type="submit" disabled={pending}>
        <Send className="size-4" /> {pending ? "Posting…" : "Post announcement"}
      </Button>
    </form>
  );
}
