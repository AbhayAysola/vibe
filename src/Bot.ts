import dotenv from "dotenv";
import { Client, Collection, Intents } from "discord.js";

import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";

dotenv.config();
const token = process.env.token;
export const commands = new Collection();

console.log("Bot is starting...");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

ready(client);
interactionCreate(client);

client.login(token);
