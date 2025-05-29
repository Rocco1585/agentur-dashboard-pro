
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search, User, Mail, Phone, Euro, Calendar, Edit, Eye, Trash2 } from "lucide-react";
import { CustomerDetail } from "./CustomerDetail";
import { CustomerEditForm } from "./CustomerEditForm";
import { toast } from "@/hooks/use-toast";
import { useCustomers } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

export function Customers() {
  const { customers, loading, updateCustomer, addCustomer } = useCustomers();
  const { canCreateCustomers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('alle');
  const [filterStatus, setFilterStatus] = useState('alle');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const deleteCustomer = async (customerId: string, customerName: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      
      // Refresh the customers list
      window.location.reload();
      
      toast({
        title: "Kunde gelöscht",
        description: `${customerName} wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Fehler",
        description: `Kunde konnte nicht gelöscht werden.`,
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'alle' || customer.priority === filterPriority;
    const matchesStatus = filterStatus === 'alle' || 
                         (filterStatus === 'aktiv' && customer.is_active) ||
                         (filterStatus === 'inaktiv' && !customer.is_active);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-full p-4 sm:p-6">
        <div className="text-lg text-left">Lade Kunden...</div>
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <CustomerDetail 
        customer={selectedCustomer} 
        onBack={() => setSelectedCustomer(null)}
        onUpdate={(updatedCustomer) => {
          setSelectedCustomer(updatedCustomer);
        }}
      />
    );
  }

  if (editingCustomer) {
    return (
      <CustomerEditForm
        customer={editingCustomer}
        onSave={async (customerData) => {
          await updateCustomer(editingCustomer.id, customerData);
          setEditingCustomer(null);
        }}
        onCancel={() => setEditingCustomer(null)}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 text-left">Kunden</h1>
          <p className="text-gray-600 text-left">Verwalten Sie Ihre Kundenbasis</p>
        </div>
        {canCreateCustomers() && (
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2 text-white" />
            Kunde hinzufügen
          </Button>
        )}
      </div>

      {/* Add Customer Form */}
      {showAddForm && canCreateCustomers() && (
        <CustomerEditForm
          onSave={async (customerData) => {
            await addCustomer(customerData);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-4 w-4" />
          <Input
            placeholder="Kunden suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priorität filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Prioritäten</SelectItem>
            <SelectItem value="Hoch">Hoch</SelectItem>
            <SelectItem value="Mittel">Mittel</SelectItem>
            <SelectItem value="Niedrig">Niedrig</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            <SelectItem value="aktiv">Aktiv</SelectItem>
            <SelectItem value="inaktiv">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between text-left">
                <div className="flex items-center min-w-0 flex-1 text-left">
                  <User className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate text-gray-900 text-sm text-left">{customer.name}</span>
                </div>
                <Badge className={`ml-2 flex-shrink-0 text-xs px-2 py-1 ${
                  customer.priority === 'Hoch' ? 'bg-red-100 text-red-800' :
                  customer.priority === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {customer.priority}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left pt-0">
              <div className="space-y-2 text-left">
                {customer.contact && (
                  <div className="flex items-center text-xs text-gray-600 text-left">
                    <User className="h-3 w-3 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate text-left">{customer.contact}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center text-xs text-gray-600 text-left">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate text-left">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center text-xs text-gray-600 text-left">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0 text-red-600" />
                    <span className="truncate text-left">{customer.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t text-left">
                <div className="flex items-center justify-between mb-2 text-left">
                  <span className="text-xs text-gray-600 text-left">Status:</span>
                  <Badge className={`text-xs ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-left">
                  <span className="text-xs text-gray-600 text-left">Zahlung:</span>
                  <Badge variant="outline" className="text-xs">
                    {customer.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1 text-red-600" />
                  Details
                </Button>
                {canCreateCustomers() && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCustomer(customer)}
                      className="flex-1 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1 text-red-600" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1 text-red-600" />
                          Löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader className="text-left">
                          <AlertDialogTitle className="text-left">Kunde löschen</AlertDialogTitle>
                          <AlertDialogDescription className="text-left">
                            Sind Sie sicher, dass Sie den Kunden "{customer.name}" löschen möchten? 
                            Diese Aktion kann nicht rückgängig gemacht werden und wird alle zugehörigen 
                            Daten wie Termine und Einnahmen ebenfalls löschen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCustomer(customer.id, customer.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Endgültig löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-left py-12">
            <div className="flex flex-col items-start text-left">
              <Users className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Kunden gefunden</h3>
              <p className="text-gray-600 mb-4 text-left">
                {customers.length === 0 
                  ? "Fügen Sie Ihren ersten Kunden hinzu, um zu beginnen."
                  : "Keine Kunden entsprechen Ihren Suchkriterien."
                }
              </p>
              {canCreateCustomers() && customers.length === 0 && (
                <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2 text-white" />
                  Ersten Kunden hinzufügen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
