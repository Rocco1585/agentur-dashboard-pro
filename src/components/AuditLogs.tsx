
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
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

export function AuditLogs() {
  const { auditLogs, loading, refetch } = useAuditLogs();
  const { canViewAuditLogs, logAuditEvent } = useAuth();

  if (!canViewAuditLogs()) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Audit-Logs anzuzeigen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clearAuditLogs = async () => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all logs

      if (error) throw error;

      // Log the clear action
      await logAuditEvent('CLEAR_LOGS', 'audit_logs', null, null, {
        action: 'Audit-Logs geleert',
        timestamp: new Date().toISOString(),
        logs_count: auditLogs.length
      });

      toast({
        title: "Audit-Logs geleert",
        description: `${auditLogs.length} Logs wurden erfolgreich gelöscht.`,
      });

      refetch();
    } catch (error) {
      console.error('Error clearing audit logs:', error);
      toast({
        title: "Fehler",
        description: "Audit-Logs konnten nicht geleert werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-lg">Lade Audit-Logs...</div>
      </div>
    );
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      case 'CLEAR_LOGS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames: Record<string, string> = {
      'customers': 'Kunden',
      'revenues': 'Einnahmen',
      'appointments': 'Termine',
      'todos': 'ToDos',
      'team_members': 'Teammitglieder',
      'hot_leads': 'Hot Leads',
      'user_sessions': 'Benutzer-Sitzungen',
      'audit_logs': 'Audit-Logs',
      'expenses': 'Ausgaben'
    };
    return tableNames[tableName] || tableName;
  };

  return (
    <div className="w-full p-6">
      <div className="w-full text-left mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Audit-Logs</h1>
            <p className="text-gray-600">Übersicht aller Systemänderungen ({auditLogs.length} Einträge)</p>
          </div>
          
          {auditLogs.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Logs leeren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Audit-Logs leeren
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Sind Sie sicher, dass Sie alle Audit-Logs ({auditLogs.length} Einträge) löschen möchten? 
                    Diese Aktion kann nicht rückgängig gemacht werden und alle Aktivitätsprotokolle gehen verloren.
                    <br /><br />
                    <strong>Diese Aktion wird selbst im Audit-Log protokolliert.</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAuditLogs}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Alle Logs löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-red-600" />
            System-Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Logs verfügbar</h3>
                <p className="text-gray-600">Es wurden noch keine Aktivitäten aufgezeichnet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          {getTableDisplayName(log.table_name)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {log.timestamp ? format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de }) : 'Unbekannt'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Benutzer:</strong> {log.team_member?.name || 'System'} ({log.team_member?.email || 'Keine E-Mail'})
                    </div>
                    
                    {log.record_id && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Datensatz-ID:</strong> {log.record_id}
                      </div>
                    )}

                    {log.user_agent && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Browser:</strong> {log.user_agent.substring(0, 100)}...
                      </div>
                    )}

                    {log.action === 'UPDATE' && log.old_values && log.new_values && (
                      <div className="text-xs bg-gray-50 p-2 rounded mt-2">
                        <strong>Änderungen:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {JSON.stringify({
                            alt: log.old_values,
                            neu: log.new_values
                          }, null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.action === 'INSERT' && log.new_values && (
                      <div className="text-xs bg-green-50 p-2 rounded mt-2">
                        <strong>Neue Daten:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.action === 'DELETE' && log.old_values && (
                      <div className="text-xs bg-red-50 p-2 rounded mt-2">
                        <strong>Gelöschte Daten:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    )}

                    {(log.action === 'LOGIN' || log.action === 'LOGOUT' || log.action === 'CLEAR_LOGS') && log.new_values && (
                      <div className="text-xs bg-blue-50 p-2 rounded mt-2">
                        <strong>Details:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
