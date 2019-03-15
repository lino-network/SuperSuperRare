const express = require('express')
const applyApp = require('./app')

exports.createServer = ({
  port,
  host,
}) => {
  return new Promise(async (resolve, reject) => {
    const app = express()
    await applyApp(app)
      app.listen(port, err => {
        if (err) {
          console.log('Server Side Log:', err)
          reject(err)
        } else {
          console.log(`Server listening on :${port}`)
          resolve({ app, port })
        }
      })
  })
}
