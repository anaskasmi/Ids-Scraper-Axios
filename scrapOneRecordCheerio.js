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
        console.log('try 1 :', websiteUrl)
        res = await instance.get(websiteUrl)
    } catch (error1) {
        console.log('try 1 FAILED :', websiteUrl)
        let websiteUrlHttps = websiteUrl.replace('http', 'https')
        if (error1 && error1.response && error1.response.status) {}
        try {
            console.log('try 2 : ', websiteUrl)
            res = await instance.get(websiteUrlHttps)
        } catch (error2) {
            console.log('try 2 FAILED : ', websiteUrl)
            if (error2 && error2.response && error2.response.status) {
                if (error1 && error1.response && error1.response.status > 200 &&
                    error2.response.status > 200) {
                    let recordsToUpdate = await WebsiteRecord.find({
                        url: websiteUrl,
                    });

                    for (const recordToUpdate of recordsToUpdate) {
                        recordToUpdate.status = "failed";
                        recordToUpdate.scrapedUsingCheerio = true;
                        await recordToUpdate.save();
                    }

                    console.log(websiteUrl, 'Not Available')
                    return;
                }
            }
        }
    }
    if (!res || (res && !res.data)) {
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
            externelJs = await instance.get(src)

            let externalJsRegex = /_lc.license(\s*)=(\s*)[0-9]*[,;]/;
            let externalJsMatched = externalJsRegex.exec(externelJs);
            if (externalJsMatched) {
                externalJsMatched = externalJsMatched[0]
                console.log(websiteUrl + ' id found using external js ')
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                console.log(externalJsMatched.replace(/\D/g, ""));
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    // licenseId = externalJsMatched.replace(/\D/g, "");
            }
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