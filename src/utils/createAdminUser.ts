
import { supabase } from '@/integrations/supabase/client';

export const createLisaAdminAccount = async () => {
  try {
    console.log('Creating Lisa admin account...');
    
    // Prüfen ob Lisa bereits existiert
    const { data: existingUser, error: checkError } = await supabase
      .from('team_members')
      .select('*')
      .eq('email', 'lisa@agentur.de')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingUser) {
      console.log('Lisa already exists, updating to admin...');
      
      // Update zu Admin
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          user_role: 'admin',
          is_active: true,
          password: 'passwort'
        })
        .eq('email', 'lisa@agentur.de');

      if (updateError) {
        console.error('Error updating Lisa to admin:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, message: 'Lisa wurde zu Admin aktualisiert' };
    } else {
      console.log('Creating new Lisa admin account...');
      
      // Neuen Admin-Account erstellen
      const { error: insertError } = await supabase
        .from('team_members')
        .insert({
          name: 'Lisa',
          email: 'lisa@agentur.de',
          password: 'passwort',
          user_role: 'admin',
          role: 'Manager b2b',
          is_active: true,
          payouts: 0,
          performance: '8'
        });

      if (insertError) {
        console.error('Error creating Lisa admin account:', insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, message: 'Lisa Admin-Account wurde erstellt' };
    }
  } catch (error) {
    console.error('Unexpected error creating Lisa admin account:', error);
    return { success: false, error: 'Unerwarteter Fehler' };
  }
};
