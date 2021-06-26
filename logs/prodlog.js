const winston = require('winston')
const { format, createLogger, transports} = require('winston')
const { combine, timestamp , errors , json} = format;

const buildProdLog = ()=>{
    
    return createLogger({
        level : 'info', //change level to view other logs
        format: combine(
            timestamp({format : 'YYYY-MM-DD HH:mm:ss ZZ'}), // YEAR MONTH DAY HOUR MINUTE SECOND TIMEZONE
            errors({stack : true}),
            json(),
        ),
        defaultMeta : {service : 'user-service'},
        transports: [
            new transports.Console(),
            new transports.File({filename : './logs/PROD.log'})
        ],
      });
}





  module.exports = buildProdLog;