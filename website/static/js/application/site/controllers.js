(function(){
  'use strict';
  
  var controllers = angular.module('ngEverything.site.controllers', []);
  
  controllers.controller('ngEverything.site.IndexCtrl', [
    '$scope',
    'urls',
    function($scope, urls){
      $scope.urls = urls;
    }
  ]);
  
  controllers.controller('ngEverything.site.SearchCtrl', [
    '$scope',
    'github',
    function($scope, github){
      $scope.gists = [];
      $scope.users = [];
      $scope.result = {};
      
      $scope.search = function(){
        $scope.gists.$promise.cancelTimeout();
        $scope.gists.length = 0;
        
        $scope.users.$promise.cancelTimeout();
        $scope.users.length = 0;
        
        
        $scope.gists = github.searchGists({
          q: $scope.query
        });
        $scope.users = github.searchUsers({
          q: $scope.query
        });
        
        $scope.result = $q.all([$scope.gists.$promise, $scope.users.$promise]);
      };
    }
  ]);
  
  controllers.controller('ngEverything.site.RecentCtrl', [
    '$scope',
    'github',
    function($scope, github){
      $scope.gists = github.gists.recent();
    }
  ]);
  
  controllers.controller('ngEverything.site.UsersCtrl', [
    '$scope',
    'github',
    function($scope, github){}
  ]);
  
  controllers.controller('ngEverything.site.UserCtrl', [
    '$scope',
    'github',
    function($scope, github){
      $scope.user = github.user($scope.username);
      $scope.gists = github.user.gists($scope.username);
    }
  ]);
  
  controllers.controller('ngEverything.site.GistCtrl', [
    '$scope',
    'github',
    function($scope, github){
      debugger;
      $scope.gist = github.gist($scope.gistId);
    }
  ]);
  
  controllers.controller('ngEverything.site.CommentsCtrl', [
    '$scope',
    'github',
    function($scope){
      $scope.comments = github.comments($scope.gist);
    }
  ]);  
})();
