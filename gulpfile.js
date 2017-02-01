const gulp        	= require('gulp');
const install     	= require('gulp-install');
const ts 			= require('gulp-typescript');
const file 			= require('gulp-file');
const uglify      	= require('gulp-uglify');
const browserify  	= require('browserify');
const watchify 		= require('watchify');
const loaderify     = require('loaderify');
const tsify       	= require('tsify');
const buffer      	= require('vinyl-buffer');
const factorBundle 	= require('factor-bundle');
const concat 		= require('concat-stream');
const fs          	= require('fs');
const path			= require('path');
const sass          = require('node-sass');
const minify        = require('minify');
const browserSync 	= require('browser-sync').create();
const client_tsc	= require('./src/client/tsconfig.json').compilerOptions;
const server_tsc	= require('./src/server/tsconfig.json').compilerOptions;
const ts_project	= ts.createProject('./src/server/tsconfig.json');

function handleTsErrors(err){
	if(typeof err != typeof ''){
		err = JSON.stringify(err, null, 2);
	}
	console.error(err);
}

function write (folder, filepath, crush) {  
    return concat(function (content) {        
        var f = file(path.basename(filepath), content, { src: true })
        .pipe(buffer());
        if(crush){
            f = f.pipe(uglify());
        }
        return f.pipe(gulp.dest(folder));
    });
}

function initBrowserify(watch, options) {
    var props = Object.assign(options || {}, {
        debug: true,
        cache: {},
        packageCache: {}
    });
    var b = (watch ? watchify(browserify(props)) : browserify(props))
    .add('src/client/main.ts')
	.add('src/client/vendor.ts')
	.on('error', handleTsErrors)
	.plugin(tsify, client_tsc)
	.plugin(factorBundle, { outputs: [write('dist/client', 'app.min.js'), write('dist/client', 'vendor.min.js', true)]});
    return b;
}

function sassNodeModulesImporter(url, file, done){
    // if it starts with a tilde, search in node_modules;
    if (url.indexOf('~') === 0){
        var nmPath = path.join(__dirname, 'node_modules', url.substring(1)||'');
        return done({ file: nmPath });
    } else {
        return done({ file: url });
    }
}

function inject(filelocation, contents, callback) {
    return callback(null, '`'+contents+'`');
}

function compileSass(filelocation, contents, callback){
    sass.render({
        file: filelocation,
        outputStyle: 'compressed',
        importer: sassNodeModulesImporter
    }, function(err, result){
        if(err){
            throw err;
        }
        return inject(null, result.css.toString(), callback);
    });
}

function minifyFile(filelocation, contents, callback) {
    if(contents.length < 1){
        return inject(null, contents, callback);
    }
    minify(filelocation, function(err, data){
        if(err){
            throw err;
        }
        return inject(null, data, callback);
    });
}

function bundle(bundler){
    return bundler
    .transform(loaderify, {
        loaders: [
            {
                Pattern: '**/*.html', 
                Function: inject
            },
            {
                Pattern: '**/*.scss', 
                Function: compileSass
            },
            {
                Pattern: '**/*.css', 
                Function: minifyFile
            }
        ]
    })
    .bundle()
    .pipe(write('dist/client', 'common.min.js', true));
}

gulp.task('serverify', ['install'], function(done){
    var props = {
        cache: {},
        packageCache: {}
    };
    return browserify(props)
    .add('src/server/app.ts')
    .on('error', handleTsErrors)
	.plugin(tsify, server_tsc)
    .bundle()
    .pipe(write('dist/server', 'app.min.js', true))
    .on('bundle', done); 
});

gulp.task('browserify', ['install'], function(done){
    var b = initBrowserify(false, {});    
    return bundle(b).on('bundle', done);
});

gulp.task('watchify', function(){
    var w = initBrowserify(true, {});
    function rebundle(){
        bundle(w);
        browserSync.reload();
    }
    w.on('update', function(){
        console.log('Rebundling...');
        rebundle();
    });
    rebundle();
});

gulp.task('compile_node', ['install'], function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
});

gulp.task('copy_client_root', ['copy_client_assets', 'install'], function(done){
    gulp.src(
        [
            'src/client/index.html', 
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/tether/dist/js/tether.min.js'
        ]
    )
    .pipe(gulp.dest('dist/client/'));
    sass.render({
        file: 'src/client/styles.scss',
        outputStyle: 'compressed',
        importer: sassNodeModulesImporter
    }, function(err, result){
        if(err){
            throw err;
        }
        fs.writeFileSync('dist/client/styles.min.css', result.css);
        done();
    });
});

gulp.task('copy_client_assets', function(){
  return gulp.src(['src/client/assets/**/*'])
      .pipe(gulp.dest('dist/client/assets'));
});

gulp.task('copy_fonts', ['install', 'copy_client_assets'], function(){
  return gulp.src(['node_modules/font-awesome/fonts/*', 'src/client/fonts/*'])
      .pipe(gulp.dest('dist/client/fonts'));
});

gulp.task('install', function(){
	return gulp.src('./package.json')
    .pipe(install({ignoreScripts:true}));
});

gulp.task('copy', ['copy_client_root', 'copy_client_assets', 'copy_fonts']);

gulp.task('watch', ['copy', 'install', 'compile_node', 'watchify'], function(){
  	console.log('watching for changes...');
    browserSync.init({
        proxy: 'localhost:3000',
        port: '3001'
    });
	gulp.watch(['src/client/**/*'], ['copy']);
  	return gulp.watch(['./package.json'], ['browserify']);
});

// Default Task
gulp.task('default', ['copy', 'install', 'compile_node', 'browserify']);
