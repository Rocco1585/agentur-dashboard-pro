
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, TrendingUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function CustomerDashboard() {
  const { customerId } = useParams();
  const { user, isAdmin } = useAuth();
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      // Überprüfe Berechtigung: Nur der Kunde selbst oder Admins können das Dashboard sehen
      if (!isAdmin() && user?.id !== customerId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', customerId)
        .eq('user_role', 'kunde')
        .single();

      if (error) throw error;
      setCustomerData(data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-lg text-left">Lade Dashboard...</div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Keine Berechtigung</h1>
          <p className="text-gray-600 mt-2">Sie haben keine Berechtigung, diese Seite zu betrachten.</p>
        </div>
      </div>
    );
  }

  // Überprüfe nochmals die Berechtigung
  if (!isAdmin() && user?.id !== customerId) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Keine Berechtigung</h1>
          <p className="text-gray-600 mt-2">Sie haben keine Berechtigung, diese Seite zu betrachten.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900">
          {customerData.customer_dashboard_name || 'Kunden Dashboard'}
        </h1>
        <p className="text-gray-600">Willkommen, {customerData.name}</p>
        {isAdmin() && (
          <Badge className="mt-2 bg-red-100 text-red-800">
            Admin-Ansicht für {customerData.name}
          </Badge>
        )}
      </div>

      {/* Dashboard Content - Wird in der nächsten Nachricht spezifiziert */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Termine</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">0</div>
            <p className="text-xs text-gray-600 text-left">Geplante Termine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Dokumente</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">0</div>
            <p className="text-xs text-gray-600 text-left">Verfügbare Dokumente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            </div>
            <p className="text-xs text-gray-600 text-left">Ihr Kontostatus</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Willkommen in Ihrem persönlichen Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-left">
            Hier können Sie Ihre Termine einsehen, Dokumente herunterladen und den Status Ihrer Projekte verfolgen.
            Die spezifischen Inhalte werden in Kürze hinzugefügt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
