"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Clock,
  FolderKanban,
  PlusCircle,
  Users,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProjectCard from "@/components/projects/ProjectCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useClientAuth } from "@/hooks/useClientAuth";
import { fetchDashboardSummary } from "@/lib/dashboard";
import { formatHours, formatMonthLabel } from "@/lib/projects";

function OrgSummary({ summary }) {
  const totalHours = summary.projects.reduce(
    (sum, p) => sum + (p.currentMonthHours ?? 0),
    0
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm">Total projects</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {summary.totalProjects}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Users className="h-4 w-4 text-accent" />
          <span className="text-sm">Hours logged this month</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {formatHours(totalHours)}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-sm">At risk / over cap</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {summary.warningProjects + summary.overCapProjects}
          {summary.overCapProjects > 0 && (
            <span className="ml-2 text-sm font-normal text-error">
              ({summary.overCapProjects} over cap)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function MemberSummary({ summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <FolderKanban className="h-4 w-4 text-primary" />
          <span className="text-sm">Assigned projects</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {summary.totalProjects}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Clock className="h-4 w-4 text-accent" />
          <span className="text-sm">My hours this month</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {formatHours(summary.myHoursThisMonth)}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isPm, isAdmin, isMember, ready } = useClientAuth();
  const canManageProjects = isPm || isAdmin;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const data = await fetchDashboardSummary();
        if (active) setSummary(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Failed to load dashboard"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  const currentMonth = formatMonthLabel(
    summary?.month ?? new Date().toISOString().slice(0, 7)
  );

  const alertProjects = (summary?.projects ?? []).filter(
    (p) => p.capStatus === "warning" || p.capStatus === "over_cap"
  );

  const roleLabel = !ready
    ? "Member"
    : isAdmin
      ? "Admin"
      : isPm
        ? "PM"
        : "Member";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Hello, {user?.name?.split(" ")[0] ?? "there"}
              </h1>
              <Badge status="default">{roleLabel}</Badge>
            </div>
            <p className="mt-1 text-text-secondary">
              {!ready
                ? "Your assigned work"
                : isAdmin
                  ? "Organisation-wide project overview"
                  : isPm
                    ? "Your projects and monthly hours"
                    : "Your assigned work"}
              {" · "}
              <span className="text-accent">{currentMonth}</span>
            </p>
          </div>

          {ready && canManageProjects && (
            <Link href="/projects/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          )}
        </div>

        {loading && (
          <p className="text-sm text-text-secondary">Loading dashboard...</p>
        )}

        {error && (
          <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {!loading && !error && summary && (
          <>
            {ready && isAdmin && <OrgSummary summary={summary} />}
            {ready && isMember && <MemberSummary summary={summary} />}

            {ready && canManageProjects && alertProjects.length > 0 && (
              <div className="rounded-xl border border-warning/30 bg-warning-light/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {isAdmin
                      ? "Organisation projects needing attention"
                      : "Projects needing attention"}
                  </span>
                </div>
                <div className="space-y-1">
                  {alertProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block text-sm text-foreground hover:text-primary"
                    >
                      {project.clientName}
                      {isAdmin && project.createdBy?.name
                        ? ` (${project.createdBy.name})`
                        : ""}{" "}
                      — {project.usagePercent}% of cap used
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {summary.projects.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                  <FolderKanban className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {!ready
                    ? "No projects yet"
                    : isMember
                      ? "No assigned projects"
                      : isAdmin
                        ? "No projects in the organisation"
                        : "No projects yet"}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-text-secondary">
                  {!ready
                    ? "Loading your projects..."
                    : isMember
                      ? "Ask your PM to assign you to a project."
                      : isAdmin
                        ? "No projects have been created across the organisation yet."
                        : "Create your first project to start tracking client hours."}
                </p>
                {ready && canManageProjects && (
                  <Link href="/projects/new" className="mt-6">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {summary.projects.length > 0 && (
              <>
                {ready && isAdmin && (
                  <h2 className="text-sm font-medium text-text-secondary">
                    All organisation projects ({summary.projects.length})
                  </h2>
                )}
                {ready && isPm && (
                  <div>
                    <h2 className="text-sm font-medium text-text-secondary">
                      Your projects ({summary.projects.length})
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">
                      Use Assign Member on each project so team members can log
                      time.
                    </p>
                  </div>
                )}
                {ready && isMember && (
                  <div>
                    <h2 className="text-sm font-medium text-text-secondary">
                      My projects ({summary.projects.length})
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">
                      Open a project to view your logs and add time.
                    </p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        ...project,
                        usage: project.capStatus
                          ? {
                              capStatus: project.capStatus,
                              currentMonthHours: project.currentMonthHours,
                              usagePercent: project.usagePercent,
                              remainingHours:
                                (project.monthlyHourCap ?? 0) -
                                (project.currentMonthHours ?? 0),
                              month: summary.month,
                            }
                          : undefined,
                      }}
                      showAssignAction={ready && canManageProjects}
                      showCreator={ready && isAdmin}
                      showLogHint={ready && isMember}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
