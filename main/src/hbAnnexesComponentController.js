(function() {

	    angular
			.module('hb5')
			.controller(
					'HbAnnexesComponentController',
					[
							'$attrs',
							'$scope',
							'$log',
							'$modal',
							'hbUtil',
							'hbAlertMessages', 
							function($attrs, $scope, $log, $modal, hbUtil, hbAlertMessages) {
    
									$log.debug("    >>>> Using HbAnnexesComponentController");
							        
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
							    	
							    	/**
							    	 * Returns a new trimmed string with leading and trailing commas removed. 
							    	 */
							    	var cleanUpCommas = function(stringToCleanUp) {
							    		// Trim
							    		var cleanedUpString = stringToCleanUp.trim()
							    		// Check for leading ','
							    		var STR_TO_CLEAN = ",";
							    		// Found leading clean up to perform
							    		if (cleanedUpString.indexOf(STR_TO_CLEAN) === 0) {
							    			cleanedUpString = cleanedUpString.substring( 0 + STR_TO_CLEAN.length)
							    		}
							    		if ( cleanedUpString.endsWith(STR_TO_CLEAN) ) {
							    			cleanedUpString = cleanedUpString.substring(0, cleanedUpString.length - STR_TO_CLEAN.length)
							    		}
							    		return cleanedUpString;
							    	};

							    	var MERGE_ACTION_TAG_PART = "action::merge";
							    	var MERGE_BEFORE_TAG = "action::merge::before";
						    		var MERGE_AFTER_TAG = "action::merge::after";
							    	
							    	/**
							    	 * Set or unset renvoi for report merge. 
							    	 */
							    	$scope.merge = function(renvoi) {
							    		$log.debug("merge called for renvoi: " + angular.toJson(renvoi));
							    		

							    		var mergeBeforeTagIdx = renvoi.VALUE.indexOf(MERGE_BEFORE_TAG) 
							    		if( mergeBeforeTagIdx != -1 ) {
							    			renvoi.VALUE = renvoi.VALUE.replace(MERGE_BEFORE_TAG, '');
							    		} else {
							    			renvoi.VALUE = renvoi.VALUE + "," + MERGE_BEFORE_TAG;
							    		}
							    		
							    		renvoi.VALUE = cleanUpCommas(renvoi.VALUE);
							    		// Auto-save
							    		$scope.saveElfin($scope.elfin);
							    		
							    		$log.debug("merge tag value: " + angular.toJson(renvoi.VALUE));
							    		
							    	};
							    	
							    	$scope.isMerged = function(renvoi) {
							    		return (renvoi.VALUE.indexOf(MERGE_ACTION_TAG_PART) != -1);
							    	};
							    	
							    	/**
							    	 * Delete the corresponding RENVOI node from ELFIN.
							    	 * Note: delete is a reserved Javascript keyword. Do not name function `delete`
							    	 */
							    	$scope.deleteRenvoi = function(renvoi) {
							    		$log.debug("Perform RENVOI deletion.");
							    		
							        	var modalInstance = $modal.open({
							                templateUrl: '/assets/views/deleteAnnexeConfirmModalPanel.html',
							                controller: 'DeleteConfirmController',
							                scope: $scope,
							                backdrop: 'static'
							            });

							            modalInstance.result.then(function () {
							            	// Update elfin model
							            	hbUtil.removeAnnexeRenvoiByPos($scope.elfin, renvoi.POS);
								            // Automatically save elfin to server (we already ask for user confirmation). 
							            	$scope.saveElfin($scope.elfin);
							            }, function () {
							            	// Do not annoy end-user with more messages.
							            	//var message = "Suppression de l'annexe " + hbUtil.getLinkFileName(renvoi.LIEN) + " annulée.";
							   				//hbAlertMessages.addAlert("warning",message);
							            });        								    		

							    	};
							    	
									        
							    } ]);

})();
