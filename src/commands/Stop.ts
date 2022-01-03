import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";

import { Command } from "../Command";
import {
  disconnect,
  errorEmbed,
  checkVoiceChannel,
  defaultColor,
} from "../Common";

export const Stop: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Clears the queue and disconnects from the voice channel."),
  run: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.guildId) {
      interaction.followUp({ embeds: [errorEmbed()], ephemeral: true });
      return;
    }
    if (await checkVoiceChannel(interaction)) {
      disconnect(interaction);
    }
  },
};
