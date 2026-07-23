"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, FolderKanban, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHours } from "@/lib/projects";
import Button from "@/components/ui/Button";
import CapStatusBadge from "./CapStatusBadge";
import UsageMeter from "./UsageMeter";
import AssignMemberModal from "./AssignMemberModal";

const borderStyles = {
  ok: "border-border hover:border-primary/30",
  warning: "border-warning/40 hover:border-warning/60",
  over_cap: "border-error/40 hover:border-error/60",
};

export default function ProjectCard({
  project,
  showAssignAction = false,
  showCreator = false,
  showLogHint = false,
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const { usage } = project;
  const capStatus = usage?.capStatus ?? "ok";
  const showUsage = usage != null && project.monthlyHourCap != null;
  const displayName = project.projectName || project.clientName;

  function openAssignModal(e) {
    e.preventDefault();
    e.stopPropagation();
    setAssignOpen(true);
  }

  return (
    <>
      <div
        className={cn(
          "group flex flex-col rounded-xl border-2 bg-card shadow-sm transition-all duration-200 hover:shadow-md",
          showUsage ? borderStyles[capStatus] : "border-border hover:border-primary/30"
        )}
      >
        <Link href={`/projects/${project.id}`} className="block flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">
                  {displayName}
                </h3>
                <p className="text-sm text-text-secondary">{project.clientName}</p>
                {showCreator && project.createdBy?.name && (
                  <p className="mt-0.5 text-xs text-text-muted">
                    Created by {project.createdBy.name}
                  </p>
                )}
              </div>
            </div>
            {showUsage && <CapStatusBadge status={capStatus} />}
          </div>

          {showUsage && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Clock className="h-4 w-4 text-accent" />
                  This month
                </span>
                <span className="font-medium text-foreground">
                  {formatHours(usage?.currentMonthHours ?? 0)}
                  <span className="text-text-muted">
                    {" "}
                    / {formatHours(project.monthlyHourCap)}
                  </span>
                </span>
              </div>
              <UsageMeter
                usagePercent={usage?.usagePercent ?? 0}
                capStatus={capStatus}
              />
              <p className="text-xs text-text-muted">
                {usage?.remainingHours >= 0
                  ? `${formatHours(usage.remainingHours)} remaining`
                  : `${formatHours(Math.abs(usage?.remainingHours ?? 0))} over cap`}
              </p>
            </div>
          )}

          {showLogHint && !showUsage && (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-accent">
              <Clock className="h-4 w-4" />
              View logs &amp; add time
            </p>
          )}
        </Link>

        {showAssignAction && (
          <div className="border-t border-border px-4 py-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={openAssignModal}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Member
            </Button>
          </div>
        )}
      </div>

      {showAssignAction && (
        <AssignMemberModal
          projectId={project.id}
          projectName={displayName}
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
        />
      )}
    </>
  );
}
