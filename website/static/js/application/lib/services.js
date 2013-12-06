(function(){
  'use strict';
  
  var services = angular.module('ngEverything.lib.services', []);
  
  services.factory('autoTitle', [
    function(){
      var listeners = [];
      var titles = [];
      
      var notify = function(){
        var value = '';
        if(titles.length){
          value = titles[titles.length - 1].value;
        }
        
        _.forEach(listeners, function(listener){
          listener(value);
        });
      };
      
      var service = {
        listen: function(fn){
          listeners.push(fn);
          return function(){
            _.ref.remove(listeners, fn);
          };
        },
        create: function(value){
          var newTitle = {
            value: ''
          };
          titles.push(newTitle);
          service.update(newTitle, value);
          return newTitle;
        },
        update: function(title, value){
          title.value = value || '';
          notify();
        },
        destroy: function(title){
          _.ref.remove(titles, title);
          notify();
        }
      };
      
      return service;
    }
  ]);
  
  /////////////////////////////////////////////////////////////////////
  // Lightweight wrapper around the github API.
  /////////////////////////////////////////////////////////////////////
  services.factory('models', [
    function(){
      var service = {
        wrap: function(promise){
          return promise.then(service.create, function(reason){
            console.error('models.wrap', reason);
          });
        },
        create: function(result){
          if(_.isArray(result)){
            return _.map(result, service.create);
          }
          else {
            return result;
          }
        }
      };
      
      return service;
    }
  ]);
  
  services.factory('github', [
    '$q',
    'auth',
    'models',
    'urls',
    function($q, auth, models, urls){
      var api = {
        user: {
          index: '/users/:username',
          gists: '/users/:username/gists'
        },
        gist: {
          index: '/gists/:id',
          comments: '/gists/:id/comments',
          stars: '/gists/:id/star'
        }
      };
      
      var user = function(username){
        var url = urls.populate(api.user.index, {
          usernmame: username
        });
        return models.wrap(auth.get(url));
      };
      
      user.gists = function(username){
        var url = urls.populate(api.user.gists, {
          username: username
        });
        return models.wrap(auth.get(url));
      };
      
      var gist = function(id){
        var url = urls.populate(api.gist.index, {
          id: id
        });
        return models.wrap(auth.get(url));
      };
      
      gist.star = function(gist){
        var id = gist.id || gist;
        var url = urls.populate(api.gist.stars, {
          id: id
        });
        return models.wrap(auth.put(url));
      };
      gist.comments = function(gist){
        var id = gist.id || gist;
        var url = urls.populate(api.gist.comments, {
          id: id
        });
        return models.wrap(auth.post(url, {
          contentType: 'application/vnd.github.VERSION.full+json'
        }));
      };
      gist.comment = function(gist, text){
        var id = gist.id || gist;
        var url = urls.populate(api.gist.comments, {
          id: id
        });
        var data = {
          body: text
        };
        return models.wrap(auth.post(url, {
          data: data
        }));
      };
      
      var gists = {};
      gists.recent = function(){
        return models.wrap($q.when([]));
      };
      
      return {
        user: user,
        gist: gist,
        gists: gists
      };
    }
  ]);

  services.factory('urls', [
    function(){
      return {
        populate: function(template, params){
          var url = template;
          _.forEach(params, function(value, key){
            url = url.replace(':' + key, value);
          });
          return url;
        },
        
        users: '/users/',
        user: '/users/:username/',
        gists: '/gists/',
        gist: '/gists/:id/',
        about: '/about/'
      };
    }
  ]);
  
  /////////////////////////////////////////////////////////////////////
  // Navigation
  /////////////////////////////////////////////////////////////////////
  services.factory('navigation', [
    '$rootScope',
    '$injector',
    '$location',
    'auth',
    'urls',
    function($rootScope, $injector, $location, auth, urls){
      var getMatcher = function(path, matchAll){
        var bindingNames = [];
        path = path.replace(/\//g, '\\/'); 
        path = path.replace(/:(\w+)/g, function(match, name){
          bindingNames.push(name);
          return '([-_a-zA-Z0-9]+)';
        });
        
        var re = new RegExp('^' + path + (matchAll ? '$' : ''));
        
        var matcher = {
          match: function(path){
            var matches = _.toArray(re.exec(path));
            if(matches.length){
              matcher.bindings = {};
              _.forEach(_.rest(matches), function(match, i){
                var name = bindingNames[i];
                matcher.bindings[name] = match;
              });
              return true;
            }
            return false;
          },
          re: re,
          bindings: {}
        };
        return matcher;
      };
      
      var service = {
        path: $location.path() || '/',
        bindings: {},
        
        pathStartsWith: function(prefix, noBind){
          if(_.isUndefined(prefix)){
            return false;
          }
          
          var matcher = getMatcher(prefix);
          if(matcher.match(service.path)){
            if(!noBind){
              service.bindings = matcher.bindings;
              return matcher.bindings;
            }
            return true;
          }
          return false;
        },
        pathEquals: function(prefix, noBind){
          if(_.isUndefined(prefix)){
            return false;
          }
          
          var matcher = getMatcher(prefix, true);
          if(matcher.match(service.path)){
            if(!noBind){
              service.bindings = matcher.bindings;
              return matcher.bindings;
            }
            return true;
          }
          return false;
        },
        
        reload: function(){
          $window.location.reload(true);
        },
        
        redirect: function(path, hideFromHistory){
          path = path || '/';
          if(hideFromHistory){
            $location.replace();
          }
          $location.url(path);
          return path;
        },
        
        // For use from the console.
        forceRedirect: function(path){
          return $rootScope.$apply(function(){
            return service.redirect(path);
          });
        },
        
        // Extract from the path.
        extract: function(key, quiet){
          var value = service.bindings[key];
          if(_.isUndefined(value)){
            if(!quiet){
              throw {
                name: 'NavigationError',
                message: "Expected path to contain binding for '" + key + "'"
              };
            }
          }
          return value;
        },
        
        get: function(key){
          return $location.search()[key];
        },
        set: function(key, value){
          return $location.search(key, value);
        },
        clear: function(key){
          return $location.search(key, null);
        },
        
        watch: function(scope, f){
          return scope.$watch(function navigationPath(){
            return service.path;
          }, function(){
            scope.$safeApply(function(){
              f();
            });
          });
        }
      };
      
      $rootScope.$watch(function locationPath(){
        return $location.path();
      }, function(path, oldPath){
        // Normalize to trailing slash.
        path = path || '/';
        if(path[path.length - 1] !== '/'){
          service.redirect(path + '/');
          return;
        }
        
        // Expose the path on the service.
        service.path = path;
      });
      
      // HACK: make it easy to mess with navigation from the console.
      window.$$navigation = service;
      return service;
    }  
  ]);

  // Using popup (option 1)
  services.factory('auth', [
    function(){
      return {
        
      };
    }
  ]);
})();
