import { AudioPlayerStatus, createAudioResource } from "@discordjs/voice";
import { MessageEmbed } from "discord.js";
import play from "play-dl";
import logger from "../utils/logger";
import { defaultColor } from "./embeds";
import queue from "./queue";
import song from "./song";

let timeoutId: NodeJS.Timeout;

const playSong = async (
  guildId: string,
  song: song
): Promise<Error | undefined> => {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) {
    return new Error("Corresponding serverQueue cannot be found!");
  }

  if (!song) {
    serverQueue.playing = false;
    serverQueue.nowPlaying = null;
    timeoutId = setTimeout(() => {
      logger.info("Destroying connection");
      serverQueue.textChannel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("Disconnecting")
            .setDescription(
              "The bot has in inactive for 5 minutes, so it is leaving the voice channel"
            )
            .setColor(defaultColor),
        ],
      });
      serverQueue.connection.destroy();
      queue.delete(guildId);
    }, 300 * 1000);
    return;
  }

  clearTimeout(timeoutId);

  const stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  resource.volume?.setVolume(1);
  serverQueue.audioPlayer.play(resource);
  serverQueue.playing = true;
  serverQueue.nowPlaying = song;
  serverQueue.songs.shift();

  serverQueue.connection.subscribe(serverQueue.audioPlayer);

  serverQueue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
    if (serverQueue.playing) {
      playSong(guildId, serverQueue.songs[0]);
    }
  });
};

export default playSong;
