import {
  CommandInteraction,
  Client,
  Interaction,
  MessageEmbed,
} from "discord.js";

import { Commands } from "../Commands";
import { errorEmbed } from "../Common";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    await handleSlashCommand(client, interaction);
  });
};

const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction
): Promise<void> => {
  const slashCommand = Commands.find(
    (c) => c.data.name === interaction.commandName
  );
  if (!slashCommand) {
    interaction.reply({ embeds: [errorEmbed] });
    return;
  }
  await interaction.deferReply();
  slashCommand.run(client, interaction);
};
