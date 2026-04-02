export default function DashboardSection({ title, children, href, linkLabel = "View All" }) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
        {href && (
          <a
            href={href}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {linkLabel}
          </a>
        )}
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
