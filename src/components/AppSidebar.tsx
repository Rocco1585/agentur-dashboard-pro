
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
    icon: CalendarPlus,
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
    title: "TODOs",
    url: "/todos",
    icon: CheckSquare,
  },
  {
    title: "Einstellungen",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Audit Logs",
    url: "/audit-logs",
    icon: FileText,
  },
  {
    title: "Benutzerverwaltung",
    url: "/user-management",
    icon: UserCog,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout, canAccessMainNavigation, isAdmin } = useAuth()
  const { teamMembers } = useTeamMembers()

  if (!user) return null

  // Get customer dashboards for admins
  const customerDashboards = teamMembers.filter(member => 
    member.user_role === 'kunde' && member.customer_dashboard_name
  )

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {canAccessMainNavigation() && items.map((item) => (
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
              {isAdmin() && customerDashboards.length > 0 && (
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
