import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import logger from "../utils/logger";
import { Command } from "../Command";
import {
  checkVoiceChannel,
  getSongData,
  addSongToQueue,
  errorEmbed,
  queue,
  defaultColor,
} from "../Common";

export const Play: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays song of the url in connected voice channel.")
    .addStringOption((option) =>
      option.setName("url").setDescription("url of the song to be played")
    ),
  run: async (client: Client, interaction: CommandInteraction) => {
    if (await checkVoiceChannel(interaction)) {
      if (!interaction.options.getString("url")) {
        if (!interaction?.guildId) {
          await interaction.followUp({
            embeds: [errorEmbed()],
            ephemeral: true,
          });
          return;
        }
        const serverQueue = queue.get(interaction?.guildId);
        if (!serverQueue) {
          await interaction.followUp({
            embeds: [errorEmbed("Enter the url of a song!")],
            ephemeral: true,
          });
          return;
        }

        const success = serverQueue?.audioPlayer?.unpause();
        if (!success) {
          await interaction.followUp({
            embeds: [errorEmbed()],
            ephemeral: true,
          });
          return;
        }
        serverQueue.paused = !success;
        await interaction.followUp(
          success
            ? {
                embeds: [
                  new MessageEmbed()
                    .setTitle("Play")
                    .setDescription("Resumed queue")
                    .setColor(defaultColor),
                ],
              }
            : {
                embeds: [errorEmbed("Error trying to play queue.")],
                ephemeral: true,
              }
        );
        return;
      }
      const data = await getSongData(interaction);
      if (!data) {
        await interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
        logger.error(new Error("No song data"));
        return;
      }
      await addSongToQueue(data, interaction);
    }
  },
};
