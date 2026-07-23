"use client";

import { useCallback, useEffect, useState } from "react";
import { X, UserPlus, UserMinus } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  assignMember,
  fetchAvailableMembers,
  fetchProjectMembers,
  removeMember,
} from "@/lib/members";

export default function AssignMemberModal({
  projectId,
  projectName,
  isOpen,
  onClose,
  onUpdated,
}) {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError("");

    try {
      const [assignments, options] = await Promise.all([
        fetchProjectMembers(projectId),
        fetchAvailableMembers(projectId),
      ]);
      setAssigned(assignments.members ?? []);
      setAvailable(options.availableMembers ?? []);
      setSelectedMemberId("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers();
    }
  }, [isOpen, projectId, loadMembers]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedMemberId) return;

    setActionLoading(true);
    setError("");

    try {
      await assignMember(projectId, Number(selectedMemberId));
      await loadMembers();
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign member");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemove(memberId) {
    setActionLoading(true);
    setError("");

    try {
      await removeMember(projectId, memberId);
      await loadMembers();
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setActionLoading(false);
    }
  }

  if (!isOpen) return null;

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
        aria-labelledby="assign-member-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              id="assign-member-title"
              className="text-lg font-semibold text-foreground"
            >
              Assign Members
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{projectName}</p>
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

        {loading && (
          <p className="text-sm text-text-secondary">Loading members...</p>
        )}

        {!loading && (
          <>
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-foreground">
                Assigned members ({assigned.length})
              </p>
              {assigned.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-text-muted">
                  No members assigned yet
                </p>
              ) : (
                <ul className="max-h-40 space-y-2 overflow-y-auto">
                  {assigned.map((member) => (
                    <li
                      key={member.memberId}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
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
                        onClick={() => handleRemove(member.memberId)}
                        disabled={actionLoading}
                        className="rounded-md p-1.5 text-text-muted hover:bg-error-light hover:text-error disabled:opacity-50"
                        aria-label={`Remove ${member.name}`}
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleAssign} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="available-member"
                  className="block text-sm font-medium text-foreground"
                >
                  Add member
                </label>
                <select
                  id="available-member"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  disabled={actionLoading || available.length === 0}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {available.length === 0
                      ? "No available members"
                      : "Select a member"}
                  </option>
                  {available.map((member) => (
                    <option key={member.memberId} value={member.memberId}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={!selectedMemberId || actionLoading}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {actionLoading ? "Saving..." : "Assign Member"}
              </Button>
            </form>
          </>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-error-light px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
