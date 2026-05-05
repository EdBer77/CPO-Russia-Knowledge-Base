import { google } from "googleapis";
import { ENV } from "../_core/env";

/**
 * Google Drive OAuth2 Service
 * Handles authorization flow and token management
 */

const oauth2Client = new google.auth.OAuth2(
  ENV.googleDriveClientId,
  ENV.googleDriveClientSecret,
  ENV.googleDriveRedirectUri
);

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

/**
 * Generate Google OAuth authorization URL
 * User should visit this URL to grant permissions
 */
export function getGoogleDriveAuthUrl(state: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
    prompt: "consent", // Force consent screen every time
  });
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("No access token received from Google");
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
    };
  } catch (error) {
    console.error("[GoogleDriveOAuth] Token exchange failed:", error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("No access token received from refresh");
    }

    return {
      accessToken: credentials.access_token,
      expiresIn: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
    };
  } catch (error) {
    console.error("[GoogleDriveOAuth] Token refresh failed:", error);
    throw error;
  }
}

/**
 * Validate if token is still valid
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt - 300000; // 5 min buffer
}
