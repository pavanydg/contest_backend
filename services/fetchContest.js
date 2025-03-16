import axios from "axios";

export async function fetchCodeForcesContests() {
    try {
        const response = await axios.get('https://codeforces.com/api/contest.list')
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
                solutionLink: null
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

        const contests = response.data;
        let codeChefContests = [];
        console.log()
        const onGoingContests = contests.present_contests.map(contest =>
            convertCodeChefToApi(contest, 'ongoing'));
        console.log(onGoingContests)
        const futureContests = contests.future_contests.map(contest =>
            convertCodeChefToApi(contest, 'upcoming')
        );;
        const pastContests = contests.past_contests.map(contest =>
            convertCodeChefToApi(contest, 'past')
        );;

        codeChefContests = [...onGoingContests, ...futureContests, ...pastContests];

        return codeChefContests;
    }
    catch (error) {
        console.error("Error fetching Codechef contests: ", error)
    }
}

function convertCodeChefToApi(contest, status) {
    return {
        id: `cc_${contest.contest_code}`,
        name: contest.contest_name,
        type: 'regular',
        platform: 'CodeChef',
        url: `https://codechef.com/${contest.contest_code}`,
        startTime: contest.contest_start_date_iso,
        endTime: contest.contest_end_date_iso,
        status,
        solutionLink: null
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

        const contests = response.data.data.allContests;
        let leetCodeContests = contests.map(contest => convertLeetCodeToApi(contest))

        return leetCodeContests;
    }
    catch (error) {
        console.error("Error fetching Leetcode contests: ", error)
    }    
}

function convertLeetCodeToApi(contest) {

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
        url: `https://leetcode.com/${contest.titleSlug}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status,
        solutionLink: null
    }
}