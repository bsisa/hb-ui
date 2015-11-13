(function() {

	/**
     * Directive hbSingleSelect emulate HTML select using Bootstrap dropdown 
     * for increase styling and behaviour control.
     * TODO: investigate enhancements: http://silviomoreto.github.io/bootstrap-select/
     */
    angular.module('hb5').directive('hbSingleSelect', function () {

		return {
			require: ['hbSingleSelect', 'ngModel'],
		    restrict: 'A',
		    priority: 1,
			templateUrl : "/assets/views/hbSingleSelect.html",
			controller: 'HbSingleSelectController',
			scope : {
				'options' : '=hbSingleSelectOptions' ,
				'emptyOption' : '=?hbSingleSelectEmptyOption'
			},
			link: function ($scope, $element, $attrs, ctrls) {
				var hbSingleSelectController = ctrls[0];
				var ngModelController = ctrls[1];
				// Pass hb-single-select ng-model sibling definition controller reference to hb-single-select controller. 
				hbSingleSelectController.setNgModelCtrl(ngModelController);
			}			
		};
		
    });    
    
   
})();