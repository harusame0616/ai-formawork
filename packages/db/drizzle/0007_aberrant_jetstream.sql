ALTER TABLE "customers" ALTER COLUMN "customer_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "phone" SET NOT NULL;