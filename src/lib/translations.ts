export const translations = {
  pt: {
    // Navegação
    nav: {
      home: "Início",
      test: "Teste",
      results: "Resultados",
      about: "Sobre"
    },
    
    // Página inicial
    home: {
      title: "Descubra sua Personalidade",
      subtitle: "Teste baseado no modelo Big Five",
      startButton: "Iniciar Teste",
      description: "Responda 300 perguntas e receba uma análise detalhada"
    },
    
    // Teste
    test: {
      question: "Pergunta",
      of: "de",
      disagreeStrongly: "Discordo Totalmente",
      disagree: "Discordo",
      neutral: "Neutro",
      agree: "Concordo",
      agreeStrongly: "Concordo Totalmente",
      previous: "Anterior",
      next: "Próxima",
      finish: "Finalizar",
      loading: "Carregando perguntas...",
      calculating: "Calculando resultados...",
      analyzing: "Analisando com IA..."
    },
    
    // Resultados
    results: {
      title: "Seus Resultados",
      mainTraits: "Traços Principais",
      facets: "Facetas Específicas",
      aiAnalysis: "Análise Personalizada",
      score: "Pontuação",
      classification: "Classificação",
      download: "Baixar PDF",
      restart: "Fazer Novo Teste",
      
      // Traços
      traits: {
        neuroticism: "Neuroticismo",
        extroversion: "Extroversão",
        openness: "Abertura",
        agreeableness: "Amabilidade",
        conscientiousness: "Conscienciosidade"
      },
      
      // Classificações
      levels: {
        veryLow: "Muito Baixo",
        low: "Baixo",
        medium: "Médio",
        high: "Alto",
        veryHigh: "Muito Alto"
      }
    },
    
    // Mensagens de erro
    errors: {
      loadingFailed: "Erro ao carregar",
      tryAgain: "Tente novamente",
      savingFailed: "Erro ao salvar resposta",
      analysisFailed: "Erro na análise. Por favor, tente novamente."
    }
  },
  
  en: {
    nav: {
      home: "Home",
      test: "Test",
      results: "Results",
      about: "About"
    },
    
    home: {
      title: "Discover Your Personality",
      subtitle: "Test based on Big Five model",
      startButton: "Start Test",
      description: "Answer 300 questions and receive detailed analysis"
    },
    
    test: {
      question: "Question",
      of: "of",
      disagreeStrongly: "Strongly Disagree",
      disagree: "Disagree",
      neutral: "Neutral",
      agree: "Agree",
      agreeStrongly: "Strongly Agree",
      previous: "Previous",
      next: "Next",
      finish: "Finish",
      loading: "Loading questions...",
      calculating: "Calculating results...",
      analyzing: "Analyzing with AI..."
    },
    
    results: {
      title: "Your Results",
      mainTraits: "Main Traits",
      facets: "Specific Facets",
      aiAnalysis: "Personalized Analysis",
      score: "Score",
      classification: "Classification",
      download: "Download PDF",
      restart: "Take New Test",
      
      traits: {
        neuroticism: "Neuroticism",
        extroversion: "Extroversion",
        openness: "Openness",
        agreeableness: "Agreeableness",
        conscientiousness: "Conscientiousness"
      },
      
      levels: {
        veryLow: "Very Low",
        low: "Low",
        medium: "Medium",
        high: "High",
        veryHigh: "Very High"
      }
    },
    
    errors: {
      loadingFailed: "Loading failed",
      tryAgain: "Try again",
      savingFailed: "Error saving response",
      analysisFailed: "Analysis error. Please try again."
    }
  },
  
  es: {
    nav: {
      home: "Inicio",
      test: "Prueba",
      results: "Resultados",
      about: "Acerca"
    },
    
    home: {
      title: "Descubre tu Personalidad",
      subtitle: "Prueba basada en el modelo Big Five",
      startButton: "Iniciar Prueba",
      description: "Responde 300 preguntas y recibe análisis detallado"
    },
    
    test: {
      question: "Pregunta",
      of: "de",
      disagreeStrongly: "Totalmente en Desacuerdo",
      disagree: "En Desacuerdo",
      neutral: "Neutral",
      agree: "De Acuerdo",
      agreeStrongly: "Totalmente de Acuerdo",
      previous: "Anterior",
      next: "Siguiente",
      finish: "Finalizar",
      loading: "Cargando preguntas...",
      calculating: "Calculando resultados...",
      analyzing: "Analizando con IA..."
    },
    
    results: {
      title: "Tus Resultados",
      mainTraits: "Rasgos Principales",
      facets: "Facetas Específicas",
      aiAnalysis: "Análisis Personalizado",
      score: "Puntuación",
      classification: "Clasificación",
      download: "Descargar PDF",
      restart: "Nueva Prueba",
      
      traits: {
        neuroticism: "Neuroticismo",
        extroversion: "Extroversión",
        openness: "Apertura",
        agreeableness: "Amabilidad",
        conscientiousness: "Responsabilidad"
      },
      
      levels: {
        veryLow: "Muy Bajo",
        low: "Bajo",
        medium: "Medio",
        high: "Alto",
        veryHigh: "Muy Alto"
      }
    },
    
    errors: {
      loadingFailed: "Error al cargar",
      tryAgain: "Intentar de nuevo",
      savingFailed: "Error al guardar respuesta",
      analysisFailed: "Error en análisis. Por favor, intenta de nuevo."
    }
  }
};

export type Language = 'pt' | 'en' | 'es';
export type TranslationKeys = typeof translations.pt;
