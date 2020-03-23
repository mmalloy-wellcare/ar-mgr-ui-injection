'use strict';

const express = require('express');
const router = express.Router();

// mocks for accounts API
router.use('/ar', require('./api/ar'));

module.exports = router;
