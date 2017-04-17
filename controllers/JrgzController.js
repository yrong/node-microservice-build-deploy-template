const superagent = require('superagent')
const charset = require('superagent-charset')
charset(superagent)
const cheerio = require('cheerio')
const logger = require('../logger')


class JrgzController {
    constructor(url) {
        this.url = url
    }

    async loadPage(url) {
        let res = await superagent.get(url)
        return cheerio.load(res.text, {
            normalizeWhitespace: true
        })
    }

    async findPhotoNews() {
        let $ = await this.loadPage(this.url)
        var items = {},hrefs = []
        $('.components4 .s4-wpTopTable ul li p a').each(function(i, elem) {
            var $element = $(elem);
            if($element&&$element.attr('href')){
                let title = $element.text()
                let href = $element.attr('href')
                hrefs.push(href)
                items[href] = {title:title}
            }
        })
        for(let href of hrefs){
            let href_html
            try {
                href_html = await superagent.get(href)//('http://www.cnpc.com.cn/cnpc/jtxw/201704/6c201cfadab44ab385ef20219ec1b2cd.shtml')
            }catch(error){
                logger.error(`${href}:${String(error)}`)
            }
            items[href]['html'] = href_html?href_html.text:{}
        }
        return items
	};

	async findTodayNews() {
        let $ = await this.loadPage(this.url)
        var items = {},hrefs = []
        $('.components5 .s4-wpTopTable .x-title-jryw a').each(function(i, elem) {
            var $element = $(elem);
            if($element&&$element.attr('href')){
                let title = $element.text()
                let href = $element.attr('href')
                hrefs.push(href)
                items[href] = {title:title}
            }
        })
        for(let href of hrefs){
            let href_html
            try {
                href_html = await superagent.get(href)
            }catch(error){
                logger.error(`${href}:${String(error)}`)
            }
            items[href]['html'] = href_html?href_html.text:{}
        }
        return items
	};
}

module.exports = JrgzController;