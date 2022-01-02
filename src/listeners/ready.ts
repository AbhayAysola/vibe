import { Client } from "discord.js";

import logger from "../utils/logger";

export default (client: Client): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) return;
    logger.info(`${client.user.username} is online`);
  });
};
