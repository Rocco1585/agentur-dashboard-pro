import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, X, User, Mail, Phone, Calendar, Euro, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CustomerDetailProps {
  customer: any;
  onBack: () => void;
  onUpdate: (customer: any) => void;
}

export function CustomerDetail({ customer, onBack, onUpdate }: CustomerDetailProps) {
  const [revenues, setRevenues] = useState([
    { id: 1, description: 'Webdesign', amount: 1200, date: '10.01.2025' },
    { id: 2, description: 'SEO Optimierung', amount: 800, date: '05.01.2025' },
  ]);

  const [appointments, setAppointments] = useState([
    { id: 1, type: 'Setting', date: '15.01.2025', result: 'Erfolgreich' },
    { id: 2, type: 'Closing', date: '12.01.2025', result: 'Follow-up' },
  ]);

  const [newRevenue, setNewRevenue] = useState({ amount: '', description: '' });
  const [newAppointment, setNewAppointment] = useState({ date: '', type: '', result: '' });

  const [statuses, setStatuses] = useState(customer.statuses || []);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('Wichtiger Kunde mit hohem Potential.');

  const addStatus = () => {
    if (newStatus.trim() && !statuses.includes(newStatus.trim())) {
      const updatedStatuses = [...statuses, newStatus.trim()];
      setStatuses(updatedStatuses);
      const updatedCustomer = { ...customer, statuses: updatedStatuses };
      onUpdate(updatedCustomer);
      setNewStatus('');
      toast({
        title: "Status hinzugefügt",
        description: `Status "${newStatus}" wurde hinzugefügt.`,
      });
    }
  };

  const removeStatus = (statusToRemove: string) => {
    const updatedStatuses = statuses.filter(status => status !== statusToRemove);
    setStatuses(updatedStatuses);
    const updatedCustomer = { ...customer, statuses: updatedStatuses };
    onUpdate(updatedCustomer);
    toast({
      title: "Status entfernt",
      description: `Status "${statusToRemove}" wurde entfernt.`,
    });
  };

  const addRevenue = () => {
    if (newRevenue.amount && newRevenue.description) {
      setRevenues(prev => [...prev, {
        id: Date.now(),
        description: newRevenue.description,
        amount: parseFloat(newRevenue.amount),
        date: new Date().toLocaleDateString('de-DE')
      }]);
      setNewRevenue({ amount: '', description: '' });
    }
  };

  const addAppointment = () => {
    if (newAppointment.date && newAppointment.type) {
      setAppointments(prev => [...prev, {
        id: Date.now(),
        date: newAppointment.date,
        type: newAppointment.type,
        result: newAppointment.result || 'Ausstehend'
      }]);
      setNewAppointment({ date: '', type: '', result: '' });
    }
  };

  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);

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
              <span className="text-2xl font-bold text-blue-600">{customer.bookedAppointments}</span>
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
              <span className="text-2xl font-bold text-purple-600">{customer.completedAppointments}</span>
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
              <Badge className="ml-2 bg-green-100 text-green-800">{customer.paymentStatus}</Badge>
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
            <Button className="mt-2">Notizen speichern</Button>
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
            <Button onClick={addRevenue}>Hinzufügen</Button>
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
            <Input
              placeholder="Ergebnis"
              value={newAppointment.result}
              onChange={(e) => setNewAppointment({...newAppointment, result: e.target.value})}
            />
            <Button onClick={addAppointment}>Hinzufügen</Button>
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
              {revenues.slice(-5).map(revenue => (
                <div key={revenue.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{revenue.description}</div>
                    <div className="text-xs text-gray-600">{revenue.date}</div>
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
              {appointments.slice(-5).map(appointment => (
                <div key={appointment.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{appointment.type}</div>
                  <div className="text-xs text-gray-600">{appointment.date}</div>
                  <Badge className="text-xs mt-1">{appointment.result}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
