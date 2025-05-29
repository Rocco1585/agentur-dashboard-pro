import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Euro, TrendingUp, CheckCircle, Clock } from "lucide-react";
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
      console.log('Fetching customer data for ID:', customerId);
      console.log('Current user:', user);
      console.log('Is admin:', isAdmin());
      console.log('Is customer:', isCustomer());

      // Wenn kein Benutzer eingeloggt ist
      if (!user) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      // Berechtigungsprüfung: Admin kann alle sehen, Kunde nur sein eigenes
      if (!isAdmin() && user?.id !== customerId) {
        console.log('No permission: user is not admin and user ID does not match customer ID');
        setLoading(false);
        return;
      }

      // Hole Kundendaten - für Admins zuerst aus customers Tabelle
      let finalCustomerData = null;
      
      if (isAdmin()) {
        // Admin kann alle Kunden sehen - zuerst aus customers versuchen
        const { data: customerFromCustomers, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();

        console.log('Customer data from customers table:', customerFromCustomers);

        if (customerError) {
          console.error('Error fetching customer data:', customerError);
        }

        if (customerFromCustomers) {
          finalCustomerData = customerFromCustomers;
        } else {
          // Falls nicht in customers gefunden, aus team_members versuchen
          const { data: teamMemberData, error: teamMemberError } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', customerId)
            .eq('user_role', 'kunde')
            .maybeSingle();

          console.log('Team member data:', teamMemberData);

          if (teamMemberError) {
            console.error('Error fetching team member data:', teamMemberError);
          } else {
            finalCustomerData = teamMemberData;
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

        console.log('Team member data for customer:', teamMemberData);

        if (teamMemberError) {
          console.error('Error fetching team member data:', teamMemberError);
        } else {
          finalCustomerData = teamMemberData;
        }
      }
      
      if (!finalCustomerData) {
        console.log('No customer data found');
        setLoading(false);
        return;
      }

      setCustomerData(finalCustomerData);

      // Fetch appointments für diesen Kunden
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
            booked_appointments,
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

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        console.log('Appointments data:', appointmentsData);
        setAppointments(appointmentsData || []);
      }

      // Fetch revenues nur für Admins
      if (isAdmin()) {
        const { data: revenuesData, error: revenuesError } = await supabase
          .from('revenues')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: false });

        if (revenuesError) {
          console.error('Error fetching revenues:', revenuesError);
        } else {
          setRevenues(revenuesData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
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

  // Wenn kein Benutzer eingeloggt ist
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

  // Doppelte Berechtigungsprüfung
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

  const completedAppointments = appointments.filter(apt => apt.result === 'termin_abgeschlossen').length;
  const pendingAppointments = appointments.filter(apt => apt.result === 'termin_ausstehend').length;
  const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);

  // Group appointments by status for pipeline view
  const appointmentsByStatus = {
    'termin_ausstehend': appointments.filter(apt => apt.result === 'termin_ausstehend'),
    'termin_erschienen': appointments.filter(apt => apt.result === 'termin_erschienen'),
    'termin_abgeschlossen': appointments.filter(apt => apt.result === 'termin_abgeschlossen'),
    'follow_up': appointments.filter(apt => apt.result === 'follow_up'),
    'termin_abgesagt': appointments.filter(apt => apt.result === 'termin_abgesagt'),
    'termin_verschoben': appointments.filter(apt => apt.result === 'termin_verschoben')
  };

  const pipelineColumns = [
    { 
      id: 'termin_ausstehend', 
      title: 'Ausstehend', 
      color: 'bg-blue-600',
      appointments: appointmentsByStatus.termin_ausstehend
    },
    { 
      id: 'termin_erschienen', 
      title: 'Erschienen', 
      color: 'bg-yellow-600',
      appointments: appointmentsByStatus.termin_erschienen
    },
    { 
      id: 'termin_abgeschlossen', 
      title: 'Abgeschlossen', 
      color: 'bg-green-600',
      appointments: appointmentsByStatus.termin_abgeschlossen
    },
    { 
      id: 'follow_up', 
      title: 'Follow Up', 
      color: 'bg-purple-600',
      appointments: appointmentsByStatus.follow_up
    },
    { 
      id: 'termin_abgesagt', 
      title: 'Abgesagt', 
      color: 'bg-red-600',
      appointments: appointmentsByStatus.termin_abgesagt
    },
    { 
      id: 'termin_verschoben', 
      title: 'Verschoben', 
      color: 'bg-orange-600',
      appointments: appointmentsByStatus.termin_verschoben
    }
  ];

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
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine gesamt</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{appointments.length}</div>
            <p className="text-xs text-gray-600 text-left">
              Alle Termine
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

        {isAdmin() && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-left">Umsatz</CardTitle>
              <Euro className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-left">€{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-600 text-left">{revenues.length} Transaktionen</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Termin Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-left text-lg">Termin Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
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
                    console.log('Appointment clicked:', appointment);
                  }}
                  showDeleteButton={false}
                />
              ))}
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Willkommen in Ihrem persönlichen Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-left">
            Hier können Sie Ihre Termine einsehen und den Status Ihrer Projekte verfolgen.
            {isAdmin() && " Als Admin sehen Sie zusätzliche Informationen wie Umsätze und detaillierte Statistiken."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
