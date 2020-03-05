const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mockConfig = require('@nextgen/node-support').mock.config;

mockConfig.baseFolder = path.resolve(__dirname, '../mocks/') + '/';
app.use(bodyParser.json());

require('./mock-service')(app); // serve mocks
app.listen(8300, () => console.log(`Mock server listens on port 8300 (AR)`));