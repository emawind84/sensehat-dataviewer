(function($) {
	"use strict";
	
	var loc = window.location;
	var wsUriC = "";
	if (loc.protocol === "https:") {
		wsUriC = "wss:";
	} else {
		wsUriC = "ws:";
	}
	var wsHost = "raspi.emawind.com";
	wsUriC += "//" + wsHost + "/ws/sensedata";
	
	angular.module('sense', [])
	.factory('senseService', ['$log', '$window', '$q', '$rootScope', '$timeout', 
	function($log, $window, $q, $rootScope, $timeout){
		var ws;
		var reqs = {};
		
		var listener = function(msg){
			$log.debug(msg);
			$log.debug(reqs);

			msg = JSON.parse(msg);
			$log.debug(msg);
			
			var data = msg.data;
			
			if( reqs.hasOwnProperty(msg.callbackid) ) {
				$rootScope.$apply(reqs[msg.callbackid].defer.resolve(data));
				delete reqs[msg.callbackid];
			}
		};
		
		var sendMessage = function(request) {
			request = request || {};
			$log.debug('sending message...');
			var defer = $q.defer();
			var callbackid = new Date().getTime();
			reqs[callbackid] = {
				time: new Date(),
				defer: defer
			};
			
			request.callbackid = callbackid;
			ws.send(JSON.stringify(request));
			return defer.promise;
		};
		
		var init = function(){
			$log.debug("connect", wsUriC);
			ws = new WebSocket(wsUriC);
			
			ws.onmessage = function(msg) {
				listener(msg.data);
			};
			ws.onopen = function() {
				$("#status").html("connected");
				$log.debug("connected");
			};
			ws.onclose = function() {
				$("#status").html("not connected");
				$timeout(init, 1000);
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
		$scope.autorefresh = {
			check: false,
			interval: 5
		};
		self.intid = null;
		
		$log.debug($scope);
		$scope.data = {};
		
		// [fix] jquery mobile flipswitch event not fired by angularjs
		$('[name=autorefresh]').change(function(){
			// this code is executed outside from angularjs scope so we use scope.$apply to update data binding.
			$scope.$apply($scope.autorefresh.check = $(this).is(':checked'));
		});
		
		$scope.checkAutoRefresh = function(){
			if( $scope.autorefresh.check ) {
				self.intid = window.setInterval(function() {
					$scope.reloadData();
				}, $scope.autorefresh.interval * 1000);
			} else {
				window.clearInterval(self.intid);
			}
		};
		
		$scope.reloadData = function(){
			senseService.load().then(function(data){
				$scope.data = data;
			});
		};
		
		// ng-change should be the way to go, 
		// but because jquery mobile flipswitch change event 
		// is not fired when the user click the switch, $watch is used.
		$scope.$watch('autorefresh.check', $scope.checkAutoRefresh);

	}])
	.run(['senseService', function (senseService){
		senseService.init();
	}]);

})(jQuery); 