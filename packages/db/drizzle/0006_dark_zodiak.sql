DROP INDEX "idx_customer_note_images_customer_note_id";--> statement-breakpoint
ALTER TABLE "customer_note_images" ADD CONSTRAINT "customer_note_images_customer_note_id_display_order_pk" PRIMARY KEY("customer_note_id","display_order");--> statement-breakpoint
ALTER TABLE "customer_note_images" DROP COLUMN "id";