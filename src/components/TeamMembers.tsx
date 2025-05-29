
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Calendar, Euro, TrendingUp, User, Phone, Mail, Edit, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTeamMembers, useCustomers } from '@/hooks/useSupabaseData';
import { TeamMemberDetail } from './TeamMemberDetail';

export function TeamMembers() {
  const { teamMembers, loading: membersLoading, addTeamMember } = useTeamMembers();
  const { customers, loading: customersLoading } = useCustomers();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    payouts: 0,
    performance: 5
  });

  const loading = membersLoading || customersLoading;

  // Definierte Positionen (aktualisiert)
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

  const handleAddMember = async () => {
    if (newMember.name && newMember.email) {
      await addTeamMember(newMember);
      setNewMember({ name: '', email: '', phone: '', role: '', payouts: 0, performance: 5 });
      setShowAddForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Teammitglieder...</div>
      </div>
    );
  }

  if (selectedMember) {
    return (
      <TeamMemberDetail
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
        onUpdate={(updatedMember) => setSelectedMember(updatedMember)}
        customers={customers}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
              <Input
                placeholder="Email"
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
                placeholder="Auszahlungen (€)"
                type="number"
                value={newMember.payouts}
                onChange={(e) => setNewMember({...newMember, payouts: parseFloat(e.target.value) || 0})}
              />
              <Input
                placeholder="Performance (1-10)"
                type="number"
                min="1"
                max="10"
                value={newMember.performance}
                onChange={(e) => setNewMember({...newMember, performance: parseInt(e.target.value) || 5})}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddMember} className="flex-1 bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                <X className="h-4 w-4 mr-2 text-red-600" />
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {teamMembers.map((member) => (
          <Card 
            key={member.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-left">
                <User className="h-5 w-5 mr-2 text-red-600" />
                <span className="truncate text-gray-900">{member.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left">
              <div className="space-y-2">
                {member.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate">{member.phone}</span>
                  </div>
                )}
                {member.role && (
                  <div className="flex items-center text-sm">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {member.role}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="text-left">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-red-600 mr-1" />
                  </div>
                  <div className="text-lg font-bold text-gray-700">{member.appointment_count || 0}</div>
                  <div className="text-xs text-gray-600">Termine</div>
                </div>
                <div className="text-left">
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 text-red-600 mr-1" />
                  </div>
                  <div className="text-lg font-bold text-gray-700">€{member.payouts || 0}</div>
                  <div className="text-xs text-gray-600">Auszahlung</div>
                </div>
              </div>

              <div className="pt-2">
                <Badge 
                  className="w-full justify-center bg-blue-100 text-blue-800"
                >
                  {typeof member.performance === 'number' ? member.performance : (parseInt(member.performance) || 5)}/10
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="text-left py-12">
            <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Teammitglieder</h3>
            <p className="text-gray-600 mb-4">Fügen Sie Ihr erstes Teammitglied hinzu, um zu beginnen.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Teammitglied hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
