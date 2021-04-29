const { scrapUrlscheerio } = require('./scrapUrlscheerio');
const { connectToMongoDb } = require('./Helpers/MongooseConnection');
const WebsiteRecord = require('./models/WebsiteRecord');
require('dotenv').config()



connectToMongoDb().then(() => {
    scrapUrlscheerio();
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
    // WebsiteRecord.countDocuments({ status: 'notDone' }).then((result) => {
    //     console.log('notDone : ' + result)
    // });
    WebsiteRecord.countDocuments({ status: 'under-processing' }).then((result) => {
        console.log('under-processing : ' + result)
    });
})