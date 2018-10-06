const express = require('express')
const applyApp = require('./app')
const io = require('@pm2/io')

export class MyEntrypoint extends io.Entrypoint {
  startServer(port) {
    return new Promise((resolve, reject) => {
      const app = express()
  
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
