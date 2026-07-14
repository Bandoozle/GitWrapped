import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
