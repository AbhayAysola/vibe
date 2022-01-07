import { MessageEmbed } from "discord.js";

export const errorColor = "#ff194b";
export const defaultColor = "#3dc682";
export const errorEmbed = (message?: string): MessageEmbed => {
  return new MessageEmbed()
    .setTitle("Error!")
    .setDescription(message || "An error has occured.")
    .setColor(errorColor);
};
