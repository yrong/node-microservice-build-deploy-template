#!/usr/bin/env node

const config = require('config')
const db = require('sequelize-wrapper-advanced')
const pg_config = config.get('postgres-'+process.env['NODE_NAME'])

db.init(pg_config)

db.models.sequelize.sync().then(function(){
    db.postinit().then(()=>{
        console.log('intialize schema success!')
        process.exit(0)
    })
})

