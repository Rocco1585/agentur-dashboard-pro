
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Euro,
  TrendingUp,
  Plus,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CreateTeamMemberForm } from './CreateTeamMemberForm';
import { TeamMemberDetail } from './TeamMemberDetail';
import { useAuth } from '@/hooks/useAuth';
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

export function TeamMembers() {
  const { isAdmin } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .neq('user_role', 'kunde')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Fehler",
        description: "Teammitglieder konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTeamMember = async (memberId: string, memberName: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      
      toast({
        title: "Teammitglied gelöscht",
        description: `${memberName} wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Fehler",
        description: "Teammitglied konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Exzellent':
        return 'bg-green-100 text-green-800';
      case 'Sehr gut':
        return 'bg-blue-100 text-blue-800';
      case 'Gut':
        return 'bg-yellow-100 text-yellow-800';
      case 'Verbesserungswürdig':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg">Lade Teammitglieder...</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6 p-6">
        <CreateTeamMemberForm 
          onClose={() => setShowCreateForm(false)}
          onMemberCreated={fetchTeamMembers}
        />
      </div>
    );
  }

  if (selectedMember) {
    return (
      <div className="space-y-6 p-6">
        <TeamMemberDetail 
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onMemberUpdated={fetchTeamMembers}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teammitglieder</h1>
          <p className="text-gray-600">Verwalten Sie Ihr Team</p>
        </div>
        {isAdmin() && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neues Teammitglied
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-4 w-4" />
        <Input
          placeholder="Teammitglieder suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <User className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate text-gray-900 text-sm">{member.name}</span>
                </div>
                <Badge className={`ml-2 flex-shrink-0 text-xs px-2 py-1 ${getRoleColor(member.user_role)}`}>
                  {member.user_role === 'admin' ? 'Admin' : 'Mitglied'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2">
                {member.email && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{member.phone}</span>
                  </div>
                )}
                <div className="text-xs text-gray-600">
                  <strong>Position:</strong> {member.role || 'Nicht angegeben'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Performance:</span>
                  <Badge className={`ml-1 text-xs ${getPerformanceColor(member.performance)}`}>
                    {member.performance || 'Gut'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={`ml-1 text-xs ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{member.appointment_count || 0} Termine</span>
                </div>
                <div className="flex items-center">
                  <Euro className="h-3 w-3 mr-1" />
                  <span>€{(member.payouts || 0).toFixed(0)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <strong>Aktiv seit:</strong> {member.active_since ? new Date(member.active_since).toLocaleDateString('de-DE') : 'Nicht angegeben'}
              </div>

              <div className="pt-3 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                
                {isAdmin() && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Teammitglied löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sind Sie sicher, dass Sie das Teammitglied "{member.name}" endgültig löschen möchten? 
                          Diese Aktion kann nicht rückgängig gemacht werden und wird alle zugehörigen 
                          Daten wie Termine, Einnahmen und Auszahlungen ebenfalls löschen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTeamMember(member.id, member.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Endgültig löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center">
              <User className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Teammitglieder gefunden</h3>
              <p className="text-gray-600 text-center">
                {teamMembers.length === 0 
                  ? "Noch keine Teammitglieder angelegt. Erstellen Sie Ihr erstes Teammitglied."
                  : "Keine Teammitglieder entsprechen Ihren Suchkriterien."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
