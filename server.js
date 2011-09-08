// Import libraries
var express = require('express');
var yaml = require('yaml');
var fs = require('fs');

// Load listeners
var listener_files = fs.readdirSync(__dirname + "/listeners");
for (var i = 0; i < listener_files.length; i++) {
    var listener = listener_files[i];
    global[listener.replace('.js', '')] = 
        require(__dirname + "/listeners/" + listener);
}

// Load configuration and inputs
var config_loc = process.env.TELEMETRY_CONFIG || __dirname + "/config.yaml";
var config = yaml.eval(fs.readFileSync(config_loc, 'utf8'));  //FIXME - this is just for testing. the real file should be in home dir
global.telemetry = new (require(__dirname + '/telemetry.js'))(config);

// Create the telemetry server and assign inputs
var app = express.createServer();
app.use(express.bodyParser());
app.post('/input/:input', function(req, res, next) {
    var input = req.params.input;
    if (telemetry.inputs[input] === undefined) {
        // Bad input, send 404
        res.end('', 404);
        return;
    }
    
    // Send success
    var data = JSON.parse(req.body.source);
    for (var i = 0; i < telemetry.inputs[input].length; i++) {
        telemetry.inputs[input][i].post(data);
    }
    res.end('', 200);
});

// Start the telemetry server
app.listen(process.argv[2] || 7000);