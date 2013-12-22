module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      deploy: {
        src: ['deploy/**/*']
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'website/static/js/application/**/*.js',
          'website/static/js/lib/**/*.min.js'
        ],
        dest: 'deploy/ngEverything.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'deploy/ngEverything.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
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
      files: ['website/**/*'],
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

  var localTasks = ['jshint', 'clean', 'copy', 'exec:jinjaLocal'];
  grunt.registerTask('default', localTasks);
  grunt.registerTask('local', localTasks);
  
  grunt.registerTask('production', ['jshint', 'clean', 'concat', 'uglify', 'jinjaProduction']);

};
