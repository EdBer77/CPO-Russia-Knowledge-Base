import { google } from "googleapis";
import { ENV } from "../_core/env";
import * as pdfParseModule from "pdf-parse";

// pdf-parse CommonJS module
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export interface ParsedPDFContent {
  fileName: string;
  fileId: string;
  text: string;
  metadata: {
    pages: number;
    title?: string;
    author?: string;
  };
}

class GoogleDriveService {
  private oauth2Client: any;
  private drive: any;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      ENV.googleDriveClientId,
      ENV.googleDriveClientSecret,
      ENV.googleDriveRedirectUri
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });

    this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
  }

  /**
   * Find folder by name in Google Drive
   */
  async findFolderByName(folderName: string): Promise<string | null> {
    try {
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: "drive",
        fields: "files(id, name)",
        pageSize: 1,
      });

      const files = response.data.files || [];
      return files.length > 0 ? files[0].id : null;
    } catch (error) {
      console.error("[GoogleDrive] Error finding folder:", error);
      throw error;
    }
  }

  /**
   * List all PDF files in a folder
   */
  async listPDFFilesInFolder(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
        spaces: "drive",
        fields: "files(id, name, mimeType, webViewLink)",
        pageSize: 100,
      });

      return response.data.files || [];
    } catch (error) {
      console.error("[GoogleDrive] Error listing PDF files:", error);
      throw error;
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      );

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        response.data.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        response.data.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        response.data.on("error", (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error("[GoogleDrive] Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Parse PDF file and extract text
   */
  async parsePDF(fileBuffer: Buffer, fileName: string, fileId: string): Promise<ParsedPDFContent> {
    try {
      const pdfData = await pdfParse(fileBuffer);

      return {
        fileName,
        fileId,
        text: pdfData.text,
        metadata: {
          pages: pdfData.numpages,
          title: pdfData.info?.Title || fileName,
          author: pdfData.info?.Author,
        },
      };
    } catch (error) {
      console.error(`[GoogleDrive] Error parsing PDF ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Full sync flow: find folder → list PDFs → download → parse
   */
  async syncKnowledgeBase(
    onProgress?: (status: { current: number; total: number; fileName: string; status: string }) => void
  ): Promise<ParsedPDFContent[]> {
    try {
      // Find the CPO_Knowledge-KB folder
      const folderId = await this.findFolderByName("CPO_Knowledge-KB");
      if (!folderId) {
        throw new Error("Folder 'CPO_Knowledge-KB' not found in Google Drive");
      }

      console.log("[GoogleDrive] Found folder:", folderId);

      // List all PDF files
      const pdfFiles = await this.listPDFFilesInFolder(folderId);
      console.log(`[GoogleDrive] Found ${pdfFiles.length} PDF files`);

      const results: ParsedPDFContent[] = [];

      // Download and parse each PDF
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const progress = {
          current: i + 1,
          total: pdfFiles.length,
          fileName: file.name,
          status: "downloading",
        };

        onProgress?.(progress);
        console.log(`[GoogleDrive] Processing ${i + 1}/${pdfFiles.length}: ${file.name}`);

        try {
          // Download file
          const fileBuffer = await this.downloadFile(file.id);

          // Update progress
          onProgress?.({
            ...progress,
            status: "parsing",
          });

          // Parse PDF
          const parsedContent = await this.parsePDF(fileBuffer, file.name, file.id);
          results.push(parsedContent);

          onProgress?.({
            ...progress,
            status: "completed",
          });
        } catch (fileError) {
          console.error(`[GoogleDrive] Failed to process ${file.name}:`, fileError);
          onProgress?.({
            ...progress,
            status: "failed",
          });
          // Continue with next file instead of failing completely
        }
      }

      return results;
    } catch (error) {
      console.error("[GoogleDrive] Sync failed:", error);
      throw error;
    }
  }
}

export function createGoogleDriveService(accessToken: string): GoogleDriveService {
  return new GoogleDriveService(accessToken);
}
