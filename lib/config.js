module.exports = {
  api: null,
  service: null,
  port: null,
  entry: (target, page) => `./src/entries/${page}/entry-${target}`,
  defaultTitle: 'My app',
  favicon: './public/favicon.ico',
  skipRequests: req => req.originalUrl === '/graphql',
  nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/, /^vuetify/],
  // Paths
  distPath: null,
  templatePath: null,
  serviceWorkerPath: null,
}
