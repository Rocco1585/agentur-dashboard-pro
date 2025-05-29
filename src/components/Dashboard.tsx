import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, Star, Clock, Euro, Activity, AlertTriangle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeTeamMembers: 0,
    activeCustomers: 0,
    appointmentsNext7Days: 0,
    totalAppointments: 0,
    topPerformer: 'N/A',
    appointmentsPerDay: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalRevenue: 0
  });
  const [recentRevenues, setRecentRevenues] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [appointmentChartData, setAppointmentChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  
  // State für switchbare Reiter
  const [revenueTimeframe, setRevenueTimeframe] = useState<'daily' | 'weekly'>('daily');
  const [longTermTimeframe, setLongTermTimeframe] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchDashboardStats();
    fetchAlertMessage();
  }, []);

  const fetchAlertMessage = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'dashboard_alert_message')
        .single();

      if (data?.value) {
        setAlertMessage(data.value);
      }
    } catch (error) {
      console.error('Error fetching alert message:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Aktive Teammitglieder
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true);

      // Aktive Kunden
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true);

      // Alle Termine
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('*');

      // Termine in den nächsten 7 Tagen
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0]);

      // Termine in den letzten 7 Tagen
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      const { data: lastWeekAppointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', lastWeek.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0]);

      // Chart Data für Termine der letzten 7 Tage
      const last7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today
      });

      const appointmentData = last7Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayAppointments = allAppointments?.filter(apt => apt.date === dayStr) || [];
        return {
          date: format(day, 'dd.MM', { locale: de }),
          termine: dayAppointments.length
        };
      });
      setAppointmentChartData(appointmentData);

      // Top Performer (Teammitglied mit den meisten abgeschlossenen Terminen)
      const { data: appointmentStats } = await supabase
        .from('appointments')
        .select(`
          team_member_id,
          team_members (name),
          result
        `)
        .in('result', ['termin_abgeschlossen', 'termin_erschienen']);

      let topPerformer = 'N/A';
      if (appointmentStats && appointmentStats.length > 0) {
        const memberStats: { [key: string]: { name: string; count: number } } = {};
        appointmentStats.forEach(appointment => {
          if (appointment.team_member_id && appointment.team_members) {
            const id = appointment.team_member_id;
            const memberName = (appointment.team_members as any)?.name;
            if (!memberStats[id]) {
              memberStats[id] = {
                name: memberName,
                count: 0
              };
            }
            memberStats[id].count++;
          }
        });
        
        const topMember = Object.values(memberStats).reduce((max, current) => 
          current.count > max.count ? current : max, { count: 0, name: 'N/A' });
        
        topPerformer = topMember.name;
      }

      // Termine pro Tag berechnen (letzte 30 Tage)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const recentAppointments = allAppointments?.filter(apt => 
        new Date(apt.date) >= thirtyDaysAgo
      ) || [];
      
      const appointmentsPerDay = recentAppointments.length / 30;

      // Revenue-Statistiken
      const { data: revenues } = await supabase
        .from('revenues')
        .select('*')
        .order('date', { ascending: false });

      // Chart Data für Umsatz der letzten 30 Tage
      const last30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today
      });

      const revenueData = last30Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayRevenues = revenues?.filter(rev => rev.date === dayStr) || [];
        const dayTotal = dayRevenues.reduce((sum, rev) => sum + Number(rev.amount), 0);
        return {
          date: format(day, 'dd.MM', { locale: de }),
          umsatz: Math.round(dayTotal)
        };
      });
      setRevenueChartData(revenueData);

      // Letzte 10 Einnahmen
      const { data: recentRevenuesData } = await supabase
        .from('revenues')
        .select(`
          *,
          customers (name)
        `)
        .order('date', { ascending: false })
        .limit(10);

      // Letzte 10 Ausgaben
      const { data: recentExpensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      setRecentRevenues(recentRevenuesData || []);
      setRecentExpenses(recentExpensesData || []);

      // Revenue-Berechnungen
      const totalRevenue = revenues?.reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;
      
      const todayStr = today.toISOString().split('T')[0];
      const dailyRevenue = revenues?.filter(rev => rev.date === todayStr)
        .reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      const weeklyRevenue = revenues?.filter(rev => new Date(rev.date) >= oneWeekAgo)
        .reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      const monthlyRevenue = revenues?.filter(rev => new Date(rev.date) >= oneMonthAgo)
        .reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const yearlyRevenue = revenues?.filter(rev => new Date(rev.date) >= oneYearAgo)
        .reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;

      setStats({
        activeTeamMembers: teamMembers?.length || 0,
        activeCustomers: customers?.length || 0,
        appointmentsNext7Days: upcomingAppointments?.length || 0,
        totalAppointments: allAppointments?.length || 0,
        topPerformer,
        appointmentsPerDay: Math.round(appointmentsPerDay * 10) / 10,
        dailyRevenue: Math.round(dailyRevenue),
        weeklyRevenue: Math.round(weeklyRevenue),
        monthlyRevenue: Math.round(monthlyRevenue),
        yearlyRevenue: Math.round(yearlyRevenue),
        totalRevenue: Math.round(totalRevenue)
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    termine: {
      label: "Termine",
      color: "hsl(var(--chart-1))",
    },
    umsatz: {
      label: "Umsatz (€)",
      color: "hsl(var(--chart-2))",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-lg text-left">Lade Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <div className="text-left px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Willkommen zurück, {user?.name}</p>
        </div>

        {/* Alert Message from Settings */}
        {alertMessage && (
          <div className="px-2">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {alertMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Revenue Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 px-2">
          {/* Switchable Revenue Card (Daily/Weekly) */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                  {revenueTimeframe === 'daily' ? 'Tagesumsatz' : 'Wochenumsatz'}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant={revenueTimeframe === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRevenueTimeframe('daily')}
                    className="text-xs h-6 px-2"
                  >
                    Tag
                  </Button>
                  <Button
                    variant={revenueTimeframe === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRevenueTimeframe('weekly')}
                    className="text-xs h-6 px-2"
                  >
                    Woche
                  </Button>
                </div>
              </div>
              <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                €{revenueTimeframe === 'daily' ? stats.dailyRevenue : stats.weeklyRevenue}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                {revenueTimeframe === 'daily' ? 'Heute' : 'Letzte 7 Tage'}
              </p>
            </CardContent>
          </Card>

          {/* Switchable Long-term Revenue Card (Monthly/Yearly) */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                  {longTermTimeframe === 'monthly' ? 'Monatsumsatz' : 'Jahresumsatz'}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant={longTermTimeframe === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLongTermTimeframe('monthly')}
                    className="text-xs h-6 px-2"
                  >
                    Monat
                  </Button>
                  <Button
                    variant={longTermTimeframe === 'yearly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLongTermTimeframe('yearly')}
                    className="text-xs h-6 px-2"
                  >
                    Jahr
                  </Button>
                </div>
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                €{longTermTimeframe === 'monthly' ? stats.monthlyRevenue : stats.yearlyRevenue}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                {longTermTimeframe === 'monthly' ? 'Letzter Monat' : 'Letztes Jahr'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Gesamt-Umsatz
              </CardTitle>
              <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                €{stats.totalRevenue}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Alle Zeit
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Aktive Kunden
              </CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                {stats.activeCustomers}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Registrierte Kunden
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Aktive Teammitglieder
              </CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                {stats.activeTeamMembers}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Verfügbare Mitarbeiter
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team & Appointment Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Termine Gesamt
              </CardTitle>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                {stats.totalAppointments}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Alle Termine
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Termine (7 Tage)
              </CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                {stats.appointmentsNext7Days}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Kommende Woche
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Top Performer
              </CardTitle>
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-sm sm:text-base font-bold text-gray-900 text-left truncate">
                {stats.topPerformer}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Beste Performance
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 text-left">
                Termine/Tag
              </CardTitle>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left">
                {stats.appointmentsPerDay}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Durchschnitt (30 Tage)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Now stacked vertically */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 px-2">
          {/* Appointments Chart */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-left flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Termine der letzten 7 Tage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="termine" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-left flex items-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                Umsatz der letzten 30 Tage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="umsatz" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 px-2">
          {/* Recent Revenues */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-left flex items-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                Letzte 10 Einnahmen
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              {recentRevenues.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentRevenues.map((revenue) => (
                    <div key={revenue.id} className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-lg">
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{revenue.description}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(revenue.date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                        {revenue.customers && (
                          <p className="text-xs sm:text-sm text-blue-600 truncate">Kunde: {revenue.customers.name}</p>
                        )}
                      </div>
                      <span className="text-sm sm:text-lg font-bold text-green-600 ml-2">€{Math.round(revenue.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">Keine Einnahmen vorhanden</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="p-6 sm:p-8">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 text-left flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                Letzte 10 Ausgaben
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-0">
              {recentExpenses.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-lg">
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{expense.description}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(expense.date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                        {expense.reference && (
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Ref: {expense.reference}</p>
                        )}
                      </div>
                      <span className="text-sm sm:text-lg font-bold text-red-600 ml-2">€{Math.round(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">Keine Ausgaben vorhanden</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
