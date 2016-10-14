var test = require('tape')
var request = require('request-json')
var collector = require('..')
var join = require('path').join

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

var port = 8899
var outdir = join(__dirname, '/e2e-test-output/')
var c = null
test('test collection protocol', t => {
  c = collector({
    // debug: true,
    port: port,
    simulate: true,
    buffer: 50,
    outdir: outdir,
  })
  c.on('ready', function  () {
    var client = request.createClient('http://localhost:'+port+'/')
    // post a record message
    client.post('/', start_record_message, function (err, res, body) {
      t.notOk(err)
      t.equals(202, res.statusCode,
              'response should be 202')
      // console.log(body)
      // wait 15 seconds (little over our wait time)
      function checkCSV () {
        var readdir = require('fs').readdirSync
        var outfile = readdir(
          outdir)
            .filter(f => {
              let parts = f.split('.')
              return parts[0]==='15'&&parts[1]=='breath'
            })[0]
        var read = require('fs').readFileSync
        var contents = read(join(outdir, outfile)).toString()
        var entries = contents.split('\n')
        // every line has 8 entries (except last)
        let all8 = every(entries.slice(0,entries.length-1), function (e) {
          console.log(e.split(',').length)
          return e.split(',').length==8
        })
        t.equal(all8, true,
                'all lines of csv length 8')
        t.ok(entries,
             "there are lines of the file")
        // t.ok(entries.length>120,
        //          "more than 120 entries")
        var firstEntry = entries[0].split(',')
        t.ok(firstEntry.length, 8,
            'there are 8 voltage items in the first logged entry')
        t.end()
      }
      setTimeout(checkCSV, 1300)
    })
  })
})

test.onFinish(function () {
  var exec = require('child_process').execSync
  exec(`rm ${outdir}/*`)
  c.close()
  console.log('done!')
})
