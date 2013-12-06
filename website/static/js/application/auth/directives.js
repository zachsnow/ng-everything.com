(function(){
  'use strict';
  
  var directives = angular.module('ngEverything.auth.directives', []);

  directives.directive('ngAuthPopup', [
    'auth',
    'oauth',
    function($auth){
      return {
        restrict: 'A',
        link: function(scope, element, attrs){
          element.on('click', function(){
            oauth.popup('github', function(error, result) {
              $scope.$apply(function(){
                if(error){
                  console.error('ngEverything.auth.directives', error);
                  return;
                }
                auth.authorize(result);
              });
            });
          });
        }
      };
    }
  ]);
})();
