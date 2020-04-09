'use strict';

module.exports = (app) => {

  // to all responses add application/json header
  app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
  });

  // serve acounts receivable mocks
  app.use('/premium-billing/ar-mgr/v1', require('./ar-mgr'));

  // catch all errors block
  app.use((data, req, res, next) => {

    if (res.headerSent) {
      return next(err);
    }

    res.status(err.status || 500);

    let errorMessage = err.message || err;
    if (typeof errorMessage === 'string' && errorMessage.startsWith('errors.')) {
      errorMessage = res.__t(errorMessage);
    }

    res.send({
      code: err.code || err.status || 9999,
      message: errorMessage,
      stack: err.stack
    });

  });

}
