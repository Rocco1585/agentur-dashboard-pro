
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Euro, TrendingUp, CheckCircle, Clock, User } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PipelineColumn } from './PipelineColumn';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { toast } from "@/hooks/use-toast";

export function CustomerDashboardView() {
  const { customerId } = useParams();
  const { user, isAdmin, isCustomer } = useAuth();
  const [customerData, setCustomerData] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId, user]);

  const fetchCustomerData = async () => {
    try {
      console.log('🔍 Fetching customer data for ID:', customerId);
      console.log('👤 Current user:', user);
      console.log('🛡️ Is admin:', isAdmin());
      console.log('👥 Is customer:', isCustomer());

      if (!user) {
        console.log('❌ No user logged in');
        setLoading(false);
        return;
      }

      if (!isAdmin() && user?.id !== customerId) {
        console.log('❌ No permission: user is not admin and user ID does not match customer ID');
        setLoading(false);
        return;
      }

      // Hole Kundendaten
      let finalCustomerData = null;
      
      if (isAdmin()) {
        // Admin: Zuerst aus customers Tabelle versuchen
        const { data: customerFromCustomers, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();

        console.log('📊 Customer data from customers table:', customerFromCustomers);

        if (customerError) {
          console.error('❌ Error fetching customer data:', customerError);
        }

        if (customerFromCustomers) {
          finalCustomerData = customerFromCustomers;
          console.log('✅ Using customer from customers table');
        } else {
          // Falls nicht in customers gefunden, aus team_members versuchen
          const { data: teamMemberData, error: teamMemberError } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', customerId)
            .eq('user_role', 'kunde')
            .maybeSingle();

          console.log('👥 Team member data:', teamMemberData);

          if (teamMemberError) {
            console.error('❌ Error fetching team member data:', teamMemberError);
          } else if (teamMemberData) {
            finalCustomerData = teamMemberData;
            console.log('✅ Using customer from team_members table');
          }
        }
      } else {
        // Nicht-Admin: Nur eigenes Dashboard aus team_members
        const { data: teamMemberData, error: teamMemberError } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', customerId)
          .eq('user_role', 'kunde')
          .maybeSingle();

        console.log('👥 Team member data for customer:', teamMemberData);

        if (teamMemberError) {
          console.error('❌ Error fetching team member data:', teamMemberError);
        } else if (teamMemberData) {
          finalCustomerData = teamMemberData;
          console.log('✅ Using customer from team_members table');
        }
      }
      
      if (!finalCustomerData) {
        console.log('❌ No customer data found');
        setLoading(false);
        return;
      }

      console.log('🎯 Final customer data:', finalCustomerData);
      setCustomerData(finalCustomerData);

      // Fetch appointments für diesen Kunden
      console.log('📅 Fetching appointments for customer ID:', customerId);
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone,
            contact,
            priority,
            payment_status,
            satisfaction,
            purchased_appointments,
            completed_appointments,
            pipeline_stage
          ),
          team_members (
            id,
            name,
            role
          )
        `)
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      console.log('📅 Appointments query result:', { appointmentsData, appointmentsError });

      if (appointmentsError) {
        console.error('❌ Error fetching appointments:', appointmentsError);
      } else {
        console.log(`✅ Found ${appointmentsData?.length || 0} appointments`);
        console.log('📋 Raw appointments data:', appointmentsData);
        setAppointments(appointmentsData || []);
      }

      // Fetch revenues für diesen Kunden
      console.log('💰 Fetching revenues for customer ID:', customerId);
      const { data: revenuesData, error: revenuesError } = await supabase
        .from('revenues')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      console.log('💰 Revenues query result:', { revenuesData, revenuesError });

      if (revenuesError) {
        console.error('❌ Error fetching revenues:', revenuesError);
      } else {
        console.log(`✅ Found ${revenuesData?.length || 0} revenues`);
        setRevenues(revenuesData || []);
      }

    } catch (error) {
      console.error('❌ Error in fetchCustomerData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ result: newStatus })
        .eq('id', draggableId);

      if (error) throw error;

      // Update local state
      setAppointments(prev => prev.map(appointment => 
        appointment.id === draggableId 
          ? { ...appointment, result: newStatus }
          : appointment
      ));

      toast({
        title: "Status aktualisiert",
        description: "Der Terminstatus wurde erfolgreich geändert.",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Lade Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mt-2 text-left">
            Bitte melden Sie sich an, um auf das Dashboard zuzugreifen.
          </p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Kunde nicht gefunden</h1>
          <p className="text-gray-600 mt-2 text-left">Der angeforderte Kunde wurde nicht gefunden oder Sie haben keine Berechtigung, diese Seite zu betrachten.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin() && (user?.id !== customerId || !isCustomer())) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Keine Berechtigung</h1>
          <p className="text-gray-600 mt-2 text-left">Sie haben keine Berechtigung, diese Seite zu betrachten.</p>
        </div>
      </div>
    );
  }

  // Berechne Statistiken
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(apt => apt.result === 'termin_abgeschlossen').length;
  const pendingAppointments = appointments.filter(apt => apt.result === 'termin_ausstehend').length;
  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
  const averageRevenuePerAppointment = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

  // Bevorstehende Termine (sortiert nach Datum)
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date() && apt.result === 'termin_ausstehend')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Group appointments by status for pipeline view
  const appointmentsByStatus = {
    'termin_ausstehend': appointments.filter(apt => apt.result === 'termin_ausstehend'),
    'termin_erschienen': appointments.filter(apt => apt.result === 'termin_erschienen'),
    'termin_abgeschlossen': appointments.filter(apt => apt.result === 'termin_abgeschlossen'),
    'follow_up': appointments.filter(apt => apt.result === 'follow_up'),
    'termin_abgesagt': appointments.filter(apt => apt.result === 'termin_abgesagt'),
    'termin_verschoben': appointments.filter(apt => apt.result === 'termin_verschoben')
  };

  // Konvertiere appointments für PipelineColumn - die erwartet customers mit pipeline_stage
  const convertAppointmentForPipeline = (appointments) => {
    console.log('🔧 Converting appointments for pipeline:', appointments);
    return appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      description: appointment.description,
      result: appointment.result,
      notes: appointment.notes,
      customers: {
        id: customerData.id,
        name: customerData.name || 'Unbekannter Kunde',
        email: customerData.email || appointment.customers?.email || '',
        phone: customerData.phone || appointment.customers?.phone || '',
        contact: customerData.contact || customerData.name || appointment.customers?.contact || '',
        priority: appointment.customers?.priority || 'Mittel',
        payment_status: appointment.customers?.payment_status || 'Ausstehend',
        satisfaction: appointment.customers?.satisfaction || 5,
        booked_appointments: appointment.customers?.booked_appointments || 0,
        completed_appointments: appointment.customers?.completed_appointments || 0,
        pipeline_stage: appointment.result
      },
      team_members: appointment.team_members
    }));
  };

  // Passe Termine für PipelineColumn an
  const pipelineColumns = [
    { 
      id: 'termin_ausstehend', 
      title: 'Ausstehend', 
      color: 'bg-blue-600',
      appointments: convertAppointmentForPipeline(appointmentsByStatus.termin_ausstehend)
    },
    { 
      id: 'termin_erschienen', 
      title: 'Erschienen', 
      color: 'bg-yellow-600',
      appointments: convertAppointmentForPipeline(appointmentsByStatus.termin_erschienen)
    },
    { 
      id: 'termin_abgeschlossen', 
      title: 'Abgeschlossen', 
      color: 'bg-green-600',
      appointments: convertAppointmentForPipeline(appointmentsByStatus.termin_abgeschlossen)
    },
    { 
      id: 'follow_up', 
      title: 'Follow Up', 
      color: 'bg-purple-600',
      appointments: convertAppointmentForPipeline(appointmentsByStatus.follow_up)
    },
    { 
      id: 'termin_abgesagt', 
      title: 'Abgesagt', 
      color: 'bg-red-600',
      appointments: convertAppointmentForPipeline(appointmentsByStatus.termin_abgesagt)
    },
    { 
      id: 'termin_verschoben', 
      title: 'Verschoben', 
      color: 'bg-orange-600',
      appointments: convertAppointmentForPipeline(appointmentsByStatus.termin_verschoben)
    }
  ];

  console.log('🏗️ Pipeline columns prepared:', pipelineColumns.map(col => ({
    id: col.id,
    title: col.title,
    appointmentCount: col.appointments.length,
    sampleAppointment: col.appointments[0] ? {
      id: col.appointments[0].id,
      customerName: col.appointments[0].customers?.name,
      type: col.appointments[0].type
    } : null
  })));

  return (
    <div className="space-y-6 p-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 text-left">
          {customerData.customer_dashboard_name || customerData.name || 'Kunden Dashboard'}
        </h1>
        <p className="text-gray-600 text-left">Willkommen, {customerData.name}</p>
        {isAdmin() && (
          <Badge className="mt-2 bg-red-100 text-red-800">
            Admin-Ansicht für {customerData.name}
          </Badge>
        )}
        {/* Debug Info für Admin */}
        {isAdmin() && (
          <div className="mt-2 text-xs text-gray-500">
            Debug: Customer ID: {customerId} | Termine: {appointments.length} | Einnahmen: {revenues.length}
          </div>
        )}
      </div>

      {/* Übersichts-Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine gesamt</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{totalAppointments}</div>
            <p className="text-xs text-gray-600 text-left">
              Alle gebuchten Termine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{completedAppointments}</div>
            <p className="text-xs text-gray-600 text-left">
              Erfolgreich abgeschlossen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{pendingAppointments}</div>
            <p className="text-xs text-gray-600 text-left">
              Noch zu erledigen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Gesamtumsatz</CardTitle>
            <Euro className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-600 text-left">
              ⌀ €{averageRevenuePerAppointment.toFixed(2)} pro Termin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bevorstehende Termine */}
      <Card>
        <CardHeader>
          <CardTitle className="text-left text-lg">Bevorstehende Termine</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-left">{appointment.type}</p>
                      <p className="text-sm text-gray-600 text-left">
                        {new Date(appointment.date).toLocaleDateString('de-DE')}
                        {appointment.time && ` um ${appointment.time}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.team_members && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600 text-left">{appointment.team_members.name}</span>
                      </div>
                    )}
                    <Badge className="bg-blue-100 text-blue-800">
                      {appointment.result.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-center py-4 text-left">
              {appointments.length === 0 ? 
                "Keine Termine gefunden. Überprüfen Sie die Verknüpfung zwischen Kunde und Terminen." : 
                "Keine bevorstehenden Termine"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Einnahmen Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="text-left text-lg">Einnahmen Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          {revenues.length > 0 ? (
            <div className="space-y-3">
              {revenues.slice(0, 5).map((revenue) => (
                <div key={revenue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-left">{revenue.description}</p>
                    <p className="text-sm text-gray-600 text-left">
                      {new Date(revenue.date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-left">€{Number(revenue.amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {revenues.length > 5 && (
                <p className="text-sm text-gray-600 text-center text-left">
                  ...und {revenues.length - 5} weitere Einnahmen
                </p>
              )}
            </div>
          ) : (
            <div className="text-gray-600 text-center py-4 text-left">
              {appointments.length === 0 ? 
                "Keine Einnahmen gefunden. Überprüfen Sie die Verknüpfung zwischen Kunde und Einnahmen." : 
                "Keine Einnahmen verzeichnet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Termin Pipeline mit Drag & Drop */}
      <Card>
        <CardHeader>
          <CardTitle className="text-left text-lg">Termin Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {pipelineColumns.map((column) => (
                  <PipelineColumn
                    key={column.id}
                    title={column.title}
                    stageId={column.id}
                    customers={column.appointments}
                    color={column.color}
                    onCustomerClick={(appointment) => {
                      console.log('Appointment clicked in pipeline:', appointment);
                    }}
                    showDeleteButton={false}
                  />
                ))}
              </div>
            </DragDropContext>
          ) : (
            <div className="text-gray-600 text-center py-8 text-left">
              <p>Keine Termine für Pipeline verfügbar.</p>
              <p className="text-sm mt-2">Stellen Sie sicher, dass Termine mit der korrekten customer_id verknüpft sind.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
