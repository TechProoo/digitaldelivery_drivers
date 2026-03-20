import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "./Sidebar";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { DeliveryProvider } from "../../contexts/DeliveryContext";
import DeliveryAlert from "../DeliveryAlert";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/deliveries": "Deliveries",
  "/tracking": "Live Tracking",
  "/messages": "Messages",
  "/earnings": "Earnings",
  "/fleet": "Fleet Management",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Match sub-paths, e.g. /deliveries/123 → "Deliveries"
  const base = "/" + pathname.split("/").filter(Boolean)[0];
  return PAGE_TITLES[base] ?? "Dashboard";
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = resolveTitle(pathname);

  return (
    <SidebarProvider>
      <DeliveryProvider>
        {/* Responsive sidebar margin */}
        <style>{`
          .app-main-area {
            margin-left: 0;
          }
          @media (min-width: 1024px) {
            .app-main-area {
              margin-left: var(--sidebar-w);
            }
          }
        `}</style>

        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
          <Sidebar />

          <div className="app-main-area flex flex-col flex-1 min-h-screen">
            <TopBar title={title} />

            <main className="flex-1 px-4 lg:px-6 pt-4 lg:pt-6 pb-20 lg:pb-6">
              <Outlet />
            </main>

            <BottomNav />
          </div>
        </div>

        {/* New delivery assignment alert overlay */}
        <DeliveryAlert />
      </DeliveryProvider>
    </SidebarProvider>
  );
}
