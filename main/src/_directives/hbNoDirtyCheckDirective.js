/**
 * Basic directive preventing ngModel registered controllers to impact on form
 * dirty state.
 * 
 * Typical usage is for select, buttons, and other controls whose model is
 * strictly related to the view and not changing the business data model. For
 * instance a button group (radio, checkbox) impacting on the visual layout
 * depending on its state.
 * 
 * @author Patrick Refondini
 */
(function() {

	angular.module('hb5').directive('hbNoDirtyCheck', function() {
		return {
			restrict : 'A',
			require : 'ngModel',
			link : function(scope, elment, attributes, controller) {
				controller.$pristine = false;
			}
		};
	});

})();
