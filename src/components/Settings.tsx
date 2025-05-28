
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Users, Shield, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function Settings() {
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'mitarbeiter' });
  
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@vertrieb.de', role: 'admin', created: '01.01.2024' },
    { id: 2, name: 'Max Mustermann', email: 'max@vertrieb.de', role: 'mitarbeiter', created: '01.03.2024' },
    { id: 3, name: 'Lisa Schmidt', email: 'lisa@vertrieb.de', role: 'mitarbeiter', created: '15.05.2024' },
  ];

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      toast({
        title: "Benutzer hinzugefügt",
        description: `${newUser.name} wurde als ${newUser.role} hinzugefügt.`,
      });
      setNewUser({ name: '', email: '', role: 'mitarbeiter' });
    }
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    toast({
      title: "Benutzer gelöscht",
      description: `${userName} wurde entfernt.`,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getRolePermissions = (role: string) => {
    if (role === 'admin') {
      return [
        'Vollzugriff auf alle Bereiche',
        'Benutzer verwalten',
        'Einstellungen ändern',
        'Finanzielle Daten einsehen',
        'Team-Performance überwachen',
        'Kunden und Leads verwalten'
      ];
    } else {
      return [
        'Termine in Kunden legen',
        'Eigene Daten einsehen',
        'Hot Leads bearbeiten (eingeschränkt)'
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-gray-500" />
          Einstellungen
        </h1>
        <p className="text-gray-600">Verwalten Sie Benutzer und Systemeinstellungen.</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Benutzerverwaltung</TabsTrigger>
          <TabsTrigger value="permissions">Berechtigungen</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Add New User */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Neuen Benutzer hinzufügen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Vollständiger Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="benutzer@beispiel.de"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rolle</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="mitarbeiter">Mitarbeiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddUser} className="w-full">
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Bestehende Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">Erstellt: {user.created}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'admin' ? 'Administrator' : 'Mitarbeiter'}
                        </span>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Administrator-Berechtigungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getRolePermissions('admin').map((permission, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Employee Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Mitarbeiter-Berechtigungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getRolePermissions('mitarbeiter').map((permission, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Firmenname</Label>
                  <Input id="company-name" placeholder="Ihre Vertriebsagentur GmbH" />
                </div>
                <div>
                  <Label htmlFor="tax-rate">Steuersatz (%)</Label>
                  <Input id="tax-rate" type="number" placeholder="30" />
                </div>
                <div>
                  <Label htmlFor="currency">Währung</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="usd">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zeitzone</Label>
                  <Select defaultValue="cet">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cet">CET (Europa/Berlin)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full md:w-auto mt-4">
                Einstellungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
