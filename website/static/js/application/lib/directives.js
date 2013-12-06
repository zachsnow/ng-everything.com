(function(){
  'use strict';
  
  var directives = angular.module('ngEverything.lib.directives', []);
  
  directives.directive('ngAutoTitle', [
    '$document',
    'autoTitle',
    function($document, autoTitle){
      return {
        link: function(scope, element, attrs){
          var unlisten = autoTitle.listen(function(newTitle){
            $document.title = newTitle;
          });
          scope.$on('$destroy', function(){
            unlisten();
          });
        }
      };
    }
  ]);
  
  directives.directive('ngTitle', [
    'autoTitle',
    function(autoTitle){
      return {
        link: function(scope, element, attrs){
          var title = autoTitle.create();
          attrs.$observe('ngTitle', function(newTitle){
            autoTitle.update(title, newTitle);
          });
          scope.$on('$destroy', function(){
            autoTitle.destroy(title);
          });
        }
      };
    }
  ]);
  
  directives.directive('ngLoading', [
    '$q',
    function($q){
      return {
        transclude: true,
        templateUrl: 'lib.loading',
        link: function(scope, element, attrs){
          scope.$watch(attrs.ngLoading, function(promise){
            if(_.isArray(promise)){
              promise = $q.all(promise);
            }
            else {
              promise = $q.when(promise);
            }
            scope.ngLoadingStatus = "loading";
            promise.then(function(){
              scope.ngLoadingStatus = "success";
            }, function(){
              scope.ngLoadingStatus = "error";
            });  
          }, true);
        }
      };
    }
  ]);
  
  directives.directive('ngMultiTransclude', function(){
    return {
      controller: function($scope, $element, $attrs, $transclude){
        if(!$transclude){
          throw {
            name: 'DirectiveError',
            message: 'ng-multi-transclude found without parent requesting transclusion'
          };
        }
        this.$transclude = $transclude;
      },
       
      link: function($scope, $element, $attrs, controller){
        var selector = '[name=' + $attrs.ngMultiTransclude + ']';
        var attach = function(clone){
          var $part = clone.find(selector).addBack(selector);
          if($part.length){
            $element.html('');
            $element.append($part);
          }
        };
         
        if(controller.$transclude.$$element){
          attach(controller.$transclude.$$element);
        }
        else {
          controller.$transclude(function(clone){
            controller.$transclude.$$element = clone;
            attach(clone);
          });
        }
      }
    };
  });

  var navigationDirective = function(directiveName, methodName){
    directives.directive(directiveName, [
      '$animate',
      '$parse',
      'navigation',
      function($animate, $parse, navigation){
        return {
          transclude: true,
          link: function(scope, element, attrs, controller, transcludeFn){
            var path = _.bind($parse(attrs[directiveName]), null, scope);
            var method = navigation[methodName];
            var isUnbound = false;
            
            var nestedElement;
            var nestedScope;
            
            var attach = function(bindings){
              if(nestedScope){
                nestedScope.$destroy();
              }
              nestedScope = scope.$new();
              _.extend(nestedScope, bindings);
              
              transcludeFn(scope, function(clone){
                if(nestedElement){
                  // Don't animate when reattaching, let's see how that looks.
                  nestedElement.remove();
                  element.append(clone);
                }
                else {
                  element.append(clone);
                  //$animate.enter(clone, element);
                }
                nestedElement = clone;
              });
            };
            
            var remove = function(){
              if(nestedScope){
                nestedScope.$destroy();
              }
              if(nestedElement){
                element.html('');
                //$animate.leave(nestedElement);
              }
              nestedElement = null;
            };
            
            var oldPath;
            
            var bindings;
            scope.$watch(function(){
              bindings = method(path());
              if(bindings){
                return JSON.stringify(bindings);
              }
              return false;
            }, function(newMatched, oldMatched){
              var newPath = navigation.path;
              
              if(newMatched && oldMatched){
                if(newPath !== oldPath){
                  // The path changed but still matches this prefix or path;
                  // we need to destroy and recreate the contents so that
                  // nested controllers can be rebuilt with the new path contents.
                  attach(bindings);
                }
                else {
                  // The path didn't change, so nested controllers are
                  // still correct.
                }
              }
              else if(newMatched){
                // Path previously didn't match this prefix or path, but now does.
                attach(bindings);
              }
              else if(oldMatched){
                // Path previously matched this prefix or path, but now does not.
                remove();
              }
              else {
                // The path may have changed, but still does not match this
                // prefix or path. 
              }
              oldPath = newPath;
            });
          }
        };
      }
    ]);
  };
  
  var ngNavigationPrefix = navigationDirective('ngNavigationPrefix', 'pathStartsWith');
  var ngNavigationPath = navigationDirective('ngNavigationPath', 'pathEquals');
})();
