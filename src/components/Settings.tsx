
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Settings as SettingsIcon, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export function Settings() {
  const [teamNotice, setTeamNotice] = useState('');
  const [showTeamNotice, setShowTeamNotice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data: noticeData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'team_notice')
        .single();
      
      const { data: showData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'show_team_notice')
        .single();
      
      if (noticeData) setTeamNotice(noticeData.value);
      if (showData) setShowTeamNotice(showData.value === 'true');
    } catch (error) {
      console.log('No settings found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const saveTeamNoticeSettings = async () => {
    try {
      // Save or update team notice
      const { error: noticeError } = await supabase
        .from('settings')
        .upsert(
          { key: 'team_notice', value: teamNotice },
          { onConflict: 'key' }
        );

      if (noticeError) throw noticeError;

      // Save or update show team notice setting
      const { error: showError } = await supabase
        .from('settings')
        .upsert(
          { key: 'show_team_notice', value: showTeamNotice.toString() },
          { onConflict: 'key' }
        );

      if (showError) throw showError;

      toast({
        title: "Einstellungen gespeichert",
        description: "Team-Notiz Einstellungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Lade Einstellungen...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-600">Verwalten Sie Ihre System-Einstellungen</p>
      </div>

      {/* Team Notice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Team-Notiz Verwaltung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Team-Notiz anzeigen</h3>
                <p className="text-sm text-gray-600">
                  Aktivieren Sie diese Option, um die Team-Notiz auf dem Dashboard und in der Kundendetailansicht anzuzeigen.
                </p>
              </div>
              <Switch
                checked={showTeamNotice}
                onCheckedChange={setShowTeamNotice}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team-Notiz Inhalt:</label>
              <Textarea
                value={teamNotice}
                onChange={(e) => setTeamNotice(e.target.value)}
                placeholder="Geben Sie hier Ihre Team-Notiz ein..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-gray-500">
                Diese Nachricht wird mit grünem Hintergrund auf dem Dashboard und in der Kundendetailansicht angezeigt.
              </p>
            </div>

            {/* Preview */}
            {showTeamNotice && teamNotice && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Vorschau:</label>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Team-Notiz</h4>
                        <p className="text-green-700 text-sm whitespace-pre-wrap">{teamNotice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button onClick={saveTeamNoticeSettings} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Einstellungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            System-Informationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Version:</strong> 1.0.0
            </div>
            <div>
              <strong>Letztes Update:</strong> {new Date().toLocaleDateString('de-DE')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
