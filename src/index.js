var EventEmitter = require('events').EventEmitter
var append = require('fs').appendFile
var join = require('path').join
function stringify (reading) {
  return reading.buffer
    .map(r => r.channelData.join(','))
    .join('\n')+'\n'
}

var mkdir = require('mkdir-p')
/*

  TODO module should return a kefir stream

  opts is

  {
    port: 9998,      // listen for POST requests on this port
    simulate: true,  // simulate an openBCI
    debug: true,     // console.log gratuitiously
    buffer: 250,     // # of raw EEG readings per buffer
    outfile: 'out.csv' // csv file to save stuff in
  }

  */


function collector (opts) {
  if (!opts.outdir)
    opts.outdir = 'out/'
  var recording = false
  var openbci = require('./openbci')
  var server = require('./server')
  var outfile = null
  var emitter = new EventEmitter()
  var emit = ev => x => emitter.emit(ev, x)
  var err = e => emitter.emit('error', e)
  var eeg = null
  var s = server(opts.port, function () {
    mkdir(opts.outdir, function () {
      eeg = openbci(opts)
      eeg.on('ready', function () {
        emit('ready')()
        s.on('error', err)
        eeg.on('error', err)
        s.on('post', function (p) {
          // if post type == start-recording
          if (p.type === 'start-recording') {
            if (opts.debug)
              console.log('got start-recording message!',
                          JSON.stringify(p))
            if (typeof p.duration === 'number') {
              recording = true
              outfile = join(
                opts.outdir,
                `${p.sid}.${p.tag}.${Date.now()}.csv`)
              let timeout = p.duration*1000 // convert sec to ms
              setTimeout(() => recording=false, timeout)
            }
            else
              throw 'Post duration is not a number!: ' +
              JSON.stringify(p)
          }
          emit('post')(p) // emit post
        })
        eeg.on('reading', function (r) {
          // if (opts.debug)
          //   console.log('recieved reading', recording)
          if (recording && outfile) {
            if (opts.debug)
              console.log('appending reading to', outfile)
            append(outfile, stringify(r), function (err) {
              if (err)
                throw err
            })
          }
          emit('reading')(r)
        })
      })
    })
  })
  emitter.close = function () {
    eeg.disconnect()
    s.close()
  }
  return emitter
}

module.exports = collector
