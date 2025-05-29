import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar, Target, Euro, CheckCircle, ChevronDown, ChevronUp, MessageSquare, Calculator } from "lucide-react";
import { useCustomers, useRevenues, useTodos, useAppointments, useExpenses } from '@/hooks/useSupabaseData';
import { useTaxSettings } from '@/hooks/useTaxSettings';
import { supabase } from '@/integrations/supabase/client';

export function Dashboard() {
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [teamNotice, setTeamNotice] = useState('');
  const [showTeamNotice, setShowTeamNotice] = useState(false);
  
  const { customers, loading: customersLoading } = useCustomers();
  const { revenues, loading: revenuesLoading } = useRevenues();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { todos, loading: todosLoading } = useTodos();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { taxRate } = useTaxSettings();

  const pipelineStages = [
    { id: 'termin_ausstehend', name: 'Termin Ausstehend' },
    { id: 'termin_erschienen', name: 'Termin Erschienen' },
    { id: 'termin_abgeschlossen', name: 'Termin Abgeschlossen' },
    { id: 'follow_up', name: 'Follow-up' },
    { id: 'verloren', name: 'Verloren' },
  ];

  useEffect(() => {
    fetchTeamNotice();
  }, []);

  const fetchTeamNotice = async () => {
    try {
      const { data: noticeData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'team_notice')
        .single();
      
      const { data: showData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'show_team_notice')
        .single();
      
      if (noticeData) setTeamNotice(noticeData.value);
      if (showData) setShowTeamNotice(showData.value === 'true');
    } catch (error) {
      console.log('No team notice settings found');
    }
  };

  // Calculate statistics from real data
  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const taxReserve = netProfit > 0 ? (netProfit * taxRate) / 100 : 0;
  const activeCustomers = customers.filter(c => c.is_active === true).length;

  // Calculate 30-day revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenue30Days = revenues
    .filter(r => new Date(r.date) >= thirtyDaysAgo)
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const expenses30Days = expenses
    .filter(e => new Date(e.date) >= thirtyDaysAgo)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit30Days = revenue30Days - expenses30Days;
  const taxReserve30Days = netProfit30Days > 0 ? (netProfit30Days * taxRate) / 100 : 0;

  // Today's revenue
  const today = new Date().toISOString().split('T')[0];
  const revenueToday = revenues
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const expensesToday = expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfitToday = revenueToday - expensesToday;
  const taxReserveToday = netProfitToday > 0 ? (netProfitToday * taxRate) / 100 : 0;

  const stats = [
    {
      title: "Umsatz 30 Tage",
      value: `€${revenue30Days.toLocaleString()}`,
      change: "+12%",
      icon: TrendingUp,
      color: "text-red-600",
    },
    {
      title: "Steuerrücklage 30 Tage",
      value: `€${taxReserve30Days.toLocaleString()}`,
      change: `${taxRate}%`,
      icon: Calculator,
      color: "text-red-600",
    },
    {
      title: "Gesamtumsatz",
      value: `€${totalRevenue.toLocaleString()}`,
      change: "+15%",
      icon: Target,
      color: "text-red-600",
    },
    {
      title: "Aktive Kunden",
      value: activeCustomers.toString(),
      change: "+3",
      icon: Users,
      color: "text-red-600",
    },
  ];

  // Filter appointments for today and upcoming (chronologically from today)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  const upcoming_appointments = appointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= todayDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, showAllAppointments ? undefined : 5);

  const displayedTodos = showAllTodos ? todos : todos.slice(0, 5);

  if (customersLoading || revenuesLoading || expensesLoading || todosLoading || appointmentsLoading) {
    return (
      <div className="w-full p-4">
        <div className="text-lg text-gray-900 text-left">Lade Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none p-4">
      <div className="w-full text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-left">Dashboard</h1>
        <p className="text-gray-600 text-left">Willkommen zurück! Hier ist Ihre Übersicht.</p>
      </div>

      {/* Team Notice */}
      {showTeamNotice && teamNotice && (
        <div className="w-full mt-6">
          <Card className="bg-red-50 border-red-200 w-full">
            <CardContent className="p-4 w-full">
              <div className="flex items-start text-left w-full">
                <MessageSquare className="h-5 w-5 text-red-600 mr-2 mt-1 flex-shrink-0" />
                <div className="w-full text-left">
                  <h4 className="font-semibold text-gray-900 mb-1 text-left">Team-Notiz</h4>
                  <p className="text-gray-900 text-sm whitespace-pre-wrap text-left">{teamNotice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Grid */}
      <div className="w-full mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
                <CardTitle className="text-sm font-medium text-gray-900 text-left flex items-center">
                  <stat.icon className={`h-5 w-5 ${stat.color} mr-2`} />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left w-full">
                <div className="text-xl lg:text-2xl font-bold text-gray-900 text-left">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium text-left">
                  {stat.change} vs. letzter Monat
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lower Section */}
      <div className="w-full mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Upcoming ToDos */}
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="flex items-center justify-between w-full text-left">
                <div className="flex items-center text-left">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  <span className="text-gray-900">Bevorstehende ToDos</span>
                </div>
                {todos.length > 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAllTodos(!showAllTodos)}
                    className="flex items-center"
                  >
                    {showAllTodos ? (
                      <>
                        <span className="hidden sm:inline text-gray-900">Weniger anzeigen</span>
                        <ChevronUp className="h-4 w-4 ml-1 text-red-600" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline text-gray-900">Mehr anzeigen</span>
                        <ChevronDown className="h-4 w-4 ml-1 text-red-600" />
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <div className="space-y-4 w-full">
                {displayedTodos.length === 0 ? (
                  <p className="text-gray-900 py-4 text-left">Keine Todos vorhanden</p>
                ) : (
                  displayedTodos.map((todo) => (
                    <div key={todo.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg w-full">
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-left">{todo.title}</p>
                        <p className="text-sm text-gray-900 text-left">{todo.description}</p>
                        <p className="text-sm text-gray-700 text-left">
                          {todo.due_date ? new Date(todo.due_date).toLocaleDateString('de-DE') : 'Kein Datum'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        todo.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                        todo.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      } ml-2 flex-shrink-0`}>
                        {todo.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Appointments */}
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="flex items-center justify-between w-full text-left">
                <div className="flex items-center text-left">
                  <CheckCircle className="h-5 w-5 mr-2 text-red-600" />
                  <span className="text-gray-900">Anstehende Termine</span>
                </div>
                {appointments.length > 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAllAppointments(!showAllAppointments)}
                    className="flex items-center"
                  >
                    {showAllAppointments ? (
                      <>
                        <span className="hidden sm:inline text-gray-900">Weniger anzeigen</span>
                        <ChevronUp className="h-4 w-4 ml-1 text-red-600" />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline text-gray-900">Mehr anzeigen</span>
                        <ChevronDown className="h-4 w-4 ml-1 text-red-600" />
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <div className="space-y-4 w-full">
                {upcoming_appointments.length === 0 ? (
                  <p className="text-gray-900 py-4 text-left">Keine anstehenden Termine</p>
                ) : (
                  upcoming_appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg w-full">
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-left">{appointment.customers?.name || 'Unbekannt'}</p>
                        <p className="text-sm text-gray-900 text-left">{appointment.customers?.contact || 'Kein Kontakt'}</p>
                        <p className="text-xs text-gray-700 text-left">{new Date(appointment.date).toLocaleDateString('de-DE')}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                        {pipelineStages.find(stage => stage.id === appointment.result)?.name || appointment.result}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
