import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import type { ConversionStatus } from '@/lib/types';

interface ConversionProgressProps {
  conversionStatus?: ConversionStatus;
  onPrevious: () => void;
}

interface ProgressStep {
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export function ConversionProgress({ conversionStatus, onPrevious }: ConversionProgressProps) {
  const [logs, setLogs] = useState<string[]>([]);

  // Mock conversion logs for demonstration
  useEffect(() => {
    if (!conversionStatus) return;

    const mockLogs = [
      '[2024-01-20 10:15:23] Starting code analysis...',
      '[2024-01-20 10:15:24] Found test files in repository',
      '[2024-01-20 10:15:25] Parsing source code...',
      '[2024-01-20 10:15:26] Analyzing test patterns...',
      '[2024-01-20 10:15:27] Building code model...',
    ];

    if (conversionStatus.status === 'analyzing') {
      mockLogs.push('[2024-01-20 10:15:28] Analyzing Selenium WebDriver patterns...');
      mockLogs.push('[2024-01-20 10:15:30] Identifying page object patterns...');
    }

    if (conversionStatus.status === 'converting') {
      mockLogs.push('[2024-01-20 10:15:32] Converting test cases to Robot Framework...');
      mockLogs.push('[2024-01-20 10:15:34] Generating keywords and resources...');
      mockLogs.push('[2024-01-20 10:15:36] Creating test suite structure...');
    }

    if (conversionStatus.status === 'completed') {
      mockLogs.push('[2024-01-20 10:15:38] Conversion completed successfully!');
      mockLogs.push('[2024-01-20 10:15:39] Generated 15 test files and 8 resource files');
    }

    setLogs(mockLogs);
  }, [conversionStatus?.status]);

  const getSteps = (): ProgressStep[] => {
    if (!conversionStatus) {
      return [
        { name: 'Code Analysis', description: 'Parsing test files', status: 'pending' },
        { name: 'Conversion', description: 'Converting test cases', status: 'pending' },
        { name: 'Output Generation', description: 'Structuring files', status: 'pending' },
      ];
    }

    const steps: ProgressStep[] = [
      {
        name: 'Code Analysis',
        description: 'Parsing test files',
        status: conversionStatus.progress > 30 ? 'completed' : conversionStatus.status === 'analyzing' ? 'in-progress' : 'pending',
      },
      {
        name: 'Conversion',
        description: 'Converting test cases',
        status: conversionStatus.progress > 70 ? 'completed' : conversionStatus.status === 'converting' ? 'in-progress' : conversionStatus.progress > 30 ? 'pending' : 'pending',
      },
      {
        name: 'Output Generation',
        description: 'Structuring files',
        status: conversionStatus.status === 'completed' ? 'completed' : conversionStatus.progress > 70 ? 'in-progress' : 'pending',
      },
    ];

    if (conversionStatus.status === 'failed') {
      steps.forEach(step => {
        if (step.status === 'in-progress') {
          step.status = 'failed';
        }
      });
    }

    return steps;
  };

  const steps = getSteps();

  const getStatusIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return '✓ Complete';
      case 'in-progress':
        return '⏳ In Progress';
      case 'failed':
        return '✗ Failed';
      default:
        return '⏸ Pending';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Code Conversion in Progress</h2>
        <p className="text-gray-600">AI is analyzing your codebase and converting it to Robot Framework.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{step.name}</h3>
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                  {getStatusIcon(step.status)}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{step.description}</span>
                  <span
                    className={`font-medium ${
                      step.status === 'completed'
                        ? 'text-success-600'
                        : step.status === 'in-progress'
                        ? 'text-primary'
                        : step.status === 'failed'
                        ? 'text-destructive'
                        : 'text-gray-400'
                    }`}
                  >
                    {getStatusText(step.status)}
                  </span>
                </div>
              </div>
              
              {step.status === 'in-progress' && conversionStatus && (
                <div className="mt-4">
                  <Progress value={conversionStatus.progress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{conversionStatus.progress}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Conversion Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🖥️</span>
            Conversion Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400">
                  {log}
                </div>
              ))}
              {conversionStatus?.status === 'converting' && (
                <div className="text-yellow-400 animate-pulse">
                  [2024-01-20 10:15:37] ⏳ Processing complex wait conditions...
                </div>
              )}
              {conversionStatus?.status === 'failed' && conversionStatus.errorLogs && (
                <>
                  {conversionStatus.errorLogs.map((error, index) => (
                    <div key={index} className="text-red-400">
                      [ERROR] {error}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Configuration
        </Button>
        <Button disabled variant="secondary">
          {conversionStatus?.status === 'failed' ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Conversion Failed
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
