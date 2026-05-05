import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Progress tracking queries
export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { userProgress } = await import("../drizzle/schema");
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function updateUserProgress(userId: number, blockId: number, completed: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  const { userProgress } = await import("../drizzle/schema");
  const result = await db.insert(userProgress).values({
    userId,
    blockId,
    completed: completed ? 1 : 0,
    completedAt: completed ? new Date() : undefined,
  }).onDuplicateKeyUpdate({
    set: {
      completed: completed ? 1 : 0,
      completedAt: completed ? new Date() : undefined,
      updatedAt: new Date(),
    }
  });
  
  return result;
}

// Trainer results queries
export async function saveTrainerResult(userId: number, trainerId: number, score: number, totalQuestions: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { trainerResults } = await import("../drizzle/schema");
  const percentage = (score / totalQuestions) * 100;
  
  return db.insert(trainerResults).values({
    userId,
    trainerId,
    score,
    totalQuestions,
    percentage: percentage.toString(),
  });
}

export async function getUserTrainerResults(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { trainerResults } = await import("../drizzle/schema");
  return db.select().from(trainerResults).where(eq(trainerResults.userId, userId));
}

// Calculator history queries
export async function saveCalculatorHistory(userId: number, calculatorType: string, inputs: Record<string, unknown>, results: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  
  const { calculatorHistory } = await import("../drizzle/schema");
  return db.insert(calculatorHistory).values({
    userId,
    calculatorType,
    inputs,
    results,
  });
}

export async function getCalculatorHistory(userId: number, calculatorType?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { calculatorHistory } = await import("../drizzle/schema");
  if (calculatorType) {
    return db.select().from(calculatorHistory).where(
      eq(calculatorHistory.userId, userId)
    );
  }
  
  return db.select().from(calculatorHistory).where(eq(calculatorHistory.userId, userId));
}

// Case study notes queries
export async function saveCaseStudyNote(userId: number, caseId: number, notes: string, isBookmarked: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  const { caseStudyNotes } = await import("../drizzle/schema");
  return db.insert(caseStudyNotes).values({
    userId,
    caseId,
    notes,
    isBookmarked: isBookmarked ? 1 : 0,
  }).onDuplicateKeyUpdate({
    set: {
      notes,
      isBookmarked: isBookmarked ? 1 : 0,
      updatedAt: new Date(),
    }
  });
}

export async function getCaseStudyNotes(userId: number, caseId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { caseStudyNotes } = await import("../drizzle/schema");
  if (caseId) {
    return db.select().from(caseStudyNotes).where(
      eq(caseStudyNotes.userId, userId)
    );
  }
  
  return db.select().from(caseStudyNotes).where(eq(caseStudyNotes.userId, userId));
}

// Interview prep queries
export async function saveInterviewPrepNote(userId: number, questionId: number, isReviewed: boolean, notes: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { interviewPrep } = await import("../drizzle/schema");
  return db.insert(interviewPrep).values({
    userId,
    questionId,
    isReviewed: isReviewed ? 1 : 0,
    notes,
  }).onDuplicateKeyUpdate({
    set: {
      isReviewed: isReviewed ? 1 : 0,
      notes,
      updatedAt: new Date(),
    }
  });
}

export async function getInterviewPrepNotes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { interviewPrep } = await import("../drizzle/schema");
  return db.select().from(interviewPrep).where(eq(interviewPrep.userId, userId));
}


// Sync history queries
export async function createSyncLog(
  userId: number,
  fileName: string,
  itemsAdded: number,
  itemsSkipped: number,
  duplicatesFound: number,
  blocksAffected: string[]
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create sync log: database not available");
    return null;
  }

  try {
    const { syncedFiles } = await import("../drizzle/schema");
    const result = await db.insert(syncedFiles).values({
      userId,
      fileName,
      itemsAdded,
      itemsSkipped,
      duplicatesFound,
      blocksAffected: JSON.stringify(blocksAffected),
      status: "completed",
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create sync log:", error);
    throw error;
  }
}

export async function getSyncedFilesHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get sync history: database not available");
    return [];
  }

  try {
    const { syncedFiles } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    const result = await db
      .select()
      .from(syncedFiles)
      .where(eq(syncedFiles.userId, userId))
      .orderBy(desc(syncedFiles.syncedAt))
      .limit(limit);

    return result.map((item) => ({
      ...item,
      blocksAffected: typeof item.blocksAffected === "string" ? JSON.parse(item.blocksAffected) : item.blocksAffected,
    }));
  } catch (error) {
    console.error("[Database] Failed to get sync history:", error);
    return [];
  }
}

