
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
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'

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
  const { canViewAuditLogs } = useAuth()

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
    </Sidebar>
  )
}
