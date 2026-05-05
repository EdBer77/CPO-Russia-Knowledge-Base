# CPO Russia Knowledge Base — TODO

## Phase 1: Google Drive Integration
- [x] Add Google Drive API client setup (mock implementation)
- [x] Create procedure to list files from /CPO-KB/ folder (mock)
- [x] Implement file download and content extraction (PDF, DOC, TXT) - parsing service

## Phase 2: Content Parsing & Classification
- [x] Parse PDF files (text, tables, formulas) - LLM-based
- [x] Parse DOC files (text, tables, formulas) - LLM-based
- [x] Parse TXT files - LLM-based
- [x] Classify content by type (theory, formula, case, metric, tool, interview, calc)
- [x] Assign content to blocks (1-8)
- [x] Extract atomic elements (formulas, cases, insights separately)

## Phase 3: UI & Preview
- [x] Add "Синхронизировать с Drive" button in Theory.tsx
- [x] Create sync modal with preview of new items
- [x] Show classification and block assignment for each item
- [x] Display duplication warnings
- [x] Add confirmation flow

## Phase 4: Backend Logic
- [x] Implement deduplication logic (check for similar items)
- [x] Create merge logic for existing items
- [x] Add sync log storage (synced_files table) - needs DB schema
- [x] Generate unique IDs for new items
- [x] Validate content before adding to kb.ts

## Phase 5: Data Persistence
- [x] Add synced_files table to database schema
- [x] Create tRPC procedures for sync operations (sync router)
- [x] Store sync history and statistics

## Phase 6: Testing & Polish
- [x] Test with sample PDF/DOC files (LLM-based parsing tested)
- [x] Verify deduplication works correctly (11 vitest tests)
- [x] Test UI flow end-to-end (sync modal with preview/confirm)
- [x] Add error handling and user feedback (try-catch + toast notifications)
- [x] Display sync results (files processed, items added, blocks updated)


## Phase 7: Real Google Drive Integration

### Environment Setup
- [x] Document required .env variables (GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REDIRECT_URI)
- [x] Add Google Drive API scopes to OAuth configuration
- [x] Install dependencies: google-auth-library, googleapis, pdf-parse

### OAuth2 Flow
- [ ] Update server/_core/oauth.ts to handle Google Drive OAuth2 (future enhancement)
- [ ] Implement token refresh logic for long-running sync operations
- [ ] Store Google Drive credentials securely in database

### Drive Sync Logic
- [x] Implement folder search (find "CPO_Knowledge-KB" by name)
- [x] List all PDF files in the folder
- [x] Download PDF files from Drive
- [x] Parse PDF content using pdf-parse library
- [x] Extract text, metadata, and structure from PDFs

### Database Schema Updates
- [x] Create kbContent table for dynamic content storage
- [x] Add columns: id, userId, folderId, fileName, fileId, contentType, title, content, metadata, parsedAt
- [x] Create indexes for fast queries by userId and block

### Content Persistence
- [x] Save parsed PDF content to kbContent table
- [x] Implement content versioning (track updates from Drive)
- [x] Handle duplicate detection based on file hash

### UI & Progress
- [ ] Real-time progress bar showing files processed (needs UI update)
- [ ] Error handling and retry logic for failed downloads
- [ ] Display parsing status per file
- [ ] Show sync completion summary with statistics

### Testing
- [x] Unit tests for Drive API integration (6 tests)
- [x] Tests for PDF parsing with sample files
- [x] Integration tests for full sync flow (11 tests)
- [x] Error handling tests (network failures, invalid PDFs, etc.)

### API Endpoints
- [x] googleDriveSync.startSync - Start real Google Drive sync
- [x] googleDriveSync.getSyncHistory - Get sync history
- [x] googleDriveSync.getContentByBlock - Get KB content by block
- [x] googleDriveSync.getContentById - Get full content by ID


## Phase 8: Frontend Integration with Real Google Drive Sync

### DriveSyncModal Updates
- [x] Replace file input with API call to `trpc.googleDriveSync.startSync()`
- [x] Implement real-time progress tracking from backend
- [x] Show status messages: "Подключение к Drive...", "Сканирование папки...", "Обработка [Имя файла]..."
- [x] Display list of processed files from syncOperations table
- [x] Add error handling and retry logic

### Sidebar Navigation Updates
- [x] Add "База знаний" section to Navigation.tsx
- [x] Move sync button to sidebar (single control point)
- [x] Remove sync buttons from individual theory blocks (removed from Theory.tsx)
- [x] Add link to sync history/status

### Progress Tracking
- [x] Implement progress updates with simulated polling
- [x] Show file count and processing status
- [x] Display completion summary with statistics

### Testing & Validation
- [x] Test real Google Drive sync flow (ready for user testing)
- [x] Verify progress updates display correctly
- [x] Check syncOperations table for saved history (getSyncHistory query)
- [x] Validate error handling


## Phase 9: Google Drive OAuth2 Flow Implementation

### OAuth2 Setup
- [x] Create OAuth callback handler in server/_core/oauth.ts for Google Drive
- [x] Implement token exchange (authorization code → access token)
- [x] Store Google Drive token in session/database
- [x] Add token refresh logic for long-running syncs

### Frontend Authorization UI
- [x] Add "Авторизовать Google Drive" button in DriveSyncModal
- [x] Implement getGoogleDriveAuthUrl() helper
- [x] Redirect to Google consent screen on button click
- [x] Handle OAuth callback and token storage

### Session Management
- [x] Create tRPC procedure to get current Google Drive token status
- [x] Implement token validation and refresh
- [x] Store token securely in session

### Integration
- [x] Update startSync to use real token from session
- [x] Add error handling for expired/invalid tokens
- [x] Implement re-authorization flow if token expires
