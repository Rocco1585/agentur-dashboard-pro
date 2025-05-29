
import { supabase } from '@/integrations/supabase/client';

export const clearAllFinancialData = async () => {
  try {
    // Lösche alle Einnahmen
    const { error: revenuesError } = await supabase
      .from('revenues')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Lösche alles außer einer nicht existierenden ID

    if (revenuesError) {
      console.error('Fehler beim Löschen der Einnahmen:', revenuesError);
    }

    // Lösche alle Ausgaben
    const { error: expensesError } = await supabase
      .from('expenses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Lösche alles außer einer nicht existierenden ID

    if (expensesError) {
      console.error('Fehler beim Löschen der Ausgaben:', expensesError);
    }

    console.log('Alle Einnahmen und Ausgaben wurden erfolgreich gelöscht.');
    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen der Finanzdaten:', error);
    return { success: false, error };
  }
};
