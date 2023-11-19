ALTER TABLE `SplendorGame` MODIFY COLUMN `shown` json NOT NULL DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}');--> statement-breakpoint
ALTER TABLE `SplendorGame` MODIFY COLUMN `piles` json NOT NULL DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}');--> statement-breakpoint
ALTER TABLE `SplendorGame` MODIFY COLUMN `tokens` json NOT NULL DEFAULT ('[0,0,0,0,0,0]');--> statement-breakpoint
ALTER TABLE `SplendorGame` MODIFY COLUMN `turn` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `SplendorGame` ADD `playerCount` tinyint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `SplendorGamePlayer` ADD `reserved` json DEFAULT ('[]') NOT NULL;