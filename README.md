# Contest Tracker Backend

This API aggregates contest information from various coding platforms such as Codeforces, CodeChef, and LeetCode.

## APIs Used

### Codeforces
- **Endpoint:** [`https://codeforces.com/api/contest.list`](https://codeforces.com/api/contest.list)
- **Description:** Provides a list of contests hosted on Codeforces.

### CodeChef
- **Endpoint:** [`https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all`](https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all)
- **Description:** Fetches all upcoming contests on CodeChef, sorted by start time in ascending order.

### Leetcode
- **Endpoint:** [`https://leetcode.com/graphql`](https://leetcode.com/graphql)
- **Description:** Uses GraphQL to retrieve contest details from LeetCode.

### YouTube API (for fetching videos)
- **Endpoint:** [`https://www.googleapis.com/youtube/v3/playlistItems`](https://www.googleapis.com/youtube/v3/playlistItems)
- **Description:** Fetches videos related to contests from YouTube playlists.
