import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getProcessingStatus, simulateProcessing, type ProcessingStatus } from '@/services/api';

interface ProcessingContextType {
  processingJobs: Map<string, ProcessingStatus>;
  getJobStatus: (editalId: string) => ProcessingStatus | null;
  startMonitoring: (editalId: string) => void;
  stopMonitoring: (editalId: string) => void;
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

export const ProcessingProvider = ({ children }: { children: ReactNode }) => {
  const [processingJobs, setProcessingJobs] = useState<Map<string, ProcessingStatus>>(new Map());
  const [monitoringJobs, setMonitoringJobs] = useState<Map<string, () => void>>(new Map());

  const getJobStatus = useCallback((editalId: string) => {
    return processingJobs.get(editalId) || null;
  }, [processingJobs]);

  const startMonitoring = useCallback((editalId: string) => {
    // Stop existing monitoring if any
    const existing = monitoringJobs.get(editalId);
    if (existing) {
      existing();
    }

    // Fetch initial status
    getProcessingStatus(editalId).then(status => {
      setProcessingJobs(prev => {
        const newMap = new Map(prev);
        newMap.set(editalId, status);
        return newMap;
      });
    });

    // Start simulation
    const stop = simulateProcessing(editalId, (status) => {
      setProcessingJobs(prev => {
        const newMap = new Map(prev);
        newMap.set(editalId, status);
        return newMap;
      });
    });

    setMonitoringJobs(prev => {
      const newMap = new Map(prev);
      newMap.set(editalId, stop);
      return newMap;
    });
  }, []);

  const stopMonitoring = useCallback((editalId: string) => {
    const stop = monitoringJobs.get(editalId);
    if (stop) {
      stop();
      setMonitoringJobs(prev => {
        const newMap = new Map(prev);
        newMap.delete(editalId);
        return newMap;
      });
    }
  }, [monitoringJobs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      monitoringJobs.forEach(stop => stop());
    };
  }, [monitoringJobs]);

  return (
    <ProcessingContext.Provider
      value={{
        processingJobs,
        getJobStatus,
        startMonitoring,
        stopMonitoring,
      }}
    >
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within ProcessingProvider');
  }
  return context;
};

