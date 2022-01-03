import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const commands: any = [];
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".ts"));

const rest = new REST({ version: "9" }).setToken(process.env.token || "");

for (const file of commandFiles) {
  import(`../commands/${file}`).then((command) => {
    console.log(command);
    commands.push(command[file.slice(0, -3)].data.toJSON());
    rest
      .put(
        process.env.dev === "true"
          ? Routes.applicationGuildCommands(
              process.env.client_id || "",
              process.env.guild_id || ""
            )
          : Routes.applicationCommands(process.env.client_id || ""),
        { body: commands }
      )
      .then(() => console.log("Successfully registered application commands."))
      .catch(console.error);
  });
}
