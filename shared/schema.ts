import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NOTE: We are using Firebase, but we define schemas here for type safety and validation
// in the frontend application.

// Collection: approved_users
export const approvedUsers = pgTable("approved_users", {
  id: serial("id").primaryKey(), // Placeholder for Firebase doc ID
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"), // "admin" or other roles
  isActive: boolean("is_active").default(true),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collection: gbv_reports
export const gbvReports = pgTable("gbv_reports", {
  id: serial("id").primaryKey(), // Placeholder for Firebase doc ID
  type: text("type").notNull(), // e.g., "Physical", "Sexual", "Emotional"
  description: text("description").notNull(),
  location: text("location"),
  status: text("status").default("pending"), // "pending", "reviewed", "resolved"
  reportedBy: text("reported_by"), // User ID or Email
  reportedAt: timestamp("reported_at").defaultNow(),
  evidenceUrl: text("evidence_url"), // URL from Firebase Storage
});

// Schemas
export const insertApprovedUserSchema = createInsertSchema(approvedUsers).pick({
  email: true,
  role: true,
  isActive: true,
  approvedBy: true,
});

export const insertGbvReportSchema = createInsertSchema(gbvReports).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type ApprovedUser = typeof approvedUsers.$inferSelect;
export type InsertApprovedUser = z.infer<typeof insertApprovedUserSchema>;

export type GbvReport = typeof gbvReports.$inferSelect;
export type InsertGbvReport = z.infer<typeof insertGbvReportSchema>;
