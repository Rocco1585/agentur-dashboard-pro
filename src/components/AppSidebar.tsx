
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Home, 
  Users, 
  Flame, 
  CalendarPlus, 
  Euro, 
  CheckSquare, 
  Settings, 
  FileText, 
  UserCog,
  ChevronRight,
  Building2
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useTeamMembers } from "@/hooks/useSupabaseData"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const location = useLocation()
  const { 
    user, 
    logout, 
    canAccessMainNavigation, 
    canViewCustomers,
    canManageRevenues,
    canViewTodos,
    canAccessSettings,
    canViewAuditLogs,
    canViewTeamMembers,
    canViewUserManagement,
    canViewCustomerDashboards
  } = useAuth()
  const { teamMembers } = useTeamMembers()

  if (!user) return null

  // Get customer dashboards for admins only
  const customerDashboards = canViewCustomerDashboards() ? teamMembers.filter(member => 
    member.user_role === 'kunde' && member.customer_dashboard_name
  ) : []

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      visible: canAccessMainNavigation()
    },
    {
      title: "Kunden",
      url: "/customers",
      icon: Users,
      visible: canViewCustomers()
    },
    {
      title: "Hot Leads",
      url: "/hot-leads",
      icon: Flame,
      visible: canAccessMainNavigation()
    },
    {
      title: "Termin erstellen",
      url: "/create-appointment",
      icon: CalendarPlus,
      visible: canAccessMainNavigation()
    },
    {
      title: "Teammitglieder",
      url: "/team-members",
      icon: Users,
      visible: canViewTeamMembers()
    },
    {
      title: "Einnahmen",
      url: "/revenue",
      icon: Euro,
      visible: canManageRevenues()
    },
    {
      title: "TODOs",
      url: "/todos",
      icon: CheckSquare,
      visible: canViewTodos()
    },
    {
      title: "Einstellungen",
      url: "/settings",
      icon: Settings,
      visible: canAccessSettings()
    },
    {
      title: "Audit Logs",
      url: "/audit-logs",
      icon: FileText,
      visible: canViewAuditLogs()
    },
    {
      title: "Benutzerverwaltung",
      url: "/user-management",
      icon: UserCog,
      visible: canViewUserManagement()
    },
  ].filter(item => item.visible)

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Customer Dashboards - only visible to admins */}
              {canViewCustomerDashboards() && customerDashboards.length > 0 && (
                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Building2 />
                        <span>Kunden-Dashboards</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {customerDashboards.map((customer) => (
                          <SidebarMenuSubItem key={customer.id}>
                            <SidebarMenuSubButton asChild>
                              <Link to={`/customer-dashboard/${customer.id}`}>
                                <span>{customer.customer_dashboard_name}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <div className="mt-auto p-4">
          <div className="text-sm text-gray-600 mb-2">
            Angemeldet als: {user.name}
          </div>
          <Button 
            onClick={logout} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Abmelden
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
