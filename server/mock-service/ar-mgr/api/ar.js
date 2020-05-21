const express = require('express');
const router = express.Router();
const mockLib = require('@nextgen/node-support').mock.service;

function getConvertedFilters(unconvertedFilters, accountId) {
    const filters = JSON.parse(unconvertedFilters);
    
    if (accountId) {
        // check for medicare or marketplace account
        filters.push({
            operator: 'EQ',
            property: 'LobTypeCode',
            value: accountId === '7894797897' ? 'MEDICARE' : 'MARKETPLACE',
            dataType: 'character'
        });
    }

    // convert operators
    filters.forEach((filter, index) => {
        // backend requires operator to be uppercase
        // node support requires operator to be lowercase
        filters[index].operator = filter.operator.toLowerCase();
        // backend requires '*' for wildcard search
        // node support filter doesn't have wildcard
        filters[index].value = filter.value.split('*')[0];
    });

    // return converted filters
    return JSON.stringify(filters);
}

// get accounts
router.get('/member/search', (req, res) => {
    req.headers.filter = getConvertedFilters(req.headers.filter);
    mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.accounts.json');
});

// get account by id
router.get('/accounts/:SubscrbId', (req, res) => {
    mockLib.serveMockById(req, res, 'ar-mgr/ar/list.of.account.details.json', 'SubscrbId', req.params.SubscrbId);
});

// get billing periods by id
router.get('/billing-period/:AccountID', (req, res) => {
    req.headers.filter = getConvertedFilters(req.headers.filter, req.params.AccountID);
    mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.billing.periods.json');
});

// get billing periods meta-data
router.get('/billing-period/:LobTypeCode/meta-data', (req, res) => {
    mockLib.serveMockById(req, res, 'ar-mgr/ar/list.of.metadata.json', 'LobTypeCode', req.params.LobTypeCode);
});
module.exports = router;
