import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import logger from "../utils/logger";
import { Command } from "../Command";
import { defaultColor, errorEmbed } from "../common/embeds";
import checkVoiceChannel from "../common/checkVoiceChannel";
import queue from "../common/queue";

export const Resume: Command = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resumes the queue."),
  run: async (client: Client, interaction: CommandInteraction) => {
    const errorMessage = await checkVoiceChannel(interaction);
    if (errorMessage) {
      await interaction.followUp({
        embeds: [errorEmbed(errorMessage)],
        ephemeral: true,
      });
    } else {
      const guildId = interaction.guildId;
      if (!guildId) {
        await interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
        return;
      }

      const serverQueue = queue.get(guildId);
      if (!serverQueue) {
        await interaction.followUp({
          embeds: [errorEmbed("There is no queue. Add songs with /play")],
          ephemeral: true,
        });
        return;
      }

      if (serverQueue.playing) {
        await interaction.followUp({
          embeds: [errorEmbed("There are songs playing already!")],
          ephemeral: true,
        });
        return;
      }

      const success = serverQueue.audioPlayer.unpause();
      if (!success) {
        logger.trace("Something went wrong with unpausing the queue.");
        await interaction.followUp({
          embeds: [
            errorEmbed(
              "Something went wrong with resuming the song. \nTry using /stop to clear the queue instead."
            ),
          ],
          ephemeral: true,
        });
        return;
      }
      serverQueue.playing = true;
      await interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle("Resumed!")
            .setDescription("The queue is resumed")
            .setColor(defaultColor),
        ],
      });
    }
  },
};
