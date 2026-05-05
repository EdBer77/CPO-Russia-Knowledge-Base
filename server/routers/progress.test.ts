import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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

describe("progress router", () => {
  it("should get user progress (empty initially)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.getProgress();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should save trainer result", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.saveTrainerResult({
      trainerId: 1,
      score: 8,
      totalQuestions: 10,
    });

    expect(result).toBeDefined();
  });

  it("should get trainer results", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save a result first
    await caller.progress.saveTrainerResult({
      trainerId: 1,
      score: 8,
      totalQuestions: 10,
    });

    // Get results
    const results = await caller.progress.getTrainerResults();

    expect(Array.isArray(results)).toBe(true);
  });

  it("should save calculator history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.saveCalculatorHistory({
      calculatorType: "dpo",
      inputs: {
        revenue: 12,
        cogs: 8,
        payables: 1.6,
        inventory: 1.2,
        receivables: 1.0,
      },
      results: {
        dpo: 73,
        dio: 55,
        dso: 30,
        ccc: 12,
        wc: 1.2,
      },
    });

    expect(result).toBeDefined();
  });

  it("should get calculator history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save a calculation first
    await caller.progress.saveCalculatorHistory({
      calculatorType: "eoq",
      inputs: {
        demand: 3600,
        orderCost: 5000,
        holdingCost: 6000,
      },
      results: {
        eoq: 300,
        ordersPerYear: 12,
        avgInventory: 150,
      },
    });

    // Get history
    const history = await caller.progress.getCalculatorHistory({});

    expect(Array.isArray(history)).toBe(true);
  });

  it("should save case study note", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.saveCaseStudyNote({
      caseId: 1,
      notes: "Important insights about DPO management",
      isBookmarked: true,
    });

    expect(result).toBeDefined();
  });

  it("should get case study notes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save a note first
    await caller.progress.saveCaseStudyNote({
      caseId: 1,
      notes: "Test note",
      isBookmarked: false,
    });

    // Get notes
    const notes = await caller.progress.getCaseStudyNotes({});

    expect(Array.isArray(notes)).toBe(true);
  });

  it("should save interview prep note", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.saveInterviewPrepNote({
      questionId: 1,
      isReviewed: true,
      notes: "Prepared STAR answer for DPO question",
    });

    expect(result).toBeDefined();
  });

  it("should get interview prep notes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save a note first
    await caller.progress.saveInterviewPrepNote({
      questionId: 1,
      isReviewed: false,
      notes: "Need to review",
    });

    // Get notes
    const notes = await caller.progress.getInterviewPrepNotes();

    expect(Array.isArray(notes)).toBe(true);
  });

  it("should update block progress", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.updateBlockProgress({
      blockId: 1,
      completed: true,
    });

    expect(result).toBeDefined();
  });
});
