var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(path.resolve(__dirname, '..', 'public'));
    console.log(path.resolve(__dirname, '..', 'public').replace(/\\/g, '/'));
});
module.exports = router;
