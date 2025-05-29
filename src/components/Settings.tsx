
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Settings as SettingsIcon, MessageSquare, Calculator, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { UserManagement } from './UserManagement';

export function Settings() {
  const [teamNotice, setTeamNotice] = useState('');
  const [showTeamNotice, setShowTeamNotice] = useState(false);
  const [taxRate, setTaxRate] = useState('19');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Team Notice Settings
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

      // Tax Rate Setting
      const { data: taxData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'tax_rate')
        .single();
      
      if (noticeData) setTeamNotice(noticeData.value);
      if (showData) setShowTeamNotice(showData.value === 'true');
      if (taxData) setTaxRate(taxData.value);
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

  const saveTaxSettings = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { key: 'tax_rate', value: taxRate },
          { onConflict: 'key' }
        );

      if (error) throw error;

      toast({
        title: "Einstellungen gespeichert",
        description: "Steuersatz wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error saving tax settings:', error);
      toast({
        title: "Fehler",
        description: "Steuersatz konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-lg">Lade Einstellungen...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none p-6">
      <div className="w-full text-left mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-600">Verwalten Sie Ihre System-Einstellungen</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="finance">Finanzen</TabsTrigger>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Team Notice Settings */}
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="flex items-center w-full">
                <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                Team-Notiz Verwaltung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 w-full">
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between w-full">
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

                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">Team-Notiz Inhalt:</label>
                  <Textarea
                    value={teamNotice}
                    onChange={(e) => setTeamNotice(e.target.value)}
                    placeholder="Geben Sie hier Ihre Team-Notiz ein..."
                    className="min-h-[120px] w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Diese Nachricht wird mit grünem Hintergrund auf dem Dashboard und in der Kundendetailansicht angezeigt.
                  </p>
                </div>

                {/* Preview */}
                {showTeamNotice && teamNotice && (
                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium">Vorschau:</label>
                    <Card className="bg-green-50 border-green-200 w-full">
                      <CardContent className="p-4 w-full">
                        <div className="flex items-start w-full">
                          <MessageSquare className="h-5 w-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                          <div className="w-full">
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
                  Team-Notiz speichern
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="flex items-center w-full">
                <SettingsIcon className="h-5 w-5 mr-2 text-red-600" />
                System-Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm w-full">
                <div>
                  <strong>Version:</strong> 1.0.0
                </div>
                <div>
                  <strong>Letztes Update:</strong> {new Date().toLocaleDateString('de-DE')}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          {/* Tax Settings - Zentriert */}
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader className="w-full">
                <CardTitle className="flex items-center w-full">
                  <Calculator className="h-5 w-5 mr-2 text-red-600" />
                  Steuer-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                <div className="space-y-4 w-full">
                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium">Steuersatz (%):</label>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="19"
                      className="w-full max-w-xs"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500">
                      Dieser Steuersatz wird für die Berechnung der Steuerrücklagen auf dem Dashboard verwendet.
                    </p>
                  </div>

                  {/* Preview - Zentriert */}
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <label className="text-sm font-medium">Beispielrechnung:</label>
                    <Card className="bg-blue-50 border-blue-200 w-full max-w-md">
                      <CardContent className="p-4 w-full">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Einnahmen (Beispiel):</span>
                            <span className="font-medium">€10.000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Steuersatz:</span>
                            <span className="font-medium">{taxRate}%</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-semibold">
                            <span>Steuerrücklage:</span>
                            <span>€{((10000 * parseFloat(taxRate || '0')) / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={saveTaxSettings} className="w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Steuer-Einstellungen speichern
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
