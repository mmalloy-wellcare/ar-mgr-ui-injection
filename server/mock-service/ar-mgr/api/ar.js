const express = require('express');
const router = express.Router();
const mockLib = require('@nextgen/node-support').mock.service;

// get accounts
router.get('/member/search', (req, res) => {
    // search filters
    const filters = JSON.parse(req.headers.filter);
    
    // convert operators
    filters.forEach((filter, index) => {
        // backend requires operator to be uppercase
        // node support requires operator to be lowercase
        filters[index].operator = filter.operator.toLowerCase();
        // backend requires '*' for wildcard search
        // node support filter doesn't have wildcard
        filters[index].value = filter.value.split('*')[0];
    });

    // set filter
    req.headers.filter = JSON.stringify(filters);

    mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.accounts.json');
});

// get account by id
router.get('/accounts/:SubscrbId', (req, res) => {
    mockLib.serveMockById(req, res, 'ar-mgr/ar/list.of.account.details.json', 'SubscrbId', req.params.SubscrbId);
});

// get billing periods by id
router.get('/billing-period/:AccountID', (req, res) => {
    // billing period filters
    const filters = JSON.parse(req.headers.filter);
    
    // convert operators
    filters.forEach((filter, index) => {
        // backend requires operator to be uppercase
        // node support requires operator to be lowercase
        filters[index].operator = filter.operator.toLowerCase();
    });

    // set filter
    req.headers.filter = JSON.stringify(filters);

    mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.billing.periods.json');
});

// get billing periods meta-data
router.get('/billing-period/:lob/meta-data', (req, res) => {
    mockLib.serveMockById(req, res, 'ar-mgr/ar/list.of.metadata.json', 'lob', req.params.lob);
});
module.exports = router;