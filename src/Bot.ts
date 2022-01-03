import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import play from "play-dl";

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

play.setToken({
  youtube: {
    cookie: process.env.youtube_cookie || "",
  },
  spotify: {
    client_id: process.env.spotify_client_id || "",
    client_secret: process.env.spotify_client_secret || "",
    refresh_token: process.env.spotify_refresh_token || "",
    market: "IN",
  },
});

// https://discord.com/api/oauth2/authorize?client_id=926462122165166180&permissions=2150631424&scope=bot%20applications.commands
