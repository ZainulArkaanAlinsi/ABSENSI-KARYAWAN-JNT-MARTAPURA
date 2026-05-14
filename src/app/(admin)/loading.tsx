export default function Loading() {
  return (
    <div className="w-full h-full p-5 lg:p-7">
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-slate-200/60" />
          <div className="h-9 w-32 rounded-xl bg-slate-200/60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200/50" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200/40" />
          <div className="h-72 rounded-2xl bg-slate-200/40" />
        </div>

        <div className="h-96 rounded-2xl bg-slate-200/30" />
      </div>
    </div>
  );
}
