# pb-ar-ui
Premium Billing Accounts Receivable MicroFrontend

## Commands
* ```npm install``` - Installs the dependencies needed for the project.
* ```npm run start:local``` - Starts the mock server (port 8300) and serves the application (port 8200).
* ```npm run start:dev``` - Serves the application (port 8200). API calls made return development data.
* ```npm run start:qa``` - Serves the application (port 8200). API calls made return QA data.
* ```npm run mock-services``` - Starts the mock server only (port 8300).
* ```npm run test``` - Executes unit tests via Karma and shows coverage report.

## Running Locally
**Make sure you have the node package installed**
1. Run "npm run start:local" in "pb-ar-ui". This should run both the application and the AR mock server concurenntly.
2. Route to http://localhost:8200/#/pb-ar-ui/account-search to see the Account Search screen.
3. To see account details, search for an account and click the 'Subscriber ID' on the results OR route to http://localhost:8200/#/pb-ar-ui/account-details/:SubscriberID where ':SubscriberID' is the account's Subscriber ID, (ex: 827321841).