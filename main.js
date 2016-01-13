(function($) {
	"use strict";
	
	var loc = window.location;
	var wsUriC = "";
	if (loc.protocol === "https:") {
		wsUriC = "wss:";
	} else {
		wsUriC = "ws:";
	}
	wsUriC += "//" + loc.host + "/ws/sensedata";
	
	angular.module('sense', [])
	.controller('DataController', ['$window', '$scope', '$log', function($window, $scope, $log){
		var self = this;
		
		$scope.data = {
			autorefresh: false
		};
		
		self.data = $scope.data;
		self.intid = null;
		
		var ws;
		
		$scope.sendMessage = function() {
			$log.debug('sending message...');
			ws.send("");
		};
		
		$scope.wsConnectC = function() {
			$log.debug("connect", wsUriC);
			ws = new WebSocket(wsUriC);
			ws.onmessage = function(msg) {
				var data = JSON.parse(msg.data);
				console.log(data);
				
				self.data = data;
			};
			ws.onopen = function() {
				$("#status").html("connected");
				$log.debug("connected");
			};
			ws.onclose = function() {
				$("#status").html("not connected");
				setTimeout($scope.checkAutoRefresh, 1000);
			};
			ws.onerror = function(event) {
				console.log(event.data);
			};
			
			$window.onbeforeunload = function() {
				ws.close();
			};
		};
		//$scope.wsConnectC();
		
		$scope.checkAutoRefresh = function(){
			$log.debug('checking refresh...');
			if( $scope.autorefresh ) {
				self.intid = window.setInterval(function() {
					$scope.sendMessage();
				}, 5000);
			} else {
				window.clearInterval(self.intid);
			}
		};
		
		
		$log.debug($scope);
	}]);

})(jQuery); 