import fs from 'fs/promises';
import path from 'path';
import { openaiService, type CodeAnalysisResult, type ConversionResult } from './openai';
import { githubService } from './github';
import { storage } from '../storage';
import type { Conversion } from '@shared/schema';

export class ConversionService {
  private tempDir = process.env.TEMP || process.env.TMP || './temp/code-converter';

  async startConversion(conversionId: number): Promise<void> {
    try {
      const conversion = await storage.getConversion(conversionId);
      if (!conversion) {
        throw new Error('Conversion not found');
      }

      await this.updateProgress(conversionId, 'analyzing', 10);

      // Step 1: Clone repository
      const repoDir = path.join(this.tempDir, `repo-${conversionId}`);
      await githubService.cloneRepository(conversion.repositoryUrl, repoDir, conversion.accessToken || undefined);

      await this.updateProgress(conversionId, 'analyzing', 25);

      // Step 2: Analyze repository structure
      const structure = await githubService.analyzeRepositoryStructure(repoDir);

      await this.updateProgress(conversionId, 'analyzing', 40);

      // Step 3: Read test files
      const testFiles = await this.extractTestFiles(repoDir, structure.files);

      await this.updateProgress(conversionId, 'analyzing', 60);

      // Step 4: Analyze code with OpenAI
      const analysisResult = await openaiService.analyzeCode(testFiles, conversion.openaiApiKey);

      await storage.updateConversion(conversionId, {
        analysisResults: analysisResult as any
      });

      await this.updateProgress(conversionId, 'converting', 70);

      // Step 5: Convert to Robot Framework
      const conversionResult = await openaiService.convertToRobotFramework(
        analysisResult,
        conversion.targetLibrary,
        conversion.testStructure,
        conversion.openaiApiKey
      );

      await storage.updateConversion(conversionId, {
        convertedFiles: conversionResult as any,
        status: 'completed',
        progress: 100
      });

      // Step 6: Save converted files to temporary directory
      const outputDir = path.join(this.tempDir, `output-${conversionId}`);
      await this.saveConvertedFiles(outputDir, conversionResult);

    } catch (error) {
      await storage.updateConversion(conversionId, {
        status: 'failed',
        errorLogs: [error instanceof Error ? error.message : 'Unknown error'] as any
      });
      throw error;
    }
  }

  private async updateProgress(conversionId: number, status: string, progress: number): Promise<void> {
    await storage.updateConversion(conversionId, { status, progress });
  }

  private async extractTestFiles(repoDir: string, files: any[]): Promise<Record<string, string>> {
    const testFiles: Record<string, string> = {};

    for (const file of files) {
      if (file.type === 'file' && this.isTestFile(file.path)) {
        try {
          const fullPath = path.join(repoDir, file.path);
          const content = await fs.readFile(fullPath, 'utf-8');
          testFiles[file.path] = content;
        } catch (error) {
          console.warn(`Failed to read file ${file.path}:`, error);
        }
      }
    }

    return testFiles;
  }

  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /Test\.java$/,
      /test\.py$/,
      /\.test\.js$/,
      /\.test\.ts$/,
      /Tests\.cs$/,
      /spec\.js$/,
      /spec\.ts$/
    ];

    return testPatterns.some(pattern => pattern.test(filePath)) ||
           filePath.toLowerCase().includes('test');
  }

  private async saveConvertedFiles(outputDir: string, conversionResult: ConversionResult): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });

    // Create tests directory
    const testsDir = path.join(outputDir, 'tests');
    await fs.mkdir(testsDir, { recursive: true });

    // Save robot files
    for (const robotFile of conversionResult.robotFiles) {
      const filePath = path.join(outputDir, robotFile.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, robotFile.content, 'utf-8');
    }

    // Create resources directory
    const resourcesDir = path.join(outputDir, 'resources');
    await fs.mkdir(resourcesDir, { recursive: true });

    // Save resource files
    for (const resourceFile of conversionResult.resourceFiles) {
      const filePath = path.join(outputDir, resourceFile.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, resourceFile.content, 'utf-8');
    }

    // Create requirements.txt
    const requirementsContent = conversionResult.requirements.join('\n');
    await fs.writeFile(path.join(outputDir, 'requirements.txt'), requirementsContent, 'utf-8');

    // Create README.md
    const readmeContent = this.generateReadme(conversionResult);
    await fs.writeFile(path.join(outputDir, 'README.md'), readmeContent, 'utf-8');
  }

  private generateReadme(conversionResult: ConversionResult): string {
    return `# Robot Framework Test Suite

This test suite was automatically converted from another test automation framework.

## Summary
- Total Test Files: ${conversionResult.summary.totalTestFiles}
- Total Test Cases: ${conversionResult.summary.totalTestCases}
- Total Resource Files: ${conversionResult.summary.totalResourceFiles}

## Setup
1. Install Python 3.8+
2. Install dependencies: \`pip install -r requirements.txt\`
3. Run tests: \`robot tests/\`

## Structure
- \`tests/\` - Test case files (.robot)
- \`resources/\` - Reusable keyword libraries (.resource)

${conversionResult.summary.warnings.length > 0 ? `
## Warnings
${conversionResult.summary.warnings.map(w => `- ${w}`).join('\n')}
` : ''}

${conversionResult.summary.recommendations.length > 0 ? `
## Recommendations
${conversionResult.summary.recommendations.map(r => `- ${r}`).join('\n')}
` : ''}

Generated by CodeConverter Pro
`;
  }

  async getConvertedFiles(conversionId: number): Promise<string> {
    const outputDir = path.join(this.tempDir, `output-${conversionId}`);
    
    try {
      await fs.access(outputDir);
      return outputDir;
    } catch (error) {
      throw new Error('Converted files not found');
    }
  }

  async deployToGitHub(
    conversionId: number, 
    targetUrl: string, 
    accessToken: string, 
    branch: string, 
    commitMessage: string
  ): Promise<void> {
    const outputDir = await this.getConvertedFiles(conversionId);
    await githubService.pushToRepository(outputDir, targetUrl, accessToken, branch, commitMessage);
  }
}

export const conversionService = new ConversionService();
