(function(){
  'use strict';
  
  var application = angular.module('ngEverything.site', [
    'ngAnimate',
    
    'ngEverything.auth',
    'ngEverything.lib',
    
    'ngEverything.site.controllers',
    'ngEverything.site.directives',
  ]);
  
  application.config([
    '$interpolateProvider',
    '$locationProvider',
    function($interpolateProvider, $locationProvider){
      // Avoid clash with Jinja's template syntax.
      $interpolateProvider.startSymbol('[[');
      $interpolateProvider.endSymbol(']]');
      
      // Turn on fancy history.
      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');
    }
  ]);
})();
