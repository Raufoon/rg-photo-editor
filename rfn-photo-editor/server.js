var https = require('https');
var fs = require('fs');
var tls = require('tls');
var privateKey = fs.readFileSync('https-data/key.pem').toString();
var certificate = fs.readFileSync('https-data/cert.pem').toString();
var credentials = tls.createSecureContext({
    key: privateKey,
    cert: certificate,
});

var template = String(fs.readFileSync('pages/photo-editor.template.html'));
var js = String(fs.readFileSync('build/minified/photo-editor.all.js'));

var server = https.createServer(credentials, function(request, response) {
    switch (request.url) {
        case '/ringid/photo-editor/template':
            response.write(template);
            response.end();
            break;
        case '/ringid/photo-editor/script':
            response.end(js);
            break;
    }
});

server.listen(2300);
console.log("Server is listening...");