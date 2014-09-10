(function() {

	    angular
			.module('hb5')
			.controller(
					'HbAnnexesComponentController',
					[
							'$attrs',
							'$scope',
							'$log',
							'hbUtil',
							function($attrs, $scope, $log, hbUtil) {
    
									$log.debug("    >>>> Using HbAnnexesComponentController");
							        
									$scope.annexes = [];
									// By default validate
									$scope.hbAnnexesUploadNoValidation = false;
									// Special case might disable validation 
									if ($attrs.hbAnnexesUploadNoValidation === 'true') {
										$scope.hbAnnexesUploadNoValidation = $attrs.hbAnnexesUploadNoValidation;
									}
									
									$scope.hbUtil = hbUtil;
									        
							    } ]);

})();
