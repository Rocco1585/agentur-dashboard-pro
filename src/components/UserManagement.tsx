
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, User, Plus, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateUserForm } from './CreateUserForm';
import { PipelineColumn } from './PipelineColumn';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
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

export function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'users' | 'pipeline'>('users');

  useEffect(() => {
    fetchUsers();
    if (viewMode === 'pipeline') {
      fetchAppointments();
    }
  }, [viewMode]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
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
          ),
          team_members (
            id,
            name,
            role
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Fehler",
        description: "Termine konnten nicht geladen werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    // Only allow admins to move appointments
    if (!isAdmin()) {
      toast({
        title: "Keine Berechtigung",
        description: "Nur Administratoren können Termine verschieben.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
      return;
    }

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
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      // Erst alle verknüpften Daten löschen
      console.log('Deleting related data for user:', userId);
      
      // Termine löschen
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('team_member_id', userId);

      if (appointmentsError) {
        console.error('Error deleting appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Team member earnings löschen
      const { error: earningsError } = await supabase
        .from('team_member_earnings')
        .delete()
        .eq('team_member_id', userId);

      if (earningsError) {
        console.error('Error deleting earnings:', earningsError);
        throw earningsError;
      }

      // Team member expenses löschen
      const { error: expensesError } = await supabase
        .from('team_member_expenses')
        .delete()
        .eq('team_member_id', userId);

      if (expensesError) {
        console.error('Error deleting expenses:', expensesError);
        throw expensesError;
      }

      // Appointment history löschen
      const { error: historyError } = await supabase
        .from('appointment_history')
        .delete()
        .eq('team_member_id', userId);

      if (historyError) {
        console.error('Error deleting appointment history:', historyError);
        throw historyError;
      }

      // Dann den Benutzer selbst löschen
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Benutzer gelöscht",
        description: `${userName} wurde erfolgreich gelöscht.`,
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
        className: "text-left bg-yellow-100 border-yellow-300",
      });
    }
  };

  const getRoleBadgeColor = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'kunde':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleDisplayName = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'Admin';
      case 'kunde':
        return 'Kunde';
      default:
        return 'Mitglied';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Keine Berechtigung</h1>
          <p className="text-gray-600 mt-2">Sie haben keine Berechtigung, diese Seite zu betrachten.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Lade Benutzer...</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6 p-6">
        <CreateUserForm 
          onClose={() => setShowCreateForm(false)}
          onUserCreated={fetchUsers}
        />
      </div>
    );
  }

  // Pipeline View - Clone exact logic from CustomerDetail.tsx
  if (viewMode === 'pipeline') {
    // Group appointments by status for pipeline view - exact same logic
    const appointmentsByStatus = {
      'termin_ausstehend': appointments.filter(apt => apt.result === 'termin_ausstehend'),
      'termin_erschienen': appointments.filter(apt => apt.result === 'termin_erschienen'),
      'termin_abgeschlossen': appointments.filter(apt => apt.result === 'termin_abgeschlossen'),
      'follow_up': appointments.filter(apt => apt.result === 'follow_up'),
      'termin_abgesagt': appointments.filter(apt => apt.result === 'termin_abgesagt'),
      'termin_verschoben': appointments.filter(apt => apt.result === 'termin_verschoben')
    };

    // Exact same pipeline columns as CustomerDetail.tsx
    const pipelineColumns = [
      { 
        id: 'termin_ausstehend', 
        title: 'Ausstehend', 
        color: 'bg-blue-600',
        appointments: appointmentsByStatus.termin_ausstehend
      },
      { 
        id: 'termin_erschienen', 
        title: 'Erschienen', 
        color: 'bg-yellow-600',
        appointments: appointmentsByStatus.termin_erschienen
      },
      { 
        id: 'termin_abgeschlossen', 
        title: 'Abgeschlossen', 
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
        title: 'Abgesagt', 
        color: 'bg-red-600',
        appointments: appointmentsByStatus.termin_abgesagt
      },
      { 
        id: 'termin_verschoben', 
        title: 'Verschoben', 
        color: 'bg-orange-600',
        appointments: appointmentsByStatus.termin_verschoben
      }
    ];

    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 text-left">Termin Pipeline</h1>
            <p className="text-gray-600 text-left">Alle Termine im Überblick verwalten</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setViewMode('users')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Benutzer-Ansicht
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Benutzer erstellen
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-left text-lg">Alle Termine ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {pipelineColumns.map((column) => (
                  <PipelineColumn
                    key={column.id}
                    title={column.title}
                    stageId={column.id}
                    customers={column.appointments}
                    color={column.color}
                    onCustomerClick={(appointment) => {
                      console.log('Appointment clicked:', appointment);
                    }}
                    showDeleteButton={false}
                  />
                ))}
              </div>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Users View (existing code)
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 text-left">Benutzerverwaltung</h1>
          <p className="text-gray-600 text-left">Verwalten Sie alle Benutzer des Systems</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setViewMode('pipeline')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Termin Pipeline
          </Button>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Benutzer erstellen
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-4 w-4" />
        <Input
          placeholder="Benutzer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-left">
                <div className="flex items-center min-w-0 flex-1 text-left">
                  <User className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate text-gray-900 text-sm text-left">{user.name}</span>
                </div>
                <Badge className={`ml-2 flex-shrink-0 text-xs px-2 py-1 ${getRoleBadgeColor(user.user_role)}`}>
                  {getRoleDisplayName(user.user_role)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left pt-0">
              <div className="space-y-2 text-left">
                <div className="text-xs text-gray-600 text-left">
                  <strong>Email:</strong> {user.email || 'Nicht angegeben'}
                </div>
                {user.user_role !== 'kunde' && (
                  <div className="text-xs text-gray-600 text-left">
                    <strong>Position:</strong> {user.role || 'Nicht angegeben'}
                  </div>
                )}
                {user.user_role === 'kunde' && user.customer_dashboard_name && (
                  <div className="text-xs text-gray-600 text-left">
                    <strong>Dashboard:</strong> {user.customer_dashboard_name}
                  </div>
                )}
                <div className="text-xs text-gray-600 text-left">
                  <strong>Status:</strong> 
                  <Badge className={`ml-2 text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 text-left">
                  <strong>Erstellt:</strong> {new Date(user.created_at).toLocaleDateString('de-DE')}
                </div>
                {user.last_login && (
                  <div className="text-xs text-gray-600 text-left">
                    <strong>Letzter Login:</strong> {new Date(user.last_login).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Benutzer löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader className="text-left">
                      <AlertDialogTitle className="text-left">Benutzer löschen</AlertDialogTitle>
                      <AlertDialogDescription className="text-left">
                        Sind Sie sicher, dass Sie den Benutzer "{user.name}" endgültig löschen möchten? 
                        Diese Aktion kann nicht rückgängig gemacht werden und wird alle zugehörigen 
                        Daten wie Termine, Einnahmen und Auszahlungen ebenfalls löschen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(user.id, user.name)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Endgültig löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-left py-12">
            <div className="flex flex-col items-start text-left">
              <User className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Benutzer gefunden</h3>
              <p className="text-gray-600 text-left">
                {users.length === 0 
                  ? "Keine Benutzer im System vorhanden."
                  : "Keine Benutzer entsprechen Ihren Suchkriterien."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
