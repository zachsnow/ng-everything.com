module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'website/static/js/application/**/*.js'],
      options: {
        debug: true,
        globals: {
          $: true,
          console: true,
          module: true,
          angular: true,
        }
      }
    },
    clean: {
      deploy: {
        src: ['deploy/**/*']
      }
    },
    
    // Concatenate site Javascript; put result in an intermediate directory
    // to ease deploys.
    concat: {
      options: {
        separator: ';'
      },
      production: {
        src: [
          'website/static/js/application/**/*.js',
          'website/static/js/lib/**/*.min.js'
        ],
        dest: 'build/ngEverything.js'
      }
    },
    
    // Uglify site Javascript in the temporary location and finally
    // deploy.
    uglify: {
      production: {
        files: {
          'deploy/ngEverything.min.js': ['<%= concat.production.dest %>']
        }
      }
    },
    
    // Compile SASS; only compress in production.
    sass: {
      local: {
        files: {
          'deploy/ngEverything.css': 'static/scss/style.scss'
        }
      },
      production: {
        files: {
          'deploy/ngEverything.css': 'static/scss/style.scss'
        },
        style: 'compressed'
      }
    },
    
    // Copy all static assets for easy local testing.
    copy: {
      local: {
        expand: true,
        cwd: 'website/',
        src: [
          'static/js/**/*',
          'static/images/**/*'
        ],
        dest: 'deploy/'
      }
    },
    watch: {
      files: ['Gruntfile.js', 'website/**/*'],
      tasks: ['local']
    },
    exec: {
      jinjaLocal: {
        cmd: './jinja conf/local.json > deploy/index.html'
      },
      jinjaProduction: {
        cmd: './jinja conf/production.json > deploy/index.html'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  var localTasks = ['jshint', 'clean', 'sass:local', 'copy:local', 'exec:jinjaLocal'];
  grunt.registerTask('default', localTasks);
  grunt.registerTask('local', localTasks);
  
  grunt.registerTask('production', ['jshint', 'clean', 'sass:production', 'concat:production', 'uglify:production', 'exec:jinjaProduction']);

};
