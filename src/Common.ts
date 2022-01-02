import {
  CommandInteraction,
  Guild,
  GuildMember,
  MessageEmbed,
  TextBasedChannel,
  VoiceBasedChannel,
} from "discord.js";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import play, { SpotifyTrack } from "play-dl";
import { URL } from "url";

import logger from "./utils/logger";
import { Embed } from "@discordjs/builders";

export const queue: Map<string, Contract> = new Map();
export const errorEmbed: MessageEmbed = new MessageEmbed()
  .setTitle("Error!")
  .setDescription("An error has occured.")
  .setColor("#ff194b");

export const checkVoiceChannel = async (
  interaction: CommandInteraction
): Promise<boolean> => {
  const voiceChannel = (interaction.member as GuildMember).voice.channel;
  const botMember = interaction.guild?.me;

  if (!voiceChannel) {
    await interaction.followUp(
      "You have to be in a voice channel to use this command!"
    );
    return false;
  }
  if (!botMember) {
    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    logger.error(new Error("botMember is undefined or null"));
    return false;
  }

  const permissions = voiceChannel.permissionsFor(botMember);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    await interaction.followUp(
      "I need permissions to join and speak in your voice channel!"
    );
    return false;
  }
  return true;
};

export interface song {
  title: string;
  url: string;
}

export const getSongData = async (
  interaction: CommandInteraction
): Promise<song | undefined> => {
  const address = interaction.options.getString("url");
  if (!address) {
    logger.error(new Error("url option is undefined or null"));
    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    return;
  }
  try {
    const url = new URL("", address);
    if (url.hostname === "open.spotify.com") {
      if (play.is_expired()) await play.refreshToken();

      const data = (await play.spotify(url.toString())) as SpotifyTrack;
      const title = `${data.name} - ${data.artists
        .map((artist) => artist.name)
        .join(", ")}`;
      logger.info("Searching for: " + title);
      const searched = await play.search(title, { limit: 1 });
      return {
        title,
        url: searched[0].url,
      };
    } else if (url.hostname === "www.youtube.com") {
      logger.info("url: " + url.toString());
      const data = await play.video_info(url.toString());
      return {
        title: data.video_details.title || "",
        url: data.video_details.url,
      };
    }
  } catch (e) {
    logger.error(e);
    await interaction.followUp("Please enter a valid url!");
    return;
  }
};

interface Contract {
  textChannel: TextBasedChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection | null;
  songs: song[];
  volume: number;
  playing: boolean;
  nowPlaying: song | null;
}

async function playSong(guild: Guild, song: song) {
  const serverQueue = queue.get(guild.id);
  if (!serverQueue) {
    logger.error(
      new Error("serverQueue corresponding to guild cannot be found")
    );
    return "";
  }

  if (!serverQueue.connection) {
    logger.error(new Error("serverQueue.connection is null!"));
    return "";
  }

  if (!song) {
    serverQueue.connection.destroy();
    logger.info("Destroying connection");
    queue.delete(guild.id);
    return "";
  }

  let stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  resource.volume?.setVolume(serverQueue.volume);

  const audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  audioPlayer.play(resource);
  serverQueue.playing = true;
  serverQueue.songs.shift();
  serverQueue.nowPlaying = song;

  serverQueue.connection.subscribe(audioPlayer);

  audioPlayer.on(AudioPlayerStatus.Idle, (oldState, newState) => {
    if (serverQueue.playing) {
      playSong(guild, serverQueue.songs[0]);
    }
  });

  return `Start playing: **${song.title}** - ${song.url}`;
}

export const addSongToQueue = async (
  songData: song,
  interaction: CommandInteraction
) => {
  if (!interaction.guildId) {
    return;
  }
  const serverQueue = queue.get(interaction.guildId);
  const voiceChannel = (interaction.member as GuildMember).voice.channel;

  if (!interaction.channel || !voiceChannel) {
    console.log("No channel to connect to");
    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  if (!serverQueue) {
    const queueContract: Contract = {
      textChannel: interaction.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 0.5,
      playing: true,
      nowPlaying: null,
    };

    if (!interaction.guildId) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      console.log("No guildid");
      return;
    }

    queue.set(interaction.guildId, queueContract);
    queueContract.songs.push(songData);

    try {
      const connection = joinVoiceChannel({
        guildId: voiceChannel.guildId,
        channelId: voiceChannel.id,
        adapterCreator: voiceChannel.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
      });
      queueContract.connection = connection;
      const songMessage = await playSong(
        voiceChannel.guild,
        queueContract.songs[0]
      );
      await interaction.followUp(songMessage);
    } catch (e) {
      console.log(e);
      queue.delete(interaction.guildId);
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }
  } else {
    serverQueue.songs.push(songData);
    await interaction.followUp(
      `**${songData.title}** has been added to the queue!`
    );
  }
};
