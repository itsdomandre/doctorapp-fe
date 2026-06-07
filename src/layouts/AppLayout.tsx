import { PropsWithChildren, useState } from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-gray-50">
      <Topbar onToggleSidebar={() => setOpen((v) => !v)} />
      <div className="container-app py-5 flex gap-5 items-start">
        <Sidebar open={open} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
