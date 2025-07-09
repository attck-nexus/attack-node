import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgramSchema, insertTargetSchema, insertVulnerabilitySchema, insertAiAgentSchema, insertReportSchema } from "@shared/schema";
import { generateVulnerabilityReport } from "./services/openai";
import { testConnection as testAnthropicConnection } from "./services/anthropic";
import { dockerService } from "./services/docker";
import { agentLoopService } from "./services/agent-loop";
import { setupGoogleAuth, isAuthenticated } from "./google-auth";
import { fileManagerService } from "./services/file-manager";
import multer from "multer";
import path from "path";
import { z } from "zod";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

  app.post("/api/docker/start-burpsuite", upload.fields([
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
      res.status(500).json({ error: "Failed to start Burp Suite container" });
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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

  const httpServer = createServer(app);
  return httpServer;
}
