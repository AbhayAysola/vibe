import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { hyperlink, SlashCommandBuilder, time } from "@discordjs/builders";

import { Command } from "../Command";
import { defaultColor, errorEmbed, queue, song } from "../Common";

function formatSongs(client: Client, songs?: song[]): MessageEmbed {
  const embed = new MessageEmbed().setTitle("Queue").setColor(defaultColor);
  if (songs) {
    embed.setDescription(
      songs
        .map((song, i) => `${i + 1}. ${hyperlink(song.title, song.url)}`)
        .join("\n")
    );
  } else {
    embed.setDescription("No songs are playing!");
  }
  return embed;
}

export const Queue: Command = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Get currently playing queue information"),
  run: async (client: Client, interaction: CommandInteraction) => {
    interaction.guildId;
    if (!interaction.guildId) {
      console.log("guildId doesn't exist");
      interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    const serverQueue = queue.get(interaction.guildId);
    const songs = serverQueue?.nowPlaying
      ? serverQueue.songs.concat(serverQueue.nowPlaying)
      : serverQueue?.songs;
    interaction.followUp({ embeds: [formatSongs(client, songs?.reverse())] });
  },
};
