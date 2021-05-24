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
const htmlreplace = require('gulp-html-replace');
const ftp = require('vinyl-ftp');

const ver = new Date().getTime();
const ftpConfig = require('./ftp.config.js');

function clean() {
    return del([
        'build/**'
    ]);
}
function cleanDev() {
    return del([
        'static/css/*.css',
        'static/css/*.css.map',
        'static/scripts/*.js',
        'static/scripts/*.js.map'
    ]);
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
        .pipe(dest('build/static/css/'))
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
        .pipe(dest('build/static/scripts/'))
}

function changeVer() {
    return src('./index.html')
        .pipe(htmlreplace({
            'css': {
                src: './static/css',
                tpl: `<link rel="stylesheet" href="%s/style.css?ver=${ver}" />`
            },
            'js': {
                src: './static/scripts',
                tpl: `<script src="%s/scripts.js?ver=${ver}"></script>`
            }
        }))
        .pipe(dest('build'));
}

function moveData() {
    return src('data/*.json')
        .pipe(dest('build/data'));
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

const conn = ftp.create(ftpConfig());
function upload() {
    // console.log(ftpConfig())
    return src([
        './build/**'
    ], {
        base: './build',
        buffer: false
    })
        // newer 是只上传新文件
        .pipe(conn.newer(ftpConfig().webDir))
        .pipe(conn.dest(ftpConfig().webDir))
}

exports.clean = clean;
exports.cleanDev = cleanDev;
exports.buildScss = buildScss;
exports.buildJs = buildJs;
exports.build = series(clean, parallel(buildScss, buildJs, changeVer, moveData));
exports.upload = series(clean, parallel(buildScss, buildJs, changeVer, moveData), upload);
exports.default = function () {
    watch('source/scss/*.scss', watchScss);
    watch('source/scripts/*.js', watchJs);
};