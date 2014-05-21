(function() {

	/**
	 * Small service used to exchange alert messages data between miscellaneous controllers.
	 * For instance when deleting a card the success message must be displayed on the
	 * redirect to page within redirect page controller scope.
	 * 
	 * Could not find the exhaustive list of alert types but they seem to fit with 
	 * Bootstrap following styles: {primary, info, success, warning, danger, inverse}
	 */
	angular.module('hb5').service('hbAlertMessages', function () {
		
		var alerts = [ ];
		
        return {
            getAlerts:function () {
                return alerts;
            },
            addAlert:function (typeValue,messageValue) {
            	alerts.push({type: typeValue, message: messageValue});
            },
            removeAlert:function(index) {
                alerts.splice(index, 1);
            }
        };
    });	

})();