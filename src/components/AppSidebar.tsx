
import {
  Calendar,
  CheckSquare,
  Euro,
  Home,
  Settings,
  TrendingUp,
  Users,
  Flame,
  Plus,
  Eye,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { supabase } from '@/integrations/supabase/client'

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Kunden",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Hot Leads",
    url: "/hot-leads",
    icon: Flame,
  },
  {
    title: "Termin erstellen",
    url: "/create-appointment",
    icon: Plus,
  },
  {
    title: "Teammitglieder",
    url: "/team-members",
    icon: Users,
  },
  {
    title: "Einnahmen",
    url: "/revenue",
    icon: Euro,
  },
  {
    title: "ToDos",
    url: "/todos",
    icon: CheckSquare,
  },
  {
    title: "Einstellungen",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { canViewAuditLogs, canAccessMainNavigation, user, logout, isAdmin } = useAuth()
  const [customerDashboards, setCustomerDashboards] = useState<any[]>([])
  const [dashboardsExpanded, setDashboardsExpanded] = useState(false)

  useEffect(() => {
    if (isAdmin()) {
      fetchCustomerDashboards()
    }
  }, [isAdmin])

  const fetchCustomerDashboards = async () => {
    try {
      const { data } = await supabase
        .from('team_members')
        .select('id, name, customer_dashboard_name')
        .eq('user_role', 'kunde')
        .eq('is_active', true)
        .not('customer_dashboard_name', 'is', null)

      setCustomerDashboards(data || [])
    } catch (error) {
      console.error('Error fetching customer dashboards:', error)
    }
  }

  // Admin-only items
  const adminItems = [
    {
      title: "Audit-Logs",
      url: "/audit-logs",
      icon: Eye,
    },
    {
      title: "Benutzerverwaltung",
      url: "/user-management",
      icon: Users,
    }
  ]

  // If user is a customer, show only their dashboard
  if (!canAccessMainNavigation()) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="font-bold text-lg px-4">
              <span className="text-red-600">C</span>
              <span className="text-gray-900">edric</span>
              <span className="text-red-600">O</span>
              <span className="text-gray-900">rt.de</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === `/customer-dashboard/${user?.id}`}
                  >
                    <Link to={`/customer-dashboard/${user?.id}`}>
                      <Home className="text-red-600" />
                      <span className="text-gray-900">{user?.customer_dashboard_name || 'Mein Dashboard'}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        {user && (
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        )}
      </Sidebar>
    )
  }

  const allItems = canViewAuditLogs() ? [...items, ...adminItems] : items

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-lg px-4">
            <span className="text-red-600">C</span>
            <span className="text-gray-900">edric</span>
            <span className="text-red-600">O</span>
            <span className="text-gray-900">rt.de</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="text-red-600" />
                      <span className="text-gray-900">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Customer Dashboards for Admins */}
              {isAdmin() && customerDashboards.length > 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setDashboardsExpanded(!dashboardsExpanded)}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <TrendingUp className="text-red-600" />
                      <span className="text-gray-900">Kunden-Dashboards</span>
                    </div>
                    {dashboardsExpanded ? 
                      <ChevronDown className="h-4 w-4 text-gray-600" /> : 
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    }
                  </SidebarMenuButton>
                  {dashboardsExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {customerDashboards.map((customer) => (
                        <SidebarMenuButton 
                          key={customer.id}
                          asChild 
                          isActive={location.pathname === `/customer-dashboard/${customer.id}`}
                          className="text-sm"
                        >
                          <Link to={`/customer-dashboard/${customer.id}`}>
                            <span className="text-gray-700 text-sm">
                              {customer.customer_dashboard_name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {user && (
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
