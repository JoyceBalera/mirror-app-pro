import { getHDSystemPrompt, normalizeReportTerms, type ReportLanguage } from "../_shared/reportLanguage.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function logError(supabase: any, functionName: string, errorMessage: string, errorDetails: any, userId: string | null) {
  try {
    await supabase.from('edge_function_logs').insert({
      function_name: functionName,
      error_message: errorMessage,
      error_details: errorDetails || {},
      user_id: userId,
    });
  } catch (e) {
    console.error('Failed to log error to database:', e);
  }
}

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
const getSystemPrompt = (language: string): string =>
  getHDSystemPrompt(normalizeLanguage(language) as ReportLanguage);

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
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const userId = userData.user.id;

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
    const userPrompt = normalizeReportTerms(buildUserPrompt(humanDesignData, normalizedLanguage), normalizedLanguage as ReportLanguage);
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
        await logError(supabase, 'analyze-human-design', 'Rate limit exceeded (429)', { status: 429, errorText, resultId }, userId);
        return new Response(JSON.stringify({ error: 'Taxa de requisições excedida. Por favor, tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        await logError(supabase, 'analyze-human-design', 'Credits exhausted (402)', { status: 402, errorText, resultId }, userId);
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos à sua conta.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawAnalysis = data.choices?.[0]?.message?.content;
    const analysisText = rawAnalysis ? normalizeReportTerms(rawAnalysis, normalizedLanguage as ReportLanguage) : rawAnalysis;

    if (!analysisText) {
      console.error('No analysis text in response:', JSON.stringify(data));
      throw new Error('Nenhuma análise foi gerada');
    }

    console.log('Analysis generated successfully, length:', analysisText.length);

    // Save to database
    const supabaseUrl2 = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey2 = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseDb = createClient(supabaseUrl2, supabaseServiceKey2);

    const { error: insertError } = await supabaseDb
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseForLog = createClient(supabaseUrl, supabaseServiceKey);
    await logError(supabaseForLog, 'analyze-human-design', error instanceof Error ? error.message : 'Erro desconhecido', { stack: error instanceof Error ? error.stack : undefined }, null);
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
      reminder: 'Follow the complete section order and language rules. Use supplied chart categories only as reflection hypotheses. Do not repeat theory or add claims to fill pages.'
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
      reminder: 'Follow the complete section order and language rules. Use supplied chart categories only as reflection hypotheses. Do not repeat theory or add claims to fill pages.'
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
      reminder: 'Follow the complete section order and language rules. Use supplied chart categories only as reflection hypotheses. Do not repeat theory or add claims to fill pages.'
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

  // Channels - handle both old format (only complete channels, no isComplete field)
  // and new format (all 36 channels with isComplete flag)
  let channelList = (data.channels || []).filter((ch: any) => {
    // New format: has isComplete field → use it
    if ('isComplete' in ch) return ch.isComplete === true;
    // Old format: no isComplete field → channel was included because it's complete
    return true;
  });

  // Fallback: derive channels from activated gates if channelList is empty
  if (channelList.length === 0 && data.activatedGates?.length > 0) {
    const KNOWN_CHANNELS = [
      { gates: [34,57], name: 'Poder' }, { gates: [10,57], name: 'Perfeição' },
      { gates: [20,57], name: 'Onda Cerebral' }, { gates: [10,34], name: 'Exploração' },
      { gates: [61,24], name: 'Consciência' }, { gates: [43,23], name: 'Estruturação' },
      { gates: [1,8], name: 'Inspiração' }, { gates: [2,14], name: 'O Batedor' },
      { gates: [28,38], name: 'Luta' }, { gates: [3,60], name: 'Mutação' },
      { gates: [39,55], name: 'Emotividade' }, { gates: [64,47], name: 'Abstração' },
      { gates: [11,56], name: 'Curiosidade' }, { gates: [35,36], name: 'Transitoriedade' },
      { gates: [29,46], name: 'Descoberta' }, { gates: [13,33], name: 'O Filho Pródigo' },
      { gates: [42,53], name: 'Maturação' }, { gates: [30,41], name: 'Reconhecimento' },
      { gates: [63,4], name: 'Lógica' }, { gates: [17,62], name: 'Aceitação' },
      { gates: [7,31], name: 'O Alfa' }, { gates: [15,5], name: 'Ritmo' },
      { gates: [9,52], name: 'Concentração' }, { gates: [18,58], name: 'Julgamento' },
      { gates: [48,16], name: 'Talento' }, { gates: [44,26], name: 'Rendição' },
      { gates: [21,45], name: 'Canal do Dinheiro' }, { gates: [50,27], name: 'Preservação' },
      { gates: [32,54], name: 'Transformação' }, { gates: [40,37], name: 'Comunidade' },
      { gates: [6,59], name: 'Intimidade' }, { gates: [19,49], name: 'Síntese' },
      { gates: [51,25], name: 'Iniciação' }, { gates: [12,22], name: 'Abertura' },
    ];
    const activeGates = data.activatedGates as number[];
    channelList = KNOWN_CHANNELS.filter(ch =>
      activeGates.includes(ch.gates[0]) && activeGates.includes(ch.gates[1])
    );
  }

  const channels = channelList.length > 0
    ? channelList.map((ch: any) => `${ch.id || ch.gates?.join('-')}: ${ch.name}`).join('\n  - ')
    : labels.noCompleteChannels;

  // Advanced variables - support both field names
  const advVars = data.advancedVariables || data.variables || {};

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
