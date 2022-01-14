import { CommandInteraction } from "discord.js";
import play, { SpotifyTrack, YouTubeVideo } from "play-dl";

import song from "./song";
import logger from "../utils/logger";

export default async (input: string): Promise<song | undefined> => {
  // If input is a spotify song
  if (play.sp_validate(input) === "track") {
    // Refresh spotify token if expired.
    if (play.is_expired()) await play.refreshToken();

    const data = (await play.spotify(input)) as SpotifyTrack;
    // Create title - "name - artists"
    const title = `${data.name} - ${data.artists
      .map((artist) => artist.name)
      .join(", ")}`;

    // Search Youtube for title
    return getSongDataFromSearchTerm(title);
  } else if (play.yt_validate(input) === "video")
    // If input is a youtube video
    return await getSongDataFromYoutubeUrl(input);
  // Input is a search term
  else return await getSongDataFromSearchTerm(input);
};

async function getSongDataFromYoutubeUrl(
  url: string
): Promise<song | undefined> {
  if (play.yt_validate(url) === "video" && url.startsWith("https")) {
    const data = await play.video_info(url);
    return {
      title: data.video_details.title || "no title",
      url: data.video_details.url,
      thumbnail: data.video_details.thumbnails[0].url,
    };
  }
}

async function getSongDataFromSearchTerm(
  term: string
): Promise<song | undefined> {
  const data = await play.search(term + " original audio", {
    limit: 1,
    source: { youtube: "video" },
  });
  logger.info("Searching for: " + term + " audio");
  if (!data) return;

  const thumbnail = await getSongThumbnailFromSpotify(term);
  if (!thumbnail) return;

  return {
    title: data[0].title || term,
    url: data[0].url,
    thumbnail: thumbnail,
  };
}

async function getSongThumbnailFromSpotify(
  term: string
): Promise<string | undefined> {
  const sp_data = await play.search(term, {
    source: { spotify: "track" },
    limit: 1,
  });
  return sp_data[0].thumbnail?.url;
}
