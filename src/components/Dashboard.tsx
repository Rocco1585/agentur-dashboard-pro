
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar, Target, Euro, CheckCircle, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useCustomers, useRevenues, useTodos, useAppointments, useExpenses } from '@/hooks/useSupabaseData';
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
  const activeCustomers = customers.filter(c => c.is_active === true).length;

  // Calculate 30-day revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const revenue30Days = revenues
    .filter(r => new Date(r.date) >= thirtyDaysAgo)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  // Today's revenue
  const today = new Date().toISOString().split('T')[0];
  const revenueToday = revenues
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const stats = [
    {
      title: "Umsatz 30 Tage",
      value: `€${revenue30Days.toLocaleString()}`,
      change: "+12%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Umsatz Heute",
      value: `€${revenueToday.toLocaleString()}`,
      change: "+8%",
      icon: Euro,
      color: "text-blue-600",
    },
    {
      title: "Gesamtumsatz",
      value: `€${totalRevenue.toLocaleString()}`,
      change: "+15%",
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Aktive Kunden",
      value: activeCustomers.toString(),
      change: "+3",
      icon: Users,
      color: "text-orange-600",
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist Ihre Übersicht.</p>
      </div>

      {/* Team Notice */}
      {showTeamNotice && teamNotice && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Team-Notiz</h4>
                <p className="text-green-700 text-sm whitespace-pre-wrap">{teamNotice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 font-medium">
                {stat.change} vs. letzter Monat
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming ToDos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Bevorstehende ToDos
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
                      <span className="hidden sm:inline">Weniger anzeigen</span>
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Mehr anzeigen</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedTodos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Keine Todos vorhanden</p>
              ) : (
                displayedTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{todo.title}</p>
                      <p className="text-sm text-gray-600">{todo.description}</p>
                      <p className="text-sm text-gray-500">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Anstehende Termine
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
                      <span className="hidden sm:inline">Weniger anzeigen</span>
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Mehr anzeigen</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming_appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Keine anstehenden Termine</p>
              ) : (
                upcoming_appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.customers?.name || 'Unbekannt'}</p>
                      <p className="text-sm text-gray-600">{appointment.customers?.contact || 'Kein Kontakt'}</p>
                      <p className="text-xs text-gray-500">{new Date(appointment.date).toLocaleDateString('de-DE')}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                      {appointment.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
