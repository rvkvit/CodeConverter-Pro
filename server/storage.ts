import { conversions, repositoryInfo, type Conversion, type InsertConversion, type RepositoryInfo, type InsertRepositoryInfo } from "@shared/schema";

export interface IStorage {
  // Conversion operations
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getConversion(id: number): Promise<Conversion | undefined>;
  updateConversion(id: number, updates: Partial<Conversion>): Promise<Conversion>;
  getConversionsByStatus(status: string): Promise<Conversion[]>;
  
  // Repository info operations
  createRepositoryInfo(repoInfo: InsertRepositoryInfo): Promise<RepositoryInfo>;
  getRepositoryInfoByConversionId(conversionId: number): Promise<RepositoryInfo | undefined>;
}

export class MemStorage implements IStorage {
  private conversions: Map<number, Conversion>;
  private repositories: Map<number, RepositoryInfo>;
  private currentConversionId: number;
  private currentRepoId: number;

  constructor() {
    this.conversions = new Map();
    this.repositories = new Map();
    this.currentConversionId = 1;
    this.currentRepoId = 1;
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = this.currentConversionId++;
    const now = new Date();
    const conversion: Conversion = {
      ...insertConversion,
      id,
      progress: insertConversion.progress ?? 0,
      accessToken: insertConversion.accessToken ?? null,
      modelSelection: insertConversion.modelSelection ?? 'gpt-4o',
      status: insertConversion.status ?? 'pending',
      analysisResults: insertConversion.analysisResults ?? null,
      convertedFiles: insertConversion.convertedFiles ?? null,
      errorLogs: insertConversion.errorLogs ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.conversions.set(id, conversion);
    return conversion;
  }

  async getConversion(id: number): Promise<Conversion | undefined> {
    return this.conversions.get(id);
  }

  async updateConversion(id: number, updates: Partial<Conversion>): Promise<Conversion> {
    const existing = this.conversions.get(id);
    if (!existing) {
      throw new Error(`Conversion with id ${id} not found`);
    }
    
    const updated: Conversion = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.conversions.set(id, updated);
    return updated;
  }

  async getConversionsByStatus(status: string): Promise<Conversion[]> {
    return Array.from(this.conversions.values()).filter(
      (conversion) => conversion.status === status
    );
  }

  async createRepositoryInfo(insertRepositoryInfo: InsertRepositoryInfo): Promise<RepositoryInfo> {
    const id = this.currentRepoId++;
    const repositoryInfo: RepositoryInfo = {
      ...insertRepositoryInfo,
      id,
      description: insertRepositoryInfo.description ?? null,
      lastUpdated: insertRepositoryInfo.lastUpdated ?? null,
      detectedFiles: insertRepositoryInfo.detectedFiles ?? null,
      fileStructure: insertRepositoryInfo.fileStructure ?? null,
    };
    this.repositories.set(id, repositoryInfo);
    return repositoryInfo;
  }

  async getRepositoryInfoByConversionId(conversionId: number): Promise<RepositoryInfo | undefined> {
    return Array.from(this.repositories.values()).find(
      (repo) => repo.conversionId === conversionId
    );
  }
}

export const storage = new MemStorage();
