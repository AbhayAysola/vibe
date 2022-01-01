import { CommandInteraction, Client } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { checkVoiceChannel, getSongData, addSongToQueue } from "../Common";

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
    if (await checkVoiceChannel(interaction)) {
      const data = await getSongData(interaction);
      if (!data) {
        await interaction.followUp("An error has occured.");
        return;
      }
      await addSongToQueue(data, interaction);
    }
  },
};
