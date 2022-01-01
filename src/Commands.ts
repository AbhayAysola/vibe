import { Command } from "./Command";
import { Ping } from "./commands/Ping";
import { Play } from "./commands/Play";

export const Commands: Command[] = [Ping, Play];
