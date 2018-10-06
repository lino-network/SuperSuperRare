const express = require('express')
const applyApp = require('./app')
const io = require('@pm2/io')

exports.MyEntrypoint = class MyEntrypoint extends io.Entrypoint {
  onStop (err, cb, code, signal) {
    console.log(`Application stopped with code ${code} or signal ${signal} !`)
    cb()
  }

  onStart (cb, port) {
    return new Promise((resolve, reject) => {
      const app = express()
  
      applyApp(app)
  
      app.listen(port, err => {
        if (err) {
          reject(err)
        } else {
          console.log(`Server listening on ${port}`)
          cb();
          resolve({ app, port })
        }
      })
    }) 
  }
}



// exports.createServer = ({
//   port,
// }) => {
//   return new Promise((resolve, reject) => {
//     const app = express()
//     io.init({
//       metrics: {
//         network: {
//           ports: true
//         }
//       }
//     })

//     applyApp(app)

//     app.listen(port, err => {
//       if (err) {
//         reject(err)
//       } else {
//         console.log(`Server listening on ${port}`)
//         resolve({ app, port })
//       }
//     })
//   })
// }
