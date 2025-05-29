
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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-red-600 font-bold text-lg text-right">CedricOrt.de</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
