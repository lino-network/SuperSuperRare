const express = require('express')
const applyApp = require('./app')

exports.createServer = ({
  port,
}) => {
  return new Promise((resolve, reject) => {
    const app = express()
    const io = require('@pm2/io')
    io.init({
      metrics: {
        network: {
          ports: true
        }
      }
    })

    applyApp(app)

    app.listen(port, err => {
      if (err) {
        reject(err)
      } else {
        console.log(`Server listening on ${port}`)
        resolve({ app, port })
      }
    })
  })
}
