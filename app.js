const { scrapUrlscheerio } = require('./scrapUrlscheerio');
const { connectToMongoDb } = require('./Helpers/MongooseConnection');
const WebsiteRecord = require('./models/WebsiteRecord');
require('dotenv').config()



connectToMongoDb().then(() => {
    scrapUrlscheerio();
    // WebsiteRecord.find({ status: 'done' }).countDocuments().then((result) => {
    //     console.log('done : ' + result)
    // });
    // WebsiteRecord.find({ status: 'failed' }).countDocuments().then((result) => {
    //     console.log('failed : ' + result)
    // });
    // WebsiteRecord.find({ status: 'failed', cause: 'unreachable' }).countDocuments().then((result) => {
    //     console.log('unreachable : ' + result)
    // });
    // // WebsiteRecord.find({ status: 'notDone' }).countDocuments().then((result) => {
    // //     console.log('notDone : ' + result)
    // // });
    // WebsiteRecord.find({ status: 'under-processing' }).countDocuments().then((result) => {
    //     console.log('under-processing : ' + result)
    // });
})