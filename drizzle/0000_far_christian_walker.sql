CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_email" varchar NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" char(128) NOT NULL,
	"salt" char(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_email" ON "refresh_tokens" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "idx_is_revoked" ON "refresh_tokens" USING btree ("is_revoked");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_email" ON "users" USING btree ("email");