"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const DEMO_USERS = [
  {
    role: "admin",
    label: "Admin",
    email: "admin@example.com",
    password: "Admin@123",
  },
  {
    role: "pm",
    label: "PM",
    email: "pm@example.com",
    password: "Pm@123456",
  },
  {
    role: "member",
    label: "Member",
    email: "member@example.com",
    password: "Member@123",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillDemoCredentials(role) {
    const user = DEMO_USERS.find((item) => item.role === role);
    if (!user) return;

    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(role);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-10 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            PM Time Tracker
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Track project hours against monthly caps
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-md bg-error-light px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-text-muted">
            Quick login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_USERS.map((user) => (
              <Button
                key={user.role}
                type="button"
                variant={selectedRole === user.role ? "primary" : "secondary"}
                size="sm"
                className="w-full"
                onClick={() => fillDemoCredentials(user.role)}
              >
                {user.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
