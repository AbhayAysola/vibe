import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";

import logger from "../utils/logger";
import { Command } from "../Command";
import { errorEmbed, defaultColor } from "../common/embeds";
import checkVoiceChannel from "../common/checkVoiceChannel";
import queue from "../common/queue";

export const Stop: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Clears the queue and disconnects from the voice channel."),
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.guildId) {
      interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    if (await checkVoiceChannel(interaction)) {
      const serverQueue = queue.get(interaction.guildId || "");
      if (!serverQueue) {
        await interaction.followUp({
          embeds: [errorEmbed("I am not connected to a voice channel!")],
          ephemeral: true,
        });
        return;
      }
      serverQueue?.connection?.destroy();
      logger.info("Destroying connection");
      queue.delete(interaction.guildId || "");
      interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle("Disconnected")
            .setDescription("Bot has cleared the queue.")
            .setColor(defaultColor),
        ],
      });
    }
  },
};
