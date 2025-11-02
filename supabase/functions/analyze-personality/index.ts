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

    const systemPrompt = `Você é um psicólogo especialista no modelo Big Five de Personalidade. 
Sua tarefa é fornecer uma análise detalhada, profissional e empática do perfil de personalidade apresentado.

IMPORTANTE: Use APENAS texto puro. NÃO use markdown, asteriscos (**), hashtags (#) ou qualquer formatação especial. Use MAIÚSCULAS para títulos de seções.

O modelo Big Five mede cinco dimensões principais:
- Neuroticismo (estabilidade emocional)
- Extroversão (sociabilidade e energia)
- Abertura (criatividade e curiosidade)
- Amabilidade (cooperação e empatia)
- Conscienciosidade (organização e autodisciplina)

Cada traço tem 5 facetas que detalham aspectos específicos.`;

    const userPrompt = `Analise este perfil Big Five e forneça uma análise estruturada:

${traitsData}

Por favor, forneça:

1. RESUMO GERAL (2-3 parágrafos)
Descreva a personalidade geral da pessoa, destacando os padrões mais marcantes do Big Five.

2. ANÁLISE POR TRAÇO
Para cada um dos 5 traços do Big Five:
- Explique o que o score significa
- Como isso se manifesta no dia a dia
- Pontos fortes relacionados
- Áreas de desenvolvimento

3. PADRÕES E COMBINAÇÕES
Identifique como os traços do Big Five interagem entre si e formam um perfil único.

4. RECOMENDAÇÕES PERSONALIZADAS
Sugira 3-4 ações práticas baseadas neste perfil específico.

5. PRÓXIMOS PASSOS
Termine a análise com esta mensagem exata:

"Agora você está pronta para o próximo passo, a devolutiva ao vivo com a Simone Mior.
Confira na sua agenda a data e horário marcado, e esteja pronta para conhecer todo o potencial do Big Five e como aplicar na sua vida para conquistar seus objetivos."

Use linguagem acessível, empática e profissional. Evite jargões desnecessários.
IMPORTANTE: NÃO use asteriscos, hashtags ou markdown. Use apenas texto puro com MAIÚSCULAS para títulos.`;

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
