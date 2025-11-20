ALTER TABLE "customer_note_images" RENAME COLUMN "image_url" TO "path";--> statement-breakpoint
ALTER TABLE "customer_note_images" DROP COLUMN "alternative_text";--> statement-breakpoint
ALTER TABLE "customer_note_images" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "customer_note_images" DROP COLUMN "file_size";