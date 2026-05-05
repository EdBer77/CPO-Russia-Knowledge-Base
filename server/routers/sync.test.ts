import { describe, expect, it, vi, beforeEach } from "vitest";
import { syncRouter } from "./sync";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("sync router", () => {
  describe("listDriveFiles", () => {
    it("should return list of mock files", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.listDriveFiles();

      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files[0]).toHaveProperty("id");
      expect(result.files[0]).toHaveProperty("name");
      expect(result.files[0]).toHaveProperty("mimeType");
    });
  });

  describe("previewSync", () => {
    it("should parse and classify content", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.previewSync({
        fileName: "test.txt",
        fileContent: "DPO Formula: (Accounts Payable / Cost of Goods Sold) * Number of Days",
      });

      expect(result).toHaveProperty("fileName");
      expect(result).toHaveProperty("totalParsed");
      expect(result).toHaveProperty("summary");
      expect(result.summary).toHaveProperty("itemsFound");
      expect(result.summary).toHaveProperty("itemsNew");
    });

    it("should identify duplicates", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.previewSync({
        fileName: "test.txt",
        fileContent: "DPO calculation method",
      });

      expect(result).toHaveProperty("duplicates");
      expect(Array.isArray(result.duplicates)).toBe(true);
    });

    it("should group items by block", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.previewSync({
        fileName: "test.txt",
        fileContent: "Financial metrics and inventory management",
      });

      expect(result).toHaveProperty("byBlock");
      expect(typeof result.byBlock).toBe("object");
    }, 10000); // Increase timeout for LLM calls
  });

  describe("confirmSync", () => {
    it("should require authentication", async () => {
      const ctx = createAuthContext();
      ctx.user = null;
      const caller = syncRouter.createCaller(ctx as any);

      await expect(
        caller.confirmSync({
          fileName: "test.txt",
          items: [],
        })
      ).rejects.toThrow();
    });

    it("should return success for valid input", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.confirmSync({
        fileName: "test.txt",
        items: [
          {
            id: "1",
            block: "finance",
            type: "formula",
            title: "DPO Formula",
            content: "Days Payable Outstanding",
            source: "test.txt",
            tags: ["DPO", "finance"],
            difficulty: "basic",
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.fileName).toBe("test.txt");
      expect(result.itemsAdded).toBe(1);
    });

    it("should return blocks affected", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.confirmSync({
        fileName: "test.txt",
        items: [
          {
            id: "1",
            block: "finance",
            type: "formula",
            title: "DPO Formula",
            content: "Days Payable Outstanding",
            source: "test.txt",
            tags: ["DPO"],
            difficulty: "basic",
          },
          {
            id: "2",
            block: "inventory",
            type: "theory",
            title: "ABC Analysis",
            content: "Inventory classification",
            source: "test.txt",
            tags: ["inventory"],
            difficulty: "basic",
          },
        ],
      });

      expect(result.blocksAffected).toContain("finance");
      expect(result.blocksAffected).toContain("inventory");
      expect(result.blocksAffected.length).toBe(2);
    });

    it("should handle empty items", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.confirmSync({
        fileName: "empty.txt",
        items: [],
      });

      expect(result.success).toBe(true);
      expect(result.itemsAdded).toBe(0);
    });
  });

  describe("getSyncHistory", () => {
    it("should require authentication", async () => {
      const ctx = createAuthContext();
      ctx.user = null;
      const caller = syncRouter.createCaller(ctx as any);

      await expect(caller.getSyncHistory()).rejects.toThrow();
    });

    it("should return sync history", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.getSyncHistory();

      expect(result).toHaveProperty("syncs");
      expect(Array.isArray(result.syncs)).toBe(true);
    });

    it("should return sync history with expected fields", async () => {
      const ctx = createAuthContext();
      const caller = syncRouter.createCaller(ctx);

      const result = await caller.getSyncHistory();

      if (result.syncs.length > 0) {
        const sync = result.syncs[0];
        expect(sync).toHaveProperty("id");
        expect(sync).toHaveProperty("fileName");
        expect(sync).toHaveProperty("date");
        expect(sync).toHaveProperty("itemsAdded");
      }
    });
  });
});
