import { CommandInteraction, Client } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export const Ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies to ping with pong!"),
  run: async (client: Client, interaction: CommandInteraction) =>
    await interaction.followUp("pong!"),
};
