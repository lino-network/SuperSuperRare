module.exports = {
  api: null,
  service: null,
  port: null,
  entry: target => `./src/entry-${target}`,
  defaultTitle: 'My app',
  favicon: './dist/favicon.ico',
  skipRequests: req => req.originalUrl === '/graphql',
  nodeExternalsWhitelist: [/\.css$/, /\?vue&type=style/, /^vuetify/],
  // Paths
  distPath: null,
  templatePath: null,
  serviceWorkerPath: null,
}
