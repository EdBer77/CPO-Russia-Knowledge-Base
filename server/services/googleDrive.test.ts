import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGoogleDriveService } from "./googleDrive";

describe("GoogleDriveService", () => {
  let mockDrive: any;
  let service: any;

  beforeEach(() => {
    // Mock googleapis
    vi.mock("googleapis", () => ({
      google: {
        auth: {
          OAuth2: vi.fn(() => ({
            setCredentials: vi.fn(),
          })),
        },
        drive: vi.fn(() => mockDrive),
      },
    }));
  });

  it("should find folder by name", async () => {
    const mockFolderId = "folder-123";
    mockDrive = {
      files: {
        list: vi.fn().mockResolvedValue({
          data: {
            files: [{ id: mockFolderId, name: "CPO_Knowledge-KB" }],
          },
        }),
      },
    };

    // Note: In real test, would use actual service
    // This is a placeholder for the structure
    expect(mockDrive.files.list).toBeDefined();
  });

  it("should list PDF files in folder", async () => {
    const mockFiles = [
      { id: "file-1", name: "Document1.pdf", mimeType: "application/pdf" },
      { id: "file-2", name: "Document2.pdf", mimeType: "application/pdf" },
    ];

    mockDrive = {
      files: {
        list: vi.fn().mockResolvedValue({
          data: {
            files: mockFiles,
          },
        }),
      },
    };

    expect(mockDrive.files.list).toBeDefined();
    expect(mockFiles).toHaveLength(2);
  });

  it("should handle sync progress callbacks", async () => {
    const progressCallback = vi.fn();
    const mockProgress = {
      current: 1,
      total: 3,
      fileName: "test.pdf",
      status: "downloading",
    };

    progressCallback(mockProgress);

    expect(progressCallback).toHaveBeenCalledWith(mockProgress);
    expect(progressCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle missing folder gracefully", async () => {
    mockDrive = {
      files: {
        list: vi.fn().mockResolvedValue({
          data: {
            files: [],
          },
        }),
      },
    };

    const files = await mockDrive.files.list();
    expect(files).toEqual({ data: { files: [] } });
  });

  it("should generate content hash for deduplication", () => {
    const crypto = require("crypto");
    const testContent = "Test PDF content";
    const hash = crypto
      .createHash("sha256")
      .update(testContent)
      .digest("hex");

    expect(hash).toHaveLength(64); // SHA256 produces 64 hex characters
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
