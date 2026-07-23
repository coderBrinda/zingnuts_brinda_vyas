"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProjectCard from "@/components/projects/ProjectCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useClientAuth } from "@/hooks/useClientAuth";
import { fetchProjects } from "@/lib/projects";

const CAP_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "ok", label: "On track" },
  { value: "warning", label: "Near cap" },
  { value: "over_cap", label: "Over cap" },
];

export default function ProjectsPage() {
  const { isAdmin, isPm, isMember, ready } = useClientAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [capFilter, setCapFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const data = await fetchProjects();
        if (active) setProjects(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Failed to load projects"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        !search ||
        project.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        project.projectName?.toLowerCase().includes(search.toLowerCase());

      const matchesCap =
        capFilter === "all" || project.usage?.capStatus === capFilter;

      return matchesSearch && matchesCap;
    });
  }, [projects, search, capFilter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="mt-1 text-text-secondary">
              {!ready
                ? "Your assigned projects"
                : isAdmin
                  ? "All organisation projects"
                  : isPm
                    ? "Projects you manage"
                    : "Your assigned projects — open a project to log time"}
            </p>
          </div>

          {ready && (isAdmin || isPm) && (
            <Link href="/projects/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>

        {ready && !isMember && (
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search by client or project name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={capFilter}
              onChange={(e) => setCapFilter(e.target.value)}
              className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CAP_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <p className="text-sm text-text-secondary">Loading projects...</p>
        )}

        {error && (
          <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showAssignAction={ready && (isAdmin || isPm)}
                showCreator={ready && isAdmin}
                showLogHint={ready && isMember}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredProjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="text-text-secondary">
              {projects.length === 0
                ? isMember
                  ? "You haven't been assigned to any projects yet."
                  : "No projects found."
                : "No projects match your filters."}
            </p>
            {(isAdmin || isPm) && projects.length === 0 && (
              <Link href="/projects/new" className="mt-4 inline-block">
                <Button>Create Project</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
