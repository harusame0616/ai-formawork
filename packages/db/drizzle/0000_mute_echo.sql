CREATE TABLE "customers" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"customer_id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_note_images" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"customer_note_id" uuid NOT NULL,
	"display_order" integer NOT NULL,
	"path" text NOT NULL,
	CONSTRAINT "customer_note_images_customer_note_id_display_order_pk" PRIMARY KEY("customer_note_id","display_order")
);
--> statement-breakpoint
CREATE TABLE "customer_notes" (
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"customer_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staffs" (
	"auth_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"staff_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staffs_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
ALTER TABLE "customer_note_images" ADD CONSTRAINT "customer_note_images_customer_note_id_customer_notes_id_fk" FOREIGN KEY ("customer_note_id") REFERENCES "customer_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_staff_id_staffs_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "staffs"("staff_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_customer_notes_customer_created" ON "customer_notes" USING btree ("customer_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_customer_notes_staff_id" ON "customer_notes" USING btree ("staff_id");
