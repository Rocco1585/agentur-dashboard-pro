
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/components/Dashboard";
import { Customers } from "@/components/Customers";
import { TeamMembers } from "@/components/TeamMembers";
import { FinancialOverview } from "@/components/FinancialOverview";
import { Settings } from "@/components/Settings";
import { ToDos } from "@/components/ToDos";
import { HotLeads } from "@/components/HotLeads";
import { CreateAppointmentPage } from "@/components/CreateAppointmentPage";
import { UserManagement } from "@/components/UserManagement";
import { CustomerDashboard } from "@/components/CustomerDashboard";
import { CustomerDashboardView } from "@/components/CustomerDashboardView";
import { Login } from "@/components/Login";
import { AdminSetup } from "@/components/AdminSetup";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading, login, canAccessMainNavigation } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AdminSetup />
        <Login onLogin={login} />
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            {/* Customer dashboard routes */}
            <Route path="/customer-dashboard/:customerId" element={<CustomerDashboard />} />
            <Route path="/customer-dashboard-view/:customerId" element={<CustomerDashboardView />} />
            
            {/* Main routes - only accessible for non-customers */}
            {canAccessMainNavigation() && (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/hot-leads" element={<HotLeads />} />
                <Route path="/create-appointment" element={<CreateAppointmentPage />} />
                <Route path="/team-members" element={<TeamMembers />} />
                <Route path="/revenue" element={<FinancialOverview />} />
                <Route path="/todos" element={<ToDos />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user-management" element={<UserManagement />} />
              </>
            )}
            
            {/* Redirect customers to their dashboard */}
            {!canAccessMainNavigation() && (
              <Route path="/" element={<CustomerDashboard />} />
            )}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
