(function () {
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
	
	var ws;
	function wsConnectC() {
		ws = new WebSocket(wsUriC);
		ws.onmessage = function (msg) {
			var data = JSON.parse(msg.data);
			console.log(data);

			$('[name=sense-tempp]').val(data.temp_p);
			$('[name=sense-temph]').val(data.temp_h);

			$('[name=sense-humidity]').val(data.humidity);
			$('[name=sense-pressure]').val(data.pressure);

			$('[name=sense-roll]').val(data.roll);
			$('[name=sense-pitch]').val(data.pitch);
			$('[name=sense-yaw]').val(data.yaw);

			$('[name=sense-magx]').val(data.mag_x);
			$('[name=sense-magy]').val(data.mag_y);
			$('[name=sense-magz]').val(data.mag_z);

			$('[name=sense-accx]').val(data.acc_x);
			$('[name=sense-accy]').val(data.acc_y);
			$('[name=sense-accz]').val(data.acc_z);

			$('[name=sense-gyrox]').val(data.gyro_x);
			$('[name=sense-gyroy]').val(data.gyro_y);
			$('[name=sense-gyroz]').val(data.gyro_z);

		};
		ws.onopen = function () {
			$("#status").html("connected");
		};
		ws.onclose = function () {
			$("#status").html("not connected");
			setTimeout(wsConnectC, 1000);
		};
		ws.onerror = function (event) {
			console.log(event);
		};
	}


	function sendMessage() {
		// send message back to page in simple JSON format
		// example {“part1”:”Hello”,”part2”:”50”}
		
		ws.send("");
	} // end sendMessage
	
	window.onbeforeunload = function () {
		ws.close();
	};

	$(function () {
		
		// connect to websocket
		wsConnectC();

		$('[name=btn_update]').click(function () {
			sendMessage();
		});

		var refresh;
		$('[name=auto-refresh]').on('change', function () {
			if ($(this).is(':checked')) {
				refresh = window.setInterval(function () {
					sendMessage();
				}, 5000);
			} else {
				window.clearInterval(refresh);
			}
		}).change();

	});

})(jQuery);