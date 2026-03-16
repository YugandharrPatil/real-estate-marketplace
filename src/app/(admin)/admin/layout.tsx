import { AdminSidebar } from "@/components/admin-sidebar";
import { Navbar } from "@/components/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminSidebar />
      <main className="ml-64 min-h-screen p-6">{children}</main>
    </div>
  );
}
