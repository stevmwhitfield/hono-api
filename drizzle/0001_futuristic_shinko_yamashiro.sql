DROP INDEX "idx_user_email";--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "refresh_tokens" USING btree ("user_email");