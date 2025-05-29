
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { AuthResponse } from '@/types/auth';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Email und Passwort ein.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.rpc('authenticate_user', {
        user_email: email,
        user_password: password
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Supabase RPC error:', error);
        
        // Spezifische Fehlermeldungen
        let errorMessage = "Es gab ein Problem bei der Verbindung zur Datenbank.";
        
        if (error.message.includes('function authenticate_user')) {
          errorMessage = "Login-Funktion ist nicht verfügbar. Bitte kontaktieren Sie den Administrator.";
        } else if (error.message.includes('permission denied')) {
          errorMessage = "Keine Berechtigung für diese Aktion.";
        } else if (error.message.includes('network')) {
          errorMessage = "Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.";
        }
        
        toast({
          title: "Verbindungsfehler",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const authResponse = data as unknown as AuthResponse;
      console.log('Parsed auth response:', authResponse);

      if (authResponse && authResponse.success) {
        toast({
          title: "Login erfolgreich",
          description: `Willkommen zurück, ${authResponse.user?.name}!`,
        });
        onLogin(authResponse.user);
      } else {
        // Spezifische Fehlermeldungen je nach Problem
        let errorMessage = "Ungültige Email oder Passwort.";
        
        if (authResponse?.error) {
          if (authResponse.error.includes('nicht gefunden')) {
            errorMessage = "Diese Email-Adresse ist nicht registriert.";
          } else if (authResponse.error.includes('Passwort')) {
            errorMessage = "Das eingegebene Passwort ist falsch.";
          } else if (authResponse.error.includes('inaktiv')) {
            errorMessage = "Ihr Account wurde deaktiviert. Bitte kontaktieren Sie den Administrator.";
          } else {
            errorMessage = authResponse.error;
          }
        } else if (!authResponse) {
          errorMessage = "Unerwartete Antwort vom Server. Bitte versuchen Sie es erneut.";
        }
        
        console.log('Login failed:', errorMessage);
        
        toast({
          title: "Login fehlgeschlagen",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = "Ein unerwarteter Fehler ist aufgetreten.";
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Die Anfrage ist zu lange gelaufen. Bitte versuchen Sie es erneut.";
        } else {
          errorMessage = `Fehler: ${error.message}`;
        }
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-red-600">C</span>
            <span className="text-gray-900">edric</span>
            <span className="text-red-600">O</span>
            <span className="text-gray-900">rt.de</span>
          </CardTitle>
          <p className="text-gray-600">Melden Sie sich an, um fortzufahren</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre-email@example.com"
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Passwort</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ihr Passwort"
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Test-Accounts:</p>
            <p className="font-mono text-xs">c.ort@cedricort.de / passwort (Admin)</p>
            <p className="font-mono text-xs">lisa@agentur.de / passwort (Admin)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
