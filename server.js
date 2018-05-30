'use strict'

const cluster = require('cluster')
const http = require('http')
const initializer = require('./initializer/initializer')
const manager = require('./manager/manager')
const lua = require('./lua/lua')
const subscriber = require('./redis/subscriber')

const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  console.log('Starting Manager Server...')
  console.log('Master %d is running', process.pid)
  lua()
  initializer()

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('Worker %d died', worker.process.pid)
    cluster.fork()
  })
}
else {
  subscriber()
  const server = http.createServer().listen(80)

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
      res.writeHead(405)
      res.end()
    }
  })
}

process.on('unhandledRejection', (reason, location) => {
  console.error('Unhandled Rejection at:', location, 'reason:', reason)
})
