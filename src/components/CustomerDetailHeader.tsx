
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CustomerDetailHeaderProps {
  onBack: () => void;
  customerName: string;
}

export function CustomerDetailHeader({ onBack, customerName }: CustomerDetailHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        onClick={onBack}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Kunden
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{customerName}</h1>
        <p className="text-gray-600">Kundendetails und Verwaltung</p>
      </div>
    </div>
  );
}
