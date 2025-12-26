import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Definição das questões com keyed para inversão
const questions = [
  // ABERTURA (O) - 24 questions
  { id: "O1_1", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_2", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_3", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O1_4", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O2_1", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_2", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_3", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_4", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O3_1", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_2", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_3", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_4", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O4_1", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_2", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_3", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O4_4", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O5_1", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_2", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_3", trait: "openness", facet: "O5", keyed: "minus" },
  { id: "O5_4", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O6_1", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_2", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_3", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_4", trait: "openness", facet: "O6", keyed: "minus" },
  // CONSCIENCIOSIDADE (C) - 24 questions
  { id: "C1_1", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_2", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_3", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_4", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C2_1", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_2", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_3", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_4", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C3_1", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_2", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_3", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_4", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C4_1", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_2", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_3", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_4", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C5_1", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_2", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_3", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_4", trait: "conscientiousness", facet: "C5", keyed: "minus" },
  { id: "C6_1", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_2", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_3", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_4", trait: "conscientiousness", facet: "C6", keyed: "minus" },
  // EXTROVERSÃO (E) - 24 questions
  { id: "E1_1", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_2", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_3", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_4", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E2_1", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_2", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_3", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_4", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E3_1", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_2", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_3", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_4", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E4_1", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_2", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_3", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_4", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E5_1", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_2", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_3", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_4", trait: "extraversion", facet: "E5", keyed: "minus" },
  { id: "E6_1", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_2", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_3", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_4", trait: "extraversion", facet: "E6", keyed: "minus" },
  // AMABILIDADE (A) - 24 questions
  { id: "A1_1", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_2", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_3", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_4", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A2_1", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_2", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_3", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_4", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A3_1", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_2", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_3", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_4", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A4_1", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_2", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_3", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_4", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A5_1", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_2", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_3", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_4", trait: "agreeableness", facet: "A5", keyed: "minus" },
  { id: "A6_1", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_2", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_3", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_4", trait: "agreeableness", facet: "A6", keyed: "minus" },
  // NEUROTICISMO (N) - 24 questions
  { id: "N1_1", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_2", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_3", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_4", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N2_1", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_2", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_3", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_4", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N3_1", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_2", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_3", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_4", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N4_1", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_2", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_3", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_4", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N5_1", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_2", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_3", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_4", trait: "neuroticism", facet: "N5", keyed: "minus" },
  { id: "N6_1", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_2", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_3", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_4", trait: "neuroticism", facet: "N6", keyed: "minus" },
];

// Mapeamento de nomes de traits em inglês para português
const traitNameMap: Record<string, string> = {
  neuroticism: "neuroticismo",
  extraversion: "extroversão",
  openness: "abertura",
  agreeableness: "amabilidade",
  conscientiousness: "conscienciosidade",
};

const getTraitClassification = (score: number): string => {
  if (score >= 24 && score <= 47) return "Baixa";
  if (score >= 48 && score <= 83) return "Média";
  if (score >= 84 && score <= 120) return "Alta";
  return "Indefinido";
};

const getFacetClassification = (score: number): string => {
  if (score >= 4 && score <= 9) return "Baixa";
  if (score >= 10 && score <= 15) return "Média";
  if (score >= 16 && score <= 20) return "Alta";
  return "Indefinido";
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error('session_id é obrigatório');
    }

    console.log(`[recalculate-results] Iniciando recálculo para sessão: ${session_id}`);

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar todas as respostas da sessão
    const { data: answers, error: answersError } = await supabase
      .from('test_answers')
      .select('question_id, score')
      .eq('session_id', session_id);

    if (answersError) {
      throw new Error(`Erro ao buscar respostas: ${answersError.message}`);
    }

    if (!answers || answers.length === 0) {
      throw new Error('Nenhuma resposta encontrada para esta sessão');
    }

    console.log(`[recalculate-results] Encontradas ${answers.length} respostas`);

    // Inicializar scores
    const traitScores: Record<string, number> = {
      neuroticism: 0,
      extraversion: 0,
      openness: 0,
      agreeableness: 0,
      conscientiousness: 0,
    };

    const facetScores: Record<string, Record<string, number>> = {
      neuroticism: { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0, N6: 0 },
      extraversion: { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0 },
      openness: { O1: 0, O2: 0, O3: 0, O4: 0, O5: 0, O6: 0 },
      agreeableness: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0, A6: 0 },
      conscientiousness: { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 },
    };

    // Calcular scores aplicando inversão quando necessário
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.question_id);
      if (!question) {
        console.log(`[recalculate-results] Questão não encontrada: ${answer.question_id}`);
        continue;
      }

      let score = answer.score;
      if (question.keyed === "minus") {
        score = 6 - score; // Inversão para keyed minus
      }

      traitScores[question.trait] += score;
      facetScores[question.trait][question.facet] += score;
    }

    console.log(`[recalculate-results] Trait scores calculados:`, traitScores);

    // Converter para nomes em português (consistente com Index.tsx)
    const traitScoresPt: Record<string, number> = {};
    const facetScoresPt: Record<string, Record<string, number>> = {};
    
    for (const [trait, score] of Object.entries(traitScores)) {
      const traitPt = traitNameMap[trait] || trait;
      traitScoresPt[traitPt] = score;
      facetScoresPt[traitPt] = facetScores[trait];
    }

    // Calcular classificações (usando nomes em português)
    const classifications: Record<string, string> = {};
    for (const [trait, score] of Object.entries(traitScoresPt)) {
      classifications[trait] = getTraitClassification(score);
    }

    const facetClassifications: Record<string, Record<string, string>> = {};
    for (const trait of Object.keys(facetScoresPt)) {
      facetClassifications[trait] = {};
      for (const facet of Object.keys(facetScoresPt[trait])) {
        facetClassifications[trait][facet] = getFacetClassification(facetScoresPt[trait][facet]);
      }
    }

    console.log(`[recalculate-results] Classificações:`, classifications);

    // Verificar se já existe um resultado para esta sessão
    const { data: existingResult, error: checkError } = await supabase
      .from('test_results')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar resultado existente: ${checkError.message}`);
    }

    let resultData;
    if (existingResult) {
      // Atualizar resultado existente
      const { data, error: updateError } = await supabase
        .from('test_results')
        .update({
          trait_scores: traitScoresPt,
          facet_scores: facetScoresPt,
          classifications: classifications,
          calculated_at: new Date().toISOString(),
        })
        .eq('session_id', session_id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Erro ao atualizar resultado: ${updateError.message}`);
      }
      resultData = data;
      console.log(`[recalculate-results] Resultado atualizado para sessão ${session_id}`);
    } else {
      // Inserir novo resultado
      const { data, error: insertError } = await supabase
        .from('test_results')
        .insert({
          session_id: session_id,
          trait_scores: traitScoresPt,
          facet_scores: facetScoresPt,
          classifications: classifications,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao inserir resultado: ${insertError.message}`);
      }
      resultData = data;
      console.log(`[recalculate-results] Novo resultado inserido para sessão ${session_id}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Resultado recalculado com sucesso',
      answers_count: answers.length,
      trait_scores: traitScoresPt,
      facet_scores: facetScoresPt,
      classifications: classifications,
      result: resultData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[recalculate-results] Erro:', errorMessage);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
