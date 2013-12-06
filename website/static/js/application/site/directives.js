(function(){
  'use strict';
  
  var directives = angular.module('ngEverything.site.directives', []);
  
  // Just for fun.
  directives.directive('ngEverything', [
    function(){
      return {
        controller: 'ngEverything.site.IndexCtrl'
      };
    }
  ]);
})();
