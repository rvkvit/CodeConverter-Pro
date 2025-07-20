export interface RepositoryValidation {
  isValid: boolean;
  name?: string;
  description?: string;
  lastUpdated?: string;
  error?: string;
}

export interface ConversionRequest {
  repositoryUrl: string;
  accessToken?: string;
  sourceLanguage: string;
  sourceFramework: string;
  sourceAutomationTool: string;
  targetFramework: string;
  targetLibrary: string;
  testStructure: string;
  openaiApiKey: string;
  modelSelection: string;
}

export interface ConversionStatus {
  id: number;
  status: 'pending' | 'analyzing' | 'converting' | 'completed' | 'failed';
  progress: number;
  analysisResults?: any;
  convertedFiles?: any;
  errorLogs?: string[];
  repositoryInfo?: {
    name: string;
    description: string;
    lastUpdated: string;
    detectedFiles: any[];
  };
}

export interface ConversionSummary {
  totalTestFiles: number;
  totalTestCases: number;
  totalResourceFiles: number;
  warnings: string[];
}

export interface FilePreview {
  path: string;
  content: string;
  type: 'robot' | 'resource';
}
