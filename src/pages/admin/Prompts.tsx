import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ALL_EDGE_FUNCTION_PROMPTS, LANGUAGES } from '@/data/edgeFunctionPrompts';
import { generatePromptsReport } from '@/utils/generatePromptsReport';

const Prompts = () => {
  const [generating, setGenerating] = useState(false);

  const handleExportPDF = () => {
    setGenerating(true);
    try {
      generatePromptsReport();
    } finally {
      setTimeout(() => setGenerating(false), 500);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Documentação de Prompts</h1>
        </div>
        <Button onClick={handleExportPDF} disabled={generating} className="gap-2">
          <Download className="w-4 h-4" />
          {generating ? 'Gerando...' : 'Exportar PDF'}
        </Button>
      </div>

      <p className="text-muted-foreground mb-6">
        Visualize e exporte todos os prompts de IA usados nas Edge Functions. 
        Cada função possui system prompts e user prompt templates em 3 idiomas (PT, EN, ES).
      </p>

      <Tabs defaultValue={ALL_EDGE_FUNCTION_PROMPTS[0].name}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {ALL_EDGE_FUNCTION_PROMPTS.map((fn) => (
            <TabsTrigger key={fn.name} value={fn.name} className="text-xs sm:text-sm">
              {fn.displayName}
            </TabsTrigger>
          ))}
        </TabsList>

        {ALL_EDGE_FUNCTION_PROMPTS.map((fn) => (
          <TabsContent key={fn.name} value={fn.name}>
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {fn.displayName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Função: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{fn.name}</code> | 
                  Modelo: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{fn.model}</code>
                </p>
              </CardHeader>
            </Card>

            <Tabs defaultValue="pt">
              <TabsList className="mb-4">
                {LANGUAGES.map((lang) => (
                  <TabsTrigger key={lang.code} value={lang.code}>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {LANGUAGES.map((lang) => {
                const prompt = fn.prompts[lang.code];
                return (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">System Prompt ({lang.label})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-lg text-xs leading-relaxed overflow-auto max-h-[500px] whitespace-pre-wrap font-mono text-foreground">
                          {prompt.systemPrompt}
                        </pre>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">User Prompt Template ({lang.label})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-4 rounded-lg text-xs leading-relaxed overflow-auto max-h-[300px] whitespace-pre-wrap font-mono text-foreground">
                          {prompt.userPromptTemplate}
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Prompts;
