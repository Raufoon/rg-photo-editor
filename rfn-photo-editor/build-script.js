var fs = require('fs');
var fsPath = require('fs-path');
var gulp = require('gulp')
var uglify = require('gulp-uglify')

var script = '/* eslint-disable */\n\n'
    + fs.readFileSync('scripts/camanJS.js')
    + '\n\n'
    + fs.readFileSync('scripts/textinserter.lib.js')
    + '\n\n'
    + fs.readFileSync('scripts/cropper.lib.js')
    + '\n\n'
    + fs.readFileSync('scripts/photo-editor.controller.js')
    + '/* eslint-enable */\n\n';

fsPath.writeFileSync('build/photo-editor.all.js', script);
gulp.src('build/photo-editor.all.js')
    .pipe(uglify('photo-editor.min', {mangle: true}))
    .pipe(gulp.dest('build/minified/'));