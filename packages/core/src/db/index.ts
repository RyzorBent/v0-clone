import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Resource } from "sst";
import { Chat, chatRelations } from "../chat/chat.sql";
import { Message, messageRelations } from "../messages/message.sql";

const schema = {
  Chat,
  chatRelations,
  Message,
  messageRelations,
};

const client = neon(Resource.DATABASE_URL.value);
export const db = drizzle(client, { schema });

export { Chat, Message };
