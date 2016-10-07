/*

  TODO module should return a kefir stream
  TODO We want to buffer EEG values somehow

  opts is

  {
    port: 9998,      // listen for POST requests on this port
    simulate: true,  // simulate an openBCI
    debug: true,     // console.log gratuitiously
  }

  */

function collector (opts) {
  var openbci = require('./openbci')
  var server = require('./server')
  var s = server(opts.port, function () {
    var eeg = openbci(opts)
    s.on('error', function (err) {})
    s.on('post', function (post) {})
    eeg.on('error', function (err) {})
    eeg.on('sample', function (sample) {})
  })
}

module.exports = collector
