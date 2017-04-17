var router = require('koa-router')();
var JrgzController = require('../controllers/JrgzController.js');
var config = require('config')

var jrgzController = new JrgzController(config.get('crawlers.jrgz.url'))

router.get('/', function(ctx, next) {
	ctx.body = 'this is response!';
});

router.get('/jrgz/photos', async function(ctx, next) {
	var items = await jrgzController.findPhotoNews()
	ctx.body = items;
})

router.get('/jrgz/today', async function(ctx, next) {
	var items = await jrgzController.findTodayNews();
	ctx.body = items;
})

module.exports = router;