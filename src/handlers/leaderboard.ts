import { CommandInteraction, EmbedBuilder } from "discord.js";
import makePostRequest from "../helpers/postHandler";
import { discord_express_url } from "../constants/baseurl";
import IPostResponse from "../interfaces/post_response.interface";
import IUserBetting from "../interfaces/user_betting.interface";
import makeGetRequest from "../helpers/makeGetRequest";
import IUser from "../interfaces/users.interface";
import quickSort from "../helpers/quickSort";

const createErrorEmbed = (message: string): EmbedBuilder => {
  const errorEmbed = new EmbedBuilder()
    .setColor("#ed053f")
    .setTitle("Error")
    .setDescription(`An error occurred: ${message}`);

  return errorEmbed;
};

const displayLeaderboard = async (interaction: CommandInteraction) => {
  try {
    // Handle requests to server for adding users to betting pool
    const response: IPostResponse<any> = await makeGetRequest<any>(
      discord_express_url + "/get-users?serverId=" + interaction.guildId,
    )
      .then((res) => {
        return { data_response: res.data_response, error: null };
      })
      .catch((e) => {
        console.error("error from server: ", e);
        throw new Error(e);
      });

    if (response.error !== null) {
      return interaction.reply({
        embeds: [createErrorEmbed(response.error.message)],
        ephemeral: true,
      });
    }

    console.log("response from post from bet: ", response.data_response);

    const users_betting: IUser[] = await response.data_response!.then((res) => {
      return res[0].users;
    });
    const get_highest_scores = quickSort<IUser>(users_betting, "points");

    const highestEmbed = new EmbedBuilder()
      .setTitle("Top users points")
      .setColor("#3498db")
      .addFields(
        get_highest_scores.map((user: IUser) => ({
          name: `User: ${user.username}`,
          value: `Points: ${user.points}`,
        })),
      );

    return interaction.reply({
      embeds: [highestEmbed],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error processing slash command:", error);
    return error;
  }
};

export default displayLeaderboard;
