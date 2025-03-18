import axios from "axios";
const dotenv = require('dotenv');

dotenv.config();

const YOUTUBE_PLAYLIST = process.env.YOUTUBE_PLAYLIST;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function fetchYouTubeSolutions(playlistId) {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_PLAYLIST}&key=${YOUTUBE_API_KEY}&maxResults=50`
        );
        return response.data.items.map((video) => ({
            title: video.snippet.title,
            videoId: video.snippet.resourceId.videoId,
            url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
        }));
    } catch (error) {
        console.error("Error fetching YouTube videos: ", error);
        return [];
    }
}