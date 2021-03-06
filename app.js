const { scrapUrlscheerio } = require('./scrapUrlscheerio');
const { connectToMongoDb } = require('./Helpers/MongooseConnection');
const WebsiteRecord = require('./models/WebsiteRecord');
require('dotenv').config()



connectToMongoDb().then(() => {
    scrapUrlscheerio();
    process.env['CALLES_NUMBER'] = 0

    process.env['NUMBER_OF_SCRAPED_IDS'] = 0
    process.env['NUMBER_OF_VISITED_WEBSITES'] = 0

    WebsiteRecord.countDocuments({ status: 'done' }).then((result) => {
        console.log('done : ' + result)
    });
    WebsiteRecord.countDocuments({ status: 'failed' }).then((result) => {
        console.log('failed : ' + result)
    });
    WebsiteRecord.countDocuments({ status: 'failed', cause: 'unreachable' }).then((result) => {
        console.log('unreachable : ' + result)
    });

    WebsiteRecord.countDocuments({ scrapedUsingCheerio: true }).then((result) => {
        console.log('cheerio : ' + result)
    });
    WebsiteRecord.countDocuments({ status: 'notDone', scrapedUsingCheerio: { $ne: true } }).then((result) => {
        console.log('not cheerio : ' + result)
    });
    WebsiteRecord.countDocuments({ status: 'notDone' }).then((result) => {
        console.log('notDone : ' + result)
    });
    WebsiteRecord.countDocuments({ status: 'under-processing' }).then((result) => {
        console.log('under-processing : ' + result)
    });

})