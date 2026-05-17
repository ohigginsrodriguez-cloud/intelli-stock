"use client";

interface StatusBadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "default";
  children: React.ReactNode;
}

const variants = {
  success: "bg-success/10 text-success",
  warning: "bg-accent/10 text-accent-dark",
  danger: "bg-danger/10 text-danger",
  info: "bg-primary/10 text-primary",
  default: "bg-gray-100 text-muted",
};

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
