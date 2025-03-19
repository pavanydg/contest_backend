import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// YouTube playlist IDs
const PLAYLIST_IDS = {
    Codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
    CodeChef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
    Leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr"
};

// Fetch videos from a YouTube playlist
export async function fetchYouTubeSolutions(playlistId) {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/playlistItems`, {
            params: {
                part: "snippet",
                maxResults: 50,
                playlistId,
                key: YOUTUBE_API_KEY
            }
        }
        );
        return response.data.items.map(item => ({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
        }));
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
}

function findSolutionLinkLeetCode(contestName, videos) {
    const match = videos.find(video => video.title.toLowerCase().includes(contestName.toLowerCase()));
    return match ? match.url : null;
}

function findSolutionLink(contestName, videos, status) {
    const numberMatch = contestName.match(/\d+/);
    if (!numberMatch || status == 'upcoming' || status == 'ongoing') return null; // Return null if no number is found

    const roundNumber = numberMatch[0]; // Extract number as a string

    const match = videos.find(video => {
        return video.title.includes(roundNumber);
    });

    return match ? match.url : null;
}


export async function fetchCodeForcesContests() {
    try {
        const response = await axios.get('https://codeforces.com/api/contest.list')
        const codeforcesVideos = await fetchYouTubeSolutions(PLAYLIST_IDS.Codeforces);

        const codeForcesContests = response.data.result.map(contest => {
            const startTime = new Date(contest.startTimeSeconds * 1000);
            const endTime = new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000);

            const currentTime = new Date();

            let status = 'upcoming';
            if (startTime <= currentTime && endTime >= currentTime) {
                status = 'ongoing';
            } else if (endTime < currentTime) {
                status = 'past'
            }

            return {
                id: `cf_${contest.id}`,
                name: contest.name,
                type: contest.type,
                platform: 'Codeforces',
                url: `https://codeforces.com/contest/${contest.id}`,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                status,
                solutionLink: findSolutionLink(contest.name, codeforcesVideos,status)
            }
        });
        return codeForcesContests;
    }
    catch (error) {
        console.error("Error fetching CodeForces contests");
    }
}

export async function fetchCodeChefContests() {
    try {
        const response = await axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all')

        const codechefVideos = await fetchYouTubeSolutions(PLAYLIST_IDS.CodeChef);

        const contests = response.data;
        let codeChefContests = [];
        const onGoingContests = contests.present_contests.map(contest =>
            convertCodeChefToApi(contest, 'ongoing',codechefVideos));
        const futureContests = contests.future_contests.map(contest =>
            convertCodeChefToApi(contest, 'upcoming',codechefVideos)
        );;
        const pastContests = contests.past_contests.map(contest =>
            convertCodeChefToApi(contest, 'past',codechefVideos)
        );;

        codeChefContests = [...onGoingContests, ...futureContests, ...pastContests];

        return codeChefContests;
    }
    catch (error) {
        console.error("Error fetching Codechef contests: ", error)
    }
}

function convertCodeChefToApi(contest, status, videos) {
    return {
        id: `cc_${contest.contest_code}`,
        name: contest.contest_name,
        type: 'regular',
        platform: 'CodeChef',
        url: `https://codechef.com/${contest.contest_code}`,
        startTime: contest.contest_start_date_iso,
        endTime: contest.contest_end_date_iso,
        status,
        solutionLink: findSolutionLink(contest.contest_name, videos)

    }
}

export async function fetchLeetCodeContests() {
    try {
        const query = {
            query: `
              query getContestList {
                allContests {
                  title
                  startTime
                  duration
                  titleSlug
                }
              }
            `
        };

        const response = await axios.post('https://leetcode.com/graphql', query, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const leetcodeVideos = await fetchYouTubeSolutions(PLAYLIST_IDS.Leetcode);
        const contests = response.data.data.allContests;
        let leetCodeContests = contests.map(contest => convertLeetCodeToApi(contest, leetcodeVideos))

        return leetCodeContests;
    }
    catch (error) {
        console.error("Error fetching Leetcode contests: ", error)
    }
}

function convertLeetCodeToApi(contest, videos) {

    let type = "";
    if (contest.title.split(" ")[0] === "Weekly") {
        type = "Weekly"
    } else {
        type = "Biweekly"
    }

    const startTime = new Date(contest.startTime * 1000);
    const endTime = new Date((contest.startTime + contest.duration) * 1000);
    const currentTime = new Date();

    let status = 'upcoming';
    if (startTime <= currentTime && endTime >= currentTime) {
        status = 'ongoing';
    } else if (endTime < currentTime) {
        status = 'past'
    }
    return {
        id: `lc_${contest.titleSlug}`,
        name: contest.title,
        type: type,
        platform: 'Leetcode',
        url: `https://leetcode.com/contest/${contest.titleSlug}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status,
        solutionLink: findSolutionLinkLeetCode(contest.title, videos)
    }
}