"use client";

import { Bell, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import Badge from "@/components/ui/Badge";
import { useClientAuth } from "@/hooks/useClientAuth";

export default function TopBar() {
  const { user, role, ready } = useClientAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-sm">
      <div>
        <p className="text-sm text-text-secondary">Welcome back</p>
        <p className="font-semibold text-foreground">
          {ready ? user?.name ?? "User" : "User"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {ready && role && (
          <Badge className="capitalize">{role}</Badge>
        )}
        <button
          type="button"
          className="rounded-md p-2 text-text-secondary transition-colors hover:bg-background hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
