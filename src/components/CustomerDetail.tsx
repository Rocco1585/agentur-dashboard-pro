
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, X, User, Mail, Phone, Calendar, Euro, TrendingUp, Edit, Save, Trash2, MessageSquare, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useRevenues, useTeamMembers } from '@/hooks/useSupabaseData';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CustomerDetailProps {
  customer: any;
  onBack: () => void;
  onUpdate: (customer: any) => void;
}

export function CustomerDetail({ customer, onBack, onUpdate }: CustomerDetailProps) {
  const { revenues, addRevenue } = useRevenues();
  const { teamMembers } = useTeamMembers();
  const [customerRevenues, setCustomerRevenues] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newRevenue, setNewRevenue] = useState({ amount: '', description: '' });
  const [newAppointment, setNewAppointment] = useState({ 
    company: '', 
    contact: '', 
    phone: '', 
    date: '',
    team_member_id: '',
    description: '',
    notes: ''
  });
  const [notes, setNotes] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editableContact, setEditableContact] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    priority: '',
    payment_status: '',
    is_active: false,
    action_step: '',
    booked_appointments: 0,
    satisfaction: 5
  });
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([]);
  const [newHistoryMessage, setNewHistoryMessage] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const pipelineStages = [
    { id: 'termin_ausstehend', name: 'Termin Ausstehend', color: 'bg-gray-400' },
    { id: 'termin_erschienen', name: 'Termin Erschienen', color: 'bg-blue-400' },
    { id: 'termin_abgeschlossen', name: 'Termin Abgeschlossen', color: 'bg-green-400' },
    { id: 'follow_up', name: 'Follow-up', color: 'bg-orange-400' },
    { id: 'verloren', name: 'Verloren', color: 'bg-red-400' },
  ];

  const actionStepOptions = [
    { value: 'in_vorbereitung', label: 'In Vorbereitung' },
    { value: 'testphase_aktiv', label: 'Testphase aktiv' },
    { value: 'upsell_bevorstehend', label: 'Upsell bevorstehend' },
    { value: 'bestandskunde', label: 'Bestandskunde' },
    { value: 'pausiert', label: 'Pausiert' },
    { value: 'abgeschlossen', label: 'Abgeschlossen' }
  ];

  useEffect(() => {
    if (customer) {
      setNotes(customer.notes || '');
      setEditableContact({
        name: customer.name || '',
        contact: customer.contact || '',
        email: customer.email || '',
        phone: customer.phone || '',
        priority: customer.priority || '',
        payment_status: customer.payment_status || '',
        is_active: customer.is_active || false,
        action_step: customer.action_step || 'in_vorbereitung',
        booked_appointments: customer.booked_appointments || 0,
        satisfaction: customer.satisfaction || 5
      });
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

      // Fetch appointments for this customer with team member info
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select(`
          *,
          team_members (name)
        `)
        .eq('customer_id', customer.id)
        .order('date', { ascending: false });
      
      setAppointments(appointmentData || []);

      // Calculate completed appointments automatically based on pipeline stages
      const completedCount = (appointmentData || []).filter(app => 
        ['termin_abgeschlossen', 'follow_up'].includes(app.result)
      ).length;

      // Update the customer's completed_appointments in the database
      if (completedCount !== customer.completed_appointments) {
        await supabase
          .from('customers')
          .update({ completed_appointments: completedCount })
          .eq('id', customer.id);
        
        // Update local state
        const updatedCustomer = { ...customer, completed_appointments: completedCount };
        onUpdate(updatedCustomer);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const fetchAppointmentHistory = async (appointmentId: string) => {
    try {
      const { data } = await supabase
        .from('appointment_history')
        .select(`
          *,
          team_members (name)
        `)
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: true });
      
      setAppointmentHistory(data || []);
    } catch (error) {
      console.error('Error fetching appointment history:', error);
    }
  };

  const addHistoryMessage = async () => {
    if (!newHistoryMessage.trim() || !selectedAppointment) return;
    
    try {
      const { error } = await supabase
        .from('appointment_history')
        .insert({
          appointment_id: selectedAppointment.id,
          message: newHistoryMessage.trim(),
          created_by: 'Current User' // In a real app, this would be the logged-in user
        });

      if (error) throw error;
      
      setNewHistoryMessage('');
      fetchAppointmentHistory(selectedAppointment.id);
      
      toast({
        title: "Historie-Eintrag hinzugefügt",
        description: "Der Eintrag wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error adding history message:', error);
      toast({
        title: "Fehler",
        description: "Historie-Eintrag konnte nicht gespeichert werden.",
        variant: "destructive",
      });
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
      
      fetchCustomerData(); // This will recalculate completed appointments
      
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

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      
      fetchCustomerData(); // This will recalculate completed appointments
      
      toast({
        title: "Termin gelöscht",
        description: "Termin wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
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

  const saveContactData = async () => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(editableContact)
        .eq('id', customer.id);

      if (error) throw error;
      
      const updatedCustomer = { ...customer, ...editableContact };
      onUpdate(updatedCustomer);
      setIsEditingContact(false);
      
      toast({
        title: "Kontaktdaten gespeichert",
        description: "Die Kontaktdaten wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating contact data:', error);
      toast({
        title: "Fehler",
        description: "Kontaktdaten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const saveAppointmentChanges = async () => {
    if (!editingAppointment) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          type: editingAppointment.type,
          description: editingAppointment.description,
          notes: editingAppointment.notes,
          date: editingAppointment.date,
          team_member_id: editingAppointment.team_member_id
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;
      
      setEditingAppointment(null);
      fetchCustomerData();
      
      toast({
        title: "Termin aktualisiert",
        description: "Termin wurde erfolgreich aktualisiert.",
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

  const cancelEditContact = () => {
    setEditableContact({
      name: customer.name || '',
      contact: customer.contact || '',
      email: customer.email || '',
      phone: customer.phone || '',
      priority: customer.priority || '',
      payment_status: customer.payment_status || '',
      is_active: customer.is_active || false,
      action_step: customer.action_step || 'in_vorbereitung',
      booked_appointments: customer.booked_appointments || 0,
      satisfaction: customer.satisfaction || 5
    });
    setIsEditingContact(false);
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
    if (newAppointment.company && newAppointment.contact && newAppointment.phone && newAppointment.date) {
      try {
        const { error } = await supabase
          .from('appointments')
          .insert({
            customer_id: customer.id,
            date: newAppointment.date,
            type: `${newAppointment.company} - ${newAppointment.contact} - ${newAppointment.phone}`,
            description: newAppointment.description,
            notes: newAppointment.notes,
            team_member_id: newAppointment.team_member_id || null,
            result: 'termin_ausstehend'
          });

        if (error) throw error;
        
        // Update team member appointment count if assigned
        if (newAppointment.team_member_id) {
          await supabase
            .from('team_members')
            .update({ 
              appointment_count: teamMembers.find(tm => tm.id === newAppointment.team_member_id)?.appointment_count + 1 || 1
            })
            .eq('id', newAppointment.team_member_id);
        }
        
        setNewAppointment({ company: '', contact: '', phone: '', date: '', team_member_id: '', description: '', notes: '' });
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
  const completedAppointments = appointments.filter(app => 
    ['termin_abgeschlossen', 'follow_up'].includes(app.result)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
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
              <Euro className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-2xl font-bold text-gray-700">€{totalRevenue}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Termine gebucht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-2xl font-bold text-gray-700">{editableContact.booked_appointments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Termine gelegt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-2xl font-bold text-gray-700">{completedAppointments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Zufriedenheit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-2xl font-bold text-gray-700">{editableContact.satisfaction}/10</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              Kontaktdaten & Info
              {!isEditingContact && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingContact(true)} className="ml-2">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditingContact ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Firmenname:</label>
                  <Input
                    value={editableContact.name}
                    onChange={(e) => setEditableContact({...editableContact, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ansprechpartner:</label>
                  <Input
                    value={editableContact.contact}
                    onChange={(e) => setEditableContact({...editableContact, contact: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email:</label>
                  <Input
                    value={editableContact.email}
                    onChange={(e) => setEditableContact({...editableContact, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon:</label>
                  <Input
                    value={editableContact.phone}
                    onChange={(e) => setEditableContact({...editableContact, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priorität:</label>
                  <Select value={editableContact.priority} onValueChange={(value) => setEditableContact({...editableContact, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoch">Hoch</SelectItem>
                      <SelectItem value="Mittel">Mittel</SelectItem>
                      <SelectItem value="Niedrig">Niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Zahlungsstatus:</label>
                  <Select value={editableContact.payment_status} onValueChange={(value) => setEditableContact({...editableContact, payment_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bezahlt">Bezahlt</SelectItem>
                      <SelectItem value="Ausstehend">Ausstehend</SelectItem>
                      <SelectItem value="Überfällig">Überfällig</SelectItem>
                      <SelectItem value="Raten">Raten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <Select 
                    value={editableContact.is_active ? "aktiv" : "inaktiv"} 
                    onValueChange={(value) => setEditableContact({...editableContact, is_active: value === "aktiv"})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktiv">Aktiv</SelectItem>
                      <SelectItem value="inaktiv">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Action Step:</label>
                  <Select value={editableContact.action_step} onValueChange={(value) => setEditableContact({...editableContact, action_step: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionStepOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Termine gebucht:</label>
                  <Input
                    type="number"
                    value={editableContact.booked_appointments}
                    onChange={(e) => setEditableContact({...editableContact, booked_appointments: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zufriedenheit (1-10):</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={editableContact.satisfaction}
                    onChange={(e) => setEditableContact({...editableContact, satisfaction: parseInt(e.target.value) || 5})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={saveContactData}>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="outline" onClick={cancelEditContact}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div><strong>Ansprechpartner:</strong> {customer.contact}</div>
                <div><strong>Email:</strong> {customer.email}</div>
                <div><strong>Telefon:</strong> {customer.phone}</div>
                <div><strong>Priorität:</strong> 
                  <Badge className="ml-2 bg-gray-100 text-gray-800">{customer.priority}</Badge>
                </div>
                <div><strong>Zahlungsstatus:</strong> 
                  <Badge className="ml-2 bg-gray-100 text-gray-800">{customer.payment_status}</Badge>
                </div>
                <div><strong>Status:</strong> 
                  <Badge className={`ml-2 ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
                <div><strong>Action Step:</strong> 
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {actionStepOptions.find(opt => opt.value === customer.action_step)?.label || customer.action_step}
                  </Badge>
                </div>
                <div><strong>Zufriedenheit:</strong> 
                  <Badge className="ml-2 bg-purple-100 text-purple-800">
                    {customer.satisfaction}/10
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notizen</CardTitle>
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

      {/* Add New Appointment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-gray-700">
            <Calendar className="h-5 w-5 mr-2" />
            Neuen Termin hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Firma"
              value={newAppointment.company}
              onChange={(e) => setNewAppointment({...newAppointment, company: e.target.value})}
            />
            <Input
              placeholder="Ansprechpartner"
              value={newAppointment.contact}
              onChange={(e) => setNewAppointment({...newAppointment, contact: e.target.value})}
            />
            <Input
              placeholder="Telefon"
              value={newAppointment.phone}
              onChange={(e) => setNewAppointment({...newAppointment, phone: e.target.value})}
            />
            <Input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
            />
            <Select value={newAppointment.team_member_id} onValueChange={(value) => setNewAppointment({...newAppointment, team_member_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Teammitglied zuweisen" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Beschreibung (optional)"
              value={newAppointment.description}
              onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
            />
          </div>
          <div className="mt-4">
            <Textarea
              placeholder="Notizen (optional)"
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
              className="min-h-[80px]"
            />
          </div>
          <Button onClick={handleAddAppointment} className="mt-4">Hinzufügen</Button>
        </CardContent>
      </Card>

      {/* Termin-Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Termin-Pipeline</CardTitle>
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
                                  <CardContent className="p-3 space-y-1 relative">
                                    <div className="flex gap-1 absolute top-1 right-1">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedAppointment(appointment);
                                              fetchAppointmentHistory(appointment.id);
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-blue-100"
                                          >
                                            <MessageSquare className="h-3 w-3 text-blue-600" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                          <DialogHeader>
                                            <DialogTitle>Termin-Historie</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="max-h-64 overflow-y-auto space-y-2">
                                              {appointmentHistory.map((entry) => (
                                                <div key={entry.id} className="bg-gray-50 p-3 rounded text-sm">
                                                  <div className="font-medium">{entry.message}</div>
                                                  <div className="text-xs text-gray-600 mt-1">
                                                    {new Date(entry.created_at).toLocaleString('de-DE')} - {entry.created_by}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                            <div className="flex gap-2">
                                              <Input
                                                placeholder="Neue Nachricht hinzufügen"
                                                value={newHistoryMessage}
                                                onChange={(e) => setNewHistoryMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addHistoryMessage()}
                                              />
                                              <Button size="sm" onClick={addHistoryMessage}>
                                                <Plus className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingAppointment(appointment);
                                        }}
                                        className="h-6 w-6 p-0 hover:bg-blue-100"
                                      >
                                        <Edit className="h-3 w-3 text-blue-600" />
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteAppointment(appointment.id);
                                        }}
                                        className="h-6 w-6 p-0 hover:bg-red-100"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-600" />
                                      </Button>
                                    </div>
                                    <div className="font-semibold text-sm pr-20">{appointment.type}</div>
                                    <div className="text-xs text-gray-600">
                                      {new Date(appointment.date).toLocaleDateString('de-DE')}
                                    </div>
                                    {appointment.team_members?.name && (
                                      <div className="text-xs text-blue-600">
                                        👤 {appointment.team_members.name}
                                      </div>
                                    )}
                                    {appointment.description && (
                                      <div className="text-xs text-gray-500 italic">
                                        {appointment.description}
                                      </div>
                                    )}
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

      {/* Edit Appointment Dialog */}
      {editingAppointment && (
        <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Termin bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Termin-Typ:</label>
                <Input
                  value={editingAppointment.type}
                  onChange={(e) => setEditingAppointment({...editingAppointment, type: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Datum:</label>
                <Input
                  type="date"
                  value={editingAppointment.date}
                  onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Teammitglied:</label>
                <Select 
                  value={editingAppointment.team_member_id || ""} 
                  onValueChange={(value) => setEditingAppointment({...editingAppointment, team_member_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Teammitglied zuweisen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Teammitglied</SelectItem>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Beschreibung:</label>
                <Input
                  value={editingAppointment.description || ""}
                  onChange={(e) => setEditingAppointment({...editingAppointment, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notizen:</label>
                <Textarea
                  value={editingAppointment.notes || ""}
                  onChange={(e) => setEditingAppointment({...editingAppointment, notes: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveAppointmentChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
                <Button variant="outline" onClick={() => setEditingAppointment(null)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-gray-700">
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
            <CardTitle className="text-lg text-gray-700">Letzte Einnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customerRevenues.slice(0, 5).map(revenue => (
                <div key={revenue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{revenue.description}</div>
                    <div className="text-xs text-gray-600">{new Date(revenue.date).toLocaleDateString('de-DE')}</div>
                  </div>
                  <span className="font-bold text-gray-700">€{revenue.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Letzte Termine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments.slice(0, 5).map(appointment => (
                <div key={appointment.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{appointment.type}</div>
                  <div className="text-xs text-gray-600">{new Date(appointment.date).toLocaleDateString('de-DE')}</div>
                  {appointment.team_members?.name && (
                    <div className="text-xs text-blue-600">👤 {appointment.team_members.name}</div>
                  )}
                  <Badge className="text-xs mt-1 bg-gray-200 text-gray-700">{pipelineStages.find(s => s.id === appointment.result)?.name || appointment.result}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
