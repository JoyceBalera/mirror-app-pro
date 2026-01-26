import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, AlertCircle, Calculator, ListChecks, RotateCcw } from 'lucide-react';
import { questionsLuciana as questions, facetNamesLuciana, traitMap } from '@/data/bigFiveQuestionsLuciana';
import { calculateScore, getTraitClassification, getFacetClassification } from '@/utils/scoreCalculator';
import { Answer } from '@/types/test';

type TestCase = 'all-1' | 'all-3' | 'all-5';

const traitNamesPortuguese: Record<string, string> = {
  neuroticism: 'Neuroticismo',
  extraversion: 'Extroversão',
  openness: 'Abertura',
  agreeableness: 'Amabilidade',
  conscientiousness: 'Conscienciosidade',
};

const Validacao = () => {
  const [selectedCase, setSelectedCase] = useState<TestCase>('all-3');

  // Generate answers based on test case
  const generateAnswers = (testCase: TestCase): Answer[] => {
    const value = testCase === 'all-1' ? 1 : testCase === 'all-3' ? 3 : 5;
    return questions.map(q => ({
      questionId: q.id,
      score: value,
    }));
  };

  // Calculate scores for selected test case
  const calculatedResults = useMemo(() => {
    const answers = generateAnswers(selectedCase);
    return calculateScore(answers);
  }, [selectedCase]);

  // Expected values based on mathematical logic
  const expectedValues = useMemo(() => {
    // With 50/50 split of plus/minus questions:
    // All answers same value → trait = 180, facet = 30
    return {
      traitScore: 180,
      facetScore: 30,
    };
  }, []);

  // Integrity checks
  const integrityChecks = useMemo(() => {
    const totalQuestions = questions.length;
    const uniqueIds = new Set(questions.map(q => q.id)).size;
    
    const traitCounts: Record<string, number> = {};
    const facetCounts: Record<string, number> = {};
    let minusCount = 0;
    let plusCount = 0;

    questions.forEach(q => {
      traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
      facetCounts[q.facet] = (facetCounts[q.facet] || 0) + 1;
      if (q.keyed === 'minus') minusCount++;
      else plusCount++;
    });

    const allTraitsHave60 = Object.values(traitCounts).every(c => c === 60);
    const allFacetsHave10 = Object.values(facetCounts).every(c => c === 10);
    const balancedKeyed = minusCount === 150 && plusCount === 150;

    return {
      totalQuestions,
      uniqueIds,
      traitCounts,
      facetCounts,
      minusCount,
      plusCount,
      checks: {
        total300: totalQuestions === 300,
        uniqueIdsMatch: uniqueIds === 300,
        allTraitsHave60,
        allFacetsHave10,
        balancedKeyed,
      },
    };
  }, []);

  // Inversion examples (first 5 minus questions per trait)
  const inversionExamples = useMemo(() => {
    const minusQuestions = questions.filter(q => q.keyed === 'minus');
    const examples: Record<string, typeof questions> = {};
    
    Object.keys(traitNamesPortuguese).forEach(trait => {
      examples[trait] = minusQuestions
        .filter(q => q.trait === trait)
        .slice(0, 3);
    });
    
    return examples;
  }, []);

  const responseValue = selectedCase === 'all-1' ? 1 : selectedCase === 'all-3' ? 3 : 5;

  const renderValidationBadge = (actual: number, expected: number) => {
    if (actual === expected) {
      return (
        <Badge variant="default" className="bg-emerald-600/90 hover:bg-emerald-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Match
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Divergência
      </Badge>
    );
  };

  const renderIntegrityBadge = (passed: boolean) => {
    if (passed) {
      return (
        <Badge variant="default" className="bg-emerald-600/90 hover:bg-emerald-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          OK
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Falha
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Validação de Cálculos - Big Five</h1>
        <p className="text-muted-foreground">
          Ferramenta de auditoria para comparar cálculos do sistema com a planilha Excel v2.2
        </p>
      </div>

      <Tabs defaultValue="validation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validation" className="gap-2">
            <Calculator className="w-4 h-4" />
            Validação de Scores
          </TabsTrigger>
          <TabsTrigger value="integrity" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Integridade
          </TabsTrigger>
          <TabsTrigger value="inversion" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Lógica de Inversão
          </TabsTrigger>
        </TabsList>

        {/* Tab: Validação de Scores */}
        <TabsContent value="validation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seleção de Caso de Teste */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Casos de Teste</CardTitle>
                <CardDescription>
                  Selecione um padrão de respostas para validar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedCase}
                  onValueChange={(v) => setSelectedCase(v as TestCase)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="all-1" id="all-1" />
                    <Label htmlFor="all-1" className="flex-1 cursor-pointer">
                      <div className="font-medium">Todas = 1</div>
                      <div className="text-sm text-muted-foreground">
                        Mínimo bruto (discordo totalmente)
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="all-3" id="all-3" />
                    <Label htmlFor="all-3" className="flex-1 cursor-pointer">
                      <div className="font-medium">Todas = 3</div>
                      <div className="text-sm text-muted-foreground">
                        Valor neutro (nem concordo nem discordo)
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="all-5" id="all-5" />
                    <Label htmlFor="all-5" className="flex-1 cursor-pointer">
                      <div className="font-medium">Todas = 5</div>
                      <div className="text-sm text-muted-foreground">
                        Máximo bruto (concordo totalmente)
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Lógica Matemática
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Com 30 questões <code>plus</code> e 30 <code>minus</code> por traço:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• <code>plus</code>: score = {responseValue}</li>
                    <li>• <code>minus</code>: score = 6 - {responseValue} = {6 - responseValue}</li>
                    <li>• Traço: (30 × {responseValue}) + (30 × {6 - responseValue}) = <strong>180</strong></li>
                    <li>• Faceta: (5 × {responseValue}) + (5 × {6 - responseValue}) = <strong>30</strong></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Resultados por Traço */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Resultados por Traço</CardTitle>
                <CardDescription>
                  Comparação entre valores calculados e esperados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Traço</TableHead>
                      <TableHead className="text-center">Calculado</TableHead>
                      <TableHead className="text-center">Esperado</TableHead>
                      <TableHead className="text-center">Classificação</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(calculatedResults.scores).map(([trait, score]) => (
                      <TableRow key={trait}>
                        <TableCell className="font-medium">
                          {traitNamesPortuguese[trait]}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {score}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {expectedValues.traitScore}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {getTraitClassification(score)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {renderValidationBadge(score, expectedValues.traitScore)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Resultados por Faceta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resultados por Faceta</CardTitle>
              <CardDescription>
                Validação detalhada das 30 facetas (10 questões cada)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(calculatedResults.facetScores).map(([trait, facets]) => (
                  <div key={trait} className="space-y-2">
                    <h4 className="font-medium text-sm border-b pb-1">
                      {traitNamesPortuguese[trait]}
                    </h4>
                    {Object.entries(facets).map(([facet, score]) => (
                      <div
                        key={facet}
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                      >
                        <span className="text-muted-foreground">
                          {facet}: {facetNamesLuciana[facet]}
                        </span>
                        <div className="flex items-center gap-2">
                        <span className="font-mono">{score}</span>
                        {score === expectedValues.facetScore ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Integridade */}
        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo de Integridade do Questionário</CardTitle>
              <CardDescription>
                Verificações automáticas da estrutura de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Checks principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-medium">Total de Questões</div>
                    <div className="text-sm text-muted-foreground">
                      Esperado: 300
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">{integrityChecks.totalQuestions}</span>
                    {renderIntegrityBadge(integrityChecks.checks.total300)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-medium">IDs Únicos</div>
                    <div className="text-sm text-muted-foreground">
                      Esperado: 300
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">{integrityChecks.uniqueIds}</span>
                    {renderIntegrityBadge(integrityChecks.checks.uniqueIdsMatch)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-medium">Balanceamento keyed</div>
                    <div className="text-sm text-muted-foreground">
                      Esperado: 150/150
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">
                      {integrityChecks.minusCount}/{integrityChecks.plusCount}
                    </span>
                    {renderIntegrityBadge(integrityChecks.checks.balancedKeyed)}
                  </div>
                </div>
              </div>

              {/* Contagem por Traço */}
              <div>
                <h4 className="font-medium mb-3">Questões por Traço (esperado: 60)</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(integrityChecks.traitCounts).map(([trait, count]) => (
                    <div
                      key={trait}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <span className="text-sm">{traitNamesPortuguese[trait]}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{count}</span>
                        {count === 60 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contagem por Faceta */}
              <div>
                <h4 className="font-medium mb-3">Questões por Faceta (esperado: 10)</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(integrityChecks.facetCounts).map(([facet, count]) => (
                    <div
                      key={facet}
                      className="flex items-center justify-between p-2 rounded border text-sm"
                    >
                      <span className="text-muted-foreground">{facet}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{count}</span>
                        {count === 10 ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Lógica de Inversão */}
        <TabsContent value="inversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demonstração da Lógica de Inversão</CardTitle>
              <CardDescription>
                Questões com <code>keyed: minus</code> usam a fórmula: score = 6 - resposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {Object.entries(inversionExamples).map(([trait, examples]) => (
                    <div key={trait}>
                      <h4 className="font-medium mb-3 text-primary">
                        {traitNamesPortuguese[trait]}
                      </h4>
                      <div className="space-y-3">
                        {examples.map((q) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-lg border bg-muted/20"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="font-mono">
                                    {q.id}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {q.facet}: {facetNamesLuciana[q.facet]}
                                  </Badge>
                                  <Badge className="bg-amber-600/90 hover:bg-amber-600">
                                    keyed: minus
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  "{q.text}"
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Exemplo com resposta = </span>
                                <span className="font-mono font-medium">{responseValue}</span>
                                <span className="text-muted-foreground"> → Inversão: </span>
                                <span className="font-mono">6 - {responseValue} = </span>
                                <span className="font-mono font-bold text-primary">
                                  {6 - responseValue}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tabela de Conversão Completa</CardTitle>
              <CardDescription>
                Referência rápida para todas as respostas possíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resposta Original</TableHead>
                    <TableHead>keyed: plus</TableHead>
                    <TableHead>keyed: minus (6 - x)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((resp) => (
                    <TableRow key={resp}>
                      <TableCell className="font-mono">{resp}</TableCell>
                      <TableCell className="font-mono">{resp}</TableCell>
                      <TableCell className="font-mono font-bold">{6 - resp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Validacao;
