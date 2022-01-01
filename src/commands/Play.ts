import { CommandInteraction, Client } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

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
    const url = interaction.options.getString("url");
    if (!url) {
      await interaction.followUp("An error has occured");
      return;
    }
    await interaction.followUp(url);
  },
};
