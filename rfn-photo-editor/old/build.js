var fs = require('fs');
var fsPath = require('fs-path');
var gulp = require('gulp')
var uglify = require('gulp-uglify')

var script = '/* eslint-disable */\n\n'
    + fs.readFileSync('js/camanJS.js')
    + '\n\n'
    + fs.readFileSync('ringid/rg-imagetext-inserter.lib.js')
    + '\n\n'
    + fs.readFileSync('ringid/rg-image-cropper.lib.js')
    + '\n\n'
    + fs.readFileSync('ringid/rg-photo-editor.controller.js')
    + '/* eslint-enable */\n\n';

// var script = '/* eslint-disable */\n\n'
//     + fs.readFileSync('js/camanJS.js')
//     + '\n\n'
//     + fs.readFileSync('app/lib/imagetext-inserter.lib.js')
//     + '\n\n'
//     + fs.readFileSync('app/lib/ring-image-cropper.lib.js')
//     + '\n\n'
//     + fs.readFileSync('app/shared/controllers/ring-photo-editor.controller.v4.js')
//     + '/* eslint-enable */\n\n';


fsPath.writeFileSync('build/photo-editor.js', script);
gulp.src('build/photo-editor.js')
.pipe(uglify('src.min', {mangle: true}))
.pipe(gulp.dest('build/minified/'));