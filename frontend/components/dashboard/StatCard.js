import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatCard({ title, value, icon: Icon, description, trend, color = "blue", loading = false }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    red: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    zinc: "text-zinc-600 bg-zinc-50 dark:bg-zinc-900/20 dark:text-zinc-400",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="mt-4 h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="mt-2 h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-200/50 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h3>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shadow-sm font-semibold", colorClasses[color])}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between mb-1">
        <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
        {trend && (
          <span className={cn("text-xs font-medium rounded-full px-2 py-0.5", trend.isUp ? "text-green-600 bg-green-50 dark:bg-green-400/10 dark:text-green-400" : "text-red-600 bg-red-50 dark:bg-red-400/10 dark:text-red-400")}>
            {trend.isUp ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>
      {description && <p className="text-xs text-zinc-500 dark:text-zinc-500">{description}</p>}
    </div>
  );
}
