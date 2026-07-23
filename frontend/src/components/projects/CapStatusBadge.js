import Badge from "@/components/ui/Badge";

const LABELS = {
  ok: "On track",
  warning: "Near cap",
  over_cap: "Over cap",
};

export default function CapStatusBadge({ status }) {
  return <Badge status={status}>{LABELS[status] ?? "On track"}</Badge>;
}
