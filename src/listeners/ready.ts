import { Client } from "discord.js";

import logger from "../utils/logger";

export default (client: Client): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) return;
    // client.user.setAvatar('URL or path');
    client.user?.setActivity("timepass", { type: "LISTENING" });
    client.user?.setStatus("dnd");
    logger.info(`${client.user.username} is online`);
  });
};
