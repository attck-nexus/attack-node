import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Google authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table updated for Google authentication
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull(), // HackerOne, Bugcrowd, etc.
  url: text("url").notNull(),
  status: text("status").notNull().default("active"), // active, paused, ended
  minReward: decimal("min_reward", { precision: 10, scale: 2 }).default("0"),
  maxReward: decimal("max_reward", { precision: 10, scale: 2 }).default("0"),
  description: text("description"),
  lastChecked: timestamp("last_checked").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // web, mobile, api, etc.
  scope: text("scope").notNull().default("in-scope"), // in-scope, out-of-scope
  tags: json("tags").$type<string[]>().default([]),
  notes: text("notes"),
  lastTested: timestamp("last_tested"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  targetId: integer("target_id").references(() => targets.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // P1, P2, P3, P4
  status: text("status").notNull().default("new"), // new, triaged, resolved, duplicate, etc.
  cvssScore: decimal("cvss_score", { precision: 3, scale: 1 }),
  reward: decimal("reward", { precision: 10, scale: 2 }),
  proofOfConcept: text("proof_of_concept"),
  recommendations: text("recommendations"),
  attachments: json("attachments").$type<string[]>().default([]),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // openai, anthropic, local, burp
  endpoint: text("endpoint"),
  apiKey: text("api_key"),
  modelPrompt: text("model_prompt"),
  flowOrder: integer("flow_order").default(0),
  status: text("status").notNull().default("offline"), // online, offline, error
  lastPing: timestamp("last_ping"),
  config: json("config").$type<Record<string, any>>().default({}),
  // Loop configuration
  loopEnabled: boolean("loop_enabled").default(false),
  loopPartnerId: integer("loop_partner_id"),
  maxLoopIterations: integer("max_loop_iterations").default(5),
  loopExitCondition: text("loop_exit_condition"), // 'functional_poc', 'vulnerability_confirmed', 'exploit_successful'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  vulnerabilityId: integer("vulnerability_id").references(() => vulnerabilities.id).notNull(),
  content: text("content").notNull(),
  format: text("format").notNull().default("markdown"), // markdown, html, json
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientCertificates = pgTable("client_certificates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  certificateFile: text("certificate_file").notNull(), // path to .crt/.pem file
  privateKeyFile: text("private_key_file").notNull(), // path to .key file
  caFile: text("ca_file"), // optional CA certificate file
  passphrase: text("passphrase"), // encrypted passphrase for private key
  domain: text("domain"), // target domain/scope
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const programsRelations = relations(programs, ({ many }) => ({
  targets: many(targets),
  vulnerabilities: many(vulnerabilities),
}));

export const targetsRelations = relations(targets, ({ one, many }) => ({
  program: one(programs, {
    fields: [targets.programId],
    references: [programs.id],
  }),
  vulnerabilities: many(vulnerabilities),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one, many }) => ({
  program: one(programs, {
    fields: [vulnerabilities.programId],
    references: [programs.id],
  }),
  target: one(targets, {
    fields: [vulnerabilities.targetId],
    references: [targets.id],
  }),
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  vulnerability: one(vulnerabilities, {
    fields: [reports.vulnerabilityId],
    references: [vulnerabilities.id],
  }),
}));

export const aiAgentsRelations = relations(aiAgents, ({ one }) => ({
  loopPartner: one(aiAgents, {
    fields: [aiAgents.loopPartnerId],
    references: [aiAgents.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const upsertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTargetSchema = createInsertSchema(targets).omit({ id: true, createdAt: true });
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true, submittedAt: true, updatedAt: true });
export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });
export const insertClientCertificateSchema = createInsertSchema(clientCertificates).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;
export type Target = typeof targets.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertAiAgent = z.infer<typeof insertAiAgentSchema>;
export type AiAgent = typeof aiAgents.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertClientCertificate = z.infer<typeof insertClientCertificateSchema>;
export type ClientCertificate = typeof clientCertificates.$inferSelect;
