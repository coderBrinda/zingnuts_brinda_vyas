"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProjectForm from "@/components/projects/ProjectForm";
import Button from "@/components/ui/Button";
import { getStoredUser, hasRole } from "@/lib/auth";
import {
  deleteProject,
  fetchProject,
  updateProject,
} from "@/lib/projects";

export default function EditProjectPage({ params }) {
  const router = useRouter();
  const isAdmin = hasRole("admin");
  const currentUser = getStoredUser();

  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setProjectId(id));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;

    let active = true;

    async function loadProject() {
      try {
        const data = await fetchProject(projectId);
        if (active) setProject(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Failed to load project"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [projectId]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      await updateProject(projectId, payload);
      router.push(`/projects/${projectId}`);
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
        err.response?.data?.message || "Failed to update project"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this project and all its time entries?")) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await deleteProject(projectId);
      router.push("/projects");
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Failed to delete project"
      );
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href={`/projects/${projectId ?? ""}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
          <p className="mt-1 text-text-secondary">
            Update client details or monthly hour cap.
          </p>
        </div>

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
            <ProjectForm
              initialValues={project}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/projects/${projectId}`)}
              submitLabel="Save Changes"
              submitting={submitting}
              error={submitError}
              fieldErrors={fieldErrors}
            />

            {(isAdmin || project.createdBy?.id === currentUser?.id) && (
              <div className="rounded-xl border border-error/30 bg-error-light/30 p-6">
                <h2 className="font-semibold text-error">Danger zone</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Permanently delete this project and all associated time
                  entries.
                </p>
                <Button
                  variant="danger"
                  className="mt-4"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Delete Project
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
