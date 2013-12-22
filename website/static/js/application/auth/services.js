(function(){
  'use strict';
  
  var services = angular.module('ngEverything.auth.services', []);
  
  services.factory('auth', [
    function(){
      OAuth.initialize(window.ngEverythingConfig.oauthKey);
      return OAuth;
    }
  ]);
})();
