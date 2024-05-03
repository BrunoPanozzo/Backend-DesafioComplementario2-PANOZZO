const MongoStore = require('connect-mongo')
const session = require('express-session')
const { dbName, mongoUrl } = require('../dbConfig')

const storage = MongoStore.create({
    dbName,
    mongoUrl,
    ttl: 60
})

module.exports = session({
    store: storage,
    secret: 'adasd127812be',
    resave: true,
    saveUninitialized: true
})