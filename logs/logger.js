const buildDevLog = require("./devlog");
const buildProdLog = require('./prodlog')
require('dotenv').config();
let logger = null ; 
if(process.env.NODE_ENV === 'development'){
    logger = buildDevLog();
}
else {
    logger = buildProdLog();
}


module.exports = logger;