const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const convert = require('koa-convert');
const cors = require('kcors')
const bodyparser = require('koa-bodyparser')
const mount = require('koa-mount')
const staticFile = require('koa-static')
const log4js = require('log4js')
const config = require('config')
const path = require('path')
const fs = require('fs')
const crawler_route = require('./routes/index')
const logger = require('./logger')

/**
 * logger
 */
const logger_config = config.get('logger')
const logDir = path.join('./logs')
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}
log4js.configure(logger_config,{ cwd: logDir });


/**
 * middleware
 */
app.use(bodyparser());
app.use(cors())
app.use(convert(staticFile(path.join(__dirname, 'public'))));
app.use(async(ctx, next) => {
	try {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
    }catch(error){
        ctx.body = String(error)
        ctx.status = error.status || 500
        logger.error('%s %s - %s', ctx.method,ctx.url, String(error))
	}
});

router.use('/crawler', crawler_route.routes(), crawler_route.allowedMethods());
app.use(router.routes(), router.allowedMethods());

let port = config.get('port')
app.listen(port,function () {
    console.log(`App started at port:${port}`);
});
