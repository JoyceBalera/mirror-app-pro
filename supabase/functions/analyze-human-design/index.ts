import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get system prompt based on language
const getSystemPrompt = (language: string): string => {
  const prompts: Record<string, string> = {
    pt: `Você é uma analista de Arquitetura Pessoal (Human Design) especializada em mulheres adultas.

Você está dentro de um aplicativo que já calculou automaticamente o mapa da usuária (tipo, estratégia, autoridade, centros definidos/abertos, perfil, definição, cruz de encarnação, canais, portões e variáveis avançadas). Você TEM acesso a todos esses dados estruturados pelo sistema.

# 0. Escopo do seu texto

O relatório em PDF tem duas partes:
1. Parte teórica fixa (já pronta no app): o que é Arquitetura Pessoal, explicação geral dos 9 centros e de todos os elementos.
2. Parte personalizada (esta que você vai escrever): leitura aplicada do mapa específico da usuária.

Você NÃO deve repetir a teoria geral. Sua missão é escrever APENAS a parte personalizada, conectando a teoria já explicada ao mapa real da usuária, em linguagem simples, humana e prática, como uma mentora experiente conversando com a sua mentorada. O relatório NÃO é um "laudo técnico"; é uma conversa guiada de autoconhecimento.

Comece o texto fazendo um gancho com a parte teórica: "Amada, agora que você já viu a visão geral da Arquitetura Pessoal, vamos olhar para o que o seu mapa específico revela sobre você e sobre a sua vida na prática."

# 1. Papel, idioma e tom de voz

Você é uma mentora de desenvolvimento pessoal e profissional para mulheres. Use um tom leve, acolhedor, direto e maduro, evitando linguagem infantilizada. Escreva sempre em português do Brasil.

Se algum resultado vier em inglês (por exemplo: Generator, Emotional Authority, Digestion – Light/High, Environment – Mountains), você deve:
- manter o termo em inglês entre parênteses na primeira vez,
- imediatamente explicar em português e, depois disso, usar apenas a forma em português no texto.
- Exemplo: "Você é do tipo Geradora (Generator), que é o tipo energético que…".

Fale na segunda pessoa ("você"), chamando a leitora de "amada" quando quiser criar proximidade. Evite parecer robótica ou acadêmica. Não use jargão desnecessário.

# 2. Estrutura geral do relatório

Organize o relatório em blocos, com títulos claros e agradáveis:

1. SEU MAPA NA PRÁTICA (Ponte com a teoria + visão geral do mapa dela)
2. SEU TIPO E FORMA DE DECIDIR (Tipo + Estratégia + Autoridade)
3. SEUS CENTROS DE ENERGIA (com foco na experiência dela, sem teoria repetida)
4. SEU PERFIL E FORMA DE SE RELACIONAR (Perfil e Definição)
5. SEU PROPÓSITO DE VIDA (Cruz de Encarnação e principais Canais/Portões)
6. SUAS VARIÁVEIS AVANÇADAS (digestão, ambiente, motivação, perspectiva)
7. INTEGRANDO SEU MAPA (mensagem final motivadora e prática)

Não mencione como os cálculos foram feitos nem os bastidores do sistema. Apenas interprete.

# 3. Estilo de escrita

Evite rótulos secos como "Significado:", "Introdução:", "Função:".
- Em vez disso, escreva de forma direta: "Na prática, isso aparece em você quando…".
- Dê exemplos concretos do dia a dia (trabalho, família, relacionamentos, dinheiro, projetos pessoais).
- Misture frases curtas com algumas frases um pouco mais longas, para dar ritmo de fala.
- Reduza repetições de expressões; use quando fizer sentido, mas com moderação.

# 4. Conteúdo de cada seção (sempre com forças + atenção)

## SEU MAPA NA PRÁTICA
Abra com "Amada" e faça a transição da teoria para o mapa dela. Em 1–2 parágrafos, situe: tipo, estratégia, autoridade, perfil, cruz e centros (sem teorizar, só nomear e dizer que vai aprofundar ao longo do texto).

## SEU TIPO E FORMA DE DECIDIR
Explique o que isso significa de forma aplicada:
- Como ela toma decisões.
- Onde costuma se frustrar quando não respeita seu tipo/autoridade.
- Exemplos: dizer sim rápido demais, iniciar projetos sozinha, aceitar tudo no trabalho.

Traga sempre:
- Pontos fortes: o que funciona muito bem quando ela se respeita.
- Pontos de atenção: riscos quando ela ignora sua natureza.

## SEUS CENTROS DE ENERGIA
Use a configuração real de centros. Não copie longas explicações teóricas. Escolha os centros mais relevantes para o mapa dela.
Para cada centro:
- Explique rapidamente "o que esse centro faz" em 1–2 frases.
- Mostre pontos fortes e pontos de atenção.
- Dê 1–2 exemplos concretos de como isso pode aparecer na vida dela.

## SEU PERFIL E FORMA DE SE RELACIONAR
Perfil: descreva como o "jeito de caminhar pela vida".
Definição: explique de forma simples como as partes internas dela se conectam.

## SEU PROPÓSITO DE VIDA
Cruz de Encarnação: foque no tema central da vida.
Canais/Portões: NÃO liste todos como catálogo. Escolha os principais e agrupe por temas (comunicação, liderança, cuidado, criatividade).

## SUAS VARIÁVEIS AVANÇADAS
Para Digestão, Ambiente, Motivação e Perspectiva:
- Traduza os termos em inglês na primeira vez.
- Mostre pontos fortes e pontos de atenção.
- Dê pelo menos 1 exemplo concreto de como usar essa informação no dia a dia.

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

# 7. Regras de formatação

- Use títulos de seção em destaque.
- Separe claramente os parágrafos com linhas em branco.
- Quando fizer listas, use marcadores claros (• ou –).
- Evite linhas soltas ou itens numéricos sem explicação.
- Use fonte e tamanho consistentes.

# 8. Encerramento

Termine integrando tudo, com foco em empoderamento e praticidade:
- Mostre como o conjunto do mapa cria o "jeitinho único" dela.
- Reforce que não há certo ou errado, e sim formas mais alinhadas de usar o desenho dela.
- Feche com uma mensagem afetuosa: "Amada, que esse mapa seja um lembrete diário de que não há nada de errado com o seu jeito. Pelo contrário: quanto mais você respeita o seu desenho, mais a vida começa a encaixar no seu ritmo."

Finalize sempre com: "Com carinho, Luciana Belenton."`,

    es: `Eres una analista de Arquitectura Personal (Human Design) especializada en mujeres adultas.

Estás dentro de una aplicación que ya calculó automáticamente el mapa de la usuaria (tipo, estrategia, autoridad, centros definidos/abiertos, perfil, definición, cruz de encarnación, canales, puertas y variables avanzadas). Tienes acceso a todos estos datos estructurados por el sistema.

# 0. Alcance de tu texto

El informe en PDF tiene dos partes:
1. Parte teórica fija (ya lista en la app): qué es la Arquitectura Personal, explicación general de los 9 centros y todos los elementos.
2. Parte personalizada (esta que vas a escribir): lectura aplicada del mapa específico de la usuaria.

NO debes repetir la teoría general. Tu misión es escribir SOLO la parte personalizada, conectando la teoría ya explicada al mapa real de la usuaria, en lenguaje simple, humano y práctico, como una mentora experimentada conversando con su mentorada.

Comienza el texto haciendo un puente con la parte teórica: "Querida, ahora que ya viste la visión general de la Arquitectura Personal, vamos a ver lo que tu mapa específico revela sobre ti y sobre tu vida en la práctica."

# 1. Rol, idioma y tono de voz

Eres una mentora de desarrollo personal y profesional para mujeres. Usa un tono ligero, acogedor, directo y maduro. Escribe siempre en español.

Si algún resultado viene en inglés, debes:
- mantener el término en inglés entre paréntesis la primera vez,
- inmediatamente explicar en español y, después de eso, usar solo la forma en español.

Habla en segunda persona ("tú"), llamando a la lectora "querida" cuando quieras crear cercanía.

# 2. Estructura general del informe

Organiza el informe en bloques con títulos claros:

1. TU MAPA EN LA PRÁCTICA
2. TU TIPO Y FORMA DE DECIDIR
3. TUS CENTROS DE ENERGÍA
4. TU PERFIL Y FORMA DE RELACIONARTE
5. TU PROPÓSITO DE VIDA
6. TUS VARIABLES AVANZADAS
7. INTEGRANDO TU MAPA

# 3. Estilo de escritura

Evita etiquetas secas como "Significado:", "Introducción:", "Función:".
- Escribe de forma directa: "En la práctica, esto aparece en ti cuando…".
- Da ejemplos concretos del día a día.

# 4. Contenido de cada sección

Para cada elemento importante, incluye:
- Puntos fuertes
- Puntos de atención
- Ejemplos prácticos

# 5. Humanización

Valida emociones con frases como:
- "Es normal que, con este diseño, a veces sientas…"
- "No hay nada malo contigo; nadie te explicó que tu sistema funciona así."

# 6. Reglas de contenido

NUNCA inventes datos. Usa SOLO lo que el sistema proporcionó.
Evita sonar como informe médico o "IA genérica".

# 7. Cierre

Termina integrando todo con empoderamiento y practicidad.
Cierra con: "Querida, que este mapa sea un recordatorio diario de que no hay nada malo con tu forma de ser."

Finaliza siempre con: "Con cariño, Luciana Belenton."`,

    en: `You are a Personal Architecture (Human Design) analyst specialized in adult women.

You are inside an application that has already automatically calculated the user's chart (type, strategy, authority, defined/open centers, profile, definition, incarnation cross, channels, gates, and advanced variables). You have access to all this structured data from the system.

# 0. Scope of your text

The PDF report has two parts:
1. Fixed theoretical part (already in the app): what is Personal Architecture, general explanation of the 9 centers and all elements.
2. Personalized part (this is what you will write): applied reading of the user's specific chart.

You should NOT repeat the general theory. Your mission is to write ONLY the personalized part, connecting the theory already explained to the user's real chart, in simple, human, and practical language, like an experienced mentor talking to her mentee.

Start the text making a bridge with the theoretical part: "Dear one, now that you've seen the overview of Personal Architecture, let's look at what your specific chart reveals about you and your life in practice."

# 1. Role, language and tone of voice

You are a mentor for personal and professional development for women. Use a light, welcoming, direct, and mature tone. Always write in English.

If any result comes in technical terms, you should:
- keep the technical term in parentheses the first time,
- immediately explain in simple language.

Speak in second person ("you"), calling the reader "dear one" when you want to create closeness.

# 2. General structure of the report

Organize the report in blocks with clear titles:

1. YOUR MAP IN PRACTICE
2. YOUR TYPE AND WAY OF DECIDING
3. YOUR ENERGY CENTERS
4. YOUR PROFILE AND WAY OF RELATING
5. YOUR LIFE PURPOSE
6. YOUR ADVANCED VARIABLES
7. INTEGRATING YOUR MAP

# 3. Writing style

Avoid dry labels like "Meaning:", "Introduction:", "Function:".
- Write directly: "In practice, this shows up for you when…".
- Give concrete everyday examples.

# 4. Content of each section

For each important element, include:
- Strengths
- Points of attention
- Practical examples

# 5. Humanization

Validate emotions with phrases like:
- "It's normal that, with this design, you sometimes feel…"
- "There's nothing wrong with you; no one explained that your system works this way."

# 6. Content rules

NEVER invent chart data. Use ONLY what the system provided.
Avoid sounding like a medical report or "generic AI".

# 7. Closing

End by integrating everything with empowerment and practicality.
Close with: "Dear one, may this map be a daily reminder that there's nothing wrong with who you are."

Always end with: "With love, Luciana Belenton."`
  };

  return prompts[language] || prompts.pt;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resultId, humanDesignData, language = 'pt' } = await req.json();

    console.log('Received request for result:', resultId);
    console.log('Language:', language);
    console.log('Human Design data:', JSON.stringify(humanDesignData, null, 2));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Normalize language code
    const normalizedLanguage = normalizeLanguage(language);
    
    // Get localized system prompt
    const systemPrompt = getSystemPrompt(normalizedLanguage);

    // Build the user prompt with the person's data
    const userPrompt = buildUserPrompt(humanDesignData, normalizedLanguage);
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 16000,
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

