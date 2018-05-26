'use strict'

const cluster = require('cluster')
const http = require('http')
const manager = require('./manager/manager')
const lua = require('./lua/lua')
const subscriber = require('./redis/subscriber')

const numCPUs = require('os').cpus().length

//initializer()

if (cluster.isMaster) {
  console.log('Starting Manager Server...')
  console.log(`Master ${process.pid} is running`)
  lua()

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
    cluster.fork()
  })
}
else {
  subscriber()
  const server = http.createServer().listen(8000)

  server.on('request', function(req, res){
    if(req.method == 'POST') {
        req.on('data', function (data) {
          manager(JSON.parse(data))
          res.writeHead(200)
          res.write('OK')
          res.end()
        })
    }
    else {
      res.writeHead(405, {'Content-type':'application/json'})
      res.write(JSON.stringify({error: "Method not allowed"}, 0, 4))
    }
  })
}

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
