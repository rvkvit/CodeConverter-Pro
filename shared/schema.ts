import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  repositoryUrl: text("repository_url").notNull(),
  accessToken: text("access_token"),
  sourceLanguage: text("source_language").notNull(),
  sourceFramework: text("source_framework").notNull(),
  sourceAutomationTool: text("source_automation_tool").notNull(),
  targetFramework: text("target_framework").notNull(),
  targetLibrary: text("target_library").notNull(),
  testStructure: text("test_structure").notNull(),
  openaiApiKey: text("openai_api_key").notNull(),
  modelSelection: text("model_selection").notNull().default("gpt-4o"),
  status: text("status").notNull().default("pending"), // pending, analyzing, converting, completed, failed
  progress: integer("progress").notNull().default(0),
  analysisResults: jsonb("analysis_results"),
  convertedFiles: jsonb("converted_files"),
  errorLogs: jsonb("error_logs"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const repositoryInfo = pgTable("repository_info", {
  id: serial("id").primaryKey(),
  conversionId: integer("conversion_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  lastUpdated: text("last_updated"),
  detectedFiles: jsonb("detected_files"),
  fileStructure: jsonb("file_structure"),
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRepositoryInfoSchema = createInsertSchema(repositoryInfo).omit({
  id: true,
});

export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
export type InsertRepositoryInfo = z.infer<typeof insertRepositoryInfoSchema>;
export type RepositoryInfo = typeof repositoryInfo.$inferSelect;
