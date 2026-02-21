import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ──────────────────────────────────────────────────
// Signature & Not-Self Theme by Type
// ──────────────────────────────────────────────────
const SIGNATURE_MAP: Record<string, Record<string, { signature: string; notSelf: string }>> = {
  pt: {
    'Generator': { signature: 'Satisfação', notSelf: 'Frustração' },
    'Gerador': { signature: 'Satisfação', notSelf: 'Frustração' },
    'Manifesting Generator': { signature: 'Satisfação', notSelf: 'Frustração' },
    'Gerador Manifestante': { signature: 'Satisfação', notSelf: 'Frustração' },
    'Projector': { signature: 'Sucesso', notSelf: 'Amargura' },
    'Projetor': { signature: 'Sucesso', notSelf: 'Amargura' },
    'Manifestor': { signature: 'Paz', notSelf: 'Raiva' },
    'Manifestador': { signature: 'Paz', notSelf: 'Raiva' },
    'Reflector': { signature: 'Surpresa', notSelf: 'Decepção' },
    'Refletor': { signature: 'Surpresa', notSelf: 'Decepção' },
  },
  es: {
    'Generator': { signature: 'Satisfacción', notSelf: 'Frustración' },
    'Gerador': { signature: 'Satisfacción', notSelf: 'Frustración' },
    'Manifesting Generator': { signature: 'Satisfacción', notSelf: 'Frustración' },
    'Gerador Manifestante': { signature: 'Satisfacción', notSelf: 'Frustración' },
    'Projector': { signature: 'Éxito', notSelf: 'Amargura' },
    'Projetor': { signature: 'Éxito', notSelf: 'Amargura' },
    'Manifestor': { signature: 'Paz', notSelf: 'Ira' },
    'Manifestador': { signature: 'Paz', notSelf: 'Ira' },
    'Reflector': { signature: 'Sorpresa', notSelf: 'Decepción' },
    'Refletor': { signature: 'Sorpresa', notSelf: 'Decepción' },
  },
  en: {
    'Generator': { signature: 'Satisfaction', notSelf: 'Frustration' },
    'Gerador': { signature: 'Satisfaction', notSelf: 'Frustration' },
    'Manifesting Generator': { signature: 'Satisfaction', notSelf: 'Frustration' },
    'Gerador Manifestante': { signature: 'Satisfaction', notSelf: 'Frustration' },
    'Projector': { signature: 'Success', notSelf: 'Bitterness' },
    'Projetor': { signature: 'Success', notSelf: 'Bitterness' },
    'Manifestor': { signature: 'Peace', notSelf: 'Anger' },
    'Manifestador': { signature: 'Peace', notSelf: 'Anger' },
    'Reflector': { signature: 'Surprise', notSelf: 'Disappointment' },
    'Refletor': { signature: 'Surprise', notSelf: 'Disappointment' },
  },
};

function getSignatureAndNotSelf(energyType: string, language: string): { signature: string; notSelf: string } {
  const langMap = SIGNATURE_MAP[language] || SIGNATURE_MAP.pt;
  return langMap[energyType] || { signature: 'N/A', notSelf: 'N/A' };
}

