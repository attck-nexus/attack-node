import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgramSchema, insertTargetSchema, insertVulnerabilitySchema, insertAiAgentSchema, insertReportSchema, insertClientCertificateSchema } from "@shared/schema";
import { generateVulnerabilityReport } from "./services/openai";
import { testConnection as testAnthropicConnection } from "./services/anthropic";
import { dockerService } from "./services/docker";
import { agentLoopService } from "./services/agent-loop";
import { setupGoogleAuth, isAuthenticated } from "./google-auth";
import { fileManagerService } from "./services/file-manager";
import { certificateManager } from "./services/certificate-manager";
import multer from "multer";
import path from "path";
import { z } from "zod";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Separate multer configuration for Burp Suite uploads (1GB limit)
const burpSuiteUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 1024 * 1024 * 1024, // 1GB limit for Burp Suite JAR files
    fieldSize: 1024 * 1024 * 1024, // 1GB field size limit
    fields: 10, // Number of non-file fields
    files: 2, // Number of file fields
    parts: 12, // Total number of parts
    headerPairs: 2000 // Number of header pairs
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google authentication
  await setupGoogleAuth(app);

  // Authentication routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // If Google OAuth is not configured, return a mock user for development
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.json({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Programs routes
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get("/api/programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.getProgram(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  app.post("/api/programs", async (req, res) => {
    try {
      const programData = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(programData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  app.put("/api/programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const programData = insertProgramSchema.partial().parse(req.body);
      const program = await storage.updateProgram(id, programData);
      res.json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  app.delete("/api/programs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProgram(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete program" });
    }
  });

  // Targets routes
  app.get("/api/targets", async (req, res) => {
    try {
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
      const targets = await storage.getTargets(programId);
      res.json(targets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch targets" });
    }
  });

  app.post("/api/targets", async (req, res) => {
    try {
      const targetData = insertTargetSchema.parse(req.body);
      const target = await storage.createTarget(targetData);
      res.status(201).json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid target data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create target" });
    }
  });

  app.put("/api/targets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const targetData = insertTargetSchema.partial().parse(req.body);
      const target = await storage.updateTarget(id, targetData);
      res.json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid target data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update target" });
    }
  });

  app.delete("/api/targets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTarget(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete target" });
    }
  });

  // Vulnerabilities routes
  app.get("/api/vulnerabilities", async (req, res) => {
    try {
      const programId = req.query.programId ? parseInt(req.query.programId as string) : undefined;
      const vulnerabilities = await storage.getVulnerabilities(programId);
      res.json(vulnerabilities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vulnerabilities" });
    }
  });

  app.get("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vulnerability = await storage.getVulnerability(id);
      if (!vulnerability) {
        return res.status(404).json({ message: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vulnerability" });
    }
  });

  app.post("/api/vulnerabilities", upload.array("attachments"), async (req, res) => {
    try {
      const vulnerabilityData = insertVulnerabilitySchema.parse(req.body);
      
      // Handle file uploads
      const attachments = (req.files as Express.Multer.File[])?.map(file => file.filename) || [];
      vulnerabilityData.attachments = attachments;
      
      const vulnerability = await storage.createVulnerability(vulnerabilityData);
      res.status(201).json(vulnerability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vulnerability data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vulnerability" });
    }
  });

  app.put("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vulnerabilityData = insertVulnerabilitySchema.partial().parse(req.body);
      const vulnerability = await storage.updateVulnerability(id, vulnerabilityData);
      res.json(vulnerability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vulnerability data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vulnerability" });
    }
  });

  app.delete("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVulnerability(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vulnerability" });
    }
  });

  // AI Agent routes
  app.get("/api/ai-agents", async (req, res) => {
    try {
      const agents = await storage.getAiAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI agents" });
    }
  });

  app.post("/api/ai-agents", async (req, res) => {
    try {
      const agentData = insertAiAgentSchema.parse(req.body);
      const agent = await storage.createAiAgent(agentData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid AI agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create AI agent" });
    }
  });

  app.put("/api/ai-agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agentData = insertAiAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAiAgent(id, agentData);
      res.json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid AI agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update AI agent" });
    }
  });

  app.delete("/api/ai-agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAiAgent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete AI agent" });
    }
  });

  // Test AI agent connection
  app.post("/api/ai-agents/:id/test", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAiAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "AI agent not found" });
      }

      // Test the connection based on agent type
      let status = "offline";
      let latency = 0;
      
      if (agent.type === "openai") {
        try {
          const start = Date.now();
          await generateVulnerabilityReport("Test connection", "P4", "Testing OpenAI connection");
          latency = Date.now() - start;
          status = "online";
        } catch (error) {
          status = "error";
        }
      } else if (agent.type === "anthropic") {
        try {
          const result = await testAnthropicConnection(agent.apiKey ?? undefined);
          status = result.status;
          latency = result.latency;
        } catch (error) {
          status = "error";
        }
      } else if (agent.type === "local") {
        // Test local AI connection
        try {
          const start = Date.now();
          const response = await fetch(agent.endpoint + "/health");
          latency = Date.now() - start;
          status = response.ok ? "online" : "error";
        } catch (error) {
          status = "error";
        }
      } else if (agent.type === "burp") {
        // Test Burp Suite connection
        try {
          const start = Date.now();
          const response = await fetch(agent.endpoint + "/burp/scanner/status");
          latency = Date.now() - start;
          status = response.ok ? "online" : "error";
        } catch (error) {
          status = "error";
        }
      }

      // Update agent status
      await storage.updateAiAgent(id, { status, lastPing: new Date() });
      
      res.json({ status, latency });
    } catch (error) {
      res.status(500).json({ message: "Failed to test AI agent connection" });
    }
  });

  // Reports routes
  app.get("/api/reports", async (req, res) => {
    try {
      const vulnerabilityId = req.query.vulnerabilityId ? parseInt(req.query.vulnerabilityId as string) : undefined;
      const reports = await storage.getReports(vulnerabilityId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Generate AI report
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { vulnerabilityId, title, severity, description } = req.body;
      
      if (!vulnerabilityId || !title || !severity || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const reportContent = await generateVulnerabilityReport(title, severity, description);
      
      const report = await storage.createReport({
        vulnerabilityId,
        content: reportContent,
        format: "markdown",
        aiGenerated: true,
      });

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI report" });
    }
  });

  // Dashboard analytics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Serve uploaded files
  app.get("/api/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), "uploads", filename);
    res.sendFile(filePath);
  });

  // Docker integration routes
  app.get("/api/docker/containers", async (req, res) => {
    try {
      const containers = await dockerService.listContainers();
      res.json(containers);
    } catch (error) {
      console.error("Failed to list containers:", error);
      res.status(500).json({ error: "Failed to list containers" });
    }
  });

  app.post("/api/docker/start-burpsuite", burpSuiteUpload.fields([
    { name: 'jar', maxCount: 1 },
    { name: 'license', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      let jarPath: string | undefined;
      let licensePath: string | undefined;

      if (files?.jar?.[0]) {
        jarPath = await dockerService.saveUploadedFile(files.jar[0].buffer, files.jar[0].originalname);
      }

      if (files?.license?.[0]) {
        licensePath = await dockerService.saveUploadedFile(files.license[0].buffer, files.license[0].originalname);
      }

      const container = await dockerService.startBurpSuite(jarPath, licensePath);
      res.json(container);
    } catch (error) {
      console.error("Failed to start Burp Suite:", error);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File too large. Maximum size is 1GB." });
      }
      res.status(500).json({ error: "Failed to start Burp Suite container" });
    }
  });

  app.post("/api/docker/start-headless-burpsuite", burpSuiteUpload.fields([
    { name: 'jar', maxCount: 1 },
    { name: 'license', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files?.jar?.[0]) {
        return res.status(400).json({ error: "JAR file is required for headless mode" });
      }

      const jarPath = await dockerService.saveUploadedFile(files.jar[0].buffer, files.jar[0].originalname);
      
      let licensePath: string | undefined;
      if (files?.license?.[0]) {
        licensePath = await dockerService.saveUploadedFile(files.license[0].buffer, files.license[0].originalname);
      }

      const container = await dockerService.startHeadlessBurpSuite(jarPath, licensePath);
      res.json(container);
    } catch (error) {
      console.error("Failed to start headless Burp Suite:", error);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File too large. Maximum size is 1GB." });
      }
      res.status(500).json({ error: error.message || "Failed to start headless Burp Suite container" });
    }
  });

  app.post("/api/docker/start-app", async (req, res) => {
    try {
      const { appName, image, port } = req.body;
      
      if (!appName || !image || !port) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const container = await dockerService.startKasmWebApp(appName, image, port);
      res.json(container);
    } catch (error) {
      console.error("Failed to start container:", error);
      res.status(500).json({ error: "Failed to start container" });
    }
  });

  app.post("/api/docker/stop/:nameOrId", async (req, res) => {
    try {
      const { nameOrId } = req.params;
      const success = await dockerService.stopContainer(nameOrId);
      
      if (success) {
        res.json({ message: "Container stopped successfully" });
      } else {
        res.status(500).json({ error: "Failed to stop container" });
      }
    } catch (error) {
      console.error("Failed to stop container:", error);
      res.status(500).json({ error: "Failed to stop container" });
    }
  });

  app.get("/api/docker/info", async (req, res) => {
    try {
      const info = await dockerService.getDockerInfo();
      res.json(info);
    } catch (error) {
      console.error("Failed to get Docker info:", error);
      res.status(500).json({ error: "Failed to get Docker information" });
    }
  });

  app.post("/api/docker/cleanup", async (req, res) => {
    try {
      const success = await dockerService.cleanupUnusedImages();
      res.json({ success });
    } catch (error) {
      console.error("Failed to cleanup images:", error);
      res.status(500).json({ error: "Failed to cleanup unused images" });
    }
  });

  app.post("/api/docker/stop-all", async (req, res) => {
    try {
      const success = await dockerService.stopAllContainers();
      res.json({ success });
    } catch (error) {
      console.error("Failed to stop all containers:", error);
      res.status(500).json({ error: "Failed to stop all containers" });
    }
  });

  // Agent Loop routes
  app.post("/api/agent-loops/start", async (req, res) => {
    try {
      const { agentId, vulnerabilityId, initialInput } = req.body;
      
      if (!agentId || !vulnerabilityId || !initialInput) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const loopExecution = await agentLoopService.startLoop(
        parseInt(agentId), 
        parseInt(vulnerabilityId), 
        initialInput
      );
      
      res.json(loopExecution);
    } catch (error) {
      console.error("Failed to start agent loop:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/agent-loops", async (req, res) => {
    try {
      const activeLoops = agentLoopService.getActiveLoops();
      res.json(activeLoops);
    } catch (error) {
      console.error("Failed to get active loops:", error);
      res.status(500).json({ error: "Failed to get active loops" });
    }
  });

  app.get("/api/agent-loops/:loopId", async (req, res) => {
    try {
      const loop = agentLoopService.getLoop(req.params.loopId);
      if (!loop) {
        return res.status(404).json({ error: "Loop not found" });
      }
      res.json(loop);
    } catch (error) {
      console.error("Failed to get loop:", error);
      res.status(500).json({ error: "Failed to get loop" });
    }
  });

  app.post("/api/agent-loops/:loopId/stop", async (req, res) => {
    try {
      const success = agentLoopService.stopLoop(req.params.loopId);
      res.json({ success });
    } catch (error) {
      console.error("Failed to stop loop:", error);
      res.status(500).json({ error: "Failed to stop loop" });
    }
  });

  // File Management routes
  app.get("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user && !process.env.GOOGLE_CLIENT_ID) {
        // Create a mock user for development
        const mockUser = await storage.upsertUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null
        });
        const listing = await fileManagerService.listDirectory(mockUser, req.query.path as string || "/");
        return res.json(listing);
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const dirPath = req.query.path as string || "/";
      const listing = await fileManagerService.listDirectory(user, dirPath);
      res.json(listing);
    } catch (error) {
      console.error("Failed to list directory:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/files/directory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user && !process.env.GOOGLE_CLIENT_ID) {
        // Create a mock user for development
        const mockUser = await storage.upsertUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null
        });
        await fileManagerService.createDirectory(mockUser, req.body.path);
        return res.json({ success: true });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { path: dirPath } = req.body;
      if (!dirPath) {
        return res.status(400).json({ error: "Directory path is required" });
      }

      await fileManagerService.createDirectory(user, dirPath);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to create directory:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user && !process.env.GOOGLE_CLIENT_ID) {
        // Create a mock user for development
        const mockUser = await storage.upsertUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null
        });
        await fileManagerService.deleteFile(mockUser, req.query.path as string);
        return res.json({ success: true });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const filePath = req.query.path as string;
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }

      await fileManagerService.deleteFile(user, filePath);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete file:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/files/download", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user && !process.env.GOOGLE_CLIENT_ID) {
        // Create a mock user for development
        const mockUser = await storage.upsertUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null
        });
        const fileContent = await fileManagerService.readFile(mockUser, req.query.path as string);
        const fileName = (req.query.path as string).split('/').pop() || 'download';
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        return res.send(fileContent);
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const filePath = req.query.path as string;
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }

      const fileContent = await fileManagerService.readFile(user, filePath);
      const fileName = filePath.split('/').pop() || 'download';
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(fileContent);
    } catch (error) {
      console.error("Failed to download file:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/files/upload", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user && !process.env.GOOGLE_CLIENT_ID) {
        // Create a mock user for development
        const mockUser = await storage.upsertUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null
        });
        
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const targetPath = req.body.path || "/";
        const fileName = req.file.originalname;
        const fullPath = targetPath.endsWith('/') ? targetPath + fileName : targetPath + '/' + fileName;

        const fs = await import("fs/promises");
        const fileContent = await fs.readFile(req.file.path);
        await fileManagerService.writeFile(mockUser, fullPath, fileContent);
        await fs.unlink(req.file.path);

        return res.json({ success: true, path: fullPath });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const targetPath = req.body.path || "/";
      const fileName = req.file.originalname;
      const fullPath = targetPath.endsWith('/') ? targetPath + fileName : targetPath + '/' + fileName;

      // Read the uploaded file and write to user directory
      const fs = await import("fs/promises");
      const fileContent = await fs.readFile(req.file.path);
      await fileManagerService.writeFile(user, fullPath, fileContent);
      
      // Clean up temporary file
      await fs.unlink(req.file.path);

      res.json({ success: true, path: fullPath });
    } catch (error) {
      console.error("Failed to upload file:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/files/user-home", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user && !process.env.GOOGLE_CLIENT_ID) {
        // Create a mock user for development
        const mockUser = await storage.upsertUser({
          id: 'dev-user',
          username: 'developer',
          email: 'dev@example.com',
          firstName: 'Developer',
          lastName: 'User',
          profileImageUrl: null
        });
        const homePath = fileManagerService.getUserHomePath(mockUser);
        return res.json({ homePath });
      }
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const homePath = fileManagerService.getUserHomePath(user);
      res.json({ homePath });
    } catch (error) {
      console.error("Failed to get user home path:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Client Certificate routes
  app.get("/api/certificates", async (req, res) => {
    try {
      const certificates = await storage.getClientCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.get("/api/certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getClientCertificate(id);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  app.post("/api/certificates", upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'privateKey', maxCount: 1 },
    { name: 'ca', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const files = req.files;
      if (!files?.certificate?.[0] || !files?.privateKey?.[0]) {
        return res.status(400).json({ message: "Certificate and private key files are required" });
      }

      const certificateFile = files.certificate[0];
      const privateKeyFile = files.privateKey[0];
      const caFile = files.ca?.[0];

      // Read file contents
      const fs = await import("fs/promises");
      const certificateBuffer = await fs.readFile(certificateFile.path);
      const privateKeyBuffer = await fs.readFile(privateKeyFile.path);
      const caBuffer = caFile ? await fs.readFile(caFile.path) : undefined;

      // Validate certificate files
      const isValid = await certificateManager.validateCertificate(certificateBuffer, privateKeyBuffer);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid certificate or private key format" });
      }

      // Save certificate files
      const savedFiles = await certificateManager.saveCertificateFiles({
        certificateFile: certificateBuffer,
        privateKeyFile: privateKeyBuffer,
        caFile: caBuffer,
        originalNames: {
          certificate: certificateFile.originalname,
          privateKey: privateKeyFile.originalname,
          ca: caFile?.originalname,
        }
      });

      // Parse certificate information
      const certInfo = await certificateManager.parseCertificateInfo(certificateBuffer);

      // Encrypt passphrase if provided
      let encryptedPassphrase = undefined;
      if (req.body.passphrase) {
        encryptedPassphrase = await certificateManager.encryptPassphrase(req.body.passphrase);
      }

      // Create certificate record
      const certificateData = insertClientCertificateSchema.parse({
        name: req.body.name,
        description: req.body.description,
        domain: req.body.domain,
        certificateFile: savedFiles.certificateFile,
        privateKeyFile: savedFiles.privateKeyFile,
        caFile: savedFiles.caFile,
        passphrase: encryptedPassphrase,
        expiresAt: certInfo.validTo,
        isActive: true,
      });

      const certificate = await storage.createClientCertificate(certificateData);

      // Clean up temporary files
      await fs.unlink(certificateFile.path);
      await fs.unlink(privateKeyFile.path);
      if (caFile) await fs.unlink(caFile.path);

      res.status(201).json(certificate);
    } catch (error) {
      console.error("Certificate upload error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload certificate" });
    }
  });

  app.put("/api/certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificateData = insertClientCertificateSchema.partial().parse(req.body);
      const certificate = await storage.updateClientCertificate(id, certificateData);
      res.json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update certificate" });
    }
  });

  app.delete("/api/certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getClientCertificate(id);
      if (certificate) {
        await certificateManager.deleteCertificateFiles(certificate);
      }
      await storage.deleteClientCertificate(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete certificate" });
    }
  });

  app.get("/api/certificates/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getClientCertificate(id);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      const fileType = req.query.type as string;
      let filePath: string;
      let fileName: string;

      switch (fileType) {
        case 'certificate':
          filePath = certificate.certificateFile;
          fileName = `${certificate.name}_certificate.pem`;
          break;
        case 'privateKey':
          filePath = certificate.privateKeyFile;
          fileName = `${certificate.name}_private_key.pem`;
          break;
        case 'ca':
          if (!certificate.caFile) {
            return res.status(404).json({ message: "CA file not found" });
          }
          filePath = certificate.caFile;
          fileName = `${certificate.name}_ca.pem`;
          break;
        default:
          return res.status(400).json({ message: "Invalid file type" });
      }

      const fileContent = await certificateManager.getCertificateContent(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/x-pem-file');
      res.send(fileContent);
    } catch (error) {
      console.error("Failed to download certificate file:", error);
      res.status(500).json({ message: "Failed to download certificate file" });
    }
  });

  // Global Config routes
  app.get("/api/config/:configType", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const configType = req.params.configType;
      
      const config = await storage.getGlobalConfig(userId, configType);
      if (!config) {
        return res.json({}); // Return empty object if no config exists
      }
      
      res.json(config.configData);
    } catch (error) {
      console.error("Failed to fetch config:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  app.post("/api/config/:configType", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const configType = req.params.configType;
      const configData = req.body;
      
      const savedConfig = await storage.saveGlobalConfig({
        userId,
        configType,
        configData
      });
      
      res.json(savedConfig.configData);
    } catch (error) {
      console.error("Failed to save config:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  app.get("/api/config", isAuthenticated, async (req: any, res) => {
    try {
      const userId = !process.env.GOOGLE_CLIENT_ID ? 'dev-user' : req.user?.claims?.sub;
      const configs = await storage.getAllUserConfigs(userId);
      
      // Transform to a more convenient format
      const configMap = configs.reduce((acc, config) => {
        acc[config.configType] = config.configData;
        return acc;
      }, {} as Record<string, any>);
      
      res.json(configMap);
    } catch (error) {
      console.error("Failed to fetch all configs:", error);
      res.status(500).json({ error: "Failed to fetch configurations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
