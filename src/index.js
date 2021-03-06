var EventEmitter = require('events').EventEmitter
var append = require('fs').appendFile
var mkdir = require('mkdir-p')
var join = require('path').join

function stringify (reading) {
  return reading.buffer
    .map(r => r.channelData.join(','))
    .join('\n')+'\n'
}

// validate start recording messages
function validate (p) {
  if (p.type === 'start-recording')
    if (typeof p.duration === 'number')
      return true
  return false
}

function collector (opts) {
  if (!opts.outdir)
    opts.outdir = 'out/'
  var server = require('./server')
  var openbci = require('./openbci')
  var emitter = new EventEmitter()
  var emit = ev => x => emitter.emit(ev, x)
  var err = e => emitter.emit('error', e)
  // references we leave around
  var eeg = null
  var s = null
  // mutable state
  var ongoingRecordings = {} // this will look like:
  //                            {  filename: { framesRecorded, framesTotal }  }
  var sampleRate = null

  // get start-recording messages
  // adds stuff to ongoingRecordings
  function handlePost (sampleRate) {

    // returns post handler function (p) { }
    return function (p) {
      if (validate(p)) {
        if (opts.debug)
          console.log('got start-recording message!', JSON.stringify(p))
        let filename = `${p.sid}.${p.tag}.${Date.now()}.csv`
        let path = join(opts.outdir, filename)
        ongoingRecordings[path] = {
          framesRecorded: 0,
          framesTotal: sampleRate * p.duration,
        }
        emit('post')(p) // emit post
      }
    }
  }

  function handleReading (sampleRate) {
    return function (r) {
      if (Object.keys(ongoingRecordings).length > 0) {
        let filenames = Object.keys(ongoingRecordings)
            .forEach(filename => {
              if (opts.debug)
                console.log('appending reading to', filename)
              append(filename, stringify(r), err => {
                if (err) throw err
                ongoingRecordings[filename].framesRecorded+=sampleRate
                let recorded = ongoingRecordings[filename].framesRecorded
                let total = ongoingRecordings[filename].framesTotal
                if (recorded == total) {
                  emit('done-recording')(filename)
                  delete ongoingRecordings[filename]
                }
              })
            })
      }
    }
  }

  s = server(opts.port, function () {
    mkdir(opts.outdir, function () {
      eeg = openbci(opts)
      eeg.on('ready', function (sampleRate) {
        emit('ready')(sampleRate)
        s.on('error', err)
        eeg.on('error', err)
        s.on('post', handlePost(sampleRate))
        eeg.on('reading', handleReading(sampleRate))
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
