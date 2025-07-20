import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Target, Brain, Info, Lightbulb, Eye } from 'lucide-react';
import type { ConversionRequest } from '@/lib/types';

interface TechStackConfigProps {
  onNext: () => void;
  onPrevious: () => void;
  onStartConversion: (config: ConversionRequest) => void;
  repositoryData: { repositoryUrl: string; accessToken?: string };
}

export function TechStackConfig({ onNext, onPrevious, onStartConversion, repositoryData }: TechStackConfigProps) {
  const [sourceLanguage, setSourceLanguage] = useState('java');
  const [sourceFramework, setSourceFramework] = useState('testng');
  const [sourceAutomationTool, setSourceAutomationTool] = useState('selenium');
  const [targetFramework, setTargetFramework] = useState('robot');
  const [targetLibrary, setTargetLibrary] = useState('browser');
  const [testStructure, setTestStructure] = useState('modular');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [modelSelection, setModelSelection] = useState('gpt-4o');
  const [showApiKey, setShowApiKey] = useState(false);
  const [advancedAnalysis, setAdvancedAnalysis] = useState(true);

  const handleStartConversion = () => {
    const config: ConversionRequest = {
      ...repositoryData,
      sourceLanguage,
      sourceFramework,
      sourceAutomationTool,
      targetFramework,
      targetLibrary,
      testStructure,
      openaiApiKey,
      modelSelection,
    };

    onStartConversion(config);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Tech Stack</h2>
        <p className="text-gray-600">Select your current tech stack and choose the target framework for conversion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Source Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="source-language">Programming Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="javascript">JavaScript/TypeScript</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source-framework">Test Framework</Label>
              <Select value={sourceFramework} onValueChange={setSourceFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testng">TestNG</SelectItem>
                  <SelectItem value="junit">JUnit</SelectItem>
                  <SelectItem value="pytest">PyTest</SelectItem>
                  <SelectItem value="unittest">UnitTest</SelectItem>
                  <SelectItem value="nunit">NUnit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source-automation-tool">Automation Tool</Label>
              <Select value={sourceAutomationTool} onValueChange={setSourceAutomationTool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selenium">Selenium WebDriver</SelectItem>
                  <SelectItem value="cypress">Cypress</SelectItem>
                  <SelectItem value="playwright">Playwright</SelectItem>
                  <SelectItem value="puppeteer">Puppeteer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex">
                <Info className="h-5 w-5 text-primary mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary-800">Auto-Detection Results</h4>
                  <p className="text-sm text-primary-700 mt-1">
                    Detected: Java + TestNG + Selenium WebDriver based on repository analysis
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-success-600" />
              Target Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="target-framework">Target Framework</Label>
              <Select value={targetFramework} onValueChange={setTargetFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="robot">Robot Framework</SelectItem>
                  <SelectItem value="cucumber">Cucumber/Gherkin</SelectItem>
                  <SelectItem value="cypress">Cypress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target-library">Target Library</Label>
              <Select value={targetLibrary} onValueChange={setTargetLibrary}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="browser">Browser Library (Playwright)</SelectItem>
                  <SelectItem value="seleniumlibrary">SeleniumLibrary</SelectItem>
                  <SelectItem value="requests">RequestsLibrary (API)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Test Structure</Label>
              <RadioGroup value={testStructure} onValueChange={setTestStructure} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="text-sm">Single .robot file per test class</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="modular" id="modular" />
                  <Label htmlFor="modular" className="text-sm">Modular with resource files</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suite" id="suite" />
                  <Label htmlFor="suite" className="text-sm">Test suite organization</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="p-4 bg-success-50 rounded-lg border border-success-200">
              <div className="flex">
                <Lightbulb className="h-5 w-5 text-success-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-success-800">Recommended Setup</h4>
                  <p className="text-sm text-success-700 mt-1">
                    Robot Framework + Browser Library provides modern, fast, and reliable test automation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-warning-600" />
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="openai-api-key">Azure OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 h-full"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Your OpenAI API key for code analysis and conversion</p>
            </div>
            
            <div>
              <Label htmlFor="model-selection">Model Selection</Label>
              <Select value={modelSelection} onValueChange={setModelSelection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="advanced-analysis"
              checked={advancedAnalysis}
              onCheckedChange={(checked) => setAdvancedAnalysis(!!checked)}
            />
            <Label htmlFor="advanced-analysis" className="text-sm">
              Use advanced code analysis for better conversion accuracy
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Repository
        </Button>
        <Button 
          onClick={handleStartConversion}
          disabled={!openaiApiKey.trim()}
        >
          Next: Start Conversion
        </Button>
      </div>
    </div>
  );
}
