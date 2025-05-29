
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, User, Mail, Phone, Euro, TrendingUp, Edit, Eye } from "lucide-react";
import { TeamMemberDetail } from "./TeamMemberDetail";
import { toast } from "@/hooks/use-toast";
import { useTeamMembers } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

export function TeamMembers() {
  const { teamMembers, loading, addTeamMember } = useTeamMembers();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    payouts: 0,
    performance: 'Gut'
  });

  // Definierte Positionen
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

  if (!isAdmin()) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Teammitglieder zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddMember = async () => {
    if (newMember.name && newMember.email) {
      const memberData = {
        ...newMember,
        is_active: true,
        password: 'passwort' // Default password
      };
      await addTeamMember(memberData);
      setNewMember({ name: '', email: '', phone: '', role: '', payouts: 0, performance: 'Gut' });
      setShowAddForm(false);
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || member.role === filterRole;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'aktiv' && member.is_active) ||
                         (filterStatus === 'inaktiv' && !member.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-lg">Lade Teammitglieder...</div>
      </div>
    );
  }

  if (selectedMember) {
    return (
      <TeamMemberDetail 
        member={selectedMember} 
        onBack={() => setSelectedMember(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Teammitglieder</h1>
          <p className="text-gray-600">Verwalten Sie Ihr Team</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Teammitglied hinzufügen
        </Button>
      </div>

      {/* Add Team Member Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left">Neues Teammitglied hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Name *"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
              <Input
                placeholder="Email *"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              />
              <Input
                placeholder="Telefon"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
              />
              <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Position auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Auszahlungen (€)"
                value={newMember.payouts}
                onChange={(e) => setNewMember({...newMember, payouts: parseFloat(e.target.value) || 0})}
              />
              <Select value={newMember.performance} onValueChange={(value) => setNewMember({...newMember, performance: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sehr gut">Sehr gut</SelectItem>
                  <SelectItem value="Gut">Gut</SelectItem>
                  <SelectItem value="Durchschnittlich">Durchschnittlich</SelectItem>
                  <SelectItem value="Verbesserungsbedürftig">Verbesserungsbedürftig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddMember} className="flex-1 bg-red-600 hover:bg-red-700">
                Teammitglied hinzufügen
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          placeholder="Team durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger>
            <SelectValue placeholder="Position filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle Positionen</SelectItem>
            {positions.map(position => (
              <SelectItem key={position} value={position}>{position}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle Status</SelectItem>
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="inaktiv">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-left">
                <div className="flex items-center min-w-0 flex-1">
                  <User className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate text-gray-900 text-sm">{member.name}</span>
                </div>
                <Badge className={`ml-2 flex-shrink-0 text-xs ${
                  member.performance === 'Sehr gut' ? 'bg-green-100 text-green-800' :
                  member.performance === 'Gut' ? 'bg-blue-100 text-blue-800' :
                  member.performance === 'Durchschnittlich' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {member.performance}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left pt-0">
              <div className="space-y-2">
                {member.email && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate">{member.phone}</span>
                  </div>
                )}
                {member.role && (
                  <div className="flex items-center text-xs">
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {member.role}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Status:</span>
                  <Badge className={`text-xs ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Auszahlungen:</span>
                  <span className="text-xs font-medium text-gray-700">€{Number(member.payouts || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Teammitglieder gefunden</h3>
            <p className="text-gray-600 mb-4">
              {teamMembers.length === 0 
                ? "Fügen Sie Ihr erstes Teammitglied hinzu, um zu beginnen."
                : "Keine Teammitglieder entsprechen Ihren Suchkriterien."
              }
            </p>
            {teamMembers.length === 0 && (
              <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Erstes Teammitglied hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
