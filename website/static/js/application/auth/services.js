(function(){
  'use strict';
  
  var services = angular.module('ngEverything.auth.services', []);
  
  services.factory('oauth', [
    '$http',
    '$q',
    function($http, $q){
      var API_BASE = 'https://api.github.com';
      
      OAuth.initialize(window.ngEverything.oauthKey);
      var oauthResult;
      
      var service = {
        popup: function(callback){
          var deferred = $q.defer();
          var options;
          
          OAuth.popup('github', options, function(error, result){
            $rootScope.$apply(function(){
              if(error){
                console.error('ngEverything.auth.services', error);
                return;
              }
              
              oauthResult = result;
              OAuth.authorize(oauthResult);
            });
          });
          return deferred.promise;
        }
      };
      
      _.forEach(['get', 'post', 'put', 'delete'], function(method){
        service[method] = function(url){
          var deferred = $q.defer();          

          var success = function(data){
            deferred.resolve(data);
          };
          var error = function(jq, textStatus, errorThrown){
            deferred.reject(jq.data);
          };
          
          if(oauthResult){
            oauthResult[method].call(oauthResult, {
              url: url
            }).then(success, error);
          }
          else {
            url = API_BASE + url;
            $http({
              method: method,
              url: url
            }).then(success, error);
          }
          
          return deferred.promise;
        };
      });
      
      return service;
    }
  ]);
})();
