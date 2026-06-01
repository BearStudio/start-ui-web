CREATE TYPE "public"."AuthProvider" AS ENUM('better-auth', 'workos');--> statement-breakpoint
CREATE TABLE "auth_identity" (
	"provider" "AuthProvider" NOT NULL,
	"providerUserId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "auth_identity_provider_provider_user_id_pk" PRIMARY KEY("provider","providerUserId")
);
--> statement-breakpoint
ALTER TABLE "auth_identity" ADD CONSTRAINT "auth_identity_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_identity_user_id_idx" ON "auth_identity" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identity_provider_user_id_key" ON "auth_identity" USING btree ("provider","userId");--> statement-breakpoint
INSERT INTO "auth_identity" ("provider", "providerUserId", "userId")
SELECT 'better-auth', "id", "id"
FROM "user"
ON CONFLICT DO NOTHING;
