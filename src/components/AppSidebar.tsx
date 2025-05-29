
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
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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

// Menu items.
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
  const { canViewAuditLogs, user, logout } = useAuth()

  // Admin-only items
  const adminItems = [
    {
      title: "Audit-Logs",
      url: "/audit-logs",
      icon: Eye,
    },
  ]

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
