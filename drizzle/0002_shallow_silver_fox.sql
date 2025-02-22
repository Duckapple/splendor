ALTER TABLE "SplendorRoom" ADD COLUMN "ended" boolean DEFAULT false;
UPDATE "SplendorRoom" SET "ended" = true WHERE "SplendorRoom"."id" IN (SELECT "id" FROM "SplendorGame" WHERE "phase" = 2);
