import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "secondary" | "accent" | "destructive";
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "primary",
  className 
}: StatsCardProps) {
  const colors = {
    primary: "bg-blue-50 text-blue-600 border-blue-100",
    secondary: "bg-slate-50 text-slate-600 border-slate-100",
    accent: "bg-teal-50 text-teal-600 border-teal-100",
    destructive: "bg-red-50 text-red-600 border-red-100",
  };

  const iconColors = {
    primary: "bg-blue-100 text-blue-600",
    secondary: "bg-slate-100 text-slate-600",
    accent: "bg-teal-100 text-teal-600",
    destructive: "bg-red-100 text-red-600",
  };

  return (
    <div className={cn("dashboard-card flex items-start justify-between", className)}>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
        {trend && <p className="text-xs font-medium text-green-600 mt-2">{trend}</p>}
      </div>
      <div className={cn("p-3 rounded-xl", iconColors[color])}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
