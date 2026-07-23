"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatHours } from "@/lib/projects";
import { useClientAuth } from "@/hooks/useClientAuth";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TimeEntryTable({
  entries = [],
  loading = false,
  canManageAll = false,
  showMemberColumn = true,
  onEdit,
  onDelete,
}) {
  const { user, ready } = useClientAuth();
  const currentUserId = ready ? user?.id : null;

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading time entries...</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
        No time entries for this month yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-border bg-background">
          <tr>
            <th className="px-4 py-3 font-medium text-text-secondary">Date</th>
            {showMemberColumn && (
              <th className="px-4 py-3 font-medium text-text-secondary">Member</th>
            )}
            <th className="px-4 py-3 font-medium text-text-secondary">Hours</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Note</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {entries.map((entry) => {
            const canManage =
              canManageAll || entry.user?.id === currentUserId;

            return (
              <tr key={entry.id}>
                <td className="px-4 py-3 text-foreground">
                  {formatDate(entry.entryDate)}
                </td>
                {showMemberColumn && (
                  <td className="px-4 py-3 text-foreground">
                    {entry.user?.name ?? "—"}
                  </td>
                )}
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatHours(entry.hours)}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">
                  {entry.note || "—"}
                </td>
                <td className="px-4 py-3">
                  {canManage ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit?.(entry)}
                        className="rounded-md p-1.5 text-text-muted hover:bg-primary-light hover:text-primary"
                        aria-label="Edit entry"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(entry)}
                        className="rounded-md p-1.5 text-text-muted hover:bg-error-light hover:text-error"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
