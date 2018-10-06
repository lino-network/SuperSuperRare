const express = require('express')
const applyApp = require('./app')
const io = require('@pm2/io')

exports.MyEntrypoint = class MyEntrypoint extends io.Entrypoint {
  constructor(port) {
    console.log(port, 'asd');
    super();
    this.port = port;
  }

  onStop (err, cb, code, signal) {
    console.log(`Application stopped with code ${code} or signal ${signal} !`)
    cb()
  }

  onStart (cb) {
    console.log('wwww', this.port);
    return new Promise((resolve, reject) => {
      const app = express()
  
      applyApp(app)
      let port = this.port;
      console.log(port, this.port, 'ssss');
      app.listen(port, err => {
        if (err) {
          reject(err)
        } else {
          console.log(port, this.port, 'ssss');
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
