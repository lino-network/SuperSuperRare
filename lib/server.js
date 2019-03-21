const express = require('express');
const applyApp = require('./app');
const Sentry = require('@sentry/node');
var cluster = require('cluster');
const { createTerminus } = require('@godaddy/terminus');

exports.createServer = ({ port, host }) => {
  return new Promise(async (resolve, reject) => {
    if (cluster.isMaster && process.env.NODE_ENV === 'production' && false) {
      const numCPUs = require('os').cpus().length;
      console.log('Found ' + numCPUs + ' Cores');
      for (var i = 0; i < numCPUs; i ++) {
        cluster.fork();
        cluster.on('online', function(worker) {
          console.log('Worker ' + worker.process.pid + ' is online');
        });
        cluster.on('exit', function(worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker');
            cluster.fork();
        });
      }
    } else {
      const app = express();
      if (process.env.NODE_ENV === 'production') {
        Sentry.init({
          dsn: 'https://752f65755df346989e7e544ef787707f@sentry.io/1402448',
          environment: `${process.env.EXPRESS_SENTRY_ENVIRONMENT}-ssr`,
          release: process.env.EXPRESS_SENTRY_RELEASE
        });
        // The request handler must be the first middleware on the app
        app.use(Sentry.Handlers.requestHandler());
      }
      await applyApp(app);
      if (process.env.NODE_ENV === 'production') {
        // The error handler must be before any other error middleware
        app.use(Sentry.Handlers.errorHandler());
        // Optional fallthrough error handler
        app.use(function onError (err, req, res, next) {
          // The error id is attached to `res.sentry` to be returned
          // and optionally displayed to the user for support.
          res.statusCode = 500;
          console.log(res.sentry);
          res.end(res.sentry + '\n');
        });
      }
      let server = app.listen(port, err => {
        if (err) {
          console.log('Server Side Log:', err)
          reject(err);
        } else {
          console.log('Process ' + process.pid + ` Server listening on :${port}`);
          resolve({
            app,
            port
          });
        }
      });
      createTerminus(server, {
        signal: 'SIGTERM',
        timeout: 20000
      })
    }
  });
};
