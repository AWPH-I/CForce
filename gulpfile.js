const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');

gulp.task('copy', () => gulp.src(['./public/**/*']).pipe(gulp.dest('./dist')));

gulp.task('compress', () =>
    gulp.src(['dist/**/*.js', '!dist/**/libs/*.*'])
        .pipe(babel())
        .pipe(gulp.dest('./dist/')));

gulp.task('minify', cb => {
    pump([
            gulp.src(['dist/**/*.js', '!dist/**/libs/*.*']),
            uglify(),
            gulp.dest('dist/')
        ],
        cb
    );
});

gulp.task('clean-css', () => {
    return gulp.src(['dist/**/*.css', '!dist/**/libs/*.*'])
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('prod', gulp.series('copy', 'compress', 'minify', 'clean-css'));