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

function getInvoiceConvertedFilters(unconvertedFilters) {
    const filters = JSON.parse(unconvertedFilters);
    // convert operators
    filters.forEach((filter, index) => {
        let filterField;
        switch (filter.property) {
            case 'ISSUERSUBCRBID':
              filterField  = 'SubscrbID';
              break;
            case 'SUBCRBFIRSTNAME':
              filterField  = 'FirstName';
              break;
            case 'SUBCRBLASTNAME':
              filterField  = 'LastName';
              break;
            case 'SUBCRBMIDNAME':
              filterField  = 'MidName';
              break;
            case 'INVOICEID':
              filterField  = 'InvoiceId';
              break;
            default:
              filterField = filter.property;
              break;
          } 
        // backend requires operator to be uppercase
        // node support requires operator to be lowercase
        filters[index].operator = filter.operator.toLowerCase();
        filters[index].value = filter.value.toLowerCase();
        // backend requires '*' for wildcard search
        // node support filter doesn't have wildcard
        filters[index].value = filter.value.split('*')[0];
        filters[index].property = filterField;
    });
    // return converted filters
    return JSON.stringify(filters);
}

// get accounts/invoice
router.get('/:searchType/search', (req, res) => {
    if (req.params.searchType === "member") {
        req.headers.filter = getConvertedFilters(req.headers.filter);
        mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.accounts.json');
    } else {
        req.headers.filter = getInvoiceConvertedFilters(req.headers.filter);
        mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.invoice.details.json');
    }
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

// get transactions based on period span sk
router.get('/billing-period/:BlngPerSpanSk/transactions', (req, res) => {
    req.headers.filter = getConvertedFilters(req.headers.filter);
    mockLib.serveMock(req, res, 'ar-mgr/ar/list.of.transactions.json');
});

// get invoices for sub id
router.get('/:SubscrbId/invoices' , (req,res) => {
    req.headers.filter = JSON.stringify([{
        operator: 'eq',
        value: req.params.SubscrbId,
        property: 'SubscrbId',
        dataType: 'character'
    }, {
        operator: 'eq',
        value: req.headers.includerejected,
        property: 'includeRejected',
        dataType: 'character'
    }, {
        operator: 'eq',
        value: req.headers.includevoided,
        property: 'includeVoided',
        dataType: 'character'
    }]);
    mockLib.serveMock(req,res, 'ar-mgr/ar/list.of.invoices.json')
});

router.get('/:SubscrbId/payments' , (req,res) => {
    req.headers.filter = JSON.stringify([{
        operator: 'eq',
        value: req.params.SubscrbId,
        property: 'SubscrbId',
        dataType: 'character'
    }]);
    mockLib.serveMock(req,res, 'ar-mgr/ar/list.of.payment.details.json')
});

module.exports = router;
