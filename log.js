const logger = require('./logs/logger')


logger.info('text info',{meta1:'metal'})
logger.warn('text warn')
logger.error('text error')
logger.debug('text debug')
//logger.error(new Error('message'))