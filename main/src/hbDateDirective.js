(function() {


    /**
     * hb-date directive manages text based GeoXml dates providing 
     * an input field with a datepicker-pop. 
     * <hb-date model="elfin.DATE.VALUE" />
     */
    angular.module('hb5').directive('hbDate', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
			templateUrl : "/assets/views/hbDate.html",
			controller: 'HbDateController',
			replace : true,
			scope : {
				'hbDateModel' : '='  
			}
		};
	
    });


})();