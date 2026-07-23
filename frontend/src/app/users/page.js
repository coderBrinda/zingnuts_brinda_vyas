"use client";

import { useEffect, useState } from "react";
import { PlusCircle, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  createUser,
  deactivateUser,
  fetchUsers,
  updateUser,
} from "@/lib/users";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "pm", label: "PM" },
  { value: "member", label: "Member" },
];

function UserFormModal({ user, isOpen, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        password: "",
        role: user.role ?? "member",
        isActive: user.isActive ?? true,
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "member",
        isActive: true,
      });
    }
    setError("");
  }, [user, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isEdit) {
        await updateUser(user.id, {
          name: form.name.trim(),
          role: form.role,
          isActive: form.isActive,
        });
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit User" : "Add User"}
          </h2>
          <button type="button" onClick={onClose} className="text-text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            disabled={submitting}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            disabled={submitting || isEdit}
          />
          {!isEdit && (
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              disabled={submitting}
            />
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              disabled={submitting}
              className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                }
                disabled={submitting}
              />
              Active account
            </label>
          )}

          {error && (
            <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDeactivate(user) {
    if (!window.confirm(`Deactivate ${user.name}?`)) return;
    try {
      await deactivateUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate user");
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="mt-1 text-text-secondary">
              Manage organisation users and roles
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {loading && (
          <p className="text-sm text-text-secondary">Loading users...</p>
        )}

        {error && (
          <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Name</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Email</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Role</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3 capitalize text-foreground">
                      {user.role}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={user.isActive ? "ok" : "default"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        {user.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(user)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        user={editingUser}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadUsers}
      />
    </AppShell>
  );
}
