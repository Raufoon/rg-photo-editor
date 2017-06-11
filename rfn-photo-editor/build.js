var fs = require('fs');
var fsPath = require('fs-path');
var gulp = require('gulp')
var uglify = require('gulp-uglify')

var script = '/* eslint-disable */'
    + fs.readFileSync('js/camanJS.js')
    + '\n'
    + fs.readFileSync('ringid/rg-imagetext-inserter.lib.js')
    + '\n'
    + fs.readFileSync('ringid/rg-image-cropper.lib.js')
    + '\n'
    + fs.readFileSync('ringid/rg-photo-editor.controller.js')
    + '/* eslint-enable */\n\n';


fsPath.writeFileSync('build/photo-editor.js', script);
gulp.src('build/photo-editor.js')
.pipe(uglify('src.min', {mangle: true}))
.pipe(gulp.dest('build/minified/'));