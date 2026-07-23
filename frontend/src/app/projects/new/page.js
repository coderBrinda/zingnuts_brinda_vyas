"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProjectForm from "@/components/projects/ProjectForm";
import { createProject } from "@/lib/projects";

export default function CreateProjectPage() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const project = await createProject(payload);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const mapped = {};
        apiErrors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
      }
      setSubmitError(
        err.response?.data?.message || "Failed to create project"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Project</h1>
          <p className="mt-1 text-text-secondary">
            Set up a new client project with a monthly hour cap.
          </p>
        </div>

        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard")}
          submitLabel="Create Project"
          submitting={submitting}
          error={submitError}
          fieldErrors={fieldErrors}
        />
      </div>
    </AppShell>
  );
}
