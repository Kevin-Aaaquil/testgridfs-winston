const winston = require('winston')
const { format, createLogger, transports} = require('winston')
const { combine, timestamp, printf } = format;

const buildDevLog = ()=>{
    const myFormat = printf(({ level, message, label, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
      });
    
    return createLogger({
        level : 'info', //change level to view other logs
        format: combine(
           // format.colorize(),
            timestamp({format : 'YYYY-MM-DD HH:mm:ss ZZ'}), // YEAR MONTH DAY HOUR MINUTE SECOND TIMEZONE
            format.errors({stack : true}),
            myFormat,
        ),
        transports: [
            new transports.Console(),
            new transports.File({filename : './logs/DEV.log'})
        ],
      });
}





  module.exports = buildDevLog;