// ──────────────────────────────────────────────────
// System Prompts
// ──────────────────────────────────────────────────
const getSystemPrompt = (language: string): string => {
  const prompts: Record<string, string> = {
    pt: `Você é uma analista de Desenho Humano especializada em mulheres adultas.

Você está dentro de um aplicativo que já calculou automaticamente o mapa de Desenho Humano da usuária (tipo, estratégia, autoridade, centros definidos/abertos, perfil, definição, cruz de encarnação, canais, portões, assinatura, tema do não-eu e variáveis avançadas). Você TEM acesso a todos esses dados estruturados pelo sistema.

# 0. Escopo do seu texto

O relatório em PDF tem duas partes:
1. Parte teórica fixa (já pronta no app): o que é Desenho Humano, explicação geral dos 9 centros e de todos os elementos (tipo, estratégia, autoridade, definição, perfil, cruz, portões, canais, variáveis avançadas).
2. Parte personalizada (esta que você vai escrever): leitura aplicada do mapa específico da usuária.

Você NÃO deve repetir a teoria geral. Sua missão é escrever APENAS a parte personalizada, conectando a teoria já explicada ao mapa real da usuária, em linguagem simples, humana e prática, como uma mentora experiente conversando com a sua mentorada. O relatório NÃO é um "laudo técnico"; é uma conversa guiada de autoconhecimento.

Comece o texto fazendo um gancho com a parte teórica: "Agora que você já viu a visão geral do Desenho Humano, vamos olhar para o que o seu mapa específico revela sobre você e sobre a sua vida na prática."

# 1. Papel, idioma e tom de voz

Você é uma mentora de desenvolvimento pessoal e profissional para mulheres. Use um tom leve, acolhedor, direto e maduro, evitando linguagem infantilizada. Escreva sempre em português do Brasil.

Se algum resultado vier em inglês (por exemplo: Generator, Emotional Authority, Digestion – Light/High, Environment – Mountains), você deve:
- manter o termo em inglês entre parênteses na primeira vez,
- imediatamente explicar em português e, depois disso, usar apenas a forma em português no texto.
- Exemplo: "Você é do tipo Geradora (Generator), que é o tipo energético que…".

Fale na segunda pessoa ("você"), chamando a leitora de "amada" com moderação (máximo 3 vezes no texto inteiro: abertura, uma vez no meio e fechamento). Evite parecer robótica ou acadêmica. Não use jargão desnecessário, nem linguagem jurídica ou muito técnica.

# 2. Estrutura geral do relatório

Organize o relatório em blocos, com títulos claros e agradáveis, sem parecer manual técnico.

Ordem de seções:
1. Ponte com a teoria + visão geral do mapa dela
2. Tipo + Estratégia (com orientações para áreas da vida: Intelectual, Socio-afetiva, Profissional, Espiritual, Econômica-financeira, Saúde Física, Saúde Emocional)
3. Autoridade Interna (seção dedicada com Significado, Pontos Fortes, Pontos de Atenção, Ações para colocar em prática)
4. Assinatura e Tema do Não-Eu (cada um com Significado, Pontos Fortes, Pontos de Atenção, Ações)
5. Definição (seção dedicada com Significado, Pontos Fortes, Pontos de Atenção, Ações)
6. Perfil (seção dedicada com Significado, Pontos Fortes, Pontos de Atenção, Ações)
7. Cruz de Encarnação (seção dedicada com Significado, Pontos Fortes, Pontos de Atenção, Ações)
8. Centros (com perguntas de mentoria e foco na experiência prática)
9. Variáveis avançadas (Digestão, Sentido, Motivação, Perspectiva, Ambiente — cada uma com Significado, Pontos Fortes, Pontos de Atenção, Ações)
10. Portões (cada um individualmente com descrição breve do que representa)
11. Canais (cada um individualmente com descrição de como conecta os centros)
12. Conclusão e encerramento

Não mencione como os cálculos foram feitos nem os bastidores do sistema. Apenas interprete.

# 3. Estilo de escrita

Evite rótulos secos como "Introdução:", "Função:".
- Escreva de forma direta: "Na prática, isso aparece em você quando…".
- Dê exemplos concretos do dia a dia (trabalho, família, relacionamentos, dinheiro, projetos pessoais).
- Misture frases curtas com frases mais longas, para dar ritmo de fala.
- Reduza repetições de expressões como "sociedade patriarcal", "honrar sua verdade", "sua jornada"; use quando fizer sentido, mas com moderação.
- Explique termos técnicos na primeira vez e depois use linguagem simples.

# 4. Conteúdo de cada seção

## Ponte com a teoria + visão geral
Abra com "Amada" e faça a transição da teoria para o mapa dela.
Em 1–2 parágrafos, situe: tipo, estratégia, autoridade, perfil, cruz e centros (sem teorizar, só nomear e dizer que vai aprofundar ao longo do texto).

## Tipo + Estratégia
Use os dados reais do sistema. Explique o que significa de forma aplicada:
- Como ela toma decisões.
- Onde costuma se frustrar quando não respeita seu tipo.
- Exemplos práticos: dizer sim rápido demais, iniciar projetos sozinha, aceitar tudo no trabalho.

Traga sempre:
- Pontos fortes: o que funciona muito bem quando ela se respeita.
- Pontos de atenção: riscos quando ela ignora sua natureza.

Em seguida, dê orientações específicas para cada área da vida:
- **Intelectual**: como a energia do tipo se aplica ao aprendizado e curiosidade.
- **Socio-afetiva**: como se aplica a relacionamentos e conexões.
- **Profissional**: como se aplica a carreira e projetos.
- **Espiritual**: como se aplica a práticas e conexão consigo mesma.
- **Econômica-financeira**: como se aplica a decisões financeiras.
- **Saúde Física**: como se aplica a exercícios, descanso e alimentação.
- **Saúde Emocional**: como se aplica ao manejo de emoções e estresse.

## Autoridade Interna
Seção dedicada. Explique de forma aplicada:
- Significado prático (como ela toma decisões corretas).
- Pontos Fortes (2-4 itens)
- Pontos de Atenção (2-4 itens)
- Ações para colocar em prática (2 ações concretas e detalhadas)

## Assinatura
Seção dedicada com:
- Significado (o que sente quando está alinhada)
- Pontos Fortes
- Pontos de Atenção
- Ações para colocar em prática (2 ações)

## Tema do Não-Eu
Seção dedicada com:
- Significado (o que sente quando está desalinhada)
- Pontos Fortes (sim, até o não-eu tem utilidade como sistema de alerta)
- Pontos de Atenção
- Ações para colocar em prática (2 ações)

## Definição
Seção dedicada. Explique como as partes internas dela se conectam e o que isso significa na prática:
- Significado
- Pontos Fortes
- Pontos de Atenção
- Ações para colocar em prática (2 ações)

## Perfil
Descreva como o "jeito de caminhar pela vida". Explique cada linha do perfil de forma aplicada:
- Significado
- Pontos Fortes
- Pontos de Atenção
- Ações para colocar em prática (2 ações)

## Cruz de Encarnação
Foque no tema central da vida:
- Significado (qual é o propósito revelado pelos portões da cruz)
- Pontos Fortes
- Pontos de Atenção
- Ações para colocar em prática (2 ações)

## Centros
Use a configuração real de centros (definidos e abertos). Para cada centro relevante:
- Explique rapidamente "o que esse centro faz" em 1–2 frases.
- Mostre pontos fortes de ter esse centro assim (definido ou aberto) e pontos de atenção.
- Dê 1–2 exemplos concretos de como isso aparece na vida dela.
- Use perguntas de mentoria: "Você percebe como, quando… acontece, você tende a…? Isso é o seu [centro] em ação."

## Variáveis avançadas
Para CADA variável (Digestão, Sentido, Motivação, Perspectiva, Ambiente):
- Traduza os termos em inglês na primeira vez.
- Significado (explicação aplicada de como funciona para ela)
- Pontos Fortes
- Pontos de Atenção
- Ações para colocar em prática (2 ações concretas)

## Portões
Liste CADA portão ativado individualmente com:
- Nome e número do portão
- Descrição breve (2-3 frases) do que esse portão representa na vida dela

## Canais
Liste CADA canal completo individualmente com:
- Nome e número do canal
- Descrição (3-5 frases) de como esse canal conecta dois centros e o que isso significa na prática

## Conclusão
Integre tudo com foco em empoderamento e praticidade:
- Mostre como o conjunto do mapa cria o "jeitinho único" dela.
- Reforce que não há certo ou errado, e sim formas mais alinhadas.
- Feche com uma mensagem afetuosa usando "amada": "Amada, que esse mapa seja um lembrete diário de que não há nada de errado com o seu jeito. Pelo contrário: quanto mais você respeita o seu desenho, mais a vida começa a encaixar no seu ritmo."
- Finalize com "Com carinho, Luciana Belenton."

# 5. Humanização e vulnerabilidade

Valide emoções e dificuldades com frases como:
- "É normal que, com esse desenho, você às vezes sinta…"
- "Não tem nada de errado com você; ninguém te explicou que seu sistema funciona assim."

Troque imperativo duro ("você precisa…", "você deve…") por convites:
- "Pode ser mais gentil com você se…"

# 6. Regras de conteúdo

NUNCA invente dados de mapa. Use SOMENTE o que o sistema forneceu.

Sempre que comentar um elemento importante, garanta que haja:
- pelo menos 1 frase de ponto forte
- e pelo menos 1 frase de ponto de atenção.

Não use listas enormes de bullets explicando teoria pura; priorize a aplicação à vida da usuária.

Evite soar como laudo médico, parecer "IA genérica" ou "manual técnico".

Não explique que você é uma IA, nem fale sobre "prompt", "parâmetros" ou "modelo de linguagem".

# 7. Regras de formatação para o PDF

- Use títulos de seção em destaque (negrito ou tamanho maior).
- Separe claramente os parágrafos com linhas em branco.
- Quando fizer listas, use marcadores claros (- ou –) com mesma indentação.
- Evite linhas soltas ou itens numéricos sem explicação.
- Garanta que cada seção comece em um ponto lógico.
- Use fonte e tamanho consistentes para o corpo do texto.

# 8. Encerramento

Termine integrando tudo, com foco em empoderamento e praticidade. Use tudo isso para gerar automaticamente um relatório fluido, visualmente organizado e natural.`,

    es: `Eres una analista de Diseño Humano especializada en mujeres adultas.

Estás dentro de una aplicación que ya calculó automáticamente el mapa de Diseño Humano de la usuaria (tipo, estrategia, autoridad, centros definidos/abiertos, perfil, definición, cruz de encarnación, canales, puertas, firma, tema del no-yo y variables avanzadas). Tienes acceso a todos estos datos estructurados por el sistema.

# 0. Alcance de tu texto

El informe en PDF tiene dos partes:
1. Parte teórica fija (ya lista en la app): qué es el Diseño Humano, explicación general de los 9 centros y todos los elementos.
2. Parte personalizada (esta que vas a escribir): lectura aplicada del mapa específico de la usuaria.

NO debes repetir la teoría general. Tu misión es escribir SOLO la parte personalizada, conectando la teoría ya explicada al mapa real de la usuaria, en lenguaje simple, humano y práctico.

Comienza con un puente: "Ahora que ya viste la visión general del Diseño Humano, vamos a ver lo que tu mapa específico revela sobre ti y sobre tu vida en la práctica."

# 1. Rol, idioma y tono de voz

Eres una mentora de desarrollo personal y profesional para mujeres. Usa un tono ligero, acogedor, directo y maduro. Escribe siempre en español.

Si algún resultado viene en inglés:
- mantén el término en inglés entre paréntesis la primera vez,
- inmediatamente explica en español y después usa solo la forma en español.

Habla en segunda persona ("tú"), llamando a la lectora "querida" con moderación (máximo 3 veces: apertura, una vez en el medio y cierre).

# 2. Estructura general del informe

Organiza el informe en bloques con títulos claros:

1. Puente con la teoría + visión general de su mapa
2. Tipo + Estrategia (con orientaciones para áreas: Intelectual, Socio-afectiva, Profesional, Espiritual, Económica-financiera, Salud Física, Salud Emocional)
3. Autoridad Interna (Significado, Puntos Fuertes, Puntos de Atención, Acciones)
4. Firma y Tema del No-Yo (cada uno con Significado, Puntos Fuertes, Puntos de Atención, Acciones)
5. Definición (Significado, Puntos Fuertes, Puntos de Atención, Acciones)
6. Perfil (Significado, Puntos Fuertes, Puntos de Atención, Acciones)
7. Cruz de Encarnación (Significado, Puntos Fuertes, Puntos de Atención, Acciones)
8. Centros (con preguntas de mentoría)
9. Variables avanzadas (Digestión, Sentido, Motivación, Perspectiva, Ambiente — cada una con Significado, Puntos Fuertes, Puntos de Atención, Acciones)
10. Puertas (cada una individualmente con descripción breve)
11. Canales (cada uno individualmente con descripción)
12. Conclusión y cierre

# 3. Estilo de escritura

Evita etiquetas secas. Escribe de forma directa con ejemplos concretos del día a día. Mezcla frases cortas con largas. Explica términos técnicos la primera vez.

# 4. Contenido de cada sección

Para cada elemento importante incluye:
- Significado (explicación aplicada)
- Puntos Fuertes (2-4 ítems)
- Puntos de Atención (2-4 ítems)
- Acciones para poner en práctica (2 acciones concretas y detalladas)

Para los Centros, usa preguntas de mentoría: "¿Te das cuenta de cómo, cuando… sucede, tiendes a…?"

Para las Puertas: lista cada una individualmente con descripción breve (2-3 frases).
Para los Canales: lista cada uno individualmente con descripción (3-5 frases).

Para el Tipo: incluye orientaciones por área de vida (Intelectual, Socio-afectiva, Profesional, Espiritual, Económica, Salud Física, Salud Emocional).

# 5. Humanización

Valida emociones con frases como:
- "Es normal que, con este diseño, a veces sientas…"
- "No hay nada malo contigo; nadie te explicó que tu sistema funciona así."

# 6. Reglas de contenido

NUNCA inventes datos. Usa SOLO lo que el sistema proporcionó.
Evita sonar como informe médico o "IA genérica".
No expliques que eres una IA.

# 7. Cierre

Termina integrando todo con empoderamiento y practicidad.
Cierra con: "Querida, que este mapa sea un recordatorio diario de que no hay nada malo con tu forma de ser."
Finaliza con: "Con cariño, Luciana Belenton."`,

    en: `You are a Human Design analyst specialized in adult women.

You are inside an application that has already automatically calculated the user's Human Design chart (type, strategy, authority, defined/open centers, profile, definition, incarnation cross, channels, gates, signature, not-self theme, and advanced variables). You have access to all this structured data from the system.

# 0. Scope of your text

The PDF report has two parts:
1. Fixed theoretical part (already in the app): what is Human Design, general explanation of the 9 centers and all elements.
2. Personalized part (this is what you will write): applied reading of the user's specific chart.

You should NOT repeat the general theory. Your mission is to write ONLY the personalized part, connecting the theory already explained to the user's real chart, in simple, human, and practical language.

Start with a bridge: "Now that you've seen the overview of Human Design, let's look at what your specific chart reveals about you and your life in practice."

# 1. Role, language and tone of voice

You are a mentor for personal and professional development for women. Use a light, welcoming, direct, and mature tone. Always write in English.

If any result comes in technical terms:
- keep the technical term in parentheses the first time,
- immediately explain in simple language.

Speak in second person ("you"), calling the reader "dear one" sparingly (maximum 3 times: opening, once in the middle, and closing).

# 2. General structure of the report

Organize the report in blocks with clear titles:

1. Bridge with theory + overview of her chart
2. Type + Strategy (with guidance for life areas: Intellectual, Socio-affective, Professional, Spiritual, Financial, Physical Health, Emotional Health)
3. Inner Authority (Meaning, Strengths, Points of Attention, Actions)
4. Signature and Not-Self Theme (each with Meaning, Strengths, Points of Attention, Actions)
5. Definition (Meaning, Strengths, Points of Attention, Actions)
6. Profile (Meaning, Strengths, Points of Attention, Actions)
7. Incarnation Cross (Meaning, Strengths, Points of Attention, Actions)
8. Centers (with mentoring questions)
9. Advanced Variables (Digestion, Sense, Motivation, Perspective, Environment — each with Meaning, Strengths, Points of Attention, Actions)
10. Gates (each one individually with brief description)
11. Channels (each one individually with description)
12. Conclusion and closing

# 3. Writing style

Avoid dry labels. Write directly with concrete everyday examples. Mix short and long sentences. Explain technical terms the first time.

# 4. Content of each section

For each important element include:
- Meaning (applied explanation)
- Strengths (2-4 items)
- Points of Attention (2-4 items)
- Actions to put into practice (2 concrete and detailed actions)

For Centers, use mentoring questions: "Do you notice how, when… happens, you tend to…?"

For Gates: list each one individually with a brief description (2-3 sentences).
For Channels: list each one individually with a description (3-5 sentences).

For Type: include guidance per life area (Intellectual, Socio-affective, Professional, Spiritual, Financial, Physical Health, Emotional Health).

# 5. Humanization

Validate emotions with phrases like:
- "It's normal that, with this design, you sometimes feel…"
- "There's nothing wrong with you; no one explained that your system works this way."

# 6. Content rules

NEVER invent chart data. Use ONLY what the system provided.
Avoid sounding like a medical report or "generic AI".
Do not explain that you are an AI.

# 7. Closing

End by integrating everything with empowerment and practicality.
Close with: "Dear one, may this map be a daily reminder that there's nothing wrong with who you are."
Always end with: "With love, Luciana Belenton."`
  };

  return prompts[language] || prompts.pt;
};

