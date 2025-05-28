
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Calendar, Phone, Mail, GripVertical } from "lucide-react";

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
    date: '',
    placedBy: ''
  });

  const [notes, setNotes] = useState('Kunde ist sehr zufrieden mit unserem Service. Nächster Upsell geplant für Q2.');

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
    if (newAppointment.company && newAppointment.contact) {
      const appointment = {
        id: Date.now(),
        ...newAppointment,
        stage: 'termin-ausstehend'
      };
      setAppointments(prev => [...prev, appointment]);
      setNewAppointment({ company: '', phone: '', contact: '', date: '', placedBy: '' });
    }
  };

  const getStageAppointments = (stageId: string) => {
    return appointments.filter(apt => apt.stage === stageId);
  };

  const getStageInfo = (stageId: string) => {
    return pipelineStages.find(stage => stage.id === stageId) || pipelineStages[0];
  };

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
            <CardTitle>Kontaktdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{customer.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge className="bg-blue-100 text-blue-800">{customer.stage}</Badge>
            <Badge className="bg-red-100 text-red-800">{customer.priority}</Badge>
            <Badge className="bg-green-100 text-green-800">{customer.paymentStatus}</Badge>
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
            <Input
              placeholder="Gelegt von"
              value={newAppointment.placedBy}
              onChange={(e) => setNewAppointment({...newAppointment, placedBy: e.target.value})}
            />
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
                      <GripVertical className="h-4 w-4 text-gray-400" />
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
