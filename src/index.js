var EventEmitter = require('events').EventEmitter
/*

  TODO module should return a kefir stream

  opts is

  {
    port: 9998,      // listen for POST requests on this port
    simulate: true,  // simulate an openBCI
    debug: true,     // console.log gratuitiously
    buffer: 250,     // # of raw EEG readings per buffer
  }

  */


function collector (opts) {
  var emitter = new EventEmitter()
  function emit (data) {
    emitter.emit('data', data)
  }
  function err (err) {
    emitter.emit('err', err)
  }
  var openbci = require('./openbci')
  var server = require('./server')
  var eeg = openbci(opts)
  var s = server(opts.port, function () {
    s.on('error', err)
    eeg.on('error', err)
    s.on('post', emit)
    eeg.on('buffer', emit)
  })
  emitter.close = function () {
    eeg.disconnect()
    s.close()
  }
  return emitter
}

module.exports = collector
