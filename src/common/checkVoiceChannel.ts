import { CommandInteraction, GuildMember } from "discord.js";

import logger from "../utils/logger";

export default async (
  interaction: CommandInteraction
): Promise<string | undefined> => {
  const voiceChannel = (interaction.member as GuildMember).voice.channel;
  const botMember = interaction.guild?.me;

  if (!voiceChannel) {
    return "You have to be in a voice channel to use this command!";
  }
  if (!botMember) {
    logger.error(new Error("botMember is undefined or null"));
    return "An error has occured.";
  }

  const permissions = voiceChannel.permissionsFor(botMember);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return "I need permissions to join and speak in your voice channel!";
  }
};
