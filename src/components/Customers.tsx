import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  TrendingUp,
  Plus,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CreateCustomerForm } from './CreateCustomerForm';
import { CustomerDetail } from './CustomerDetail';
import { useAuth } from '@/hooks/useAuth';
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
  const { canCreateCustomers, canEditCustomers, canViewCustomers } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Berechtigung prüfen
  if (!canViewCustomers()) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Kunden anzuzeigen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const getPaymentStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg">Lade Kunden...</div>
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
          onCustomerUpdated={fetchCustomers}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kunden</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kundenbasis</p>
        </div>
        {canCreateCustomers() && (
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuer Kunde
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 h-4 w-4" />
        <Input
          placeholder="Kunden suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <User className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="truncate text-gray-900 text-sm">{customer.name}</span>
                </div>
                <Badge className={`ml-2 flex-shrink-0 text-xs px-2 py-1 ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {customer.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2">
                {customer.email && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                )}
                {customer.contact && (
                  <div className="flex items-center text-xs text-gray-600">
                    <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{customer.contact}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Priorität:</span>
                  <Badge className={`ml-1 text-xs ${getPriorityColor(customer.priority)}`}>
                    {customer.priority || 'Mittel'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Zahlung:</span>
                  <Badge className={`ml-1 text-xs ${getPaymentStatusColor(customer.payment_status)}`}>
                    {customer.payment_status || 'Ausstehend'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{customer.booked_appointments || 0} Termine</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>★ {customer.satisfaction || 5}</span>
                </div>
              </div>

              <div className="pt-3 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
                
                {canCreateCustomers() && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kunde löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sind Sie sicher, dass Sie den Kunden "{customer.name}" endgültig löschen möchten? 
                          Diese Aktion kann nicht rückgängig gemacht werden.
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
          <CardContent className="py-12">
            <div className="flex flex-col items-center">
              <User className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kunden gefunden</h3>
              <p className="text-gray-600 text-center">
                {customers.length === 0 
                  ? "Noch keine Kunden angelegt. Erstellen Sie Ihren ersten Kunden."
                  : "Keine Kunden entsprechen Ihren Suchkriterien."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
