import { LucideIcon } from "lucide-react";

interface PortalEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function PortalEmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}: PortalEmptyStateProps) {
  return (
    <div
      className={`mx-auto max-w-6xl rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-32 text-center ${className}`.trim()}
    >
      <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
      <h3 className="text-xl font-bold text-gray-500">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-gray-500">{description}</p>
    </div>
  );
}
