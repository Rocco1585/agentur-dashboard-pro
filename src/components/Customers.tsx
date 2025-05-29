
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, User, Phone, Mail, Plus, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CreateCustomerForm } from './CreateCustomerForm';
import { CustomerDetail } from './CustomerDetail';
import { PipelineColumn } from './PipelineColumn';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLocation } from 'react-router-dom';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

export function Customers() {
  const location = useLocation();
  const { canCreateCustomers, canEditCustomers, canViewCustomers } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'

  useEffect(() => {
    fetchCustomers();
    fetchAppointments();
    
    // Check if we need to show a specific customer
    if (location.state?.selectedCustomerId) {
      const customerId = location.state.selectedCustomerId;
      fetchCustomerById(customerId);
    }
  }, [location.state]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Fehler",
        description: "Kunden konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
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
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchCustomerById = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const deleteCustomer = async (customerId: string, customerName: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.filter(customer => customer.id !== customerId));
      toast({
        title: "Kunde gelöscht",
        description: `${customerName} wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht gelöscht werden.",
        variant: "destructive",
      });
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
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch':
        return 'bg-red-100 text-red-800';
      case 'Mittel':
        return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bezahlt':
        return 'bg-green-100 text-green-800';
      case 'Ausstehend':
        return 'bg-yellow-100 text-yellow-800';
      case 'Überfällig':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      title: 'Termin Ausstehend', 
      color: 'bg-blue-600',
      appointments: appointmentsByStatus.termin_ausstehend
    },
    { 
      id: 'termin_erschienen', 
      title: 'Termin Erschienen', 
      color: 'bg-yellow-600',
      appointments: appointmentsByStatus.termin_erschienen
    },
    { 
      id: 'termin_abgeschlossen', 
      title: 'Termin Abgeschlossen', 
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
      title: 'Termin Abgesagt', 
      color: 'bg-red-600',
      appointments: appointmentsByStatus.termin_abgesagt
    },
    { 
      id: 'termin_verschoben', 
      title: 'Termin Verschoben', 
      color: 'bg-orange-600',
      appointments: appointmentsByStatus.termin_verschoben
    }
  ];

  if (!canViewCustomers()) {
    return (
      <div className="w-full px-4 py-4">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Berechtigung</h3>
            <p className="text-gray-600 text-left">Sie haben keine Berechtigung, Kunden zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-4 min-h-screen">
        <div className="text-lg text-left">Lade Kunden...</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="w-full px-4 py-4 min-h-screen">
        <CreateCustomerForm 
          onClose={() => setShowCreateForm(false)}
          onCustomerCreated={fetchCustomers}
        />
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div className="w-full px-4 py-4 min-h-screen">
        <CustomerDetail 
          customer={selectedCustomer}
          onCustomerUpdated={() => {
            fetchCustomers();
            setSelectedCustomer(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 min-h-screen space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kunden</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setViewMode(viewMode === 'list' ? 'pipeline' : 'list')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {viewMode === 'list' ? 'Pipeline Ansicht' : 'Listen Ansicht'}
          </Button>
          {canCreateCustomers() && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuen Kunden hinzufügen
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'pipeline' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipelineColumns.map((column) => (
              <PipelineColumn
                key={column.id}
                title={column.title}
                stageId={column.id}
                customers={column.appointments}
                color={column.color}
                onCustomerClick={(appointment) => {
                  if (appointment.customers) {
                    setSelectedCustomer(appointment.customers);
                  }
                }}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-4 w-4" />
            <Input
              placeholder="Kunden suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-red-600" />
                      <span className="text-lg">{customer.name}</span>
                    </div>
                    <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-left">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(customer.priority)}>
                      {customer.priority}
                    </Badge>
                    <Badge className={getStatusColor(customer.payment_status)}>
                      {customer.payment_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    
                    {canEditCustomers() && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kunde löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie {customer.name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCustomer(customer.id, customer.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Keine Kunden gefunden</h3>
                <p className="text-gray-600 mb-4 text-center">
                  {customers.length === 0 
                    ? "Fügen Sie Ihren ersten Kunden hinzu, um zu beginnen."
                    : "Keine Kunden entsprechen Ihren Suchkriterien."
                  }
                </p>
                {customers.length === 0 && canCreateCustomers() && (
                  <Button onClick={() => setShowCreateForm(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Ersten Kunden hinzufügen
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
