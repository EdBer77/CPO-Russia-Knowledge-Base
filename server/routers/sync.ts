import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { parseAndClassifyContent, findDuplicates, extractTextFromFile, type ContentElement } from "../services/driveSync";
import { createSyncLog, addSyncedContentItem, getSyncedFilesHistory, getSyncOperationsHistory } from "../db";

// Mock knowledge base for now - in real implementation, this would come from kb.ts
const mockExistingItems: ContentElement[] = [];

export const syncRouter = router({
  // Get list of files from Google Drive /CPO-KB/ folder
  listDriveFiles: protectedProcedure.query(async ({ ctx }) => {
    // This would use Google Drive API
    // For now, return mock data
    return {
      files: [
        { id: "file1", name: "DPO_Management.pdf", mimeType: "application/pdf" },
        { id: "file2", name: "S&OP_Process.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { id: "file3", name: "SRM_Framework.txt", mimeType: "text/plain" },
      ],
    };
  }),

  // Preview sync results before confirmation
  previewSync: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileContent: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse and classify content
        const parsedItems = await parseAndClassifyContent(input.fileName, input.fileContent);

        // Find duplicates
        const { duplicates, unique } = findDuplicates(parsedItems, mockExistingItems);

        // Group by block
        const byBlock: Record<string, ContentElement[]> = {};
        unique.forEach((item) => {
          if (!byBlock[item.block]) {
            byBlock[item.block] = [];
          }
          byBlock[item.block].push(item);
        });

        return {
          fileName: input.fileName,
          totalParsed: parsedItems.length,
          duplicates,
          newItems: unique,
          byBlock,
          summary: {
            filesProcessed: 1,
            itemsFound: parsedItems.length,
            itemsNew: unique.length,
            duplicatesFound: duplicates.length,
            blocksAffected: Object.keys(byBlock).length,
          },
        };
      } catch (error) {
        console.error("[Sync] Preview error:", error);
        throw new Error("Failed to preview sync");
      }
    }),

  // Confirm and save items to knowledge base
  confirmSync: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      items: z.array(z.object({
        id: z.string(),
        block: z.string(),
        type: z.string(),
        title: z.string(),
        content: z.string(),
        source: z.string(),
        tags: z.array(z.string()),
        difficulty: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) throw new Error("User not authenticated");

        // Get unique blocks affected
        const blocksAffected = Array.from(new Set(input.items.map((item) => item.block)));

        // Create sync log in database
        const syncLog = await createSyncLog(
          ctx.user.id,
          input.fileName,
          input.items.length,
          0,
          0,
          blocksAffected
        );

        // Add individual items to sync history
        if (syncLog && "insertId" in syncLog) {
          for (const item of input.items) {
            await addSyncedContentItem(
              syncLog.insertId as number,
              item.id,
              item.block,
              item.type,
              item.title,
              false
            );
          }
        }

        return {
          success: true,
          fileName: input.fileName,
          itemsAdded: input.items.length,
          blocksAffected: blocksAffected as string[],
          message: `Successfully added ${input.items.length} items from ${input.fileName}`,
        };
      } catch (error) {
        console.error("[Sync] Confirm error:", error);
        throw new Error("Failed to confirm sync");
      }
    }),

  // Get sync history
  getSyncHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");

    const syncs = await getSyncedFilesHistory(ctx.user.id, 20);
    return {
      syncs: syncs.map((sync) => ({
        id: sync.id,
        fileName: sync.fileName,
        date: sync.syncedAt,
        itemsAdded: sync.itemsAdded,
        itemsSkipped: sync.itemsSkipped,
        duplicatesFound: sync.duplicatesFound,
        blocksAffected: sync.blocksAffected,
      })),
    };
  }),
});
