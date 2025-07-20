import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { RepositoryValidation, ConversionRequest, ConversionStatus } from '@/lib/types';

export function useConversion() {
  const [currentStep, setCurrentStep] = useState(1);
  const [conversionId, setConversionId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Repository validation mutation
  const validateRepository = useMutation({
    mutationFn: async (data: { repositoryUrl: string; accessToken?: string }) => {
      const response = await apiRequest('POST', '/api/repository/validate', data);
      return response.json();
    },
  });

  // Start conversion mutation
  const startConversion = useMutation({
    mutationFn: async (data: ConversionRequest) => {
      const response = await apiRequest('POST', '/api/conversions', data);
      return response.json();
    },
    onSuccess: (data) => {
      setConversionId(data.id);
      setCurrentStep(3); // Move to conversion progress step
    },
  });

  // Get conversion status query
  const conversionStatus = useQuery({
    queryKey: ['/api/conversions', conversionId],
    enabled: !!conversionId,
    refetchInterval: (data) => {
      const status = (data as any)?.status;
      // Refetch every 2 seconds if conversion is in progress
      if (status === 'analyzing' || status === 'converting') {
        return 2000;
      }
      // Stop refetching if completed or failed
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 2000;
    },
  });

  // Deploy to GitHub mutation
  const deployToGitHub = useMutation({
    mutationFn: async (data: {
      conversionId: number;
      targetUrl: string;
      accessToken: string;
      branch: string;
      commitMessage: string;
    }) => {
      const { conversionId, ...deployData } = data;
      const response = await apiRequest('POST', `/api/conversions/${conversionId}/deploy`, deployData);
      return response.json();
    },
  });

  // Download files function
  const downloadFiles = useCallback(async (conversionId: number) => {
    try {
      const response = await fetch(`/api/conversions/${conversionId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download files');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `robot-framework-conversion-${conversionId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download files');
    }
  }, []);

  // Get file content for preview
  const getFileContent = useCallback(async (conversionId: number, filename: string) => {
    const response = await apiRequest('GET', `/api/conversions/${conversionId}/files/${filename}`);
    return response.json();
  }, []);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 4)));
  }, []);

  // Move to step 4 when conversion is completed
  useEffect(() => {
    if ((conversionStatus.data as any)?.status === 'completed' && currentStep === 3) {
      setCurrentStep(4);
    }
  }, [conversionStatus.data, currentStep]);

  return {
    currentStep,
    conversionId,
    validateRepository,
    startConversion,
    conversionStatus: conversionStatus.data as ConversionStatus | undefined,
    isConversionLoading: conversionStatus.isLoading,
    deployToGitHub,
    downloadFiles,
    getFileContent,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}
