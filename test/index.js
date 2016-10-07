var openbci = require('..')
var eeg = openbci({ 
  debug: true,
  simulate: false,
})
eeg.on("error", err => console.log('ERR!', err))
eeg.on("reading", reading => console.log(reading))
