import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

const EmptyState = () => {
  return (
    <Card className="border-2 border-dashed border-secondary bg-card/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Aguardando liberação de acesso
        </h3>
        <p className="text-muted-foreground max-w-md">
          Seus testes ainda não foram liberados. Aguarde o contato do administrador
          ou entre em contato para mais informações.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
