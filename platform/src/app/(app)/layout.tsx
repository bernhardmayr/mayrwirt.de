import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          userName={session.user.name}
          userEmail={session.user.email}
          userImage={session.user.image}
        />
        <main className="flex-1 overflow-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
