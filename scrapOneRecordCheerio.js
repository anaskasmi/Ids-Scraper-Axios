const axios = require('axios');
const WebsiteRecord = require('./models/WebsiteRecord');
const https = require('https')
const util = require('util');
const urlExists = util.promisify(require('url-exists'));


exports.scrapOneRecordCheerio = async function(websiteUrl) {

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    let res = null;
    let websiteUrlHttps = websiteUrl.replace('http', 'https')

    //check websites availibilty
    console.log('checking ', websiteUrl)
    let websiteHttpAvailable = await urlExists(websiteUrl);
    let websiteHttpsAvailable = await urlExists(websiteUrlHttps);
    console.log(websiteUrl, websiteHttpAvailable)
    console.log(websiteUrlHttps, websiteHttpsAvailable)
    if (!websiteHttpsAvailable && !websiteHttpAvailable) {
        console.log(websiteUrl, 'Not Available ')
        let recordsToUpdate = await WebsiteRecord.find({
            url: websiteUrl,
        });

        for (const recordToUpdate of recordsToUpdate) {
            recordToUpdate.status = "failed";
            recordToUpdate.cause = "unreachable";
            recordToUpdate.scrapedUsingCheerio = true;
            await recordToUpdate.save();
        }

        console.log(websiteUrl, 'Not Available')
        return;
    }
    //instanciate axios 
    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });


    try {
        console.log('trying http :', websiteUrl)
        res = await instance.get(websiteUrl)
    } catch (error1) {
        console.log('trying http FAILED :', websiteUrl)
        try {
            console.log('trying https : ', websiteUrlHttps)
            res = await instance.get(websiteUrlHttps)
        } catch (error2) {
            console.log('trying https FAILED : ', websiteUrlHttps)

            let recordsToUpdate = await WebsiteRecord.find({
                url: websiteUrl,
            });

            for (const recordToUpdate of recordsToUpdate) {
                recordToUpdate.scrapedUsingCheerio = true;
                await recordToUpdate.save();
            }
            return;

        }
    }
    //if website exist but has no data
    if (!res || (res && !res.data)) {
        console.log(websiteUrl + '  RESPONSE HAS NO DATA');
        let recordsToUpdate = await WebsiteRecord.find({
            url: websiteUrl,
        });
        for (const recordToUpdate of recordsToUpdate) {
            recordToUpdate.scrapedUsingCheerio = true;
            await recordToUpdate.save();
        }
        return;
    }

    //set the data to html 
    let html = res.data;
    let licenseId = null;



    //meta tag 
    if (!licenseId) {
        let regex = /(\s*)<meta name="livechat_id"(\s*)content="[0-9]+"/;
        let matched = regex.exec(html);
        if (matched) {
            console.log(matched)
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log('-----------------------------------')
            console.log(websiteUrl + '  id found using meta tag', licenseId)
            console.log('-----------------------------------')

        }
    }

    //link
    if (!licenseId) {
        let regex = /livechatinc\.com\/licence\/[0-9]*/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log('-----------------------------------')
            console.log(websiteUrl + '   id found in link', licenseId)
            console.log('-----------------------------------')

        }
    }

    // _lc.license 
    if (!licenseId) {
        let regex = /_lc.license(\s*)=(\s*)[0-9]*[,;]/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log('-----------------------------------')
            console.log(websiteUrl + '   id found using _lc.license', licenseId)
            console.log('-----------------------------------')

        }
    }

    //external js 
    if (!licenseId) {
        let regex = /src="https:\/\/connect\.livechatinc\.com\/api([^"]+)"/;
        let src = regex.exec(html);
        if (src) {
            src = src[0]
            src = src.replace(`src="`, "");
            src = src.replace(`"`, "");
            try {
                externelJs = await instance.get(src)
                externelJs = externelJs.data;
                let externalJsRegex = /_lc.license(\s*)=(\s*)[0-9]*[,;]/;
                let externalJsMatched = externalJsRegex.exec(externelJs);
                if (externalJsMatched) {
                    externalJsMatched = externalJsMatched[0]
                    licenseId = externalJsMatched.replace(/\D/g, "")
                    console.log('-----------------------------------')
                    console.log(websiteUrl + ' id found using external js ', licenseId)
                    console.log('-----------------------------------')

                }
            } catch (error) {

                console.log(error, websiteUrl)
            }

        }
    }



    let recordsToUpdate = await WebsiteRecord.find({
        url: websiteUrl,
    });
    if (licenseId) {
        console.log(websiteUrl + 'Saved');

        for (const recordToUpdate of recordsToUpdate) {
            recordToUpdate.licenseId = licenseId;
            recordToUpdate.status = 'done';
            recordToUpdate.scrapedUsingCheerio = true;
            await recordToUpdate.save();
        }
    } else {
        console.log(websiteUrl + '   Not found');
        for (const recordToUpdate of recordsToUpdate) {
            recordToUpdate.scrapedUsingCheerio = true;
            await recordToUpdate.save();
        }
    }




}