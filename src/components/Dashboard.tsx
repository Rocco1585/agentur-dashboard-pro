import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, Users, TrendingUp, Calendar, UserCheck, AlertTriangle, CheckSquare, MessageSquare, ArrowUp, ArrowDown, Clock, Award, BarChart3 } from "lucide-react";
import { useTeamMembers, useCustomers, useRevenues, useAppointments } from '@/hooks/useSupabaseData';
import { useTodos } from '@/hooks/useTodos';
import { useSettings } from '@/hooks/useSettings';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

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

  // Last 7 days for statistics
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  // Appointments by day for the last 7 days
  const appointmentsByDay = last7Days.map(date => {
    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
    
    return {
      date: date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      appointments: dayAppointments.length,
      fullDate: date.toDateString()
    };
  });

  // Team member statistics for last 7 days
  const teamMemberStats = teamMembers.map(member => {
    const memberAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const isInLast7Days = last7Days.some(day => 
        day.toDateString() === appointmentDate.toDateString()
      );
      return appointment.team_member_id === member.id && isInLast7Days;
    });
    
    return {
      ...member,
      appointmentsLast7Days: memberAppointments.length
    };
  }).sort((a, b) => b.appointmentsLast7Days - a.appointmentsLast7Days);

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

  // Team notification settings
  const teamNotice = settings.find(setting => setting.key === 'team_notice');
  const showTeamNotice = settings.find(setting => setting.key === 'show_team_notice');
  const shouldShowTeamNotice = showTeamNotice?.value === 'true';

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'termin_ausstehend': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'termin_erschienen': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'termin_abgeschlossen': return 'bg-green-100 text-green-800 border-green-200';
      case 'follow_up': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'termin_abgesagt': return 'bg-red-100 text-red-800 border-red-200';
      case 'termin_verschoben': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'termin_ausstehend': return <Clock className="h-3 w-3" />;
      case 'termin_erschienen': return <UserCheck className="h-3 w-3" />;
      case 'termin_abgeschlossen': return <CheckSquare className="h-3 w-3" />;
      case 'follow_up': return <TrendingUp className="h-3 w-3" />;
      case 'termin_abgesagt': return <AlertTriangle className="h-3 w-3" />;
      case 'termin_verschoben': return <Calendar className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const formatStatusText = (status: string) => {
    const statusMap = {
      'termin_ausstehend': 'Ausstehend',
      'termin_erschienen': 'Erschienen',
      'termin_abgeschlossen': 'Abgeschlossen',
      'follow_up': 'Follow Up',
      'termin_abgesagt': 'Abgesagt',
      'termin_verschoben': 'Verschoben'
    };
    return statusMap[status as keyof typeof statusMap] || status;
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

  const chartConfig = {
    appointments: {
      label: "Termine",
      color: "#dc2626",
    },
  };

  return (
    <div className="space-y-4 px-4 py-4 w-full min-h-screen">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Überblick über Ihr Unternehmen</p>
      </div>

      {/* Team Notification */}
      {shouldShowTeamNotice && teamNotice?.value && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <MessageSquare className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-left text-yellow-800">
            <strong>Team-Notiz:</strong> {teamNotice.value}
          </AlertDescription>
        </Alert>
      )}

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Daily/Weekly Revenue */}
        <Card className="xl:col-span-2">
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
        <Card className="xl:col-span-2">
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

      {/* Stats Grid - More Columns on Large Screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* Appointment Statistics */}
        <Card className="xl:col-span-2">
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

        {/* New Statistics Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine (7 Tage)</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {appointmentsByDay.reduce((sum, day) => sum + day.appointments, 0)}
            </div>
            <p className="text-xs text-gray-600 text-left">Termine in 7 Tagen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {teamMemberStats[0]?.appointmentsLast7Days || 0}
            </div>
            <p className="text-xs text-gray-600 text-left">
              {teamMemberStats[0]?.name || 'Kein Mitarbeiter'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Ø Termine/Tag</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {(appointmentsByDay.reduce((sum, day) => sum + day.appointments, 0) / 7).toFixed(1)}
            </div>
            <p className="text-xs text-gray-600 text-left">Letzte 7 Tage</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Current Appointments - Optimized Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Appointments Chart - Takes more space */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-left flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
              Termine der letzten 7 Tage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsByDay}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="appointments" fill="var(--color-appointments)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Current Appointments - Compact */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-left flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Aktuelle Termine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.slice(0, 4).map((appointment) => {
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
                      <div className="flex items-center gap-1 mt-2">
                        <Badge className={`text-xs flex items-center gap-1 ${getStatusBadgeColor(appointment.result)}`}>
                          {getStatusIcon(appointment.result)}
                          {formatStatusText(appointment.result)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {todayAppointments.length > 4 && (
                  <p className="text-xs text-gray-500 text-left">
                    +{todayAppointments.length - 4} weitere Termine
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-left">Keine Termine heute</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Performance and TODOs - Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Team Performance Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle className="text-left flex items-center">
              <Award className="h-5 w-5 mr-2 text-red-600" />
              Team Performance (7 Tage)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMemberStats.length > 0 ? (
              <div className="space-y-3">
                {teamMemberStats.slice(0, 6).map((member, index) => (
                  <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm text-left">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{member.appointmentsLast7Days}</span>
                      <Calendar className="h-3 w-3 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-left">Keine Teammitglieder</p>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}
