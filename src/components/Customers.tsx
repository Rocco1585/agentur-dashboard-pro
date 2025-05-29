import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, User, Phone, Mail, Plus, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CreateCustomerForm } from './CreateCustomerForm';
import { CustomerDetail } from './CustomerDetail';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useLocation } from 'react-router-dom';

export function Customers() {
  const location = useLocation();
  const { canCreateCustomers, canEditCustomers, canViewCustomers } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
    
    // Check if we need to show a specific customer
    if (location.state?.selectedCustomerId) {
      const customerId = location.state.selectedCustomerId;
      fetchCustomerById(customerId);
    }
  }, [location.state]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Fehler",
        description: "Kunden konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerById = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const deleteCustomer = async (customerId: string, customerName: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.filter(customer => customer.id !== customerId));
      toast({
        title: "Kunde gelöscht",
        description: `${customerName} wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch':
        return 'bg-red-100 text-red-800';
      case 'Mittel':
        return 'bg-yellow-100 text-yellow-800';
      case 'Niedrig':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bezahlt':
        return 'bg-green-100 text-green-800';
      case 'Ausstehend':
        return 'bg-yellow-100 text-yellow-800';
      case 'Überfällig':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canViewCustomers()) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-left">Keine Berechtigung</h3>
            <p className="text-gray-600 text-left">Sie haben keine Berechtigung, Kunden zu verwalten.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Lade Kunden...</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6 p-6">
        <CreateCustomerForm 
          onClose={() => setShowCreateForm(false)}
          onCustomerCreated={fetchCustomers}
        />
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div className="space-y-6 p-6">
        <CustomerDetail 
          customer={selectedCustomer}
          onCustomerUpdated={() => {
            fetchCustomers();
            setSelectedCustomer(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kunden</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kunden</p>
        </div>
        {canCreateCustomers() && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuen Kunden hinzufügen
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-4 w-4" />
        <Input
          placeholder="Kunden suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-red-600" />
                  <span className="text-lg">{customer.name}</span>
                </div>
                <Badge className={customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-left">
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getPriorityColor(customer.priority)}>
                  {customer.priority}
                </Badge>
                <Badge className={getStatusColor(customer.payment_status)}>
                  {customer.payment_status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(customer)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
                
                {canEditCustomers() && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kunde löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sind Sie sicher, dass Sie {customer.name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCustomer(customer.id, customer.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Löschen
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

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Keine Kunden gefunden</h3>
            <p className="text-gray-600 mb-4 text-center">
              {customers.length === 0 
                ? "Fügen Sie Ihren ersten Kunden hinzu, um zu beginnen."
                : "Keine Kunden entsprechen Ihren Suchkriterien."
              }
            </p>
            {customers.length === 0 && canCreateCustomers() && (
              <Button onClick={() => setShowCreateForm(true)} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Ersten Kunden hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
