import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Euro, TrendingUp, TrendingDown, User, Edit, Save, X, Plus, DollarSign } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamMemberDetailProps {
  member: any;
  onBack: () => void;
  onUpdate: (updatedMember: any) => void;
  customers: any[];
}

export function TeamMemberDetail({ member, onBack, onUpdate, customers }: TeamMemberDetailProps) {
  const { updateTeamMember } = useTeamMembers();
  const { isAdmin } = useAuth();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [memberAppointments, setMemberAppointments] = useState<any[]>([]);
  const [notes, setNotes] = useState('Sehr motivierter Mitarbeiter. Übertrifft regelmäßig die Ziele.');
  const [showAddEarning, setShowAddEarning] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newEarning, setNewEarning] = useState({ customer: '', amount: 0, description: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0 });

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingPerformance, setIsEditingPerformance] = useState(false);
  const [editableData, setEditableData] = useState({
    email: member.email,
    phone: member.phone,
    position: member.role,
    startDate: member.active_since,
    performance: typeof member.performance === 'string' ? parseInt(member.performance) || 5 : member.performance || 5
  });

  useEffect(() => {
    fetchMemberAppointments();
    fetchMemberFinancials();
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

  const fetchMemberFinancials = async () => {
    try {
      // Earnings direkt über SQL query
      const { data: earningsData, error: earningsError } = await supabase
        .rpc('get_team_member_earnings', { member_id: member.id });
      
      const { data: expensesData, error: expensesError } = await supabase
        .rpc('get_team_member_expenses', { member_id: member.id });
      
      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
        setEarnings([]);
      } else {
        setEarnings(earningsData || []);
      }
      
      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
        setExpenses([]);
      } else {
        setExpenses(expensesData || []);
      }
    } catch (error) {
      console.error('Error fetching member financials:', error);
      setEarnings([]);
      setExpenses([]);
    }
  };

  const addEarning = async () => {
    if (!newEarning.description || newEarning.amount <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      return;
    }

    try {
      const { error } = await supabase
        .rpc('add_team_member_earning', {
          member_id: member.id,
          earning_customer: newEarning.customer,
          earning_amount: newEarning.amount,
          earning_description: newEarning.description,
          earning_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Einnahme wurde hinzugefügt.",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      
      setNewEarning({ customer: '', amount: 0, description: '' });
      setShowAddEarning(false);
      fetchMemberFinancials();
    } catch (error) {
      console.error('Error adding earning:', error);
      toast({
        title: "Fehler",
        description: "Einnahme konnte nicht hinzugefügt werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    }
  };

  const addExpense = async () => {
    if (!newExpense.description || newExpense.amount <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      return;
    }

    try {
      const { error } = await supabase
        .rpc('add_team_member_expense', {
          member_id: member.id,
          expense_description: newExpense.description,
          expense_amount: newExpense.amount,
          expense_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Auszahlung wurde hinzugefügt.",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      
      setNewExpense({ description: '', amount: 0 });
      setShowAddExpense(false);
      fetchMemberFinancials();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Fehler",
        description: "Auszahlung konnte nicht hinzugefügt werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
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
        performance: editableData.performance.toString()
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
      performance: typeof member.performance === 'string' ? parseInt(member.performance) || 5 : member.performance || 5
    });
    setIsEditingContact(false);
    setIsEditingPerformance(false);
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const outstandingPayment = totalEarnings - totalExpenses;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="pb-2 w-full">
            <CardTitle className="text-sm text-gray-600 text-left w-full">Gesamteinnahmen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex items-center w-full text-left">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">€{totalEarnings.toFixed(2)}</span>
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
              <span className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-2 w-full">
            <CardTitle className="text-sm text-gray-600 text-left w-full">Noch auszuzahlen</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex items-center w-full text-left">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              <span className={`text-2xl font-bold ${outstandingPayment >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                €{outstandingPayment.toFixed(2)}
              </span>
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
                  max="5"
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
                <span className="text-2xl font-bold text-purple-600">{editableData.performance}/5</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rest bleibt gleich */}
      
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
                  <Badge className="ml-2 bg-green-100 text-green-800">{editableData.performance}/5</Badge>
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

      {/* Financial Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-green-600 text-left w-full flex items-center justify-between">
              Einnahmen
              {isAdmin() && (
                <Button size="sm" onClick={() => setShowAddEarning(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            {showAddEarning && isAdmin() && (
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Input
                    placeholder="Kunde/Beschreibung"
                    value={newEarning.customer}
                    onChange={(e) => setNewEarning({...newEarning, customer: e.target.value})}
                  />
                  <Input
                    placeholder="Betrag"
                    type="number"
                    value={newEarning.amount}
                    onChange={(e) => setNewEarning({...newEarning, amount: parseFloat(e.target.value) || 0})}
                  />
                  <Input
                    placeholder="Beschreibung"
                    value={newEarning.description}
                    onChange={(e) => setNewEarning({...newEarning, description: e.target.value})}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={addEarning}>Hinzufügen</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddEarning(false)}>Abbrechen</Button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2 w-full">
              {earnings.slice(-5).map((earning, index) => (
                <div key={earning.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded w-full">
                  <div className="text-left">
                    <div className="font-medium text-sm text-left">{earning.customer || earning.description}</div>
                    <div className="text-xs text-gray-600 text-left">{new Date(earning.date).toLocaleDateString('de-DE')}</div>
                  </div>
                  <span className="font-bold text-green-600">€{Number(earning.amount).toFixed(2)}</span>
                </div>
              ))}
              {earnings.length === 0 && (
                <p className="text-gray-500 text-sm text-left">Keine Einnahmen vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="text-red-600 text-left w-full flex items-center justify-between">
              Auszahlungen
              {isAdmin() && (
                <Button size="sm" onClick={() => setShowAddExpense(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            {showAddExpense && isAdmin() && (
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Input
                    placeholder="Beschreibung"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                  <Input
                    placeholder="Betrag"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={addExpense}>Hinzufügen</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddExpense(false)}>Abbrechen</Button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2 w-full">
              {expenses.slice(-5).map((expense, index) => (
                <div key={expense.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded w-full">
                  <div className="text-left">
                    <div className="font-medium text-sm text-left">{expense.description}</div>
                    <div className="text-xs text-gray-600 text-left">{new Date(expense.date).toLocaleDateString('de-DE')}</div>
                  </div>
                  <span className="font-bold text-red-600">€{Number(expense.amount).toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-gray-500 text-sm text-left">Keine Auszahlungen vorhanden</p>
              )}
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
              {memberAppointments.length === 0 && (
                <p className="text-gray-500 text-sm text-left">Keine Termine vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
