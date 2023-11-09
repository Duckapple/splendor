CREATE TABLE `SplendorGame` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`shown` json DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}'),
	`piles` json DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}'),
	`tokens` json DEFAULT ('[0,0,0,0,0,0]'),
	`turn` tinyint DEFAULT 0,
	CONSTRAINT `SplendorGame_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `SplendorGamePlayer` (
	`userId` char(36) NOT NULL DEFAULT (UUID()),
	`gameId` char(36) NOT NULL DEFAULT (UUID()),
	`position` tinyint NOT NULL,
	`cards` json NOT NULL DEFAULT ('[]')
);
--> statement-breakpoint
DROP INDEX `userNameIndex` ON `User`;--> statement-breakpoint
ALTER TABLE `Push` MODIFY COLUMN `keys` json NOT NULL;--> statement-breakpoint
ALTER TABLE `Push` MODIFY COLUMN `endpoint` text NOT NULL;--> statement-breakpoint
ALTER TABLE `User` ADD CONSTRAINT `User_userName_unique` UNIQUE(`userName`);