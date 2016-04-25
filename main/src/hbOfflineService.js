(function() {

	/**
	 * hbServerNotification module - hbOffline service
	 * 
	 * Service that leverage EventSource server side notification to provide a
	 * simple way to deal with offline mode
	 */

	angular
			.module('hbServerNotification', [])
			.service('hbOffline',['$log', function($log) {

				var statusEventSource = undefined;
				var isSseSupported = false;

				var createStatusEvenSource = function() {
					if (typeof (EventSource) !== "undefined") {
						// SSE supported
						statusEventSource = new EventSource('/api/melfin/online/status');
						isSseSupported = true;
						$log.debug("hbOffline: Initialising with SSE support.");
					} else {
						// SSE not supported
						$log.debug("hbOffline: Initialising NO SSE support.");
					}
				};
				
				var getStatusEventSource = function() {
					return statusEventSource;
				};

				var getIsSseSupported = function() {
					return isSseSupported;
				};

				// Initialise service resource
				createStatusEvenSource();
				
				return {
					forceStatusEvenSourceReload : createStatusEvenSource, 
					getStatusEventSource : getStatusEventSource,
					getIsSseSupported : getIsSseSupported
				};
			} ]);

})();