(function(){
  'use strict';
  
  var services = angular.module('ngEverything.auth.services', []);
  
  services.factory('auth', [
    function(){
      OAuth.initialize('svMkNf_uFSoVp_4l4DVqrOsgMBE');
      return OAuth;
    }
  ]);
})();
