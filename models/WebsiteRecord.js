const mongoose = require('mongoose');


const WebsiteRecord = mongoose.Schema({
    url: { type: String },
    licenseId: { type: String },
    status: { type: String },
    scrapedUsingCheerio: { type: Boolean },
    isPotential: { type: Boolean },
    isPotentialScanned: { type: Boolean },
    cause: { type: String },


});

module.exports = mongoose.model('WebsiteRecord', WebsiteRecord);