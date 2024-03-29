const express = require('express');
const { createBundleRenderer } = require('vue-server-renderer');
const fs = require('fs');
const favicon = require('serve-favicon');
const LRU = require('lru-cache');
const compression = require('compression');
var os = require('os');

const config = require('./config');

const DEFAULT_OPTIONS = {
  prodOnly: false
};

module.exports = (app, options) => {
  global.backendURL = process.env.VUE_APP_GRAPHQL_HTTP;

  options = Object.assign({}, DEFAULT_OPTIONS, options);

  const isProd = process.env.NODE_ENV === 'production';

  if (options.prodOnly && !isProd) return;

  const templatePath = config.templatePath;

  try {
    // Vue bundle renderer
    let renderer;
    // In development: wait for webpack compilation
    // when receiving a SSR request
    let readyPromise;

    const defaultRendererOptions = {
      cache: LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false,
      inject: false
    };

    if (isProd) {
      // In production: create server renderer using template and built server bundle.
      // The server bundle is generated by vue-ssr-webpack-plugin.
      const template = fs.readFileSync(templatePath, 'utf-8');
      const serverBundle = require(`${config.distPath}/vue-ssr-server-bundle.json`);
      // The client manifests are optional, but it allows the renderer
      // to automatically infer preload/prefetch links and directly add <script>
      // tags for any async chunks used during render, avoiding waterfall requests.
      const clientManifest = require(`${config.distPath}/vue-ssr-client-manifest.json`);
      renderer = createBundleRenderer(serverBundle, {
        ...defaultRendererOptions,
        template,
        clientManifest
      });
    } else {
      // In development: setup the dev server with watch and hot-reload,
      // and create a new renderer on bundle / index template update.
      const { setupDevServer } = require('./dev-server');
      readyPromise = setupDevServer({
        server: app,
        templatePath,
        onUpdate: ({ serverBundle }, options) => {
          // Re-create the bundle renderer
          renderer = createBundleRenderer(serverBundle, {
            ...defaultRendererOptions,
            ...options
          });
        }
      });
    }

    // Serve static files
    const serve = (filePath, cache) =>
      express.static(filePath, {
        maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0,
        index: false
      });

    // Serve static files
    app.enable('etag'); // use strong etags
    app.use(compression({ threshold: 0 }));
    app.use(favicon(config.favicon));
    if (config.api.hasPlugin('pwa')) {
      app.use('/service-worker.js', serve(config.serviceWorkerPath, true));
    }
    const serveStaticFiles = serve(config.distPath, true);
    app.use((req, res, next) => {
      res.setHeader('Cache-Control', 'public');
      res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString());
      if (/index\.html/g.test(req.path)) {
        next();
      } else {
        serveStaticFiles(req, res, next);
      }
    });

    // Render the Vue app using the bundle renderer
    const renderApp = (req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'private, no-cache, no-store');
      // res.setHeader('X-Frame-Options', 'DENY')
      const context = {
        req,
        url: req.url,
        title: config.defaultTitle
      };
      renderer.renderToString(context, (err, html) => {
        if (err) {
          const code = 500;
          console.error(`error during render : ${req.url}`);
          console.error(err);

          // Render Error Page
          res.status(code);
          let text = '500 | Internal Server Error';

          if (!isProd) {
            text += '<br>';
            text += `<pre>${err.stack}</pre>`;
          }

          res.send(text);
        } else {
          res.status(context.httpCode || 200).send(html);
        }
      });
    };

    // Process SSR requests
    let ssr;
    if (isProd) {
      ssr = renderApp;
    } else {
      // In development: wait for webpack compilation
      // when receiving a SSR request
      ssr = (req, res) => {
        readyPromise.then(() => renderApp(req, res)).catch(console.error);
      };
    }

    app.get('/health/ready', (req, res) => {
      res.status(200).send('ok');
    });
    app.get('/health/live', (req, res) => {
      res.status(200).send('ok');
    });

    app.get('*', (req, res, next) => {
      console.log(os.freemem());
      if (config.skipRequests(req)) {
        return next();
      }
      ssr(req, res);
    });
  } catch (e) {
    console.error(e);
  }
};
