import { PropsWithChildren, useState } from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-gray-50">
      <Topbar onToggleSidebar={() => setOpen((v) => !v)} />
      <div className="container-app py-4 flex gap-4">
        <Sidebar open={open} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
