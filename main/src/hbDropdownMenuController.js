(function() {

	angular.module('hb5').controller(
			'HbDropdownMenuController',
			[
					'$scope',
					'$log',
					'userDetails',
					function($scope, $log, userDetails) {

						//$log.debug("    >>>> Using HbDropdownMenuController ");

				        // If property is defined check its string value exists in user roles
				        $scope.isActionAuthorised  = function ( menuAction ) {
				        	if ( angular.isDefined(menuAction) && angular.isDefined(menuAction.actionRights)) {
				        		return _.contains(userDetails.getRoles(),menuAction.actionRights);
				        	} else {
				        		return true;
				        	}
				        };						
						
					} ]);
	

})();