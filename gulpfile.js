'use strict';
const {
    src,
    dest,
    series,
    parallel,
    watch
} = require('gulp');
const minify = require('gulp-minify');
const del = require('delete');
const sass = require('gulp-dart-sass');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

function clean() {
    return del(['static/css/*.css', 'static/css/*.map', 'static/scripts/*.js']);
}

function buildScss() {
    return src('source/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        // .pipe(rename({
        //     extname: '.min.css'
        // }))
        .pipe(dest('static/css/'))
}

function buildJs() {
    return src('source/scripts/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(minify({
            noSource: true,
            ext: {
                min: '.js'
            },
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('static/scripts/'))
}

function watchScss() {
    return src('source/scss/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('static/css/'))
}

function watchJs() {
    return src('source/scripts/*.js')
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('static/scripts/'))
}

exports.clean = clean;
exports.buildScss = buildScss;
exports.buildJs = buildJs;
exports.build = series(clean, parallel(buildScss, buildJs));
exports.default = function () {
    watch('source/scss/*.scss', watchScss);
    watch('source/scripts/*.js', watchJs);
};