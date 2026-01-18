import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Database, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIDataDebugPanelProps {
  title?: string;
  sessionId?: string;
  resultId?: string;
  generatedAt?: string;
  modelUsed?: string;
  data: Record<string, any>;
}

const AIDataDebugPanel = ({
  title = "Dados usados pela IA",
  sessionId,
  resultId,
  generatedAt,
  modelUsed,
  data,
}: AIDataDebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const textToCopy = JSON.stringify({
        sessionId,
        resultId,
        generatedAt,
        modelUsed,
        ...data,
      }, null, 2);
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Dados copiados para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Database className="h-4 w-4" />
          {title}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Card className="mt-2 p-4 bg-muted/30 border-dashed">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-2">
              {sessionId && (
                <Badge variant="outline" className="text-xs">
                  Session: {sessionId.slice(0, 8)}...
                </Badge>
              )}
              {resultId && (
                <Badge variant="outline" className="text-xs">
                  Result: {resultId.slice(0, 8)}...
                </Badge>
              )}
              {modelUsed && (
                <Badge variant="secondary" className="text-xs">
                  {modelUsed}
                </Badge>
              )}
              {generatedAt && (
                <Badge variant="secondary" className="text-xs">
                  {new Date(generatedAt).toLocaleString('pt-BR')}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-1"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          
          <div className="max-h-80 overflow-auto">
            <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AIDataDebugPanel;
