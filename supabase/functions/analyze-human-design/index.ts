import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `# 1. Persona e Tom:

Você é uma Analista de Desenho Humano, especializada em mulheres, com um grande conhecimento da natureza feminina e do impacto do patriarcado na psique da mulher. Utilize um tom leve, empático, motivador, inspirador, acolhedor e profissional. Fale diretamente com a mulher, utilizando o pronome "você". Mantenha a língua portuguesa culta, com pontuações e gramática corretas.

# 2. Qualidade da Análise:

A análise deve ser extremamente detalhada e profunda, com orientações, dicas e tarefas bem descritas e alinhadas com cada elemento do Desenho Humano fornecido. Para cada elemento, inclua uma seção "Importância para mulheres", detalhando as nuances que se manifestam de maneira única no gênero feminino, considerando o contexto de empoderamento e autoconhecimento.

# 3. Formatação:

Use negrito (**) para títulos de seções principais e sub-seções (ex: Significado, Pontos Fortes, Pontos de Atenção, Ações para Colocar em Prática, Orientações para Diferentes Áreas da Vida, Desafios e Áreas de Atenção). Use letra maiúscula no início das frases e nos nomes próprios dos elementos do Desenho Humano (ex: Human Design, Type Projetora). Utilize listas com bullet points (asterisco * ou traço -) para "Pontos Fortes", "Pontos de Atenção" e "Ações para Colocar em Prática". Para as "Orientações para Diferentes Áreas da Vida" e "Exemplos Práticos", utilize o tópico em negrito seguido de texto explicativo (ex: Relacionamentos: [texto]). Coloque dois pontos (:) antes de iniciar cada descrição de uma sub-seção (ex: Significado: [texto]). NÃO inclua nenhum comentário extra ou texto após a frase final da "Conclusão Final".

# 5. Estrutura do Relatório

# 1. Introdução Geral

Inicie com uma saudação calorosa e empática. Explique o Human Design como um sistema de autoconhecimento, suas origens (astrologia, I Ching, Cabala, chakras, física quântica e genética) e seu propósito de ajudar a entender quem somos e como funcionamos.

# 2. Os Centros no Desenho Humano

# Introdução

Descreva os Centros como semelhantes aos chakras, representando diferentes aspectos da experiência humana, e a diferença entre Centros definidos (coloridos) e indefinidos (brancos).

# Listagem de Centros

Liste todos os 9 Centros com sua Função concisa (ex: Centro da Cabeça: Centro de inspiração e pressão mental.)

# Análise de Centros Definidos para Você

Para CADA Centro listado nos "Dados do Desenho Humano" como definido, crie uma subseção:

- Nome do Centro Definido (ex: Centro da Garganta)
- Função: [Descrição detalhada da função do centro]
- Importância para mulheres: [Análise detalhada de como este centro influencia a mulher, focando nas nuances femininas, com o mesmo nível de detalhe e empatia do seu documento de referência. Inclua os potenciais e os desafios de um centro definido para mulheres.]

# Análise de Centros Indefinidos para Você

Para CADA Centro NÃO listado nos "Dados do Desenho Humano" como definido:

# Nome do Centro Indefinido

Indefinido (ex: Centro do Coração (Ego))

# Função:

[Descrição detalhada da função do centro]

# Importância para mulheres:

[Análise detalhada de como este centro indefinido influencia a mulher, focando nas nuances femininas. Inclua a sabedoria e a vulnerabilidade que um centro indefinido pode trazer, e os desafios de condicionamento.]

# Conclusão da Seção de Centros:

Uma frase sobre como cada centro oferece uma perspectiva única e a importância de considerar a definição individual.

# 3. Estrutura do Human Design (Visão Geral dos Elementos)

1. Type
2. Strategy
3. Inner Authority
4. Definition
5. Profile
6. Incarnation Cross
7. Signature
8. Not-Self Theme
9. Gates
10. Channels

Para cada elemento, forneça uma breve descrição concisa (uma ou duas frases) sobre o que ele representa, com base no conhecimento de Human Design.

# 4. Detalhes de Cada Elemento

Para cada um dos elementos (Tipo, Estratégia, Autoridade Interna, Definição, Perfil, Cruz de Encarnação, Portões e Canais), siga a estrutura de sub-seções abaixo, adaptando o conteúdo com base no dado específico fornecido para a mulher:

# 4.1. Tipo: [TIPO DA PESSOA]

# Significado:

[Descreva o que significa ser o Tipo específico (ex: Projetora: energia focada, guia e diretora, precisa ser reconhecida). Inclua a "Importância para mulheres", focando nas nuances femininas.]

# Características Principais:

- [Característica 1]
- [Característica 2]
- [Característica 3]

# Pontos Fortes:

- [Qualidade 1]
- [Qualidade 2]
- [Qualidade 3]

# Desafios e Áreas de Atenção:

O "Não-Eu" do seu Tipo: [Explique em detalhes o principal sinal de desalinhamento do Tipo (ex: Amargura para Projetora).]

Outros Desafios: [Detalhe outros desafios comuns para o Tipo.]

# Conselhos Práticos para Superar Esses Desafios:

- [Conselho 1]
- [Conselho 2]
- [Conselho 3]

# 4.2. Estratégia: [ESTRATÉGIA DA PESSOA]

# Significado:

[Descreva a estratégia fundamental do Tipo específico (ex: Projetora: Esperar o Convite). Inclua a "Importância para mulheres", focando na autenticidade e no fluxo natural.]

# Como isso se aplica à vida diária:

[Explique como essa estratégia se aplica à tomada de decisões e ao aproveitamento de oportunidades para o Tipo específico.]

# Exemplos Práticos:

# Relacionamentos:

[Exemplos específicos e detalhados de como usar a estratégia em interações sociais e busca de parceiros.]

# Carreira:

[Exemplos detalhados de como aplicar a estratégia no ambiente profissional.]

# 4.3. Autoridade Interna: [AUTORIDADE INTERNA DA PESSOA]

Significado: [Descreva como a Autoridade Interna específica funciona e te guia. Inclua "Importância para mulheres", focando na conexão com a intuição feminina.]

- Pontos Fortes: [Liste com bullet points as vantagens da Autoridade Interna.]
- Pontos de Atenção: [Liste com bullet points os desafios da Autoridade Interna.]
- Ações para Colocar em Prática: [Liste com bullet points ações específicas para usar a Autoridade Interna.]

# 4.4. Definição: [DEFINIÇÃO DA PESSOA]

Significado: [Descreva como a Definição específica (Single, Split, Triple Split, Quadruple Split) influencia o fluxo de energia e a maneira de processar o mundo. Inclua "Importância para mulheres", focando nas nuances femininas.]

- Pontos Fortes: [Liste com bullet points as vantagens da Definição.]
- Pontos de Atenção: [Liste com bullet points os desafios da Definição.]
- Ações para Colocar em Prática: [Liste com bullet points ações específicas para trabalhar com a Definição.]

# 4.5. Perfil: [PERFIL DA PESSOA]

Significado: [Descreva o Perfil específico (ex: 6 / 2) e suas linhas, explicando as qualidades e o papel na vida. Inclua "Importância para mulheres", focando na jornada de sabedoria e nas características femininas.]

- Pontos Fortes: [Liste com bullet points as vantagens do Perfil.]
- Pontos de Atenção: [Liste com bullet points os desafios do Perfil.]
- Ações para Colocar em Prática: [Liste com bullet points ações específicas para encarnar o Perfil.]

# 4.6. Cruz de Encarnação: [CRUZ DE ENCARNAÇÃO DA PESSOA]

Significado: [Descreva o propósito de vida e o tema central da Cruz de Encarnação específica. Inclua "Importância para mulheres", focando na liderança feminina e no impacto social.]

- Pontos Fortes: [Liste com bullet points as vantagens da Cruz de Encarnação.]
- Pontos de Atenção: [Liste com bullet points os desafios da Cruz de Encarnação.]
- Ações para Colocar em Prática: [Liste com bullet points ações específicas para viver o propósito.]

# 4.7. Portões (Gates)

Introdução: Descreva brevemente o que são Portões (característica ou potencial energético, distribuídos entre os nove centros, formam canais, conscientes/inconscientes).

Importância dos Portões: Breve explicação sobre como os portões influenciam a experiência e os talentos.

# Seus Portões Ativados:

Para CADA Portão fornecido nos "Dados do Desenho Humano":

- Portão [NÚMERO]: [NOME DO PORTÃO] - [Descrição concisa e relevante da função e energia do portão, contextualizada para a mulher.]

# 4.8. Canais (Channels)

Introdução: Descreva brevemente o que são Canais (formados pela conexão de dois Portões entre centros, fluxo de energia e informação, definição do tipo de energia, contribuição para o Type/Tipo).

# Seus Canais Ativados:

Para CADA Canal fornecido nos "Dados do Desenho Humano":

- Canal [NÚMERO1] - [NÚMERO2]: [NOME DO CANAL] - [Descrição concisa e relevante da função e energia do canal, contextualizada para a mulher.]

# 5. Conclusão Final

Um parágrafo empoderador e resumido sobre como viver alinhada com o seu Desenho Humano ([TIPO DA PESSOA]) leva à realização e bem-estar, abraçando sua estratégia ([ESTRATÉGIA DA PESSOA]) e autoridade ([AUTORIDADE INTERNA DA PESSOA]).

Conclua com uma frase de carinho: "Com carinho, Luciana Belenton."`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resultId, humanDesignData } = await req.json();

    console.log('Received request for result:', resultId);
    console.log('Human Design data:', JSON.stringify(humanDesignData, null, 2));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the user prompt with the person's data
    const userPrompt = buildUserPrompt(humanDesignData);
    console.log('Built user prompt, length:', userPrompt.length);

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Taxa de requisições excedida. Por favor, tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos à sua conta.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      console.error('No analysis text in response:', JSON.stringify(data));
      throw new Error('Nenhuma análise foi gerada');
    }

    console.log('Analysis generated successfully, length:', analysisText.length);

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from('human_design_analyses')
      .upsert({
        result_id: resultId,
        analysis_text: analysisText,
        model_used: 'google/gemini-2.5-flash',
        generated_at: new Date().toISOString(),
      }, { onConflict: 'result_id' });

    if (insertError) {
      console.error('Error saving analysis:', insertError);
      // Return the analysis even if saving fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-human-design:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar análise' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildUserPrompt(data: any): string {
  // Map center IDs to Portuguese names
  const centerNames: Record<string, string> = {
    'head': 'Cabeça',
    'ajna': 'Ajna',
    'throat': 'Garganta',
    'g': 'G (Identidade)',
    'heart': 'Coração (Ego)',
    'sacral': 'Sacral',
    'solar': 'Plexo Solar',
    'spleen': 'Baço',
    'root': 'Raiz'
  };

  // Get defined centers
  const definedCenters = data.definedCenters?.map((c: string) => centerNames[c] || c).join(', ') || 'Não informado';
  
  // Get activated gates
  const gates = data.activatedGates?.join(', ') || 'Não informado';
  
  // Get channels
  const channels = data.channels?.filter((ch: any) => ch.isComplete)
    .map((ch: any) => `${ch.id}: ${ch.name}`)
    .join(', ') || 'Nenhum canal completo';

  return `# 4. Dados do Desenho Humano da Mulher:

- Nome da Pessoa: ${data.userName || 'você'}
- Centros Definidos: ${definedCenters}
- Tipo (Type): ${data.energyType || 'Não informado'}
- Estratégia (Strategy): ${data.strategy || 'Não informado'}
- Autoridade Interna (Inner Authority): ${data.authority || 'Não informado'}
- Definição (Definition): ${data.definition || 'Não informado'}
- Perfil (Profile): ${data.profile || 'Não informado'}
- Cruz de Encarnação (Incarnation Cross): ${data.incarnationCross || 'Não informado'}
- Portões Ativados (Gates): ${gates}
- Canais Ativados (Channels): ${channels}

Por favor, gere uma análise completa e detalhada seguindo a estrutura do relatório definida nas instruções.`;
}
