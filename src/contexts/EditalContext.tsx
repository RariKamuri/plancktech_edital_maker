import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getEditais, getEdital, createEditalFromUrl, createEditalFromPdf, type EditalListResponse, type Edital as EditalType } from '@/services/api';
import type { EditalStatus } from '@/services/mockData';

interface EditalContextType {
  editais: EditalType[];
  currentEdital: any | null;
  loading: boolean;
  error: string | null;
  stats: EditalListResponse['stats'] | null;
  fetchEditais: (params?: any) => Promise<void>;
  fetchEdital: (id: string) => Promise<void>;
  createFromUrl: (url: string) => Promise<any>;
  createFromPdf: (file: File) => Promise<any>;
  refreshEditais: () => Promise<void>;
}

const EditalContext = createContext<EditalContextType | undefined>(undefined);

export const EditalProvider = ({ children }: { children: ReactNode }) => {
  const [editais, setEditais] = useState<EditalType[]>([]);
  const [currentEdital, setCurrentEdital] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EditalListResponse['stats'] | null>(null);
  const [lastParams, setLastParams] = useState<any>({});

  const fetchEditais = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEditais(params);
      setEditais(response.editais);
      setStats(response.stats);
      setLastParams(params || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch editais');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEdital = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const edital = await getEdital(id);
      setCurrentEdital(edital);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch edital');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFromUrl = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const job = await createEditalFromUrl(url);
      await fetchEditais(lastParams);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create edital');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEditais, lastParams]);

  const createFromPdf = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const job = await createEditalFromPdf(file);
      await fetchEditais(lastParams);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create edital');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEditais, lastParams]);

  const refreshEditais = useCallback(async () => {
    await fetchEditais(lastParams);
  }, [fetchEditais, lastParams]);

  return (
    <EditalContext.Provider
      value={{
        editais,
        currentEdital,
        loading,
        error,
        stats,
        fetchEditais,
        fetchEdital,
        createFromUrl,
        createFromPdf,
        refreshEditais,
      }}
    >
      {children}
    </EditalContext.Provider>
  );
};

export const useEdital = () => {
  const context = useContext(EditalContext);
  if (!context) {
    throw new Error('useEdital must be used within EditalProvider');
  }
  return context;
};

