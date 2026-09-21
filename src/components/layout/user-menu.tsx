"use client";

import Link from "next/link";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export function UserMenu({
  name,
  email,
  avatarUrl,
  isAdmin,
  context = "member",
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  context?: "member" | "admin";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar>
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name ?? email} /> : null}
          <AvatarFallback>{initials(name ?? email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="normal-case">
          <div className="text-sm font-semibold text-foreground">{name ?? "Member"}</div>
          <div className="truncate text-xs font-normal text-muted-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {context === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <UserIcon /> Member view
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon /> My profile
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && context === "member" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield /> Admin console
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full">
            <DropdownMenuItem asChild>
              <span>
                <LogOut /> Sign out
              </span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
