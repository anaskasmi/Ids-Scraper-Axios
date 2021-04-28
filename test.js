// const axios = require('axios');
var urlExists = require('url-exists');

(async() => {


    urlExists('http://www.google.com', function(err, exists) {
        console.log(exists); // true
    });

})()