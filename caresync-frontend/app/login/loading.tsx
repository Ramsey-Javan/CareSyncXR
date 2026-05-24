export default function LoginLoading() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-live" />
        Loading…
      </div>
    </div>
  );
}
