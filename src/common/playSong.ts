import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import play from "play-dl";
import logger from "../utils/logger";
import queue from "./queue";
import song from "./song";

const playSong = async (
  guildId: string,
  song: song
): Promise<Error | undefined> => {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) {
    return new Error("Corresponding serverQueue cannot be found!");
  }

  if (!song) {
    serverQueue.connection.destroy();
    logger.info("Destroying connection");
    queue.delete(guildId);
  }

  const stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  resource.volume?.setVolume(1);

  const audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  audioPlayer.play(resource);
  serverQueue.playing = true;
  serverQueue.nowPlaying = song;
  serverQueue.songs.shift();

  serverQueue.connection.subscribe(audioPlayer);

  audioPlayer.on(AudioPlayerStatus.Idle, () => {
    if (serverQueue.playing) {
      playSong(guildId, serverQueue.songs[0]);
    }
  });
};

export default playSong;
