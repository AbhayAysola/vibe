import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { hyperlink, SlashCommandBuilder } from "@discordjs/builders";

import logger from "../utils/logger";
import { Command } from "../Command";
import { defaultColor, errorEmbed } from "../common/embeds";
import checkVoiceChannel from "../common/checkVoiceChannel";
import queue from "../common/queue";

export const Pause: Command = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses the currently playing song."),
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
          embeds: [errorEmbed("No song is playing!")],
          ephemeral: true,
        });
        return;
      }

      if (!serverQueue.playing) {
        await interaction.followUp({
          embeds: [errorEmbed("No song is playing!")],
          ephemeral: true,
        });
        return;
      }

      const success = serverQueue.audioPlayer.pause();
      if (!success) {
        logger.trace("Something went wrong with pausing the queue.");
        await interaction.followUp({
          embeds: [
            errorEmbed(
              "Something went wrong with pausing the song. \nTry using /stop to clear the queue instead"
            ),
          ],
          ephemeral: true,
        });
        return;
      }
      serverQueue.playing = false;
      await interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle("Paused!")
            .setDescription("The queue is paused")
            .setColor(defaultColor),
        ],
      });
    }
  },
};
