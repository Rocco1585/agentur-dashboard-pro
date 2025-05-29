
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTaxSettings() {
  const [taxRate, setTaxRate] = useState<number>(19);
  const [loading, setLoading] = useState(true);

  const fetchTaxRate = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'tax_rate')
        .single();
      
      if (data?.value) {
        setTaxRate(parseFloat(data.value));
      }
    } catch (error) {
      console.log('No tax rate found, using default 19%');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxRate();
  }, []);

  return { taxRate, loading, refetch: fetchTaxRate };
}
