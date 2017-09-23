(function() {

	/**
	 * Directive which binds a function to keydown keypress event.
	 * 
	 * Reference: http://eric.sau.pe/angularjs-detect-enter-key-ngenter/
	 */
	angular.module('hb5').directive('hbEnter', function() {

		return function(scope, element, attrs) {
			element.bind("keydown keypress", function(event) {
				if (event.which === 13) {
					scope.$apply(function() {
						scope.$eval(attrs.hbEnter);
					});
					event.preventDefault();
				}
			});
		};

	});

})();