import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  Eye, 
  Rocket, 
  FileText, 
  Folder, 
  Copy,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ConversionStatus } from '@/lib/types';

interface ReviewDeployProps {
  conversionStatus: ConversionStatus;
  onPrevious: () => void;
  onDownload: (conversionId: number) => Promise<void>;
  onDeploy: (data: {
    conversionId: number;
    targetUrl: string;
    accessToken: string;
    branch: string;
    commitMessage: string;
  }) => Promise<void>;
  getFileContent: (conversionId: number, filename: string) => Promise<{ content: string }>;
}

export function ReviewDeploy({ 
  conversionStatus, 
  onPrevious, 
  onDownload, 
  onDeploy, 
  getFileContent 
}: ReviewDeployProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('Convert test automation to Robot Framework');
  const [accessToken, setAccessToken] = useState('');
  const [createPullRequest, setCreatePullRequest] = useState(true);
  const [runInitialTests, setRunInitialTests] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const convertedFiles = conversionStatus.convertedFiles as any;
  const summary = convertedFiles?.summary;

  // Get all available files for preview
  const availableFiles = [
    ...(convertedFiles?.robotFiles || []).map((f: any) => ({ name: f.path.split('/').pop(), path: f.path, type: 'robot' })),
    ...(convertedFiles?.resourceFiles || []).map((f: any) => ({ name: f.path.split('/').pop(), path: f.path, type: 'resource' }))
  ];

  useEffect(() => {
    if (availableFiles.length > 0 && !selectedFile) {
      setSelectedFile(availableFiles[0].name);
    }
  }, [availableFiles, selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  const loadFileContent = async (filename: string) => {
    try {
      const result = await getFileContent(conversionStatus.id, filename);
      setFileContent(result.content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load file content",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(conversionStatus.id);
      toast({
        title: "Download Started",
        description: "Your converted files are being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeploy = async () => {
    if (!targetUrl || !accessToken || !branch || !commitMessage) {
      toast({
        title: "Validation Error",
        description: "All deployment fields are required",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    try {
      await onDeploy({
        conversionId: conversionStatus.id,
        targetUrl,
        accessToken,
        branch,
        commitMessage,
      });
      toast({
        title: "Deployment Successful",
        description: "Code has been deployed to GitHub successfully",
      });
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy to GitHub. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "File content copied to clipboard",
    });
  };

  if (!convertedFiles || !summary) {
    return <div>Loading conversion results...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Deploy Converted Code</h2>
        <p className="text-gray-600">Review the converted Robot Framework code and deploy to your target repository.</p>
      </div>

      {/* Conversion Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-success-600" />
            Conversion Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.totalTestFiles}</div>
              <div className="text-sm text-gray-500">Test Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">{summary.totalTestCases}</div>
              <div className="text-sm text-gray-500">Test Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">{summary.totalResourceFiles}</div>
              <div className="text-sm text-gray-500">Resource Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-error-600">{summary.warnings?.length || 0}</div>
              <div className="text-sm text-gray-500">Warnings</div>
            </div>
          </div>

          {summary.warnings && summary.warnings.length > 0 && (
            <div className="mt-6 p-4 bg-warning-50 rounded-lg border border-warning-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-warning-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning-800">Conversion Warnings</h4>
                  <ul className="text-sm text-warning-700 mt-1 list-disc list-inside">
                    {summary.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Generated File Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center">
                <Folder className="mr-2 h-4 w-4 text-warning-500" />
                <span>tests/</span>
              </div>
              {convertedFiles.robotFiles?.map((file: any, index: number) => (
                <div key={index} className="ml-6 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-primary" />
                  <span>{file.path.split('/').pop()}</span>
                </div>
              ))}
              <div className="flex items-center">
                <Folder className="mr-2 h-4 w-4 text-warning-500" />
                <span>resources/</span>
              </div>
              {convertedFiles.resourceFiles?.map((file: any, index: number) => (
                <div key={index} className="ml-6 flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-success-500" />
                  <span>{file.path.split('/').pop()}</span>
                </div>
              ))}
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-400" />
                <span>requirements.txt</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-400" />
                <span>README.md</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button onClick={handleDownload} disabled={isDownloading} variant="default">
                {isDownloading ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setSelectedFile(availableFiles[0]?.name || '')}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Code Preview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Code Preview</CardTitle>
              <Select value={selectedFile} onValueChange={setSelectedFile}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFiles.map((file, index) => (
                    <SelectItem key={index} value={file.name}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                {fileContent}
              </pre>
            </div>
            
            <div className="mt-3 flex justify-between items-center text-sm">
              <span className="text-gray-500">
                {fileContent.split('\n').length} lines • Robot Framework
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(fileContent)}
              >
                <Copy className="mr-1 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deploy Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="mr-2 h-5 w-5 text-primary" />
            Deploy to Repository
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="target-url">Target Repository URL</Label>
              <Input
                id="target-url"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://github.com/username/robot-framework-tests"
              />
            </div>
            
            <div>
              <Label htmlFor="branch">Branch Name</Label>
              <Input
                id="branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Label htmlFor="access-token">GitHub Access Token</Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          
          <div className="mt-6">
            <Label htmlFor="commit-message">Commit Message</Label>
            <Textarea
              id="commit-message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Convert test automation from Java+Selenium+TestNG to Robot Framework"
              rows={3}
            />
          </div>
          
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-pr"
                checked={createPullRequest}
                onCheckedChange={(checked) => setCreatePullRequest(!!checked)}
              />
              <Label htmlFor="create-pr" className="text-sm">Create pull request</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="run-tests"
                checked={runInitialTests}
                onCheckedChange={(checked) => setRunInitialTests(!!checked)}
              />
              <Label htmlFor="run-tests" className="text-sm">Run initial tests</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Conversion
        </Button>
        <div className="space-x-4">
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            Download Only
          </Button>
          <Button onClick={handleDeploy} disabled={isDeploying || !targetUrl || !accessToken}>
            {isDeploying ? (
              <>
                <Rocket className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy to GitHub
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
