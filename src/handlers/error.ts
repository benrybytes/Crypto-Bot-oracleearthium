import { EmbedBuilder } from "discord.js";


const createErrorEmbed = (message: string): EmbedBuilder => {
  const errorEmbed = new EmbedBuilder()
    .setColor("#ed053f")
    .setTitle("Error")
    .setDescription(`An error occurred: ${message}`);

  return errorEmbed;
};

export {
  createErrorEmbed
}