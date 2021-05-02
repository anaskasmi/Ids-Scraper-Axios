const axios = require('axios');
const WebsiteRecord = require('./models/WebsiteRecord');
const https = require('https')
const util = require('util');
const urlExists = util.promisify(require('url-exists'));

const fs = require('fs');


exports.savePotentialwebites = async function(websiteUrl) {
    let isPotential = false;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    let res = null;
    let websiteUrlHttps = websiteUrl.replace('http', 'https')

    //check websites availibilty
    let websiteHttpAvailable = await urlExists(websiteUrl);
    let websiteHttpsAvailable = await urlExists(websiteUrlHttps);
    if (!websiteHttpsAvailable && !websiteHttpAvailable) {
        let recordsToUpdate = await WebsiteRecord.find({
            url: websiteUrl,
        });

        console.log('-----------')
        console.log('Unreachable ', websiteUrl)
        console.log('-----------')

        return;
    }
    //instanciate axios 
    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });


    try {
        res = await instance.get(websiteUrl)
    } catch (error1) {
        try {
            res = await instance.get(websiteUrlHttps)
        } catch (error2) {
            console.log('-----------')
            console.log('Cannot get : ', websiteUrl)
            console.log('-----------')
            return;
        }
    }

    //if website exist but has no data
    if (!res || (res && !res.data)) {
        console.log('-----------')
        console.log('No response : ', websiteUrl)
        console.log('-----------')
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
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
        }
    }

    //link
    if (!licenseId) {
        let regex = /livechatinc\.com\/licence\/[0-9]*/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
        }
    }

    // _lc.license 
    if (!licenseId) {
        let regex = /_lc.license(\s*)=(\s*)[0-9]*[,;]/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
        }
    }



    // var 
    if (!licenseId) {
        let regex = /license(\s*)[:,=](\s*)[0-9]+[},;&]/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log('-----------------------------------')
            console.log(websiteUrl + '   id found using var', licenseId)
            console.log('-----------------------------------')

        }
    }
    // chat with us link 
    if (!licenseId) {
        let regex = /livechatinc\.com\/chat-with\/[0-9]+/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log('-----------------------------------')
            console.log(websiteUrl + '   id found using chat with us link', licenseId)
            console.log('-----------------------------------')

        }
    }

    // chat with us link 2 
    if (!licenseId) {
        let regex = /livechat\.com\/chat-with\/([0-9]+)/;
        let matched = regex.exec(html);
        if (matched) {
            matched = matched[0]
            licenseId = matched.replace(/\D/g, "");
            console.log('-----------------------------------')
            console.log(websiteUrl + '   id found using chat with us link 2', licenseId)
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
                }
            } catch (error) {
                //potential
                fs.appendFileSync('potential.csv', `${websiteUrl},externalJsFile\n`);
                isPotential = true;
                console.log(error, websiteUrl)
            }

        }
    }


    // save link to potential list 
    if (!licenseId) {
        if (html.includes('livechat')) {
            fs.appendFileSync('potential.csv', `${websiteUrl},livechatKeywork\n`);
            isPotential = true;
        } else if (html.includes('license')) {
            fs.appendFileSync('potential.csv', `${websiteUrl},license\n`);
            isPotential = true;
        }

        if (isPotential) {
            let recordsToUpdate = await WebsiteRecord.find({
                url: websiteUrl,
            });
            for (const recordToUpdate of recordsToUpdate) {
                recordToUpdate.isPotential = true;
                recordToUpdate.isPotentialScanned = true;
                await recordToUpdate.save();
            }
            console.log('-------------')
            console.log('  Potential  ', websiteUrl)
            console.log('-------------')

        }
    }


    if (licenseId) {
        let recordsToUpdate = await WebsiteRecord.find({
            url: websiteUrl,
        });
        for (const recordToUpdate of recordsToUpdate) {
            recordToUpdate.licenseId = licenseId;
            recordToUpdate.status = 'done';
            recordToUpdate.isPotentialScanned = true;
            await recordToUpdate.save();
        }
        console.log('-------------')
        console.log('Found & Saved : ' + process.env.NUMBER_OF_SCRAPED_IDS, ' : ' + websiteUrl)
        console.log('-------------')
        process.env['NUMBER_OF_SCRAPED_IDS'] = parseInt(process.env['NUMBER_OF_SCRAPED_IDS']) + 1
    } else {
        console.log('-------------')
        console.log('  Not Found  ', websiteUrl)
        console.log('-------------')
    }




}