
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Eye, Phone, Mail, Calendar, Euro, TrendingUp } from "lucide-react";
import { TeamMemberDetail } from "./TeamMemberDetail";
import { toast } from "@/hooks/use-toast";

export function TeamMembers() {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showNewMemberDialog, setShowNewMemberDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Mitarbeiter',
    performance: 5
  });

  // Beispiel-Kunden für TeamMemberDetail
  const customers = [
    { id: 1, name: 'ABC GmbH' },
    { id: 2, name: 'XYZ Corp' },
    { id: 3, name: 'DEF AG' },
  ];

  const roles = [
    'In Bewerbung TikTok',
    'In Bewerbung Vertrieb',
    'TikTok Poster',
    'Vertriebsagentur opening chat',
    'Vertriebsagentur opening telefon',
    'Vertriebsagentur ff telefon',
    'Vertriebsagentur setting b2c',
    'Vertriebsagentur closing b2c',
    'Vertriebsagentur setting b2b',
    'Vertriebsagentur closing b2b',
    'Manager'
  ];

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Max Mustermann',
      email: 'max@vertrieb.de',
      phone: '+49 123 456789',
      position: 'Vertriebsagentur closing b2c',
      performance: 9,
      earnings: 4500,
      appointmentsSet: 24,
      successRate: 85,
      startDate: '01.03.2024',
      avatar: 'MM'
    },
    {
      id: 2,
      name: 'Lisa Schmidt',
      email: 'lisa@vertrieb.de',
      phone: '+49 987 654321',
      position: 'Vertriebsagentur setting b2c',
      performance: 8,
      earnings: 3200,
      appointmentsSet: 18,
      successRate: 78,
      startDate: '15.05.2024',
      avatar: 'LS'
    },
    {
      id: 3,
      name: 'Tom Weber',
      email: 'tom@vertrieb.de',
      phone: '+49 555 123456',
      position: 'TikTok Poster',
      performance: 7,
      earnings: 2800,
      appointmentsSet: 0,
      successRate: 0,
      startDate: '10.08.2024',
      avatar: 'TW'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@vertrieb.de',
      phone: '+49 444 789123',
      position: 'Manager',
      performance: 10,
      earnings: 6500,
      appointmentsSet: 0,
      successRate: 95,
      startDate: '01.01.2024',
      avatar: 'SJ'
    }
  ]);

  const addMember = () => {
    if (newMember.name && newMember.email && newMember.phone) {
      const member = {
        id: Date.now(),
        ...newMember,
        earnings: 0,
        appointmentsSet: 0,
        successRate: 0,
        startDate: new Date().toLocaleDateString('de-DE'),
        avatar: newMember.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
      setTeamMembers(prev => [...prev, member]);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        position: 'Mitarbeiter',
        performance: 5
      });
      setShowNewMemberDialog(false);
      toast({
        title: "Teammitglied hinzugefügt",
        description: `${member.name} wurde erfolgreich hinzugefügt.`,
      });
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 8) return 'bg-green-100 text-green-800';
    if (performance >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPositionColor = (position: string) => {
    if (position.includes('Manager')) return 'bg-purple-100 text-purple-800';
    if (position.includes('closing')) return 'bg-green-100 text-green-800';
    if (position.includes('setting')) return 'bg-blue-100 text-blue-800';
    if (position.includes('opening')) return 'bg-yellow-100 text-yellow-800';
    if (position.includes('TikTok')) return 'bg-pink-100 text-pink-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredMembers = selectedRole === 'all' 
    ? teamMembers 
    : teamMembers.filter(member => member.position === selectedRole);

  if (selectedMember) {
    return (
      <TeamMemberDetail
        member={selectedMember}
        customers={customers}
        onBack={() => setSelectedMember(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Teammitglieder
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihr Team und deren Performance.</p>
        </div>
        <Dialog open={showNewMemberDialog} onOpenChange={setShowNewMemberDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Neues Teammitglied
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Teammitglied hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
              <Input
                placeholder="E-Mail"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              />
              <Input
                placeholder="Telefon"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
              />
              <Select value={newMember.position} onValueChange={(value) => setNewMember({...newMember, position: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Position auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium">Performance (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newMember.performance}
                  onChange={(e) => setNewMember({...newMember, performance: parseInt(e.target.value) || 5})}
                />
              </div>
              <Button onClick={addMember} className="w-full">
                Teammitglied hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter nach Position:</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Alle Positionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Positionen</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Gesamtes Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
            <p className="text-xs text-gray-500">Teammitglieder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Gesamteinnahmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">
                €{teamMembers.reduce((sum, member) => sum + member.earnings, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Termine gesetzt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-blue-600">
                {teamMembers.reduce((sum, member) => sum + member.appointmentsSet, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Durchschnittliche Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-purple-600">
                {Math.round(teamMembers.reduce((sum, member) => sum + member.performance, 0) / teamMembers.length)}/10
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{member.avatar}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {member.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedMember(member)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Seit: {member.startDate}
                </div>
              </div>

              {/* Position & Performance */}
              <div className="space-y-2">
                <Badge className={getPositionColor(member.position)}>
                  {member.position}
                </Badge>
                <Badge className={getPerformanceColor(member.performance)}>
                  Performance: {member.performance}/10
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Einnahmen:</span>
                  <div className="font-semibold text-green-600">€{member.earnings}</div>
                </div>
                <div>
                  <span className="text-gray-500">Termine gesetzt:</span>
                  <div className="font-semibold">{member.appointmentsSet}</div>
                </div>
              </div>

              {/* Success Rate */}
              {member.successRate > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Erfolgsrate:</span>
                  <div className="flex items-center mt-1">
                    <div className="text-lg font-bold text-blue-600">{member.successRate}%</div>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${member.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
