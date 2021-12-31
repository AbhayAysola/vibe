import { BaseCommandInteraction, Client, Interaction } from "discord.js";
import { Commands } from "../Commands";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    await handleSlashCommand(client, interaction);
  });
};

const handleSlashCommand = async (
  client: Client,
  interaction: BaseCommandInteraction
): Promise<void> => {
  const slashCommand = Commands.find(
    (c) => c.data.name === interaction.commandName
  );
  if (!slashCommand) {
    interaction.reply("An error has occured.");
    return;
  }
  await interaction.deferReply();
  slashCommand.run(client, interaction);
};
