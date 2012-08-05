module.exports = function (grunt) {
  var path = require('path');
  var fs = require('fs');
  var coffee = require('coffee-script');

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('coffee', 'Compile CoffeeScript files', function () {
    var src = this.data.srcDir,
        dest = this.data.destDir,
        options = grunt.utils._.clone(this.data.options);

    var deleteFile = function (filepath) {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        grunt.log.writeln('Deleted "' + filepath + '"');
      }
    };

    var filepaths = grunt.file.expandFiles(path.join(src, '/**/*.coffee'));
    grunt.file.clearRequireCache(filepaths);

    if (grunt.file.watchFiles) {
      grunt.file.watchFiles.deleted.forEach(function (filepath) {
        if (filepath.indexOf(src) === 0) {
          deleteFile(getDestPath(filepath, dest));
        }
      });
      filepaths = grunt.utils._.intersection(filepaths, grunt.file.watchFiles.changed);
    } else {
      grunt.file.expandFiles(path.join(dest, '/**/*.js')).forEach(function (filepath) {
        if (!fs.existsSync(getSrcPath(filepath, src, '.coffee'))) {
          deleteFile(filepath);
        }
      });
    }

    filepaths.forEach(function (filepath) {
      grunt.helper('coffee', filepath, getDestPath(filepath, dest), options);
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
    if( options.bare !== false ) {
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

  // ==========================================================================
  // FUNCTIONS
  // ==========================================================================

  var _getGeneratedPath = function (filepath, genDir, extension, genExtension) {
    filepath = filepath.replace(path.resolve('.'), '');
    var firstDirPat = new RegExp('^' + path.sep + '?[^' + path.sep + ']+');
    genPath = path.dirname(filepath).replace(firstDirPat, genDir);
    return path.join(genPath, path.basename(filepath, extension) + genExtension);
  };

  var getDestPath = function (src, destDir) {
    return _getGeneratedPath(src, destDir, '.coffee', '.js');
  };

  var getSrcPath = function (dest, srcDir) {
    return _getGeneratedPath(dest, srcDir, '.js', '.coffee');
  };
};
