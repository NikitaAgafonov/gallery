const gulp                 = require('gulp'),
	sass                   = require('gulp-sass'),
	cleanCSS               = require('gulp-clean-css'),
	rename                 = require('gulp-rename'),
	autoprefixer           = require('gulp-autoprefixer'),
	browserSync            = require('browser-sync').create(),
	uncss                  = require('gulp-uncss'),
	concat                 = require('gulp-concat'),
	uglify                 = require('gulp-uglify'),
	wiredep                = require('wiredep').stream,
	useref                 = require('gulp-useref'),
	gulpif                 = require('gulp-if'),
	babel                  = require('gulp-babel'),
	clean                  = require('gulp-clean'),
	del                    = require('del'),
	imagemin               = require('gulp-imagemin'),
	pngquant               = require('imagemin-pngquant'),
	imageminJpegoptim      = require('imagemin-jpegoptim'),
	libsJS                 = [
								'src/libs/jquery/dist/jquery.min.js'
							 ],
	config                 = {
		project: 'src/',
		img: 'src/img',
		buildProject: 'build/',
		buildImg: 'build/img',
		sass: 'src/sass',
		indexHTML: 'src/index.html',
		styleCSS: 'src/css',
		scripts: 'src/scripts',
		libs: 'src/libs',
		mainCSS: 'src/css/style.css',
		bower: 'bower.json',
		babelES: 'src/es2015'
	};

gulp.task('clearNotUsingCSS', function () {
    return gulp.src(config.mainCSS)
        .pipe(uncss({
            html: [config.indexHTML]
        }))
        .pipe(gulp.dest(config.buildProject+'css'));
});

gulp.task('sass', function () {
	gulp.src(config.sass+'/**/*.+(scss|sass)')
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(gulp.dest(config.styleCSS))
		.pipe(cleanCSS())
		.pipe(rename(function (path) {
			path.basename += ".min";
		}))
		.pipe(gulp.dest(config.styleCSS))
});

gulp.task('img', function () {
	return gulp.src(config.img+'/**/*')
		.pipe(imagemin({
			arithmetic: true,
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox:false}],
			use: [pngquant(),imageminJpegoptim()]
		}))
		.pipe(gulp.dest(config.buildImg))
});

gulp.task('scriptLibs', function () {
	return gulp.src(libsJS)
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.scripts))
});

gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: config.project
		},
		notify: false,
		open: true
	})
});

gulp.task('bower', function () {
	gulp.src(config.indexHTML)
		.pipe(wiredep({
			directory: config.libs
		}))
		.pipe(gulp.dest(config.project));
});

gulp.task('babel', () => {
    return gulp.src(config.babelES+'/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(config.scripts));
});

gulp.task('watch', ['browser-sync', 'sass', 'babel'], function () {
	gulp.watch(config.sass+'/**/*.+(scss|sass)', ['sass']);
	gulp.watch(config.babelES+'/**/*.js', ['babel']);
	gulp.watch(config.project+'**/*.+(css|html|js)').on('change', browserSync.reload);
	gulp.watch(config.bower, ['bower']);
});

gulp.task('cleanProj', function () {
	return del([config.buildProject+'**/*'])
});

gulp.task('build', ['cleanProj','img','sass', 'babel'], function () {
    return gulp.src(config.project+'*.html')
        .pipe(useref(config.project))
        .pipe(gulpif('*.js', uglify({
            mangle: false
        })))
        .pipe(gulpif('*.css', autoprefixer()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(gulp.dest(config.buildProject));
});