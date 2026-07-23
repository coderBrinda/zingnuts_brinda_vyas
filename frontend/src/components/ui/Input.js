import { cn } from "@/lib/utils";

export default function Input({ className, label, error, id, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
