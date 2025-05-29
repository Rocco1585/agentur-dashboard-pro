
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, User, Mail, Shield, ShieldCheck, Save, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTeamMembers } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

export function UserManagement() {
  const { teamMembers, loading, addTeamMember, updateTeamMember } = useTeamMembers();
  const { canViewAuditLogs } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    user_role: 'member' as 'admin' | 'member',
    role: '',
    phone: ''
  });

  // Definierte Positionen (gleiche wie bei Teammitgliedern)
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

  if (!canViewAuditLogs()) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Benutzer zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddUser = async () => {
    if (newUser.name && newUser.email && newUser.password) {
      const userData = {
        ...newUser,
        password_hash: newUser.password, // In einer echten Anwendung würde das Passwort gehasht
        is_active: true,
        payouts: 0,
        performance: '5'
      };
      await addTeamMember(userData);
      setNewUser({ name: '', email: '', password: '', user_role: 'member', role: '', phone: '' });
      setShowAddForm(false);
    } else {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: 'admin' | 'member') => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-lg">Lade Benutzerverwaltung...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-gray-600">Verwalten Sie Systembenutzer und deren Berechtigungen</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Benutzer hinzufügen
        </Button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left">Neuen Benutzer hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Name *"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              <Input
                placeholder="Email *"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
              <div className="relative">
                <Input
                  placeholder="Passwort *"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Input
                placeholder="Telefon"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Position auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newUser.user_role} onValueChange={(value: 'admin' | 'member') => setNewUser({...newUser, user_role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Benutzerrolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={handleAddUser} className="flex-1 bg-red-600 hover:bg-red-700">
                <Save className="h-4 w-4 mr-2" />
                Benutzer erstellen
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                <X className="h-4 w-4 mr-2 text-red-600" />
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between text-left">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-red-600" />
                  <span className="truncate text-gray-900">{member.name}</span>
                </div>
                <Badge className={getRoleBadgeColor(member.user_role || 'member')}>
                  {member.user_role === 'admin' ? (
                    <ShieldCheck className="h-3 w-3 mr-1" />
                  ) : (
                    <Shield className="h-3 w-3 mr-1" />
                  )}
                  {member.user_role === 'admin' ? 'Admin' : 'Member'}
                </Badge>
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
                {member.role && (
                  <div className="flex items-center text-sm">
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {member.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-gray-500">
                  Erstellt: {new Date(member.created_at).toLocaleDateString('de-DE')}
                </div>
                {member.last_login && (
                  <div className="text-xs text-gray-500">
                    Letzter Login: {new Date(member.last_login).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="text-left py-12">
            <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Benutzer</h3>
            <p className="text-gray-600 mb-4">Fügen Sie Ihren ersten Benutzer hinzu, um zu beginnen.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Benutzer hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
