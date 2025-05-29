
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Euro, TrendingUp, TrendingDown, User, Edit, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface TeamMemberDetailProps {
  member: any;
  onBack: () => void;
  onUpdate: (updatedMember: any) => void;
  customers: any[];
}

export function TeamMemberDetail({ member, onBack, onUpdate, customers }: TeamMemberDetailProps) {
  const [earnings, setEarnings] = useState([
    { id: 1, customer: 'ABC GmbH', amount: 500, date: '15.01.2025', type: 'Provision' },
    { id: 2, customer: 'XYZ Corp', amount: 300, date: '12.01.2025', type: 'Bonus' },
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Benzin', amount: 50, date: '14.01.2025' },
    { id: 2, description: 'Handy', amount: 80, date: '10.01.2025' },
  ]);

  const [memberAppointments, setMemberAppointments] = useState<any[]>([]);
  const [notes, setNotes] = useState('Sehr motivierter Mitarbeiter. Übertrifft regelmäßig die Ziele.');

  // Neue States für bearbeitbare Felder
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingPerformance, setIsEditingPerformance] = useState(false);
  const [editableData, setEditableData] = useState({
    email: member.email,
    phone: member.phone,
    position: member.role,
    startDate: member.active_since,
    performance: typeof member.performance === 'number' ? member.performance : (parseInt(member.performance) || 5)
  });

  useEffect(() => {
    fetchMemberAppointments();
  }, [member.id]);

  const fetchMemberAppointments = async () => {
    try {
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (name)
        `)
        .eq('team_member_id', member.id)
        .order('date', { ascending: false });
      
      setMemberAppointments(appointmentData || []);
    } catch (error) {
      console.error('Error fetching member appointments:', error);
    }
  };

  const saveContactData = () => {
    // Hier würde normalerweise eine API-Anfrage gemacht werden
    console.log('Kontaktdaten gespeichert:', editableData);
    const updatedMember = { ...member, ...editableData };
    onUpdate(updatedMember);
    setIsEditingContact(false);
  };

  const savePerformance = () => {
    // Hier würde normalerweise eine API-Anfrage gemacht werden
    console.log('Performance gespeichert:', editableData.performance);
    const updatedMember = { ...member, performance: editableData.performance };
    onUpdate(updatedMember);
    setIsEditingPerformance(false);
  };

  const cancelEdit = () => {
    setEditableData({
      email: member.email,
      phone: member.phone,
      position: member.role,
      startDate: member.active_since,
      performance: typeof member.performance === 'number' ? member.performance : (parseInt(member.performance) || 5)
    });
    setIsEditingContact(false);
    setIsEditingPerformance(false);
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingPayout = Math.max(0, totalEarnings - totalExpenses); // Ausstehende Auszahlungen

  const positions = [
    'Einlernphase',
    'Opening (KAQ) B2B',
    'Opening (Chat DMS) b2b',
    'Setting b2b',
    'Closing b2b',
    'TikTok Poster b2c',
    'TikTok Manager b2c',
    'Setter b2c',
    'Closer b2c',
    'Manager b2b',
    'Inhaber'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-gray-600">{editableData.position} • {editableData.email}</p>
        </div>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Gesamteinnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">€{totalEarnings}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Auszahlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">€{totalExpenses}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Ausstehende Auszahlung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-2xl font-bold text-orange-600">€{pendingPayout}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center">
              Performance
              {!isEditingPerformance && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingPerformance(true)} className="ml-2 h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingPerformance ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editableData.performance}
                  onChange={(e) => setEditableData({...editableData, performance: parseInt(e.target.value) || 1})}
                  className="w-16"
                />
                <Button size="sm" onClick={savePerformance}>
                  <Save className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-purple-600">{editableData.performance}/10</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Info */}
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
                <div>
                  <label className="text-sm font-medium">Position:</label>
                  <Select value={editableData.position} onValueChange={(value) => setEditableData({...editableData, position: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Seit:</label>
                  <Input
                    type="date"
                    value={editableData.startDate}
                    onChange={(e) => setEditableData({...editableData, startDate: e.target.value})}
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
                <div><strong>Email:</strong> {editableData.email}</div>
                <div><strong>Telefon:</strong> {editableData.phone}</div>
                <div><strong>Position:</strong> {editableData.position}</div>
                <div><strong>Seit:</strong> {editableData.startDate}</div>
                <div><strong>Performance:</strong> 
                  <Badge className="ml-2 bg-green-100 text-green-800">{editableData.performance}/10</Badge>
                </div>
              </>
            )}
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
              placeholder="Notizen über das Teammitglied..."
            />
            <Button className="mt-2">Notizen speichern</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Letzte Einnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {earnings.slice(-5).map(earning => (
                <div key={earning.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{earning.customer}</div>
                    <div className="text-xs text-gray-600">{earning.date} • {earning.type}</div>
                  </div>
                  <span className="font-bold text-green-600">€{earning.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Letzte Auszahlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenses.slice(-5).map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{expense.description}</div>
                    <div className="text-xs text-gray-600">{expense.date}</div>
                  </div>
                  <span className="font-bold text-red-600">€{expense.amount}</span>
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
              {memberAppointments.slice(-5).map(appointment => (
                <div key={appointment.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{appointment.customers?.name || appointment.type}</div>
                  <div className="text-xs text-gray-600">{new Date(appointment.date).toLocaleDateString('de-DE')}</div>
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
