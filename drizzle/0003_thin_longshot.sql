CREATE TABLE `kbContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileId` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`block` varchar(50) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`metadata` json NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kbContent_id` PRIMARY KEY(`id`),
	CONSTRAINT `kbContent_fileId_unique` UNIQUE(`fileId`)
);
--> statement-breakpoint
CREATE TABLE `syncOperations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`folderName` varchar(255) NOT NULL,
	`folderId` varchar(255),
	`filesProcessed` int NOT NULL DEFAULT 0,
	`filesSuccessful` int NOT NULL DEFAULT 0,
	`filesFailed` int NOT NULL DEFAULT 0,
	`contentItemsAdded` int NOT NULL DEFAULT 0,
	`contentItemsUpdated` int NOT NULL DEFAULT 0,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syncOperations_id` PRIMARY KEY(`id`)
);