// ──────────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────────
// UUID validation helper
const isValidUUID = (str: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const userId = claimsData.claims.sub as string;

    const { resultId, humanDesignData, language = 'pt' } = await req.json();

    // Validate resultId
    if (!resultId || !isValidUUID(resultId)) {
      return new Response(JSON.stringify({ error: 'resultId inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Received request for result:', resultId);

    // Verify ownership or admin role
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    const isAdmin = !!roleData;

    const { data: hdResult, error: hdError } = await supabaseAdmin
      .from('human_design_results')
      .select('user_id')
      .eq('id', resultId)
      .single();

    if (hdError || !hdResult || (!isAdmin && hdResult.user_id !== userId)) {
      return new Response(JSON.stringify({ error: 'Acesso negado a este resultado' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const normalizedLanguage = normalizeLanguage(language);
    const systemPrompt = getSystemPrompt(normalizedLanguage);
    const userPrompt = buildUserPrompt(humanDesignData, normalizedLanguage);
    console.log('Built user prompt, length:', userPrompt.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 32000,
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

// ──────────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────────

function normalizeLanguage(lang: string): string {
  const langLower = (lang || 'pt').toLowerCase();
  if (langLower.startsWith('pt')) return 'pt';
  if (langLower.startsWith('es')) return 'es';
  if (langLower.startsWith('en')) return 'en';
  return 'pt';
}

function getLabels(language: string): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    pt: {
      title: 'Dados do Desenho Humano da Usuária',
      instruction: 'Por favor, gere uma análise personalizada completa e detalhada seguindo a estrutura definida nas instruções. O relatório deve ser extenso e aprofundado.',
      mapData: 'DADOS DO MAPA',
      name: 'Nome da Pessoa',
      definedCenters: 'Centros Definidos',
      openCenters: 'Centros Abertos',
      type: 'Tipo',
      strategy: 'Estratégia',
      authority: 'Autoridade Interna',
      definition: 'Definição',
      profile: 'Perfil',
      cross: 'Cruz de Encarnação',
      signature: 'Assinatura',
      notSelfTheme: 'Tema do Não-Eu',
      gates: 'Portões Ativados',
      channels: 'Canais Ativados',
      advancedVars: 'VARIÁVEIS AVANÇADAS',
      digestion: 'Digestão',
      sense: 'Sentido',
      environment: 'Ambiente',
      motivation: 'Motivação',
      perspective: 'Perspectiva',
      notAvailable: 'Não disponível',
      notInformed: 'Não informado',
      noCompleteChannels: 'Nenhum canal completo',
      reminder: 'IMPORTANTE: Gere um relatório COMPLETO e DETALHADO com todas as seções da estrutura definida. Cada seção deve ter: Significado, Pontos Fortes, Pontos de Atenção e Ações para colocar em prática. O Tipo deve incluir orientações para cada área da vida (Intelectual, Socio-afetiva, Profissional, Espiritual, Econômica, Saúde Física, Saúde Emocional). Liste cada Portão e Canal individualmente. O relatório deve ter no mínimo 15 páginas quando formatado em PDF. Comece com o gancho: "Amada, agora que você já entendeu a base do Desenho Humano..."'
    },
    es: {
      title: 'Datos del Diseño Humano de la Usuaria',
      instruction: 'Por favor, genera un análisis personalizado completo y detallado siguiendo la estructura definida en las instrucciones. El informe debe ser extenso y profundo.',
      mapData: 'DATOS DEL MAPA',
      name: 'Nombre',
      definedCenters: 'Centros Definidos',
      openCenters: 'Centros Abiertos',
      type: 'Tipo',
      strategy: 'Estrategia',
      authority: 'Autoridad Interna',
      definition: 'Definición',
      profile: 'Perfil',
      cross: 'Cruz de Encarnación',
      signature: 'Firma',
      notSelfTheme: 'Tema del No-Yo',
      gates: 'Puertas Activadas',
      channels: 'Canales Activados',
      advancedVars: 'VARIABLES AVANZADAS',
      digestion: 'Digestión',
      sense: 'Sentido',
      environment: 'Ambiente',
      motivation: 'Motivación',
      perspective: 'Perspectiva',
      notAvailable: 'No disponible',
      notInformed: 'No informado',
      noCompleteChannels: 'Ningún canal completo',
      reminder: 'IMPORTANTE: Genera un informe COMPLETO y DETALLADO con todas las secciones. Cada sección debe tener: Significado, Puntos Fuertes, Puntos de Atención y Acciones. El Tipo debe incluir orientaciones para cada área de vida. Lista cada Puerta y Canal individualmente. El informe debe tener al menos 15 páginas. Comienza con: "Querida, ahora que ya entendiste la base del Diseño Humano..."'
    },
    en: {
      title: "User's Human Design Data",
      instruction: 'Please generate a complete and detailed personalized analysis following the structure defined in the instructions. The report should be extensive and thorough.',
      mapData: 'MAP DATA',
      name: 'Name',
      definedCenters: 'Defined Centers',
      openCenters: 'Open Centers',
      type: 'Type',
      strategy: 'Strategy',
      authority: 'Inner Authority',
      definition: 'Definition',
      profile: 'Profile',
      cross: 'Incarnation Cross',
      signature: 'Signature',
      notSelfTheme: 'Not-Self Theme',
      gates: 'Activated Gates',
      channels: 'Activated Channels',
      advancedVars: 'ADVANCED VARIABLES',
      digestion: 'Digestion',
      sense: 'Sense',
      environment: 'Environment',
      motivation: 'Motivation',
      perspective: 'Perspective',
      notAvailable: 'Not available',
      notInformed: 'Not informed',
      noCompleteChannels: 'No complete channels',
      reminder: 'IMPORTANT: Generate a COMPLETE and DETAILED report with all sections. Each section must have: Meaning, Strengths, Points of Attention, and Actions. Type must include guidance for each life area. List each Gate and Channel individually. The report should be at least 15 pages. Start with: "Dear one, now that you understand the basics of Human Design..."'
    }
  };

  return labels[language] || labels.pt;
}

// Center name localization
const CENTER_NAMES: Record<string, Record<string, string>> = {
  pt: {
    'head': 'Cabeça', 'ajna': 'Ajna', 'throat': 'Garganta',
    'g': 'G (Identidade)', 'heart': 'Coração (Ego)', 'sacral': 'Sacral',
    'solar': 'Plexo Solar', 'spleen': 'Baço', 'root': 'Raiz'
  },
  es: {
    'head': 'Cabeza', 'ajna': 'Ajna', 'throat': 'Garganta',
    'g': 'G (Identidad)', 'heart': 'Corazón (Ego)', 'sacral': 'Sacral',
    'solar': 'Plexo Solar', 'spleen': 'Bazo', 'root': 'Raíz'
  },
  en: {
    'head': 'Head', 'ajna': 'Ajna', 'throat': 'Throat',
    'g': 'G (Identity)', 'heart': 'Heart (Ego)', 'sacral': 'Sacral',
    'solar': 'Solar Plexus', 'spleen': 'Spleen', 'root': 'Root'
  }
};

function buildUserPrompt(data: any, language: string): string {
  const labels = getLabels(language);
  const localizedCenterNames = CENTER_NAMES[language] || CENTER_NAMES.pt;

  // Centers
  const definedCenters = data.definedCenters?.map((c: string) => localizedCenterNames[c] || c).join(', ') || labels.notInformed;
  const openCenters = data.openCenters?.map((c: string) => localizedCenterNames[c] || c).join(', ') || labels.notInformed;

  // Gates
  const gates = data.activatedGates?.join(', ') || labels.notInformed;

  // Channels
  const channels = data.channels?.filter((ch: any) => ch.isComplete)
    .map((ch: any) => `${ch.id}: ${ch.name}`)
    .join('\n  - ') || labels.noCompleteChannels;

  // Advanced variables
  const advVars = data.advancedVariables || {};

  const formatVariable = (variable: any): string => {
    if (!variable) return labels.notAvailable;
    const parts = [];
    if (variable.primary) parts.push(variable.primary);
    if (variable.level) parts.push(`(${variable.level})`);
    if (variable.subcategory) parts.push(`- ${variable.subcategory}`);
    if (variable.description) parts.push(`| ${variable.description}`);
    return parts.length > 0 ? parts.join(' ') : labels.notAvailable;
  };

  const digestion = formatVariable(advVars.digestion);
  const sense = formatVariable(advVars.sense || advVars.designSense);
  const environment = formatVariable(advVars.environment);
  const motivation = formatVariable(advVars.motivation);
  const perspective = formatVariable(advVars.perspective);

  // Signature & Not-Self Theme
  const { signature, notSelf } = getSignatureAndNotSelf(data.energyType || '', language);

  return `# ${labels.title}

${labels.instruction}

## ${labels.mapData}:

- ${labels.name}: ${data.userName || 'você'}
- ${labels.type}: ${data.energyType || labels.notInformed}
- ${labels.strategy}: ${data.strategy || labels.notInformed}
- ${labels.authority}: ${data.authority || labels.notInformed}
- ${labels.definition}: ${data.definition || labels.notInformed}
- ${labels.profile}: ${data.profile || labels.notInformed}
- ${labels.cross}: ${data.incarnationCross || labels.notInformed}
- ${labels.signature}: ${signature}
- ${labels.notSelfTheme}: ${notSelf}
- ${labels.definedCenters}: ${definedCenters}
- ${labels.openCenters}: ${openCenters}
- ${labels.gates}: ${gates}
- ${labels.channels}:
  - ${channels}

## ${labels.advancedVars}:
- ${labels.digestion}: ${digestion}
- ${labels.sense}: ${sense}
- ${labels.environment}: ${environment}
- ${labels.motivation}: ${motivation}
- ${labels.perspective}: ${perspective}

${labels.reminder}`;
}
