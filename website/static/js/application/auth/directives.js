(function(){
  'use strict';
  
  var directives = angular.module('ngEverything.auth.directives', []);

  directives.directive('ngAuthPopup', [
    'oauth',
    function($auth){
      return {
        restrict: 'A',
        link: function(scope, element, attrs){
          element.on('click', function(){
            oauth.popup(function(error, result) {
              if(error){
                console.error('ngEverything.auth.directives', error);
                return;
              }
            });
          });
        }
      };
    }
  ]);
})();
