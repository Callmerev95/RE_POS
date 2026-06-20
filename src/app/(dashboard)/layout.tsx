import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { AuthProvider } from "@/context/auth-context";
import { Sidebar } from "@/components/shared/sidebar/Sidebar";
import { Header } from "@/components/shared/header/Header";
import { GlobalOrderDrawer } from "@/app/(dashboard)/order/components/GlobalOrderDrawer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider user={user}>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <Sidebar role={user.role} />

        <main className="flex-1 relative flex flex-col min-w-0 bg-slate-50">
          <div className="shrink-0">
            <Header />
          </div>

          <div className="flex-1 relative overflow-y-auto p-8 flex flex-col min-h-0 custom-scrollbar">
            {children}

          </div>
        </main>

        <GlobalOrderDrawer />
      </div>
    </AuthProvider>
  );
}