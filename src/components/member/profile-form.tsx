"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOwnProfile } from "@/lib/actions/profile";
import { GRADES, gradeLabel } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  initialName,
  initialGrade,
}: {
  initialName: string;
  initialGrade: number | null;
}) {
  const [name, setName] = useState(initialName);
  const [grade, setGrade] = useState<number | null>(initialGrade);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.set("full_name", name);
      fd.set("grade", String(grade ?? ""));
      const res = await updateOwnProfile(fd);
      if (res.ok) toast.success("Profile updated");
      else toast.error(res.error ?? "Could not save");
    });
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Grade</Label>
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGrade(g)}
              className={`flex flex-col items-center rounded-[4px] border px-2 py-3 text-center transition-colors ${
                grade === g ? "border-foreground bg-accent" : "border-input bg-card hover:bg-muted"
              }`}
            >
              <span className="font-display text-lg font-bold">{g}</span>
              <span className="text-xs text-muted-foreground">
                {gradeLabel(g).split("·")[1]?.trim()}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
