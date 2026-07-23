"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CapStatusBadge from "@/components/projects/CapStatusBadge";
import { formatHours } from "@/lib/projects";

export default function TimeEntryForm({
  projects = [],
  form,
  onChange,
  onSubmit,
  submitting = false,
  error = "",
  success = "",
  fieldErrors = {},
  selectedProject = null,
  showCapPreview = false,
  submitLabel = "Log Time",
  maxHours = 24,
}) {
  const previewHours = Number(form.hours) || 0;
  const currentHours = selectedProject?.usage?.currentMonthHours ?? 0;
  const cap = selectedProject?.monthlyHourCap ?? 0;
  const afterHours = currentHours + previewHours;
  const afterPercent = cap > 0 ? Number(((afterHours / cap) * 100).toFixed(1)) : 0;

  let previewStatus = "ok";
  if (afterPercent > 100) previewStatus = "over_cap";
  else if (afterPercent >= 90) previewStatus = "warning";

  function handleChange(e) {
    onChange(e.target.name, e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      {projects.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="projectId" className="block text-sm font-medium text-foreground">
            Project
          </label>
          <select
            id="projectId"
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            disabled={submitting}
            className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.projectName} — {project.clientName}
              </option>
            ))}
          </select>
          {fieldErrors.projectId && (
            <p className="text-sm text-error">{fieldErrors.projectId}</p>
          )}
        </div>
      )}

      <Input
        label="Date"
        name="entryDate"
        type="date"
        value={form.entryDate}
        onChange={handleChange}
        error={fieldErrors.entryDate}
        disabled={submitting}
      />

      <Input
        label="Hours"
        name="hours"
        type="number"
        min="0.25"
        max={maxHours}
        step="0.25"
        value={form.hours}
        onChange={handleChange}
        placeholder="e.g. 8"
        error={fieldErrors.hours}
        disabled={submitting}
      />
      <p className="text-xs text-text-muted">Maximum {maxHours} hours per entry</p>

      <div className="space-y-1.5">
        <label htmlFor="note" className="block text-sm font-medium text-foreground">
          Note <span className="text-text-muted">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          value={form.note}
          onChange={handleChange}
          disabled={submitting}
          placeholder="What did you work on?"
          className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {showCapPreview && selectedProject?.usage && previewHours > 0 && (
        <div className="rounded-md border border-border bg-background px-4 py-3 text-sm">
          <p className="text-text-secondary">
            Current usage:{" "}
            <span className="font-medium text-foreground">
              {formatHours(currentHours)} / {formatHours(cap)}
            </span>
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-text-secondary">
              After this entry:{" "}
              <span className="font-medium text-foreground">
                {formatHours(afterHours)} / {formatHours(cap)} ({afterPercent}%)
              </span>
            </p>
            <CapStatusBadge status={previewStatus} />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-md bg-success-light px-3 py-2 text-sm text-success">
          {success}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
