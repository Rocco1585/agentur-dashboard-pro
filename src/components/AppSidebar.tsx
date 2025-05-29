
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Flame, 
  UserCheck, 
  Settings,
  CheckSquare
} from "lucide-react";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  {
    title: "Einnahmen",
    icon: TrendingUp,
    id: "revenue",
  },
  {
    title: "Kunden",
    icon: Users,
    id: "customers",
  },
  {
    title: "Hot Leads",
    icon: Flame,
    id: "hot-leads",
  },
  {
    title: "Teammitglieder",
    icon: UserCheck,
    id: "team",
  },
  {
    title: "ToDos",
    icon: CheckSquare,
    id: "todos",
  },
  {
    title: "Einstellungen",
    icon: Settings,
    id: "settings",
  },
];

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">Vertriebs Dashboard</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full justify-start px-3 py-2 rounded-md transition-colors ${
                      activeTab === item.id 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
