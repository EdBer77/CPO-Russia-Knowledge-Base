import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User progress tracking for theory blocks
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  blockId: int("blockId").notNull(),
  completed: int("completed").default(0).notNull(), // 0 or 1
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Trainer results and quiz scores
 */
export const trainerResults = mysqlTable("trainerResults", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trainerId: int("trainerId").notNull(),
  score: int("score").notNull(), // number of correct answers
  totalQuestions: int("totalQuestions").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainerResult = typeof trainerResults.$inferSelect;
export type InsertTrainerResult = typeof trainerResults.$inferInsert;

/**
 * Calculator history for tracking user calculations
 */
export const calculatorHistory = mysqlTable("calculatorHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  calculatorType: varchar("calculatorType", { length: 50 }).notNull(), // 'dpo', 'eoq', 'tco'
  inputs: json("inputs").notNull(), // JSON object with input values
  results: json("results").notNull(), // JSON object with calculation results
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalculatorHistory = typeof calculatorHistory.$inferSelect;
export type InsertCalculatorHistory = typeof calculatorHistory.$inferInsert;

/**
 * User bookmarks and notes for case studies
 */
export const caseStudyNotes = mysqlTable("caseStudyNotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  caseId: int("caseId").notNull(),
  notes: text("notes"),
  isBookmarked: int("isBookmarked").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CaseStudyNote = typeof caseStudyNotes.$inferSelect;
export type InsertCaseStudyNote = typeof caseStudyNotes.$inferInsert;

/**
 * Interview preparation tracking
 */
export const interviewPrep = mysqlTable("interviewPrep", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  isReviewed: int("isReviewed").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InterviewPrep = typeof interviewPrep.$inferSelect;
export type InsertInterviewPrep = typeof interviewPrep.$inferInsert;

/**
 * Track synced files from Google Drive
 */
export const syncedFiles = mysqlTable("syncedFiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileId: varchar("fileId", { length: 255 }),
  itemsAdded: int("itemsAdded").default(0).notNull(),
  itemsSkipped: int("itemsSkipped").default(0).notNull(),
  duplicatesFound: int("duplicatesFound").default(0).notNull(),
  blocksAffected: json("blocksAffected").notNull(), // JSON array of block names
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("completed").notNull(),
  errorMessage: text("errorMessage"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncedFile = typeof syncedFiles.$inferSelect;
export type InsertSyncedFile = typeof syncedFiles.$inferInsert;

/**
 * Track individual synced content items
 */
export const syncedContentItems = mysqlTable("syncedContentItems", {
  id: int("id").autoincrement().primaryKey(),
  syncId: int("syncId").notNull(), // references syncedFiles.id
  contentId: varchar("contentId", { length: 255 }).notNull(),
  block: varchar("block", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // theory, formula, case, metric, tool, interview, calc
  title: varchar("title", { length: 255 }).notNull(),
  isDuplicate: int("isDuplicate").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncedContentItem = typeof syncedContentItems.$inferSelect;
export type InsertSyncedContentItem = typeof syncedContentItems.$inferInsert;


/**
 * Dynamic knowledge base content from Google Drive
 */
export const kbContent = mysqlTable("kbContent", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // owner/admin who synced
  fileId: varchar("fileId", { length: 255 }).notNull().unique(), // Google Drive file ID
  fileName: varchar("fileName", { length: 255 }).notNull(),
  block: varchar("block", { length: 50 }).notNull(), // finance, inventory, sourcing, etc.
  type: varchar("type", { length: 50 }).notNull(), // theory, formula, case, metric, tool
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Full parsed text from PDF
  summary: text("summary"), // AI-generated summary
  metadata: json("metadata").notNull(), // {pages, author, createdAt, etc.}
  contentHash: varchar("contentHash", { length: 64 }).notNull(), // For deduplication
  isActive: int("isActive").default(1).notNull(), // Soft delete
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KBContent = typeof kbContent.$inferSelect;
export type InsertKBContent = typeof kbContent.$inferInsert;

/**
 * Track sync operations for audit trail
 */
export const syncOperations = mysqlTable("syncOperations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  folderName: varchar("folderName", { length: 255 }).notNull(),
  folderId: varchar("folderId", { length: 255 }),
  filesProcessed: int("filesProcessed").default(0).notNull(),
  filesSuccessful: int("filesSuccessful").default(0).notNull(),
  filesFailed: int("filesFailed").default(0).notNull(),
  contentItemsAdded: int("contentItemsAdded").default(0).notNull(),
  contentItemsUpdated: int("contentItemsUpdated").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncOperation = typeof syncOperations.$inferSelect;
export type InsertSyncOperation = typeof syncOperations.$inferInsert;


/**
 * Google Drive OAuth tokens for users
 */
export const googleDriveTokens = mysqlTable("googleDriveTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GoogleDriveToken = typeof googleDriveTokens.$inferSelect;
export type InsertGoogleDriveToken = typeof googleDriveTokens.$inferInsert;
