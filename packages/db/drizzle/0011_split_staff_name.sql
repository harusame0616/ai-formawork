-- Split name column into first_name and last_name
ALTER TABLE "staffs" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "staffs" ADD COLUMN "last_name" text;--> statement-breakpoint
-- Note: Existing data will need manual migration. This default copies name to both columns.
UPDATE "staffs" SET "first_name" = "name", "last_name" = '';--> statement-breakpoint
ALTER TABLE "staffs" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "staffs" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "staffs" DROP COLUMN "name";--> statement-breakpoint

-- Rename id column to staff_id
ALTER TABLE "customer_notes" DROP CONSTRAINT "customer_notes_staff_id_staffs_id_fk";--> statement-breakpoint
ALTER TABLE "staffs" RENAME COLUMN "id" TO "staff_id";--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_staff_id_staffs_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("staff_id") ON DELETE cascade ON UPDATE no action;
