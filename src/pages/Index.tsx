
import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { Revenue } from "@/components/Revenue";
import { Customers } from "@/components/Customers";
import { HotLeads } from "@/components/HotLeads";
import { TeamMembers } from "@/components/TeamMembers";
import { Settings } from "@/components/Settings";
import { ToDos } from "@/components/ToDos";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'revenue':
        return <Revenue />;
      case 'customers':
        return <Customers />;
      case 'hot-leads':
        return <HotLeads />;
      case 'team':
        return <TeamMembers />;
      case 'todos':
        return <ToDos />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 flex flex-col">
          <div className="md:hidden p-4 border-b bg-white">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-4 md:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
