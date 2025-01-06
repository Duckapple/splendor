CREATE TABLE `Push` (
	`userId` text NOT NULL,
	`keys` text NOT NULL,
	`endpoint` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SplendorAction` (
	`gameId` text NOT NULL,
	`userId` text NOT NULL,
	`timestamp` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SplendorGame` (
	`id` text PRIMARY KEY NOT NULL,
	`shown` text DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}') NOT NULL,
	`piles` text DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}') NOT NULL,
	`tokens` text DEFAULT ('[0,0,0,0,0,0]') NOT NULL,
	`turn` integer DEFAULT 0 NOT NULL,
	`playerCount` integer NOT NULL,
	`phase` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SplendorGamePlayer` (
	`userId` text NOT NULL,
	`gameId` text NOT NULL,
	`position` integer NOT NULL,
	`reserved` text DEFAULT ('[]') NOT NULL,
	`cards` text DEFAULT ('[]') NOT NULL,
	`tokens` text DEFAULT ('[0,0,0,0,0,0]') NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SplendorRoom` (
	`id` text PRIMARY KEY NOT NULL,
	`ownerId` text NOT NULL,
	`started` integer DEFAULT false,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`bcrypt` text(60) NOT NULL,
	`userName` text(64) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `userIdIndex` ON `Push` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_userName_unique` ON `User` (`userName`);--> statement-breakpoint
CREATE INDEX `idIndex` ON `User` (`id`);