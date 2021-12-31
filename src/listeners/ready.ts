import { Client } from "discord.js";
import { commands } from "../Bot";
import { Commands } from "../Commands";

export default (client: Client): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) return;
    Commands.forEach((command) => commands.set(command.data.name, command));
    console.log(`${client.user.username} is online`);
  });
};
