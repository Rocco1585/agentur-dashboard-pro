
import { Button } from "@/components/ui/button";
import { clearAllFinancialData } from '@/utils/clearFinancialData';
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

export function ClearDataButton() {
  const handleClearData = async () => {
    if (window.confirm('Sind Sie sicher, dass Sie alle Einnahmen und Ausgaben löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      const result = await clearAllFinancialData();
      
      if (result.success) {
        toast({
          title: "Daten gelöscht",
          description: "Alle Einnahmen und Ausgaben wurden erfolgreich gelöscht.",
        });
        // Seite neu laden, um die Änderungen zu reflektieren
        window.location.reload();
      } else {
        toast({
          title: "Fehler",
          description: "Fehler beim Löschen der Daten.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button 
      onClick={handleClearData} 
      variant="destructive" 
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      Alle Finanzdaten löschen
    </Button>
  );
}
