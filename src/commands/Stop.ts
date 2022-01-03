import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import logger from "../utils/logger";

import { Command } from "../Command";
import { queue, errorEmbed, checkVoiceChannel, defaultColor } from "../Common";

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
      serverQueue?.audioPlayer?.removeAllListeners();
      logger.info("Disconnecting");
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
