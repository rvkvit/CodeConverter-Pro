import React from 'react';
import { StepIndicator } from '@/components/step-indicator';
import { RepositoryForm } from '@/components/repository-form';
import { TechStackConfig } from '@/components/tech-stack-config';
import { ConversionProgress } from '@/components/conversion-progress';
import { ReviewDeploy } from '@/components/review-deploy';
import { useConversion } from '@/hooks/use-conversion';
import { Card } from '@/components/ui/card';
import { Code, Settings, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RepositoryValidation, ConversionRequest } from '@/lib/types';

const STEPS = ['Repository', 'Configuration', 'Conversion', 'Review & Deploy'];

export default function Home() {
  const {
    currentStep,
    conversionId,
    validateRepository,
    startConversion,
    conversionStatus,
    isConversionLoading,
    deployToGitHub,
    downloadFiles,
    getFileContent,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  } = useConversion();

  const { toast } = useToast();
  const [repositoryData, setRepositoryData] = React.useState<{ repositoryUrl: string; accessToken?: string } | null>(null);

  const handleRepositoryValidation = (validation: RepositoryValidation, formData: { repositoryUrl: string; accessToken?: string }) => {
    setRepositoryData(formData);
  };

  const handleStartConversion = (config: ConversionRequest) => {
    startConversion.mutate(config, {
      onError: (error) => {
        toast({
          title: "Conversion Failed",
          description: "Failed to start conversion. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDownload = async (conversionId: number) => {
    try {
      await downloadFiles(conversionId);
    } catch (error) {
      throw error;
    }
  };

  const handleDeploy = async (data: {
    conversionId: number;
    targetUrl: string;
    accessToken: string;
    branch: string;
    commitMessage: string;
  }) => {
    return new Promise<void>((resolve, reject) => {
      deployToGitHub.mutate(data, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  const handleGetFileContent = async (conversionId: number, filename: string) => {
    return getFileContent(conversionId, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary p-2 rounded-lg">
                <Code className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">CodeConverter Pro</h1>
                <p className="text-sm text-gray-500">Test Automation Framework Converter</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Repository Connection */}
        {currentStep === 1 && (
          <RepositoryForm
            onValidationSuccess={handleRepositoryValidation}
            onNext={goToNextStep}
            isValidating={validateRepository.isPending}
            validateRepository={(data) => validateRepository.mutateAsync(data)}
          />
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && repositoryData && (
          <TechStackConfig
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onStartConversion={handleStartConversion}
            repositoryData={repositoryData}
          />
        )}

        {/* Step 3: Conversion Process */}
        {currentStep === 3 && (
          <ConversionProgress
            conversionStatus={conversionStatus}
            onPrevious={goToPreviousStep}
          />
        )}

        {/* Step 4: Review & Deploy */}
        {currentStep === 4 && conversionStatus && (
          <ReviewDeploy
            conversionStatus={conversionStatus}
            onPrevious={goToPreviousStep}
            onDownload={handleDownload}
            onDeploy={handleDeploy}
            getFileContent={handleGetFileContent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 CodeConverter Pro. Made with ❤️ for developers.
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Documentation</a>
              <a href="#" className="hover:text-gray-700">API Reference</a>
              <a href="#" className="hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
