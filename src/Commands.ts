import { Command } from "./Command";
import { Queue } from "./commands/Queue";
import { Play } from "./commands/Play";

export const Commands: Command[] = [Queue, Play];
