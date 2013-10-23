angular.module('10digit.utils', ['ui.bootstrap.modal', 'ngSanitize'])

.factory('ErrorList', function(){
	return {
		build: function(response){
			if(response.errors){
				var errorString = '<ul>';
				for(var i=0;i<response.errors.length;i++){
					errorString = errorString + '<li>'+response.errors[i]+'</li>'
				}
				errorString = errorString + '</ul>';
				return errorString;
			} else {
				return response;
			}
		}
	}
})

/**
* Ajax Wrapper
*/
.factory('$ajax', ['$http', function($http) {
    return {
      run: function(url, opts) {
        opts = (opts) ? opts : {};
	    opts.method = opts.method || 'GET';
		opts.data = opts.data || {};
	    opts.url = (!opts.noproxy) ? '/api/' + url : url;
		var success = angular.copy(opts.success) || false;
	    delete opts.success;
	    var error = angular.copy(opts.error) || false;
	    delete opts.error;

        $http(opts).success(function(json, status) {
            if (success && status == 200) success(json, status);
        }).error(function(err, status) {
            if (error) error(err, status);
        });
      }
    };
  }])

/**
 * Bind to local scope
 */
.directive('ngBindToScope', [function() {
    return {
  restrict: 'A',
  link: function($scope, elm, attrs, $ctrl) {
            angular.extend($scope.$parent, $.parseJSON(attrs.ngBindToScope));
        }
    }
}])

/**
 * Modals
*/
.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'title', 'content', 'okText', function($scope, $modalInstance, title, content, okText){
	$scope.title = title;

	$scope.content = content;

	$scope.okText = okText || 'OK';

    $scope.ok = function(){
        $modalInstance.close();
    }

    $scope.cancel = function(){
        $modalInstance.dismiss('cancel');
    }
}])

.factory('ModalInstanceService', ['$modal', function($modal){
    return {
        open : function(opts){
            angular.extend(opts, {
					controller: (opts.controller) ? opts.controller : 'ModalInstanceCtrl',
					templateUrl: (opts.templateUrl) ? opts.templateUrl : '/template/10digit/default_modal.html'
	            }
            );
            return $modal.open(opts);
        }
    }
}])

/**
 * Filepicker
*/
.controller('FilepickerCtrl', function($scope, $ajax){
    filepickerSec = {};
    $ajax.run('/fpsec', {noproxy: true, success: function(data){
            filepickerSec = data;
            filepicker.setKey(filepickerSec.key);
        }
    });
    
    $scope.pickFiles = function(){
        filepicker.pickAndStore(
            {
                services:['COMPUTER','DROPBOX','GOOGLE_DRIVE'],
                policy:filepickerSec.policy,
                signature:filepickerSec.signature
            },
            {},
            function(fpfiles){
                //If the parent scope has a callback function defined, used that
                if($scope.$parent.filepickerCallback){
                    $scope.$parent.filepickerCallback(fpfiles);
                } else {
                    $scope.phoneBill = fpfiles;
                }
            }
        );
    }
})

.directive('filepicker', function(){
    return {
        restrict:'E',
        template: '<input type="button" class="btn-primary btn" value="Pick Files" ng-click="pickFiles()" style="margin-bottom:10px;" />',
        replace: true,
        scope: {},
        controller: 'FilepickerCtrl'
    };
});
