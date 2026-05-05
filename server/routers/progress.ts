import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const progressRouter = router({
  // Get user progress
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserProgress(ctx.user.id);
  }),

  // Update progress for a theory block
  updateBlockProgress: protectedProcedure
    .input(z.object({
      blockId: z.number(),
      completed: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.updateUserProgress(ctx.user.id, input.blockId, input.completed);
    }),

  // Save trainer result
  saveTrainerResult: protectedProcedure
    .input(z.object({
      trainerId: z.number(),
      score: z.number(),
      totalQuestions: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.saveTrainerResult(ctx.user.id, input.trainerId, input.score, input.totalQuestions);
    }),

  // Get trainer results
  getTrainerResults: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserTrainerResults(ctx.user.id);
  }),

  // Save calculator history
  saveCalculatorHistory: protectedProcedure
    .input(z.object({
      calculatorType: z.string(),
      inputs: z.record(z.string(), z.unknown()),
      results: z.record(z.string(), z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.saveCalculatorHistory(ctx.user.id, input.calculatorType, input.inputs, input.results);
    }),

  // Get calculator history
  getCalculatorHistory: protectedProcedure
    .input(z.object({
      calculatorType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return db.getCalculatorHistory(ctx.user.id, input?.calculatorType);
    }),

  // Save case study note
  saveCaseStudyNote: protectedProcedure
    .input(z.object({
      caseId: z.number(),
      notes: z.string().optional(),
      isBookmarked: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.saveCaseStudyNote(ctx.user.id, input.caseId, input.notes || "", input.isBookmarked);
    }),

  // Get case study notes
  getCaseStudyNotes: protectedProcedure
    .input(z.object({
      caseId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return db.getCaseStudyNotes(ctx.user.id, input?.caseId);
    }),

  // Save interview prep note
  saveInterviewPrepNote: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      isReviewed: z.boolean(),
      notes: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.saveInterviewPrepNote(ctx.user.id, input.questionId, input.isReviewed, input.notes);
    }),

  // Get interview prep notes
  getInterviewPrepNotes: protectedProcedure.query(async ({ ctx }) => {
    return db.getInterviewPrepNotes(ctx.user.id);
  }),
});
