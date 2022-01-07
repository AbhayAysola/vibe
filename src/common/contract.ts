import { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";

import song from "./song";

export default interface Contract {
  textChannel: TextBasedChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection;
  songs: song[];
  volume: number;
  playing: boolean;
  nowPlaying: song | null;
}
