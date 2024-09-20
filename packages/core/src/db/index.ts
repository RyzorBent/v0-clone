import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Resource } from "sst";
import { chats, chatsRelations } from "../chat/chat.sql";
import { messages, messagesRelations } from "../messages/message.sql";

const schema = {
  chats,
  chatsRelations,
  messages,
  messagesRelations,
};

const client = neon(Resource.DatabaseURL.value);
export const db = drizzle(client, { schema });
