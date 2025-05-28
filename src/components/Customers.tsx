
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Plus, Eye, Phone, Mail, Calendar } from "lucide-react";

export function Customers() {
  const [selectedStage, setSelectedStage] = useState('all');
  
  const stages = [
    { id: 'preparation', name: 'Vorbereitung', color: 'bg-gray-100 text-gray-800' },
    { id: 'test-active', name: 'Testphase aktiv', color: 'bg-blue-100 text-blue-800' },
    { id: 'upsell-pending', name: 'Upsell bevorstehend', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'existing', name: 'Bestandskunde', color: 'bg-green-100 text-green-800' },
    { id: 'completed', name: 'Abgeschlossen', color: 'bg-purple-100 text-purple-800' },
    { id: 'paused', name: 'Pausiert', color: 'bg-orange-100 text-orange-800' },
    { id: 'needs-replacement', name: 'Muss ersetzt werden', color: 'bg-red-100 text-red-800' },
  ];

  const customers = [
    {
      id: 1,
      name: 'ABC GmbH',
      contact: 'Max Mustermann',
      email: 'max@abc-gmbh.de',
      phone: '+49 123 456789',
      stage: 'test-active',
      priority: 'A Kunde',
      satisfaction: 8,
      nextAppointment: '15.01.2025',
      bookedAppointments: 12,
      completedAppointments: 8,
      paymentStatus: 'bezahlt'
    },
    {
      id: 2,
      name: 'XYZ Corp',
      contact: 'Lisa Schmidt',
      email: 'lisa@xyz-corp.com',
      phone: '+49 987 654321',
      stage: 'upsell-pending',
      priority: 'B Kunde',
      satisfaction: 9,
      nextAppointment: '18.01.2025',
      bookedAppointments: 8,
      completedAppointments: 6,
      paymentStatus: 'ausstehend'
    },
    {
      id: 3,
      name: 'DEF AG',
      contact: 'Tom Weber',
      email: 'tom@def-ag.de',
      phone: '+49 555 123456',
      stage: 'existing',
      priority: 'A Kunde',
      satisfaction: 7,
      nextAppointment: '20.01.2025',
      bookedAppointments: 15,
      completedAppointments: 12,
      paymentStatus: 'raten'
    },
  ];

  const getStageInfo = (stageId: string) => {
    return stages.find(stage => stage.id === stageId) || stages[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'A Kunde': return 'bg-red-100 text-red-800';
      case 'B Kunde': return 'bg-yellow-100 text-yellow-800';
      case 'C Kunde': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'bezahlt': return 'bg-green-100 text-green-800';
      case 'ausstehend': return 'bg-red-100 text-red-800';
      case 'raten': return 'bg-yellow-100 text-yellow-800';
      case 'teil bezahlt': return 'bg-orange-100 text-orange-800';
      case 'fehlgeschlagen': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = selectedStage === 'all' 
    ? customers 
    : customers.filter(customer => customer.stage === selectedStage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kunden-Pipeline</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden in verschiedenen Phasen.</p>
        </div>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Kunde
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter nach Phase:</label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Alle Phasen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Phasen</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const stageInfo = getStageInfo(customer.stage);
          return (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {customer.name}
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{customer.contact}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nächster Termin: {customer.nextAppointment}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={stageInfo.color}>
                    {stageInfo.name}
                  </Badge>
                  <Badge className={getPriorityColor(customer.priority)}>
                    {customer.priority}
                  </Badge>
                  <Badge className={getPaymentStatusColor(customer.paymentStatus)}>
                    {customer.paymentStatus}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Termine gebucht:</span>
                    <div className="font-semibold">{customer.bookedAppointments}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Termine gelegt:</span>
                    <div className="font-semibold">{customer.completedAppointments}</div>
                  </div>
                </div>

                {/* Satisfaction */}
                <div>
                  <span className="text-sm text-gray-500">Zufriedenheit:</span>
                  <div className="flex items-center mt-1">
                    <div className="text-lg font-bold text-blue-600">{customer.satisfaction}/10</div>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${customer.satisfaction * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
