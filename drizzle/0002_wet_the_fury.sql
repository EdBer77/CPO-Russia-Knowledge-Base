CREATE TABLE `syncedContentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncId` int NOT NULL,
	`contentId` varchar(255) NOT NULL,
	`block` varchar(50) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`isDuplicate` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syncedContentItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syncedFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileId` varchar(255),
	`itemsAdded` int NOT NULL DEFAULT 0,
	`itemsSkipped` int NOT NULL DEFAULT 0,
	`duplicatesFound` int NOT NULL DEFAULT 0,
	`blocksAffected` json NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'completed',
	`errorMessage` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syncedFiles_id` PRIMARY KEY(`id`)
);
