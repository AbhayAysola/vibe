import { BaseCommandInteraction, Client } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export interface Command {
  data: SlashCommandBuilder;
  run: (client: Client, interaction: BaseCommandInteraction) => void;
}
