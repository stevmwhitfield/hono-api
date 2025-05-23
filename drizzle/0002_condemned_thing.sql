DROP INDEX "idx_user_id";--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "refresh_tokens" USING btree ("user_id");