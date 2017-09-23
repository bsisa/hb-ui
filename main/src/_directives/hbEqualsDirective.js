(function() {

	/**
	 * Directive testing equality between field with the directive and a second
	 * field specified in hb-equal directive Ex: <input name="pwd2"
	 * type="password" ng-model="model.pwd2" hb-equals="{{model.pwd1}}" >
	 */
	angular.module('hb5').directive('hbEquals', function() {
		return {
			restrict : 'A',
			require : '?ngModel',
			link : function(scope, elem, attrs, ngModel) {
				
				// Cancel if ngModel not available
				if (!ngModel) {
					return;
				}

				// Define equals validation
				var validate = function() {
					
					var otherVal = attrs.hbEquals;
					var ownVal = ngModel.$viewValue;
					// set validity
					if (otherVal && ownVal) {
						ngModel.$setValidity('hbEquals', (otherVal === ownVal) );
					}
				};				
				
				// Watch own value and trigger revalidation 
				scope.$watch(attrs.ngModel, function() {
					validate();
				});

				// Observe other value and trigger revalidation 
				attrs.$observe('hbEquals', function(val) {
					validate();
				});

			}
		}
	});

})();