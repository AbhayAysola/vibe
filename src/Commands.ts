import { Command } from "./Command";
import { Queue } from "./commands/Queue";
import { Play } from "./commands/Play";
import { Stop } from "./commands/Stop";

export const Commands: Command[] = [Queue, Play, Stop];
