import { cn } from "@/lib/utils";

const barColors = {
  ok: "bg-success",
  warning: "bg-warning",
  over_cap: "bg-error",
};

export default function UsageMeter({ usagePercent = 0, capStatus = "ok" }) {
  const width = Math.min(usagePercent, 100);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          barColors[capStatus] ?? barColors.ok
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
