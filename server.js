const express = require("express")
const cors = require("cors")
const { fetchCodeForcesContests, fetchCodeChefContests, fetchLeetCodeContests, fetchYouTubeSolutions } = require("./services/fetchContest");

const app = express();

app.use(cors())
app.use(express())

const PORT = process.env.PORT || 3001

app.get("/api/contest/filter", async (req, res) => {
    try {
        const { platforms, status, limit = 10, offset = 0 } = req.query;

        const cfContests = await fetchCodeForcesContests();
        const ccContests = await fetchCodeChefContests();
        const lcContests = await fetchLeetCodeContests();

        let allContests = [...cfContests, ...ccContests, ...lcContests];

        // Sort by start time (earliest first)
        allContests.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        let filteredContests = allContests;

        // Filter by platforms
        if (platforms) {
            const platformList = platforms.split(",").map(p => p.trim().toLowerCase());
            filteredContests = filteredContests.filter(contest => 
                platformList.includes(contest.platform.toLowerCase())
            );
        }

        // Filter by status
        if (status) {
            const statusList = status.split(",").map(s => s.trim().toLowerCase());
            filteredContests = filteredContests.filter(contest => 
                statusList.includes(contest.status.toLowerCase())
            );
        }

        // Apply Limit & Offset)
        const paginatedContests = filteredContests.slice(Number(offset), Number(offset) + Number(limit));

        res.status(200).json({
            status: 'success',
            data: paginatedContests,
            hasMore: filteredContests.length > Number(offset) + Number(limit)
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})