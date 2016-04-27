var path = require('path');
var gutil = require('gulp-util');
var gulp = require('gulp');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var bower = require('gulp-bower');
var sequence = require('run-sequence');
var del = require('del');
var karma = new require('karma').Server;
var compass = require('gulp-compass');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var template = require('gulp-angular-templatecache');
var jshint = require('gulp-jshint');
var htmlmin = require('gulp-htmlmin');
var htmllint = require('gulp-htmllint');

var buildDir = 'dist';
var repoRootKarma =  __dirname + '/tests';

var js = {
    dest: buildDir + '/js',
    libs: {
        name: "libs.js",
        files: [
            "bower_components/angular/angular.min.js"
        ]
    },
    component: {
        name: "ftv.components.notif.js",
        files: [
            "component.js"
        ]
    }
};

var css = {
    dest: buildDir + '/css',
    component: {
        name: 'ftv.components.notif.css',
        files: 'skin/*.scss'
    }
};

var templates = {
    dest: buildDir + '/templates',
    'dest-demo': 'demo/templates',
    component: {
        name: 'ftv.components.notif.js',
        files: 'templates/*.html'
    }
};

// Build JS //

gulp.task('templates', function () {
    return gulp.src(templates.component.files)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(template(templates.component.name, { module:'ftv.components.notif.templates', standalone:true }))
        .pipe(gulp.dest(templates.dest));
});

gulp.task('build-templates', ['templates']);


gulp.task('js-libs', function() {
    return gulp.src(js.libs.files)
        .pipe(concat(js.libs.name))
        .pipe(gulp.dest(js.dest));
});

gulp.task('js-component', function() {
    var files = js.component.files;
    files.push(templates.dest + '/' + templates.component.name);

    return gulp.src(files)
        .pipe(concat(js.component.name))
        .pipe(gulp.dest(js.dest));
});

gulp.task('build-js', ['templates', 'js-component', 'js-libs']);

// Minify JS
gulp.task('js-libs-min', function() {
    return gulp.src(js.dest + '/' + js.libs.name)
        .pipe(uglify())
        .pipe(gulp.dest(js.dest));
});

gulp.task('js-component-min', function() {
    return gulp.src(js.dest + '/' + js.component.name)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(js.dest));
});

gulp.task('build-js-min', ['js-component-min', 'js-libs-min']);

// Build CSS //
gulp.task('css', function () {
    return gulp.src('base.scss')
        .pipe(compass({
            project: path.join(__dirname),
            css: css.dest,
            sass: __dirname
        }))
        .pipe(rename(css.component.name))
        .pipe(gulp.dest(css.dest));
});

gulp.task('css-min', function () {
    return gulp.src(css.dest + '/' + css.component.name)
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minify({
            keepSpecialComments: false
        }))
        .pipe(gulp.dest(css.dest));
});

// Bower //
gulp.task('bower', function() {
    return bower({ cwd: './' });
});

// Karma //
gulp.task('karma-test', function (callback) {
    karma.start({
        configFile: __dirname + '/tests/karma.conf.js',
        singleRun: true
    }, callback);
});

// Lint //
gulp.task('js-lint', function() {
    return gulp.src([
        js.component.files[0]
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('html-lint', function() {
    return gulp.src(templates.component.files)
        .pipe(htmllint({}, htmllintReporter));
});

function htmllintReporter(filepath, issues) {
    if (issues.length > 0) {
        issues.forEach(function (issue) {
            gutil.log(gutil.colors.cyan('[gulp-htmllint] ') + gutil.colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + gutil.colors.red('(' + issue.code + ') ' + issue.msg));
        });

        process.exitCode = 1;
    }
}

gulp.task('lint', ['js-lint', 'html-lint']);
// General //
gulp.task('cleanup', function(cb) {
    return del(buildDir, cb);
});

gulp.task('build-dev', function(callback) {
    sequence('cleanup', 'bower', 'build-templates', 'css', 'build-js', callback);
});

gulp.task('build', function(callback) {
    sequence('build-dev', 'build-js-min', 'css-min', callback);
});

gulp.task('test', function (callback) {
    sequence('lint', 'build-dev', 'karma-test', callback);
});