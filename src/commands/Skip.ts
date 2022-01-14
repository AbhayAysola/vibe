import { CommandInteraction, Client, MessageEmbed } from "discord.js";
import { hyperlink, SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { defaultColor, errorEmbed } from "../common/embeds";
import queue from "../common/queue";
import playSong from "../common/playSong";

export const Skip: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next song in the queue"),
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.guildId) {
      console.log("guildId doesn't exist");
      interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    const serverQueue = queue.get(interaction.guildId);
    if (!serverQueue) {
      interaction.followUp({
        embeds: [errorEmbed("The queue is empty")],
        ephemeral: true,
      });
      return;
    }
    const songMessage = await playSong(
      interaction.guildId,
      serverQueue.songs[0]
    );
    if (songMessage) {
      interaction.followUp({
        embeds: [errorEmbed(songMessage.message)],
        ephemeral: true,
      });
      return;
    }
    interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setTitle("Skipped")
          .setDescription(
            `Now playing: ${hyperlink(
              serverQueue.nowPlaying?.title || "",
              serverQueue.nowPlaying?.url || ""
            )}`
          )
          .setColor(defaultColor),
      ],
    });
  },
};
