import {
  CommandInteraction,
  Guild,
  GuildMember,
  TextBasedChannel,
  VoiceBasedChannel,
} from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import play, { SpotifyTrack } from "play-dl";
import { URL } from "url";

export const queue: Map<string, Contract> = new Map();

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
    await interaction.followUp("An error has occured");
    console.log("Botmember is equal to: " + botMember);
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

interface song {
  title: string;
  url: string;
}

export const getSongData = async (
  interaction: CommandInteraction
): Promise<song | undefined> => {
  const address = interaction.options.getString("url");
  if (!address) {
    console.log("url option doesn't exist");
    await interaction.followUp("An error has occured.");
    return;
  }
  try {
    const url = new URL("", address);
    if (url.hostname === "open.spotify.com") {
      if (play.is_expired()) await play.refreshToken();

      const data = (await play.spotify(url.toString())) as SpotifyTrack;
      const title = `${data.name} ${data.artists
        .map((artist) => artist.name)
        .join(", ")}`;
      console.log("Searching for: " + title);
      const searched = await play.search(title, { limit: 1 });
      return {
        title,
        url: searched[0].url,
      };
    } else if (url.hostname === "www.youtube.com") {
      console.log(url.toString());
      const data = await play.video_info(url.toString());
      return {
        title: data.video_details.title || "",
        url: data.video_details.url,
      };
    }
  } catch (e) {
    console.log(e);
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
}

async function playSong(guild: Guild, song: song) {
  const serverQueue = queue.get(guild.id);
  if (!serverQueue)
    throw new Error("serverQueue corresponding to guild cannot be found");

  if (!serverQueue.connection)
    throw new Error("serverQueue.connection is null!");

  if (!song) {
    serverQueue.connection.destroy();
    queue.delete(guild.id);
    return "";
  }

  let stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
    inlineVolume: true,
  });
  resource.volume?.setVolume(0.5);

  const audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  audioPlayer.play(resource);

  serverQueue.connection.subscribe(audioPlayer);
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
    await interaction.followUp("An error has occured");
    return;
  }

  if (!serverQueue) {
    const queueContract: Contract = {
      textChannel: interaction.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    if (!interaction.guildId) {
      await interaction.followUp("An error has occured");
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
      await interaction.followUp("An error has occured");
    }
  } else {
    serverQueue.songs.push(songData);
    console.log(serverQueue.songs);
    await interaction.followUp(
      `${songData.title} has been added to the queue!`
    );
  }
};
