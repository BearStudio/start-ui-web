CREATE TABLE "email_status" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"provider" text NOT NULL,
	"externalId" text,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"idempotencyKey" text,
	"lastWebhookEventId" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_status_provider_external_id_key" ON "email_status" USING btree ("provider","externalId");--> statement-breakpoint
CREATE INDEX "email_status_status_idx" ON "email_status" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_status_created_at_idx" ON "email_status" USING btree ("createdAt");