
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Euro, TrendingUp, TrendingDown, User, Edit, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useSupabaseData';

interface TeamMemberDetailProps {
  member: any;
  onBack: () => void;
  onUpdate: (updatedMember: any) => void;
  customers: any[];
}

export function TeamMemberDetail({ member, onBack, onUpdate, customers }: TeamMemberDetailProps) {
  const { updateTeamMember } = useTeamMembers();
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

  const saveContactData = async () => {
    try {
      const updates = {
        email: editableData.email,
        phone: editableData.phone,
        role: editableData.position,
        active_since: editableData.startDate
      };
      
      const updatedMember = await updateTeamMember(member.id, updates);
      if (updatedMember) {
        onUpdate(updatedMember);
        setIsEditingContact(false);
      }
    } catch (error) {
      console.error('Error saving contact data:', error);
    }
  };

  const savePerformance = async () => {
    try {
      const updates = {
        performance: editableData.performance
      };
      
      const updatedMember = await updateTeamMember(member.id, updates);
      if (updatedMember) {
        onUpdate(updatedMember);
        setIsEditingPerformance(false);
      }
    } catch (error) {
      console.error('Error saving performance:', error);
    }
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
    <div className="space-y-6 w-full">
      <div className="flex items-center space-x-4 w-full">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2 text-red-600" />
          Zurück
        </Button>
        <div className="text-left w-full">
          <h1 className="text-3xl font-bold text-gray-900 text-left">{member.name}</h1>
          <p className="text-gray-600 text-left">{editableData.position} • {editableData.email}</p>
        </div>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="pb-2 w-full">
            <CardTitle className="text-sm text-gray-600 text-left w-full">Gesamteinnahmen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex items-center w-full text-left">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">€{totalEarnings}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2 w-full">
            <CardTitle className="text-sm text-gray-600 text-left w-full">Auszahlungen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex items-center w-full text-left">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold text-red-600">€{totalExpenses}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2 w-full">
            <CardTitle className="text-sm text-gray-600 flex items-center text-left w-full">
              Performance
              {!isEditingPerformance && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingPerformance(true)} className="ml-2 h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            {isEditingPerformance ? (
              <div className="flex items-center space-x-2 w-full text-left">
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
              <div className="flex items-center w-full text-left">
                <User className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-purple-600">{editableData.performance}/10</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="flex items-center text-left w-full">
              Kontaktdaten & Info
              {!isEditingContact && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingContact(true)} className="ml-2">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 w-full">
            {isEditingContact ? (
              <div className="space-y-4 w-full">
                <div className="w-full">
                  <label className="text-sm font-medium text-left">Email:</label>
                  <Input
                    value={editableData.email}
                    onChange={(e) => setEditableData({...editableData, email: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-sm font-medium text-left">Telefon:</label>
                  <Input
                    value={editableData.phone}
                    onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-sm font-medium text-left">Position:</label>
                  <Select value={editableData.position} onValueChange={(value) => setEditableData({...editableData, position: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full">
                  <label className="text-sm font-medium text-left">Seit:</label>
                  <Input
                    type="date"
                    value={editableData.startDate}
                    onChange={(e) => setEditableData({...editableData, startDate: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div className="flex space-x-2 w-full">
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
              <div className="w-full text-left">
                <div className="text-left"><strong>Email:</strong> {editableData.email}</div>
                <div className="text-left"><strong>Telefon:</strong> {editableData.phone}</div>
                <div className="text-left"><strong>Position:</strong> {editableData.position}</div>
                <div className="text-left"><strong>Seit:</strong> {editableData.startDate}</div>
                <div className="text-left"><strong>Performance:</strong> 
                  <Badge className="ml-2 bg-green-100 text-green-800">{editableData.performance}/10</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-left w-full">Notizen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] w-full"
              placeholder="Notizen über das Teammitglied..."
            />
            <Button className="mt-2">Notizen speichern</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-green-600 text-left w-full">Letzte Einnahmen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="space-y-2 w-full">
              {earnings.slice(-5).map(earning => (
                <div key={earning.id} className="flex justify-between items-center p-2 bg-gray-50 rounded w-full">
                  <div className="text-left">
                    <div className="font-medium text-sm text-left">{earning.customer}</div>
                    <div className="text-xs text-gray-600 text-left">{earning.date} • {earning.type}</div>
                  </div>
                  <span className="font-bold text-green-600">€{earning.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-red-600 text-left w-full">Letzte Auszahlungen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="space-y-2 w-full">
              {expenses.slice(-5).map(expense => (
                <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded w-full">
                  <div className="text-left">
                    <div className="font-medium text-sm text-left">{expense.description}</div>
                    <div className="text-xs text-gray-600 text-left">{expense.date}</div>
                  </div>
                  <span className="font-bold text-red-600">€{expense.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-blue-600 text-left w-full">Letzte Termine</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="space-y-2 w-full">
              {memberAppointments.slice(-5).map(appointment => (
                <div key={appointment.id} className="p-2 bg-gray-50 rounded w-full">
                  <div className="font-medium text-sm text-left">{appointment.customers?.name || appointment.type}</div>
                  <div className="text-xs text-gray-600 text-left">{new Date(appointment.date).toLocaleDateString('de-DE')}</div>
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
