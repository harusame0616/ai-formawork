CREATE TABLE "staffs" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_notes" RENAME COLUMN "created_by" TO "staff_id";--> statement-breakpoint
ALTER TABLE "customer_note_images" ADD COLUMN "alternative_text" text;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_staff_id_staffs_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staffs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_customer_note_images_customer_note_id" ON "customer_note_images" USING btree ("customer_note_id");--> statement-breakpoint
CREATE INDEX "idx_customer_notes_customer_created" ON "customer_notes" USING btree ("customer_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_customer_notes_staff_id" ON "customer_notes" USING btree ("staff_id");