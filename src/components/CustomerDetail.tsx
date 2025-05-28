
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Calendar, Phone, Mail, GripVertical, Edit, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CustomerDetailProps {
  customer: any;
  onBack: () => void;
  onUpdate: (customer: any) => void;
}

export function CustomerDetail({ customer, onBack, onUpdate }: CustomerDetailProps) {
  const [appointments, setAppointments] = useState([
    { id: 1, company: 'ABC GmbH', phone: '+49 123 456789', contact: 'Max Mustermann', date: '15.01.2025', stage: 'termin-ausstehend', placedBy: 'Lisa Schmidt' },
    { id: 2, company: 'XYZ Corp', phone: '+49 987 654321', contact: 'Peter Weber', date: '18.01.2025', stage: 'termin-erschienen', placedBy: 'Tom Weber' },
    { id: 3, company: 'DEF AG', phone: '+49 555 123456', contact: 'Sandra Müller', date: '20.01.2025', stage: 'follow-up-ich', placedBy: 'Max Mustermann' },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    company: '',
    phone: '',
    contact: '',
    date: new Date().toISOString().slice(0, 10),
    placedBy: ''
  });

  const [notes, setNotes] = useState('Kunde ist sehr zufrieden mit unserem Service. Nächster Upsell geplant für Q2.');
  const [editingContact, setEditingContact] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState({ ...customer });
  const [newStatus, setNewStatus] = useState('');
  const [customStatuses, setCustomStatuses] = useState(['testphase aktiv', 'upsell bevorstehend', 'bestandskunde', 'lead', 'interessent']);

  const teamMembers = [
    'Max Mustermann',
    'Lisa Schmidt', 
    'Tom Weber',
    'Anna Müller',
    'Peter Schmidt'
  ];

  const pipelineStages = [
    { id: 'termin-geclosed', name: 'Termin geclosed', color: 'bg-green-100 text-green-800' },
    { id: 'termin-erschienen', name: 'Termin erschienen', color: 'bg-blue-100 text-blue-800' },
    { id: 'termin-ausstehend', name: 'Termin ausstehend', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'follow-up-ich', name: 'Follow Up ich', color: 'bg-purple-100 text-purple-800' },
    { id: 'follow-up-kunde', name: 'Follow UP Kunde', color: 'bg-orange-100 text-orange-800' },
    { id: 'lost', name: 'Lost', color: 'bg-red-100 text-red-800' },
  ];

  const handleDragStart = (e: React.DragEvent, appointmentId: number) => {
    e.dataTransfer.setData('text/plain', appointmentId.toString());
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const appointmentId = parseInt(e.dataTransfer.getData('text/plain'));
    
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, stage: newStage } : apt
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addAppointment = () => {
    if (newAppointment.company && newAppointment.contact && newAppointment.placedBy) {
      const appointment = {
        id: Date.now(),
        ...newAppointment,
        stage: 'termin-ausstehend'
      };
      setAppointments(prev => [...prev, appointment]);
      toast({
        title: "Termin hinzugefügt",
        description: `Termin mit ${newAppointment.company} wurde hinzugefügt`,
      });
      setNewAppointment({ company: '', phone: '', contact: '', date: new Date().toISOString().slice(0, 10), placedBy: '' });
    }
  };

  const deleteAppointment = (appointmentId: number) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    toast({
      title: "Termin gelöscht",
      description: "Termin wurde erfolgreich entfernt",
    });
  };

  const saveContact = () => {
    onUpdate(editedCustomer);
    setEditingContact(false);
    toast({
      title: "Kontaktdaten gespeichert",
      description: "Die Änderungen wurden erfolgreich gespeichert",
    });
  };

  const addCustomStatus = () => {
    if (newStatus && !customStatuses.includes(newStatus)) {
      setCustomStatuses(prev => [...prev, newStatus]);
      setEditedCustomer(prev => ({ ...prev, stage: newStatus }));
      setNewStatus('');
      toast({
        title: "Status hinzugefügt",
        description: `Status "${newStatus}" wurde hinzugefügt`,
      });
    }
  };

  const removeStatus = (statusToRemove: string) => {
    setCustomStatuses(prev => prev.filter(status => status !== statusToRemove));
    if (editedCustomer.stage === statusToRemove) {
      setEditedCustomer(prev => ({ ...prev, stage: customStatuses[0] }));
    }
    toast({
      title: "Status entfernt",
      description: `Status "${statusToRemove}" wurde entfernt`,
    });
  };

  const getStageAppointments = (stageId: string) => {
    return appointments.filter(apt => apt.stage === stageId);
  };

  const getStageInfo = (stageId: string) => {
    return pipelineStages.find(stage => stage.id === stageId) || pipelineStages[0];
  };

  // Meeting Verlauf (Mock Data - würde aus echter Datenbank kommen)
  const meetingHistory = [
    { id: 1, date: '2025-01-10', type: 'Ersttermin', result: 'Interesse geweckt', notes: 'Kunde sehr interessiert' },
    { id: 2, date: '2025-01-15', type: 'Follow-up', result: 'Angebot angefordert', notes: 'Details besprochen' },
    { id: 3, date: '2025-01-20', type: 'Closing', result: 'Ausstehend', notes: 'Termin geplant' }
  ];

  const upcomingMeetings = appointments.filter(apt => new Date(apt.date) >= new Date());

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

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Kontaktdaten
              <Button variant="ghost" size="sm" onClick={() => setEditingContact(!editingContact)}>
                <Edit className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingContact ? (
              <div className="space-y-3">
                <Input
                  value={editedCustomer.name}
                  onChange={(e) => setEditedCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                />
                <Input
                  value={editedCustomer.contact}
                  onChange={(e) => setEditedCustomer(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Ansprechpartner"
                />
                <Input
                  value={editedCustomer.phone}
                  onChange={(e) => setEditedCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefon"
                />
                <Input
                  value={editedCustomer.email}
                  onChange={(e) => setEditedCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="E-Mail"
                />
                <div className="flex gap-2">
                  <Button onClick={saveContact} size="sm">Speichern</Button>
                  <Button variant="outline" onClick={() => setEditingContact(false)} size="sm">Abbrechen</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{editedCustomer.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{editedCustomer.email}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Kundenstatus</label>
              <Select 
                value={editedCustomer.stage} 
                onValueChange={(value) => setEditedCustomer(prev => ({ ...prev, stage: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center justify-between w-full">
                        <span>{status}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStatus(status);
                          }}
                          className="ml-2 p-1 h-auto"
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Neuer Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              />
              <Button onClick={addCustomStatus} size="sm">+</Button>
            </div>
            
            <div className="space-y-1">
              <Badge className="bg-red-100 text-red-800">{customer.priority}</Badge>
              <br />
              <Badge className="bg-green-100 text-green-800">{customer.paymentStatus}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>Termine gebucht: {customer.bookedAppointments}</div>
            <div>Termine gelegt: {customer.completedAppointments}</div>
            <div>Zufriedenheit: {customer.satisfaction}/10</div>
          </CardContent>
        </Card>
      </div>

      {/* Nächste Meetings & Meeting Verlauf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Nächste Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map(meeting => (
                  <div key={meeting.id} className="p-3 bg-blue-50 rounded">
                    <div className="font-medium text-sm">{meeting.company}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(meeting.date).toLocaleDateString('de-DE')} - {meeting.contact}
                    </div>
                    <div className="text-xs text-blue-600">von: {meeting.placedBy}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Keine bevorstehenden Meetings</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetingHistory.map(meeting => (
                <div key={meeting.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{meeting.type}</div>
                      <div className="text-xs text-gray-600">{new Date(meeting.date).toLocaleDateString('de-DE')}</div>
                    </div>
                    <Badge className="text-xs">{meeting.result}</Badge>
                  </div>
                  {meeting.notes && (
                    <p className="text-xs text-gray-600 mt-1">{meeting.notes}</p>
                  )}
                </div>
              ))}
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
            className="min-h-[100px]"
            placeholder="Notizen über den Kunden..."
          />
          <Button className="mt-2">Notizen speichern</Button>
        </CardContent>
      </Card>

      {/* Add New Appointment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Neuen Termin hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Firmenname"
              value={newAppointment.company}
              onChange={(e) => setNewAppointment({...newAppointment, company: e.target.value})}
            />
            <Input
              placeholder="Telefon"
              value={newAppointment.phone}
              onChange={(e) => setNewAppointment({...newAppointment, phone: e.target.value})}
            />
            <Input
              placeholder="Ansprechpartner"
              value={newAppointment.contact}
              onChange={(e) => setNewAppointment({...newAppointment, contact: e.target.value})}
            />
            <Input
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
            />
            <Select value={newAppointment.placedBy} onValueChange={(value) => setNewAppointment({...newAppointment, placedBy: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Gelegt von" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member} value={member}>{member}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addAppointment} className="mt-4">
            Termin hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Drag & Drop Pipeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Termin Pipeline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {pipelineStages.map((stage) => (
            <div 
              key={stage.id}
              className="bg-gray-50 rounded-lg p-4 min-h-[300px]"
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
            >
              <div className={`text-center p-2 rounded mb-4 ${stage.color}`}>
                <h3 className="font-medium text-sm">{stage.name}</h3>
                <span className="text-xs">({getStageAppointments(stage.id).length})</span>
              </div>
              
              <div className="space-y-2">
                {getStageAppointments(stage.id).map((appointment) => (
                  <div
                    key={appointment.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, appointment.id)}
                    className="bg-white p-3 rounded border cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{appointment.company}</span>
                      <div className="flex gap-1">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-500 hover:text-red-700 p-0 h-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{appointment.contact}</div>
                      <div>{appointment.phone}</div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {appointment.date}
                      </div>
                      <div className="text-blue-600">von: {appointment.placedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
