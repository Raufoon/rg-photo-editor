var fs = require('fs');

var library = '<script>'
    + fs.readFileSync('js/camanJS.js')
    + '\n'
    + fs.readFileSync('app/lib/imagetext-inserter.lib.js')
    + '\n'
    + fs.readFileSync('app/lib/ring-image-cropper.lib.js')
    + '\n'
    + fs.readFileSync('app/shared/controllers/ring-photo-editor-controller.v3.js')
    + '</script>.';

var runHtmlFile = fs.readFileSync('run.html');
runHtmlFile.replace('');