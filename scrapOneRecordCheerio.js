const axios = require('axios');
const WebsiteRecord = require('./models/WebsiteRecord');
const https = require('https')



exports.scrapOneRecordCheerio = async function(websiteUrl) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });


    // axios.defaults.timeout = 13000;
    let res = null;

    try {
        res = await instance.get(websiteUrl, { httpsAgent })
    } catch (error) {
        let websiteUrlHttps = websiteUrl.replace('http', 'https')
        try {
            console.log(websiteUrlHttps + '  second try..')
            res = await instance.get(websiteUrlHttps)
        } catch (error) {
            console.log(websiteUrlHttps + '   second try failed ')
            console.log(websiteUrlHttps + '   third try')
            let websiteUrlWithoutHttps = websiteUrl.replace('http://', '')
            try {
                console.log(websiteUrlWithoutHttps + '  third try..')
                res = await instance.get(websiteUrlWithoutHttps)
            } catch (error) {
                console.log(websiteUrlWithoutHttps + '   third try failed ')
                return;
            }
        }
    }
    if (!res && !res.data) {
        console.log(websiteUrl + '  no response')
        return;
    }
    let html = res.data;
    let licenseId = null;

    //external js 
    if (!licenseId) {
        let regex = /src="https:\/\/connect\.livechatinc\.com\/api.*"/;
        let src = regex.exec(html);
        if (src) {
            src = src[0]
            src = src.replace(`src="`, "");
            src = src.replace(`"`, "");
            console.log(src + '   src')
        }
    }
    //meta tag 
    if (!licenseId) {
        let regex = /(\s*)<meta name="livechat_id"(\s*)content="[0-9]+"/;
        let matched = regex.exec(html);
        if (matched) {
            console.log(matched)
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log(websiteUrl + '  id found using href')
            console.log(licenseId);
        }
    }

    //link
    if (!licenseId) {
        let regex = /livechatinc\.com\/licence\/[0-9]*/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log(websiteUrl + '   id found in link')
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