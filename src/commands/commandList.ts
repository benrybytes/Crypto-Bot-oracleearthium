import {
  Interaction,
  SlashCommandBuilder,
  CommandInteraction,
} from "discord.js";
import sendUserTopCurrencies from "../handlers/crypto";

export interface ICommand {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void> | void;
}

// List of commands registered with handlers and data containined to show on discord
let commandList: ICommand[] = [
  {
    data: new SlashCommandBuilder()
      .setName("get_current_prices")
      .setDescription("Display a crypto currency list"),
    async execute(interaction: CommandInteraction) {
      sendUserTopCurrencies(interaction);
    },
  },
];

export default commandList;

function quickSort(array: number[]): number[] {
  // base case
  if (array.length <= 1) {
    return array; // return the array value to concat
  }

  const pivot = array[0]; // Ignore this number on every recursion, we don't want the same number as we want to take out one number and split the arrays

  // Split the arrays to two halves
  const left = [];
  const right = [];

  for (let i = 1; i < array.length; i++) {
    // Pivot as the main comparison
    if (array[i] < pivot) {
      left.push(array[i]);
    } else {
      right.push(array[i]);
    }
  }

  return quickSort(left).concat(pivot, quickSort(right));
}
