import { CommandInteraction, Client } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export interface Command {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  run: (client: Client, interaction: CommandInteraction) => void;
}
