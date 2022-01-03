import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";

import { Commands } from "../Commands";

dotenv.config({ path: "./.env" });

const rest = new REST({ version: "9" }).setToken(process.env.token || "");

rest
  .put(
    process.env.dev === "true"
      ? Routes.applicationGuildCommands(
          process.env.client_id || "",
          process.env.guild_id || ""
        )
      : Routes.applicationCommands(process.env.client_id || ""),
    { body: Commands.map((command) => command.data.toJSON()) }
  )
  .then((res) => console.log(res))
  .catch(console.error);
