const queue = require('queue');
const WebsiteRecord = require('./models/WebsiteRecord');
const { savePotentialwebites } = require('./savePotentialwebites');
const { scrapOneRecordCheerio } = require('./scrapOneRecordCheerio');
let q = queue({ results: [], concurrency: 40 })
q.timeout = 100 * 1000;
const delay = ms => new Promise(res => setTimeout(res, ms));

exports.scrapUrlscheerio = async() => {
    while (true) {
        if (q.length > 0) {
            console.log('waiting..')
            await delay(10 * 1000);
            continue;
        }
        //get websites from db
        console.log('getting 100 records...')
        let randomNumber = Math.floor(Math.random() * 10);
        let websiteRecords = await WebsiteRecord
            .find({ status: 'failed', isPotentialScanned: { $ne: true } })
            .limit(100)
            // .skip(randomNumber);
        if (websiteRecords.length == 0) {
            console.log('No records found with status notDone');
            break;
        } else {
            //add them to the queue
            for (const websiteRecord of websiteRecords) {
                q.push(async() => {
                    try {
                        // await scrapOneRecordCheerio(websiteRecord.url)
                        await savePotentialwebites(websiteRecord.url)
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

            // q.on('end', this.scrapUrlscheerio)
            q.start(function(err) {
                if (err) {
                    console.log('error in queue : ' + err);
                }
            });
        }
    }



}