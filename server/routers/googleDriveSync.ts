import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { createGoogleDriveService } from "../services/googleDrive";
import { parseAndClassifyContent } from "../services/driveSync";
import * as db from "../db";
import crypto from "crypto";

export const googleDriveSyncRouter = router({
  /**
   * Start Google Drive sync process
   * Requires user to have authenticated with Google Drive OAuth
   */
  startSync: protectedProcedure
    .input(z.object({
      accessToken: z.string().optional(),
      folderName: z.string().default("CPO_Knowledge-KB"),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("User not authenticated");

      try {
        // Create sync operation record
        const syncOp = await db.createSyncOperation(
          ctx.user.id,
          input.folderName
        );

        if (!syncOp) {
          throw new Error("Failed to create sync operation");
        }

        const syncId = (syncOp as any).insertId || 0;

        // Get Google Drive token from database
        let token = await db.getGoogleDriveToken(ctx.user.id);
        
        if (!token) {
          throw new Error("Google Drive not authorized. Please authorize first.");
        }

        // Check if token is expired and refresh if needed
        const { isTokenExpired, refreshAccessToken } = await import("../services/googleDriveOAuth");
        if (isTokenExpired(token.expiresAt?.getTime() || 0)) {
          if (token.refreshToken) {
            try {
              const refreshed = await refreshAccessToken(token.refreshToken);
              token.accessToken = refreshed.accessToken;
              token.expiresAt = new Date(Date.now() + (refreshed.expiresIn || 3600) * 1000);
              
              // Update token in database
              await db.saveGoogleDriveToken(
                ctx.user.id,
                refreshed.accessToken,
                token.refreshToken,
                token.expiresAt
              );
            } catch (refreshError) {
              console.error("[Sync] Token refresh failed:", refreshError);
              throw new Error("Google Drive token expired. Please re-authorize.");
            }
          } else {
            throw new Error("Google Drive token expired. Please re-authorize.");
          }
        }

        // Initialize Google Drive service with real token
        const driveService = createGoogleDriveService(token.accessToken);

        // Start sync process
        const parsedContents = await driveService.syncKnowledgeBase(
          async (progress) => {
            console.log(`[Sync Progress] ${progress.current}/${progress.total}: ${progress.fileName} - ${progress.status}`);
          }
        );

        // Process and save each parsed content
        let itemsAdded = 0;
        let itemsUpdated = 0;

        for (const content of parsedContents) {
          try {
            // Generate content hash for deduplication
            const contentHash = crypto
              .createHash("sha256")
              .update(content.text)
              .digest("hex");

            // Parse and classify content
            const classified = await parseAndClassifyContent(
              content.fileName,
              content.text
            );

            // Save each classified item
            for (const item of classified) {
              const existing = await db.getKBContentByFileId(content.fileId);

              if (existing) {
                itemsUpdated++;
              } else {
                itemsAdded++;
              }

              await db.saveKBContent(
                ctx.user.id,
                content.fileId,
                content.fileName,
                item.block,
                item.type,
                item.title,
                item.content,
                {
                  pages: content.metadata.pages,
                  author: content.metadata.author,
                  sourceFile: content.fileName,
                  parsedAt: new Date().toISOString(),
                },
                contentHash
              );
            }
          } catch (itemError) {
            console.error(`[Sync] Error processing ${content.fileName}:`, itemError);
            // Continue with next file
          }
        }

        // Update sync operation status
        await db.updateSyncOperation(syncId, {
          filesProcessed: parsedContents.length,
          filesSuccessful: parsedContents.length,
          contentItemsAdded: itemsAdded,
          contentItemsUpdated: itemsUpdated,
          status: "completed",
          completedAt: new Date(),
        });

        return {
          success: true,
          syncId,
          filesProcessed: parsedContents.length,
          itemsAdded,
          itemsUpdated,
          message: `Synced ${parsedContents.length} files, added ${itemsAdded} items, updated ${itemsUpdated}`,
        };
      } catch (error) {
        console.error("[GoogleDriveSync] Sync failed:", error);
        throw new Error(`Google Drive sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Get sync history for current user
   */
  getSyncHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");

    const syncs = await db.getSyncOperationsHistory(ctx.user.id, 20);
    return {
      syncs: syncs.map((sync) => ({
        id: sync.id,
        folderName: sync.folderName,
        filesProcessed: sync.filesProcessed,
        filesSuccessful: sync.filesSuccessful,
        filesFailed: sync.filesFailed,
        contentItemsAdded: sync.contentItemsAdded,
        contentItemsUpdated: sync.contentItemsUpdated,
        status: sync.status,
        startedAt: sync.startedAt,
        completedAt: sync.completedAt,
      })),
    };
  }),

  /**
   * Get knowledge base content by block
   */
  getContentByBlock: protectedProcedure
    .input(z.object({
      block: z.string(),
    }))
    .query(async ({ input }) => {
      const content = await db.getKBContentByBlock(input.block);
      return {
        block: input.block,
        items: content.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          content: item.content.substring(0, 500), // Preview only
          metadata: item.metadata,
          syncedAt: item.syncedAt,
        })),
        totalItems: content.length,
      };
    }),

  /**
   * Get full content for a specific item
   */
  getContentById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        // For now, return a placeholder since we need to add a helper function
        // In production, this would query the database for the specific item
        return {
          id: input.id,
          title: "Content Title",
          block: "finance",
          type: "theory",
          content: "Full content would be retrieved from database",
          fileName: "source.pdf",
          metadata: { pages: 10 },
          syncedAt: new Date(),
        };
      } catch (error) {
        console.error("[googleDriveSync] Error getting content by ID:", error);
        throw new Error(`Failed to retrieve content: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Get Google Drive authorization URL
   */
  getAuthUrl: publicProcedure
    .query(async () => {
      const { getGoogleDriveAuthUrl } = await import("../services/googleDriveOAuth");
      const state = crypto.randomBytes(16).toString("hex");
      const authUrl = getGoogleDriveAuthUrl(state);
      
      return {
        authUrl,
        state,
      };
    }),

  /**
   * Exchange authorization code for access token
   */
  exchangeCode: protectedProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("User not authenticated");

      try {
        const { exchangeCodeForToken } = await import("../services/googleDriveOAuth");
        const tokenData = await exchangeCodeForToken(input.code);

        // Save token to database
        await db.saveGoogleDriveToken(
          ctx.user.id,
          tokenData.accessToken,
          tokenData.refreshToken,
          tokenData.expiresIn
        );

        return {
          success: true,
          message: "Google Drive authorization successful",
        };
      } catch (error) {
        console.error("[OAuth] Code exchange failed:", error);
        throw new Error("Failed to exchange authorization code");
      }
    }),

  /**
   * Get current Google Drive token status
   */
  getTokenStatus: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");

      try {
        const token = await db.getGoogleDriveToken(ctx.user.id);

        if (!token) {
          return {
            hasToken: false,
            message: "No Google Drive authorization found",
          };
        }

        const { isTokenExpired } = await import("../services/googleDriveOAuth");
        const expired = isTokenExpired(token.expiresAt.getTime());

        return {
          hasToken: true,
          isExpired: expired,
          expiresAt: token.expiresAt,
          message: expired ? "Token expired, please re-authorize" : "Token is valid",
        };
      } catch (error) {
        console.error("[OAuth] Token status check failed:", error);
        return {
          hasToken: false,
          message: "Error checking token status",
        };
      }
    }),

  /**
   * Revoke Google Drive authorization
   */
  revokeAuth: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error("User not authenticated");

      try {
        await db.deleteGoogleDriveToken(ctx.user.id);

        return {
          success: true,
          message: "Google Drive authorization revoked",
        };
      } catch (error) {
        console.error("[OAuth] Revoke failed:", error);
        throw new Error("Failed to revoke authorization");
      }
    }),
});
