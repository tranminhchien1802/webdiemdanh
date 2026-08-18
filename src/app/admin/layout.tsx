import { Toaster } from "sonner";
import AppShell from "@/components/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster richColors position="top-center" />
    </>
  );
}