"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const DEFAULT_HOUR_CAP = 160;

export default function ProjectForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  submitting = false,
  error = "",
  fieldErrors = {},
}) {
  const form = {
    projectName: initialValues.projectName ?? "",
    clientName: initialValues.clientName ?? "",
    monthlyHourCap:
      initialValues.monthlyHourCap != null
        ? String(initialValues.monthlyHourCap)
        : String(DEFAULT_HOUR_CAP),
  };

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onSubmit({
      projectName: formData.get("projectName")?.toString().trim() ?? "",
      clientName: formData.get("clientName")?.toString().trim() ?? "",
      monthlyHourCap: Number(formData.get("monthlyHourCap")),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <Input
        label="Project name"
        name="projectName"
        defaultValue={form.projectName}
        placeholder="e.g. Website Redesign"
        error={fieldErrors.projectName}
        disabled={submitting}
      />

      <Input
        label="Client name"
        name="clientName"
        defaultValue={form.clientName}
        placeholder="e.g. Acme Corp"
        error={fieldErrors.clientName}
        disabled={submitting}
      />

      <Input
        label="Monthly hour cap"
        name="monthlyHourCap"
        type="number"
        min="1"
        step="0.5"
        defaultValue={form.monthlyHourCap}
        placeholder={String(DEFAULT_HOUR_CAP)}
        error={fieldErrors.monthlyHourCap}
        disabled={submitting}
      />

      {error && (
        <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
