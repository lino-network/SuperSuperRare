const express = require('express')
const applyApp = require('./app')

exports.createServer = ({
  port,
  host,
}) => {
  return new Promise(async (resolve, reject) => {
    const app = express()

    await applyApp(app)
    if (host) {
      app.listen(port, host, err => {
        if (err) {
          reject(err)
        } else {
          console.log(`Server listening on ${host}:${port}`)
          resolve({ app, port })
        }
      })
    } else {
      app.listen(port, err => {
        if (err) {
          reject(err)
        } else {
          console.log(`Server listening on :${port}`)
          resolve({ app, port })
        }
      })
    }
  })
}
