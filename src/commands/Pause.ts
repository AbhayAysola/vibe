import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";

import { Command } from "../Command";
import { queue, errorEmbed, defaultColor } from "../Common";

export const Pause: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the currently playing song"),
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.guildId) {
      interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    const serverQueue = queue.get(interaction.guildId);
    if (!serverQueue) {
      await interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    const success = serverQueue?.audioPlayer?.pause();
    if (!success) {
      await interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    serverQueue.paused = success;
    await interaction.followUp(
      success
        ? {
            embeds: [
              new MessageEmbed()
                .setTitle("Paused")
                .setDescription("Paused queue")
                .setColor(defaultColor),
            ],
          }
        : {
            embeds: [errorEmbed("Error trying to pause queue.")],
            ephemeral: true,
          }
    );
  },
};
