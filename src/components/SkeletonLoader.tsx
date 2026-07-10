/* ─────────────────────────────────────────────────────────────────────
   SkeletonLoader.tsx
   Shimmer placeholder components for loading states (Light Mode).
   ───────────────────────────────────────────────────────────────────── */

/* ── Stat cards (4-up grid on dashboard) ───────────────────────────── */
export function StatCardSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-3 flex-1">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-7 w-14" />
          </div>
          <div className="skeleton h-12 w-12 rounded-xl ml-4" style={{ borderRadius: '0.75rem' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Chart area (2-column grid on dashboard) ────────────────────────── */
export function ChartSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl h-[340px] flex flex-col gap-4 shadow-sm">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-44" />
          <div className="skeleton flex-1 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/* ── Kanban task card ───────────────────────────────────────────────── */
export function TaskCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 min-h-[130px] shadow-sm">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-3.5 w-16" />
      </div>
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-3/4" />
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
  );
}

/* ── Kanban column (3 cards) ────────────────────────────────────────── */
export function KanbanColumnSkeleton() {
  return (
    <div className="bg-slate-100/40 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80 mb-1">
        <div className="skeleton h-2.5 w-2.5 rounded-full" />
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-5 w-6 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Recent activity rows (3 rows) ─────────────────────────────────── */
export function ActivityRowSkeletons() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="py-4 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="skeleton h-5 w-16 rounded-md" />
              <div className="skeleton h-5 w-12 rounded" />
            </div>
            <div className="skeleton h-4 w-60" />
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="skeleton h-3.5 w-20" />
            <div className="skeleton h-6 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
