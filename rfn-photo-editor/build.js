var fs = require('fs');
var fsPath = require('fs-path');
var gulp = require('gulp')
var uglify = require('gulp-uglify')

var script = '/* eslint-disable */'
    + fs.readFileSync('js/camanJS.js')
    + '\n'
    + fs.readFileSync('app/lib/imagetext-inserter.lib.js')
    + '\n'
    + fs.readFileSync('app/lib/ring-image-cropper.lib.js')
    + '\n'
    + fs.readFileSync('app/shared/controllers/ring-photo-editor.controller.v3.js')
    + '/* eslint-enable */\n\n';

// var template = String(fs.readFileSync('pages/ring-photo-editor.v3.html'));
// template = template.substring(template.indexOf('<style>'));
//
// var finalTemplate = script + template;
// fsPath.writeFileSync('final.html', finalTemplate);

fsPath.writeFileSync('build/src.js', script);
gulp.src('build/src.js')
// .pipe(uglify('src.min', {mangle: true}))
.pipe(gulp.dest('build/'));