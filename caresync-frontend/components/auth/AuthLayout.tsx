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
    <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.jpeg"
            alt="CareSync"
            width={56}
            height={56}
            className="rounded-xl shadow-sm ring-1 ring-[#E2E8F0]"
            priority
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
            CareSync
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            AI-powered remote healthcare
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-6">
            <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
            <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
