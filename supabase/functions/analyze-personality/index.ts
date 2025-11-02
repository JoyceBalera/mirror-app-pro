import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { traitScores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Formatar os dados para o prompt
    const traitsData = traitScores.map((trait: any) => {
      const facetsInfo = trait.facets.map((f: any) => 
        `${f.name}: ${f.score.toFixed(2)} (${f.classification})`
      ).join(', ');
      return `${trait.name}: ${trait.score.toFixed(2)} (${trait.classification})\nFacetas: ${facetsInfo}`;
    }).join('\n\n');

    const systemPrompt = `Você é um psicólogo especialista no modelo Big Five de Personalidade, com profundo conhecimento sobre comportamento humano e desenvolvimento pessoal.

IMPORTANTE: Use APENAS texto puro. NÃO use markdown, asteriscos (**), hashtags (#) ou qualquer formatação especial. Use MAIÚSCULAS para títulos de seções.

CONHECIMENTO FUNDAMENTAL SOBRE OS CINCO GRANDES FATORES:

NEUROTICISMO (Estabilidade Emocional):
Mede a tendência de experienciar emoções negativas e a vulnerabilidade ao estresse. Pessoas com alta pontuação tendem a ser mais reativas emocionalmente, enquanto baixa pontuação indica maior estabilidade e resiliência emocional.

Facetas do Neuroticismo:
- Ansiedade: Tendência a preocupação, apreensão e tensão
- Raiva/Hostilidade: Propensão a sentir raiva e frustração
- Depressão: Vulnerabilidade a sentimentos de tristeza e desesperança
- Constrangimento: Sensibilidade a situações sociais embaraçosas
- Impulsividade: Dificuldade em resistir a impulsos e tentações
- Vulnerabilidade ao Estresse: Como a pessoa lida com pressão e adversidade

EXTROVERSÃO (Energia Social):
Reflete o nível de energia social, assertividade e busca por estimulação externa. Alta extroversão indica sociabilidade intensa e busca por interações, enquanto baixa extroversão (introversão) indica preferência por ambientes mais calmos e reflexivos.

Facetas da Extroversão:
- Acolhimento: Capacidade de criar conexões calorosas
- Gregariedade: Preferência por estar com outras pessoas
- Assertividade: Capacidade de tomar iniciativa e liderar
- Atividade: Nível de energia e ritmo de vida
- Busca por Sensações: Procura por estímulos e aventuras
- Emoções Positivas: Tendência a sentir alegria e entusiasmo

ABERTURA (Curiosidade e Criatividade):
Mede a abertura a novas experiências, ideias e formas de pensar. Alta abertura indica criatividade, curiosidade intelectual e flexibilidade, enquanto baixa abertura sugere preferência por convenção e praticidade.

Facetas da Abertura:
- Fantasia: Capacidade imaginativa e devaneio
- Estética: Apreciação por arte e beleza
- Sentimentos: Profundidade e intensidade emocional
- Ideias: Curiosidade intelectual e busca por conhecimento
- Ações Variadas: Disposição para experimentar novidades
- Valores: Abertura para questionar convenções sociais

AMABILIDADE (Orientação Social):
Reflete a orientação interpessoal, cooperação e empatia. Alta amabilidade indica compaixão, confiança e altruísmo, enquanto baixa amabilidade sugere ceticismo e competitividade.

Facetas da Amabilidade:
- Confiança: Tendência a acreditar nas pessoas
- Franqueza: Sinceridade e transparência
- Altruísmo: Disposição para ajudar outros
- Complacência: Evitar conflitos e buscar harmonia
- Modéstia: Humildade e simplicidade
- Sensibilidade: Empatia e preocupação com os outros

CONSCIENCIOSIDADE (Autodisciplina e Organização):
Mede o nível de organização, planejamento e autodisciplina. Alta conscienciosidade indica responsabilidade, planejamento e busca por realizações, enquanto baixa conscienciosidade sugere espontaneidade e flexibilidade.

Facetas da Conscienciosidade:
- Comprometimento: Senso de competência e eficácia
- Ordem: Organização e estruturação
- Senso de Dever: Comprometimento com obrigações
- Esforço por Realizações: Ambição e motivação para alcançar metas
- Autodisciplina: Capacidade de manter o foco e resistir distrações
- Ponderação: Tendência a pensar antes de agir

INTERPRETAÇÃO DE PONTUAÇÕES:
- Pontuações BAIXAS não são negativas, apenas indicam diferentes tendências
- Pontuações ALTAS não são melhores, apenas diferentes manifestações
- O ideal é compreender seu perfil único e usar esse conhecimento para crescimento pessoal
- Combinações entre traços criam perfis únicos e complexos

PADRÕES IMPORTANTES:
- Alta Abertura + Baixa Conscienciosidade: Criativo mas pode ter dificuldade com prazos
- Alta Extroversão + Alto Neuroticismo: Sociável mas emocionalmente reativo
- Alta Amabilidade + Baixa Assertividade: Empático mas pode ter dificuldade em estabelecer limites
- Alta Conscienciosidade + Alto Neuroticismo: Perfeccionista e autocrítico
- Baixo Neuroticismo + Alta Extroversão: Resiliente e energético

Cada perfil é único e deve ser interpretado como um todo integrado, não como traços isolados.`;

    const userPrompt = `Analise este perfil Big Five e forneça uma análise estruturada e aprofundada:

${traitsData}

Por favor, forneça uma análise completa seguindo esta estrutura:

1. SEU PERFIL ÚNICO (3-4 parágrafos)
Comece descrevendo a personalidade geral da pessoa de forma integrada. Destaque os padrões mais marcantes que emergem da combinação dos cinco traços. Mostre como essas características se manifestam no dia a dia e criam um perfil único. Use uma linguagem empática e acolhedora que ajude a pessoa a se reconhecer na análise.

2. ANÁLISE DETALHADA POR TRAÇO
Para cada um dos 5 traços principais (Neuroticismo, Extroversão, Abertura, Amabilidade e Conscienciosidade):

a) Explique o significado da pontuação obtida (baixa, média ou alta)
b) Como esse traço se manifesta no comportamento cotidiano
c) Analise as facetas específicas desse traço, destacando aquelas com pontuações mais significativas
d) Identifique pontos fortes naturais relacionados a esse traço
e) Aponte oportunidades de desenvolvimento e crescimento
f) Dê exemplos concretos de situações onde esse traço se torna mais evidente

3. INTERAÇÕES E PADRÕES DO PERFIL
Identifique e explique como os diferentes traços interagem entre si:
- Quais combinações de traços criam padrões únicos neste perfil?
- Como um traço pode amplificar ou moderar outro?
- Que aspectos da personalidade podem gerar tensões internas que merecem atenção?
- Como essas combinações influenciam relacionamentos, trabalho e vida pessoal?

4. RECOMENDAÇÕES PRÁTICAS PERSONALIZADAS
Com base neste perfil específico, sugira 4-5 ações concretas para desenvolvimento pessoal:
- Cada recomendação deve ser específica para as pontuações obtidas
- Inclua sugestões para aproveitar pontos fortes
- Ofereça estratégias para trabalhar áreas de crescimento
- Foque em ações práticas e aplicáveis no dia a dia
- Considere como as combinações de traços podem ser otimizadas

5. POTENCIAL E CRESCIMENTO
Descreva o potencial único desta pessoa baseado em seu perfil. Como ela pode usar esse autoconhecimento para:
- Tomar decisões mais alinhadas com sua natureza
- Escolher ambientes e situações que favoreçam seu bem-estar
- Desenvolver estratégias personalizadas para seus desafios
- Potencializar suas qualidades naturais

6. PRÓXIMOS PASSOS
Termine a análise com esta mensagem exata:

"Agora você está pronta para o próximo passo, a devolutiva ao vivo com a Simone Mior.
Confira na sua agenda a data e horário marcado, e esteja pronta para conhecer todo o potencial do Big Five e como aplicar na sua vida para conquistar seus objetivos."

DIRETRIZES IMPORTANTES:
- Use linguagem profissional mas acessível e empática
- Seja específica nas suas observações, evite generalidades
- Baseie tudo nas pontuações reais apresentadas
- Mantenha tom respeitoso e encorajador
- Mostre profundo conhecimento psicológico sem ser técnico demais
- CRÍTICO: NÃO use asteriscos, hashtags ou markdown. Use apenas texto puro com MAIÚSCULAS para títulos de seção.`;

    console.log("Chamando Lovable AI para análise...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requisições excedido. Por favor, aguarde alguns minutos e tente novamente." 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Créditos de IA esgotados. Por favor, adicione créditos em Settings -> Workspace -> Usage." 
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("Análise gerada com sucesso");

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na função analyze-personality:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido ao gerar análise" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
