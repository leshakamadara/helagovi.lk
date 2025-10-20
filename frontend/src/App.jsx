import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/support/admin-dashboard.jsx';
import SupportDashboard from './pages/support/support-dashboard.jsx';
import SupportUserPage from './pages/support/support-user-page.jsx';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

const App = () => {
  return (
    <div className="relative h-screen w-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#000_60%,#00FF9D40_100%)]" />

      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <Routes>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            <Route path="/usersupport" element={<SupportUserPage />} />

            <Route path="/supportdashboard" element={<SupportDashboard />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default App;
