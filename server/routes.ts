import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { githubService } from "./services/github";
import { conversionService } from "./services/converter";
import { insertConversionSchema, insertRepositoryInfoSchema } from "@shared/schema";
import { z } from "zod";
import archiver from "archiver";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate repository endpoint
  app.post("/api/repository/validate", async (req, res) => {
    try {
      const { repositoryUrl, accessToken } = req.body;
      
      if (!repositoryUrl) {
        return res.status(400).json({ error: "Repository URL is required" });
      }

      const validation = await githubService.validateRepository(repositoryUrl, accessToken);
      
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      res.json(validation);
    } catch (error) {
      console.error("Repository validation error:", error);
      res.status(500).json({ error: "Failed to validate repository" });
    }
  });

  // Create conversion endpoint
  app.post("/api/conversions", async (req, res) => {
    try {
      const validatedData = insertConversionSchema.parse(req.body);
      const conversion = await storage.createConversion(validatedData);

      // Start conversion process asynchronously
      conversionService.startConversion(conversion.id).catch(error => {
        console.error(`Conversion ${conversion.id} failed:`, error);
      });

      res.json(conversion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Conversion creation error:", error);
      res.status(500).json({ error: "Failed to create conversion" });
    }
  });

  // Get conversion status endpoint
  app.get("/api/conversions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversion = await storage.getConversion(id);
      
      if (!conversion) {
        return res.status(404).json({ error: "Conversion not found" });
      }

      const repositoryInfo = await storage.getRepositoryInfoByConversionId(id);

      res.json({
        ...conversion,
        repositoryInfo
      });
    } catch (error) {
      console.error("Get conversion error:", error);
      res.status(500).json({ error: "Failed to get conversion" });
    }
  });

  // Download converted files endpoint
  app.get("/api/conversions/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversion = await storage.getConversion(id);
      
      if (!conversion) {
        return res.status(404).json({ error: "Conversion not found" });
      }

      if (conversion.status !== 'completed') {
        return res.status(400).json({ error: "Conversion not completed yet" });
      }

      const outputDir = await conversionService.getConvertedFiles(id);
      
      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.attachment(`robot-framework-conversion-${id}.zip`);
      archive.pipe(res);
      
      archive.directory(outputDir, false);
      await archive.finalize();
      
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download files" });
    }
  });

  // Deploy to GitHub endpoint
  app.post("/api/conversions/:id/deploy", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { targetUrl, accessToken, branch, commitMessage } = req.body;
      
      if (!targetUrl || !accessToken || !branch || !commitMessage) {
        return res.status(400).json({ 
          error: "targetUrl, accessToken, branch, and commitMessage are required" 
        });
      }

      const conversion = await storage.getConversion(id);
      
      if (!conversion) {
        return res.status(404).json({ error: "Conversion not found" });
      }

      if (conversion.status !== 'completed') {
        return res.status(400).json({ error: "Conversion not completed yet" });
      }

      await conversionService.deployToGitHub(id, targetUrl, accessToken, branch, commitMessage);
      
      res.json({ success: true, message: "Code deployed successfully" });
    } catch (error) {
      console.error("Deploy error:", error);
      res.status(500).json({ error: "Failed to deploy to GitHub" });
    }
  });

  // Get file content endpoint for preview
  app.get("/api/conversions/:id/files/:filename", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const filename = req.params.filename;
      
      const conversion = await storage.getConversion(id);
      
      if (!conversion) {
        return res.status(404).json({ error: "Conversion not found" });
      }

      if (conversion.status !== 'completed' || !conversion.convertedFiles) {
        return res.status(400).json({ error: "Conversion not completed yet" });
      }

      const convertedFiles = conversion.convertedFiles as any;
      
      // Look for the file in robotFiles or resourceFiles
      let fileContent = '';
      const robotFile = convertedFiles.robotFiles?.find((f: any) => f.path.endsWith(filename));
      const resourceFile = convertedFiles.resourceFiles?.find((f: any) => f.path.endsWith(filename));
      
      if (robotFile) {
        fileContent = robotFile.content;
      } else if (resourceFile) {
        fileContent = resourceFile.content;
      } else {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({ content: fileContent });
    } catch (error) {
      console.error("Get file content error:", error);
      res.status(500).json({ error: "Failed to get file content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
