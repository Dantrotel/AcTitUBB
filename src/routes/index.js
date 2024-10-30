const express = require('express');

const personRouter = require('./person.route');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/persons', personRouter);
}

module.exports = routerApi;