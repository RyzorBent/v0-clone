DO $$ BEGIN
 CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'tool');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "p4_chats" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"user_id" varchar(255) NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "p4_messages" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text,
	"tool_call_id" varchar(255),
	"tool_calls" jsonb,
	"context" jsonb,
	"metadata" jsonb,
	"chat_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "p4_messages" ADD CONSTRAINT "p4_messages_chat_id_p4_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."p4_chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
