const newman = require('newman');
const fs = require('fs');

describe("test suite", function() {
    this.timeout(15000)
    let node_name = process.env['NODE_NAME']
    it('api', function(done) {
        newman.run({
            collection: JSON.parse(fs.readFileSync(`./test/${node_name}.postman_collection.json`,'utf8')),
            environment: JSON.parse(fs.readFileSync('../config/test/postman_globals.json', 'utf8')),
            reporters: 'cli'
        }, function (err) {
            if (err) { done(err)}
            console.log('api run complete!');
            done();
        });
    });
})