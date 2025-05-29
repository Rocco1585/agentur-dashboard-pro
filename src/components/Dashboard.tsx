
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Star, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeTeamMembers: 0,
    activeCustomers: 0,
    appointmentsNext7Days: 0,
    topPerformer: 'N/A',
    appointmentsPerDay: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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

      // Termine in den nächsten 7 Tagen
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', nextWeek.toISOString().split('T')[0]);

      // Alle Termine für Durchschnitt pro Tag
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('*');

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

      setStats({
        activeTeamMembers: teamMembers?.length || 0,
        activeCustomers: customers?.length || 0,
        appointmentsNext7Days: upcomingAppointments?.length || 0,
        topPerformer,
        appointmentsPerDay: Math.round(appointmentsPerDay * 10) / 10
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-lg text-left">Lade Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Willkommen zurück, {user?.name}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm font-medium text-gray-600 text-left">
                Aktive Teammitglieder
              </CardTitle>
              <Users className="h-5 w-5 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
                {stats.activeTeamMembers}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Verfügbare Mitarbeiter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm font-medium text-gray-600 text-left">
                Aktive Kunden
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
                {stats.activeCustomers}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Registrierte Kunden
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm font-medium text-gray-600 text-left">
                Termine 7 Tage
              </CardTitle>
              <Calendar className="h-5 w-5 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
                {stats.appointmentsNext7Days}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Kommende Woche
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm font-medium text-gray-600 text-left">
                Top Performer
              </CardTitle>
              <Star className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-lg sm:text-xl font-bold text-gray-900 text-left truncate">
                {stats.topPerformer}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Beste Performance
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-sm font-medium text-gray-600 text-left">
                Termine/Tag
              </CardTitle>
              <Clock className="h-5 w-5 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
                {stats.appointmentsPerDay}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left">
                Durchschnitt (30 Tage)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 text-left">
              Willkommen in Ihrem Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-left">
              Hier erhalten Sie einen Überblick über die wichtigsten Kennzahlen Ihres Unternehmens. 
              Nutzen Sie die Navigation, um zu den verschiedenen Bereichen zu gelangen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
