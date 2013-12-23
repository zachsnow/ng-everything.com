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
        wrap: function(promise, isArray){
          var object = isArray ? [] : {};
          
          object.$promise = promise.then(service.create(object), function(reason){
            console.error('models.wrap', reason);
            delete object.$promise;
          });
          return object;
        },
        create: function(object){
          return function(result){
            delete object.$promise;
             
            if(_.isArray(result.data)){
              object.length = 0;
              _.forEach(result.data, function(v, i){
                object[i] = v;
              });
              return object;
            }
            else {
              _.extend(object, result.data);
              return object;
            }
          };
        }
      };
      
      return service;
    }
  ]);
  
  services.factory('github', [
    '$q',
    'models',
    'oauth',
    'urls',
    function($q, models, oauth, urls){
      var api = {
        user: {
          index: '/users/:username',
          gists: '/users/:username/gists'
        },
        gist: {
          index: '/gists/:gistId',
          comments: '/gists/:gistId/comments',
          stars: '/gists/:gistId/star'
        }
      };
      
      var user = function(username){
        var url = urls.populate(api.user.index, {
          username: username
        });
        return models.wrap(oauth.get(url));
      };
      
      user.gists = function(username){
        var url = urls.populate(api.user.gists, {
          username: username
        });
        return models.wrap(oauth.get(url), true);
      };
      
      var gist = function(id){
        var url = urls.populate(api.gist.index, {
          gistId: id
        });
        return models.wrap(oauth.get(url));
      };
      
      gist.star = function(gist){
        var id = gist.id || gist;
        var url = urls.populate(api.gist.stars, {
          gistId: id
        });
        return models.wrap(oauth.put(url));
      };
      gist.comments = function(gist){
        var id = gist.id || gist;
        var url = urls.populate(api.gist.comments, {
          gistId: id
        });
        return models.wrap(oauth.get(url, {
          contentType: 'application/vnd.github.VERSION.full+json'
        }), true);
      };
      gist.comment = function(gist, text){
        var id = gist.id || gist;
        var url = urls.populate(api.gist.comments, {
          gistId: id
        });
        var data = {
          body: text
        };
        return models.wrap(oauth.post(url, {
          data: data
        }));
      };
      
      var gists = {};
      gists.recent = function(){
        return [];
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
        gist: '/gists/:gistId/',
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
    'oauth',
    'urls',
    function($rootScope, $injector, $location, oauth, urls){
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
