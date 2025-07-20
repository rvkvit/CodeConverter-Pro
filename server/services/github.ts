import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface GitHubService {
  validateRepository(url: string, accessToken?: string): Promise<RepositoryValidation>;
  cloneRepository(url: string, targetDir: string, accessToken?: string): Promise<void>;
  pushToRepository(sourceDir: string, targetUrl: string, accessToken: string, branch: string, commitMessage: string): Promise<void>;
  analyzeRepositoryStructure(repoDir: string): Promise<FileStructure>;
}

export interface RepositoryValidation {
  isValid: boolean;
  name?: string;
  description?: string;
  lastUpdated?: string;
  error?: string;
}

export interface FileStructure {
  files: FileInfo[];
  detectedFramework?: string;
  detectedLanguage?: string;
}

export interface FileInfo {
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
}

class GitHubServiceImpl implements GitHubService {
  async validateRepository(url: string, accessToken?: string): Promise<RepositoryValidation> {
    try {
      // Extract owner and repo from URL
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return { isValid: false, error: 'Invalid GitHub URL format' };
      }

      const [, owner, repo] = match;
      const repoName = repo.replace('.git', '');

      // Use GitHub API to validate repository
      const apiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
      const headers: Record<string, string> = {};
      
      if (accessToken) {
        headers['Authorization'] = `token ${accessToken}`;
      }

      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { isValid: false, error: 'Repository not found or access denied' };
        }
        return { isValid: false, error: `GitHub API error: ${response.statusText}` };
      }

      const repoData = await response.json();
      
      return {
        isValid: true,
        name: repoData.full_name,
        description: repoData.description,
        lastUpdated: new Date(repoData.updated_at).toLocaleDateString(),
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async cloneRepository(url: string, targetDir: string, accessToken?: string): Promise<void> {
    try {
      // Ensure target directory exists
      await fs.mkdir(targetDir, { recursive: true });

      let cloneUrl = url;
      if (accessToken) {
        // Insert token into URL for private repositories
        cloneUrl = url.replace('https://github.com/', `https://${accessToken}@github.com/`);
      }

      // Use cross-platform command with proper path handling
      const command = process.platform === 'win32' 
        ? `git clone "${cloneUrl}" "${targetDir.replace(/\\/g, '/').replace(/^\./, process.cwd())}"` 
        : `git clone "${cloneUrl}" "${targetDir}"`;
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pushToRepository(sourceDir: string, targetUrl: string, accessToken: string, branch: string, commitMessage: string): Promise<void> {
    try {
      const separator = process.platform === 'win32' ? ' && ' : ' && ';
      const cdCommand = process.platform === 'win32' 
        ? `cd /d "${sourceDir}"` 
        : `cd "${sourceDir}"`;
      
      const commands = [
        cdCommand,
        'git init',
        'git add .',
        `git commit -m "${commitMessage}"`,
        `git branch -M ${branch}`,
        `git remote add origin "${targetUrl.replace('https://github.com/', `https://${accessToken}@github.com/`)}"`,
        `git push -u origin ${branch}`
      ];

      const command = commands.join(separator);
      await execAsync(command);
    } catch (error) {
      throw new Error(`Failed to push to repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeRepositoryStructure(repoDir: string): Promise<FileStructure> {
    try {
      const files: FileInfo[] = [];
      let detectedFramework: string | undefined;
      let detectedLanguage: string | undefined;

      const scanDirectory = async (dirPath: string, relativePath: string = ''): Promise<void> => {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue; // Skip hidden files

          const fullPath = path.join(dirPath, entry.name);
          const relativeFilePath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            files.push({
              path: relativeFilePath,
              type: 'directory'
            });

            // Recursively scan subdirectories
            await scanDirectory(fullPath, relativeFilePath);
          } else {
            const stat = await fs.stat(fullPath);
            const extension = path.extname(entry.name);

            files.push({
              path: relativeFilePath,
              type: 'file',
              extension,
              size: stat.size
            });

            // Detect language and framework based on file patterns
            if (!detectedLanguage) {
              if (extension === '.java') detectedLanguage = 'Java';
              else if (extension === '.py') detectedLanguage = 'Python';
              else if (extension === '.cs') detectedLanguage = 'C#';
              else if (extension === '.js' || extension === '.ts') detectedLanguage = 'JavaScript/TypeScript';
            }

            if (!detectedFramework) {
              if (entry.name === 'pom.xml' || entry.name === 'testng.xml') detectedFramework = 'TestNG';
              else if (entry.name.includes('junit')) detectedFramework = 'JUnit';
              else if (entry.name === 'pytest.ini') detectedFramework = 'PyTest';
              else if (entry.name === 'cypress.json' || entry.name === 'cypress.config.js') detectedFramework = 'Cypress';
            }
          }
        }
      };

      await scanDirectory(repoDir);

      return {
        files,
        detectedFramework,
        detectedLanguage
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const githubService = new GitHubServiceImpl();
