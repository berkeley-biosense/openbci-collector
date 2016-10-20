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
  if (!opts.buffer)
    opts.buffer=250
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
    return function (p) {
      // returns post handler function (p) { }
      if (validate(p)) {
        if (opts.debug) console.log('got start-recording message!', JSON.stringify(p))
        let filename = join(
          opts.outdir,
          `${p.sid}.${p.tag}.${Date.now()}.csv`)
        ongoingRecordings[filename] = {
          framesRecorded: 0,
          framesTotal: sampleRate * p.duration,
        }
        emit('post')(p) // emit post
      }
    }
  }

  function handleReading (r) {
    // if (opts.debug)
    //   console.log('recieved reading', recording)
    if (ongoingRecordings) {
      if (opts.debug)
        console.log('appending reading to', outfile)
      let filenames = Object.keys(ongoingRecordings)
          .forEach(filename => {
            append(filename, stringify(r), function (err) {
              if (err)
                throw err
              let rec = ongoingRecordings[filename]
              let recorded = rec.framesRecorded+=opts.buffer
              let total = ongoingRecordings[filename].totalFrames
              if (recorded >= total)
                delete(ongoingRecordings, filename)
            })
          })
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
        eeg.on('reading', handleReading)
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
