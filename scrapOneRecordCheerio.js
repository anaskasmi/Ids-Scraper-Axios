const axios = require('axios');
const WebsiteRecord = require('./models/WebsiteRecord');


exports.scrapOneRecordCheerio = async function(websiteUrl) {
    // axios.defaults.timeout = 13000;
    let res = null;
    try {
        res = await axios.get(websiteUrl)

    } catch (error) {
        let websiteUrlHttps = websiteUrl.replace('http', 'https')
        try {
            console.log(websiteUrlHttps + '  second try..')
            res = await axios.get(websiteUrlHttps)
        } catch (error) {
            console.log(websiteUrlHttps + '   second try failed ')
            return;
        }
    }
    if (!res) {
        console.log(websiteUrl + '  no response')
        return;
    }
    let html = res.data;
    let licenseId = null;

    //meta tag 
    if (!licenseId) {
        let regex = /(\s*)<meta name="livechat_id"(\s*)content="[0-9]+"/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log(websiteUrl + '  id found using href')
            console.log(licenseId);
        }
    }

    //href
    if (!licenseId) {
        let regex = /(\s*)href="https:\/\/secure.livechatinc.com\/licence\/[0-9]+\/*/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log(websiteUrl + '   id found using href')
            console.log(licenseId);
        }
    }

    // _lc.license 
    if (!licenseId) {
        let regex = /_lc.license(\s*)=(\s*)[0-9]*[,;]/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log(websiteUrl + '   id found using _lc.license')
            console.log(licenseId);
        }
    }

    let recordsToUpdate = await WebsiteRecord.find({
        url: websiteUrl,
    });
    if (licenseId) {
        for (const recordToUpdate of recordsToUpdate) {
            if (recordToUpdate) {
                recordToUpdate.licenseId = licenseId;
                recordToUpdate.status = 'done';
                recordToUpdate.scrapedUsingCheerio = true;

                await recordToUpdate.save();
            }
        }
    } else {
        console.log(websiteUrl + '   Not found');
        for (const recordToUpdate of recordsToUpdate) {
            if (recordToUpdate) {
                recordToUpdate.scrapedUsingCheerio = true;
                await recordToUpdate.save();
            }
        }
    }




}