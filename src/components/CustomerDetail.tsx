
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, X, User, Mail, Phone, Calendar, Euro, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useRevenues } from '@/hooks/useSupabaseData';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface CustomerDetailProps {
  customer: any;
  onBack: () => void;
  onUpdate: (customer: any) => void;
}

export function CustomerDetail({ customer, onBack, onUpdate }: CustomerDetailProps) {
  const { revenues, addRevenue } = useRevenues();
  const [customerRevenues, setCustomerRevenues] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newRevenue, setNewRevenue] = useState({ amount: '', description: '' });
  const [newAppointment, setNewAppointment] = useState({ date: '', type: '', result: '' });
  const [statuses, setStatuses] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const pipelineStages = [
    { id: 'termin_ausstehend', name: 'Termin Ausstehend', color: 'bg-gray-500' },
    { id: 'termin_erschienen', name: 'Termin Erschienen', color: 'bg-blue-500' },
    { id: 'termin_abgeschlossen', name: 'Termin Abgeschlossen', color: 'bg-green-500' },
    { id: 'follow_up_kunde', name: 'Follow-up Kunde', color: 'bg-yellow-500' },
    { id: 'follow_up_wir', name: 'Follow-up Wir', color: 'bg-purple-500' },
    { id: 'verloren', name: 'Verloren', color: 'bg-red-500' },
  ];

  useEffect(() => {
    if (customer) {
      setStatuses(Array.isArray(customer.statuses) ? customer.statuses : []);
      setNotes(customer.notes || '');
      fetchCustomerData();
    }
  }, [customer]);

  const fetchCustomerData = async () => {
    try {
      // Fetch revenues for this customer
      const { data: revenueData } = await supabase
        .from('revenues')
        .select('*')
        .eq('customer_id', customer.id)
        .order('date', { ascending: false });
      
      setCustomerRevenues(revenueData || []);

      // Fetch appointments for this customer
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('date', { ascending: false });
      
      setAppointments(appointmentData || []);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const getAppointmentsByStage = (stageId: string) => {
    return appointments.filter(appointment => appointment.result === stageId);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ result: newStage })
        .eq('id', draggableId);

      if (error) throw error;
      
      fetchCustomerData();
      
      toast({
        title: "Termin aktualisiert",
        description: "Termin-Status wurde erfolgreich geändert.",
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const addStatus = async () => {
    if (newStatus.trim() && !statuses.includes(newStatus.trim())) {
      const updatedStatuses = [...statuses, newStatus.trim()];
      setStatuses(updatedStatuses);
      
      const updatedCustomer = { ...customer, statuses: updatedStatuses };
      await updateCustomerInDB(updatedCustomer);
      onUpdate(updatedCustomer);
      setNewStatus('');
      
      toast({
        title: "Status hinzugefügt",
        description: `Status "${newStatus}" wurde hinzugefügt.`,
      });
    }
  };

  const removeStatus = async (statusToRemove: string) => {
    const updatedStatuses = statuses.filter(status => status !== statusToRemove);
    setStatuses(updatedStatuses);
    
    const updatedCustomer = { ...customer, statuses: updatedStatuses };
    await updateCustomerInDB(updatedCustomer);
    onUpdate(updatedCustomer);
    
    toast({
      title: "Status entfernt",
      description: `Status "${statusToRemove}" wurde entfernt.`,
    });
  };

  const updateCustomerInDB = async (updatedCustomer: any) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updatedCustomer)
        .eq('id', customer.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleAddRevenue = async () => {
    if (newRevenue.amount && newRevenue.description) {
      await addRevenue({
        customer_id: customer.id,
        description: newRevenue.description,
        amount: parseFloat(newRevenue.amount),
        date: new Date().toISOString().split('T')[0]
      });
      setNewRevenue({ amount: '', description: '' });
      fetchCustomerData();
    }
  };

  const handleAddAppointment = async () => {
    if (newAppointment.date && newAppointment.type) {
      try {
        const { error } = await supabase
          .from('appointments')
          .insert({
            customer_id: customer.id,
            date: newAppointment.date,
            type: newAppointment.type,
            result: newAppointment.result || 'termin_ausstehend'
          });

        if (error) throw error;
        
        setNewAppointment({ date: '', type: '', result: '' });
        fetchCustomerData();
        
        toast({
          title: "Termin hinzugefügt",
          description: "Neuer Termin wurde erfolgreich hinzugefügt.",
        });
      } catch (error) {
        console.error('Error adding appointment:', error);
        toast({
          title: "Fehler",
          description: "Termin konnte nicht hinzugefügt werden.",
          variant: "destructive",
        });
      }
    }
  };

  const saveNotes = async () => {
    const updatedCustomer = { ...customer, notes };
    await updateCustomerInDB(updatedCustomer);
    onUpdate(updatedCustomer);
    
    toast({
      title: "Notizen gespeichert",
      description: "Die Notizen wurden erfolgreich gespeichert.",
    });
  };

  const totalRevenue = customerRevenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600">{customer.contact} • {customer.email}</p>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Gesamtumsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">€{totalRevenue}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Termine gebucht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-600">{customer.booked_appointments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Termine gelegt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-purple-600">{customer.completed_appointments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Zufriedenheit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-2xl font-bold text-orange-600">{customer.satisfaction}/10</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kontaktdaten & Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Ansprechpartner:</strong> {customer.contact}</div>
            <div><strong>Email:</strong> {customer.email}</div>
            <div><strong>Telefon:</strong> {customer.phone}</div>
            <div><strong>Priorität:</strong> 
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">{customer.priority}</Badge>
            </div>
            <div><strong>Zahlungsstatus:</strong> 
              <Badge className="ml-2 bg-green-100 text-green-800">{customer.payment_status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px]"
              placeholder="Notizen über den Kunden..."
            />
            <Button className="mt-2" onClick={saveNotes}>Notizen speichern</Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Status Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status, index) => (
              <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                {status}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStatus(status)}
                  className="h-4 w-4 p-0 hover:bg-red-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Neuen Status hinzufügen"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addStatus()}
            />
            <Button onClick={addStatus}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Appointment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600">
            <Calendar className="h-5 w-5 mr-2" />
            Neuen Termin hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
            />
            <Select value={newAppointment.type} onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Termintyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Setting">Setting</SelectItem>
                <SelectItem value="Closing">Closing</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newAppointment.result} onValueChange={(value) => setNewAppointment({...newAppointment, result: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="termin_ausstehend">Termin Ausstehend</SelectItem>
                <SelectItem value="termin_erschienen">Termin Erschienen</SelectItem>
                <SelectItem value="termin_abgeschlossen">Termin Abgeschlossen</SelectItem>
                <SelectItem value="follow_up_kunde">Follow-up Kunde</SelectItem>
                <SelectItem value="follow_up_wir">Follow-up Wir</SelectItem>
                <SelectItem value="verloren">Verloren</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddAppointment}>Hinzufügen</Button>
          </div>
        </CardContent>
      </Card>

      {/* Termin-Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Termin-Pipeline</CardTitle>
          <p className="text-sm text-gray-600">Verwalten Sie die Termine per Drag & Drop</p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineStages.map((stage) => (
                <div key={stage.id} className="flex-1 min-w-64">
                  <Card className="h-full">
                    <CardHeader className={`${stage.color} text-white`}>
                      <CardTitle className="text-center text-sm">
                        {stage.name} ({getAppointmentsByStage(stage.id).length})
                      </CardTitle>
                    </CardHeader>
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <CardContent
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-2 p-3 min-h-48 ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : ''
                          }`}
                        >
                          {getAppointmentsByStage(stage.id).map((appointment, index) => (
                            <Draggable key={appointment.id} draggableId={appointment.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-pointer transition-all hover:shadow-md ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                  }`}
                                >
                                  <CardContent className="p-3 space-y-1">
                                    <div className="font-semibold text-sm">{appointment.type}</div>
                                    <div className="text-xs text-gray-600">
                                      {new Date(appointment.date).toLocaleDateString('de-DE')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {customer.contact}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {customer.phone}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {customer.email}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </CardContent>
                      )}
                    </Droppable>
                  </Card>
                </div>
              ))}
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Add New Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Plus className="h-5 w-5 mr-2" />
            Neue Einnahme hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Beschreibung"
              value={newRevenue.description}
              onChange={(e) => setNewRevenue({...newRevenue, description: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Betrag (€)"
              value={newRevenue.amount}
              onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
            />
            <Button onClick={handleAddRevenue}>Hinzufügen</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Letzte Einnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customerRevenues.slice(0, 5).map(revenue => (
                <div key={revenue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{revenue.description}</div>
                    <div className="text-xs text-gray-600">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                  </div>
                  <span className="font-bold text-green-600">€{revenue.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Letzte Termine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments.slice(0, 5).map(appointment => (
                <div key={appointment.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{appointment.type}</div>
                  <div className="text-xs text-gray-600">{new Date(appointment.date).toLocaleDateString('de-DE')}</div>
                  <Badge className="text-xs mt-1">{pipelineStages.find(s => s.id === appointment.result)?.name || appointment.result}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
