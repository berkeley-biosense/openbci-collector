var test = require('tape')
var request = require('request-json')
var collector = require('..')
var join = require('path').join
var exec = require('child_process').execSync
var readdir = require('fs').readdirSync
var read = require('fs').readFileSync

var port = 8999
var outdir = join(__dirname, '/e2e-test-output')

function outfiles () {
  return readdir(outdir).filter(f => {
    let parts = f.split('.')
    return parts[0]==='15'&&parts[1]=='breath'
  })
}

function every (arr, pred) {
  return arr.reduce(function (acc, cur) {
    if (acc===false)
      return false
    return pred(cur)
  }, true)
}

var start_record_message = {
  "type": "start-recording",
  "tag": "breath", // tag - probably task name
  "duration": 1, // duration of recording, in seconds
  "sid": 15, // subject id
}

var c = null

test('record 2 things simultaneously', t => {
  function checkBothCSVs () {
    var outs = outfiles()
    t.equals(outs.length, 2, 'there are 2 outfiles')
    var outfile = outs[0]
    var contents = read(join(outdir, outfile)).toString()
    var entries = contents.split('\n')
    // every line has 8 entries (except last)
    let all8 = every(entries.slice(0,entries.length-2), e => e.split(',').length==8)
    t.equal(all8, true,
            'all lines of csv length 8')
    t.ok(entries,
         "there are lines of the file")
    t.ok(entries.length>249,
         'after 1 sec, number of entries > 249')
    t.end()
  }
  c = collector({
    // debug: true,
    port: port,
    simulate: true,
    buffer: 50,
    outdir: outdir,
  })
  c.on('ready', function  () {
    var client = request.createClient('http://localhost:'+port+'/')
    setTimeout(checkBothCSVs, 1500)
    // post a record message
    client.post('/', start_record_message, function (_) {
      client.post('/', start_record_message, function (err, res, body) {
        t.notOk(err, 'no error')
        t.equals(res.statusCode, 202,
                 '202 response')
      })
    })
  })
})

test.onFinish(() => {
  clean()
  c.close()
})

function clean () {
  exec(`rm ${outdir}/*`)
}
