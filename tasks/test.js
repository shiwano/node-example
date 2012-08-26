module.exports = function(grunt) {
  var path = require('path'),
      fs = require('fs'),
      Mocha = require('mocha');

  grunt.registerMultiTask('test', 'Run specs with mocha.', function() {
    var testDir = this.data.testDir,
        srcDir = this.data.srcDir,
        suffix = this.data.suffix,
        noCaches = this.data.noCaches;

    var filepaths = grunt.file.expandFiles(path.join(testDir, '/**/*.coffee'));
    grunt.file.clearRequireCache(filepaths);
    grunt.file.clearRequireCache(noCaches);

    if (grunt.file.watchFiles) {
      var changedFiles = grunt.utils._.intersection(filepaths, grunt.file.watchFiles.changed);
      var changedSrc = grunt.file.watchFiles.changed.filter(function (filepath) {
        return (filepath.indexOf(srcDir) === 0);
      });
      var changedFilesViaSrc = changedSrc.map(function (filepath) {
        return filepath.replace(srcDir, testDir).replace(/.coffee$/, suffix + '.coffee');
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

    try {
      mocha.run(function (status) {
        done((status === 0));
      });
    } catch (err) {
      grunt.log.error(err.stack);
      done(false);
    }
  });
};
