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
			link: function ($scope, $element, $attrs, ctrls) {
				var hbDateCtrl = ctrls[0];
				var ngModelCtrl = ctrls[1];
				
				console.log("    >>>> hbDate link function !!! <<<<");
				
//				console.log("    >>>> ngModelCtrl.$modelValue = " + ngModelCtrl.$modelValue);
//				console.log("    >>>> ngModelCtrl.$viewValue = " + ngModelCtrl.$viewValue);

				console.log("    >>>> About to link ngModelCtrl to hbDateCtrl...");
				// Pass hb-date ng-model sibling definition controller reference to hb-date controller. 
				hbDateCtrl.$setHbDateCtrl(ngModelCtrl);
				
				
				
				//$scope.dateModel = ngModel;
			}
		};
	
    });

//		    require: '^hbCardContainer',
//	replace : true,
//	scope : {
//		'hbDateModel' : '='      
//	}    
    
    /*
,
			link: function ($scope, $element, $attrs, ngModel) {
				$scope.dateModel = ngModel;
			}
     */

})();