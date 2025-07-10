import {
  users,
  programs,
  targets,
  vulnerabilities,
  aiAgents,
  reports,
  clientCertificates,
  globalConfig,
  type User,
  type InsertUser,
  type UpsertUser,
  type Program,
  type InsertProgram,
  type Target,
  type InsertTarget,
  type Vulnerability,
  type InsertVulnerability,
  type AiAgent,
  type InsertAiAgent,
  type Report,
  type InsertReport,
  type ClientCertificate,
  type InsertClientCertificate,
  type GlobalConfig,
  type InsertGlobalConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Program operations
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program>;
  deleteProgram(id: number): Promise<void>;

  // Target operations
  getTargets(programId?: number): Promise<Target[]>;
  getTarget(id: number): Promise<Target | undefined>;
  createTarget(target: InsertTarget): Promise<Target>;
  updateTarget(id: number, target: Partial<InsertTarget>): Promise<Target>;
  deleteTarget(id: number): Promise<void>;

  // Vulnerability operations
  getVulnerabilities(programId?: number): Promise<Vulnerability[]>;
  getVulnerability(id: number): Promise<Vulnerability | undefined>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerability(id: number, vulnerability: Partial<InsertVulnerability>): Promise<Vulnerability>;
  deleteVulnerability(id: number): Promise<void>;

  // AI Agent operations
  getAiAgents(): Promise<AiAgent[]>;
  getAiAgent(id: number): Promise<AiAgent | undefined>;
  createAiAgent(agent: InsertAiAgent): Promise<AiAgent>;
  updateAiAgent(id: number, agent: Partial<InsertAiAgent>): Promise<AiAgent>;
  deleteAiAgent(id: number): Promise<void>;

  // Report operations
  getReports(vulnerabilityId?: number): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: number): Promise<void>;

  // Client Certificate operations
  getClientCertificates(): Promise<ClientCertificate[]>;
  getClientCertificate(id: number): Promise<ClientCertificate | undefined>;
  createClientCertificate(certificate: InsertClientCertificate): Promise<ClientCertificate>;
  updateClientCertificate(id: number, certificate: Partial<InsertClientCertificate>): Promise<ClientCertificate>;
  deleteClientCertificate(id: number): Promise<void>;

  // Analytics operations
  getDashboardStats(): Promise<{
    totalPrograms: number;
    totalVulnerabilities: number;
    totalRewards: number;
    avgResponseTime: number;
    vulnerabilityTrends: { severity: string; count: number }[];
  }>;

  // Global Config operations
  getGlobalConfig(userId: string, configType: string): Promise<GlobalConfig | undefined>;
  saveGlobalConfig(config: InsertGlobalConfig): Promise<GlobalConfig>;
  getAllUserConfigs(userId: string): Promise<GlobalConfig[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Program operations
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs).orderBy(desc(programs.createdAt));
  }

  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program || undefined;
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db
      .insert(programs)
      .values(insertProgram)
      .returning();
    return program;
  }

  async updateProgram(id: number, updateProgram: Partial<InsertProgram>): Promise<Program> {
    const [program] = await db
      .update(programs)
      .set({ ...updateProgram, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning();
    return program;
  }

  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Target operations
  async getTargets(programId?: number): Promise<Target[]> {
    if (programId) {
      return await db.select().from(targets).where(eq(targets.programId, programId));
    }
    return await db.select().from(targets).orderBy(desc(targets.createdAt));
  }

  async getTarget(id: number): Promise<Target | undefined> {
    const [target] = await db.select().from(targets).where(eq(targets.id, id));
    return target || undefined;
  }

  async createTarget(insertTarget: InsertTarget): Promise<Target> {
    const [target] = await db
      .insert(targets)
      .values({
        programId: insertTarget.programId,
        url: insertTarget.url,
        type: insertTarget.type,
        scope: insertTarget.scope || "in-scope",
        tags: insertTarget.tags || [],
        notes: insertTarget.notes,
        lastTested: insertTarget.lastTested
      } as any)
      .returning();
    return target;
  }

  async updateTarget(id: number, updateTarget: Partial<InsertTarget>): Promise<Target> {
    const updateData: any = {};
    if (updateTarget.programId !== undefined) updateData.programId = updateTarget.programId;
    if (updateTarget.url !== undefined) updateData.url = updateTarget.url;
    if (updateTarget.type !== undefined) updateData.type = updateTarget.type;
    if (updateTarget.scope !== undefined) updateData.scope = updateTarget.scope;
    if (updateTarget.tags !== undefined) updateData.tags = updateTarget.tags;
    if (updateTarget.notes !== undefined) updateData.notes = updateTarget.notes;
    if (updateTarget.lastTested !== undefined) updateData.lastTested = updateTarget.lastTested;
    
    const [target] = await db
      .update(targets)
      .set(updateData)
      .where(eq(targets.id, id))
      .returning();
    return target;
  }

  async deleteTarget(id: number): Promise<void> {
    await db.delete(targets).where(eq(targets.id, id));
  }

  // Vulnerability operations
  async getVulnerabilities(programId?: number): Promise<Vulnerability[]> {
    if (programId) {
      return await db.select().from(vulnerabilities).where(eq(vulnerabilities.programId, programId));
    }
    return await db.select().from(vulnerabilities).orderBy(desc(vulnerabilities.submittedAt));
  }

  async getVulnerability(id: number): Promise<Vulnerability | undefined> {
    const [vulnerability] = await db.select().from(vulnerabilities).where(eq(vulnerabilities.id, id));
    return vulnerability || undefined;
  }

  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [vulnerability] = await db
      .insert(vulnerabilities)
      .values({
        programId: insertVulnerability.programId,
        targetId: insertVulnerability.targetId,
        title: insertVulnerability.title,
        description: insertVulnerability.description,
        severity: insertVulnerability.severity,
        status: insertVulnerability.status || "new",
        cvssScore: insertVulnerability.cvssScore,
        reward: insertVulnerability.reward,
        proofOfConcept: insertVulnerability.proofOfConcept,
        recommendations: insertVulnerability.recommendations,
        attachments: insertVulnerability.attachments || []
      } as any)
      .returning();
    return vulnerability;
  }

  async updateVulnerability(id: number, updateVulnerability: Partial<InsertVulnerability>): Promise<Vulnerability> {
    const updateData: any = { updatedAt: new Date() };
    if (updateVulnerability.programId !== undefined) updateData.programId = updateVulnerability.programId;
    if (updateVulnerability.targetId !== undefined) updateData.targetId = updateVulnerability.targetId;
    if (updateVulnerability.title !== undefined) updateData.title = updateVulnerability.title;
    if (updateVulnerability.description !== undefined) updateData.description = updateVulnerability.description;
    if (updateVulnerability.severity !== undefined) updateData.severity = updateVulnerability.severity;
    if (updateVulnerability.status !== undefined) updateData.status = updateVulnerability.status;
    if (updateVulnerability.cvssScore !== undefined) updateData.cvssScore = updateVulnerability.cvssScore;
    if (updateVulnerability.reward !== undefined) updateData.reward = updateVulnerability.reward;
    if (updateVulnerability.proofOfConcept !== undefined) updateData.proofOfConcept = updateVulnerability.proofOfConcept;
    if (updateVulnerability.recommendations !== undefined) updateData.recommendations = updateVulnerability.recommendations;
    if (updateVulnerability.attachments !== undefined) updateData.attachments = updateVulnerability.attachments;
    
    const [vulnerability] = await db
      .update(vulnerabilities)
      .set(updateData)
      .where(eq(vulnerabilities.id, id))
      .returning();
    return vulnerability;
  }

  async deleteVulnerability(id: number): Promise<void> {
    await db.delete(vulnerabilities).where(eq(vulnerabilities.id, id));
  }

  // AI Agent operations
  async getAiAgents(): Promise<AiAgent[]> {
    return await db.select().from(aiAgents).orderBy(desc(aiAgents.createdAt));
  }

  async getAiAgent(id: number): Promise<AiAgent | undefined> {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return agent || undefined;
  }

  async createAiAgent(insertAgent: InsertAiAgent): Promise<AiAgent> {
    const [agent] = await db
      .insert(aiAgents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async updateAiAgent(id: number, updateAgent: Partial<InsertAiAgent>): Promise<AiAgent> {
    const [agent] = await db
      .update(aiAgents)
      .set(updateAgent)
      .where(eq(aiAgents.id, id))
      .returning();
    return agent;
  }

  async deleteAiAgent(id: number): Promise<void> {
    await db.delete(aiAgents).where(eq(aiAgents.id, id));
  }

  // Report operations
  async getReports(vulnerabilityId?: number): Promise<Report[]> {
    if (vulnerabilityId) {
      return await db.select().from(reports).where(eq(reports.vulnerabilityId, vulnerabilityId));
    }
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateReport(id: number, updateReport: Partial<InsertReport>): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set(updateReport)
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  // Client Certificate operations
  async getClientCertificates(): Promise<ClientCertificate[]> {
    return await db.select().from(clientCertificates).orderBy(desc(clientCertificates.createdAt));
  }

  async getClientCertificate(id: number): Promise<ClientCertificate | undefined> {
    const [certificate] = await db.select().from(clientCertificates).where(eq(clientCertificates.id, id));
    return certificate || undefined;
  }

  async createClientCertificate(insertCertificate: InsertClientCertificate): Promise<ClientCertificate> {
    const [certificate] = await db
      .insert(clientCertificates)
      .values(insertCertificate)
      .returning();
    return certificate;
  }

  async updateClientCertificate(id: number, updateCertificate: Partial<InsertClientCertificate>): Promise<ClientCertificate> {
    const [certificate] = await db
      .update(clientCertificates)
      .set({ ...updateCertificate, updatedAt: new Date() })
      .where(eq(clientCertificates.id, id))
      .returning();
    return certificate;
  }

  async deleteClientCertificate(id: number): Promise<void> {
    await db.delete(clientCertificates).where(eq(clientCertificates.id, id));
  }

  // Analytics operations
  async getDashboardStats(): Promise<{
    totalPrograms: number;
    totalVulnerabilities: number;
    totalRewards: number;
    avgResponseTime: number;
    vulnerabilityTrends: { severity: string; count: number }[];
  }> {
    const [programCount] = await db.select({ count: count() }).from(programs);
    const [vulnerabilityCount] = await db.select({ count: count() }).from(vulnerabilities);
    
    const rewardResults = await db
      .select({ reward: vulnerabilities.reward })
      .from(vulnerabilities)
      .where(and(eq(vulnerabilities.status, "resolved")));
    
    const totalRewards = rewardResults.reduce((sum, row) => sum + (parseFloat(row.reward || "0")), 0);
    
    const vulnerabilityTrends = await db
      .select({
        severity: vulnerabilities.severity,
        count: count(),
      })
      .from(vulnerabilities)
      .groupBy(vulnerabilities.severity);

    return {
      totalPrograms: programCount.count,
      totalVulnerabilities: vulnerabilityCount.count,
      totalRewards,
      avgResponseTime: 2.3, // This would be calculated from actual response times
      vulnerabilityTrends,
    };
  }

  // Global Config operations
  async getGlobalConfig(userId: string, configType: string): Promise<GlobalConfig | undefined> {
    const [config] = await db
      .select()
      .from(globalConfig)
      .where(and(eq(globalConfig.userId, userId), eq(globalConfig.configType, configType)));
    return config || undefined;
  }

  async saveGlobalConfig(config: InsertGlobalConfig): Promise<GlobalConfig> {
    // Check if config already exists
    const existing = await this.getGlobalConfig(config.userId, config.configType);
    
    if (existing) {
      // Update existing config
      const [updatedConfig] = await db
        .update(globalConfig)
        .set({ 
          configData: config.configData,
          updatedAt: new Date() 
        })
        .where(and(eq(globalConfig.userId, config.userId), eq(globalConfig.configType, config.configType)))
        .returning();
      return updatedConfig;
    } else {
      // Create new config
      const [newConfig] = await db
        .insert(globalConfig)
        .values(config)
        .returning();
      return newConfig;
    }
  }

  async getAllUserConfigs(userId: string): Promise<GlobalConfig[]> {
    return await db
      .select()
      .from(globalConfig)
      .where(eq(globalConfig.userId, userId))
      .orderBy(desc(globalConfig.updatedAt));
  }
}

export const storage = new DatabaseStorage();
