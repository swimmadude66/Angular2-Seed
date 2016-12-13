const gulp        	= require('gulp');
const install     	= require('gulp-install');
const buffer      	= require('vinyl-buffer');
const browserify  	= require('browserify');
const watchify 		= require('watchify');
const uglify      	= require('gulp-uglify');
const tsify       	= require('tsify');
const stringify		= require('stringify');
const ts 			= require('gulp-typescript');
const factorBundle 	= require('factor-bundle');
const concat 		= require('concat-stream');
const file 			= require('gulp-file');
const fs          	= require('fs');
const path			= require('path');
const browserSync 	= require('browser-sync').create();
const client_tsc	= require('./src/client/tsconfig.json').compilerOptions;
const ts_project	= ts.createProject('./src/server/tsconfig.json');

function handleTsErrors(err){
	if(typeof err != typeof ''){
		err = JSON.stringify(err, null, 2);
	}
	console.error(err);
}

function write (filepath) {    
    return concat(function (content) {        
        return file(path.basename(filepath), content, { src: true })
        .pipe(buffer())
		.pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist/client'))        
    });
}

function bundle(watch){
	var props = {debug:true};
	var b = watch ? watchify(browserify(props)) : browserify(props);
	b.transform(stringify, {
      appliesTo: { includeExtensions: ['.html', '.css'] }
    });
	b.add('src/client/main.ts')
	b.add('src/client/vendor.ts')
	.on('error', handleTsErrors)
	.plugin(tsify, client_tsc)
	.plugin(factorBundle, { outputs: [write('app.min.js'), write('vendor.min.js')]});
	function rebundle(){
		b.bundle()
		.pipe(write('common.min.js'));
	}
	b.on('update', function() {
		console.log('Rebundling...');
		rebundle();
	});
	return rebundle();
}

gulp.task('browserify', ['install'], function(){
	return bundle(false);
});

gulp.task('watchify', ['install'], function(done){
	bundle(true);
	return done();
});

gulp.task('browser-sync', ['watchify'], function(done) {
	browserSync.reload();
    return done();
});

gulp.task('compile_node', ['install'], function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'))
});

gulp.task('copy_client_root', function(){
  return gulp.src(['src/client/index.html', 'src/client/styles.css'])
      .pipe(gulp.dest('dist/client/'));
});

gulp.task('copy_bootstrap', ['install'], function(){
	gulp.src(['!node_modules/bootstrap/dist/js/**','!node_modules/bootstrap/dist/js/','node_modules/bootstrap/dist/**'])
	.pipe(gulp.dest('dist/client/lib'));
});

gulp.task('install', function(){
	return gulp.src('./package.json')
    .pipe(install({production:true, ignoreScripts:true}));
});

gulp.task('copy', ['copy_client_root', 'copy_bootstrap']);

gulp.task('watch', function(){
  	console.log('watching for changes...');
  	browserSync.init({
        proxy: 'localhost:3000',
		port: '3001'
	});
	gulp.watch(['src/client/**/*.html'], ['copy_client_root']);
  	gulp.watch(['./package.json'], ['install']);
  	gulp.watch(['./src/server/**/*.ts'], ['compile_node']);
  	gulp.watch(['./src/client/**/*'], ['browser-sync']);
  	return;
});

// Default Task
gulp.task('default', ['copy', 'install', 'compile_node', 'browserify']);
