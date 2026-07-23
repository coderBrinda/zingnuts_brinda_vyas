import Link from "next/link";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="auth-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-10 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
        <p className="mt-2 text-text-secondary">
          You don&apos;t have permission to view this page.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
