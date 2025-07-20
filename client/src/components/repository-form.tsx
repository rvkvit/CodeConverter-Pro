import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Github, Key, FolderSync, CheckCircle, AlertCircle, Folder, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RepositoryValidation } from '@/lib/types';

interface RepositoryFormProps {
  onValidationSuccess: (validation: RepositoryValidation, formData: { repositoryUrl: string; accessToken?: string }) => void;
  onNext: () => void;
  isValidating: boolean;
  validateRepository: (data: { repositoryUrl: string; accessToken?: string }) => Promise<RepositoryValidation>;
}

export function RepositoryForm({ onValidationSuccess, onNext, isValidating, validateRepository }: RepositoryFormProps) {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [validationResult, setValidationResult] = useState<RepositoryValidation | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!repositoryUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await validateRepository({
        repositoryUrl: repositoryUrl.trim(),
        accessToken: accessToken.trim() || undefined,
      });

      setValidationResult(result);
      setIsValidated(result.isValid);

      if (result.isValid) {
        onValidationSuccess(result, { repositoryUrl: repositoryUrl.trim(), accessToken: accessToken.trim() || undefined });
        toast({
          title: "Repository Validated",
          description: "Repository connected successfully!",
        });
      } else {
        toast({
          title: "Validation Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate repository. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Repository</h2>
        <p className="text-gray-600">Enter your GitHub repository URL and authentication details to get started.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Repository Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Github className="mr-2 h-5 w-5" />
              Repository Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="repository-url" className="flex items-center mb-2">
                <Github className="mr-2 h-4 w-4" />
                GitHub Repository URL
              </Label>
              <div className="relative">
                <Input
                  id="repository-url"
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isValidated && validationResult?.isValid && (
                    <CheckCircle className="h-5 w-5 text-success-500" />
                  )}
                  {isValidated && !validationResult?.isValid && (
                    <AlertCircle className="h-5 w-5 text-error-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Public repositories or private with access token</p>
            </div>

            <div>
              <Label htmlFor="access-token" className="flex items-center mb-2">
                <Key className="mr-2 h-4 w-4" />
                Access Token (Optional)
              </Label>
              <div className="relative">
                <Input
                  id="access-token"
                  type={showToken ? 'text' : 'password'}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? '🙈' : '👁️'}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Required for private repositories</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-credentials"
                checked={saveCredentials}
                onCheckedChange={(checked) => setSaveCredentials(!!checked)}
              />
              <Label htmlFor="save-credentials" className="text-sm">
                Save credentials securely for future conversions
              </Label>
            </div>

            <Button 
              className="w-full" 
              onClick={handleValidate}
              disabled={isValidating || !repositoryUrl.trim()}
            >
              {isValidating ? (
                <FolderSync className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FolderSync className="mr-2 h-4 w-4" />
              )}
              Validate & Connect Repository
            </Button>
          </CardContent>
        </Card>

        {/* Repository Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Repository Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {!validationResult ? (
              <div className="text-center py-12 text-gray-400">
                <FolderOpen className="mx-auto h-16 w-16 mb-4" />
                <p className="text-lg font-medium">No repository connected</p>
                <p className="text-sm">Enter a repository URL to see the preview</p>
              </div>
            ) : validationResult.isValid ? (
              <div className="space-y-4">
                <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-success-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-success-800">{validationResult.name}</h4>
                      {validationResult.description && (
                        <p className="text-sm text-success-600 mt-1">{validationResult.description}</p>
                      )}
                      {validationResult.lastUpdated && (
                        <p className="text-xs text-success-600 mt-2 flex items-center">
                          <span>Last updated: {validationResult.lastUpdated}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-error-50 rounded-lg border border-error-200">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-error-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-error-800">Validation Failed</h4>
                    <p className="text-sm text-error-600 mt-1">{validationResult.error}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" disabled>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isValidated || !validationResult?.isValid}>
          Next: Configuration
        </Button>
      </div>
    </div>
  );
}
