(function($) {
	"use strict";
	
	angular.module('sense', [])
	.factory('senseService', ['$log', '$window', '$q', '$rootScope', function($log, $window, $q, $rootScope){
		return {};
	}])
	.controller('DataController', ['senseService', '$window', '$scope', '$log', '$q', function(senseService, $window, $scope, $log, $q){
		var self = this;
		self.autorefresh = false;
		self.intid = null;
		
		$scope.data = {};
		
		$scope.checkAutoRefresh = function(){
			
		};
		
		$scope.sendMessage = function(){
			
		};
		
	}]);

})(jQuery); 