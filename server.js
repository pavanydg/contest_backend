const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv");
const { fetchCodeForcesContests, fetchCodeChefContests, fetchLeetCodeContests } = require("./services/fetchContest");

const app = express();

app.use(cors())
app.use(express())

const PORT = process.env.PORT || 3000

app.get('/api/contests', async (req, res) => {
    try {
        const cfContests = await fetchCodeForcesContests();
        const ccContests = await fetchCodeChefContests();
        const lcContests = await fetchLeetCodeContests();

        let allContests = [...cfContests, ...ccContests, ...lcContests].sort((b,a) => new Date(a.startTime) - new Date(b.startTime));

        res.status(200).json({
            status: 'success',
            data: allContests
        })
    }
    catch(error){
        res.status(500).json({
            status: 'error',
            message: error.message
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})