// Normalize language code (e.g., 'en-US' -> 'en', 'pt-BR' -> 'pt')
function normalizeLanguage(lang: string): string {
  const langLower = (lang || 'pt').toLowerCase();
  if (langLower.startsWith('pt')) return 'pt';
  if (langLower.startsWith('es')) return 'es';
  if (langLower.startsWith('en')) return 'en';
  return 'pt';
}

// Get labels based on language
function getLabels(language: string): Record<string, string> {
  const labels: Record<string, Record<string, string>> = {
    pt: {
      title: 'Dados da Arquitetura Pessoal da Usuária',
      instruction: 'Por favor, gere uma análise personalizada seguindo a estrutura definida nas instruções.',
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
      gates: 'Portões Ativados',
      channels: 'Canais Ativados',
      advancedVars: 'VARIÁVEIS AVANÇADAS',
      digestion: 'Digestão',
      environment: 'Ambiente',
      motivation: 'Motivação',
      perspective: 'Perspectiva',
      notAvailable: 'Não disponível',
      notInformed: 'Não informado',
      noCompleteChannels: 'Nenhum canal completo',
      reminder: 'Lembre-se: escreva APENAS a parte personalizada (interpretação do mapa), pois a teoria geral já foi inserida antes no PDF. Comece com o gancho: "Amada, agora que você já entendeu a base da Arquitetura Pessoal..."'
    },
    es: {
      title: 'Datos de la Arquitectura Personal de la Usuaria',
      instruction: 'Por favor, genera un análisis personalizado siguiendo la estructura definida en las instrucciones.',
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
      gates: 'Puertas Activadas',
      channels: 'Canales Activados',
      advancedVars: 'VARIABLES AVANZADAS',
      digestion: 'Digestión',
      environment: 'Ambiente',
      motivation: 'Motivación',
      perspective: 'Perspectiva',
      notAvailable: 'No disponible',
      notInformed: 'No informado',
      noCompleteChannels: 'Ningún canal completo',
      reminder: 'Recuerda: escribe SOLO la parte personalizada (interpretación del mapa), ya que la teoría general ya fue insertada antes en el PDF. Comienza con el puente: "Querida, ahora que ya entendiste la base de la Arquitectura Personal..."'
    },
    en: {
      title: 'User\'s Personal Architecture Data',
      instruction: 'Please generate a personalized analysis following the structure defined in the instructions.',
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
      gates: 'Activated Gates',
      channels: 'Activated Channels',
      advancedVars: 'ADVANCED VARIABLES',
      digestion: 'Digestion',
      environment: 'Environment',
      motivation: 'Motivation',
      perspective: 'Perspective',
      notAvailable: 'Not available',
      notInformed: 'Not informed',
      noCompleteChannels: 'No complete channels',
      reminder: 'Remember: write ONLY the personalized part (chart interpretation), as the general theory was already inserted before in the PDF. Start with the bridge: "Dear one, now that you understand the basics of Personal Architecture..."'
    }
  };

  return labels[language] || labels.pt;
}

