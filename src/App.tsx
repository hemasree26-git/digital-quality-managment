/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QualityProvider, useQuality } from './context/QualityContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { InspectionAuditModule } from './components/inspections/InspectionAuditModule';
import { DefectCapaModule } from './components/defects/DefectCapaModule';
import { AiAnalyticsModule } from './components/ai/AiAnalyticsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { UserAccessModule } from './components/rbac/UserAccessModule';
import { SettingsModule } from './components/settings/SettingsModule';

function QualityAppWorkspace() {
  const { isAuthenticated } = useAuth();
  const { activeTab, theme } = useQuality();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not logged in, render the Login Screen with phone OTP flow
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Render the requested module inside the main workspace
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard />;
      case 'inspections':
        return <InspectionAuditModule />;
      case 'defects':
        return <DefectCapaModule />;
      case 'ai-analytics':
        return <AiAnalyticsModule />;
      case 'capa':
        return <DefectCapaModule />;
      case 'reports':
        return <ReportsModule />;
      case 'rbac':
        return <UserAccessModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Role Switcher, Search, Notifications */}
        <Header onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QualityProvider>
        <QualityAppWorkspace />
      </QualityProvider>
    </AuthProvider>
  );
}
