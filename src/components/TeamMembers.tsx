
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Plus, Phone, Mail, Euro, Star, Calendar } from "lucide-react";

export function TeamMembers() {
  const [selectedRole, setSelectedRole] = useState('all');
  
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

  const teamMembers = [
    {
      id: 1,
      name: 'Max Mustermann',
      email: 'max@vertrieb.de',
      phone: '+49 123 456789',
      role: 'Vertriebsagentur closing b2c',
      startDate: '01.03.2024',
      performance: 9,
      totalEarned: '€15.430',
      totalPaid: '€14.200',
      appointmentsSet: 28,
      recentAppointments: [
        { client: 'ABC GmbH', date: '15.01.2025', type: 'Closing', status: 'Erfolgreich' },
        { client: 'XYZ Corp', date: '14.01.2025', type: 'Follow-up', status: 'Geplant' }
      ]
    },
    {
      id: 2,
      name: 'Lisa Schmidt',
      email: 'lisa@vertrieb.de',
      phone: '+49 987 654321',
      role: 'Vertriebsagentur setting b2b',
      startDate: '15.05.2024',
      performance: 8,
      totalEarned: '€12.850',
      totalPaid: '€12.100',
      appointmentsSet: 22,
      recentAppointments: [
        { client: 'DEF AG', date: '16.01.2025', type: 'Setting', status: 'Bestätigt' },
        { client: 'GHI Ltd', date: '13.01.2025', type: 'Erstgespräch', status: 'Erfolgreich' }
      ]
    },
    {
      id: 3,
      name: 'Tom Weber',
      email: 'tom@vertrieb.de',
      phone: '+49 555 123456',
      role: 'TikTok Poster',
      startDate: '10.08.2024',
      performance: 7,
      totalEarned: '€8.200',
      totalPaid: '€7.800',
      appointmentsSet: 0,
      recentAppointments: []
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah@vertrieb.de',
      phone: '+49 444 789123',
      role: 'Manager',
      startDate: '01.01.2024',
      performance: 10,
      totalEarned: '€25.600',
      totalPaid: '€24.800',
      appointmentsSet: 45,
      recentAppointments: [
        { client: 'JKL Corp', date: '17.01.2025', type: 'Management', status: 'Geplant' },
        { client: 'MNO GmbH', date: '15.01.2025', type: 'Oversight', status: 'Abgeschlossen' }
      ]
    }
  ];

  const getRoleColor = (role: string) => {
    if (role.includes('Manager')) return 'bg-purple-100 text-purple-800';
    if (role.includes('closing')) return 'bg-green-100 text-green-800';
    if (role.includes('setting')) return 'bg-blue-100 text-blue-800';
    if (role.includes('opening')) return 'bg-yellow-100 text-yellow-800';
    if (role.includes('TikTok')) return 'bg-pink-100 text-pink-800';
    if (role.includes('Bewerbung')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 9) return 'text-green-600';
    if (performance >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMembers = selectedRole === 'all' 
    ? teamMembers 
    : teamMembers.filter(member => member.role === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCheck className="h-8 w-8 mr-3 text-blue-500" />
            Teammitglieder
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihr Team und deren Leistung.</p>
        </div>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Neues Teammitglied
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter nach Rolle:</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Alle Rollen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
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

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {member.name}
                </CardTitle>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span className={`font-bold ${getPerformanceColor(member.performance)}`}>
                    {member.performance}/10
                  </span>
                </div>
              </div>
              <Badge className={getRoleColor(member.role)}>
                {member.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Seit: {member.startDate}
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500">Verdient:</span>
                  <div className="font-semibold text-green-600">{member.totalEarned}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Ausgezahlt:</span>
                  <div className="font-semibold text-blue-600">{member.totalPaid}</div>
                </div>
              </div>

              {/* Performance Metrics */}
              {member.appointmentsSet > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Termine gelegt:</span>
                    <span className="font-bold text-blue-600">{member.appointmentsSet}</span>
                  </div>
                  
                  {/* Recent Appointments */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Aktuelle Termine:</h4>
                    <div className="space-y-1">
                      {member.recentAppointments.slice(0, 2).map((appointment, index) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                          <span>{appointment.client}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">{appointment.date}</span>
                            <Badge variant="outline" className="text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Outstanding Payment */}
              {parseFloat(member.totalEarned.replace('€', '').replace('.', '')) > parseFloat(member.totalPaid.replace('€', '').replace('.', '')) && (
                <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                  <div className="flex items-center text-sm text-yellow-800">
                    <Euro className="h-4 w-4 mr-2" />
                    <span>Ausstehende Zahlung: €{(parseFloat(member.totalEarned.replace('€', '').replace('.', '')) - parseFloat(member.totalPaid.replace('€', '').replace('.', ''))).toLocaleString()}</span>
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
