import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, Users, TrendingUp, Calendar, UserCheck, AlertTriangle } from "lucide-react";
import { useTeamMembers, useCustomers, useRevenues, useAppointments } from '@/hooks/useSupabaseData';
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Dashboard() {
  const { teamMembers } = useTeamMembers();
  const { customers } = useCustomers();
  const { revenues } = useRevenues();
  const { appointments } = useAppointments();
  const [revenueTimeframe, setRevenueTimeframe] = useState<'today' | 'week'>('today');

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const todayRevenues = revenues.filter(revenue => {
    const revenueDate = new Date(revenue.date);
    return revenueDate.toDateString() === today.toDateString();
  });

  const weekRevenues = revenues.filter(revenue => {
    const revenueDate = new Date(revenue.date);
    return revenueDate >= startOfWeek && revenueDate <= today;
  });

  const displayRevenues = revenueTimeframe === 'today' ? todayRevenues : weekRevenues;
  const totalRevenue = displayRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);

  const activeTeamMembers = teamMembers.filter(member => member.is_active);
  const activeCustomers = customers.filter(customer => customer.is_active);
  
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === today.toDateString();
  });

  const stats = [
    {
      title: "Aktive Teammitglieder",
      value: activeTeamMembers.length,
      icon: Users,
      description: `${teamMembers.length} gesamt`
    },
    {
      title: "Aktive Kunden",
      value: activeCustomers.length,
      icon: UserCheck,
      description: `${customers.length} gesamt`
    },
    {
      title: "Termine heute",
      value: todayAppointments.length,
      icon: Calendar,
      description: "Geplante Termine"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Überblick über Ihr Unternehmen</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card with Time Selection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">
              {revenueTimeframe === 'today' ? 'Umsatz heute' : 'Umsatz diese Woche'}
            </CardTitle>
            <Euro className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">€{totalRevenue.toFixed(2)}</div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-1">
                <Button
                  variant={revenueTimeframe === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRevenueTimeframe('today')}
                  className={`text-xs px-2 py-1 h-6 ${
                    revenueTimeframe === 'today' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Tag
                </Button>
                <Button
                  variant={revenueTimeframe === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRevenueTimeframe('week')}
                  className={`text-xs px-2 py-1 h-6 ${
                    revenueTimeframe === 'week' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Woche
                </Button>
              </div>
              <p className="text-xs text-gray-600 text-left">
                {displayRevenues.length} Transaktionen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Other Stats */}
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">{stat.value}</div>
              <p className="text-xs text-gray-600 text-left">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-left flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTeamMembers.length > 0 ? (
              <div className="space-y-2">
                {activeTeamMembers
                  .sort((a, b) => (b.appointment_count || 0) - (a.appointment_count || 0))
                  .slice(0, 3)
                  .map((member, index) => (
                    <div key={member.id} className="flex justify-between items-center text-left">
                      <span className="text-sm text-left">{member.name}</span>
                      <span className="text-sm font-medium">{member.appointment_count || 0} Termine</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600 text-left">Keine aktiven Teammitglieder</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-left flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Aktuelle Termine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-2">
                {todayAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="text-sm text-left">
                    <div className="font-medium text-left">{appointment.type}</div>
                    <div className="text-gray-600 text-left">
                      {appointment.team_member_id ? 'Zugewiesen' : 'Nicht zugewiesen'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-left">Keine Termine heute</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
