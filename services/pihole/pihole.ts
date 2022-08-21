const axios = require('axios').default;

async function getAllQueries(hostname: string) {
    try {
        const response = await axios.get(`http://pi.hole/admin/api.php?getAllQueries&auth=${process.env.PIHOLE_TOKEN}`);
        return response.data.data.filter(req => req[3] == hostname)
    } catch (error) {
        // logger.error(error);
    }
}

export { getAllQueries }