import dotenv from "dotenv";
import { Client, Intents, Presence, PresenceManager } from "discord.js";

import logger from "./utils/logger";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";

dotenv.config();
const token = process.env.token;

logger.info("Bot is starting...");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});

ready(client);
interactionCreate(client);

client.login(token);
