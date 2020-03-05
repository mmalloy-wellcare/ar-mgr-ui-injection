const express = require('express');
const router = express.Router();
const mockLib = require('@nextgen/node-support').mock.service;

// get transactions
router.get('/', (req, res) => {
    mockLib.serveMock(req, res, 'orchestrator/transaction/list.of.transactions.json');
});

module.exports = router;