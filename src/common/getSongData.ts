import { CommandInteraction } from "discord.js";
import play, { SpotifyTrack } from "play-dl";

import song from "./song";
import logger from "../utils/logger";

export default async (url: string): Promise<song | undefined> => {
  const data = getSongDataFromUrl(url);
  return data;
};

async function getSongDataFromUrl(url: string): Promise<song | undefined> {
  if (play.sp_validate(url) === "track") {
    // Refresh spotify token if expired.
    if (play.is_expired()) await play.refreshToken();

    const data = (await play.spotify(url)) as SpotifyTrack;
    // Create title equal to name - artists
    const title = `${data.name} - ${data.artists
      .map((artist) => artist.name)
      .join(", ")}`;
    logger.info("Searching for: " + title);
    // Search Youtube for title
    const searched = await play.search(title, { limit: 1 });
    return {
      title,
      url: searched[0].url,
    };
  }
  if (play.yt_validate(url) === "video" && url.startsWith("https")) {
    const data = await play.video_info(url);
    return {
      title: data.video_details.title || "no title",
      url: data.video_details.url,
    };
  }
}
