import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, Users, TrendingUp, Calendar, UserCheck, AlertTriangle, CheckSquare, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";
import { useTeamMembers, useCustomers, useRevenues, useAppointments } from '@/hooks/useSupabaseData';
import { useTodos } from '@/hooks/useTodos';
import { useSettings } from '@/hooks/useSettings';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const navigate = useNavigate();
  const { teamMembers } = useTeamMembers();
  const { customers } = useCustomers();
  const { revenues } = useRevenues();
  const { appointments } = useAppointments();
  const { todos } = useTodos();
  const { settings } = useSettings();
  const [revenueTimeframe, setRevenueTimeframe] = useState<'today' | 'week'>('today');
  const [extendedTimeframe, setExtendedTimeframe] = useState<'year' | 'halfyear' | 'quarter' | 'alltime'>('year');

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const startOfHalfYear = new Date(today.getFullYear(), today.getMonth() < 6 ? 0 : 6, 1);
  const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

  // Revenue calculations
  const todayRevenues = revenues.filter(revenue => {
    const revenueDate = new Date(revenue.date);
    return revenueDate.toDateString() === today.toDateString();
  });

  const weekRevenues = revenues.filter(revenue => {
    const revenueDate = new Date(revenue.date);
    return revenueDate >= startOfWeek && revenueDate <= today;
  });

  const getExtendedRevenues = () => {
    const filterDate = extendedTimeframe === 'year' ? startOfYear :
                      extendedTimeframe === 'halfyear' ? startOfHalfYear :
                      extendedTimeframe === 'quarter' ? startOfQuarter : new Date(0);
    
    return revenues.filter(revenue => {
      const revenueDate = new Date(revenue.date);
      return extendedTimeframe === 'alltime' || revenueDate >= filterDate;
    });
  };

  const displayRevenues = revenueTimeframe === 'today' ? todayRevenues : weekRevenues;
  const totalRevenue = displayRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
  
  const extendedRevenues = getExtendedRevenues();
  const totalExtendedRevenue = extendedRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);

  // Growth comparison calculations
  const getGrowthComparison = () => {
    const currentPeriodRevenue = totalRevenue;
    let previousPeriodRevenue = 0;
    
    if (revenueTimeframe === 'today') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      previousPeriodRevenue = revenues.filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return revenueDate.toDateString() === yesterday.toDateString();
      }).reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    } else {
      const lastWeekStart = new Date(startOfWeek);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(startOfWeek);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      
      previousPeriodRevenue = revenues.filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return revenueDate >= lastWeekStart && revenueDate <= lastWeekEnd;
      }).reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    }
    
    if (previousPeriodRevenue === 0) return { growth: 0, isPositive: true };
    
    const growth = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    return { growth: Math.abs(growth), isPositive: growth >= 0 };
  };

  const growthData = getGrowthComparison();

  // Appointment statistics
  const activeTeamMembers = teamMembers.filter(member => member.is_active);
  const activeCustomers = customers.filter(customer => customer.is_active);
  
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === today.toDateString();
  });

  const weekAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= startOfWeek && appointmentDate <= today;
  });

  const monthAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= startOfMonth && appointmentDate <= today;
  });

  const yearAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= startOfYear && appointmentDate <= today;
  });

  // Team notification
  const teamNotification = settings.find(setting => setting.key === 'team_notification');
  const showTeamNotification = teamNotification?.value === 'true';

  // Top 5 todos
  const topTodos = todos
    .filter(todo => !todo.completed)
    .sort((a, b) => {
      const priorityOrder = { 'Hoch': 3, 'Mittel': 2, 'Niedrig': 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    })
    .slice(0, 5);

  const handleAppointmentClick = (appointment: any) => {
    // Find customer by checking if the appointment has customer info or needs to be matched
    const customer = customers.find(c => c.id === appointment.customer_id);
    if (customer) {
      navigate(`/customers`, { state: { selectedCustomerId: customer.id } });
    }
  };

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
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Überblick über Ihr Unternehmen</p>
      </div>

      {/* Team Notification */}
      {showTeamNotification && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-800 font-medium">Team-Notiz aktiv</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily/Weekly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">
              {revenueTimeframe === 'today' ? 'Umsatz heute' : 'Umsatz diese Woche'}
            </CardTitle>
            <Euro className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">€{totalRevenue.toFixed(2)}</div>
            <div className="flex items-center gap-2 mt-2">
              {growthData.isPositive ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${growthData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {growthData.growth.toFixed(1)}% vs {revenueTimeframe === 'today' ? 'gestern' : 'letzte Woche'}
              </span>
            </div>
            <div className="flex gap-1 mt-3">
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
            <p className="text-xs text-gray-600 text-left mt-2">
              {displayRevenues.length} Transaktionen
            </p>
          </CardContent>
        </Card>

        {/* Extended Revenue Periods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Erweiterte Umsatzperioden</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">€{totalExtendedRevenue.toFixed(2)}</div>
            <Select value={extendedTimeframe} onValueChange={(value: any) => setExtendedTimeframe(value)}>
              <SelectTrigger className="mt-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Jahresumsatz</SelectItem>
                <SelectItem value="halfyear">Halbjahresumsatz</SelectItem>
                <SelectItem value="quarter">Quartalsumsatz</SelectItem>
                <SelectItem value="alltime">Alltime Umsatz</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 text-left mt-2">
              {extendedRevenues.length} Transaktionen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Appointment Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine heute</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{todayAppointments.length}</div>
            <div className="space-y-1 mt-2">
              <p className="text-xs text-gray-600 text-left">Diese Woche: {weekAppointments.length}</p>
              <p className="text-xs text-gray-600 text-left">Diesen Monat: {monthAppointments.length}</p>
              <p className="text-xs text-gray-600 text-left">Dieses Jahr: {yearAppointments.length}</p>
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
              <div className="space-y-3">
                {todayAppointments.slice(0, 3).map((appointment) => {
                  const customer = customers.find(c => c.id === appointment.customer_id);
                  return (
                    <div 
                      key={appointment.id} 
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="font-medium text-left text-sm">{customer?.name || 'Unbekannter Kunde'}</div>
                      <div className="text-xs text-gray-600 text-left mt-1">
                        Typ: {appointment.type}
                      </div>
                      <div className="text-xs text-gray-600 text-left">
                        Status: <Badge className="text-xs">{appointment.result}</Badge>
                      </div>
                    </div>
                  );
                })}
                {todayAppointments.length > 3 && (
                  <p className="text-xs text-gray-500 text-left">
                    +{todayAppointments.length - 3} weitere Termine
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-left">Keine Termine heute</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 TODOs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-left flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-red-600" />
            Top 5 TODOs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topTodos.length > 0 ? (
            <div className="space-y-2">
              {topTodos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{todo.title}</div>
                    {todo.due_date && (
                      <div className="text-xs text-gray-600">
                        Fällig: {new Date(todo.due_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                  <Badge className={`text-xs ${
                    todo.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                    todo.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {todo.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-left">Keine offenen TODOs</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
