DO $$ BEGIN
 CREATE TYPE "SplendorActionType" AS ENUM('BUY_CARD', 'TAKE_PERSON', 'TAKE_TOKENS', 'RESERVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Push" (
	"userId" uuid NOT NULL,
	"keys" json NOT NULL,
	"endpoint" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SplendorAction" (
	"gameId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"type" "SplendorActionType" NOT NULL,
	"data" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SplendorGame" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shown" json DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}') NOT NULL,
	"piles" json DEFAULT ('{"high":[],"middle":[],"low":[],"persons":[]}') NOT NULL,
	"tokens" json DEFAULT ('[0,0,0,0,0,0]') NOT NULL,
	"turn" smallint DEFAULT 0 NOT NULL,
	"playerCount" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SplendorGamePlayer" (
	"userId" uuid NOT NULL,
	"gameId" uuid NOT NULL,
	"position" smallint NOT NULL,
	"reserved" json DEFAULT ('[]') NOT NULL,
	"cards" json DEFAULT ('[]') NOT NULL,
	"tokens" json DEFAULT ('[0,0,0,0,0,0]') NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SplendorRoom" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" uuid NOT NULL,
	"started" boolean DEFAULT false,
	"createdAt" timestamp (0) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (0) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bcrypt" char(60) NOT NULL,
	"userName" varchar(64) NOT NULL,
	CONSTRAINT "User_userName_unique" UNIQUE("userName")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userIdIndex" ON "Push" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idIndex" ON "User" ("id");