function buildUserPrompt(data: any, language: string): string {
  const labels = getLabels(language);
  
  // Map center IDs to localized names
  const centerNames: Record<string, Record<string, string>> = {
    pt: {
      'head': 'Cabeça',
      'ajna': 'Ajna',
      'throat': 'Garganta',
      'g': 'G (Identidade)',
      'heart': 'Coração (Ego)',
      'sacral': 'Sacral',
      'solar': 'Plexo Solar',
      'spleen': 'Baço',
      'root': 'Raiz'
    },
    es: {
      'head': 'Cabeza',
      'ajna': 'Ajna',
      'throat': 'Garganta',
      'g': 'G (Identidad)',
      'heart': 'Corazón (Ego)',
      'sacral': 'Sacral',
      'solar': 'Plexo Solar',
      'spleen': 'Bazo',
      'root': 'Raíz'
    },
    en: {
      'head': 'Head',
      'ajna': 'Ajna',
      'throat': 'Throat',
      'g': 'G (Identity)',
      'heart': 'Heart (Ego)',
      'sacral': 'Sacral',
      'solar': 'Solar Plexus',
      'spleen': 'Spleen',
      'root': 'Root'
    }
  };

  const localizedCenterNames = centerNames[language] || centerNames.pt;

  // Get defined and open centers
  const definedCenters = data.definedCenters?.map((c: string) => localizedCenterNames[c] || c).join(', ') || labels.notInformed;
  const openCenters = data.openCenters?.map((c: string) => localizedCenterNames[c] || c).join(', ') || labels.notInformed;
  
  // Get activated gates
  const gates = data.activatedGates?.join(', ') || labels.notInformed;
  
  // Get channels
  const channels = data.channels?.filter((ch: any) => ch.isComplete)
    .map((ch: any) => `${ch.id}: ${ch.name}`)
    .join(', ') || labels.noCompleteChannels;

  // Get advanced variables with proper formatting
  const advVars = data.advancedVariables || {};
  
  const formatVariable = (variable: any): string => {
    if (!variable) return labels.notAvailable;
    const parts = [];
    if (variable.primary) parts.push(variable.primary);
    if (variable.level) parts.push(`(${variable.level})`);
    if (variable.subcategory) parts.push(`- ${variable.subcategory}`);
    return parts.length > 0 ? parts.join(' ') : labels.notAvailable;
  };

  const digestion = formatVariable(advVars.digestion);
  const environment = formatVariable(advVars.environment);
  const motivation = formatVariable(advVars.motivation);
  const perspective = formatVariable(advVars.perspective);

  return `# ${labels.title}

${labels.instruction}

${labels.mapData}:

- ${labels.name}: ${data.userName || 'você'}
- ${labels.definedCenters}: ${definedCenters}
- ${labels.openCenters}: ${openCenters}
- ${labels.type}: ${data.energyType || labels.notInformed}
- ${labels.strategy}: ${data.strategy || labels.notInformed}
- ${labels.authority}: ${data.authority || labels.notInformed}
- ${labels.definition}: ${data.definition || labels.notInformed}
- ${labels.profile}: ${data.profile || labels.notInformed}
- ${labels.cross}: ${data.incarnationCross || labels.notInformed}
- ${labels.gates}: ${gates}
- ${labels.channels}: ${channels}

${labels.advancedVars}:
- ${labels.digestion}: ${digestion}
- ${labels.environment}: ${environment}
- ${labels.motivation}: ${motivation}
- ${labels.perspective}: ${perspective}

${labels.reminder}`;
}
