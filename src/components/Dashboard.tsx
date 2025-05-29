
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Calendar, Target, Euro, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useCustomers, useRevenues, useTodos } from '@/hooks/useSupabaseData';

export function Dashboard() {
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  
  const { customers, loading: customersLoading } = useCustomers();
  const { revenues, loading: revenuesLoading } = useRevenues();
  const { todos, loading: todosLoading } = useTodos();

  // Calculate statistics from real data
  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
  const activeCustomers = customers.filter(c => 
    ['termin_erschienen', 'termin_abgeschlossen', 'follow_up_kunde', 'follow_up_wir'].includes(c.pipeline_stage)
  ).length;

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

  // Mock appointments for now - you can extend this to fetch from appointments table
  const teamAppointments = [
    { member: "Max Mustermann", client: "Tech Solutions GmbH", date: "Heute, 15:30", type: "Closing" },
    { member: "Anna Schmidt", client: "Digital Marketing AG", date: "Morgen, 09:00", type: "Setting" },
    { member: "Tom Weber", client: "StartUp Innovations", date: "03.01.2025", type: "Follow-up" },
  ];

  const displayedTodos = showAllTodos ? todos : todos.slice(0, 5);
  const displayedAppointments = showAllAppointments ? teamAppointments : teamAppointments.slice(0, 5);

  if (customersLoading || revenuesLoading || todosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist Ihre Übersicht.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
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
                      Weniger anzeigen
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Mehr anzeigen
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedTodos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
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
                  }`}>
                    {todo.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Gelegte Termine vom Team
              </div>
              {teamAppointments.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAllAppointments(!showAllAppointments)}
                  className="flex items-center"
                >
                  {showAllAppointments ? (
                    <>
                      Weniger anzeigen
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Mehr anzeigen
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.member}</p>
                    <p className="text-sm text-gray-600">{appointment.client}</p>
                    <p className="text-xs text-gray-500">{appointment.date}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {appointment.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
