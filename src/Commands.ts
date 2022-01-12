import { Command } from "./Command";
import { Queue } from "./commands/Queue";
import { Play } from "./commands/Play";
import { Stop } from "./commands/Stop";
import { Pause } from "./commands/Pause";
import { Resume } from "./commands/Resume";
import { Skip } from "./commands/Skip";

export const Commands: Command[] = [Queue, Play, Stop, Pause, Resume, Skip];
