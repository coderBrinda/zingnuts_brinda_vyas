"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientAuth } from "@/hooks/useClientAuth";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "pm", "member"],
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    roles: ["admin", "pm", "member"],
  },
  {
    href: "/projects/new",
    label: "Create Project",
    icon: PlusCircle,
    roles: ["admin", "pm"],
  },
  { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
];

const ALL_ROLES = ["admin", "pm", "member"];

function isUniversalItem(item) {
  return (
    item.roles.length === ALL_ROLES.length &&
    ALL_ROLES.every((role) => item.roles.includes(role))
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { role, ready } = useClientAuth();

  const visibleItems = useMemo(() => {
    if (!ready || !role) {
      return NAV_ITEMS.filter(isUniversalItem);
    }

    return NAV_ITEMS.filter((item) => item.roles.includes(role));
  }, [role, ready]);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-border bg-gradient-to-r from-primary-light to-success-light px-6">
        <Link href="/dashboard" className="text-lg font-semibold text-primary">
          PM Time Tracker
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-light text-primary font-semibold"
                  : "text-text-secondary hover:bg-accent-light/40 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
