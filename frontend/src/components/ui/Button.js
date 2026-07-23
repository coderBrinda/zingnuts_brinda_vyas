import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm disabled:opacity-50",
  secondary:
    "bg-card text-foreground border border-border hover:bg-background disabled:opacity-50",
  ghost: "bg-transparent text-primary hover:bg-primary-light disabled:opacity-50",
  danger:
    "bg-error text-white hover:bg-red-600 shadow-sm disabled:opacity-50",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
