
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Users, Eye, Mail, Phone, User, Filter } from "lucide-react";
import { CustomerDetail } from "./CustomerDetail";
import { useCustomers } from "@/hooks/useSupabaseData";

export function Customers() {
  const { customers, loading, updateCustomer, addCustomer } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterActionStep, setFilterActionStep] = useState<string>('all');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    priority: 'Mittel',
    payment_status: 'Ausstehend',
    pipeline_stage: 'termin_ausstehend',
    is_active: false,
    action_step: 'in_vorbereitung'
  });

  const actionStepOptions = [
    { value: 'in_vorbereitung', label: 'In Vorbereitung' },
    { value: 'testphase_aktiv', label: 'Testphase aktiv' },
    { value: 'upsell_bevorstehend', label: 'Upsell bevorstehend' },
    { value: 'bestandskunde', label: 'Bestandskunde' },
    { value: 'pausiert', label: 'Pausiert' },
    { value: 'abgeschlossen', label: 'Abgeschlossen' }
  ];

  const getActionStepLabel = (value: string) => {
    return actionStepOptions.find(option => option.value === value)?.label || value;
  };

  const getActionStepColor = (actionStep: string) => {
    switch (actionStep) {
      case 'in_vorbereitung': return 'bg-gray-100 text-gray-800';
      case 'testphase_aktiv': return 'bg-blue-100 text-blue-800';
      case 'upsell_bevorstehend': return 'bg-purple-100 text-purple-800';
      case 'bestandskunde': return 'bg-green-100 text-green-800';
      case 'pausiert': return 'bg-yellow-100 text-yellow-800';
      case 'abgeschlossen': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Bezahlt': return 'bg-green-100 text-green-800';
      case 'Ausstehend': return 'bg-yellow-100 text-yellow-800';
      case 'Überfällig': return 'bg-red-100 text-red-800';
      case 'Raten': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.contact && newCustomer.email) {
      await addCustomer(newCustomer);
      setNewCustomer({
        name: '',
        contact: '',
        email: '',
        phone: '',
        priority: 'Mittel',
        payment_status: 'Ausstehend',
        pipeline_stage: 'termin_ausstehend',
        is_active: false,
        action_step: 'in_vorbereitung'
      });
      setShowNewCustomerDialog(false);
    }
  };

  // Filter customers based on active status and action step
  const filteredCustomers = customers.filter(customer => {
    const activeFilter = filterActive === 'all' || 
      (filterActive === 'active' && customer.is_active) ||
      (filterActive === 'inactive' && !customer.is_active);
    
    const actionStepFilter = filterActionStep === 'all' || customer.action_step === filterActionStep;
    
    return activeFilter && actionStepFilter;
  });

  if (selectedCustomer) {
    return (
      <CustomerDetail
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        onUpdate={(updatedCustomer) => {
          updateCustomer(updatedCustomer.id, updatedCustomer);
          setSelectedCustomer(updatedCustomer);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Kunden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Kunden
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden und deren Details.</p>
        </div>
        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Kunde
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Firmenname"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
              <Input
                placeholder="Ansprechpartner"
                value={newCustomer.contact}
                onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
              />
              <Input
                placeholder="E-Mail"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              />
              <Input
                placeholder="Telefon"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
              <Select value={newCustomer.priority} onValueChange={(value) => setNewCustomer({...newCustomer, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoch">Hoch</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Niedrig">Niedrig</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newCustomer.action_step} onValueChange={(value) => setNewCustomer({...newCustomer, action_step: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Action Step" />
                </SelectTrigger>
                <SelectContent>
                  {actionStepOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCustomer.is_active}
                  onCheckedChange={(checked) => setNewCustomer({...newCustomer, is_active: checked})}
                />
                <label className="text-sm font-medium">Aktiv</label>
              </div>
              <Button onClick={handleAddCustomer} className="w-full">
                Kunde hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Action Step</label>
              <Select value={filterActionStep} onValueChange={setFilterActionStep}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Action Steps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  {actionStepOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredCustomers.length} von {customers.length} Kunden angezeigt
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {customer.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {customer.is_active && (
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Aktiv" />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{customer.contact}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {customer.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {customer.phone}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getPriorityColor(customer.priority)}>
                  {customer.priority}
                </Badge>
                <Badge className={getPaymentStatusColor(customer.payment_status)}>
                  {customer.payment_status}
                </Badge>
                <Badge className={getActionStepColor(customer.action_step)}>
                  {getActionStepLabel(customer.action_step)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Termine:</span>
                  <div className="font-semibold">{customer.booked_appointments}</div>
                </div>
                <div>
                  <span className="text-gray-500">Zufriedenheit:</span>
                  <div className="font-semibold text-blue-600">{customer.satisfaction}/10</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