export async function addSyncedContentItem(
  syncId: number,
  contentId: string,
  block: string,
  type: string,
  title: string,
  isDuplicate: boolean = false
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add synced content item: database not available");
    return null;
  }

  try {
    const { syncedContentItems } = await import("../drizzle/schema");
    const result = await db.insert(syncedContentItems).values({
      syncId,
      contentId,
      block,
      type,
      title,
      isDuplicate: isDuplicate ? 1 : 0,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to add synced content item:", error);
    throw error;
  }
}


// Dynamic KB content queries
export async function saveKBContent(
  userId: number,
  fileId: string,
  fileName: string,
  block: string,
  type: string,
  title: string,
  content: string,
  metadata: Record<string, unknown>,
  contentHash: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save KB content: database not available");
    return null;
  }

  try {
    const { kbContent } = await import("../drizzle/schema");
    const result = await db.insert(kbContent).values({
      userId,
      fileId,
      fileName,
      block,
      type,
      title,
      content,
      metadata: JSON.stringify(metadata),
      contentHash,
      isActive: 1,
    }).onDuplicateKeyUpdate({
      set: {
        content,
        metadata: JSON.stringify(metadata),
        updatedAt: new Date(),
      }
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to save KB content:", error);
    throw error;
  }
}

export async function getKBContentByBlock(block: string, isActive: boolean = true) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { kbContent } = await import("../drizzle/schema");
    const result = await db.select()
      .from(kbContent)
      .where(
        isActive 
          ? eq(kbContent.block, block) && eq(kbContent.isActive, 1)
          : eq(kbContent.block, block)
      );

    return result.map((item) => ({
      ...item,
      metadata: typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata,
    }));
  } catch (error) {
    console.error("[Database] Failed to get KB content:", error);
    return [];
  }
}

export async function getKBContentByFileId(fileId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { kbContent } = await import("../drizzle/schema");
    const result = await db.select()
      .from(kbContent)
      .where(eq(kbContent.fileId, fileId))
      .limit(1);

    if (result.length === 0) return null;

    const item = result[0];
    return {
      ...item,
      metadata: typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata,
    };
  } catch (error) {
    console.error("[Database] Failed to get KB content by file ID:", error);
    return null;
  }
}

export async function createSyncOperation(
  userId: number,
  folderName: string,
  folderId?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { syncOperations } = await import("../drizzle/schema");
    const result = await db.insert(syncOperations).values({
      userId,
      folderName,
      folderId: folderId || null,
      status: "in_progress",
      startedAt: new Date(),
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create sync operation:", error);
    throw error;
  }
}

export async function updateSyncOperation(
  syncId: number,
  updates: {
    filesProcessed?: number;
    filesSuccessful?: number;
    filesFailed?: number;
    contentItemsAdded?: number;
    contentItemsUpdated?: number;
    status?: "pending" | "in_progress" | "completed" | "failed";
    errorMessage?: string;
    completedAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { syncOperations } = await import("../drizzle/schema");
    const result = await db.update(syncOperations)
      .set(updates)
      .where(eq(syncOperations.id, syncId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to update sync operation:", error);
    throw error;
  }
}

export async function getSyncOperationsHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { syncOperations } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    const result = await db.select()
      .from(syncOperations)
      .where(eq(syncOperations.userId, userId))
      .orderBy(desc(syncOperations.startedAt))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get sync history:", error);
    return [];
  }
}


// Google Drive Token Management
export async function saveGoogleDriveToken(
  userId: number,
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save Google Drive token: database not available");
    return;
  }

  try {
    const { googleDriveTokens } = await import("../drizzle/schema");
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await db.insert(googleDriveTokens)
      .values({
        userId,
        accessToken,
        refreshToken: refreshToken || null,
        expiresAt,
      })
      .onDuplicateKeyUpdate({
        set: {
          accessToken,
          refreshToken: refreshToken || null,
          expiresAt,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("[Database] Failed to save Google Drive token:", error);
    throw error;
  }
}

export async function getGoogleDriveToken(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get Google Drive token: database not available");
    return undefined;
  }

  try {
    const { googleDriveTokens } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(googleDriveTokens)
      .where(eq(googleDriveTokens.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get Google Drive token:", error);
    return undefined;
  }
}

export async function deleteGoogleDriveToken(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete Google Drive token: database not available");
    return;
  }

  try {
    const { googleDriveTokens } = await import("../drizzle/schema");
    await db.delete(googleDriveTokens).where(eq(googleDriveTokens.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to delete Google Drive token:", error);
    throw error;
  }
}
