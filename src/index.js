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
  var openbci = require('./openbci')
  var server = require('./server')
  var eeg = openbci(opts)
  var s = server(opts.port, function () {
    let emit = d => emitter.emit('data', d)
    let err = e => emitter.emit('error', e)
    s.on('error', err)
    eeg.on('error', err)
    s.on('post', emit)
    eeg.on('reading', emit)
  })
  emitter.close = function () {
    eeg.disconnect()
    s.close()
  }
  return emitter
}

module.exports = collector
