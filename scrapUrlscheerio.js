const queue = require('queue');
const WebsiteRecord = require('./models/WebsiteRecord');
const { scrapOneRecordCheerio } = require('./scrapOneRecordCheerio');
let q = queue({ results: [], concurrency: 20 })
q.timeout = 100 * 1000;

exports.scrapUrlscheerio = async() => {
    //get websites from db
    console.log('getting 100 records...')
    let randomNumber = Math.floor(Math.random() * 10);
    let websiteRecords = await WebsiteRecord
        .find({ status: 'notDone', scrapedUsingCheerio: { $ne: true } })
        .limit(20)
        .skip(randomNumber);
    console.log('randomNumber : ', randomNumber)
    if (websiteRecords.length == 0) {
        console.log('No records found with status notDone');
    } else {
        //add them to the queue
        for (const websiteRecord of websiteRecords) {
            q.push(async() => {
                try {
                    await scrapOneRecordCheerio(websiteRecord.url)
                } catch (error) {
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('ERROR IN QUEEUEEE', websiteRecord)
                    console.log(error)
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                }
            });
        }

        q.on('end', this.scrapUrlscheerio)
        q.start(function(err) {
            if (err) {
                console.log('error in queue : ' + err);
            }
        });
    }


}