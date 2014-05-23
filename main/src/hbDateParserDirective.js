(function() {


    /**
     * NOTE: CURRENTLY NOT EFFECTIVE AND UNUSED.
     * 
     * Solves known pitfall to support manual date entry (considered as string)
     * together with ui.bootstrap datepicker-popup.
     * 
     * Usage: 
     * 
     * <input hb-date-parser datepicker-popup ng-model="date" />
     * 
     */
    angular.module('hb5').directive('hbDateParser', function () {

    	return {
		    require: ['^hbDate','ngModel'],
			restrict: 'A',
			priority: 1000,
			link: function ($scope, $element, $attrs, ctrls) {
				var hbDateCtrl = ctrls[0];
				var ngModelCtrl = ctrls[1];
				
				console.log("    >>>> hbDateParser link function !!! <<<<");
				
				console.log("$scope.dateFormat = " + $scope.dateFormat);
				
				ngModelCtrl.$parsers.unshift(function (data) {
					console.log("    >>>> ngModelCtrl.$parsers.unshift, data = " + data);
					
					// If we already have a `date` return it
					// Note: date instanceof Date will return false with different 
					// JavaScript contexts (e.g. different documents in a web browser)) 
					if (data) {
						if (Object.prototype.toString.call(data) === '[object Date]') {
							return data;
						} else { // Convert data from view format to model format
						    var dateParts = data.split('.');
						    // Javascript monthes are zero based!
						    var convertedDate = Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0]);
						    console.log("data          : " + data);
						    console.log("convertedDate : " + convertedDate );
						    return new Date(Date.parse(convertedDate)); // converted						
						}
					}
					else {
						console.log("    >>>> ngModelCtrl.$parsers.unshift, NO DATA !");
					}
			    });
			
			}
		};
	
    });


})();