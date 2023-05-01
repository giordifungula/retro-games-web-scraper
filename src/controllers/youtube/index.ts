// import { google, youtube_v3 } from "googleapis";

// export default async function searchGameTrailer(gameName: string): Promise<string | null> {
//   try {
//     const apiKey = process.env.YOUTUBE_API_KEY;

//     if (!apiKey) {
//       throw new Error("YOUTUBE_API_KEY not found in environment variables");
//     }

//     const youtube = google.youtube({
//       version: "v3",
//       auth: apiKey,
//     });

//     const response = await youtube.search.list({
//       q: `${gameName} game trailer`,
//       part: "id",
//       type: "video",
//       maxResults: 1,
//     });

//     if (response.data.items && response.data.items.length > 0) {
//       const videoId = response.data.items[0].id?.videoId;
//       if (videoId) {
//         return `https://www.youtube.com/watch?v=${videoId}`;
//       }
//     }

//     console.log("Trailer not found");
//     return null;
//   } catch (error) {
//     console.error("Error fetching game trailer:", error);
//     return null;
//   }
// }

// searchGameTrailer("Cyberpunk 2077").then((url) => {
//   if (url) {
//     console.log("Trailer URL:", url);
//   } else {
//     console.log("Trailer not found");
//   }
// });
