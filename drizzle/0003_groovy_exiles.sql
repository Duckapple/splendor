CREATE TABLE `SplendorAction` (
	`gameId` char(36) NOT NULL,
	`userId` char(36) NOT NULL,
	`timestamp` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`SplendorActionType` enum('BUY_CARD','TAKE_PERSON','TAKE_TOKENS','RESERVE') NOT NULL,
	`data` json NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SplendorRoom` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`ownerId` char(36) NOT NULL,
	`started` boolean DEFAULT false,
	`createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `SplendorRoom_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `SplendorGame` MODIFY COLUMN `id` char(36) NOT NULL;