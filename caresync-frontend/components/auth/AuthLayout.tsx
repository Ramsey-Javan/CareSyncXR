import Image from "next/image";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.jpeg"
            alt="CareSync"
            width={56}
            height={56}
            className="rounded-2xl shadow-sm ring-1 ring-slate-200"
            priority
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            CareSync
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered remote healthcare
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
          <header className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
