import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { hyperlink, SlashCommandBuilder } from "@discordjs/builders";

import logger from "../utils/logger";
import { Command } from "../Command";
import { defaultColor, errorEmbed } from "../common/embeds";
import checkVoiceChannel from "../common/checkVoiceChannel";
import getSongData from "../common/getSongData";
import addSongToQueue from "../common/addSongToQueue";

export const Play: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays song of the url in connected voice channel.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("url of the song to be played")
        .setRequired(true)
    ),
  run: async (client: Client, interaction: CommandInteraction) => {
    const errorMessage = await checkVoiceChannel(interaction);
    if (errorMessage) {
      await interaction.followUp({
        embeds: [errorEmbed(errorMessage)],
        ephemeral: true,
      });
    } else {
      const address = interaction.options.getString("url");
      if (!address) {
        logger.error(new Error("url option is undefined or null"));
        await interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
        return;
      }
      const data = await getSongData(address);
      if (!data) {
        await interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
        logger.error(new Error("Invalid url!"));
        return;
      }
      logger.info(data);
      const err = await addSongToQueue(data, interaction);
      if (err) {
        await interaction.followUp({ embeds: [errorEmbed(err.message)] });
      } else {
        await interaction.followUp({
          embeds: [
            new MessageEmbed()
              .setTitle("Added!")
              .setDescription(
                `Added ${hyperlink(data.title, data.url)} to the queue`
              )
              .setColor(defaultColor),
          ],
        });
      }
    }
  },
};
