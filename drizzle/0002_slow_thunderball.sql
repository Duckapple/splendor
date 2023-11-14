ALTER TABLE `Push` MODIFY COLUMN `userId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `SplendorGamePlayer` MODIFY COLUMN `userId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `SplendorGamePlayer` MODIFY COLUMN `gameId` char(36) NOT NULL;