(function() {

	    angular
			.module('hb5')
			.controller(
					'HbAnnexesComponentController',
					[
							'$scope',
							'$log',
							function($scope, $log) {
    
									$log.debug("    >>>> Using HbAnnexesComponentController");
							        
									$scope.annexes = null;
									        
							    } ]);

})();
