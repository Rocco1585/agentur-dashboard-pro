
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Phone, Mail, User, Calendar, MapPin, Edit, Save, X, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CustomerDetailProps {
  customer: any;
  onBack: () => void;
  onUpdate: (customer: any) => void;
}

export function CustomerDetail({ customer, onBack, onUpdate }: CustomerDetailProps) {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editableData, setEditableData] = useState({
    name: customer.name,
    contact: customer.contact,
    email: customer.email,
    phone: customer.phone,
    priority: customer.priority,
    paymentStatus: customer.paymentStatus
  });

  const [customerStatuses, setCustomerStatuses] = useState(customer.statuses || ['Testphase aktiv']);
  const [newStatus, setNewStatus] = useState('');
  const [showAddStatus, setShowAddStatus] = useState(false);

  const [notes, setNotes] = useState('Wichtiger Kunde mit hohem Potenzial. Regelmäßiger Kontakt erforderlich.');
  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: '',
    member: '',
    type: 'Beratung',
    notes: ''
  });

  const [appointments, setAppointments] = useState([
    { id: 1, date: '2025-01-20', time: '10:00', member: 'Max Mustermann', type: 'Closing', notes: 'Vertragsabschluss geplant', status: 'geplant' },
    { id: 2, date: '2025-01-18', time: '14:30', member: 'Lisa Schmidt', type: 'Follow-up', notes: 'Nachfassung nach Präsentation', status: 'erledigt' },
    { id: 3, date: '2025-01-15', time: '09:00', member: 'Tom Weber', type: 'Beratung', notes: 'Produktdemonstration', status: 'erledigt' },
  ]);

  const teamMembers = [
    { id: 1, name: 'Max Mustermann' },
    { id: 2, name: 'Lisa Schmidt' },
    { id: 3, name: 'Tom Weber' },
    { id: 4, name: 'Anna Müller' },
  ];

  const statusOptions = [
    'Vorbereitung',
    'Testphase aktiv',
    'Upsell bevorstehend',
    'Bestandskunde',
    'Abgeschlossen',
    'Pausiert',
    'Muss ersetzt werden'
  ];

  const saveContactData = () => {
    const updatedCustomer = { ...customer, ...editableData };
    onUpdate(updatedCustomer);
    setIsEditingContact(false);
    toast({
      title: "Kontaktdaten gespeichert",
      description: "Die Kontaktdaten wurden erfolgreich aktualisiert.",
    });
  };

  const cancelEdit = () => {
    setEditableData({
      name: customer.name,
      contact: customer.contact,
      email: customer.email,
      phone: customer.phone,
      priority: customer.priority,
      paymentStatus: customer.paymentStatus
    });
    setIsEditingContact(false);
  };

  const addStatus = () => {
    if (newStatus && !customerStatuses.includes(newStatus)) {
      setCustomerStatuses(prev => [...prev, newStatus]);
      setNewStatus('');
      setShowAddStatus(false);
      toast({
        title: "Status hinzugefügt",
        description: `Status "${newStatus}" wurde hinzugefügt.`,
      });
    }
  };

  const removeStatus = (statusToRemove: string) => {
    setCustomerStatuses(prev => prev.filter(status => status !== statusToRemove));
    toast({
      title: "Status entfernt",
      description: `Status "${statusToRemove}" wurde entfernt.`,
    });
  };

  const addAppointment = () => {
    if (newAppointment.date && newAppointment.time && newAppointment.member) {
      const appointment = {
        id: Date.now(),
        ...newAppointment,
        status: 'geplant'
      };
      setAppointments(prev => [...prev, appointment]);
      setNewAppointment({
        date: new Date().toISOString().slice(0, 10),
        time: '',
        member: '',
        type: 'Beratung',
        notes: ''
      });
      toast({
        title: "Termin hinzugefügt",
        description: "Der neue Termin wurde erfolgreich hinzugefügt.",
      });
    }
  };

  const deleteAppointment = (appointmentId: number) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    toast({
      title: "Termin gelöscht",
      description: "Der Termin wurde erfolgreich gelöscht.",
    });
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'geplant');
  const pastAppointments = appointments.filter(apt => apt.status === 'erledigt');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{editableData.name}</h1>
          <p className="text-gray-600">{editableData.contact} • {editableData.email}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
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
                    value={editableData.name}
                    onChange={(e) => setEditableData({...editableData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ansprechpartner:</label>
                  <Input
                    value={editableData.contact}
                    onChange={(e) => setEditableData({...editableData, contact: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email:</label>
                  <Input
                    value={editableData.email}
                    onChange={(e) => setEditableData({...editableData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon:</label>
                  <Input
                    value={editableData.phone}
                    onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={saveContactData}>
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div><strong>Firmenname:</strong> {editableData.name}</div>
                <div><strong>Ansprechpartner:</strong> {editableData.contact}</div>
                <div><strong>Email:</strong> {editableData.email}</div>
                <div><strong>Telefon:</strong> {editableData.phone}</div>
                <div><strong>Priorität:</strong> 
                  <Badge className="ml-2">{editableData.priority}</Badge>
                </div>
                <div><strong>Zahlungsstatus:</strong> 
                  <Badge className="ml-2">{editableData.paymentStatus}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status-Verwaltung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {customerStatuses.map((status, index) => (
                <div key={index} className="group relative">
                  <Badge 
                    className="cursor-pointer pr-6"
                    onMouseEnter={(e) => {
                      const removeBtn = e.currentTarget.querySelector('.remove-btn');
                      if (removeBtn) removeBtn.style.display = 'block';
                    }}
                    onMouseLeave={(e) => {
                      const removeBtn = e.currentTarget.querySelector('.remove-btn');
                      if (removeBtn) removeBtn.style.display = 'none';
                    }}
                  >
                    {status}
                    <button
                      className="remove-btn absolute right-1 top-1 hidden"
                      onClick={() => removeStatus(status)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              ))}
            </div>
            
            {showAddStatus ? (
              <div className="flex space-x-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.filter(option => !customerStatuses.includes(option)).map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addStatus}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setShowAddStatus(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowAddStatus(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Status hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add New Appointment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-600">
            <Calendar className="h-5 w-5 mr-2" />
            Neuen Termin hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
            />
            <Input
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
            />
            <Select value={newAppointment.member} onValueChange={(value) => setNewAppointment({...newAppointment, member: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Gelegt von" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newAppointment.type} onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beratung">Beratung</SelectItem>
                <SelectItem value="Closing">Closing</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Setting">Setting</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addAppointment}>Hinzufügen</Button>
          </div>
          <Input
            className="mt-4"
            placeholder="Notizen zum Termin..."
            value={newAppointment.notes}
            onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
          />
        </CardContent>
      </Card>

      {/* Appointments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Bevorstehende Termine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="flex justify-between items-start p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{appointment.date} um {appointment.time}</div>
                    <div className="text-sm text-gray-600">Gelegt von: {appointment.member}</div>
                    <div className="text-sm text-gray-600">Typ: {appointment.type}</div>
                    {appointment.notes && (
                      <div className="text-xs text-gray-500 mt-1">{appointment.notes}</div>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteAppointment(appointment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-gray-500 text-center py-4">Keine bevorstehenden Termine</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Termin-Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.map(appointment => (
                <div key={appointment.id} className="flex justify-between items-start p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{appointment.date} um {appointment.time}</div>
                    <div className="text-sm text-gray-600">Gelegt von: {appointment.member}</div>
                    <div className="text-sm text-gray-600">Typ: {appointment.type}</div>
                    {appointment.notes && (
                      <div className="text-xs text-gray-500 mt-1">{appointment.notes}</div>
                    )}
                  </div>
                  <Badge className="bg-green-100 text-green-800">Erledigt</Badge>
                </div>
              ))}
              {pastAppointments.length === 0 && (
                <p className="text-gray-500 text-center py-4">Noch keine vergangenen Termine</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
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
          <Button className="mt-2">Notizen speichern</Button>
        </CardContent>
      </Card>
    </div>
  );
}
