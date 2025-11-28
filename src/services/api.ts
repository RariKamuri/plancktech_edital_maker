// API service layer with mocked responses
import { generateMockEditais, generateFullEdital, generateProcessingStatus, generateAnalytics, generateMockEdital } from './mockData';
import type { EditalStatus } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface Edital {
  id: string;
  title: string;
  agency: string;
  status: EditalStatus;
  processedAt: string;
  questionsCount: number;
  confidenceScore: number;
  deadline: string;
  value: number;
  category: string;
  documentType: string;
  urgency: string;
}

export interface EditalListResponse {
  editais: Edital[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    completed: number;
    processing: number;
    needsReview: number;
    averageConfidence: number;
  };
}

export interface ProcessingJob {
  jobId: string;
  editalId: string;
  status: string;
  estimatedCompletion: string;
  currentStep: string;
  progress: number;
  steps: Array<{
    name: string;
    status: string;
    duration?: string;
  }>;
}

export interface ProcessingStatus {
  editalId: string;
  status: string;
  currentStep: string;
  progress: number;
  steps: Array<{
    name: string;
    status: string;
    duration?: string;
    questionsFound?: number;
    currentQuestion?: number;
    totalQuestions?: number;
  }>;
  estimatedTimeRemaining: string;
  details: {
    pagesProcessed: number;
    wordsExtracted: number;
    sourcesIdentified: number;
  };
}

// In-memory storage for mock data
let mockEditais = generateMockEditais(45);
let processingJobs: Map<string, ProcessingStatus> = new Map();

// GET /api/editais
export const getEditais = async (params?: {
  page?: number;
  limit?: number;
  status?: EditalStatus;
  agency?: string;
  search?: string;
}): Promise<EditalListResponse> => {
  await delay(600);

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  let filtered = [...mockEditais];

  // Apply filters
  if (params?.status) {
    filtered = filtered.filter(e => e.status === params.status);
  }
  if (params?.agency) {
    filtered = filtered.filter(e => e.agency === params.agency);
  }
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(searchLower) ||
      e.agency.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  // Calculate stats
  const stats = {
    total: mockEditais.length,
    completed: mockEditais.filter(e => e.status === 'completed').length,
    processing: mockEditais.filter(e => e.status === 'processing').length,
    needsReview: mockEditais.filter(e => e.status === 'needs_review').length,
    averageConfidence: mockEditais.reduce((sum, e) => sum + e.confidenceScore, 0) / mockEditais.length,
  };

  return {
    editais: paginated,
    pagination: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
    stats,
  };
};

// POST /api/editais/url
export const createEditalFromUrl = async (url: string): Promise<ProcessingJob> => {
  await delay(800);

  const jobId = `job-${Date.now()}`;
  const editalId = `edital-${String(mockEditais.length + 1).padStart(3, '0')}`;
  
  // Create new edital
  const newEdital = generateMockEdital(String(mockEditais.length + 1).padStart(3, '0'), 'processing');
  mockEditais.unshift(newEdital);

  // Initialize processing
  const processingStatus = generateProcessingStatus(editalId, 15);
  processingJobs.set(editalId, processingStatus);

  const estimatedCompletion = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  return {
    jobId,
    editalId,
    status: 'processing',
    estimatedCompletion,
    currentStep: 'document_download',
    progress: 15,
    steps: processingStatus.steps,
  };
};

// POST /api/editais/pdf
export const createEditalFromPdf = async (file: File): Promise<ProcessingJob> => {
  await delay(1000);

  const jobId = `job-${Date.now()}`;
  const editalId = `edital-${String(mockEditais.length + 1).padStart(3, '0')}`;
  
  // Create new edital
  const newEdital = generateMockEdital(String(mockEditais.length + 1).padStart(3, '0'), 'processing');
  mockEditais.unshift(newEdital);

  // Initialize processing
  const processingStatus = generateProcessingStatus(editalId, 10);
  processingJobs.set(editalId, processingStatus);

  const estimatedCompletion = new Date(Date.now() + 6 * 60 * 1000).toISOString();

  return {
    jobId,
    editalId,
    status: 'processing',
    estimatedCompletion,
    currentStep: 'pdf_upload',
    progress: 10,
    steps: processingStatus.steps,
  };
};

// GET /api/editais/:id/processing-status
export const getProcessingStatus = async (editalId: string): Promise<ProcessingStatus> => {
  await delay(400);

  let status = processingJobs.get(editalId);
  
  if (!status) {
    // Generate new status if not exists
    status = generateProcessingStatus(editalId, 0);
    processingJobs.set(editalId, status);
  } else {
    // Simulate progress
    const newProgress = Math.min(status.progress + Math.random() * 15, 100);
    status = generateProcessingStatus(editalId, newProgress);
    processingJobs.set(editalId, status);
  }

  return status;
};

// GET /api/editais/:id
export const getEdital = async (editalId: string) => {
  await delay(500);

  const edital = mockEditais.find(e => e.id === editalId);
  if (!edital) {
    throw new Error('Edital not found');
  }

  return generateFullEdital(editalId.split('-')[1], edital.status);
};

// PUT /api/questions/:id
export const updateQuestion = async (questionId: string, data: {
  humanAnswer?: string;
  status?: string;
}) => {
  await delay(400);

  // In a real app, this would update the database
  // For now, we just return a success response
  return {
    id: questionId,
    humanAnswer: data.humanAnswer ? {
      text: data.humanAnswer,
      editedAt: new Date().toISOString(),
      editor: 'Current User',
      revision: 1,
    } : null,
    status: data.status || 'reviewed',
    lastUpdated: new Date().toISOString(),
  };
};

// GET /api/analytics/edital-stats
export const getAnalytics = async () => {
  await delay(600);
  return generateAnalytics();
};

// Simulate processing updates (for real-time updates)
export const simulateProcessing = (editalId: string, callback: (status: ProcessingStatus) => void) => {
  const interval = setInterval(async () => {
    const status = await getProcessingStatus(editalId);
    callback(status);
    
    if (status.progress >= 100) {
      clearInterval(interval);
      // Update edital status
      const edital = mockEditais.find(e => e.id === editalId);
      if (edital) {
        edital.status = 'completed';
      }
    }
  }, 2000);

  return () => clearInterval(interval);
};

