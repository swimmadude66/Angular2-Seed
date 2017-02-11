const gulp        	= require('gulp');
const fs          	= require('fs');
const path			= require('path');
const sass          = require('node-sass');
const webpack       = require('webpack');
const webpackConfig = require('./webpack.config');
const browserSync   = require('browser-sync-webpack-plugin');
const ts_project	= require('gulp-typescript').createProject('./src/server/tsconfig.json');

function sassNodeModulesImporter(url, file, done){
    // if it starts with a tilde, search in node_modules;
    if (url.indexOf('~') === 0){
        var nmPath = path.join(__dirname, 'node_modules', url.substring(1)||'');
        return done({ file: nmPath });
    } else {
        return done({ file: url });
    }
}

gulp.task('compile_node', function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
});

gulp.task('copy_client_root', ['copy_client_assets'], function(done){
    gulp.src('src/client/index.html')
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
        return done();
    });
});

gulp.task('copy_client_assets', function(){
  return gulp.src(['src/client/assets/**/*'])
      .pipe(gulp.dest('dist/client/assets'));
});

gulp.task('copy_fonts', ['copy_client_assets'], function(){
  return gulp.src(['node_modules/font-awesome/fonts/*', 'src/client/fonts/*'])
      .pipe(gulp.dest('dist/client/fonts'));
});

gulp.task('webpack', function(done) {
    let config = webpackConfig;
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin()
    );
    return webpack(config, function(err){
        if (err) {
            console.log(err);
        }
        return done(err);
    });
});

gulp.task('webpack-watch', function() {
    let config = webpackConfig;
    config.watch = true;
    config.cache = true;
    config.bail = false;
    config.plugins.push(
        new browserSync({
            host: 'localhost',
            port: 3001,
            proxy: 'localhost:3000'
        })
    );
    webpack(config, function(err, stats) {
        if (err) {
            console.log(err);
        }
    });
});

gulp.task('copy', ['copy_client_root', 'copy_client_assets', 'copy_fonts']);

gulp.task('watch', ['copy', 'compile_node', 'webpack-watch'], function(){
  	console.log('watching for changes...');
	gulp.watch(['src/client/assets/**/*'], ['copy_client_assets']);
	gulp.watch(['src/client/index.html', 'src/client/styles.scss', 'src/client/scss/*.scss'], ['copy_client_root']);
	gulp.watch(['node_modules/font-awesome/fonts/*', 'src/client/fonts/*'], ['copy_fonts']);
	gulp.watch(['src/server/**/*.ts'], ['compile_node']);
});

// Default Task
gulp.task('default', ['copy', 'compile_node', 'webpack']);
