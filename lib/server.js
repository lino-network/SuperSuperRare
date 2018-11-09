const express = require('express')
const applyApp = require('./app')

exports.createServer = ({
  port,
}) => {
  return new Promise((resolve, reject) => {
    const app = express()

    let i = applyApp(app)

    if (i) {
      reject('unable to start server')
    }

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
