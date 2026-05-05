import { describe, expect, it } from "vitest";
import { findDuplicates, calculateSimilarity } from "../services/driveSync";
import type { ContentElement } from "../services/driveSync";

describe("driveSync service", () => {
  describe("findDuplicates", () => {
    it("should identify duplicate items with similar titles", () => {
      const newItems: ContentElement[] = [
        {
          id: "1",
          block: "finance",
          type: "formula",
          title: "DPO Calculation",
          content: "Days Payable Outstanding formula",
          source: "test.pdf",
          tags: ["DPO", "finance"],
          difficulty: "basic",
        },
      ];

      const existingItems: ContentElement[] = [
        {
          id: "existing-1",
          block: "finance",
          type: "formula",
          title: "DPO Calculation",
          content: "Different content",
          source: "existing.txt",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const { duplicates, unique } = findDuplicates(newItems, existingItems);

      expect(duplicates.length).toBeGreaterThan(0);
      expect(unique.length).toBe(0);
    });

    it("should not flag items with different blocks as duplicates", () => {
      const newItems: ContentElement[] = [
        {
          id: "1",
          block: "finance",
          type: "formula",
          title: "DPO Calculation",
          content: "Days Payable Outstanding",
          source: "test.pdf",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const existingItems: ContentElement[] = [
        {
          id: "existing-1",
          block: "inventory",
          type: "formula",
          title: "DPO Calculation",
          content: "Different content",
          source: "existing.txt",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const { duplicates, unique } = findDuplicates(newItems, existingItems);

      expect(duplicates.length).toBe(0);
      expect(unique.length).toBe(1);
    });

    it("should identify unique items", () => {
      const newItems: ContentElement[] = [
        {
          id: "1",
          block: "finance",
          type: "theory",
          title: "Working Capital Management",
          content: "Comprehensive guide",
          source: "test.pdf",
          tags: ["WC", "finance"],
          difficulty: "advanced",
        },
      ];

      const existingItems: ContentElement[] = [
        {
          id: "existing-1",
          block: "finance",
          type: "formula",
          title: "DPO Formula",
          content: "Different item",
          source: "existing.txt",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const { duplicates, unique } = findDuplicates(newItems, existingItems);

      expect(duplicates.length).toBe(0);
      expect(unique.length).toBe(1);
      expect(unique[0].title).toBe("Working Capital Management");
    });

    it("should handle empty existing items", () => {
      const newItems: ContentElement[] = [
        {
          id: "1",
          block: "finance",
          type: "formula",
          title: "DPO Calculation",
          content: "Days Payable Outstanding",
          source: "test.pdf",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const { duplicates, unique } = findDuplicates(newItems, []);

      expect(duplicates.length).toBe(0);
      expect(unique.length).toBe(1);
    });

    it("should handle multiple items with mixed duplicates", () => {
      const newItems: ContentElement[] = [
        {
          id: "1",
          block: "finance",
          type: "formula",
          title: "DPO Calculation",
          content: "Days Payable Outstanding",
          source: "test.pdf",
          tags: ["DPO"],
          difficulty: "basic",
        },
        {
          id: "2",
          block: "inventory",
          type: "theory",
          title: "ABC Analysis",
          content: "Inventory classification",
          source: "test.pdf",
          tags: ["inventory"],
          difficulty: "basic",
        },
      ];

      const existingItems: ContentElement[] = [
        {
          id: "existing-1",
          block: "finance",
          type: "formula",
          title: "DPO Calculation",
          content: "Similar formula",
          source: "existing.txt",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const { duplicates, unique } = findDuplicates(newItems, existingItems);

      expect(duplicates.length).toBe(1);
      expect(unique.length).toBe(1);
      expect(duplicates[0]).toBe("DPO Calculation");
      expect(unique[0].title).toBe("ABC Analysis");
    });
  });

  describe("string similarity", () => {
    it("should calculate similarity between strings", () => {
      // This test verifies the similarity calculation works
      // We can't directly test calculateSimilarity as it's not exported,
      // but we verify it through findDuplicates behavior
      
      const newItems: ContentElement[] = [
        {
          id: "1",
          block: "finance",
          type: "formula",
          title: "DPO",
          content: "Days Payable Outstanding",
          source: "test.pdf",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const existingItems: ContentElement[] = [
        {
          id: "existing-1",
          block: "finance",
          type: "formula",
          title: "DPO",
          content: "Different",
          source: "existing.txt",
          tags: ["DPO"],
          difficulty: "basic",
        },
      ];

      const { duplicates } = findDuplicates(newItems, existingItems);
      expect(duplicates.length).toBeGreaterThan(0);
    });
  });
});
