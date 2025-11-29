ALTER TABLE "staffs" ADD COLUMN "auth_user_id" uuid;--> statement-breakpoint
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_auth_user_id_unique" UNIQUE("auth_user_id");