import { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { AudioPlayer, VoiceConnection } from "@discordjs/voice";

import song from "./song";

export default interface Contract {
  textChannel: TextBasedChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection;
  audioPlayer: AudioPlayer;
  songs: song[];
  volume: number;
  playing: boolean;
  nowPlaying: song | null;
}
