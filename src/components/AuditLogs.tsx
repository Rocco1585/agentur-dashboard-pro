
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, Calendar } from "lucide-react";
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function AuditLogs() {
  const { auditLogs, loading } = useAuditLogs();
  const { canViewAuditLogs } = useAuth();

  if (!canViewAuditLogs()) {
    return (
      <div className="w-full p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Audit-Logs anzuzeigen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-4">
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
      'hot_leads': 'Hot Leads'
    };
    return tableNames[tableName] || tableName;
  };

  return (
    <div className="w-full p-4">
      <div className="w-full text-left mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Audit-Logs</h1>
        <p className="text-gray-600">Übersicht aller Systemänderungen</p>
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
                        {log.timestamp ? format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm', { locale: de }) : 'Unbekannt'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Benutzer:</strong> {log.team_member?.name || 'Unbekannt'} ({log.team_member?.email || 'Keine E-Mail'})
                    </div>
                    
                    {log.record_id && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Datensatz-ID:</strong> {log.record_id}
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
