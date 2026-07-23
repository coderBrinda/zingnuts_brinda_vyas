"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Pencil, UserMinus, UserPlus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import AssignMemberModal from "@/components/projects/AssignMemberModal";
import CapStatusBadge from "@/components/projects/CapStatusBadge";
import UsageMeter from "@/components/projects/UsageMeter";
import EditTimeEntryModal from "@/components/time-entries/EditTimeEntryModal";
import TimeEntryForm from "@/components/time-entries/TimeEntryForm";
import TimeEntryTable from "@/components/time-entries/TimeEntryTable";
import Button from "@/components/ui/Button";
import { useClientAuth } from "@/hooks/useClientAuth";
import { fetchProjectMembers, removeMember } from "@/lib/members";
import { fetchProject, formatHours, formatMonthLabel } from "@/lib/projects";
import {
  getApiFieldErrors,
  MEMBER_MAX_HOURS,
  validateTimeEntryForm,
} from "@/lib/timeEntryValidation";
import { deleteTimeEntry, createTimeEntry, fetchTimeEntries } from "@/lib/timeEntries";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ProjectDetailPage({ params }) {
  const { isAdmin, isPm, isMember, ready } = useClientAuth();
  const canManage = isAdmin || isPm;
  const showMemberView = ready && isMember;

  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [editingEntry, setEditingEntry] = useState(null);
  const [logForm, setLogForm] = useState({
    projectId: "",
    entryDate: todayISO(),
    hours: "",
    note: "",
  });
  const [logFieldErrors, setLogFieldErrors] = useState({});
  const [logSubmitError, setLogSubmitError] = useState("");
  const [logSuccess, setLogSuccess] = useState("");
  const [logSubmitting, setLogSubmitting] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setProjectId(id));
  }, [params]);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    const data = await fetchProject(projectId);
    setProject(data);
    return data;
  }, [projectId]);

  const loadMembers = useCallback(async () => {
    if (!projectId || !canManage) return;
    setMembersLoading(true);
    try {
      const data = await fetchProjectMembers(projectId);
      setMembers(data.members ?? []);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [projectId, canManage]);

  const loadEntries = useCallback(async () => {
    if (!projectId) return;
    setEntriesLoading(true);
    try {
      const data = await fetchTimeEntries(projectId, { month: selectedMonth });
      setEntries(data.entries ?? []);
      if (data.usage) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                usage: {
                  ...prev.usage,
                  ...data.usage,
                  month: selectedMonth,
                },
              }
            : prev
        );
      }
    } catch {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, [projectId, selectedMonth]);

  useEffect(() => {
    if (!projectId) return;

    let active = true;

    async function init() {
      try {
        await loadProject();
        await loadMembers();
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to load project");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [projectId, loadProject, loadMembers]);

  useEffect(() => {
    if (projectId) {
      setLogForm((prev) => ({ ...prev, projectId: String(projectId) }));
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadEntries();
  }, [projectId, selectedMonth, loadEntries]);

  function handleLogChange(name, value) {
    setLogForm((prev) => ({ ...prev, [name]: value }));
    setLogFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setLogSubmitError("");
    setLogSuccess("");
  }

  function validateLogForm() {
    const errors = validateTimeEntryForm({
      entryDate: logForm.entryDate,
      hours: logForm.hours,
      maxHours: MEMBER_MAX_HOURS,
      existingEntries: entries,
    });

    setLogFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogSubmit() {
    if (!validateLogForm()) return;

    setLogSubmitting(true);
    setLogSubmitError("");
    setLogSuccess("");

    try {
      await createTimeEntry(projectId, {
        entryDate: logForm.entryDate,
        hours: Number(logForm.hours),
        note: logForm.note.trim() || null,
      });

      setLogSuccess("Time logged successfully.");
      setLogForm((prev) => ({
        ...prev,
        hours: "",
        note: "",
      }));
      await loadEntries();
    } catch (err) {
      const apiErrors = getApiFieldErrors(err);
      if (apiErrors.length > 0) {
        const mapped = {};
        apiErrors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setLogFieldErrors(mapped);
      }
      setLogSubmitError(
        err.response?.data?.message || "Failed to log time"
      );
    } finally {
      setLogSubmitting(false);
    }
  }

  async function handleRemoveMember(memberId) {
    setRemoveError("");
    try {
      await removeMember(projectId, memberId);
      await loadMembers();
    } catch (err) {
      setRemoveError(
        err.response?.data?.message || "Failed to remove member"
      );
    }
  }

  async function handleDeleteEntry(entry) {
    if (!window.confirm("Delete this time entry?")) return;
    try {
      await deleteTimeEntry(entry.id);
      await loadEntries();
      await loadProject();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete entry");
    }
  }

  async function handleEntryUpdated() {
    await loadEntries();
    await loadProject();
  }

  const usage = project?.usage;

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          href={showMemberView ? "/dashboard" : isAdmin ? "/projects" : "/dashboard"}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {showMemberView ? "Dashboard" : isAdmin ? "Projects" : "Dashboard"}
        </Link>

        {loading && (
          <p className="text-sm text-text-secondary">Loading project...</p>
        )}

        {error && (
          <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {project && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {project.projectName}
                </h1>
                <p className="mt-1 text-text-secondary">{project.clientName}</p>
                {ready && isAdmin && project.createdBy?.name && (
                  <p className="mt-1 text-xs text-text-muted">
                    Created by {project.createdBy.name}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {canManage && (
                  <>
                    <Link href={`/projects/${project.id}/edit`}>
                      <Button variant="secondary">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Project
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      onClick={() => setAssignOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Member
                    </Button>
                  </>
                )}
              </div>
            </div>

            {!ready ? (
              <p className="text-sm text-text-secondary">Loading project details...</p>
            ) : showMemberView ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-foreground">
                        My time entries
                      </h2>
                      <p className="text-sm text-text-secondary">
                        {formatMonthLabel(selectedMonth)}
                      </p>
                    </div>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <TimeEntryTable
                    entries={entries}
                    loading={entriesLoading}
                    canManageAll={false}
                    showMemberColumn={false}
                    onEdit={setEditingEntry}
                    onDelete={handleDeleteEntry}
                  />
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6 space-y-3">
                    <div>
                      <h2 className="font-semibold text-foreground">Log time</h2>
                      <p className="text-sm text-text-secondary">
                        Add hours for this project
                      </p>
                    </div>
                    <TimeEntryForm
                      projects={[]}
                      form={logForm}
                      onChange={handleLogChange}
                      onSubmit={handleLogSubmit}
                      submitting={logSubmitting}
                      error={logSubmitError}
                      success={logSuccess}
                      fieldErrors={logFieldErrors}
                      submitLabel="Add Log"
                      maxHours={MEMBER_MAX_HOURS}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
            {usage?.capStatus === "warning" && (
              <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-light/50 p-4 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                This project is within 10% of its monthly cap (
                {formatHours(usage.currentMonthHours)}/
                {formatHours(project.monthlyHourCap)} hrs)
              </div>
            )}

            {usage?.capStatus === "over_cap" && (
              <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error-light/50 p-4 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                Monthly cap exceeded by{" "}
                {formatHours(Math.abs(usage.remainingHours ?? 0))} (
                {formatHours(usage.currentMonthHours)}/
                {formatHours(project.monthlyHourCap)} hrs)
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Monthly usage</p>
                  <p className="text-xs text-text-muted">
                    {formatMonthLabel(usage?.month ?? selectedMonth)}
                  </p>
                </div>
                <CapStatusBadge status={usage?.capStatus ?? "ok"} />
              </div>

              <div className="mb-2 flex items-end justify-between">
                <span className="text-3xl font-bold text-primary">
                  {formatHours(usage?.currentMonthHours ?? 0)}
                </span>
                <span className="text-sm text-text-secondary">
                  of {formatHours(project.monthlyHourCap)} cap
                </span>
              </div>

              <UsageMeter
                usagePercent={usage?.usagePercent ?? 0}
                capStatus={usage?.capStatus ?? "ok"}
              />

              <p className="mt-3 text-sm text-text-secondary">
                {usage?.capStatusLabel}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">Time entries</h2>
                  <p className="text-sm text-text-secondary">
                    {formatMonthLabel(selectedMonth)}
                  </p>
                </div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <TimeEntryTable
                entries={entries}
                loading={entriesLoading}
                canManageAll={canManage}
                onEdit={setEditingEntry}
                onDelete={handleDeleteEntry}
              />
            </div>

            {canManage && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Team members
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Members assigned to log time on this project
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAssignOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign
                  </Button>
                </div>

                {membersLoading && (
                  <p className="text-sm text-text-secondary">
                    Loading members...
                  </p>
                )}

                {!membersLoading && members.length === 0 && (
                  <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
                    No members assigned yet. Assign a member so they can log
                    time.
                  </p>
                )}

                {!membersLoading && members.length > 0 && (
                  <ul className="divide-y divide-border">
                    {members.map((member) => (
                      <li
                        key={member.memberId}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            {member.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.memberId)}
                          className="rounded-md p-1.5 text-text-muted hover:bg-error-light hover:text-error"
                          aria-label={`Remove ${member.name}`}
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {removeError && (
                  <p className="mt-3 rounded-md bg-error-light px-3 py-2 text-sm text-error">
                    {removeError}
                  </p>
                )}
              </div>
            )}
              </>
            )}
          </>
        )}
      </div>

      {canManage && project && (
        <AssignMemberModal
          projectId={project.id}
          projectName={project.projectName}
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          onUpdated={loadMembers}
        />
      )}

      <EditTimeEntryModal
        entry={editingEntry}
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        onUpdated={handleEntryUpdated}
        existingEntries={entries}
        maxHours={showMemberView ? MEMBER_MAX_HOURS : 24}
      />
    </AppShell>
  );
}
