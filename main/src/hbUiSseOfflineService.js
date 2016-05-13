(function() {

	/**
	 * hbUi.sse module - hbOffline service 
	 *  
	 * Service that leverage EventSource server side notification to provide a
	 * simple way to deal with offline mode
	 */
	angular
			.module('hbUi.sse')
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
						$log.debug("hbOffline: Cannot initialise, no SSE support.");
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

				var createEvenSourceForGroup = function(group) {
					if (typeof (EventSource) !== "undefined") {
						// SSE supported
						groupEventSource = new EventSource('/api/melfin/online/'+group);
						$log.debug("hbOffline: Initialising event source for group: " + group);
						return groupEventSource;
					} else {
						// SSE not supported
						$log.debug("hbOffline: Cannot initialise event source for group: " + group + " no SSE support.");
						return undefined;
					}
				};				
				
				
				
				return {
					forceStatusEvenSourceReload : createStatusEvenSource, 
					getStatusEventSource : getStatusEventSource,
					getIsSseSupported : getIsSseSupported,
					createEvenSourceForGroup : createEvenSourceForGroup
				};
			} ]);

})();