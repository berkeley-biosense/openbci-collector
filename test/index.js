var openbci = require('..')
var eeg = openbci({
  debug: true,
  simulate: true,
})
eeg.on("error", err => console.log('ERR!', err))
eeg.on("reading", reading => console.log(reading))
