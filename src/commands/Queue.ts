import { CommandInteraction, Client } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { queue } from "../Common";

export const Queue: Command = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Get currently playing queue information"),
  run: async (client: Client, interaction: CommandInteraction) => {
    interaction.guildId;
    if (!interaction.guildId) {
      console.log("guildId doesn't exist");
      interaction.followUp("An error has occured.");
      return;
    }
    const serverQueue = queue.get(interaction.guildId);
    const songs = serverQueue?.nowPlaying
      ? serverQueue.songs.concat(serverQueue.nowPlaying)
      : serverQueue?.songs;
    interaction.followUp(
      songs?.map((song) => song.title).join(", ") || "No songs are playing"
    );
  },
};
