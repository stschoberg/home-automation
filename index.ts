require('dotenv').config({ path: './.env' })
const axios = require('axios').default;
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console(), 
    new transports.File({
      filename: './log',
      level: 'info'
    }),]
});

async function updateLightState(light: number, state: any) {
    try {
        await axios({
            method: 'put',
            url: `http://192.168.1.172/api/${process.env.HUE_USER}/lights/${light}/state`,
            headers: {}, 
            data: state
    })
    }
    catch (error){
        logger.error(error);
    }
}

async function getAllQueries(hostname: string) {
    try {
        const response = await axios.get(`http://pi.hole/admin/api.php?getAllQueries&auth=${process.env.PIHOLE_TOKEN}`);
        return response.data.data.filter(req => req[3] == hostname)
    } catch (error) {
        logger.error(error);
    }
}

async function main(){
    const queries = await getAllQueries(process.env.HOSTNAME!)
    const mostRecentQuery = queries[queries.length - 1];
    const mostRecentQueryTimestamp = new Date(mostRecentQuery[0] * 1000)
    const isActive =  Math.abs((new Date()).valueOf() - mostRecentQueryTimestamp.valueOf()) < 1000 * 60 * 5;
    logger.info(`${process.env.HOSTNAME} last activity: ${mostRecentQueryTimestamp}`)
    if(isActive) {
        logger.info(`${process.env.HOSTNAME} is active on the network`)
        await updateLightState(3, {on: true})
    } else {
        logger.info(`${process.env.HOSTNAME} is inactive on the network`)
        await updateLightState(3, {on: false})
    }

}

main()
