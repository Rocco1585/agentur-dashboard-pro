
import { Calendar, Users, UserPlus, Euro, Settings, CheckSquare, TrendingUp, BarChart, Shield, LogOut, User, FileText, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart,
    requiredPermission: "canAccessMainNavigation"
  },
  {
    title: "Kunden",
    url: "/customers",
    icon: Users,
    requiredPermission: "canViewCustomers"
  },
  {
    title: "Hot Leads",
    url: "/hot-leads",
    icon: TrendingUp,
    requiredPermission: "canViewCustomers"
  },
  {
    title: "Termin erstellen",
    url: "/create-appointment",
    icon: Calendar,
    requiredPermission: "canAccessMainNavigation"
  },
  {
    title: "Team Mitglieder",
    url: "/team-members",
    icon: UserPlus,
    requiredPermission: "canViewTeamMembers"
  },
  {
    title: "Einnahmen & Ausgaben",
    url: "/revenue",
    icon: Euro,
    requiredPermission: "canManageRevenues"
  },
  {
    title: "To-Do Liste",
    url: "/todos",
    icon: CheckSquare,
    requiredPermission: "canViewTodos"
  },
  {
    title: "Audit Logs",
    url: "/audit-logs",
    icon: FileText,
    requiredPermission: "canViewAuditLogs"
  },
  {
    title: "Einstellungen",
    url: "/settings",
    icon: Settings,
    requiredPermission: "canAccessSettings"
  }
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    user, 
    logout, 
    canAccessMainNavigation,
    canViewCustomers,
    canViewTeamMembers,
    canManageRevenues,
    canViewTodos,
    canViewAuditLogs,
    canAccessSettings,
    isAdmin,
    isCustomer
  } = useAuth();

  const [customerDashboards, setCustomerDashboards] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin() || isCustomer()) {
      fetchCustomerDashboards();
    }
  }, [user]);

  const fetchCustomerDashboards = async () => {
    try {
      let query = supabase
        .from('team_members')
        .select('id, name, customer_dashboard_name')
        .eq('user_role', 'kunde')
        .eq('is_active', true)
        .not('customer_dashboard_name', 'is', null);

      // Wenn Kunde, nur sein eigenes Dashboard anzeigen
      if (isCustomer()) {
        query = query.eq('id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomerDashboards(data || []);
    } catch (error) {
      console.error('Error fetching customer dashboards:', error);
    }
  };

  const permissionMap = {
    canAccessMainNavigation,
    canViewCustomers,
    canViewTeamMembers,
    canManageRevenues,
    canViewTodos,
    canViewAuditLogs,
    canAccessSettings
  };

  const filteredItems = items.filter(item => {
    const hasPermission = permissionMap[item.requiredPermission as keyof typeof permissionMap];
    return typeof hasPermission === 'function' ? hasPermission() : hasPermission;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              <span className="text-red-500">C</span><span className="text-red-500">O</span>
            </span>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-black">CedricOrt.de</h2>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-left">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-left"
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Kunden Dashboards Sektion */}
        {(isAdmin() || isCustomer()) && customerDashboards.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-left">Kunden Dashboards</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {customerDashboards.map((dashboard) => (
                  <SidebarMenuItem key={dashboard.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === `/customer-dashboard/${dashboard.id}`}
                      className="text-left"
                    >
                      <a href={`/customer-dashboard/${dashboard.id}`} className="flex items-center gap-3">
                        <Monitor className="h-4 w-4" />
                        <span>{dashboard.customer_dashboard_name || dashboard.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2 text-left">
              <User className="h-4 w-4 text-red-600" />
              <div className="text-left">
                <div className="text-sm font-medium text-left">{user.name}</div>
                <div className="text-xs text-gray-600 text-left">{user.user_role}</div>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-left">
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
