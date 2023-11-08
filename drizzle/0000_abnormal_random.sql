CREATE TABLE `Push` (
	`userId` char(36) NOT NULL DEFAULT (UUID()),
	`keys` json,
	`endpoint` text
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`bcrypt` char(60) NOT NULL,
	`userName` varchar(64) NOT NULL,
	CONSTRAINT `User_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userIdIndex` ON `Push` (`userId`);--> statement-breakpoint
CREATE INDEX `userNameIndex` ON `User` (`userName`);--> statement-breakpoint
CREATE INDEX `idIndex` ON `User` (`id`);