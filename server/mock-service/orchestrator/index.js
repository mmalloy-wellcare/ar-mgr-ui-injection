'use strict';

const express = require('express');
const router = express.Router();

// mocks for transactions API
router.use('/transactions', require('./api/transactions'));

module.exports = router;
