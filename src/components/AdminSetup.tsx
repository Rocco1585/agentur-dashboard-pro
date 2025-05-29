
import { useEffect, useState } from 'react';
import { createLisaAdminAccount } from '@/utils/createAdminUser';
import { toast } from '@/hooks/use-toast';

export function AdminSetup() {
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    const setupAdmin = async () => {
      if (!isSetup) {
        console.log('Setting up Lisa admin account...');
        const result = await createLisaAdminAccount();
        
        if (result.success) {
          console.log('Lisa admin setup successful:', result.message);
          toast({
            title: "Admin Setup",
            description: result.message,
          });
        } else {
          console.error('Lisa admin setup failed:', result.error);
        }
        
        setIsSetup(true);
      }
    };

    setupAdmin();
  }, [isSetup]);

  return null; // Invisible component
}
