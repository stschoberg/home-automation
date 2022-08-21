require('dotenv').config({ path: './.env' })
import { hueService } from "./services/hue/hue";
import { getAllQueries } from "./services/pihole/pihole";
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




async function main(){
    const env = {
        HUE_USER: process.env.HUE_USER!,
        BRIDGE_IP: process.env.BRIDGE_IP!,
        HOSTNAME: process.env.HOSTNAME!,
        PIHOLE_TOKEN: process.env.PIHOLE_TOKEN!
    }
    const hue = hueService({logger: logger, env: env})
    const queries = await getAllQueries(process.env.HOSTNAME!)
    const mostRecentQuery = queries[queries.length - 1];
    const mostRecentQueryTimestamp = new Date(mostRecentQuery[0] * 1000)
    const isActive =  Math.abs((new Date()).valueOf() - mostRecentQueryTimestamp.valueOf()) < 1000 * 60 * 5;
    logger.info(`${process.env.HOSTNAME} last activity: ${mostRecentQueryTimestamp}`)
    if(isActive) {
        logger.info(`${process.env.HOSTNAME} is active on the network`)
        await hue.flipAllLights('on')
    } else {
        logger.info(`${process.env.HOSTNAME} is inactive on the network`)
        await hue.flipAllLights('off')
    }

}

main()
