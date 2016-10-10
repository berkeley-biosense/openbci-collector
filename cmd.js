#! /usr/bin/env node

var argv = require("minimist")(process.argv.slice(2), {
  defaults: {
    simulate: false,
    debug: true,
    buffer: 250,
  }
})

if (!argv.port)
  throw 'Must pass in port! e.g. --port=8889'
if (!argv.outdir)
  throw 'Must pass in outddir! e.g. --outdir=out/'

var collector = require('.')({
  port: argv.port,
  simulate: argv.simulate,
  debug: argv.debug,
  buffer: argv.buffer,
  outdir: argv.outdir
})

collector.on('ready', function () {
  console.log('collector is ready!')})
