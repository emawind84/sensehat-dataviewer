(function($) {
	"use strict";
	
	var loc = window.location;
	var wsUriC = "";
	if (loc.protocol === "https:") {
		wsUriC = "wss:";
	} else {
		wsUriC = "ws:";
	}
	wsUriC += "//192.168.0.10:1880/ws/sensedata";
	
	angular.module('sense', [])
	.factory('senseService', ['$log', '$window', '$q', '$rootScope', 
	function($log, $window, $q, $rootScope){
		var ws;
		var defer;
		
		var listener = function(msg){
			var data = JSON.parse(msg.data);
			$log.debug('resolve defer...');
			$rootScope.$apply(defer.resolve(data));
		};
		
		var sendMessage = function(request) {
			$log.debug('sending message...');
			defer = $q.defer();
			
			ws.send(JSON.stringify(request));
			return defer.promise;
		};
		
		var init = function(){
			$log.debug("connect", wsUriC);
			ws = new WebSocket(wsUriC);
			
			ws.onmessage = function(msg) {
				listener(msg);
			};
			ws.onopen = function() {
				$("#status").html("connected");
				$log.debug("connected");
			};
			ws.onclose = function() {
				$("#status").html("not connected");
			};
			ws.onerror = function(event) {
				$log.debug(event.data);
			};
			
			$window.onbeforeunload = function() {
				ws.close();
			};
		};
		
		return {
			load: function(request){
				return sendMessage(request);
			},
			init: function(){
				init();
			}
		};
	}])
	.controller('DataController', ['senseService', '$window', '$scope', '$log', '$q', 
	function(senseService, $window, $scope, $log, $q, $rootScope){
		var self = this;
		$scope.autorefresh = false;
		self.intid = null;
		
		$log.debug($scope);
		$scope.data = {};
		
		// [fix] jquery mobile flipswitch event not fired by angularjs
		$('[name=autorefresh]').change(function(){
			$scope.autorefresh = $(this).is(':checked');
		});
		
		$scope.checkAutoRefresh = function(){
			if( $scope.autorefresh ) {
				self.intid = window.setInterval(function() {
					$scope.reloadData();
				}, 5000);
			} else {
				window.clearInterval(self.intid);
			}
		};
		
		$scope.reloadData = function(){
			senseService.load().then(function(data){
				$log.debug(data);
				$scope.data = data;
			});
		};
		
		// ng-change should be the way to go, 
		// but because jquery mobile flipswitch change event 
		// is not fired when the user click the switch, $watch is used.
		$scope.$watch('autorefresh', $scope.checkAutoRefresh);

	}])
	.run(['senseService', function (senseService){
		senseService.init();
	}]);

})(jQuery); 