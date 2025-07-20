import OpenAI from "openai";

export interface CodeAnalysisResult {
  testFiles: AnalyzedFile[];
  framework: string;
  language: string;
  patterns: CodePattern[];
  dependencies: string[];
}

export interface AnalyzedFile {
  path: string;
  testCases: TestCase[];
  keywords: string[];
  complexity: 'low' | 'medium' | 'high';
}

export interface TestCase {
  name: string;
  description?: string;
  steps: string[];
  assertions: string[];
  tags: string[];
}

export interface CodePattern {
  type: string;
  description: string;
  occurrences: number;
}

export interface ConversionResult {
  robotFiles: RobotFile[];
  resourceFiles: ResourceFile[];
  requirements: string[];
  summary: ConversionSummary;
}

export interface RobotFile {
  path: string;
  content: string;
  testCases: number;
}

export interface ResourceFile {
  path: string;
  content: string;
  keywords: number;
}

export interface ConversionSummary {
  totalTestFiles: number;
  totalTestCases: number;
  totalResourceFiles: number;
  warnings: string[];
  recommendations: string[];
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    // API key will be provided per request since it comes from user input
    this.client = new OpenAI({ 
      apiKey: 'dummy' // Will be set per request
    });
  }

  async analyzeCode(fileContents: Record<string, string>, apiKey: string): Promise<CodeAnalysisResult> {
    const client = new OpenAI({ apiKey });

    const analysisPrompt = `
Analyze the following test automation code files and provide a detailed analysis in JSON format.

Files to analyze:
${Object.entries(fileContents).map(([path, content]) => `
File: ${path}
Content:
${content}
`).join('\n')}

Please provide your analysis in this exact JSON format:
{
  "testFiles": [
    {
      "path": "string",
      "testCases": [
        {
          "name": "string",
          "description": "string",
          "steps": ["string"],
          "assertions": ["string"],
          "tags": ["string"]
        }
      ],
      "keywords": ["string"],
      "complexity": "low|medium|high"
    }
  ],
  "framework": "string",
  "language": "string",
  "patterns": [
    {
      "type": "string",
      "description": "string",
      "occurrences": number
    }
  ],
  "dependencies": ["string"]
}

Focus on identifying test methods, page object patterns, wait strategies, assertions, and any complex logic that needs special handling during conversion.
`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert in test automation frameworks. Analyze code and provide detailed insights for framework conversion."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as CodeAnalysisResult;
    } catch (error) {
      throw new Error(`Code analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertToRobotFramework(
    analysisResult: CodeAnalysisResult,
    targetLibrary: string,
    testStructure: string,
    apiKey: string
  ): Promise<ConversionResult> {
    const client = new OpenAI({ apiKey });

    const conversionPrompt = `
Convert the analyzed test automation code to Robot Framework format based on the following analysis and requirements:

Analysis Result:
${JSON.stringify(analysisResult, null, 2)}

Target Library: ${targetLibrary}
Test Structure: ${testStructure}

Please convert the code to Robot Framework and provide the result in this exact JSON format:
{
  "robotFiles": [
    {
      "path": "string (e.g., tests/login_test.robot)",
      "content": "string (full Robot Framework syntax)",
      "testCases": number
    }
  ],
  "resourceFiles": [
    {
      "path": "string (e.g., resources/common_keywords.resource)",
      "content": "string (Robot Framework resource syntax)",
      "keywords": number
    }
  ],
  "requirements": ["string (e.g., robotframework==6.1.1)"],
  "summary": {
    "totalTestFiles": number,
    "totalTestCases": number,
    "totalResourceFiles": number,
    "warnings": ["string"],
    "recommendations": ["string"]
  }
}

Guidelines for conversion:
1. Use ${targetLibrary} for web automation
2. Follow Robot Framework best practices
3. Create appropriate resource files for reusable keywords
4. Include proper test documentation and tags
5. Handle wait strategies appropriately
6. Convert assertions to Robot Framework format
7. Organize tests according to ${testStructure} structure

Ensure the generated Robot Framework code is syntactically correct and follows best practices.
`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert in Robot Framework and test automation conversion. Generate high-quality, syntactically correct Robot Framework code."
          },
          {
            role: "user",
            content: conversionPrompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as ConversionResult;
    } catch (error) {
      throw new Error(`Code conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const openaiService = new OpenAIService();
