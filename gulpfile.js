'use strict';

var gulp = require('gulp'),
    fs = require('fs');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('jshint', function () {
    return gulp.src(['*.js', 'app/**/*.js', 'public/scripts/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')));
});

gulp.task('serve', function () {
  $.nodemon({ script: 'server.js'});
});

gulp.task('distapp', function() {
  var size = gulp.src('server.js').pipe(gulp.dest('dist')).pipe($.size());

  size += gulp.src('app/**/*.js').pipe(gulp.dest('dist/app')).pipe($.size());

  return size;
});

gulp.task('distpublic', function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('public/**/*.html')
        .pipe($.useref.assets({searchPath: 'public'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist/public'))
        .pipe($.size());
});

gulp.task('distpackage', function() {
  // TODO do it the gulp way
  fs.readFile('package.json', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
             
    data = JSON.parse(data);
    data.devDependencies = [];

    fs.mkdirSync('dist');
    fs.writeFile('dist/package.json', JSON.stringify(data, null, 2), function(err) {
      if (err) {
        console.log(err);
      }
    }); 
  });
});

gulp.task('dist', ['distapp', 'distpublic', 'distpackage']);

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});
