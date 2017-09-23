(function() {


    /**
     * hb-date directive manages text based GeoXml dates providing 
     * an input field with a datepicker-pop. 
     * <hb-date model="elfin.DATE.VALUE" />
     */
    angular.module('hb5').directive('hbDate', function () {

    	return {
		    require: ['hbDate', 'ngModel'],
			restrict: 'A',
			priority: 1,
			templateUrl : "/assets/views/hbDate.html",
			controller: 'HbDateController',
			scope: {
				dateCss : '@?hbDateCss'
			},
			link: function ($scope, $element, $attrs, ctrls) {
				var hbDateController = ctrls[0];
				var ngModelController = ctrls[1];
				// Pass hb-date ng-model sibling definition controller reference to hb-date controller. 
				hbDateController.setHbDateNgModelCtrl(ngModelController);
			}
		};
	
    });

})();