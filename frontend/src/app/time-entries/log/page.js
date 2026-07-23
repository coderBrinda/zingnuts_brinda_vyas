"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export default function LogTimePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/projects");
  }, [router]);

  return (
    <AppShell>
      <p className="text-sm text-text-secondary">Redirecting to projects...</p>
    </AppShell>
  );
}
