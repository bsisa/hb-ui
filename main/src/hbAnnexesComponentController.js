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
    
									//$log.debug("    >>>> Using HbAnnexesComponentController");
							        
						        	// Set a default to 0 before computation.
						        	$scope.annexesNoPhotoNb = 0;
						        	
									$scope.annexes = [];
									// By default validate. Special case where successful validation
									// requires upload to be performed need to prevent this default
									// to set free from a dead lock situation.
									$scope.isRequired = ($attrs.hbAnnexesUploadNoValidation === 'true');
									
									// Parameter used to make at least one annex mandatory.
						        	$scope.minBound = $scope.isRequired ? 1 : 0;									
									
						        	// Pass $attrs.hbAnnexesUploadNoValidation value to scope to pass it to hb-annexes-upload in turn...
									if ($attrs.hbAnnexesUploadNoValidation === 'true') {
										$scope.hbAnnexesUploadNoValidation = $attrs.hbAnnexesUploadNoValidation;
									}
									
									$scope.hbUtil = hbUtil;
									
							    	$scope.$watchCollection('elfin.ANNEXE.RENVOI', function(newRenvois, oldRenvois) {
							    		//$log.debug(">>>> elfin.ANNEXE.RENVOI: newRenvois = " + newRenvois + ", oldRenvois = " + oldRenvois);
										// We want at least one annex mandatory, except photo, although it should not apply to CONSTAT.
							    		$scope.annexesWithoutPhoto = hbUtil.getAnnexesExcludingTag($scope.elfin, 'photo');
							    		// Preserve default 0 value if no annexesWithoutPhoto exists.
							    		if ($scope.annexesWithoutPhoto && $scope.annexesWithoutPhoto.length > 0) {
											// Property bound to elfinForm to make at least one annex mandatory.
							    			$scope.annexesNoPhotoNb = $scope.annexesWithoutPhoto.length;
							    		}
							        });									
									        
							    } ]);

})();
