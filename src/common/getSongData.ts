import { CommandInteraction } from "discord.js";
import play, { SpotifyTrack } from "play-dl";

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
    };
  }
}

async function getSongDataFromSearchTerm(
  term: string
): Promise<song | undefined> {
  const data = await play.search(term + " audio", { limit: 1 });
  logger.info("Searching for: " + term + " audio");
  return {
    title: data[0].title || term,
    url: data[0].url,
  };
}
