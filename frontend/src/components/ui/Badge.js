import { cn } from "@/lib/utils";

const statusStyles = {
  ok: "bg-success-light text-emerald-700",
  warning: "bg-warning-light text-amber-700",
  over_cap: "bg-error-light text-red-700",
  default: "bg-background text-text-secondary border border-border",
};

export default function Badge({ children, status = "default", className }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-sm px-2 text-xs font-medium",
        statusStyles[status] || statusStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
