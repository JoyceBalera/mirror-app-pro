import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

interface DemoResultBadgeProps {
  className?: string;
}

const DemoResultBadge = ({ className }: DemoResultBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-100 text-amber-800 border-amber-300 gap-1.5 ${className}`}
    >
      <FlaskConical className="w-3 h-3" />
      MODO DEMO - Dados Simulados
    </Badge>
  );
};

export default DemoResultBadge;
