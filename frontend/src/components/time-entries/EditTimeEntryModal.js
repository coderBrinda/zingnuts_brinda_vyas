"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { deleteTimeEntry, updateTimeEntry } from "@/lib/timeEntries";
import {
  getApiFieldErrors,
  validateTimeEntryForm,
} from "@/lib/timeEntryValidation";

export default function EditTimeEntryModal({
  entry,
  isOpen,
  onClose,
  onUpdated,
  existingEntries = [],
  maxHours = 24,
}) {
  const [form, setForm] = useState({
    entryDate: "",
    hours: "",
    note: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (entry) {
      setForm({
        entryDate: entry.entryDate ?? "",
        hours: String(entry.hours ?? ""),
        note: entry.note ?? "",
      });
      setFieldErrors({});
      setSubmitError("");
    }
  }, [entry]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validateTimeEntryForm({
      entryDate: form.entryDate,
      hours: form.hours,
      maxHours,
      existingEntries,
      excludeEntryId: entry.id,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await updateTimeEntry(entry.id, {
        entryDate: form.entryDate,
        hours: Number(form.hours),
        note: form.note.trim() || null,
      });
      onUpdated?.();
      onClose();
    } catch (err) {
      const apiErrors = getApiFieldErrors(err);
      if (apiErrors.length > 0) {
        const mapped = {};
        apiErrors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
      }
      setSubmitError(
        err.response?.data?.message || "Failed to update time entry"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this time entry?")) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await deleteTimeEntry(entry.id);
      onUpdated?.();
      onClose();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Failed to delete time entry"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Edit Time Entry
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {entry.user?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-background hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            error={fieldErrors.hours}
            disabled={submitting}
          />
          <p className="text-xs text-text-muted">Maximum {maxHours} hours per entry</p>

          <div className="space-y-1.5">
            <label htmlFor="edit-note" className="block text-sm font-medium text-foreground">
              Note
            </label>
            <textarea
              id="edit-note"
              name="note"
              rows={3}
              value={form.note}
              onChange={handleChange}
              disabled={submitting}
              className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          {submitError && (
            <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
              {submitError}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={submitting}
            >
              Delete Entry
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
