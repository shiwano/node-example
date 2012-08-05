module.exports = function(grunt) {
  var path = require('path'),
      fs = require('fs'),
      Mocha = require('mocha');

  grunt.registerMultiTask('test', 'Run specs with mocha.', function() {
    var testDir = this.data.testDir,
        srcDir = this.data.srcDir,
        suffix = this.data.suffix;

    var filepaths = grunt.file.expandFiles(path.join(testDir, '/**/*.coffee'));
    grunt.file.clearRequireCache(filepaths);

    if (grunt.file.watchFiles) {
      var changedFiles = grunt.utils._.intersection(filepaths, grunt.file.watchFiles.changed);
      var changedSrc = grunt.file.watchFiles.changed.filter(function (filepath) {
        return (filepath.indexOf(srcDir) === 0);
      });
      var changedFilesViaSrc = changedSrc.map(function (filepath) {
        return getTestPath(filepath, testDir, suffix);
      });
      changedFilesViaSrc = grunt.utils._.intersection(filepaths, changedFilesViaSrc);
      filepaths = grunt.utils._.union(changedFiles, changedFilesViaSrc);
    }

    if (grunt.config.get('mocha')) {
      options = grunt.config.get('mocha').options || {};
    }

    var done = this.async();
    var mocha = new Mocha(options);
    filepaths.map(mocha.addFile.bind(mocha));
    mocha.run(function (status) {
      done((status === 0));
    });
  });

  var _getGeneratedPath = function (filepath, genDir, extension, genExtension) {
    filepath = filepath.replace(path.resolve('.'), '');
    var firstDirPat = new RegExp('^' + path.sep + '?[^' + path.sep + ']+');
    genPath = path.dirname(filepath).replace(firstDirPat, genDir);
    return path.join(genPath, path.basename(filepath, extension) + genExtension);
  };

  var getTestPath = function (srcPath, testDir, suffix) {
    return _getGeneratedPath(srcPath, testDir, '.coffee', suffix + '.coffee');
  };
};
