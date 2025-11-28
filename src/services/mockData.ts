// Mock data generators for Edital AI Platform

export type EditalStatus = 'processing' | 'completed' | 'needs_review' | 'draft';
export type QuestionStatus = 'draft' | 'needs_review' | 'reviewed' | 'approved';
export type QuestionCategory = 'technical' | 'compliance' | 'documentation' | 'financial';
export type DocumentType = 'licitação' | 'concurso' | 'chamada_publica' | 'tomada_preços';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

const AGENCIES = ['ANEEL', 'BNDES', 'Ministério da Saúde', 'ANVISA', 'IBAMA', 'ANATEL', 'ANP', 'ANEEL'];
const CATEGORIES = ['energy', 'technology', 'health', 'environment', 'telecommunications', 'oil_gas'];
const DOCUMENT_TYPES: DocumentType[] = ['licitação', 'concurso', 'chamada_publica', 'tomada_preços'];

// Generate random date within last 30 days
const randomDate = (daysAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Generate random value in BRL
const randomValue = (min: number = 100000, max: number = 5000000) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// Generate confidence score
const randomConfidence = (min: number = 0.6, max: number = 0.95) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Generate mock edital
export const generateMockEdital = (id: string, status: EditalStatus = 'completed') => {
  const agency = AGENCIES[Math.floor(Math.random() * AGENCIES.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const docType = DOCUMENT_TYPES[Math.floor(Math.random() * DOCUMENT_TYPES.length)];
  const value = randomValue();
  const confidence = randomConfidence();
  const questionsCount = Math.floor(Math.random() * 20) + 5;
  
  const titles = {
    licitação: [
      `Edital de Licitação ${agency} 2024/${String(id).slice(-3)} - Fornecimento de Equipamentos`,
      `Licitação ${agency} - Serviços de Manutenção e Suporte Técnico`,
      `Pregão Eletrônico ${agency} - Aquisição de Materiais`,
    ],
    concurso: [
      `Concurso Público ${agency} - Cargos de Nível Superior`,
      `Edital de Concurso ${agency} 2024 - Processo Seletivo`,
    ],
    chamada_publica: [
      `Chamada Pública ${agency} - Inovação Tecnológica 2024`,
      `Chamada Pública ${agency} - Pesquisa e Desenvolvimento`,
    ],
    tomada_preços: [
      `Tomada de Preços ${agency} - Fornecimento de Transformadores`,
      `TP ${agency} - Serviços de Consultoria`,
    ],
  };

  const title = titles[docType][Math.floor(Math.random() * titles[docType].length)];
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 60) + 15);

  return {
    id: `edital-${id}`,
    title,
    agency,
    status,
    processedAt: status === 'processing' ? new Date().toISOString() : randomDate(5),
    questionsCount,
    confidenceScore: confidence,
    deadline: deadline.toISOString(),
    value,
    category,
    documentType: docType,
    urgency: confidence > 0.85 ? 'high' : confidence > 0.7 ? 'medium' : 'low',
  };
};

// Generate mock questions
export const generateMockQuestions = (editalId: string, count: number = 15) => {
  const questionTemplates = [
    {
      text: 'Qual a documentação necessária para comprovar capacidade técnica?',
      section: '5.2.1 - Documentação Comprobatória',
      category: 'documentation' as QuestionCategory,
      importance: 'high',
    },
    {
      text: 'Quais as garantias exigidas para a proposta?',
      section: '7.3 - Garantias',
      category: 'financial' as QuestionCategory,
      importance: 'medium',
    },
    {
      text: 'Qual o prazo de entrega dos serviços?',
      section: '8.1 - Prazos e Entregas',
      category: 'technical' as QuestionCategory,
      importance: 'high',
    },
    {
      text: 'Quais os critérios de avaliação técnica?',
      section: '6.2 - Critérios de Avaliação',
      category: 'compliance' as QuestionCategory,
      importance: 'high',
    },
    {
      text: 'Como deve ser apresentada a proposta de preços?',
      section: '9.1 - Proposta de Preços',
      category: 'documentation' as QuestionCategory,
      importance: 'medium',
    },
    {
      text: 'Quais as penalidades por atraso na execução?',
      section: '10.3 - Penalidades',
      category: 'compliance' as QuestionCategory,
      importance: 'low',
    },
    {
      text: 'Qual a forma de pagamento prevista?',
      section: '11.2 - Forma de Pagamento',
      category: 'financial' as QuestionCategory,
      importance: 'medium',
    },
    {
      text: 'Quais os requisitos técnicos mínimos?',
      section: '4.1 - Especificações Técnicas',
      category: 'technical' as QuestionCategory,
      importance: 'high',
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = questionTemplates[i % questionTemplates.length];
    const confidence = randomConfidence();
    const hasHumanAnswer = Math.random() > 0.4;
    const status: QuestionStatus = hasHumanAnswer 
      ? (Math.random() > 0.5 ? 'reviewed' : 'approved')
      : (Math.random() > 0.6 ? 'needs_review' : 'draft');

    return {
      id: `q-${String(i + 1).padStart(3, '0')}`,
      questionText: template.text,
      section: template.section,
      category: template.category,
      importance: template.importance,
      aiAnswer: {
        text: `De acordo com o ${template.section} do edital, ${generateMockAnswer(template.category)}`,
        confidence,
        sources: generateMockSources(template.section),
        generatedAt: randomDate(2),
      },
      humanAnswer: hasHumanAnswer ? {
        text: `Editado: ${generateMockAnswer(template.category)} Além disso, nossa empresa possui certificação ISO 9001 e experiência comprovada no setor.`,
        editedAt: randomDate(1),
        editor: 'Maria Silva',
        revision: Math.floor(Math.random() * 3) + 1,
      } : null,
      status,
      flags: [template.importance === 'high' ? 'high_importance' : '', template.category].filter(Boolean),
    };
  });
};

const generateMockAnswer = (category: QuestionCategory): string => {
  const answers = {
    documentation: 'são necessários os seguintes documentos: certificado de registro, declaração de experiência, composição da equipe técnica e laudos de equipamentos.',
    financial: 'o edital especifica garantias de proposta e execução contratual, emitidas por instituição financeira autorizada.',
    technical: 'os requisitos técnicos incluem especificações detalhadas que devem ser atendidas conforme descrito na documentação.',
    compliance: 'os critérios de avaliação seguem as normas estabelecidas na legislação vigente e no próprio edital.',
  };
  return answers[category] || 'conforme especificado no edital.';
};

const generateMockSources = (section: string) => {
  return [
    {
      type: 'edital',
      section,
      content: `Informação extraída da seção ${section} do documento`,
      page: Math.floor(Math.random() * 20) + 1,
    },
    {
      type: 'company',
      document: 'Manual de Licitações - Cap. 3',
      relevance: 'high',
      excerpt: 'Todos os projetos devem manter documentação técnica atualizada no sistema',
    },
  ];
};

// Generate full edital with questions
export const generateFullEdital = (id: string, status: EditalStatus = 'completed') => {
  const edital = generateMockEdital(id, status);
  const questions = generateMockQuestions(edital.id, edital.questionsCount);
  
  const reviewedCount = questions.filter(q => q.status === 'reviewed' || q.status === 'approved').length;
  const avgConfidence = questions.reduce((sum, q) => sum + q.aiAnswer.confidence, 0) / questions.length;

  return {
    ...edital,
    originalDocument: {
      url: `https://example.gov.br/edital/${edital.id}`,
      pages: Math.floor(Math.random() * 30) + 10,
      size: `${(Math.random() * 3 + 1).toFixed(1)}MB`,
      extractedAt: edital.processedAt,
    },
    questions,
    metadata: {
      totalQuestions: questions.length,
      answeredQuestions: questions.length,
      reviewedQuestions: reviewedCount,
      averageConfidence: parseFloat(avgConfidence.toFixed(2)),
      reviewProgress: reviewedCount / questions.length,
      criticalQuestions: questions.filter(q => q.importance === 'high').length,
      complianceScore: randomConfidence(0.85, 0.98),
    },
  };
};

// Generate processing status
export const generateProcessingStatus = (editalId: string, progress: number = 0) => {
  const steps = [
    { name: 'document_upload', status: 'completed' as const, duration: '2s' },
    { name: 'text_extraction', status: progress > 20 ? 'completed' as const : 'processing' as const, duration: progress > 20 ? '12s' : undefined },
    { name: 'question_identification', status: progress > 50 ? 'completed' as const : progress > 20 ? 'processing' as const : 'pending' as const, duration: progress > 50 ? '8s' : undefined },
    { name: 'ai_question_answering', status: progress > 80 ? 'completed' as const : progress > 50 ? 'processing' as const : 'pending' as const, duration: progress > 80 ? '15s' : undefined },
    { name: 'quality_assurance', status: progress > 95 ? 'completed' as const : 'pending' as const, duration: progress > 95 ? '5s' : undefined },
  ];

  const currentStep = steps.find(s => s.status === 'processing')?.name || steps[steps.length - 1].name;
  const estimatedTime = progress < 50 ? '5 minutes' : progress < 80 ? '2 minutes' : '30 seconds';

  return {
    editalId,
    status: progress >= 100 ? 'completed' : 'processing',
    currentStep,
    progress,
    steps,
    estimatedTimeRemaining: estimatedTime,
    details: {
      pagesProcessed: Math.floor(progress / 4),
      wordsExtracted: Math.floor(progress * 125),
      sourcesIdentified: Math.floor(progress / 12),
    },
  };
};

// Generate analytics data
export const generateAnalytics = () => {
  return {
    overview: {
      totalProcessed: 45,
      successRate: 0.89,
      averageProcessingTime: '8.5 minutes',
      humanEditRate: 0.34,
      timeSaved: '156 hours',
    },
    confidenceDistribution: {
      high: 67,
      medium: 25,
      low: 8,
    },
    agencyBreakdown: AGENCIES.slice(0, 4).map((agency, i) => ({
      agency,
      count: [12, 8, 6, 5][i],
      avgConfidence: randomConfidence(0.75, 0.90),
    })),
    processingTrends: Array.from({ length: 3 }, (_, i) => ({
      week: new Date(Date.now() - (2 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      processed: [8, 12, 10][i],
      avgTime: `${(7 + Math.random() * 2).toFixed(1)}m`,
    })),
    performanceMetrics: {
      accuracyRate: 0.94,
      completionRate: 0.87,
      efficiencyGain: 3.2,
    },
  };
};

// Initial mock editais
export const generateMockEditais = (count: number = 45) => {
  const statuses: EditalStatus[] = ['completed', 'processing', 'needs_review', 'draft'];
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return generateMockEdital(String(i + 1).padStart(3, '0'), status);
  });
};

