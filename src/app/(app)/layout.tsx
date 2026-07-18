import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen min-w-0 flex-col overflow-x-hidden">
      <AppNav />
      <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 overflow-x-hidden px-4 pt-[5.75rem] pb-10 sm:px-6 sm:pt-28">
        {children}
      </main>
    </div>
  );
}
