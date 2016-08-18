var express = require('express');
var router = express.Router();
var page = require('../lib/middleware/page');
var entries = require('./entries');
var Entry = require('../lib/entry');


function pageIndex(req, res, next) {
    var user = res.locals.user;
    if (!user){
        res.render('index', { title: 'Shout Box'});
        //next('route');
    }else{
        next();
    }

}

/* GET home page. */
router.get('/', pageIndex, page(Entry.count, 5), entries.list);


module.exports = router;
