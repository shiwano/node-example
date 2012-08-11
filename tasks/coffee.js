module.exports = function (grunt) {
  var path = require('path');
  var fs = require('fs');
  var coffee = require('coffee-script');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('coffee', 'Compile CoffeeScript files', function () {
    var srcDir = this.data.srcDir,
        destDir = this.data.destDir,
        options = grunt.utils._.clone(this.data.options);

    var deleteFile = function (filepath) {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        grunt.log.writeln('Deleted "' + filepath + '"');
      }
    };

    var filepaths = grunt.file.expandFiles(path.join(srcDir, '/**/*.coffee'));
    grunt.file.clearRequireCache(filepaths);

    if (grunt.file.watchFiles) {
      grunt.file.watchFiles.deleted.forEach(function (filepath) {
        if (filepath.indexOf(srcDir) === 0) {
          filepath = filepath.replace(srcDir, destDir).replace(/\.coffee$/, '.js');
          deleteFile(filepath);
        }
      });
      filepaths = grunt.utils._.intersection(filepaths, grunt.file.watchFiles.changed);
    } else {
      grunt.file.expandFiles(path.join(destDir, '/**/*.js')).forEach(function (filepath) {
        srcpath = filepath.replace(destDir, srcDir).replace(/\.js/, '.coffee');

        if (!fs.existsSync(srcpath)) {
          deleteFile(filepath);
        }
      });
    }

    filepaths.forEach(function (filepath) {
      destpath = filepath.replace(srcDir, destDir).replace(/\.coffee$/, '.js');
      grunt.helper('coffee', filepath, destpath, options);
    });

    if (grunt.task.current.errorCount) {
      return false;
    }

    grunt.log.ok('Compiling complete');
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('coffee', function (src, dest, options) {
    options = options || {};

    if ( options.bare !== false ) {
      options.bare = true;
    }

    try {
      var js = coffee.compile(grunt.file.read(src), options);
      grunt.file.write(dest, js);
      grunt.log.writeln('Compiled "' + src + '" -> "' + dest + '"');
    } catch (e) {
      grunt.log.error("Error in " + src + ":\n" + e);
      return false;
    }
  });
};
