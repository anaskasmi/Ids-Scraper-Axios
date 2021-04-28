const mongoose = require('mongoose');


const WebsiteRecord = mongoose.Schema({
    url: { type: String },
    licenseId: { type: String },
    status: { type: String, default: 'notDone' },
    scrapedUsingCheerio: { type: Boolean, default: false },

});

module.exports = mongoose.model('WebsiteRecord', WebsiteRecord);