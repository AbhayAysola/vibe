import { CommandInteraction, GuildMember } from "discord.js";
import {
  createAudioPlayer,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";

import song from "./song";
import queue from "./queue";
import Contract from "./contract";
import playSong from "./playSong";
import logger from "../utils/logger";

export default async (
  song: song,
  interaction: CommandInteraction
): Promise<undefined | Error> => {
  const guildId = interaction.guildId;
  if (!guildId) return new Error();
  const serverQueue = queue.get(guildId);
  const voiceChannel = (interaction.member as GuildMember).voice.channel;
  if (!voiceChannel || !interaction.channel) return new Error();

  if (!voiceChannel) {
    return new Error("You are not connected to a voice channel!");
  }
  if (!serverQueue) {
    try {
      const connection = joinVoiceChannel({
        guildId,
        channelId: voiceChannel.id,
        adapterCreator: voiceChannel.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
      });
      const queueContract: Contract = {
        textChannel: interaction.channel,
        voiceChannel,
        connection: connection,
        songs: [],
        volume: 0.5,
        playing: false,
        nowPlaying: null,
        audioPlayer: createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
          },
        }),
      };
      queueContract.songs.push(song);
      queue.set(guildId, queueContract);
      const songMessage = await playSong(
        voiceChannel.guildId,
        queueContract.songs[0]
      );
      if (!songMessage) return;
      else return songMessage;
    } catch (e) {
      return e as Error;
    }
  } else {
    serverQueue.songs.push(song);
    if (!serverQueue.playing) {
      const songMessage = await playSong(guildId, serverQueue.songs[0]);
      if (!songMessage) return;
      else return songMessage;
    }
    return;
  }
};
