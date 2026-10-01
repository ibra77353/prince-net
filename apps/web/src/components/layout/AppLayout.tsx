import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={() => setDrawerOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0 border-e bg-card">
          <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Drawer */}
        <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto max-w-7xl p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}